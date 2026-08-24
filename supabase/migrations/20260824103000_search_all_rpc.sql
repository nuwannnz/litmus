-- S-2.6: the search_all(query) RPC — FR-16 (task search) and FR-27 (project
-- search) in one round trip.
--
-- architecture §4.3 specifies a single Postgres function over tsvector columns
-- spanning tasks and projects, called with `.rpc('search_all', { query })`.
-- PRD §10 Q6 asked whether search spans projects as well as tasks; §7 of the
-- same document recommends yes ("one tsvector query, effectively free"), and
-- this migration takes that recommendation.
--
-- Shape:
--   1. A stored GENERATED tsvector per row — title/name weighted 'A',
--      description weighted 'B' — plus one GIN index each.
--   2. `search_all(query text)` over both, SECURITY INVOKER so RLS applies,
--      returning a unified result set with a `kind` column ('task' /
--      'project') and ranked by ts_rank.
--
-- Notes on decisions made here:
--   * GENERATED ALWAYS AS ... STORED, not a trigger. The expression only reads
--     the row's own columns and never needs procedural logic; a trigger would
--     be more code for exactly the same result. The explicit 'english'
--     regconfig keeps to_tsvector immutable, which generated columns require.
--   * websearch_to_tsquery, not to_tsquery or plainto_tsquery. It accepts
--     unquoted punctuation and bare operators without raising a syntax error,
--     which is what a user typing into a search box deserves (FR-16's field is
--     free text, not query syntax).
--   * deleted_at IS NULL filters are included because both tables carry a
--     deleted_at column today (created by the core-schema migration). S-2.4
--     owns soft-delete behaviour; if that story changes the convention, this
--     function revisits it then.
--   * No grants are inherited from the tables: functions grant EXECUTE to
--     PUBLIC by default, so it is revoked from PUBLIC/anon and granted to
--     authenticated explicitly, matching the core schema's minimum-grant
--     posture.

-- ---------------------------------------------------------------------------
-- Search vectors
-- ---------------------------------------------------------------------------

alter table public.tasks
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

comment on column public.tasks.search_vector is
  'S-2.6: title at weight A, description at weight B. Consumed by search_all().';

create index tasks_search_vector_idx on public.tasks using gin (search_vector);

alter table public.projects
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

comment on column public.projects.search_vector is
  'S-2.6: name at weight A, description at weight B. Consumed by search_all().';

create index projects_search_vector_idx on public.projects using gin (search_vector);

-- ---------------------------------------------------------------------------
-- search_all(query text)
-- ---------------------------------------------------------------------------
--
-- SECURITY INVOKER is spelled out even though it is the default: the whole
-- point of this function is that it runs as the caller and therefore under
-- RLS — a user can only ever match rows they already own. `set search_path =
-- ''` matches the house style from handle_new_user(); every name below is
-- schema-qualified (pg_catalog is implicit).
--
-- An empty or whitespace-only query yields an empty result set rather than an
-- error or a full-table scan: the `q` CTE produces no row, and the cross join
-- propagates that to both branches.
create function public.search_all(query text)
returns table (
  kind       text,
  id         uuid,
  title      text,
  project_id uuid,
  status     text,
  rank       real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (
    select websearch_to_tsquery('english', btrim(query)) as tsq
    where btrim(coalesce(query, '')) <> ''
  ),
  task_hits as (
    select
      'task'::text            as kind,
      t.id                    as id,
      t.title                 as title,
      t.project_id            as project_id,
      t.status::text          as status,
      ts_rank(t.search_vector, q.tsq) as rank
    from public.tasks t
    cross join q
    -- No `q.tsq <> ''` guard needed here: the cross join against `q`
    -- propagates the empty-query case as zero rows, and an empty tsquery
    -- fails `@@` on its own.
    where t.search_vector @@ q.tsq
      and t.deleted_at is null
  ),
  project_hits as (
    select
      'project'::text         as kind,
      p.id                    as id,
      p.name                  as title,
      null::uuid              as project_id,
      p.status                as status,
      ts_rank(p.search_vector, q.tsq) as rank
    from public.projects p
    cross join q
    where p.search_vector @@ q.tsq
      and p.deleted_at is null
  )
  -- Qualified with `hits.` because these names double as the function's OUT
  -- parameters; an unqualified reference would be read as ambiguous.
  select hits.kind, hits.id, hits.title, hits.project_id, hits.status, hits.rank
  from (
    select * from task_hits
    union all
    select * from project_hits
  ) hits
  order by hits.rank desc;
$$;

comment on function public.search_all(text) is
  'S-2.6 / FR-16 / FR-27: full-text search across the caller''s tasks and projects in one round trip. SECURITY INVOKER so RLS scopes every hit.';

revoke all on function public.search_all(text) from public, anon;
grant execute on function public.search_all(text) to authenticated;
