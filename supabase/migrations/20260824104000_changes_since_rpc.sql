-- S-2.7: the changes_since(cursor timestamptz) RPC — the reconnect primitive.
--
-- architecture §4.3 specifies a Postgres function returning rows whose
-- updated_at exceeds the client's cursor, tombstones included; §5.3 directs
-- the client to prefer it over blanket cache invalidation on reconnect —
-- after a long offline stretch it is one query instead of a full reload, and
-- unlike a refetch it can see deletions, which a hard delete would otherwise
-- leave nothing behind to report (§3.4: soft delete exists for sync, not UI).
--
-- Shape: one unified result across projects and tasks — kind ('project' /
-- 'task'), id, the two timestamps, and the full row as jsonb so the client
-- can upsert straight into its cache. Ordered by updated_at so a replayed
-- feed lands in last-write-wins order.
--
-- Decisions made here:
--   * SECURITY INVOKER, spelled out even though it is the default, matching
--     search_all(): the function runs as the caller and therefore under RLS —
--     a device syncing through this RPC sees exactly the rows it already owns
--     and nothing else.
--   * NO deleted_at IS NULL filter. This is the deliberate difference from
--     search_all() and project_stats: those answer "what is live?", this
--     answers "what changed?". A soft-deleted row must appear, carrying its
--     deleted_at timestamp, or the other device never learns about the
--     deletion. S-2.8's pg_cron purge drops tombstones after 30 days, which
--     bounds what the feed ever returns.
--   * search_vector is stripped from the jsonb payload (- 'search_vector').
--     It is a derived column (S-2.6), often large, and reconstructible from
--     the row itself — shipping it would double the payload for nothing.
--   * Subtasks are not in this feed yet. They sync through their parent task
--     today (a task change re-fetches its checklist); promoting them to
--     first-class entries is a one-branch addition here when a story asks
--     for it.
--   * Grants follow the core schema's two-gate posture: EXECUTE revoked from
--     PUBLIC/anon (functions grant it by default), granted to authenticated.

-- ---------------------------------------------------------------------------
-- Supporting indexes
-- ---------------------------------------------------------------------------
--
-- Every call filters each table on `updated_at > :cursor`, with RLS applying
-- `user_id = auth.uid()` first. Leading with user_id mirrors the Week Board
-- index: the policy resolves to one user's rows, then the cursor is a range
-- scan inside them.
create index tasks_user_id_updated_at_idx on public.tasks (user_id, updated_at);

create index projects_user_id_updated_at_idx on public.projects (user_id, updated_at);

-- ---------------------------------------------------------------------------
-- changes_since(cursor timestamptz)
-- ---------------------------------------------------------------------------
--
-- `set search_path = ''` matches the house style (handle_new_user(),
-- search_all()): every name below is schema-qualified. STABLE because the
-- same cursor yields the same rows within a statement — the feed reads, it
-- never writes.
--
-- Column names double as OUT parameters, so references inside the query are
-- table-qualified (`t.updated_at`) and the final ORDER BY goes through the
-- subquery alias — an unqualified `updated_at` would resolve to the OUT
-- parameter, not the column.
create function public.changes_since(cursor timestamptz)
returns table (
  kind       text,
  id         uuid,
  updated_at timestamptz,
  deleted_at timestamptz,
  data       jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from (
    select
      'project'::text            as kind,
      p.id                       as id,
      p.updated_at               as updated_at,
      p.deleted_at               as deleted_at,
      to_jsonb(p) - 'search_vector' as data
    from public.projects p
    where p.updated_at > cursor
    union all
    select
      'task'::text,
      t.id,
      t.updated_at,
      t.deleted_at,
      to_jsonb(t) - 'search_vector'
    from public.tasks t
    where t.updated_at > cursor
  ) changes
  order by changes.updated_at;
$$;

comment on function public.changes_since(timestamptz) is
  'S-2.7 / FR-8: the reconnect feed — every owned project/task row touched since the cursor, tombstones included. SECURITY INVOKER so RLS scopes every row.';

revoke all on function public.changes_since(timestamptz) from public, anon;
grant execute on function public.changes_since(timestamptz) to authenticated;
