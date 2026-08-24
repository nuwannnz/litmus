-- Core schema: users, categories, projects, tasks, subtasks.
--
-- RLS is the entire security model (docs/architecture.md §2.2): there is no
-- application tier between PostgREST and Postgres, so a missing policy is a
-- data breach rather than a bug. Every table below therefore enables RLS in
-- this same file, immediately after the CREATE TABLE that introduces it, and
-- a table with RLS on and no policy for an operation denies that operation.
-- Default deny is the intended failure mode, not an oversight.
--
-- Deliberately absent, per PRD §5 and docs/architecture.md §3.3: assignee,
-- team, members and people. Those are seeded realism in the design frames,
-- not requirements. The single user's avatar is rendered as a constant.
--
-- Also absent: everything below the `notes` line in architecture §3.3
-- (note_folders, notes, note_tags, note_links, attachments). Notes is v2 in
-- its entirety.
--
-- Left to the stories that own them, so this file stops at a clean line:
--   S-2.3  tasks_have_a_home CHECK (project_id is not null or due_date is not null)
--   S-2.4  updated_at triggers, UUIDv7 id defaults, soft-delete conventions,
--          fractional-index generation and rebalancing
--   S-2.5  project_stats view       S-2.6  search_all()      S-2.7  changes_since()
--   S-2.8  pg_cron purge of tombstones                       S-2.9  seed.sql
--   S-2.10 / S-2.11 pgTAP           S-2.12 pgTAP in CI
-- The *columns* those stories need (created_at, updated_at, deleted_at,
-- position) are created here; their behaviour is not.

-- ---------------------------------------------------------------------------
-- Enumerated and constrained value sets
-- ---------------------------------------------------------------------------
--
-- The rule applied throughout: an enum type where a requirement pins the value
-- set closed, text + CHECK where the set is still a product decision.
--
-- FR-36 pins task status: "To Do, In Progress and Done are the only values; no
-- surface introduces a fourth, and no surface hides one." A real type carries
-- that across every column, function signature and view, and `supabase gen
-- types` renders it as the TypeScript union 'todo' | 'progress' | 'done' — the
-- generated types are the contract (architecture §7.1). A CHECK would generate
-- as `string` and lose it. Adding a fourth value then costs an ALTER TYPE,
-- which is the point: FR-36 says that change should be loud.
create type public.task_status as enum ('todo', 'progress', 'done');

comment on type public.task_status is
  'FR-36: the one status model shared by every surface. Three values, closed.';

-- Priority, project status and the pastel colour families get text + CHECK
-- instead. No FR closes those sets — priority is a display attribute (FR-20),
-- the project lifecycle is PRD §10 Q8 and still open, and the colour list
-- belongs to the design tokens. Each is one ALTER CONSTRAINT away from moving,
-- and `string` in the generated types honestly reflects "not yet a contract".

-- ---------------------------------------------------------------------------
-- users — the profile row that hangs off auth.users
-- ---------------------------------------------------------------------------
--
-- architecture §3.3: `id → auth.users(id), display_name, week_start_day, theme`.
-- auth.users is owned by GoTrue and must not be extended; this is the app-owned
-- half of the same identity, sharing its primary key so the join is free and
-- `id = auth.uid()` is the whole policy. ON DELETE CASCADE means deleting the
-- auth identity removes the profile, and from there the whole tree.
create table public.users (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text,
  -- ISO day-of-week, 1 = Monday. Every design frame shows Mon–Sun, and whether
  -- this is configurable at all is PRD §10 Q5/Q9. The column exists because
  -- architecture §3.3 lists it; storing a default does not commit the UI to
  -- exposing a control, and Q9 can be answered without a migration.
  week_start_day smallint    not null default 1 check (week_start_day between 0 and 6),
  theme          text        not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.users is
  'App-owned profile, 1:1 with auth.users. Created by the on_auth_user_created trigger.';

-- A new signup cannot create this row itself. The client never touches
-- auth.users, and the INSERT policy below does not exist, so a profile can only
-- appear one way: a SECURITY DEFINER trigger on auth.users, running as the
-- function owner and therefore past RLS. That keeps profile creation atomic
-- with signup — there is no window in which a session exists without a profile,
-- and no client code path that can fabricate one for another user.
--
-- `set search_path = ''` is required on a SECURITY DEFINER function: without it
-- a caller-controlled search_path can resolve an unqualified name to their own
-- object and run it with the definer's rights. Every name below is schema-
-- qualified for that reason.
create function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public.users row for a new signup. SECURITY DEFINER because RLS denies the client this insert.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;

-- SELECT and UPDATE, own row only. There is deliberately no INSERT policy (the
-- trigger above owns creation) and no DELETE policy (removing an account is an
-- auth-level operation on auth.users, which cascades here). Both omissions are
-- load-bearing default-deny, not gaps.
create policy users_select_own on public.users
  for select to authenticated
  using (id = (select auth.uid()));

create policy users_update_own on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- categories — seeded reference data, not an enum
-- ---------------------------------------------------------------------------
--
-- FR-37 makes categories flat and consistent; PRD §10 Q7 — fixed list or
-- user-created? — is still open. A table answers Q7 later without a migration:
-- adding a nullable user_id and one more policy turns global reference data
-- into per-user data, whereas an enum would force an ALTER TYPE and a data
-- migration. This is exactly why the acceptance criteria call for a table.
--
-- The rows themselves live in this migration rather than in seed.sql (S-2.9)
-- because they are schema, not sample data: tasks.category_id is a foreign key
-- into them, their ids are referenced by seed.sql and by pgTAP, and seed.sql
-- runs only on a local `db reset` — it never runs against dev or production,
-- where these rows must still exist. Fixed literal ids keep them identical in
-- every environment.
create table public.categories (
  id         uuid primary key,
  name       text        not null unique check (length(btrim(name)) > 0),
  color      text        not null check (color in ('lav', 'mint', 'peach', 'blue', 'yellow', 'pink')),
  position   numeric     not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is
  'FR-37: the flat, workspace-wide category list. Seeded here so Q7 stays answerable without a migration.';

-- Mirrors CATEGORY_COLORS in src/client/libs/domain/src/constants/index.ts,
-- in its declared order.
insert into public.categories (id, name, color, position) values
  ('10000000-0000-4000-8000-000000000001', 'Design',    'lav',    1),
  ('10000000-0000-4000-8000-000000000002', 'Dev',       'blue',   2),
  ('10000000-0000-4000-8000-000000000003', 'Marketing', 'peach',  3),
  ('10000000-0000-4000-8000-000000000004', 'Meeting',   'yellow', 4),
  ('10000000-0000-4000-8000-000000000005', 'Research',  'mint',   5),
  ('10000000-0000-4000-8000-000000000006', 'Personal',  'pink',   6),
  ('10000000-0000-4000-8000-000000000007', 'QA',        'peach',  7),
  ('10000000-0000-4000-8000-000000000008', 'Docs',      'blue',   8);

alter table public.categories enable row level security;

-- Readable by every signed-in user, writable by none of them. There is no
-- user_id to scope by (architecture §3.3), and there should not be one while
-- Q7 is open: these are global rows. The absent INSERT/UPDATE/DELETE policies
-- are the deliberate part — migrations run as the table owner and bypass RLS,
-- so the category list can only ever change through a migration. If Q7 lands
-- on user-created categories, a nullable user_id plus write policies scoped to
-- `user_id = auth.uid()` extends this without touching what is already here.
create policy categories_select_all on public.categories
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key,
  user_id     uuid        not null references public.users (id) on delete cascade,
  name        text        not null check (length(btrim(name)) > 0),
  color       text        not null default 'lav' check (color in ('lav', 'mint', 'peach', 'blue', 'yellow', 'pink')),
  description text,
  about       text,
  -- Intentionally unconstrained. PRD §10 Q8 — can a project be archived or
  -- completed? — is open, and enumerating a lifecycle here would invent the
  -- requirement the working agreement (epics §1.1) says not to guess at. A
  -- CHECK lands with Q8, the same way categories' shape lands with Q7.
  status      text        not null default 'active',
  priority    text        check (priority in ('low', 'medium', 'high')),
  due_date    date,
  position    numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on column public.projects.status is
  'Free text until PRD Q8 decides the project lifecycle; a CHECK arrives with it.';

-- No task_count, done_count, progress or due_count. FR-28 calls them derived,
-- and architecture §3.2 is explicit that stored counters and offline
-- last-write-wins are incompatible: two devices each incrementing offline lose
-- one increment. They become the project_stats view in S-2.5.

create index projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

-- One policy per operation rather than a single FOR ALL: each is separately
-- auditable and separately testable, and S-2.10 can name the one that failed.
--
-- The UPDATE policy carries both USING and WITH CHECK. USING alone would let a
-- user hand a row they own to somebody else by rewriting user_id — the row
-- passes the read check on the way in and lands outside their own visibility.
-- WITH CHECK closes that, and the same pairing appears on tasks below.
create policy projects_select_own on public.projects
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy projects_insert_own on public.projects
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy projects_update_own on public.projects
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy projects_delete_own on public.projects
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- tasks — one table, not two
-- ---------------------------------------------------------------------------
--
-- The prototype's split Task / ProjectTask model (libs/domain) must not reach
-- the schema. FR-35 makes it contradictory: a project task with a due date has
-- to appear on the Week Board, and two types cannot express that without
-- duplicating the row and keeping the copies in sync (architecture §3.1).
--
-- One table makes FR-35 a property of the schema rather than code that has to
-- remember to run:
--   Week Board    = where due_date between :monday and :sunday   (FR-9)
--   Project board = where project_id = :id                       (FR-30)
--   Both          = a task that simply has both.
--
-- project_id, due_date, category_id and priority are all nullable; only id,
-- user_id, title and status are not. FR-39 — every task has a home — is the
-- CHECK that keeps all four being nullable from meaning "reachable from
-- nowhere", and it belongs to S-2.3, not here.
create table public.tasks (
  id          uuid               primary key,
  user_id     uuid               not null references public.users (id) on delete cascade,
  title       text               not null check (length(btrim(title)) > 0),
  status      public.task_status not null default 'todo',
  -- ON DELETE CASCADE governs only a hard delete. Every application delete is a
  -- soft delete (deleted_at), so in practice this fires only when S-2.8's
  -- pg_cron purge removes a project tombstone. Whether soft-deleting a project
  -- should cascade to its tasks, or require they be dated first, is PRD Q8
  -- (architecture §3.1) and is not decided here.
  project_id  uuid               references public.projects (id) on delete cascade,
  -- `date`, not `timestamptz`. FR-35 makes Week Board membership a calendar-day
  -- question; a timestamp would make which column a task lands in depend on the
  -- reader's time zone.
  due_date    date,
  -- ON DELETE SET NULL is safe precisely because category is optional (FR-37).
  category_id uuid               references public.categories (id) on delete set null,
  priority    text               check (priority in ('low', 'medium', 'high')),
  description text,
  -- Time of day within due_date (FR-20, "Time as a start–end range"), not a
  -- second date. The seed data carries '2:00 PM' / '3:30 PM' — a range on the
  -- day, with no zone of its own.
  start_time  time,
  end_time    time,
  position    numeric,
  created_at  timestamptz        not null default now(),
  updated_at  timestamptz        not null default now(),
  deleted_at  timestamptz,
  constraint tasks_time_range_ordered
    check (start_time is null or end_time is null or end_time >= start_time)
);

comment on table public.tasks is
  'FR-35/FR-36: the one task table. Week Board and Project board are two queries over it, not two types.';

-- The two primary queries, and nothing speculative.
--
-- Both indexes are partial on the indexed column being non-null, which is free:
-- `due_date between :a and :b` and `project_id = :id` each imply their own
-- predicate, so the planner can always use them, and undated or project-less
-- rows stay out of the index entirely. Once S-2.3 lands, every task has at
-- least one of the two columns, so between them these cover every row.
--
-- user_id leads the Week Board index because RLS applies `user_id = auth.uid()`
-- to every query before anything else; the date range is then a range scan
-- inside one user's rows.
create index tasks_user_id_due_date_idx on public.tasks (user_id, due_date)
  where due_date is not null;

create index tasks_project_id_idx on public.tasks (project_id)
  where project_id is not null;

alter table public.tasks enable row level security;

create policy tasks_select_own on public.tasks
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy tasks_insert_own on public.tasks
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy tasks_update_own on public.tasks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy tasks_delete_own on public.tasks
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- subtasks — FR-21
-- ---------------------------------------------------------------------------
--
-- No user_id, per architecture §3.3. A subtask has no independent existence:
-- it is owned by whoever owns its task, and denormalising user_id onto it would
-- create a second copy of that fact which can disagree with the first — a
-- subtask whose user_id says one thing and whose parent task says another is a
-- row RLS would then read the wrong way. Deriving ownership through the parent
-- makes that state unrepresentable.
create table public.subtasks (
  id         uuid        primary key,
  task_id    uuid        not null references public.tasks (id) on delete cascade,
  label      text        not null check (length(btrim(label)) > 0),
  done       boolean     not null default false,
  position   numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.subtasks is
  'FR-21: the checklist under a task. Ownership is derived from tasks; there is deliberately no user_id.';

-- Serves both the `N of M` counter (FR-21) and the EXISTS in every policy
-- below, which becomes an index lookup on the parent rather than a scan.
create index subtasks_task_id_idx on public.subtasks (task_id);

alter table public.subtasks enable row level security;

-- The policy shape follows from having no user_id: reach the owner through the
-- parent task. The EXISTS is itself evaluated under the tasks policies, so it
-- can only ever see tasks the caller owns — the ownership test is applied twice
-- and agrees with itself by construction.
--
-- deleted_at is deliberately not filtered here: a soft-deleted task is still a
-- row that has to sync, and hiding its subtasks would make the tombstone
-- unpropagatable and an undelete lossy.
create policy subtasks_select_via_task on public.subtasks
  for select to authenticated
  using (exists (
    select 1 from public.tasks t
    where t.id = subtasks.task_id and t.user_id = (select auth.uid())
  ));

create policy subtasks_insert_via_task on public.subtasks
  for insert to authenticated
  with check (exists (
    select 1 from public.tasks t
    where t.id = subtasks.task_id and t.user_id = (select auth.uid())
  ));

-- USING and WITH CHECK again, for the same reason as on tasks: without WITH
-- CHECK a subtask could be re-parented onto another user's task.
create policy subtasks_update_via_task on public.subtasks
  for update to authenticated
  using (exists (
    select 1 from public.tasks t
    where t.id = subtasks.task_id and t.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.tasks t
    where t.id = subtasks.task_id and t.user_id = (select auth.uid())
  ));

create policy subtasks_delete_via_task on public.subtasks
  for delete to authenticated
  using (exists (
    select 1 from public.tasks t
    where t.id = subtasks.task_id and t.user_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
--
-- supabase/config.toml leaves auto_expose_new_tables unset, which matches the
-- current cloud default: new tables in `public` are NOT reachable through the
-- Data API roles without an explicit grant. Policies alone would therefore
-- produce a schema that is correct and entirely unusable, so the grants are
-- part of this migration.
--
-- Grants and policies are two different gates and both are set to the minimum.
-- `anon` receives nothing at all: there is no anonymous surface in Litmus, and
-- an unauthenticated caller should be stopped by the grant before RLS is ever
-- consulted. users gets no INSERT or DELETE grant, matching the missing
-- policies; categories is read-only to everyone.
--
-- The REVOKE is not ceremonial. Turning off auto-exposure withholds SELECT,
-- INSERT, UPDATE and DELETE from anon and authenticated, but Supabase's default
-- privileges still hand both roles REFERENCES, TRIGGER and TRUNCATE on every
-- new table in `public`. TRUNCATE is the one that matters: it is not a row
-- operation, so RLS does not apply to it, and §2.2 has no second layer to catch
-- what RLS misses. PostgREST offers no way to issue one today, which is why
-- this is hardening rather than a live hole — but "not currently reachable" is
-- not the standard a table full of the user's only copy of their data deserves.
-- Start from nothing on both roles, then grant back exactly what each needs.
revoke all on public.users, public.categories, public.projects, public.tasks, public.subtasks
  from anon, authenticated;

grant usage on schema public to authenticated;

grant select, update                 on public.users      to authenticated;
grant select                         on public.categories to authenticated;
grant select, insert, update, delete on public.projects   to authenticated;
grant select, insert, update, delete on public.tasks      to authenticated;
grant select, insert, update, delete on public.subtasks   to authenticated;
