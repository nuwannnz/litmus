---
title: Architecture — Litmus
version: 1.1.0
status: proposed
created: 2026-08-21
updated: 2026-08-25
requires: docs/prd.md >= 2.0.0
---

# Architecture: Litmus

Status: **proposed** — decisions below are recommendations with rationale, not yet implemented.
Companion to `prd.md` (requirements) and `prd-addendum.md`.

---

## 0. Summary

| Layer | Choice |
|---|---|
| Database | Supabase Postgres — free tier, two projects (dev + prod) |
| API | **PostgREST + RLS** — no hand-written backend |
| Complex reads | Postgres views and RPC functions (SQL) |
| Scheduled work | `pg_cron` inside Postgres |
| Edge Functions | **none in v1** — reserved for work that needs a secret (§4.4) |
| Auth | Supabase Auth (GoTrue), client-side session |
| Object storage | **none in v1** — Supabase Storage arrives in v2 with note attachments (§3.3) |
| Web hosting | Cloudflare Pages, free tier, custom domain included |
| Client data layer | TanStack Query v5 + `supabase-js`, offline-persisted, optimistic |
| Live sync | Supabase Realtime (`postgres_changes`) |
| Language | TypeScript, end to end |
| Unit tests | Vitest |
| Database tests | pgTAP via `supabase test db` — **mandatory**, see §7.3 |
| E2E | Playwright in a separate Nx project `apps/web-e2e` |
| Types | `supabase gen types typescript` — schema is the contract |
| Versioning | release-please + conventional commits, version surfaced in Settings (§8) |

**Running cost: $0/month.**

---

## 1. Decision: Supabase over AWS

Cost was stated as the priority, so start there — and the honest finding is that **cost does not
separate these options at single-user scale**. Both land near zero. What separates them is the
*shape* of the cheap path.

### The AWS problem

AWS's always-free allowances (Lambda 1M req + 400k GB-s/mo, DynamoDB 25 GB — both genuinely
permanent) make a Lambda + DynamoDB + S3 + Cognito stack cost roughly $0. But note what that
sentence commits you to: **DynamoDB**. The Litmus domain is relational — tasks belong to projects,
notes link to both tasks and projects, project stats are aggregates over tasks, and search spans
titles. Every one of those is a join or an aggregate, modelled in a key-value store as
hand-maintained duplicate items and GSIs you have to design up front and can't easily change.

The moment you want Postgres on AWS instead, the cost story inverts:

- RDS `db.t4g.micro` — roughly **$12–15/mo**, always on.
- Aurora Serverless v2 — minimum billable capacity means roughly **$43/mo**; it can now scale to
  zero, but resume latency is measured in seconds and storage bills regardless.

So AWS is ~$0 with the wrong database, or ~$15–45/mo with the right one. Supabase gives you the
right database at $0. That is the decision.

Two further points, both material for an open-source project:

- **AWS's free tier changed in July 2025.** New accounts get a $100–200 credit over 6 months rather
  than 12 months of free service. Lambda and DynamoDB allowances persist, but S3, API Gateway and
  friends bill from day one after the credit window. The "free for a year" intuition is out of date.
- **Contributor onboarding.** `git clone && supabase start` gives anyone a complete local backend —
  Postgres, auth, storage, migrations, seed data — in one command. The AWS equivalent is "create an
  account, bootstrap CDK, deploy a dozen resources, hope LocalStack covers the rest."

### Why not Vercel

Vercel is a *frontend* host; it doesn't answer the database question. The build here is a plain Vite
SPA with no SSR, no ISR, no edge middleware — nothing Vercel is uniquely good at. Cloudflare Pages
hosts the same bundle free with no bandwidth ceiling worth worrying about.

**Custom domains are free on both.** Cloudflare Pages includes them with automatic TLS on the free
plan (5 per project, 4 more than needed); Cloudflare DNS is free and there is no per-domain platform
charge. Vercel Hobby is the same. The only cost either way is **domain registration**, paid to a
registrar — and Cloudflare Registrar sells at wholesale with no markup and no
cheap-first-year/expensive-renewal game, which usually makes it the cheapest place to hold the name.
One asymmetry: **Vercel's Hobby tier forbids commercial use**, so if Litmus ever takes money the
domain has to move. Not a concern for a personal tool, but it surfaces at the worst moment.

---

## 2. Decision: TypeScript everywhere, and no backend at all

The earlier draft of this document proposed a C# API. That is dropped. The stack is TypeScript end
to end, and — importantly — **v1 needs no hand-written backend of any kind**, not even Edge
Functions.

This is a bigger simplification than it first appears. With Supabase, PostgREST already exposes the
schema as a typed REST API, and RLS enforces access. Between them they cover FR-9 through FR-37
almost completely. What's left is genuinely small:

| Need | Where it lives | Not a server |
|---|---|---|
| CRUD on tasks, projects, notes | PostgREST + RLS | ✓ |
| Derived project stats (FR-28) | Postgres view | ✓ |
| Search across tasks and projects (FR-16, FR-27) | Postgres function, called via `.rpc()` | ✓ |
| Purging soft-deleted rows after 30 days | `pg_cron` | ✓ |
| Closing registration (Open Q3) | Supabase Auth config | ✓ |
| Data export (Open Q11) | Client-side, or one RPC | ✓ |
| Attachment upload *(v2)* | Direct to Storage, RLS-scoped | ✓ |

Two consequences worth naming, because both are upgrades:

- **Supabase Realtime becomes available.** The C# design deliberately kept Supabase tokens out of
  the browser, which ruled Realtime out and left focus-refetching as the sync mechanism. With
  client-side sessions, `postgres_changes` subscriptions give FR-8's "within a few seconds" properly
  (§5.3).
- **Types come from the schema, first-party.** `supabase gen types typescript` generates TypeScript
  from the live schema — no OpenAPI generation step, no contract to keep in sync. Schema drift
  becomes a typecheck failure.

### 2.1 The cost of this decision: one PRD security NFR has to change

This is the one thing to be deliberate about rather than discover later.

PRD §8 requires that **"session tokens are not readable by page scripts."** `supabase-js` stores its
session in `localStorage`, which is exactly what that NFR forbids. Satisfying it properly requires
terminating the session in httpOnly cookies on a server you control — and there is no cheap middle
ground, because a browser that can't read its own token can't use PostgREST either. Adding an auth
broker means writing every endpoint by hand, which is the backend we just removed.

**So the choice is: keep the NFR and keep a backend, or drop the backend and amend the NFR.** Having
chosen the second, the honest move is to amend the requirement explicitly and add compensating
controls, rather than leave a stated requirement quietly violated.

What actually changes in the threat model is narrower than it sounds. The risk is XSS. With a token
in `localStorage`, an XSS gets a token it can exfiltrate and reuse elsewhere. With httpOnly cookies,
an XSS still makes authenticated requests as the user — it just can't take the token off-device. The
delta is real but bounded, and for a single-user personal tool with no third-party embeds and no
content authored by anyone else, it is a reasonable trade.

**Compensating controls — these become requirements, not suggestions:**

1. **Strict CSP.** No inline scripts, no `unsafe-eval`, an explicit origin allowlist. This aligns
   with the existing §8 privacy NFR (no third-party embeds, analytics or telemetry), so the policy
   is easy to keep tight — there is nothing legitimate to allow.
2. **Sanitise rendered markdown.** When Notes ships in v2, note bodies are user-authored HTML-ish
   content rendered back into the page — the single most likely XSS vector in the app. DOMPurify (or
   an equivalent) on the render path is mandatory, and it's worth writing that test before the
   feature.
3. **Short access-token TTL with refresh-token rotation.** Supabase defaults to a 1-hour access
   token; enable rotation with reuse detection so a stolen refresh token is single-use and its reuse
   invalidates the family.
4. **Never ship the `service_role` (or `sb_secret_…`) key to the client.** It bypasses RLS entirely.
   It belongs in CI secrets and nowhere else — not in `.env` files that Vite inlines, which is a real
   hazard given Vite exposes anything prefixed `VITE_`. The **publishable key is public by design**
   and safe to ship; RLS is what protects the data. Publishable (`sb_publishable_…`) keys are the
   current Supabase standard — the JWT-based `anon` key they replace is deprecated by the end of
   2026, and the local stack still issues only `anon` keys.

`prd.md` §8 is updated to match, with this reasoning recorded.

### 2.2 RLS is now the entire security model

Worth stating plainly because it changes how much care the policies deserve. With a hand-written API
there were two layers: application checks and RLS. There is now one. Every table gets RLS enabled
with `user_id = auth.uid()`, and **a missing policy is a data breach, not a bug**.

Two practices follow, and neither is optional:

- **Default deny.** Enable RLS on every table at creation, in the same migration. A table with RLS
  enabled and no policy denies everything, which is the correct failure mode; a table without RLS
  enabled is world-readable through PostgREST, which is not.
- **Test the policies** (§7.3). pgTAP tests asserting that user A cannot see user B's rows are the
  only thing standing between the schema and the internet. This is why database testing is listed as
  mandatory rather than nice-to-have.

---

## 3. Data model

### 3.1 The most important change: one `tasks` table

The prototype has **two** types — `Task` (Week board) and `ProjectTask` (project board) — with
different fields. This must not survive into the schema, because **FR-35 makes it contradictory**: a
project task with a due date has to appear on the Week Board, and a split model can't express that
without duplicating the row and keeping the copies in sync.

One table. **`project_id`, `due_date`, `category_id` and `priority` are all nullable** — confirmed;
only `id`, `user_id`, `title` and `status` are required:

```
tasks(id, user_id,
      title            not null,
      status           not null default 'todo',
      project_id       null references projects,
      due_date         null,
      category_id      null references categories,
      priority         null,
      description, start_time, end_time, position,
      created_at, updated_at, deleted_at)
```

- Week Board = `WHERE due_date BETWEEN :monday AND :sunday` (FR-9)
- Project board = `WHERE project_id = :id` (FR-30)
- A task with both is simply on both surfaces. FR-35 becomes a property of the schema rather than
  code that has to remember to run.

Making all four optional is right, and it lines up with FR-37 ("at most one Category") and with
FR-11, which creates a task from a day column with nothing but a title. Two consequences to design for:

**Nulls need a rendering decision, not just a column.** A task with no category has no pastel tag
chip; with no priority, no priority row in Task Detail (FR-20). Decide whether these render as
absent or as a muted "None" — absent is more in keeping with the PRD's calm tone (§9), and it's
cheaper to add a placeholder later than to remove one.

**Every task has a home — enforced by a constraint (FR-39).** All four columns being nullable would
otherwise permit a task with neither `project_id` nor `due_date`, which appears on no surface at all
and is reachable only through search. Resolved by making the state unrepresentable:

```sql
alter table tasks add constraint tasks_have_a_home
  check (project_id is not null or due_date is not null);
```

The rule is symmetric, and that matters: it refuses clearing the due date of a project-less task
*and* removing the project from an undated task. A `CHECK` catches both directions for free, where
application logic would have to remember each one separately.

Three consequences for the client:

- **Anticipate it, don't surface it.** A constraint violation arrives as a Postgres error code
  (`23514`), which is not an error message anyone should read. `libs/api` should evaluate the rule
  before writing and disable the offending affordance, per FR-39's requirement that the action be
  disabled rather than offered and rejected. The constraint is the backstop, not the UX.
- **The global "New Task" action (FR-11) needs a guard.** It creates a task without picking a day,
  so it must collect a project or a date before it can commit. This is the one existing FR the rule
  quietly changes.
- **Soft deletes interact with it.** Deleting a project must not orphan its undated tasks. Either
  cascade the soft delete to them or require they be dated first — a decision for whenever project
  deletion gets specified, which the PRD does not yet cover.

### 3.2 Derived stats are derived

`Project.taskCount`, `.done`, `.progress`, `.due` are stored fields today, kept in step by a
`recount()` helper in the reducer. FR-28 calls them *derived* stats. Make them a view:

```sql
create view project_stats as
select p.id as project_id,
       count(t.*)                                   as task_count,
       count(t.*) filter (where t.status = 'done')  as done_count,
       ...
from projects p left join tasks t
  on t.project_id = p.id and t.deleted_at is null
group by p.id;
```

Stored counters and offline last-write-wins are actively incompatible: two devices each incrementing
a counter offline produce one lost increment. A view cannot drift. PostgREST exposes the view as a
readable resource, so the client gets stats without a hand-written endpoint.

> Views need `security_invoker = true` (Postgres 15+) so the querying user's RLS applies. Without
> it a view runs as its owner and silently bypasses row-level security — the single easiest way to
> undo §2.2.

### 3.3 Full schema sketch

```
users            id → auth.users(id), display_name, week_start_day, theme
categories       id, name, color                    -- seeded rows, answers Open Q7 without a migration
projects         id, user_id, name, color, description, about, status,
                 priority, due_date, created_at, updated_at, deleted_at
tasks            (see 3.1)
subtasks         id, task_id, label, done, position          -- FR-21
note_folders     id, user_id, parent_id NULL, name, position -- self-referencing tree
notes            id, user_id, folder_id, title, body text, search tsvector, created_at, updated_at, deleted_at
note_tags        note_id, tag
note_links       id, note_id, task_id NULL, project_id NULL  -- CHECK exactly one target
attachments      id, note_id, storage_path, mime_type, bytes    -- v2, with Notes
```

Three notes on this:

- **Note bodies are `text` columns, not files.** They need full-text search and link integrity with
  tasks and projects, both of which Postgres gives for free and object storage does not. Sizing is
  answered in §3.5. Object storage is for **images and attachments embedded in notes** — and since
  those are deferred to v2 along with the rest of Notes, **v1 provisions no bucket and writes no
  Storage code at all**. Everything below the `notes` line in this sketch is v2.
- **No `assignee`, `team`, `members`, or `people` tables.** PRD §5 and §11.1 are explicit that these
  are seeded realism. Keep them out of the database; render the single user's avatar as a constant
  where the design shows one (FR-24, FR-32).
- **`open` on folders is UI state**, not data. It goes in `localStorage`, not a column.

### 3.4 Cross-cutting schema rules

- **Client-generated UUIDv7 primary keys.** Makes optimistic creates real (no temp-ID
  reconciliation) and makes offline mutation replay idempotent — a retried create is a primary-key
  conflict, not a duplicate row. Time-ordered, so it indexes well.
- **Soft delete (`deleted_at`) everywhere.** Required by sync, not the UI: a delete on the desktop
  must propagate to the phone, and a hard delete leaves no tombstone to propagate. `pg_cron` purges
  after 30 days.
- **`position` as a fractional index** (`numeric` or lexorank `text`) for drag-and-drop (FR-30,
  FR-31). A drag becomes a single-row update — essential for optimistic DnD.
- **RLS on every table**, enabled in the same migration that creates it (§2.2).
- **`updated_at` maintained by a trigger**, not by the client. The client can't be trusted to set it
  and last-write-wins depends on it.
- **Migrations live in `supabase/migrations/*.sql`** and are the single source of truth — schema,
  RLS policies, views, functions, cron jobs, storage buckets and seed data all together, applied
  identically to local, dev and prod.

### 3.5 Will Postgres cope if notes get large?

Yes, with a comfortable margin — and the mechanism is worth knowing so the limits are clear rather
than assumed.

**How Postgres stores big text.** A page is 8 KB, but a `text` value never has to fit in one. Values
over ~2 KB are automatically **TOAST**ed: compressed first (markdown compresses roughly 3–4×, being
plain text), and if still oversized, split into chunks in a side table that's read only when the
column is actually selected. The hard ceiling on a single field is **1 GB**. A 500 KB note — far
beyond anything markdown-lite produces — is unremarkable.

**The real constraint is the free tier's 500 MB total, not the column.** Personal notes in this
style run 2–10 KB each:

| Notes | @ 10 KB each | After TOAST compression |
|---|---|---|
| 1,000 | 10 MB | ~3 MB |
| 10,000 | 100 MB | ~30 MB |
| 50,000 | 500 MB — the ceiling | ~150 MB |

You would have to write tens of thousands of long notes to feel it, and Pro ($25/mo, 8 GB) exists if
you somehow do.

**What actually fills 500 MB is images**, which is precisely why attachments go to Storage (§3.3)
and not the database. That split is what keeps the sizing question from ever becoming real.

**One design rule this implies:** never `SELECT body` in list queries. The folder tree and note list
select `id, title, folder_id, updated_at` only. Because TOAST is read lazily, a query that doesn't
name the column doesn't touch the chunk table at all — so the notes tree stays fast no matter how
much prose sits behind it. Worth encoding as a rule now, because the natural `select('*')` is the
one thing that would make large notes hurt.

**The escape hatch, if it were ever needed** — it won't be for markdown-lite: move `body` to Storage,
keep `tsvector` and a short excerpt in the row. Search and the note list keep working unchanged.
Worth knowing it exists. Worth not building it.

---

## 4. Data access

### 4.1 PostgREST is the API

`supabase-js` against PostgREST, wrapped in a thin `libs/api` library (§5.1). No endpoint code.

```ts
// Week Board — FR-9
supabase.from('tasks')
  .select('*, project:projects(id, name, color), category:categories(*)')
  .gte('due_date', monday).lte('due_date', sunday)
  .is('deleted_at', null);
```

RLS scopes every one of these to the signed-in user automatically; there is no `user_id` filter to
remember, and forgetting one can't leak anything.

### 4.2 Partial updates give per-field LWW for free

FR-8 requires last-write-wins **per field, not per record**. The naive reading is field-level
timestamps, which is a lot of schema. It isn't necessary, because `.update()` is already
patch-shaped:

```ts
supabase.from('tasks').update({ status: 'done' }).eq('id', id);   // touches one column
```

Device A editing `title` offline and device B editing `status` offline both survive, because their
updates touch different columns. Same field from both → last request to arrive wins, which is
precisely the specified behaviour. No field-level timestamps, no vector clocks, no CRDT.

The rule this depends on: **send only changed fields**. Writing back a whole task object from form
state would clobber the other device's edits and quietly break FR-8. Worth a lint rule or, more
practically, an `libs/api` surface that only accepts partials.

### 4.3 Views and RPC for everything PostgREST can't express

- **`project_stats` view** (§3.2) — FR-28, FR-23.
- **`search_all(query text)`** — a Postgres function over `tsvector` columns spanning tasks,
  projects and (v2) notes, called with `.rpc('search_all', { query })`. One round trip, and it
  answers Open Q6's "should search span Projects as well" for free.
- **`changes_since(cursor timestamptz)`** — rows whose `updated_at` exceeds the client's cursor,
  tombstones included. The reconnect primitive (§5.2); cheaper and more correct than refetching
  every query.
- **`pg_cron`** — nightly purge of rows soft-deleted more than 30 days ago.

SQL functions live in `supabase/migrations/` with everything else and are versioned with the schema.

### 4.4 Edge Functions: none in v1

Nothing in §6.1's MVP scope needs one. That is a genuine finding, not an oversight — the table in §2
walks through each candidate and lands on a database feature every time.

Reserve Edge Functions for work that needs a **secret the client must not hold** or a **third-party
call**. Realistic future triggers: emailing something other than auth mail, a webhook receiver, an
integration (explicitly a non-goal today, §5), or an export that bundles Storage objects with
database rows. When that day comes: Deno, TypeScript, and they deploy from the same
`supabase functions deploy` in CI — no new platform.

Deliberately **not** used as a proxy in front of PostgREST. That reintroduces the hand-written
backend this decision removed, without the httpOnly benefit that justified it.

---

## 5. Client architecture

### 5.1 TanStack Query — and what it displaces

Correct choice. But be clear about the consequence: **`libs/core`'s workspace reducer is server state
today, and TanStack Query replaces it.** That's the largest client refactor in this plan, not a
drop-in addition. After the change:

- **Server state** (tasks, projects, notes) → TanStack Query cache. `useTasks()`, `useProject(id)`
  and friends keep their current signatures and become query hooks, so feature modules barely change.
- **UI state** (open folders, active view, palette open) → `useState`/context, or a much smaller
  reducer.
- `WorkspaceProvider`'s `structuredClone` seeding disappears; seed data moves to
  `supabase/seed.sql` and stays useful for local dev and tests.

Add a **`libs/api`** library holding the Supabase client, generated `database.types.ts`, and the
query hooks. It slots in as `domain → api → ui → core → features`, preserving the one-way import
rule in CLAUDE.md. **Feature modules never import `supabase-js` directly** — that keeps the data
layer swappable and, more immediately, makes it mockable in tests (§7.2).

### 5.2 Offline (FR-8, §8 "offline tolerance")

- **Offline reads** — `persistQueryClient` with an IndexedDB persister. The app opens with last
  week's board rendered, never a blank screen.
- **Offline writes** — `onlineManager` pauses mutations when offline; the paused queue is persisted
  alongside the cache and `resumePausedMutations()` drains it on reconnect.
- **Optimistic everything** — `onMutate` applies the change to the cache immediately. Combined with
  client-generated IDs (§3.4), even creates are instant with no ID reconciliation. This is what §8's
  "reflect optimistically and immediately, never waiting on a round trip" requires.
- **Safe replay** — partial updates plus client-supplied IDs make every queued mutation idempotent,
  so a replay after a flaky reconnect can't double-create or clobber.
- **Cache invalidation on release** — `persistQueryClient`'s `buster` option takes the app version
  (§8), so a release that changes cached shapes discards stale caches instead of deserialising them
  into a crash. Cheap insurance that costs one line.

One caveat specific to this stack: a queued mutation may outlive the access token. `supabase-js`
refreshes automatically, but if the refresh token has expired during a long offline stretch, the
drain will fail with a 401 and TanStack Query will retry into the same wall. Handle it explicitly —
on 401 during resume, hold the queue, re-authenticate, then resume. Otherwise a week offline silently
discards the week's edits, which §8's durability NFR forbids.

### 5.3 Live sync (FR-8, "within a few seconds")

**Supabase Realtime**, which the browser-side session makes available:

```ts
supabase.channel('workspace')
  .on('postgres_changes', { event: '*', schema: 'public' },
      () => queryClient.invalidateQueries())
  .subscribe();
```

Invalidate-on-change rather than patching the cache from the payload: simpler, and correct even when
a change arrives for a query that isn't mounted. Scope the invalidation by table to avoid a full
refetch on every keystroke elsewhere.

Keep `refetchOnWindowFocus` as the belt-and-braces path — Realtime connections drop, phones suspend,
and focus refetch covers the gap for free. **On reconnect, prefer `changes_since` (§4.3) over
blanket invalidation**; after a long offline stretch it's one query instead of a full reload.

---

## 6. Environments, branching and CI/CD

Three environments, each owned by exactly one branch.

| | Branch | Purpose | Supabase | Frontend |
|---|---|---|---|---|
| **local** | `feature/*` | day-to-day dev, tests, CI | `supabase start` (Docker) | `nx serve` |
| **dev** | `develop` | integration, testing on a real device | hosted project `litmus-dev` | Pages preview (branch deploy) |
| **prod** | `main` | the real one | hosted project `litmus-prod` | Pages production |

**The free tier allows exactly two active projects per organisation**, so dev + prod fits precisely,
with no room for a third. That's the constraint to design around: real development happens locally,
and `dev` is for integration — not a per-feature sandbox. (Supabase's per-PR Branching feature is
Pro-only; local Postgres does the same job for free.)

**Free-tier pause:** a project pauses after **7 consecutive days with no database requests** and
needs a manual unpause. Prod won't trigger it with daily use; **`dev` very likely will**. Either
accept it and unpause when needed, or add a weekly scheduled workflow that pings it. Do not discover
this mid-debugging.

### 6.1 Branching model

```
feature/*  ──PR──▶  develop  ──PR──▶  main
   │                   │                │
   local            dev env         production
```

- **`main` is production.** It is deployed, tagged, and never committed to directly.
- **`develop` is the dev environment.** Everything integrates here first.
- **Feature branches are cut from `develop`** and merge back into `develop` by PR. Never from `main`
  — a branch cut from `main` is missing whatever is already integrated on `develop`, and the merge
  conflict shows up at the least convenient moment.
- **Releasing is `develop` → `main` by PR.** That PR is the release candidate; what it contains is
  what goes to production.
- **Hotfixes** are the one exception: branch from `main`, PR into `main`, then **immediately
  back-merge `main` into `develop`**. A hotfix that never returns to `develop` gets silently
  reverted by the next release.

**One gotcha worth knowing up front:** release-please runs on `main` and commits the version bump
and `CHANGELOG.md` there (§8). Those commits exist only on `main` until someone brings them back, so
**`main` must be back-merged into `develop` after every release**. Otherwise `develop`'s version
drifts behind, and eventually the release PR carries a confusing diff that reverts the changelog.
Automate it or make it step one of the next release — but don't rely on remembering.

### 6.2 Configuration

| Value | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Pages env var, per environment | public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Pages env var, per environment | **public by design** — RLS protects the data; publishable (`sb_publishable_…`) keys replace the deprecated JWT-based `anon` key |
| `SUPABASE_ACCESS_TOKEN`, project refs | GitHub Actions secrets | CI only |
| `CLOUDFLARE_API_TOKEN`, account id | GitHub Actions secrets | CI only |
| `service_role` / `sb_secret_…` key | GitHub Actions secrets, if ever needed | **never** in any `VITE_`-prefixed var — Vite inlines those into the bundle |

Use **GitHub Environments** (`dev`, `production`) to scope secrets to the workflows that deploy to
them, rather than one flat repository-wide bag. Production can then carry a required reviewer, which
makes "never deploy to prod by accident" a platform guarantee instead of a habit.

`supabase/config.toml` is committed and holds the local stack's configuration, so `supabase start`
reproduces dev exactly.

### 6.3 GitHub Actions

Four workflows, each with one job to do:

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | PR to `develop` or `main`, and pushes to both | install, typecheck, build, Vitest, pgTAP against a local Supabase, Playwright |
| `deploy-dev.yml` | push to `develop` | `supabase db push` → dev project, then deploy to Cloudflare Pages preview |
| `deploy-prod.yml` | push to `main` | `supabase db push` → prod project, then deploy to Pages production |
| `release-please.yml` | push to `main` | opens/updates the release PR; tags on merge (§8) |

Notes that matter more than the YAML:

- **`ci.yml` exists and passes today** — install, typecheck and build all work against the current
  repo. Test and migration steps get added to it as those things arrive, rather than committing a
  workflow that fails until the tooling catches up.
- **Migrations run before the frontend deploys**, in both deploy workflows. The reverse order ships
  a client that queries columns which don't exist yet.
- **Migrations are forward-only and applied by CI**, never by hand from a laptop. `supabase db diff`
  generates them locally; they are reviewed in the PR like any other code, because that is what they
  are.
- **Cache `~/.npm` and the Nx cache** keyed on `package-lock.json`. With `nx affected`, the common
  PR finishes in well under a minute.
- **`supabase db push` to prod should require the `production` GitHub Environment**, so a schema
  change to the real database is gated the same way a deploy is.

## 7. Testing and TDD

There is no test runner in the repo today, so all of this is greenfield. **CLAUDE.md's "no test
runner or linter configured" note must be updated once these land.**

### 7.1 The generated types are the contract

`supabase gen types typescript --local > libs/api/src/database.types.ts`, regenerated in CI and
committed. Every query in `libs/api` is typed against the real schema, so a migration that renames a
column fails `npm run typecheck` rather than surfacing as a runtime error in production. Add a CI
check that regenerating produces no diff — that catches a migration merged without regenerated types.

### 7.2 Vitest

`@nx/vite` is already installed, so `nx g @nx/vite:vitest-configuration` per library is the setup.

| Target | What to test | Style |
|---|---|---|
| `libs/domain` | date maths, note parsing, id generation | pure TDD — write the test first, always |
| `libs/api` | query hooks, optimistic updates, offline queue, partial-update discipline | mock the Supabase client at the module boundary |
| `libs/ui` | primitives, and **token contrast in both themes** (the §8 AA NFR, which the PRD flags as needing verification rather than assumption) | Testing Library + jsdom |
| feature libs | Week/Projects/Notes behaviour | Testing Library, `libs/api` mocked |

Mock at the `libs/api` boundary, not at HTTP. Mocking PostgREST's URL grammar with MSW means writing
tests against `supabase-js`'s wire format — brittle, and it tests the wrong thing. Real database
behaviour is covered properly in §7.3 and §7.4 instead.

### 7.3 pgTAP — the database tests, and why they're mandatory

RLS is now the entire security model (§2.2), so the policies need tests the way any other security
boundary does. `supabase test db` runs pgTAP against the local stack:

- **Isolation** — user A cannot select, update or delete user B's rows. One test per table. This is
  the suite that matters.
- **Default deny** — a new table without a policy returns nothing. Assert it, so an unpoliced table
  fails CI instead of shipping.
- **Views run as invoker** — `project_stats` respects RLS (§3.2).
- **Constraints and triggers** — `updated_at` moves on update; `note_links` accepts exactly one
  target; soft-deleted rows stay out of the stats view.
- **FR-39's invariant** — a task cannot be inserted or updated into having neither a project nor a
  due date, in either direction. The client is expected to prevent this (§3.1); the test proves the
  database does too.

### 7.4 Playwright

**A separate Nx project, `apps/web-e2e`**, via `@nx/playwright` — the Nx convention. It runs against
the real local stack (`supabase start` + `nx serve`), so it exercises real RLS, real Postgres and
real auth.

Keep it to journeys, not details — UJ-1…UJ-5 from PRD §2.3, plus **offline-and-reconnect**, which is
the one behaviour no unit test can honestly cover. Playwright's `context.setOffline(true)` makes that
testable: mutate offline, go online, assert the change persisted and reached a second context.

### 7.5 The PRD is already a test plan

Every FR in `prd.md` is written as **"Consequences (testable)"** bullets. Those map one-to-one onto
test names. Tag tests with their FR ID:

```ts
it('FR-35: a task given a due date appears in that day column', ...)
```

Requirement coverage becomes greppable, and the PRD stops drifting away from the code.

---

## 8. Versioning and release

**Semantic versioning, derived from commit messages, surfaced in the UI.** The repo already uses
conventional commits (`chore:`, `feat:`) and CLAUDE.md mandates semantic comments, so the version can
be computed rather than remembered.

### 8.1 Deriving the version

**release-please**, run as a GitHub Action on `main`. It reads conventional commits since the last
tag, opens a **release PR** that bumps `apps/web/package.json` and updates `CHANGELOG.md`, and tags
on merge. This fits CLAUDE.md's "PRs only, one approval required" exactly — the release itself is a reviewed
PR, and nothing bumps a version by side effect. Remember the back-merge that follows it (§6.1).

- `fix:` → patch · `feat:` → minor · `feat!:` / `BREAKING CHANGE:` → major
- **Start at `0.1.0`.** Cut **`1.0.0` when §6.1's MVP scope ships** — that makes the major version
  mean something concrete rather than marking an arbitrary Tuesday. Notes (v2) then lands as `2.0.0`
  only if it breaks something; otherwise it's a `feat:` minor. Resist tying marketing "v1/v2/v3" to
  semver majors; the PRD's v-numbers are scope milestones, and semver describes compatibility.

`apps/web/package.json`'s `version` is the single source of truth. Library versions in `libs/*` stay
at `0.0.1` and are meaningless — they're never published.

### 8.2 Getting it into the UI

Inject at build time via Vite `define`, so there's no runtime fetch and no stale value:

```ts
// apps/web/vite.config.ts
import pkg from './package.json' with { type: 'json' };

define: {
  __APP_VERSION__: JSON.stringify(pkg.version),
  __GIT_SHA__: JSON.stringify((process.env.CF_PAGES_COMMIT_SHA ?? 'local').slice(0, 7)),
  __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
}
```

Cloudflare Pages exposes `CF_PAGES_COMMIT_SHA` to builds. Declare the globals in a `vite-env.d.ts`
so they're typed.

**Where it shows:** Settings (FR-3), as a quiet last row — `Litmus 0.4.2` with the short SHA and
build date as secondary text. That's the conventional home and it partly answers Open Q5 (Settings
scope), which currently has no design frame. Keep it muted per §9's tone: this is a diagnostic, not
a feature. Specified as **FR-38** in `prd.md`.

**And nowhere else.** No `<meta>` tag, no console banner, nothing on the auth screens — FR-38 makes
Settings the only surface, per Open Q14. The one non-display use of the constant remains, because it
isn't a display: `persistQueryClient({ buster: __APP_VERSION__ })`, so a release invalidates
incompatible caches instead of deserialising them into a crash (§5.2).

---

## 9. Repository layout

```
CLAUDE.md                   repo-wide: what this is, where things live, policy
AGENTS.md                   pointer to CLAUDE.md
docs/                       prd.md, prd-addendum.md, architecture.md (this)
supabase/                   config.toml, migrations/*.sql, seed.sql, tests/*.sql (pgTAP)
  functions/                empty in v1 — see §4.4
src/client/
  CLAUDE.md                 workspace-specific: commands, Nx layout, module contract
  AGENTS.md                 pointer to the CLAUDE.md beside it
  apps/web/                 package.json version = the app version (§8)
  apps/web-e2e/             ← new: Playwright
  libs/api/                 ← new: supabase client, generated types, query hooks
  libs/{ui,domain,core,week,projects,notes}/
.github/workflows/          ci.yml, deploy-dev.yml, deploy-prod.yml, release-please.yml
```

The agent-instruction files are **nested deliberately**: the root file carries what is true of the
whole repository, and `src/client/`'s carries the Nx workspace detail, loaded only when working in
there. Splitting them keeps the root file about the project rather than about one of its
directories.

`AGENTS.md` at each level is a **pointer to the `CLAUDE.md` beside it**, not a second copy. The two
were byte-identical below their headers, which is four files to keep in sync and a guarantee of
drift — the first edit that lands in one and not the other leaves two documents both claiming to be
authoritative, with no way to tell which is stale.

---

## 10. Suggested sequence

0. **Branches and CI.** `develop` cut from `main`, `ci.yml` running typecheck and build. Cheap, and
   everything after it lands through the flow rather than being retrofitted into it.
1. **Schema + local stack.** `supabase init`, write the migrations with RLS from the first one, port
   seed data to `seed.sql`. Merging `Task`/`ProjectTask` (§3.1) happens here — it's the change
   everything else assumes.
2. **pgTAP isolation tests immediately after.** Before any client code. RLS is the security model;
   prove it works while the schema is four tables and the tests are trivial to write.
3. **Vitest, before any new feature code.** Retrofit onto `libs/domain` first: pure functions,
   fastest wins, and it establishes the TDD habit while the stakes are low.
4. **`libs/api`** — Supabase client, generated types, auth. Get sign-in working end to end against
   local before building breadth on it.
5. **Migrate one surface** — Week Board — from the reducer to TanStack Query. One surface reveals
   every problem in the pattern at a tenth of the cost of finding them in three.
6. **Remaining surfaces**, TDD'd.
7. **Offline layer** (§5.2), then **Realtime** (§5.3), once the online path is solid. Doing them
   earlier means debugging two unfinished things at once.
8. **Playwright `apps/web-e2e`**, journeys first, offline-and-reconnect included.
9. **Environments and release** — dev + prod projects, Pages, release-please, version in Settings.
   Cut `1.0.0` when §6.1 is complete.

---

## 11. Changes this pushed back into the PRD

Applied in `prd.md`:

- **§8 Security** — the session-token NFR is amended (§2.1), with CSP, sanitised rendering of stored
  content, and refresh-token rotation added as compensating requirements. Recorded as assumption 13.
- **FR-38** — version visible in the UI, Settings only (§8.2).
- **FR-39** — every Task has a Project or a Due Date (§3.1). New cross-surface rule; also amends
  FR-11, FR-20 and FR-35, each of which previously described clearing a date as unconditional.
- **FR-3** — Settings gains the About/version row, partly answering Open Q5.
- **§6.2** — note attachments listed explicitly as v2, so "file storage for notes" is not mistaken
  for something already specified.

Resolved and closed:

- **Q12 (orphan task)** → FR-39. The state is made unrepresentable rather than given a surface.
- **Q13 (note attachments)** → v2, with Notes. **v1 therefore needs no object storage at all.**
- **Q14 (version elsewhere)** → no. Settings only.

Still open, with what this architecture contributes:

- **Q7 (categories)** — a seeded `categories` table rather than a hard-coded enum, so "fixed list vs
  user-created" can be answered later without a migration.
- **Q6 (search scope)** — spanning projects as well as tasks is one `tsvector` query (§4.3).
  Effectively free; recommend yes.
- **Q11 (data export)** — an afternoon against this schema. The PRD flags it as cheap insurance;
  it's cheaper still.
- **Q3 (closing registration)** — Supabase Auth config, not code.
- **Q8 (project lifecycle)** — untouched, but FR-39 gives it a new edge: deleting or archiving a
  project must not orphan its undated tasks (§3.1).

---

## 12. Revision History

*This document is versioned. Any change to it bumps `version` in the frontmatter — see
`CLAUDE.md` § Document versioning for the rule.*

| Version | Date | Change |
|---|---|---|
| 1.1.0 | 2026-08-25 | Minor — §6.2 and §2.2: the client-facing key is the Supabase **publishable** key (`sb_publishable_…`, `VITE_SUPABASE_PUBLISHABLE_KEY`) rather than the legacy JWT `anon` key, which is deprecated by end of 2026; secret-key naming updated to include `sb_secret_…`. No other decision changed. |
| 1.0.1 | 2026-08-21 | Patch — §9 only. `AGENTS.md` collapsed to a pointer at both levels; repository layout and the note beneath it updated to match. No decision changed. |
| 1.0.0 | 2026-08-21 | Initial architecture. Supabase over AWS; TypeScript end to end with no hand-written backend; PostgREST + RLS; Cloudflare Pages; TanStack Query with offline persistence; Vitest, pgTAP and Playwright; local/dev/prod on `feature → develop → main`; GitHub Actions for CI/CD; release-please for versioning. |

*Drafts preceding 1.0.0 are in git history (a C# API on Fly.io, later dropped; a trunk-based
single-`main` flow, later replaced by the model in §6.1). They were never released under a version
number and are recorded here only so the reversals are not mistaken for oversights.*
