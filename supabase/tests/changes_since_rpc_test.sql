-- pgTAP tests for changes_since(cursor timestamptz) — S-2.7 / issue #14.
--
-- Run with supabase/tests/run_tests.sh (after `supabase db reset`). The
-- database is disposable — `db reset` replays migrations from scratch — so
-- this file commits its fixtures rather than rolling back, and phases are
-- separate transactions: the updated_at trigger stamps rows with the
-- *transaction* start time, so cursor-vs-row ordering only becomes meaningful
-- across transactions. A 10 ms sleep between phases keeps clock_timestamp()
-- cursors strictly ordered.
--
-- Phases:
--   A. schema checks (function exists, invoker, grants, indexes)
--   B. fixtures for two users, committed as superuser
--   C. cursor c1 captured; then user 1 updates a task and soft-deletes a
--      project of their own; cursor c2 captured afterwards
--   D. assertions: RLS isolation (user 2), feed contents and tombstone shape
--      for user 1, empty result past every change, anon denial

create extension if not exists pgtap with schema extensions;

-- Fixed ids so failure messages name the row that went missing.
--   user 1  11111111-1111-4111-8111-111111111111
--   user 2  22222222-2222-4222-8222-222222222222
--   proj A  aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa  (user 1)
--   proj B  bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb  (user 2)
--   task C  cccccccc-cccc-4ccc-8ccc-cccccccccccc  (user 1)
--   task D  dddddddd-dddd-4ddd-8ddd-dddddddddddd  (user 2)

-- ---------------------------------------------------------------------------
-- Phase A: schema
-- ---------------------------------------------------------------------------
begin;

select plan(16);

select has_function(
  'public', 'changes_since', array['timestamptz'],
  'changes_since(cursor timestamptz) exists'
);

select ok(
  not exists (
    select 1 from pg_proc
    where proname = 'changes_since' and prosecdef
  ),
  'changes_since is SECURITY INVOKER, so RLS applies inside it'
);

select is(
  has_function_privilege('authenticated', 'public.changes_since(timestamptz)', 'execute'),
  true,
  'authenticated may execute changes_since'
);

select is(
  has_function_privilege('anon', 'public.changes_since(timestamptz)', 'execute'),
  false,
  'anon may not execute changes_since'
);

select has_index('public', 'tasks', 'tasks_user_id_updated_at_idx',
  'tasks has the (user_id, updated_at) feed index');

select has_index('public', 'projects', 'projects_user_id_updated_at_idx',
  'projects has the (user_id, updated_at) feed index');

commit;

-- ---------------------------------------------------------------------------
-- Phase B: fixtures
-- ---------------------------------------------------------------------------
begin;

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'alice@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'bob@example.test');

-- handle_new_user() mirrors each auth row into public.users via the signup
-- trigger; if that ever stops holding, everything downstream is meaningless.
-- Compared as a ratio, not a constant: seed.sql legitimately ships its own
-- user, so a hard count would couple this test to the seed's contents.
select ok(
  (select count(*) from public.users) = (select count(*) from auth.users),
  'signup trigger created one profile per auth user'
);

insert into public.projects (id, user_id, name) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Alpha'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Beta');

insert into public.tasks (id, user_id, title, due_date) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'Task C', current_date),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '22222222-2222-4222-8222-222222222222', 'Task D', current_date);

commit;
select pg_sleep(0.01);

-- Cursor taken before any client-visible change happens.
begin;
select clock_timestamp()::text as c1 \gset
commit;
select pg_sleep(0.01);

-- ---------------------------------------------------------------------------
-- Phase C: user 1 mutates their own data — an update and a soft delete
-- ---------------------------------------------------------------------------
begin;
select set_config('role', 'authenticated', true);
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

update public.tasks set title = 'Task C, revised'
where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

-- Application deletes are soft deletes (architecture §3.4): the row stays,
-- carrying its tombstone timestamp into the feed.
update public.projects set deleted_at = now()
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select clock_timestamp()::text as c2 \gset
commit;
select pg_sleep(0.01);

-- ---------------------------------------------------------------------------
-- Phase D: the feed itself
-- ---------------------------------------------------------------------------

-- RLS isolation first: user 2 asks since the beginning of time and must see
-- exactly their own project and task — nothing of user 1's.
begin;
select set_config('role', 'authenticated', true);
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

select is(
  (select count(*) from public.changes_since('-infinity')),
  2::bigint,
  'user 2 sees only their own two rows over the whole history'
);

select set_eq(
  $$ select id from public.changes_since('-infinity') $$,
  $$ values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid),
            ('dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid) $$,
  'user 2''s feed contains no foreign rows'
);

commit;

-- User 1's feed since c1: the revised task and the tombstoned project, both
-- changed after the cursor — and nothing else.
begin;
select set_config('role', 'authenticated', true);
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select set_eq(
  format(
    'select kind, id from public.changes_since(%L)',
    :'c1'
  ),
  $$ values ('task'::text,    'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid),
            ('project'::text, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid) $$,
  'feed since c1 is exactly the updated task plus the deleted project'
);

-- The acceptance criterion in one assertion: the deletion comes back as a
-- tombstone — present, with deleted_at stamped — never as an absence.
select is(
  (select deleted_at from public.changes_since(:'c1')
   where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  (select deleted_at from public.projects
   where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'the deleted project appears as a tombstone, deleted_at intact'
);

select isnt(
  (select data ->> 'deleted_at' from public.changes_since(:'c1')
   where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  null,
  'the tombstone payload carries deleted_at so the client can apply it'
);

select is(
  (select data ->> 'title' from public.changes_since(:'c1')
   where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  'Task C, revised',
  'the task payload carries the new title, ready to upsert'
);

select ok(
  not exists (
    select 1 from public.changes_since(:'c1')
    where data ? 'search_vector'
  ),
  'payloads strip the derived search_vector column'
);

-- Rows untouched since the cursor stay out: user 1's other objects (none) and
-- everything older than c1. Asking again from c2 — past every change — must
-- yield nothing at all.
select is(
  (select count(*) from public.changes_since(:'c2')),
  0::bigint,
  'a cursor past every change returns zero rows'
);

commit;

-- An unauthenticated caller is stopped by the grant before RLS is consulted.
begin;
select set_config('role', 'anon', true);
select throws_ok(
  'select public.changes_since(now())',
  '42501',
  NULL,
  'anon cannot execute changes_since'
);
-- finish() must see this transaction's result rows, so it runs before the
-- rollback that undoes the anon switch.
select set_config('role', 'postgres', true);
select * from finish();
rollback;
