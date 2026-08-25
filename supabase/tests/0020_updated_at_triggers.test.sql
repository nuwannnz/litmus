-- S-2.11 / GitHub issue #18 — updated_at moves on update.
--
-- Proves the cross-cutting rules (migration 20260824101000): a
-- set_updated_at BEFORE UPDATE trigger exists on every user-data table, and
-- it overwrites whatever value an UPDATE carries — a stale client cannot
-- dictate updated_at in either direction (future or past).
--
-- Why smuggle-based assertions instead of "the timestamp changed": now() is
-- frozen at transaction-start time, so inside one pgTAP transaction a
-- well-behaved update is indistinguishable from the insert default. The
-- trigger's contract per architecture §3.4 is precisely that client-supplied
-- values are discarded; comparing against clock_timestamp(), which does
-- advance, proves that deterministically.

begin;
set local search_path = public, extensions;
select plan(12);

-- Fixtures: profile, project, task, subtask. Categories are already seeded by
-- the core schema; users/categories get updates too even though no client can
-- write them today — the trigger must hold regardless.
insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-0000000000a1', 'alice@example.test');

insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-000000000001',
   'a1000000-0000-4000-8000-0000000000a1',
   'Trigger test project');

insert into public.tasks (id, user_id, title, project_id) values
  ('c3000000-0000-4000-8000-000000000001',
   'a1000000-0000-4000-8000-0000000000a1',
   'parent task',
   'b2000000-0000-4000-8000-000000000001');

insert into public.subtasks (id, task_id, label) values
  ('d4000000-0000-4000-8000-000000000001',
   'c3000000-0000-4000-8000-000000000001',
   'child step');

-- ── one: each table carries its trigger ────────────────────────────────────
select has_trigger('users',      'set_users_updated_at');
select has_trigger('categories', 'set_categories_updated_at');
select has_trigger('projects',   'set_projects_updated_at');
select has_trigger('tasks',      'set_tasks_updated_at');
select has_trigger('subtasks',   'set_subtasks_updated_at');

-- ── two: a stale client cannot push updated_at into the future ─────────────
select pg_sleep(0.05);

update public.users
set display_name = 'Alice',
    updated_at   = now() + interval '7 days'
where id = 'a1000000-0000-4000-8000-0000000000a1';

update public.categories
set position   = 99,
    updated_at = now() + interval '7 days'
where id = '10000000-0000-4000-8000-000000000001';

update public.projects
set name       = 'renamed',
    updated_at = now() + interval '7 days'
where id = 'b2000000-0000-4000-8000-000000000001';

update public.tasks
set title      = 'retitled',
    updated_at = now() + interval '7 days'
where id = 'c3000000-0000-4000-8000-000000000001';

update public.subtasks
set label      = 'renamed step',
    updated_at = now() + interval '7 days'
where id = 'd4000000-0000-4000-8000-000000000001';

select ok(
  (select updated_at < clock_timestamp()
   from public.users where id = 'a1000000-0000-4000-8000-0000000000a1'),
  'users.updated_at ignores the future value the UPDATE carries'
);

select ok(
  (select updated_at < clock_timestamp()
   from public.categories where id = '10000000-0000-4000-8000-000000000001'),
  'categories.updated_at ignores the future value the UPDATE carries'
);

select ok(
  (select updated_at < clock_timestamp()
   from public.projects where id = 'b2000000-0000-4000-8000-000000000001'),
  'projects.updated_at ignores the future value the UPDATE carries'
);

select ok(
  (select updated_at < clock_timestamp()
   from public.tasks where id = 'c3000000-0000-4000-8000-000000000001'),
  'tasks.updated_at ignores the future value the UPDATE carries'
);

select ok(
  (select updated_at < clock_timestamp()
   from public.subtasks where id = 'd4000000-0000-4000-8000-000000000001'),
  'subtasks.updated_at ignores the future value the UPDATE carries'
);

-- ── three: nor drag it into the past ────────────────────────────────────────
select pg_sleep(0.05);

update public.projects
set name       = 'rewound',
    updated_at = now() - interval '7 days'
where id = 'b2000000-0000-4000-8000-000000000001';

update public.tasks
set title      = 'rewound',
    updated_at = now() - interval '7 days'
where id = 'c3000000-0000-4000-8000-000000000001';

select ok(
  (select updated_at >= clock_timestamp() - interval '1 hour'
   from public.projects where id = 'b2000000-0000-4000-8000-000000000001'),
  'projects.updated_at ignores a week-old value from a stale device'
);

select ok(
  (select updated_at >= clock_timestamp() - interval '1 hour'
   from public.tasks where id = 'c3000000-0000-4000-8000-000000000001'),
  'tasks.updated_at ignores a week-old value from a stale device'
);

select * from finish();
rollback;
