-- S-2.8: pgTAP coverage for the pg_cron purge of soft-deleted rows.
--
-- This is the first pgTAP file in the repo; the fuller suites arrive with
-- S-2.10 / S-2.11 and CI wiring lands in S-2.12. Until then this file is the
-- harness: any `.sql` under supabase/tests/ is picked up by
-- `npx supabase test db`, which runs it with pg_prove against the local
-- stack (migrations already applied by `db reset`). Everything here runs
-- inside one transaction and rolls back, so tests can insert freely and
-- leave nothing behind.
--
-- Covered:
--   * the purge function exists;
--   * a nightly cron entry named `purge-soft-deleted` targets it;
--   * tombstones older than 30 days die, younger ones and live rows survive,
--     across all three tombstone-bearing tables;
--   * ON DELETE CASCADE takes fresh tombstones down with a purged parent
--     (documented behaviour of the migration, asserted so a change is loud).
--
-- Tests run as `postgres`, which bypasses RLS — deliberate here, because the
-- function under test is SECURITY DEFINER maintenance and must see every
-- user's tombstones, not a session's.

begin;

create extension if not exists pgtap;

select plan(11);

-- ---------------------------------------------------------------------------
-- Shape
-- ---------------------------------------------------------------------------

select has_function(
  'public', 'purge_soft_deleted', array[]::text[],
  'public.purge_soft_deleted() exists'
);

select is(
  (
    select btrim(command)
    from cron.job
    where jobname = 'purge-soft-deleted'
  ),
  'select public.purge_soft_deleted();',
  'cron job purge-soft-deleted targets the purge function'
);

select is(
  (select schedule from cron.job where jobname = 'purge-soft-deleted'),
  '30 2 * * *',
  'cron job purge-soft-deleted is scheduled nightly'
);

select is(
  (select count(*) from cron.job where jobname = 'purge-soft-deleted'),
  1::bigint,
  'exactly one purge-soft-deleted job exists'
);

-- ---------------------------------------------------------------------------
-- Behaviour
-- ---------------------------------------------------------------------------

-- A profile row arrives via the on_auth_user_created trigger when its
-- auth.users identity is inserted; everything else hangs off it.
insert into auth.users (id, email)
values ('20000000-0000-4000-8000-00000000f001', 'purge-test@example.com');

with u as (
  select id from public.users
  where id = '20000000-0000-4000-8000-00000000f001'
)
insert into public.projects (id, user_id, name, deleted_at)
values
  ('20000000-0000-4000-8000-00000000a001', (select id from u), 'old tombstone',    now() - interval '31 days'),
  ('20000000-0000-4000-8000-00000000a002', (select id from u), 'fresh tombstone',  now() - interval '1 day'),
  ('20000000-0000-4000-8000-00000000a003', (select id from u), 'live',             null);

-- T-cascade sits under the purged project but is only a day dead: it survives
-- its own cutoff and dies purely through the cascade. That asymmetry is the
-- documented cascade behaviour above.
insert into public.tasks (id, user_id, project_id, title, deleted_at)
values
  ('20000000-0000-4000-8000-00000000b001', '20000000-0000-4000-8000-00000000f001', '20000000-0000-4000-8000-00000000a002', 'old tombstone',       now() - interval '31 days'),
  ('20000000-0000-4000-8000-00000000b002', '20000000-0000-4000-8000-00000000f001', '20000000-0000-4000-8000-00000000a001', 'fresh, cascades away', now() - interval '1 day'),
  ('20000000-0000-4000-8000-00000000b003', '20000000-0000-4000-8000-00000000f001', '20000000-0000-4000-8000-00000000a003', 'live',                 null);

insert into public.subtasks (id, task_id, label, deleted_at)
values
  ('20000000-0000-4000-8000-00000000c001', '20000000-0000-4000-8000-00000000b003', 'old tombstone',   now() - interval '31 days'),
  ('20000000-0000-4000-8000-00000000c002', '20000000-0000-4000-8000-00000000b003', 'fresh tombstone', now() - interval '1 day');

-- Three tables purged, one row each on its own merits; the two cascade kills
-- do not add to the count (row_count sees only the table named in the DELETE).
select is(
  public.purge_soft_deleted(),
  3,
  'purge reports one deletion per tombstone-bearing table'
);

select is(
  (select count(*) from public.projects where id = '20000000-0000-4000-8000-00000000a001'),
  0::bigint,
  'project tombstone older than 30 days is purged'
);

select is(
  (select count(*) from public.projects where id in (
    '20000000-0000-4000-8000-00000000a002', '20000000-0000-4000-8000-00000000a003')),
  2::bigint,
  'fresh-tombstoned and live projects survive'
);

select is(
  (select count(*) from public.tasks where id = '20000000-0000-4000-8000-00000000b001'),
  0::bigint,
  'task tombstone older than 30 days is purged'
);

select is(
  (select count(*) from public.tasks where id = '20000000-0000-4000-8000-00000000b002'),
  0::bigint,
  'fresh task tombstone under a purged project goes with the cascade'
);

select is(
  (select count(*) from public.tasks where id = '20000000-0000-4000-8000-00000000b003'),
  1::bigint,
  'live task survives'
);

select is(
  (select count(*) from public.subtasks where id in (
    '20000000-0000-4000-8000-00000000c001', '20000000-0000-4000-8000-00000000c002')),
  1::bigint,
  'old subtask tombstone is purged, fresh one survives'
);

select * from finish();

rollback;
