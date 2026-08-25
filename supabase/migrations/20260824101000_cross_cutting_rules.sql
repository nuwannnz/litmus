-- S-2.4: cross-cutting schema rules (architecture §3.4).
--
-- Three rules apply to every user-data table and are enforced here, once,
-- rather than trusted to every future caller:
--
--   1. `updated_at` is maintained by a BEFORE UPDATE trigger, never by the
--      client. Offline sync is last-write-wins on this column (§4.2), so a
--      client-supplied `updated_at` would let a stale device claim to be the
--      newest write. The trigger overwrites whatever the UPDATE carries.
--   2. Soft delete: every application-level delete leaves a `deleted_at`
--      tombstone so the change can propagate to other devices (and be purged
--      by S-2.8's pg_cron job after 30 days). The columns themselves already
--      exist from the core schema — see the inventory below.
--   3. `position` is a fractional index (`numeric`), so a drag-and-drop
--      reorder writes exactly one row: the midpoint of its new neighbours,
--      e.g. `position = (prev.position + next.position) / 2`. No rebalancing
--      pass exists yet; with numeric's arbitrary precision, midpoints can be
--      taken thousands of times before any column hits its scale limit.
--
-- Inventory against the core schema (nothing below re-creates what exists):
--   users       updated_at ✓   deleted_at — n/a (1:1 with auth.users; removal
--                              is an auth-level hard delete that cascades)
--   categories  updated_at ✓   deleted_at — n/a (global reference data,
--                              writable by no client; no tombstone to sync)
--   projects    updated_at ✓   deleted_at ✓   position numeric ✓
--   tasks       updated_at ✓   deleted_at ✓   position numeric ✓
--   subtasks    updated_at ✓   deleted_at ✓   position numeric ✓
-- So this migration adds only the trigger function and one trigger per table;
-- the columns are already right.

create function public.set_updated_at()
  returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'S-2.4 / architecture §3.4: overwrites updated_at on every update so last-write-wins never trusts the client.';

-- One trigger per table, not a statement-level or event-trigger shortcut:
-- per-table triggers are individually visible in pg_trigger (S-2.10 asserts
-- each), and a table added later opts in explicitly instead of silently.
--
-- categories gets one too even though no client can write it today: if Q7
-- lands on user-created categories, the rule must already hold without anyone
-- remembering to attach it.
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger set_subtasks_updated_at
  before update on public.subtasks
  for each row execute function public.set_updated_at();
