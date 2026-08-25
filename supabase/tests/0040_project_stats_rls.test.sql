-- S-2.11 / GitHub issue #18 — project_stats respects the querying user's RLS.
--
-- Because the view is security_invoker, the projects/tasks policies apply
-- inside it: each signed-in caller sees exactly their own stats rows, and
-- anon — granted nothing on the view — is stopped before RLS is ever
-- consulted. This tests the *view's* invoker behaviour; per-table RLS
-- isolation itself belongs to S-2.10 and is deliberately not duplicated here.

begin;
set local search_path = public, extensions;
select plan(4);

insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-0000000000a1', 'alice@example.test'),
  ('a1000000-0000-4000-8000-0000000000b2', 'bob@example.test');

insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-0000000000a1',
   'a1000000-0000-4000-8000-0000000000a1',
   'alice project'),
  ('b2000000-0000-4000-8000-0000000000b1',
   'a1000000-0000-4000-8000-0000000000b2',
   'bob project');

insert into public.tasks (id, user_id, title, project_id, status, due_date) values
  ('c3000000-0000-4000-8000-0000000000a1',
   'a1000000-0000-4000-8000-0000000000a1',
   'alice done task',   'b2000000-0000-4000-8000-0000000000a1',
   'done',   current_date),
  ('c3000000-0000-4000-8000-0000000000a2',
   'a1000000-0000-4000-8000-0000000000a1',
   'alice open task',   'b2000000-0000-4000-8000-0000000000a1',
   'todo',   current_date),
  ('c3000000-0000-4000-8000-0000000000b1',
   'a1000000-0000-4000-8000-0000000000b2',
   'bob task',          'b2000000-0000-4000-8000-0000000000b1',
   'todo',   current_date);

set local role authenticated;

-- ── alice ───────────────────────────────────────────────────────────────────
set local request.jwt.claims =
  '{"sub":"a1000000-0000-4000-8000-0000000000a1","role":"authenticated"}';

select set_eq(
  $q$ select project_id from public.project_stats $q$,
  $q$ select 'b2000000-0000-4000-8000-0000000000a1'::uuid $q$,
  'alice sees exactly her own project_stats row'
);

select is(
  (select progress from public.project_stats
   where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  0.5::numeric,
  'stats compute correctly through RLS for the calling user'
);

-- ── bob ─────────────────────────────────────────────────────────────────────
set local request.jwt.claims =
  '{"sub":"a1000000-0000-4000-8000-0000000000b2","role":"authenticated"}';

select set_eq(
  $q$ select project_id from public.project_stats $q$,
  $q$ select 'b2000000-0000-4000-8000-0000000000b1'::uuid $q$,
  'bob sees exactly his own project_stats row'
);

-- ── anon: no grant at all ───────────────────────────────────────────────────
set local role anon;

select throws_ok(
  'select * from public.project_stats',
  '42501',
  NULL,
  'anon cannot read project_stats — denied by the grant, not just RLS'
);

select * from finish();
rollback;
