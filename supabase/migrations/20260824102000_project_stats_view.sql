-- project_stats: one row per project, every stat derived (FR-23, FR-28).
--
-- architecture §3.2: stored counters and offline last-write-wins are actively
-- incompatible — two devices each incrementing a counter offline lose one of
-- the increments. A view cannot drift, so task_count, done_count, progress
-- and due_this_week are computed at read time and no counter column exists.
--
-- security_invoker = true (Postgres 15+) makes the view run with the querying
-- user's role, so projects/tasks RLS applies inside it. Without it the view
-- runs as its owner and silently bypasses row-level security — the single
-- easiest way to undo §2.2's default-deny model.
--
-- Soft-deleted rows are excluded: tasks.deleted_at is filtered in the join so
-- tombstones stay out of every count, and projects.deleted_at filters the
-- driving side so a deleted project yields no stats row at all. The *columns*
-- arrive in this migration because the core schema already created them;
-- their behaviour (triggers, purge) belongs to S-2.4/S-2.8.
create view public.project_stats
with (security_invoker = true) as
select
  p.id                                              as project_id,
  p.user_id                                         as user_id,
  count(t.id)                                       as task_count,
  count(t.id) filter (where t.status = 'done')      as done_count,
  -- Done ÷ total, exactly as FR-28 defines progress. Zero tasks means zero
  -- progress rather than a NULL a client would have to coalesce itself.
  coalesce(
    count(t.id) filter (where t.status = 'done')::numeric
      / nullif(count(t.id), 0),
    0
  )                                                 as progress,
  -- FR-23's "N due this week": the Mon–Sun window containing today, matching
  -- users.week_start_day's default of 1 (ISO Monday). Derived from
  -- current_date rather than now() so the window follows the same calendar-day
  -- reading as due_date itself (a plain `date`, per §3.1), not the server's
  -- clock time zone.
  count(t.id) filter (
    where t.due_date >= current_date - ((extract(isodow from current_date))::int - 1)
      and t.due_date <  current_date - ((extract(isodow from current_date))::int - 1) + 7
  )                                                 as due_this_week
from public.projects p
left join public.tasks t
  on t.project_id = p.id
 and t.deleted_at is null
where p.deleted_at is null
group by p.id;

comment on view public.project_stats is
  'FR-23/FR-28: derived per-project stats. No stored counters — they cannot drift. Runs as invoker so RLS applies.';

comment on column public.project_stats.progress is
  'Done ÷ total, 0..1; 0 when the project has no tasks.';

comment on column public.project_stats.due_this_week is
  'Tasks with a due_date in the current Mon–Sun week, tombstones excluded.';

-- Same two-gate treatment as the core schema: auto-exposure is off in
-- supabase/config.toml, so SELECT must be granted explicitly, and anon gets
-- nothing before RLS is ever consulted.
revoke all on public.project_stats from anon, authenticated;

grant select on public.project_stats to authenticated;
