-- S-2.11 — search_all(query) behaves as specified (migration 20260824103000).
--
-- Not an acceptance criterion of issue #18, but the RPC is named alongside the
-- constraint, triggers and view as source of truth, so it gets a behavioural
-- smoke test here: unified task/project hits, title (weight A) outranking
-- description (weight B), tombstones excluded, SECURITY INVOKER scoping every
-- hit to the calling user, and no access for anon.

begin;
set local search_path = public, extensions;
select plan(7);

insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-0000000000a1', 'alice@example.test'),
  ('a1000000-0000-4000-8000-0000000000b2', 'bob@example.test');

insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-0000000000f1',
   'a1000000-0000-4000-8000-0000000000a1',
   'Rose Garden');

insert into public.tasks (id, user_id, title, description, due_date) values
  ('c3000000-0000-4000-8000-0000000000c1',
   'a1000000-0000-4000-8000-0000000000a1',
   'Prune the roses', null,
   current_date),
  ('c3000000-0000-4000-8000-0000000000c2',
   'a1000000-0000-4000-8000-0000000000a1',
   'Weekly chores', 'water the roses and feed the cat',
   current_date),
  -- Tombstone: must never surface in a hit.
  ('c3000000-0000-4000-8000-0000000000c3',
   'a1000000-0000-4000-8000-0000000000a1',
   'roses delivery', null,
   current_date);

update public.tasks
set deleted_at = now()
where id = 'c3000000-0000-4000-8000-0000000000c3';

-- Bob owns a near-identical task: visible to him, never to alice.
insert into public.tasks (id, user_id, title, due_date) values
  ('c3000000-0000-4000-8000-0000000000b9',
   'a1000000-0000-4000-8000-0000000000b2',
   'Prune the roses too',
   current_date);

-- ── one: the function runs as its caller ────────────────────────────────────
select ok(
  (select not prosecdef
   from pg_proc
   where oid = 'public.search_all(text)'::regprocedure),
  'search_all is SECURITY INVOKER, so RLS scopes every hit'
);

set local role authenticated;

-- ── two: what matches, for alice ────────────────────────────────────────────
set local request.jwt.claims =
  '{"sub":"a1000000-0000-4000-8000-0000000000a1","role":"authenticated"}';

select set_eq(
  $q$
    select kind, title from public.search_all('roses')
  $q$,
  $q$
    values ('task'::text,    'Prune the roses'),
           ('task',          'Weekly chores'),
           ('project',       'Rose Garden')
  $q$,
  'search matches titles (A), descriptions (B) and project names; tombstones stay hidden'
);

-- ── three: ranking honours the weights ──────────────────────────────────────
select is(
  (select title from public.search_all('roses') limit 1),
  'Prune the roses',
  'a weight-A title hit outranks a weight-B description hit'
);

-- ── four: empty and whitespace queries return nothing, not everything ───────
select is(
  (select count(*) from public.search_all('')),
  0::bigint,
  'an empty query returns no rows'
);

select is(
  (select count(*) from public.search_all('   ')),
  0::bigint,
  'a whitespace-only query returns no rows'
);

-- ── five: bob's identical search sees only his own row ──────────────────────
set local request.jwt.claims =
  '{"sub":"a1000000-0000-4000-8000-0000000000b2","role":"authenticated"}';

select set_eq(
  $q$ select title from public.search_all('roses') $q$,
  $q$ select 'Prune the roses too'::text $q$,
  'the RPC only ever matches the calling user''s rows'
);

-- ── six: anon gets nothing at all ────────────────────────────────────────────
set local role anon;

select throws_ok(
  $q$ select * from public.search_all('roses') $q$,
  '42501',
  NULL,
  'anon cannot execute search_all — denied by the grant before RLS'
);

select * from finish();
rollback;
