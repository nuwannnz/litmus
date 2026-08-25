-- S-2.10: RLS isolation for public.tasks.
--
-- Same contract as projects: full CRUD scoped by user_id = auth.uid(). The
-- tasks_have_a_home CHECK (FR-39) requires a due_date or project_id, so every
-- fixture task carries one.

create extension if not exists pgtap with schema extensions;

begin;
select plan(8);
set search_path = public, extensions;

select is(
  (select relrowsecurity from pg_class where oid = 'public.tasks'::regclass),
  true,
  'tasks has RLS enabled');

delete from auth.users where email in ('s210-alice@example.test', 's210-bob@example.test');
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 's210-alice@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 's210-bob@example.test');

-- Alice's session -----------------------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

select lives_ok(
  'insert into public.tasks (id, user_id, title, due_date)'
  || ' values (''11111111-1111-4111-8111-111111111111'','
  || '''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'', ''Task A'', current_date)',
  'alice can INSERT her own task');

select is(
  (select count(*) from public.tasks),
  1::bigint,
  'alice can SELECT her own task');

-- Bob's session -------------------------------------------------------------
reset role;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
set local role authenticated;

select is(
  (select count(*) from public.tasks),
  0::bigint,
  'bob sees none of alice''s tasks');

-- Both run without error and match no rows: USING filters the row out first.
update public.tasks set title = 'Hijacked'
where id = '11111111-1111-4111-8111-111111111111';

delete from public.tasks
where id = '11111111-1111-4111-8111-111111111111';

select throws_ok(
  'insert into public.tasks (id, user_id, title, due_date)'
  || ' values (''22222222-2222-4222-8222-222222222222'','
  || '''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'', ''Claimed'', current_date)',
  '42501',
  'new row violates row-level security policy for table "tasks"',
  'bob cannot INSERT a task claiming alice''s user_id (WITH CHECK)');

-- Unaffected ground truth, read as superuser --------------------------------
reset role;

select is(
  (select title from public.tasks where id = '11111111-1111-4111-8111-111111111111'),
  'Task A',
  'neither bob''s UPDATE nor his DELETE touched alice''s task');

-- Alice again: full ownership ----------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

update public.tasks set status = 'done';

select is(
  (select status from public.tasks),
  'done',
  'alice can UPDATE her own task');

delete from public.tasks;

select is(
  (select count(*) from public.tasks),
  0::bigint,
  'alice can DELETE her own task');

rollback;
