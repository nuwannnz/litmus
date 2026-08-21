---
title: Epics — Litmus
version: 1.0.0
status: proposed
created: 2026-08-21
updated: 2026-08-21
requires: docs/prd.md >= 2.0.0, docs/architecture.md >= 1.0.1
---

# Delivery Plan: Litmus MVP

The work between the repository as it stands today and PRD §6.1 shipping as `1.0.0`:
**13 epics, 96 stories, six releases.**

`prd.md` says **what** and `architecture.md` says **how**; this document says **in what
order and in what slices**. Where the three disagree, `prd.md` wins, then
`architecture.md`, then this file — and the disagreement is a bug in this file, to be
fixed here rather than worked around in code.

## 1. How this plan is managed

Split by what changes:

| | Lives in | Why |
|---|---|---|
| **Shape** — epics, sequence, milestones, FR traceability, the decisions still owed | **this file** | Changes rarely. Benefits from review in a PR, belongs beside the PRD it traces to, and is greppable from the code that implements it. |
| **Detail** — a story's acceptance criteria, dependencies, design-frame references | **[GitHub Issues](https://github.com/nuwannnz/litmus/issues)**, one per story | Read while doing the work, not while planning it. Accumulates working notes, links to the PR that closed it, and the discussion that changed it. |
| **State** — in progress, blocked, shipped | **Issues + the project board** | Changes daily. Status tracked in markdown goes stale within a week and then quietly lies. |

So **this file records no acceptance criteria and no status** — no checkboxes, no done
column. Each story below links to its issue; the issue carries the detail and links back
here. Issues are titled by story ID (`S-6.3 Inline add per day column`), labelled
`epic:*` and `size:*`, and milestoned to their release, so the story ID is the join key
between the two.

When a story's *shape* changes — it moves epic, splits, or is dropped — this file changes
and its version bumps. When its *detail* or *state* changes, only the issue moves.

### 1.1 Working agreement

- **One story = one feature branch = one PR.** Cut from `develop`, merged by PR, one
  approval. A story too big for one PR is two stories.
- **Conventional Commits, with the FR in the body.** `feat(week): inline add per day
  column` … `Implements FR-11. Closes #44.` The prefix is load-bearing — release-please
  derives the version from it.
- **Tests name their requirement**: `it('FR-35: a task given a due date appears in that
  day column', …)`, per architecture §7.5. Requirement coverage then greps.
- **Definition of done**, every story: acceptance criteria met; unit tests for the logic
  and pgTAP for anything touching schema or policy; both themes checked if it renders;
  usable at 390 px and 1600 px if it renders; typecheck, lint and CI green; docs touched
  if the story changed a documented fact.
- **A story that needs a PRD decision does not start.** It carries `blocked-on-decision`,
  it is listed in §7, and the decision is made in `prd.md` first. Guessing at a
  requirement and building it is how the PRD stops being true.
- **Sizes** are **S** ≈ half a day, **M** ≈ 1–2 days, **L** ≈ 3+ days, at hobby-project
  pace.

## 2. Where the work actually starts

This is not greenfield, and mis-reading the starting line is the fastest way to mis-size
it. As of 2026-08-21:

**Built** — an Nx workspace (~6,100 lines of TypeScript) with a complete in-memory
prototype: `apps/web` (routing, shell, auth screens, landing page, command palette),
`libs/ui` (21 tokens, ~21 primitives, theming, toasts), `libs/domain` (types, seed data,
date helpers), `libs/core` (workspace reducer, module contract, command registry),
`libs/week`, `libs/projects`, `libs/notes`. A `ci.yml` that installs, typechecks and
builds.

**Not built** — anything below the UI. No `supabase/` directory, no schema, no RLS, no
`libs/api`, no test runner of any kind, no Settings surface, no deploy workflow, no hosted
environment. `AuthProvider` accepts any credentials and writes a fake user to
`localStorage`. State is a reducer over `structuredClone`d seed data.

**Three deltas between the code and the PRD**, each needing a decision rather than a patch
(§7):

1. `libs/domain` has **two** task types, `Task` and `ProjectTask`. Architecture §3.1 is
   explicit that this cannot survive into the schema, because FR-35 makes it
   contradictory. S-3.3 is the story, and much of EP-6…EP-10 assumes it has happened.
2. The **Notes module ships enabled** in `APP_MODULES` and renders a full editor. Notes is
   v2 in its entirety (PRD §6.2) and FR-1 requires the nav item render *disabled*.
3. The **landing page and command palette are both explicit non-goals** (PRD §5) and both
   exist in `apps/web`. Neither is harmful; both are unowned scope that no FR covers.

So the shape of this plan is **build the missing bottom half, then migrate the existing
top half onto it, surface by surface** — not "build the app".

## 3. The epics

| ID | Epic | Stories | Realises | Milestone |
|---|---|---|---|---|
| [EP-1](#ep-1--delivery-foundations) | Delivery foundations | 5 | arch §7 | 0.1.0 |
| [EP-2](#ep-2--data-foundation) | Data foundation — schema, RLS, pgTAP | 12 | arch §3, §7.3 | 0.1.0 |
| [EP-3](#ep-3--data-layer) | Data layer — `libs/api` and the unified task | 8 | FR-8, arch §5.1 | 0.2.0 |
| [EP-4](#ep-4--account-and-authentication) | Account and authentication | 8 | FR-4…FR-8 | 0.2.0 |
| [EP-5](#ep-5--shell-theming-and-settings) | Shell, theming and Settings | 6 | FR-1, FR-2, FR-3, FR-38 | 0.2.0 |
| [EP-6](#ep-6--week-board) | Week Board | 8 | FR-9…FR-16 | 0.3.0 |
| [EP-7](#ep-7--task-detail) | Task Detail | 8 | FR-13, FR-17…FR-22 | 0.3.0 |
| [EP-8](#ep-8--projects-dashboard) | Projects dashboard | 6 | FR-23…FR-27 | 0.4.0 |
| [EP-9](#ep-9--project-detail) | Project Detail | 7 | FR-28…FR-34 | 0.4.0 |
| [EP-10](#ep-10--cross-surface-invariants) | Cross-surface invariants | 5 | FR-35…FR-37, FR-39 | 0.3.0 |
| [EP-11](#ep-11--sync) | Sync — offline and realtime | 6 | FR-8, §8 | 0.5.0 |
| [EP-12](#ep-12--hardening) | Hardening — a11y, security, performance, E2E | 9 | §8 NFRs | 1.0.0 |
| [EP-13](#ep-13--environments-and-release) | Environments and release | 8 | arch §6, §8 | 0.1.0 → 1.0.0 |

Story tables below list ID, title, size and issue. **Acceptance criteria live in the
issue.**

---

### EP-1 — Delivery foundations

**Goal:** a test runner and a linter exist before any code is written that would otherwise
be written untested. Architecture §10 step 3: "Vitest, before any new feature code."

**Exit criteria:** `npm test` and `nx lint` run green locally and in CI on `nx affected`.

| Story | | Size | Issue |
|---|---|---|---|
| S-1.1 | Vitest configured on `libs/domain` | S | [#3](https://github.com/nuwannnz/litmus/issues/3) |
| S-1.2 | Testing Library + jsdom for the component libs | S | [#4](https://github.com/nuwannnz/litmus/issues/4) |
| S-1.3 | Lint and format baseline | S | [#5](https://github.com/nuwannnz/litmus/issues/5) |
| S-1.4 | CI runs the test suite, on `nx affected` | S | [#6](https://github.com/nuwannnz/litmus/issues/6) |
| S-1.5 | `src/client/CLAUDE.md` records the real commands | S | [#7](https://github.com/nuwannnz/litmus/issues/7) |

---

### EP-2 — Data foundation

**Goal:** the schema, its policies, and the tests that prove them. RLS is the entire
security model (architecture §2.2) — a missing policy is a data breach, not a bug.

**Exit criteria:** `supabase start` gives a fresh clone a working backend; every table has
RLS enabled and a pgTAP isolation test; FR-39 holds at the data layer; CI runs the
database suite.

| Story | | Size | Issue |
|---|---|---|---|
| S-2.1 | `supabase init` and the local stack | M | [#8](https://github.com/nuwannnz/litmus/issues/8) |
| S-2.2 | Core schema migration, RLS enabled in the same file | L | [#9](https://github.com/nuwannnz/litmus/issues/9) |
| S-2.3 | `tasks_have_a_home` check constraint | S | [#10](https://github.com/nuwannnz/litmus/issues/10) |
| S-2.4 | Cross-cutting schema rules | M | [#11](https://github.com/nuwannnz/litmus/issues/11) |
| S-2.5 | `project_stats` view | S | [#12](https://github.com/nuwannnz/litmus/issues/12) |
| S-2.6 | `search_all(query text)` RPC | M | [#13](https://github.com/nuwannnz/litmus/issues/13) |
| S-2.7 | `changes_since(cursor timestamptz)` RPC | S | [#14](https://github.com/nuwannnz/litmus/issues/14) |
| S-2.8 | `pg_cron` purge of soft-deleted rows | S | [#15](https://github.com/nuwannnz/litmus/issues/15) |
| S-2.9 | `seed.sql` ported from `libs/domain` | M | [#16](https://github.com/nuwannnz/litmus/issues/16) |
| S-2.10 | **pgTAP: RLS isolation, one test per table** | L | [#17](https://github.com/nuwannnz/litmus/issues/17) |
| S-2.11 | pgTAP: constraints, triggers, view invoker | M | [#18](https://github.com/nuwannnz/litmus/issues/18) |
| S-2.12 | CI runs pgTAP against a local stack | M | [#19](https://github.com/nuwannnz/litmus/issues/19) |

> **S-2.10 blocks all of EP-3.** Prove the policies while the schema is five tables and
> the tests are trivial to write.

---

### EP-3 — Data layer

**Goal:** `libs/api`, the generated types, and the largest client refactor in the plan —
TanStack Query replaces the workspace reducer for server state.

**Exit criteria:** the schema is the contract (a renamed column fails typecheck); every
mutation is a partial; no feature module imports `supabase-js`; the reducer no longer holds
server state.

| Story | | Size | Issue |
|---|---|---|---|
| S-3.1 | Create `libs/api` | M | [#20](https://github.com/nuwannnz/litmus/issues/20) |
| S-3.2 | Generated types, with a CI no-diff check | S | [#21](https://github.com/nuwannnz/litmus/issues/21) |
| S-3.3 | **Merge `Task` and `ProjectTask` into one type** | L | [#22](https://github.com/nuwannnz/litmus/issues/22) |
| S-3.4 | TanStack Query provider and key conventions | M | [#23](https://github.com/nuwannnz/litmus/issues/23) |
| S-3.5 | A mutation surface that only accepts partials | M | [#24](https://github.com/nuwannnz/litmus/issues/24) |
| S-3.6 | Client-generated UUIDv7 primary keys | S | [#25](https://github.com/nuwannnz/litmus/issues/25) |
| S-3.7 | Retire the workspace reducer for server state | L | [#26](https://github.com/nuwannnz/litmus/issues/26) |
| S-3.8 | Test harness for `libs/api` | M | [#27](https://github.com/nuwannnz/litmus/issues/27) |

> **S-3.3 blocks EP-6, EP-9 and EP-10.** Migrating a surface onto the split model and
> re-migrating it later is the same work twice.

---

### EP-4 — Account and authentication

**Goal:** one Account, existing to move data between the desk and the phone — not the
foundation of a permission model it will never need.

**Exit criteria:** sign-in, registration and reset work against real auth; errors are
non-enumerating; refresh tokens rotate with reuse detection.

| Story | | Size | Issue |
|---|---|---|---|
| S-4.1 | Real sessions replace the fake `AuthProvider` | M | [#28](https://github.com/nuwannnz/litmus/issues/28) |
| S-4.2 | Sign in (FR-5) | M | [#29](https://github.com/nuwannnz/litmus/issues/29) |
| S-4.3 | Register (FR-4) | S | [#30](https://github.com/nuwannnz/litmus/issues/30) |
| S-4.4 | Password reset (FR-6) | M | [#31](https://github.com/nuwannnz/litmus/issues/31) |
| S-4.5 | Close registration after the first Account ⚠️ | S | [#32](https://github.com/nuwannnz/litmus/issues/32) |
| S-4.6 | Google and Apple sign-in (FR-7) ⚠️ | M | [#33](https://github.com/nuwannnz/litmus/issues/33) |
| S-4.7 | Sign-out clears local data on the device | S | [#34](https://github.com/nuwannnz/litmus/issues/34) |
| S-4.8 | Refresh-token rotation with reuse detection | S | [#35](https://github.com/nuwannnz/litmus/issues/35) |

⚠️ = blocked on a decision in §7.

---

### EP-5 — Shell, theming and Settings

**Goal:** the frame around every signed-in surface, and the Settings screen the PRD infers
but the design file never drew.

**Exit criteria:** the rail matches FR-1 including a disabled Notes item; theme lives on
the Account; Settings exists and shows the running version.

| Story | | Size | Issue |
|---|---|---|---|
| S-5.1 | Rail: Settings entry, Notes disabled | S | [#36](https://github.com/nuwannnz/litmus/issues/36) |
| S-5.2 | Mobile bottom tab bar | M | [#37](https://github.com/nuwannnz/litmus/issues/37) |
| S-5.3 | Theme preference stored on the Account | M | [#38](https://github.com/nuwannnz/litmus/issues/38) |
| S-5.4 | Settings screen (FR-3) ⚠️ | M | [#39](https://github.com/nuwannnz/litmus/issues/39) |
| S-5.5 | About row: version, SHA, build date (FR-38) | S | [#40](https://github.com/nuwannnz/litmus/issues/40) |
| S-5.6 | Decide the fate of the landing page and command palette | S | [#41](https://github.com/nuwannnz/litmus/issues/41) |

---

### EP-6 — Week Board

**Goal:** the default surface and the product's centre of gravity, on real data.
Architecture §10 step 5: migrate this one surface first — it reveals every problem in the
pattern at a tenth of the cost of finding them in three.

**Exit criteria:** UJ-1 works end to end against Postgres; the board is usable full, empty
and on a phone.

| Story | | Size | Issue |
|---|---|---|---|
| S-6.1 | **Week query from real data** (FR-9) | M | [#42](https://github.com/nuwannnz/litmus/issues/42) |
| S-6.2 | Week navigation (FR-10) | S | [#43](https://github.com/nuwannnz/litmus/issues/43) |
| S-6.3 | Inline add per day column (FR-11) | M | [#44](https://github.com/nuwannnz/litmus/issues/44) |
| S-6.4 | Global "New Task" with a home guard (FR-11, FR-39) | M | [#45](https://github.com/nuwannnz/litmus/issues/45) |
| S-6.5 | Task Card parity (FR-12) | S | [#46](https://github.com/nuwannnz/litmus/issues/46) |
| S-6.6 | Full and empty extremes (FR-14) | S | [#47](https://github.com/nuwannnz/litmus/issues/47) |
| S-6.7 | Mobile date pills (FR-15) | M | [#48](https://github.com/nuwannnz/litmus/issues/48) |
| S-6.8 | Task search (FR-16) ⚠️ | M | [#49](https://github.com/nuwannnz/litmus/issues/49) |

> **S-6.1 precedes S-3.7.** Retiring the reducer before one surface has been migrated is
> committing to a pattern that hasn't been tried.

---

### EP-7 — Task Detail

**Goal:** everything about one task, in one place, editable in place. One component
reflowed — not two screens: the mobile frame `I33L1Q` is a `ref` instance of the desktop
`A8V5X` overriding only the close icon.

**Exit criteria:** UJ-2 works end to end; every field in FR-20 edits and persists;
deletion confirms.

| Story | | Size | Issue |
|---|---|---|---|
| S-7.1 | Open from the board as a right-side overlay (FR-13, FR-17) | M | [#50](https://github.com/nuwannnz/litmus/issues/50) |
| S-7.2 | Title and description, edited in place (FR-18) | S | [#51](https://github.com/nuwannnz/litmus/issues/51) |
| S-7.3 | Status segmented control (FR-19) | S | [#52](https://github.com/nuwannnz/litmus/issues/52) |
| S-7.4 | Metadata rows (FR-20) | L | [#53](https://github.com/nuwannnz/litmus/issues/53) |
| S-7.5 | Subtasks (FR-21) | M | [#54](https://github.com/nuwannnz/litmus/issues/54) |
| S-7.6 | Mark complete and delete (FR-22) | S | [#55](https://github.com/nuwannnz/litmus/issues/55) |
| S-7.7 | Mobile full-screen sheet (FR-17) | S | [#56](https://github.com/nuwannnz/litmus/issues/56) |
| S-7.8 | Remove the Linked Notes section for v1 | S | [#57](https://github.com/nuwannnz/litmus/issues/57) |

---

### EP-8 — Projects dashboard

**Goal:** the collection view over all Projects, and the creation flow that can seed a
Project with its first Tasks in one pass.

**Exit criteria:** UJ-3 works end to end; Progress is derived everywhere it appears.

| Story | | Size | Issue |
|---|---|---|---|
| S-8.1 | Dashboard grid from `project_stats` (FR-23) | M | [#58](https://github.com/nuwannnz/litmus/issues/58) |
| S-8.2 | Grid/list toggle, persisted (FR-24) | S | [#59](https://github.com/nuwannnz/litmus/issues/59) |
| S-8.3 | New Project modal with starter tasks (FR-25) | L | [#60](https://github.com/nuwannnz/litmus/issues/60) |
| S-8.4 | Projects empty state (FR-26) | S | [#61](https://github.com/nuwannnz/litmus/issues/61) |
| S-8.5 | Project search (FR-27) | S | [#62](https://github.com/nuwannnz/litmus/issues/62) |
| S-8.6 | Responsive fallback for the dashboard and list ⚠️ | M | [#63](https://github.com/nuwannnz/litmus/issues/63) |

---

### EP-9 — Project Detail

**Goal:** one Project's Tasks in two lenses, behind a header carrying derived stats.

**Exit criteria:** UJ-4 works end to end on desktop and phone; every drag has a non-drag
equivalent.

| Story | | Size | Issue |
|---|---|---|---|
| S-9.1 | Header and derived stats (FR-28) | M | [#64](https://github.com/nuwannnz/litmus/issues/64) |
| S-9.2 | Board/list switch, persisted per project (FR-29) | S | [#65](https://github.com/nuwannnz/litmus/issues/65) |
| S-9.3 | Board with drag-and-drop (FR-30) | L | [#66](https://github.com/nuwannnz/litmus/issues/66) |
| S-9.4 | List view rows (FR-31) | M | [#67](https://github.com/nuwannnz/litmus/issues/67) |
| S-9.5 | Project sidebar (FR-32) | S | [#68](https://github.com/nuwannnz/litmus/issues/68) |
| S-9.6 | Add a task within a project (FR-33) | M | [#69](https://github.com/nuwannnz/litmus/issues/69) |
| S-9.7 | Mobile project board (FR-34) | L | [#70](https://github.com/nuwannnz/litmus/issues/70) |

---

### EP-10 — Cross-surface invariants

**Goal:** the behaviours that make Litmus one product rather than two. Not screens — and
the requirements most likely to be violated by building surfaces independently.

**Exit criteria:** every story here is tested at the boundary between two surfaces; FR-39
is unreachable from the UI and impossible in the database.

| Story | | Size | Issue |
|---|---|---|---|
| S-10.1 | Due date drives Week Board membership (FR-35) | M | [#71](https://github.com/nuwannnz/litmus/issues/71) |
| S-10.2 | One status model (FR-36) | S | [#72](https://github.com/nuwannnz/litmus/issues/72) |
| S-10.3 | Categories consistent and flat (FR-37) | S | [#73](https://github.com/nuwannnz/litmus/issues/73) |
| S-10.4 | **FR-39 guard in the client** | M | [#74](https://github.com/nuwannnz/litmus/issues/74) |
| S-10.5 | The constraint error never reaches the user (FR-39) | S | [#75](https://github.com/nuwannnz/litmus/issues/75) |

> **S-10.4 blocks S-6.4 and S-7.4.** The constraint is the backstop, not the UX.

---

### EP-11 — Sync

**Goal:** the app is usable offline and the same on every device. Architecture §10 step 7:
after the online path is solid — doing it earlier means debugging two unfinished things at
once.

**Exit criteria:** UJ-5 works; a week spent offline loses nothing; a change on one device
reaches another within seconds.

| Story | | Size | Issue |
|---|---|---|---|
| S-11.1 | Offline reads | M | [#76](https://github.com/nuwannnz/litmus/issues/76) |
| S-11.2 | Offline writes | L | [#77](https://github.com/nuwannnz/litmus/issues/77) |
| S-11.3 | Handle a 401 during queue drain | M | [#78](https://github.com/nuwannnz/litmus/issues/78) |
| S-11.4 | Realtime | M | [#79](https://github.com/nuwannnz/litmus/issues/79) |
| S-11.5 | `changes_since` on reconnect | M | [#80](https://github.com/nuwannnz/litmus/issues/80) |
| S-11.6 | Optimistic-everything audit | S | [#81](https://github.com/nuwannnz/litmus/issues/81) |

---

### EP-12 — Hardening

**Goal:** the NFRs in PRD §8, treated as work rather than as hopes.

**Exit criteria:** AA contrast verified in both themes; strict CSP served; journeys and
offline-reconnect covered by Playwright; no horizontal scroll anywhere from 390 px to
1600 px.

| Story | | Size | Issue |
|---|---|---|---|
| S-12.1 | WCAG AA contrast, verified in both themes | M | [#82](https://github.com/nuwannnz/litmus/issues/82) |
| S-12.2 | A non-drag equivalent for every drag | S | [#83](https://github.com/nuwannnz/litmus/issues/83) |
| S-12.3 | Strict CSP on every page | M | [#84](https://github.com/nuwannnz/litmus/issues/84) |
| S-12.4 | CI guard: no privileged key in a `VITE_` var | S | [#85](https://github.com/nuwannnz/litmus/issues/85) |
| S-12.5 | Week Board warm load under one second | S | [#86](https://github.com/nuwannnz/litmus/issues/86) |
| S-12.6 | `apps/web-e2e` | M | [#87](https://github.com/nuwannnz/litmus/issues/87) |
| S-12.7 | Journey specs UJ-1…UJ-5 | L | [#88](https://github.com/nuwannnz/litmus/issues/88) |
| S-12.8 | Offline-and-reconnect E2E | M | [#89](https://github.com/nuwannnz/litmus/issues/89) |
| S-12.9 | Responsive sweep, 390 px to 1600 px | S | [#90](https://github.com/nuwannnz/litmus/issues/90) |

---

### EP-13 — Environments and release

**Goal:** three environments each owned by exactly one branch, and a version derived from
commits rather than remembered.

**Exit criteria:** `develop` and `main` deploy themselves, migrations first; release-please
owns the version; `1.0.0` is cut when PRD §6.1 is complete.

| Story | | Size | Milestone | Issue |
|---|---|---|---|---|
| S-13.1 | Hosted Supabase projects and scoped secrets | M | 0.1.0 | [#91](https://github.com/nuwannnz/litmus/issues/91) |
| S-13.2 | `deploy-dev.yml` | M | 0.5.0 | [#92](https://github.com/nuwannnz/litmus/issues/92) |
| S-13.3 | `deploy-prod.yml` | M | 0.5.0 | [#93](https://github.com/nuwannnz/litmus/issues/93) |
| S-13.4 | `release-please.yml` | S | 0.1.0 | [#94](https://github.com/nuwannnz/litmus/issues/94) |
| S-13.5 | Back-merge `main` → `develop` after every release | S | 1.0.0 | [#95](https://github.com/nuwannnz/litmus/issues/95) |
| S-13.6 | Keep the dev Supabase project unpaused | S | 1.0.0 | [#96](https://github.com/nuwannnz/litmus/issues/96) |
| S-13.7 | Custom domain and TLS | S | 1.0.0 | [#97](https://github.com/nuwannnz/litmus/issues/97) |
| S-13.8 | Cut `1.0.0` | S | 1.0.0 | [#98](https://github.com/nuwannnz/litmus/issues/98) |

---

## 4. Milestones

Releases, not dates. Each is a `develop` → `main` PR.

| Version | Theme | Contains | Done when |
|---|---|---|---|
| **0.1.0** | Foundations | EP-1, EP-2, S-13.1, S-13.4 | The schema exists, RLS is proven by pgTAP in CI, and a version can be cut. |
| **0.2.0** | Signed in for real | EP-3, EP-4, EP-5 | Sign-in reaches a real database; Settings shows the running version. |
| **0.3.0** | The week is real | EP-6, EP-7, EP-10 | UJ-1 and UJ-2 work end to end against Postgres. |
| **0.4.0** | Projects are real | EP-8, EP-9 | UJ-3 and UJ-4 work end to end; the reducer is gone. |
| **0.5.0** | Synced | EP-11, S-13.2, S-13.3 | UJ-5 works: plan on the phone, execute at the desk. |
| **1.0.0** | Hardened | EP-12, S-13.5…S-13.8 | PRD §6.1 is complete and every FR has a test naming it. |

### 4.1 Critical path

```
S-2.1 → S-2.2 → S-2.10 → S-3.1 → S-3.2 → S-3.3 → S-3.4 → S-6.1 → S-3.7 → EP-7/8/9 → EP-11 → EP-12
```

Everything else parallelises around it. Three sequencing rules, stated because breaking
them is expensive rather than merely untidy:

- **S-2.10 (RLS isolation tests) gates all client work.** Prove the policies while the
  schema is five tables and the tests are trivial to write.
- **S-3.3 (one task type) precedes every surface migration.**
- **S-6.1 precedes S-3.7.** One surface proves the pattern before the reducer is retired.

## 5. What is deliberately not in this plan

Restated from PRD §5 and §6.2 so the plan can't quietly grow them:

- **The entire Notes surface — v2.** Four fully-specified frames wait; `libs/notes` already
  contains a working editor. S-5.1 disables the nav item; nothing else here touches it. The
  Link Note Modal spec is preserved in `prd-addendum.md` §D so v2 doesn't re-derive it.
- **Note attachments and object storage — v2.** v1 provisions no bucket and writes no
  Storage code at all.
- **All collaboration.** No members, invitations, sharing, permissions, comments or activity
  feed. The Members chip reads `1` and the Team column shows one avatar, both to preserve
  designed layouts.
- **Marketing, monetization, integrations, notifications, AI, recurring tasks, dependencies,
  time tracking, import/export.**
- **Command palette and keyboard shortcuts.** Deferred, and when built, designed as one
  coherent layer rather than accreted per surface. The existing implementation is unowned —
  see S-5.6.
- **Dark theme for the three auth screens.** Drawn light-only; exempt from FR-2 parity in
  v1 (PRD Q2).

Two items the PRD flags as worth revisiting sooner than the rest, neither scheduled here:
**data export** (Q11 — "roughly an afternoon against the planned schema", and the cheapest
insurance against the product dying with its database) and **note linking**, the part of
the concept the mock landing page leads with.

## 6. Traceability

Every FR in PRD §4 maps to at least one story:

| FR | Stories | | FR | Stories |
|---|---|---|---|---|
| FR-1 | S-5.1, S-5.2 | | FR-21 | S-7.5 |
| FR-2 | S-5.3, S-12.1 | | FR-22 | S-7.6 |
| FR-3 | S-5.4 | | FR-23 | S-8.1 |
| FR-4 | S-4.3 | | FR-24 | S-8.2 |
| FR-5 | S-4.1, S-4.2 | | FR-25 | S-8.3 |
| FR-6 | S-4.4 | | FR-26 | S-8.4 |
| FR-7 | S-4.6 | | FR-27 | S-8.5, S-2.6 |
| FR-8 | S-3.5, S-4.7, EP-11 | | FR-28 | S-2.5, S-9.1 |
| FR-9 | S-6.1 | | FR-29 | S-9.2 |
| FR-10 | S-6.2 | | FR-30 | S-9.3 |
| FR-11 | S-6.3, S-6.4 | | FR-31 | S-9.4 |
| FR-12 | S-6.5 | | FR-32 | S-9.5 |
| FR-13 | S-7.1 | | FR-33 | S-9.6 |
| FR-14 | S-6.6 | | FR-34 | S-9.7 |
| FR-15 | S-6.7 | | FR-35 | S-10.1, S-2.2 |
| FR-16 | S-6.8, S-2.6 | | FR-36 | S-10.2 |
| FR-17 | S-7.1, S-7.7 | | FR-37 | S-10.3 |
| FR-18 | S-7.2 | | FR-38 | S-5.5 |
| FR-19 | S-7.3 | | FR-39 | S-2.3, S-10.4, S-10.5 |
| FR-20 | S-7.4 | | | |

## 7. Decisions needed before their story starts

Six stories are blocked on a question the PRD leaves open, and two gaps have no FR at all.
None blocks the critical path, but each blocks its own story — and the cheapest moment to
answer most of them is now. Blocked issues carry the `blocked-on-decision` label.

| # | Question | Blocks | Note |
|---|---|---|---|
| Q1 | Is social sign-in real? | S-4.6 | Dropping is free today and costly later. Removing the buttons and the "or" divider leaves a coherent form. |
| Q3 | What happens to the register route after the one Account exists? | S-4.5 | Supabase Auth config, not code. Disabled, hidden, or unlinked. |
| Q4 | Mobile design for the Projects dashboard and list | S-8.6 | No frame exists. Is the responsive fallback acceptable to start? |
| Q5 / Q9 | Settings scope, and whether week start day is configurable at all | S-5.4 | No frame exists. Every design frame shows Mon–Sun; configurability may be inventing a requirement. |
| Q6 | Task search results presentation, and whether search spans projects | S-6.8 | Architecture recommends yes on scope — one `tsvector` query, effectively free. Presentation is still undesigned. |
| Q7 | Where do categories come from — fixed list or user-created? | none | S-2.2's seeded table defers this without a migration. Not blocking. |
| Q8 | Project lifecycle: can a project be archived or completed? | S-9.5 partially | **FR-39 gives this a new edge**: deleting or archiving a project must not orphan its undated tasks. Either cascade the soft delete or require they be dated first. |
| — | **Project deletion is unspecified.** | S-9.5 | No FR covers it, but the project card carries an overflow menu that implies it. Needs an FR before it's built. |
| — | **The landing page and command palette exist but are non-goals.** | S-5.6 | Keep, delete, or write the FRs. Currently unowned code that no requirement justifies. |

Answering Q1, Q3, Q5 and Q9 is a fifteen-minute exercise that unblocks four stories; Q4 and
Q6 need design time. Whatever is decided goes into `prd.md` with a version bump, not into
this file — the PRD stays the source of truth.

## 8. Revision History

*This document is versioned by the same convention as `prd.md` and `architecture.md`,
though CLAUDE.md's mandatory bump rule names only those two.*

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-08-21 | Initial delivery plan. 13 epics, 96 stories (issues [#3](https://github.com/nuwannnz/litmus/issues/3)–[#98](https://github.com/nuwannnz/litmus/issues/98)), six milestones from `0.1.0` to `1.0.0`, traceability across FR-1…FR-39, and nine decisions blocking specific stories. Written against `prd.md` 2.0.0 and `architecture.md` 1.0.1. |
