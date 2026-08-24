-- S-2.3 / FR-39: every task has a home.
--
-- A task must belong to a project, carry a due_date, or both. Both columns are
-- individually nullable by design (architecture §3.1 — one task table, two
-- queries), so this CHECK is what keeps them from being simultaneously null,
-- making the orphan state unrepresentable rather than policed in the client.
--
-- A CHECK constraint is re-evaluated on every UPDATE of the row, not only on
-- INSERT, so the rule is symmetric for free: clearing the due_date of a
-- project-less task and removing the project_id from an undated task both
-- fail here, and no client can bypass it short of owning the database.

alter table public.tasks
  add constraint tasks_have_a_home
  check (project_id is not null or due_date is not null);

comment on constraint tasks_have_a_home on public.tasks is
  'FR-39: a task is reachable from the Week Board (due_date) or a Project board (project_id); never from neither.';
