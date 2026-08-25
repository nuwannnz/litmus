# Sprints

| **Purpose**         | One-week planning slices inside the release milestones                   |
| ------------------- | ------------------------------------------------------------------------ |
| **Source of truth** | [`docs/epics.md`](epics.md) — story IDs, acceptance criteria, milestones |
| **Tracking**        | GitHub Projects board "Litmus delivery", `Sprint` field                  |

---

## 1. Working agreement

- **Cadence:** one week, Monday 00:00 → Sunday 23:59.
- **Capacity:** ~4.5 story-days per sprint (S ≈ ½ day, M ≈ 1¼ days, L ≈ 3 days),
  leaving deliberate buffer — estimates slip, sprints shouldn't.
- **Milestones stay releases.** A sprint may finish a milestone early or spill into
  the next; the milestone is _done_ when its exit criteria in `docs/epics.md` §4 are
  met, not when its last sprint ends.
- **Sequencing** follows `docs/epics.md` §4.1: S-2.10 gates all client work,
  S-3.3 precedes every surface migration, and **S-6.1 was pulled forward ahead of
  S-3.7** so one surface proves the pattern before the reducer is retired.
- **Blocked-on-decision stories** (S-5.6, S-6.8, S-8.6) sit in their slot but need
  their §7 decision resolved before the sprint starts, not during it.
- Stories carry over, never silently drop: if a sprint ends with unfinished work it
  becomes the first item of the next one.

## 2. The sprints

Start dates assume Sprint 1 begins Monday **2026-08-31**. Total: 26 sprints,
~95 story-days of open scope, landing `1.0.0` around **2027-02-28**.

### Milestone 0.1.0 Foundations — finish the bottom half

| Sprint | Starts     | Stories                                                                                                                                     | Days |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1      | 2026-08-31 | ~~S-13.1 hosted Supabase + scoped secrets~~ _(carried over — see §3)_ · ✅ S-2.7 changes_since · ✅ S-2.8 pg_cron purge · ✅ S-2.9 seed.sql | 3.5  |
| 2      | 2026-09-07 | ✅ S-2.10 pgTAP RLS isolation (**gates everything**) · ✅ S-2.11 pgTAP constraints/triggers/view                                            | 4.25 |
| 3      | 2026-09-14 | ✅ S-2.12 CI runs pgTAP _(done early)_ · ✅ S-3.1 libs/api · ✅ S-3.2 generated types + no-diff check                                       | 3.0  |

### Milestone 0.2.0 Signed in for real

| Sprint | Starts     | Stories                                                                                                  | Days |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------- | ---- |
| 4      | 2026-09-21 | ✅ S-3.3 merge Task and ProjectTask (**precedes every surface migration**) · ✅ S-3.6 UUIDv7 keys         | 3.5  |
| 5      | 2026-09-28 | S-3.4 TanStack Query provider · S-3.8 libs/api test harness · S-3.5 partial mutations                    | 3.75 |
| 6      | 2026-10-05 | S-6.1 week query from real data (**pulled forward from 0.3.0**) · S-4.1 real sessions · S-4.3 register   | 3.0  |
| 7      | 2026-10-12 | S-3.7 retire the workspace reducer · S-5.1 rail: Settings entry, Notes disabled                          | 3.5  |
| 8      | 2026-10-19 | S-4.2 sign in · S-4.4 password reset · S-4.5 close registration · S-4.7 sign-out clears local data       | 3.5  |
| 9      | 2026-10-26 | S-4.6 Google and Apple sign-in · S-4.8 refresh-token rotation · S-5.3 theme on Account · S-5.5 about row | 3.5  |
| 10     | 2026-11-02 | S-5.2 mobile tab bar · S-5.4 Settings screen · S-5.6 landing/palette decision                            | 3.0  |

### Milestone 0.3.0 The week is real

| Sprint | Starts     | Stories                                                                                                                         | Days |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 11     | 2026-11-09 | S-6.2 week navigation · S-6.3 inline add · S-6.5 task card parity · S-10.2 one status model · S-10.3 flat categories            | 3.25 |
| 12     | 2026-11-16 | S-6.4 New Task home guard · S-6.6 full/empty extremes · S-7.1 right-side overlay · S-7.2 title/description in place             | 3.5  |
| 13     | 2026-11-23 | S-7.3 status segmented control · S-7.4 metadata rows                                                                            | 3.5  |
| 14     | 2026-11-30 | S-7.5 subtasks · S-7.6 complete/delete · S-7.7 mobile sheet · S-7.8 remove Linked Notes · S-10.1 due date drives Week Board     | 3.75 |
| 15     | 2026-12-07 | S-6.7 mobile date pills · S-10.4 FR-39 client guard · S-10.5 constraint error containment · S-6.8 task search _(decision owed)_ | 4.25 |

### Milestone 0.4.0 Projects are real

| Sprint | Starts     | Stories                                                                                                       | Days |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------- | ---- |
| 16     | 2026-12-14 | S-8.1 dashboard grid · S-8.2 grid/list toggle · S-8.4 empty state · S-8.5 project search · S-9.1 header/stats | 4.0  |
| 17     | 2026-12-21 | S-8.3 New Project modal · S-8.6 responsive fallback _(decision owed)_                                         | 4.25 |
| 18     | 2026-12-28 | S-9.2 board/list switch · S-9.3 drag-and-drop board · S-9.5 project sidebar                                   | 4.0  |
| 19     | 2027-01-04 | S-9.4 list view rows · S-9.6 add task within a project                                                        | 2.5  |
| 20     | 2027-01-11 | S-9.7 mobile project board                                                                                    | 3.0  |

### Milestone 0.5.0 Synced

| Sprint | Starts     | Stories                                                                                   | Days |
| ------ | ---------- | ----------------------------------------------------------------------------------------- | ---- |
| 21     | 2027-01-18 | S-11.2 offline writes · S-13.2 deploy-dev.yml                                             | 4.25 |
| 22     | 2027-01-25 | S-11.3 401 during queue drain · S-11.4 realtime · S-11.5 changes_since on reconnect       | 3.75 |
| 23     | 2027-02-01 | S-11.6 optimistic audit · S-13.3 deploy-prod.yml · S-12.6 apps/web-e2e _(pulled forward)_ | 3.0  |

### Milestone 1.0.0 Hardened

| Sprint | Starts     | Stories                                                                                                                   | Days |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------- | ---- |
| 24     | 2027-02-08 | S-12.1 WCAG AA contrast · S-12.2 non-drag equivalents · S-12.3 strict CSP · S-12.4 VITE_ secret guard · S-13.5 back-merge | 4.0  |
| 25     | 2027-02-15 | S-12.5 warm load under 1 s · S-12.7 journey specs UJ-1…UJ-5 · S-13.6 unpause guard                                        | 4.0  |
| 26     | 2027-02-22 | S-12.8 offline-reconnect E2E · S-12.9 responsive sweep · S-13.7 domain + TLS · **S-13.8 cut 1.0.0**                       | 2.75 |

## 3. Status as of 2026-08-25 (end of Sprint 4's work)

Tracked against GitHub issues and the "Litmus board" project (status **Done**):

- **Sprint 1 — mostly done.** S-2.7, S-2.8, S-2.9 are closed. **S-13.1 (hosted
  Supabase projects + scoped secrets) is still open** and carries into Sprint 3 per
  the working agreement; note S-2.10 gates all client work, so it takes priority.
- **Sprint 2 — complete.** S-2.10 and S-2.11 both closed.
- **Sprint 3 — complete** (finished early, 2026-08-25). S-2.12 closed with Sprint 2's
  work; S-3.1 delivered by PR #123 (`libs/api` and the Supabase client) and S-3.2 by
  PR #124 (committed `database.types.ts` plus the CI no-diff job). Milestone 0.1.0
  remains open only because **S-13.1 is still open** — it carries forward as the first
  item of the next sprint of work.
- **Sprint 4 — complete** (2026-08-25). S-3.3 delivered by PR #126 (one `Task` in
  `libs/domain`; the reducer's `projectTasks` table retired; Week and Project boards
  render the same objects) and S-3.6 by PR #127 (RFC 9562 `uuidv7()` minted at every
  create path). **S-13.1 still carries forward**, now into Sprint 5.
- **Completed outside this plan's sprints:** S-1.1–S-1.5 (tooling), S-2.1–S-2.6
  (schema foundation) — these predate the sprint cadence — and S-13.4
  release-please.yml, which was never slotted.

If reality disagrees with this document, fix the document in the same PR as the replan.

## 4. What changed vs. `docs/epics.md`

Two deliberate resequencings, both called out so they aren't mistaken for drift:

1. **S-6.1 moved from 0.3.0 into Sprint 6** — the critical path requires one surface
   on server state before S-3.7 retires the reducer; Week Board is that surface.
2. **S-12.6 moved from 1.0.0 into Sprint 23** — the E2E harness should exist before
   the hardening journey specs land, not alongside them.

Everything else stays inside its epic's milestone window. If reality disagrees with
this document, fix the document in the same PR as the replan.

---

_Plan of record: [`docs/epics.md`](epics.md) → §4. Definition of done:
[`docs/epics.md` §1.1](#11-working-agreement)._
