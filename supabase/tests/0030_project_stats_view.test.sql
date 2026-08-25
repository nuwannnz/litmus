-- S-2.11 / GitHub issue #18 — project_stats computes correctly and keeps
-- tombstones out.
--
-- Proves the view (migration 20260824102000): it is declared security_invoker,
-- derives task_count / done_count / progress / due_this_week at read time
-- exactly as FR-23/FR-28 define them, excludes soft-deleted tasks from every
-- count, and yields no row at all for a soft-deleted project. The RLS side —
-- that the querying user only sees their own rows through it — is 0040.

begin;
set local search_path = public, extensions;
select plan(13);

insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-0000000000a1', 'alice@example.test');

-- PA: four tasks chosen to pin every stat column at once.
insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-0000000000a1',
   'a1000000-0000-4000-8000-0000000000a1',
   'busy project');

-- PE: no tasks at all — progress must be 0, not NULL.
insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-0000000000e1',
   'a1000000-0000-4000-8000-0000000000a1',
   'empty project');

-- PD: gets a live task, then a tombstone of its own later in this file.
insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-0000000000d1',
   'a1000000-0000-4000-8000-0000000000a1',
   'doomed project');

-- Week window exactly as the view draws it: Mon–Sun containing today.
insert into public.tasks (id, user_id, title, project_id, status, due_date) values
  ('c3000000-0000-4000-8000-0000000000a1',
   'a1000000-0000-4000-8000-0000000000a1',
   'monday task',      'b2000000-0000-4000-8000-0000000000a1',
   'todo',
   current_date - ((extract(isodow from current_date))::int - 1)),
  ('c3000000-0000-4000-8000-0000000000a2',
   'a1000000-0000-4000-8000-0000000000a1',
   'today done task',  'b2000000-0000-4000-8000-0000000000a1',
   'done',
   current_date),
  ('c3000000-0000-4000-8000-0000000000a3',
   'a1000000-0000-4000-8000-0000000000a1',
   'sunday task',      'b2000000-0000-4000-8000-0000000000a1',
   'progress',
   current_date - ((extract(isodow from current_date))::int - 1) + 6),
  ('c3000000-0000-4000-8000-0000000000a4',
   'a1000000-0000-4000-8000-0000000000a1',
   'next week task',   'b2000000-0000-4000-8000-0000000000a1',
   'done',
   current_date - ((extract(isodow from current_date))::int - 1) + 7);

insert into public.tasks (id, user_id, title, project_id, due_date) values
  ('c3000000-0000-4000-8000-0000000000d1',
   'a1000000-0000-4000-8000-0000000000a1',
   'doomed project task', 'b2000000-0000-4000-8000-0000000000d1',
   current_date);

-- ── one: shape and invoker rights ──────────────────────────────────────────
select has_view('project_stats');

select ok(
  (select 'security_invoker=true' = any (reloptions)
   from pg_class
   where oid = 'public.project_stats'::regclass),
  'project_stats declares security_invoker=true so RLS applies inside it'
);

-- ── two: the busy project pins all four stats ───────────────────────────────
select is(
  (select task_count from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  4::bigint,
  'task_count counts every non-deleted task'
);

select is(
  (select done_count from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  2::bigint,
  'done_count counts only status = ''done'' tasks'
);

select is(
  (select progress from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  0.5::numeric,
  'progress is done ÷ total (FR-28)'
);

select is(
  (select due_this_week from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  3::bigint,
  'due_this_week spans the current Mon–Sun window only (FR-23)'
);

-- ── three: the empty project reads as zeros, never NULL ─────────────────────
select is(
  (select task_count from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000e1'),
  0::bigint,
  'an empty project has task_count 0'
);

select is(
  (select done_count from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000e1'),
  0::bigint,
  'an empty project has done_count 0'
);

select is(
  (select progress from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000e1'),
  0::numeric,
  'an empty project has progress 0, not NULL'
);

select is(
  (select due_this_week from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000e1'),
  0::bigint,
  'an empty project has due_this_week 0'
);

-- ── four: soft-deleted tasks stay out of every count ────────────────────────
update public.tasks
set deleted_at = now()
where id = 'c3000000-0000-4000-8000-0000000000a1';

select is(
  (select task_count from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  3::bigint,
  'a soft-deleted task leaves task_count'
);

select is(
  (select due_this_week from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000a1'),
  2::bigint,
  'a soft-deleted task leaves due_this_week'
);

-- ── five: a soft-deleted project yields no stats row at all ─────────────────
update public.projects
set deleted_at = now()
where id = 'b2000000-0000-4000-8000-0000000000d1';

select is(
  (select count(*) from public.project_stats where project_id = 'b2000000-0000-4000-8000-0000000000d1'),
  0::bigint,
  'a soft-deleted project yields no project_stats row'
);

select * from finish();
rollback;
