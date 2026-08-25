-- S-2.11 / GitHub issue #18 — FR-39: every task has a home.
--
-- Proves the tasks_have_a_home CHECK (migration 20260824100000) holds in both
-- directions: no INSERT can create a task with neither project_id nor
-- due_date, and no UPDATE can strip a task's last remaining home — while each
-- single home alone, both together, and moving between homes all pass.

begin;
set local search_path = public, extensions;
select plan(9);

-- Fixtures: one profile (created by handle_new_user off auth.users) and one
-- project. Inserts run as the table owner, above RLS, like a migration would.
insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-0000000000a1', 'alice@example.test');

insert into public.projects (id, user_id, name) values
  ('b2000000-0000-4000-8000-000000000001',
   'a1000000-0000-4000-8000-0000000000a1',
   'Home test project');

-- 1 ── the constraint is actually there, as a CHECK on tasks
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tasks'::regclass
      and conname  = 'tasks_have_a_home'
      and contype  = 'c'
  ),
  'FR-39: public.tasks carries the tasks_have_a_home CHECK constraint'
);

-- 2 ── INSERT with neither home is rejected with a CHECK violation.
-- (pgTAP compares error text exactly, so we pin SQLSTATE 23514 here and pin
-- the constraint *name* itself in test 1.)
select throws_ok(
  $q$
    insert into public.tasks (id, user_id, title)
    values ('c3000000-0000-4000-8000-000000000000',
            'a1000000-0000-4000-8000-0000000000a1',
            'orphan')
  $q$,
  '23514',
  NULL,
  'FR-39: inserting a task with neither project_id nor due_date fails'
);

-- 3–5 ── each home alone passes, and so do both together
select lives_ok(
  $q$
    insert into public.tasks (id, user_id, title, due_date)
    values ('c3000000-0000-4000-8000-000000000001',
            'a1000000-0000-4000-8000-0000000000a1',
            'dated only', current_date)
  $q$,
  'FR-39: a task with only a due_date inserts'
);

select lives_ok(
  $q$
    insert into public.tasks (id, user_id, title, project_id)
    values ('c3000000-0000-4000-8000-000000000002',
            'a1000000-0000-4000-8000-0000000000a1',
            'project only',
            'b2000000-0000-4000-8000-000000000001')
  $q$,
  'FR-39: a task with only a project_id inserts'
);

select lives_ok(
  $q$
    insert into public.tasks (id, user_id, title, project_id, due_date)
    values ('c3000000-0000-4000-8000-000000000003',
            'a1000000-0000-4000-8000-0000000000a1',
            'both homes',
            'b2000000-0000-4000-8000-000000000001',
            current_date)
  $q$,
  'FR-39: a task with both a project_id and a due_date inserts'
);

-- 6 ── UPDATE, direction one: strip the dated task's only home
select throws_ok(
  $q$
    update public.tasks
    set due_date = null
    where id = 'c3000000-0000-4000-8000-000000000001'
  $q$,
  '23514',
  NULL,
  'FR-39: clearing the due_date of a project-less task fails'
);

-- 7 ── UPDATE, direction two: strip the undated task's only home
select throws_ok(
  $q$
    update public.tasks
    set project_id = null
    where id = 'c3000000-0000-4000-8000-000000000002'
  $q$,
  '23514',
  NULL,
  'FR-39: removing the project_id from an undated task fails'
);

-- 8 ── moving between homes in one UPDATE is legal
select lives_ok(
  $q$
    update public.tasks
    set project_id = 'b2000000-0000-4000-8000-000000000001',
        due_date   = null
    where id = 'c3000000-0000-4000-8000-000000000001'
  $q$,
  'FR-39: moving a task from the Week Board into a project in one UPDATE passes'
);

-- 9 ── dropping one home while keeping the other is legal
select lives_ok(
  $q$
    update public.tasks
    set due_date = null
    where id = 'c3000000-0000-4000-8000-000000000003'
  $q$,
  'FR-39: clearing the due_date of a task that still has a project passes'
);

select * from finish();
rollback;
