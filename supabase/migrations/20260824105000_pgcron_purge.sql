-- S-2.8: nightly pg_cron purge of soft-deleted rows.
--
-- Soft delete (architecture §3.4) leaves a `deleted_at` tombstone so a delete
-- can propagate to the user's other devices. Once every device has seen it,
-- the tombstone is dead weight — and §3.4 fixes both ends of its lifetime:
-- "pg_cron purges after 30 days", and §4.3 names the mechanism: "nightly
-- purge of rows soft-deleted more than 30 days ago". This migration is that
-- job. It runs entirely inside Postgres — no scheduled worker, no Edge
-- Function (§4.4 reserves those for secrets the client must not hold, and a
-- DELETE with a WHERE clause holds none).
--
-- Shape:
--   1. `public.purge_soft_deleted()` — SECURITY DEFINER, deletes tombstones
--      older than 30 days from every table that carries `deleted_at`
--      (projects, tasks, subtasks — see the inventory in the cross-cutting
--      rules migration; users and categories never grow tombstones).
--   2. One cron entry, `purge-soft-deleted`, scheduled nightly at 02:30 UTC.
--
-- Decisions worth writing down:
--   * 30 days, measured on `deleted_at`, not `updated_at`: the tombstone's
--     age is when the delete happened, and a later edit to another column
--     (say a status change racing the delete offline) must not buy it
--     another 30 days.
--   * SECURITY DEFINER because cron runs the command as the cluster owner
--     anyway, and because the purge must ignore RLS by construction — it is
--     maintenance over every user's tombstones, not a user-scoped read.
--     `set search_path = ''` accompanies DEFINER per house rule; every name
--     below is schema-qualified.
--   * EXECUTE is revoked from PUBLIC/anon/authenticated. The function is
--     harmless by itself, but there is no reason for a client to call the
--     janitor, and the core schema sets the tone: grants exist only where a
--     caller needs them.
--   * ON DELETE CASCADE does real work here and is accepted, not fought:
--     hard-deleting a purged project cascades to its remaining tasks (and
--     their subtasks), and a purged task to its remaining subtasks —
--     tombstoned or not. There is no way to keep them (the parent's primary
--     key is gone), which is exactly the situation PRD Q8 left open for the
--     live soft-delete path; the purge inherits whatever that decision
--     produces and is revisited alongside it if needed.
--   * Deletion runs child-first (subtasks → tasks → projects). Each table is
--     filtered by the same cutoff, so cascades only ever catch rows whose
--     parent died — never rows that would have been purged on their own
--     merits anyway.
--
-- Extension handling: hosted Supabase ships pg_cron preinstalled, and the
-- CLI's local image carries it too, so CREATE EXTENSION IF NOT EXISTS is all
-- either environment needs. The scheduling below is still guarded: if a
-- future environment cannot install pg_cron (shared_preload_libraries, say),
-- the purge function still lands — the migration warns instead of failing,
-- because a schema without the function breaks far more than a database
-- without its broom.

create extension if not exists pg_cron;

create function public.purge_soft_deleted()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  purged integer := 0;
  deleted integer;
begin
  delete from public.subtasks
  where deleted_at < now() - interval '30 days';
  get diagnostics deleted = row_count;
  purged := purged + deleted;

  delete from public.tasks
  where deleted_at < now() - interval '30 days';
  get diagnostics deleted = row_count;
  purged := purged + deleted;

  delete from public.projects
  where deleted_at < now() - interval '30 days';
  get diagnostics deleted = row_count;
  purged := purged + deleted;

  return purged;
end;
$$;

comment on function public.purge_soft_deleted() is
  'S-2.8 / architecture §3.4: hard-deletes tombstones (deleted_at) older than 30 days. Scheduled nightly by pg_cron.';

revoke all on function public.purge_soft_deleted()
  from public, anon, authenticated;

-- The guard is `to_regclass('cron.job')`, not a lookup in pg_extension:
-- pg_cron can be loaded but pointed at another database via
-- cron.database_name, and the jobs table is the thing this code actually
-- needs. cron.schedule(name, ...) upserts by name, so re-running the
-- migration series against a database that already has the job updates the
-- schedule in place rather than duplicating it.
do $$
begin
  if to_regclass('cron.job') is not null then
    perform cron.schedule(
      'purge-soft-deleted',
      '30 2 * * *',
      $job$ select public.purge_soft_deleted(); $job$
    );
  else
    raise warning 'pg_cron unavailable: purge function created but not scheduled';
  end if;
end;
$$;
