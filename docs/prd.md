---
title: Litmus
version: 2.0.0
status: final
created: 2026-08-19
updated: 2026-08-21
supersedes: the earlier design-derived screen inventory previously at docs/prd.md
design_source: docs/ui-design.pen (28 frames, verified 2026-08-19)
---

# PRD: Litmus

*A personal week planner with projects attached.*

## 0. Document Purpose

This PRD is the product definition for Litmus, written for the builder (nuwannnz) and for the downstream BMad workflows that consume it — UX, architecture, and epic/story breakdown. It is deliberately scoped to a **personal, single-user hobby product**, so it carries no compliance, ROI, or rollout sections.

It builds on two existing inputs rather than duplicating them:

- **`docs/ui-design.pen`** — the source design file (28 frames: 24 product screens, 2 reusable components, 1 marketing design study, 1 blank canvas artifact; 21 themed design tokens). It is the visual authority. Screen IDs from this file are cited inline against each feature so any requirement can be traced back to the frame that motivated it. All cited IDs were re-verified against the file on 2026-08-19.
- **An earlier design-derived screen inventory**, which previously occupied this file path and has been replaced by this document. It was a faithful catalogue of what the frames contain, but a design catalogue rather than a product definition: no vision, user, journeys, glossary, MVP cut, metrics, or NFRs. Everything in it was reconciled into this PRD before removal — its screen-ID index and token table now live in `prd-addendum.md` §B and §A respectively, in both cases more completely than the original held them.

Vocabulary is fixed by the **Glossary (§3)** — FRs, journeys, and metrics use those terms verbatim. Features are grouped by capability with FRs nested and numbered globally (FR-1 … FR-39) so the numbers survive reorganisation. Inferences are tagged `[ASSUMPTION]` inline and indexed in §11. Design-file mechanics, deferred specifications, and rejected-alternative rationale live in the companion **`prd-addendum.md`** in this same folder.

## 1. Vision

Planning a week and running a project are the same information looked at from two angles, but almost every tool forces you to pick one. Calendar apps know what day it is and nothing about what the work belongs to. Project tools know the shape of the work and have no opinion about your Thursday. So the work gets planned twice — once in the project tracker, once again in whatever list you actually look at each morning — and the two drift apart within a week.

Litmus removes the second copy. There is one task. It lives in a **Project** because that is what it is part of, and the moment it gets a **Due Date** it appears on the **Week Board** on that day, because that is when you intend to do it. Change the date and it moves. Finish it on the board and the project's progress bar moves. Neither surface is the source of truth over the other; they are two projections of the same task, and the product's entire job is to make that feel obvious rather than clever.

This is a personal tool, built for one person on their own machines. That is a feature, not a limitation: no invitations, no permissions, no notification settings, no shared-workspace ceremony. Just a calm pastel surface that opens on Monday morning and tells you honestly what this week looks like — and follows you from the desk to the phone without asking.

## 2. Target User

Litmus has exactly one user in v1: its builder — someone who runs several personal and side projects at once, plans in weeks rather than sprints, and has repeatedly bounced off tools that are either too structureless (a notes app) or too heavy (a real project tracker).

### 2.1 Jobs To Be Done

- **Functional** — See everything I intend to do this week, laid out by day, without assembling it by hand each Monday.
- **Functional** — Keep a multi-week project's structure intact while still planning individual pieces of it into specific days.
- **Functional** — Move a task to a different day, or a different status, in one gesture from wherever I happen to be looking.
- **Functional** — Get an honest read on how far along a project actually is, without maintaining a percentage by hand.
- **Contextual** — Plan on the phone in the evening; execute at the desk the next morning. Same data, no export step.
- **Emotional** — Open the app and feel oriented rather than accused. The surface should stay calm when the week is full.
- **Emotional (builder's job)** — Build and own the whole thing, so every friction point is mine to fix rather than someone's roadmap item.

### 2.2 Non-Users (v1)

- **Teams.** No second person has an account, an invitation, or a view. `[ASSUMPTION: the Members panel, role labels, "Invite member" and "Share" affordances present in the design frames are visual dressing seeded for realism, not v1 requirements — confirmed during discovery.]`
- **Clients or stakeholders** who need read-only visibility into a project.
- **People who plan in sprints or backlogs.** The organising unit is a calendar week, permanently.
- **Anyone needing task assignment as coordination.** Assignee exists as a field (§4.4) but always resolves to the single account holder.
- **The public.** Litmus is not marketed, sold, or positioned. The Landing Page frame in the design file is a design study, not a commitment (§5).

### 2.3 Key User Journeys

> **UJ-1. Nuwan lays out the week on Monday morning.**
> Nuwan sits down with coffee, already signed in on the desktop. Litmus opens on the **Week Board** — the default surface — showing `August 10 – 16, 2026 · 12 tasks` across seven day columns. Three things landed on Thursday automatically because they carry that **Due Date** from the *Design System* **Project**; he didn't put them there. He types two more directly into Tuesday's column using the inline add affordance, tabs out, and they appear as **Task Cards** with their project and **Category** attached. **Climax:** the whole week is visible in one screen and he did not have to copy anything from anywhere. **Resolution:** he leaves the tab open; it's the surface he'll return to all week.

> **UJ-2. Nuwan drags a slipping task into next week without losing its project.**
> It's Wednesday. The *Build Button component* task is still sitting in **In Progress** on the *Design System* **Project Board**, and Thursday is already full. He opens the task, changes its **Due Date** from Aug 13 to Aug 18, and closes the panel. **Climax:** the card disappears from Thursday's column on the Week Board and reappears on the following week's Tuesday — while staying exactly where it was in the project's In Progress column, with its progress contribution unchanged. **Resolution:** the project's shape is intact; only the *when* moved. **Edge case:** if he instead clears the Due Date entirely, the task leaves the Week Board altogether and lives only in the project, with a "Set date" affordance on its card as the way back.

> **UJ-3. Nuwan spins up a new project on Sunday evening, on the phone.**
> On the sofa, phone in hand, he has an idea for a *Website Redesign*. He opens Litmus — the phone signed him in from a remembered session — taps through to **Projects**, and creates it: name, a mint colour, one line of description, and four starter tasks typed straight into the modal — two with dates, two left undated. **Climax:** he closes the phone. **Resolution:** Monday morning at the desk, the two dated ones are already sitting on the **Week Board** in the right columns, and the two undated ones are waiting in the project's **To Do** column. The sync is invisible; it just happened.

> **UJ-4. Nuwan works a project board directly when the week view isn't the right lens.**
> Mid-week, he wants to think about the *Design System* project as a whole rather than as scattered days. He opens **Project Detail** in board view: three status columns, a progress bar reading `68% · 8 of 12 tasks done`, and stat chips for total tasks and how many are due this week. He drags *Document form patterns* from In Progress to Done. **Climax:** the progress bar moves to 75% immediately and the card's Week Board appearance updates to show it complete. **Resolution:** he switches back to Week and carries on. **Edge case:** on the phone the same board uses status tabs instead of side-by-side columns, and dragging requires a deliberate long-press — with the helper text "Hold to drag a card, or open it to change status" naming the alternative.

> **UJ-5. Nuwan sets up the phone for the first time.**
> He has been using Litmus at the desk for a fortnight. On the phone he opens the app and gets the sign-in screen: a calm two-pane layout, email and password, "Remember me" already the obvious choice. He signs in. **Climax:** the Week Board loads with the same twelve tasks he left on the desktop — nothing to import, nothing to configure, no empty state to dismiss. **Resolution:** the phone stays signed in; he never sees this screen again on this device. **Edge case:** if he has forgotten the password, "Forgot password?" takes him to a single-field reset screen that emails a secure link, with "Back to sign in" as the way out.

## 3. Glossary

*These terms are used verbatim throughout this document and in every downstream artifact. Synonyms are a discipline violation.*

- **Task** — The atomic unit of work. Has a title, a **Status**, and optionally a **Category**, **Project**, **Due Date**, time range, priority, assignee, description, and **Subtasks**. A Task belongs to at most one Project, and always has a **Project**, a **Due Date**, or both (FR-39) — the two are individually optional but not simultaneously absent.
- **Subtask** — A named checklist item inside exactly one Task. Has only a title and a done/not-done state. Subtasks are not Tasks: they never appear on the Week Board and have no Due Date.
- **Status** — A Task's position in a fixed three-value enum: **To Do**, **In Progress**, **Done**. Identical across every surface.
- **Due Date** — The calendar day a Task is intended to be done. The sole mechanism by which a Task appears on the **Week Board**. Optional; a Task without one exists only inside its Project.
- **Category** — A short label attached to a Task (Design, Dev, QA, Docs), rendered as a pastel tag. Flat, not hierarchical. Distinct from Project.
- **Project** — A named container for related Tasks, with a colour, description, and derived **Progress**. Has zero or more Tasks; a Task has zero or one Project.
- **Progress** — A Project's completion, derived — never entered — as Done Tasks ÷ total Tasks, shown as a percentage and an "N of M tasks done" phrase.
- **Week Board** — The seven-column Mon–Sun surface showing every Task whose Due Date falls in the displayed week. The application's default landing surface once signed in.
- **Project Board** — A single Project's Tasks arranged in three columns by Status, with drag-and-drop between columns.
- **Project List** — The same Project's Tasks as a table grouped by Status, an alternative to the Project Board.
- **Task Detail** — The panel showing and editing everything about one Task. A right-side overlay on desktop, a full-screen sheet on mobile.
- **Account** — The single user identity, holding a name, email, password, and preferences. Exactly one exists. Its purpose is to let the same data reach more than one device — it is not the basis of a permission model.
- **Session** — A signed-in state on one device. Multiple concurrent Sessions across devices are normal and expected.
- **Note** — A markdown document in a folder tree, linkable to a Task or Project. **Deferred to v2 in its entirety** (§5, §6.2); defined here only so v1 avoids colliding with the term.

## 4. Features

### 4.1 Application Shell

**Description:** The persistent frame around every signed-in surface — global navigation and theming. On desktop this is a narrow icon rail pinned to the left of every screen; on mobile it collapses to a bottom tab bar. Design frames: all desktop app screens, `tqz8m` (mobile).

**Functional Requirements:**

#### FR-1: Global navigation

The user can move between the Week Board, Projects, and Settings from any signed-in screen without losing their place. Realizes UJ-1, UJ-3.

**Consequences (testable):**
- A persistent left icon rail is present on every desktop app screen, containing (top to bottom) the app logo, Week (`calendar-blank`), Projects (`folder-simple`), Notes (`note-pencil`), and — pinned to the bottom — Settings (`gear-six`), with the account avatar.
- The Notes item renders in a visibly disabled state in v1 and does not navigate. `[ASSUMPTION: showing a disabled Notes affordance is preferable to hiding it, since Notes is a committed v2 surface — flagged for confirmation.]`
- On mobile the rail is replaced by a bottom tab bar with Week, Projects, and Notes; Settings is reached from the account avatar in the header.
- The Week Board is the landing surface on launch when signed in.

#### FR-2: Light and dark themes

The user can switch the entire application between light and dark themes, and the choice persists across Sessions and devices.

**Consequences (testable):**
- Every signed-in screen renders correctly in both themes; no app surface is light-only. Design frames `OsCBi`, `lljnL` are the dark references.
- All colour is expressed through the 21 named design tokens (`bg`, `surface`, `sidebar`, `text-primary`, `text-secondary`, `text-muted`, `border`, `accent`, and the pastel/dot scales) — never hard-coded. Full token table in `prd-addendum.md` §A.
- `accent` (`#4A72E0`) and all six `dot-*` tokens are theme-invariant by design; every other colour token has a light and a dark value.
- Theme preference is stored on the **Account**, so switching on desktop is reflected on mobile.
- The three authentication screens are drawn light-only in the design and are **exempt** from dark-theme parity in v1 (§10, Q2).

#### FR-3: Settings

The user can reach a Settings surface and adjust application-level preferences.

**Consequences (testable):**
- Settings is reachable from the rail on desktop and the account avatar on mobile.
- v1 contains: theme (light / dark / follow system), week start day, account name and email, sign-out, and an About row carrying the application version (FR-38).
- `[ASSUMPTION: no Settings screen exists in the design file despite the nav item; this minimal scope is inferred and needs design before build.]`

#### FR-38: The running version is visible

The user — who is also the person who will debug this — can see exactly which build they are looking at, without opening developer tools.

*Numbered 38 rather than 4 so that existing FR references in tests, commits and `prd-addendum.md` stay stable. Grouped here because it belongs to the Shell.*

**Consequences (testable):**
- Settings carries an About row displaying the application version as `MAJOR.MINOR.PATCH` (e.g. `Litmus 0.4.2`).
- The build's short commit SHA and build date are shown as secondary text alongside it.
- The version is fixed at build time — it is never fetched at runtime, and a stale cache cannot show a version other than the one actually running.
- The version follows Semantic Versioning and is derived from commit history rather than set by hand. `1.0.0` is cut when the MVP scope in §6.1 is complete; before that the app is `0.x`.
- The row is presented quietly, as a diagnostic rather than a feature, consistent with the calm tone in §9.
- Settings is the **only** place the version appears. It is not shown on the authentication screens, in the page source, or anywhere reachable without signing in (§10, Q14).

---

### 4.2 Account, Authentication and Sync

**Description:** The single Account, how the user proves they own it, and how their data reaches every device they sign in on. Authentication exists here for exactly one reason — data portability between the desk and the phone — and must not be built as the foundation of a permission model it will never need. The three auth screens share one two-pane layout: a form on the left, and on the right a brand panel carrying a headline, supporting line, and decorative floating **Task Card** instances. Design frames: `TsKgU` (login), `Y9MTL5` (register), `xZjeU` (forgot password).

**Functional Requirements:**

#### FR-4: Create the Account

The user can register the single Account that owns all Litmus data.

**Consequences (testable):**
- The register screen collects Full name (placeholder `Jane Doe`), Email (placeholder `you@example.com`), and Password, under the heading "Create your account" and the supporting line "Start planning in minutes — no credit card required."
- A required consent checkbox reads "I agree to the Terms & Privacy Policy".
- The primary action is "Create account"; a secondary line offers "Already have an account? Sign in", routing to `TsKgU`.
- On success the user is signed in and lands on the Week Board, which renders its empty state (FR-14).
- `[ASSUMPTION: registration is available once and then effectively closed, since exactly one Account exists. Whether the route is disabled, hidden, or simply never linked after first use is undecided — see §10, Q3.]`

#### FR-5: Sign in

The user can start a Session on any device. Realizes UJ-5.

**Consequences (testable):**
- The sign-in screen collects Email and Password under the heading "Welcome back" and the line "Sign in to pick up where you left off."
- A "Remember me" control persists the Session across browser restarts; a "Forgot password?" link routes to `xZjeU`.
- The primary action is "Sign in"; a secondary line offers "Don't have an account? Sign up".
- Failed sign-in returns a clear, non-enumerating error that does not reveal whether the email exists.
- Sessions on multiple devices are concurrent and independent; signing in on the phone does not end the desktop Session.

#### FR-6: Recover access

The user can regain access to the Account without support. Realizes UJ-5 (edge case).

**Consequences (testable):**
- The reset screen collects Email alone, under the heading "Reset your password" and the line "Enter your account email and we'll send you a secure link to reset it."
- The primary action is "Send reset link"; a "Remembered it? Back to sign in" link returns to `TsKgU`.
- The confirmation response is identical whether or not the email matches the Account, so the screen cannot be used to probe for it.
- The emailed link is single-use and time-limited.

#### FR-7: Third-party sign-in *(optional)*

The user can authenticate with Google or Apple instead of a password.

**Consequences (testable):**
- Google and Apple buttons appear above an "or" divider on both the sign-in and register screens, as drawn.
- Both providers resolve to the same single Account rather than creating additional ones.
- `[ASSUMPTION: social sign-in is drawn on all three auth frames but was grouped with landing-page marketing copy during discovery. Email and password is the required path; Google and Apple are droppable from v1 without redesigning the screens, since removing the buttons and the "or" divider leaves a coherent form. Flagged in §10, Q1.]`

#### FR-8: Cross-device sync

The user's Tasks, Projects, and preferences are the same on every device they have signed in on. Realizes UJ-3, UJ-5.

**Consequences (testable):**
- A change made on one device is reflected on another within seconds while both are online.
- The application is usable while offline for reading and editing; changes made offline are applied when connectivity returns.
- Concurrent edits to the same field from two Sessions resolve last-write-wins, per field rather than per record. `[ASSUMPTION: last-write-wins is acceptable because there is a single human editor — genuine conflicts require the same person editing two devices simultaneously.]`
- Sign-out clears local data on that device; it does not affect other Sessions or the stored Account data.

**Feature-specific NFRs:**
- Passwords are stored only as a salted hash. The reset flow never emails a password.
- No email address, name, or task content is sent to any third-party analytics or telemetry service (§8).

---

### 4.3 Week Board

**Description:** The default surface and the product's centre of gravity. Seven day columns, Monday through Sunday, each holding the Tasks whose Due Date falls on that day. Tasks arrive here automatically from their Projects; they can also be created here directly, in which case they get that day's Due Date and no Project. Design frames: `s4eslt` (default), `OsCBi` (dark), `rOs0l` (empty), `xiXYN` (overflow), `gVeeb` (with Task Detail open), `tqz8m` (mobile).

**Functional Requirements:**

#### FR-9: View a week

The user can see every Task due in the displayed week, laid out by day. Realizes UJ-1.

**Consequences (testable):**
- The header shows the title "My Week", the week's date range, and a live total Task count (`August 10 – 16, 2026 · 12 tasks`).
- Seven columns render in Mon–Sun order, each with day name, date number, and its own Task count.
- A Task appears in exactly one column, determined solely by its Due Date. A Task with no Due Date appears on no column.
- The current day's column is visually distinguished from the rest.

#### FR-10: Navigate between weeks

The user can move to the previous or next week and return to the current one.

**Consequences (testable):**
- Previous (`caret-left`) and next (`caret-right`) controls step exactly one week.
- A "Today" control (`calendar-check`) returns to the week containing the current date from any position.
- The displayed week survives a page reload.

#### FR-11: Create a Task from a day column

The user can add a Task to a specific day without leaving the board or opening a dialog. Realizes UJ-1.

**Consequences (testable):**
- Each column has a persistent "Add a task" affordance at its foot.
- Activating it produces an inline title field in that column; committing creates a Task with that day's Due Date, Status To Do, and no Project.
- The column's count and the header total both update immediately.
- A global "New Task" action is also available from the header for creating a Task without picking a day first — but it cannot create a Task with neither a Project nor a Due Date, per FR-39.

#### FR-12: Task Card

Each Task on a board is rendered as a consistent card carrying enough context to act on without opening it. Design component `GjmCT`.

**Consequences (testable):**
- The card shows: title, the Project's name with a folder icon, a pastel Category tag, an optional time, and — when the Task has Subtasks — a completion fraction (`2/5`).
- Elements with no value are omitted rather than shown empty; a Task with no Project shows no project row.
- The card is the same component on the Week Board and the Project Board, so a change to it is a change to both.

#### FR-13: Open Task Detail from the board

The user can open any Task's full detail without leaving the board. Realizes UJ-2.

**Consequences (testable):**
- Activating a Task Card opens **Task Detail** as a right-side overlay; the board stays visible and in place behind it (frame `gVeeb`).
- Edits made in the panel are reflected on the board immediately on close, including a Task leaving the current week if its Due Date moved out of it.

#### FR-14: Full and empty extremes

The board stays usable both when a day is overloaded and when the week is empty.

**Consequences (testable):**
- A column whose Tasks exceed its height scrolls within the column; the "Add a task" affordance remains reachable at the foot of the visible column area rather than scrolling out of reach (frame `xiXYN`, demonstrated at 10 tasks in one day).
- An empty week renders all seven columns with a count of `0` and a working add affordance — no illustrated empty state, no collapsed layout (frame `rOs0l`).

#### FR-15: Week Board on mobile

The user can plan and review a week on a phone. Realizes UJ-3, UJ-5.

**Consequences (testable):**
- The seven columns are replaced by a horizontal strip of date pills (single-letter day over date number); selecting one filters the view to that day.
- Below the strip, the selected day's Tasks render as a vertical list headed by the full date (`Thursday, Aug 13`) and a count line (`Today · 3 tasks`).
- The add affordance is scoped and labelled to the selected day (`Add a task to Thursday`).
- The header condenses to title, date range, count, and account avatar (frame `tqz8m`).

#### FR-16: Search Tasks

The user can find a Task by title from the Week Board.

**Consequences (testable):**
- A search field ("Search tasks") is present in the header.
- Search matches Task titles across all weeks, not only the displayed one.
- `[ASSUMPTION: the design shows the field but no results state — matching against title only, with results presented as a simple list that opens Task Detail on selection, is inferred and needs design.]`

---

### 4.4 Task Detail

**Description:** Everything about one Task, in one place, editable in place. A right-side overlay on desktop and — as the design file makes explicit by reusing the identical component at phone width — a full-screen sheet on mobile. Design frames: `A8V5X` (desktop), `I33L1Q` (mobile, a direct instance of `A8V5X`).

**Functional Requirements:**

#### FR-17: Open, dismiss, and flag a Task

The user can open Task Detail from any surface, mark a Task as a favourite, and dismiss the panel.

**Consequences (testable):**
- The panel header carries a close control, a star toggle, and an overflow (`dots-three`) menu.
- On mobile the close control renders as `x` and the panel occupies the full screen; the underlying component is otherwise identical.

#### FR-18: Edit title and description

The user can edit a Task's title and its free-text description in place.

**Consequences (testable):**
- Both fields are directly editable without an explicit edit mode.
- Changes persist without an explicit save action.

#### FR-19: Set Status

The user can move a Task between To Do, In Progress, and Done from the panel. Realizes UJ-4.

**Consequences (testable):**
- Exactly three Status values render as a segmented control; the current one is visibly selected.
- Changing Status here moves the Task's card on the Project Board and updates the Project's Progress.

#### FR-20: Task metadata

The user can set the attributes that place a Task in time and in a Project. Realizes UJ-2.

**Consequences (testable):**
- The panel exposes Category (tag), Project (folder — navigates to Project Detail), Date, Time as a start–end range, Priority (flag), and Assignee (user), each with icon, label, and value.
- Clearing the Date removes the Task from the Week Board without otherwise changing it — and is available only when the Task belongs to a Project, per FR-39.
- Assignee always resolves to the single Account holder in v1 and is not a picker.

#### FR-21: Subtasks

The user can break a Task into a checklist and see how far through it they are.

**Consequences (testable):**
- The section shows a completion counter in `N of M` form.
- Items toggle individually; the counter and the parent Task Card's `2/5` fraction both update immediately.
- An "Add subtask" affordance appends a new item inline.
- Completing every Subtask does **not** automatically set the Task to Done. `[ASSUMPTION: inferred — the design shows "1 of 4" alongside an independent Status control, implying they are decoupled.]`

#### FR-22: Complete and delete

The user can finish or remove a Task from the panel.

**Consequences (testable):**
- A primary "Mark Complete" action sets Status to Done and is equivalent to selecting Done in FR-19.
- A "Delete" action is styled destructively, requires confirmation, and removes the Task from every surface.

**Notes:** The **Linked Notes** section present in frame `A8V5X` is **deferred to v2** with the Notes surface (§6.2). v1 renders Task Detail without it.

---

### 4.5 Projects

**Description:** The collection view over all Projects — a card grid by default, a scannable table as an alternative, and the creation flow that can seed a Project with its first Tasks in one pass. Design frames: `j5kVj` (grid), `lljnL` (dark), `o9B30` (empty), `XaHLd` (list), `Y5TXZ` (new project modal).

**Functional Requirements:**

#### FR-23: Projects dashboard

The user can see every Project with its state at a glance.

**Consequences (testable):**
- The header shows "Projects" and a summary line (`6 active projects · 85 tasks`).
- Each Project renders as a **Project Card** (component `Tqx3s`): folder icon, name, Task count, overflow menu, description, Progress bar with percentage, a "N due this week" count, and the account avatar.
- Progress is derived per FR-28 and is never editable from the card.

#### FR-24: Switch between grid and list

The user can toggle between the card grid and a table of the same Projects.

**Consequences (testable):**
- A toggle switches between grid (`squares-four`) and list (`rows`); the selection persists.
- List view is a table with columns Project, Progress, Tasks, Due, Team (frame `XaHLd`).
- Each row shows folder icon, name, a relative "Updated 2h ago" line, Progress percentage, Task count, due count with calendar icon, avatar, and a chevron opening Project Detail.
- `[ASSUMPTION: the Team column persists in v1 showing only the account holder's avatar, since removing a table column is a design change — flagged for confirmation.]`

#### FR-25: Create a Project

The user can create a Project and give it its first Tasks in a single pass. Realizes UJ-3.

**Consequences (testable):**
- A "New Project" action opens a modal over the dashboard with a close control.
- Fields: Project Name (required, placeholder `e.g. Website Redesign`), a pastel colour picker with a visible selected state, and an optional Description (placeholder `What is this project about?`).
- A Tasks builder allows adding any number of starter Tasks inline, each optionally given a Due Date via a "Set date" affordance, repeatable through an "Add a task" row.
- Footer offers "Cancel" and a primary "Create Project"; Create is unavailable until a name is present.
- Starter Tasks given a Due Date appear on the Week Board immediately per FR-35.

#### FR-26: Projects empty state

A user with no Projects is told what a Project is for rather than shown an empty grid.

**Consequences (testable):**
- With zero Projects the surface shows an icon, the heading "No projects yet", the supporting line "Create a project to group related tasks, track progress, and plan them into your week.", and a prominent "New Project" CTA (frame `o9B30`).
- The summary line reads `0 active projects`.

#### FR-27: Search Projects

The user can filter Projects by name from either view.

**Consequences (testable):**
- A "Search projects" field is present in the header in both grid and list modes and filters in place.

**Feature-specific NFRs:**
- The Projects Dashboard and its list view have **no mobile frame in the design file**. v1 ships a responsive fallback (single-column cards; the table collapsing to stacked rows), explicitly flagged for design follow-up (§10, Q4).

---

### 4.6 Project Detail

**Description:** One Project's Tasks, in either of two lenses — a drag-and-drop board grouped by Status, or a table grouped the same way — behind a shared header carrying the Project's identity and derived stats. Design frames: `AeZUD` (list), `gheFw` (board), `Er1gs` (mobile board).

**Functional Requirements:**

#### FR-28: Project header and derived stats

The user can see a Project's identity and health without computing anything. Realizes UJ-4.

**Consequences (testable):**
- Breadcrumb navigation reads `Projects / [Project Name]` with a back control.
- A header card shows name, description, a Progress bar with percentage and an `N of M tasks done` phrase.
- Four stat chips render: Total Tasks, Due This Week, Members, and Priority. The Members chip reads `1` in v1.
- Progress is derived as Done ÷ total and updates the instant a Task's Status changes — it is never entered by hand.

#### FR-29: Switch between board and list

The user can view the same Project's Tasks as a board or a table.

**Consequences (testable):**
- A switcher toggles between kanban (`kanban`) and list (`list-bullets`); the choice persists per Project.
- Both views group Tasks into To Do, In Progress, and Done, each with a live count.

#### FR-30: Board view with drag-and-drop

The user can change a Task's Status by dragging it between columns. Realizes UJ-4.

**Consequences (testable):**
- Each Task renders as a draggable card with a drag handle (`dots-six-vertical`), Category tag, title, either a Due Date or a "Set date" affordance, and the account avatar.
- During a drag, the target column shows an explicit drop affordance reading "Drop to move here".
- Dropping a card updates Status, the column counts, and Progress immediately.
- Cards in the Done column display "Completed" in place of a due date.
- Each column has its own inline add-task control.

#### FR-31: List view rows

The user can scan and update a Project's Tasks in a dense table.

**Consequences (testable):**
- Each row shows title, Category tag, optional due date, a Status dropdown, and the account avatar.
- Changing Status via the dropdown has identical effect to a drag in board view.

#### FR-32: Project sidebar

The user can see and edit a Project's own attributes alongside its Tasks.

**Consequences (testable):**
- An About section carries the Project's long description.
- A Details section shows Status (e.g. Active), Priority, Colour, Due date, and Created date.
- The **Members** panel and its "Invite member" action, and the header **Share** action, are **not built in v1** (§5). `[ASSUMPTION: the Members chip in FR-28 is retained reading "1" rather than removed, to leave the stat row's four-chip layout intact — flagged for confirmation.]`
- The **Linked Notes** panel is deferred to v2 with Notes.

#### FR-33: Add a Task within a Project

The user can create a Task that belongs to the Project they are looking at.

**Consequences (testable):**
- A primary "New Task" action is present in the header.
- Board columns each offer an inline add control that creates the Task directly in that column's Status.
- Tasks created here have the Project set and no Due Date until one is given.

#### FR-34: Project Board on mobile

The user can work a Project Board on a phone. Realizes UJ-4.

**Consequences (testable):**
- The header condenses to Project name, `8 of 12 tasks done`, and the Progress percentage, with a Board/List toggle.
- Status columns are replaced by tabs carrying their counts (To Do 3, In Progress 2, Done 2).
- Drag requires a deliberate long-press, and the interaction is named in helper text: "Hold to drag a card, or open it to change status".
- Each status offers an "Add task to [Status]" control (frame `Er1gs`).

---

### 4.7 Cross-Surface Rules

**Description:** The three invariants that make Litmus one product rather than two. These are not screens; they are behaviours every surface must honour, and they are the requirements most likely to be violated by an implementation that builds surfaces independently.

**Functional Requirements:**

#### FR-35: Due Date drives Week Board membership

A Task appears on the Week Board if and only if it has a Due Date falling in the displayed week — regardless of which surface created it. Realizes UJ-1, UJ-2, UJ-3.

**Consequences (testable):**
- Setting a Due Date on a Task from Task Detail, the New Project modal, or a Project Board card places it on the Week Board without any further action.
- Changing a Due Date moves the Task between columns or out of the displayed week entirely, while leaving its Project, Status, and Progress contribution untouched.
- Clearing a Due Date removes it from the Week Board only, and is permitted only when the Task has a Project to fall back to (FR-39).
- The rule is surfaced in-product as hint text on Project Detail: "Tasks with a due date automatically appear on your Week board."

#### FR-36: One Status model

Status is a single three-value enum shared by every surface. Realizes UJ-4.

**Consequences (testable):**
- To Do, In Progress, and Done are the only values; no surface introduces a fourth, and no surface hides one.
- Setting Status via the Task Detail control, a Project Board drag, or the Project List dropdown produces an identical result.
- Progress on the Project Card, the Project List row, and the Project Detail header all derive from the same Done count and never disagree.

#### FR-37: Categories are consistent and flat

A Task's Category renders identically wherever the Task appears.

**Consequences (testable):**
- Categories are a flat list (Design, Dev, QA, Docs observed in the design), each bound to one pastel token, applied consistently across Week Board, Project Board, Project List, and Task Detail.
- A Task has at most one Category. `[ASSUMPTION: every frame shows exactly one tag per Task — single-valued is inferred, not stated.]`
- Category is independent of Project: two Tasks in different Projects can share a Category.

#### FR-39: Every Task has a home

A Task always belongs to a Project, carries a Due Date, or both — it can never be reachable from neither surface. Realizes UJ-2 (edge case).

**Consequences (testable):**
- A Task with no Project **must** have a Due Date; a Task with no Due Date **must** have a Project. The two are alternatives, not both optional at once.
- Clearing the Due Date of a Task that has no Project is refused, as is removing the Project from a Task that has no Due Date. The refusal explains the rule rather than failing silently, in the plain voice of §9 — e.g. "Give this task a project first, or it won't appear anywhere."
- The affordance that would perform the refused action is disabled with the same explanation available, rather than being offered and then rejected.
- No creation path can produce a Task violating the rule: FR-11's column affordance supplies the day's Due Date, FR-33 supplies the Project, and FR-11's global "New Task" action requires one of the two before it will commit.
- The rule holds at the data layer, not only in the interface, so it cannot be bypassed by a client that has not been updated.

**Rationale:** both fields are individually optional (FR-20), which without this rule permits a Task that appears on no Week Board and no Project Board — findable only by search, and in practice lost. Rather than build an "Unscheduled" surface to hold such Tasks, v1 makes the state unreachable. Resolves §10, Q12.

## 5. Non-Goals (Explicit)

Litmus is **not** a team tool and **not** a commercial product, and v1 will not quietly grow into either:

- **No collaboration.** No second Account, no invitations, no sharing, no permissions or roles, no comments, no activity feed. The Members panel, role labels (Owner / Designer / Engineer / Product), "Invite member", "Share", and the multi-avatar stacks visible throughout the design frames are seeded realism, not requirements. Rationale in `prd-addendum.md` §C.
- **No marketing site, and no public positioning.** The Landing Page frame (`QR1ih`) is a **design study**, explicitly confirmed as such. Nothing in it is a requirement: not the pricing page, not the changelog, blog, about, careers, docs or support pages, and not the `app.litmus.so` domain split. Its copy is recorded in `prd-addendum.md` §G so the ideas are not lost, and every product claim it makes is listed there against its actual v1 status.
- **No monetization.** No pricing, plans, free tier, billing, or "no credit card required" — there is nothing to buy and no one to buy it. The landing page's Pricing nav item and the register screen's "no credit card required" line are copy, not commitments.
- **No social proof, and no user base.** "Trusted by 12,000+ focused teams" is placeholder text of the same kind as the fictional AL / JS / ML teammates.
- **No import or export.** The landing page's "Export anytime, no lock-in" is aspirational. `[NOTE FOR PM]` This one is worth revisiting sooner than the rest: it is the cheapest insurance against the product dying with its database, and it is a genuinely good idea that the mock surfaced.
- **No command palette or keyboard-first layer in v1.** The landing page claims both. Deferred — and when built, designed as one coherent layer rather than accreted per-surface (§6.2).
- **No notifications or reminders.** Nothing pushes, emails, or badges, other than the password-reset email (FR-6). The Week Board is the only thing that tells you what's due, and only when you look at it.
- **No external integrations.** No Google Calendar, no Slack, no public API, no webhooks.
- **No AI features.** No suggested scheduling, no auto-categorisation, no summarisation.
- **No recurring Tasks, dependencies, or time tracking.** A Task happens once, on its own, and is not timed.
- **No analytics or reporting surface** beyond the derived Progress and counts already specified.
- **Not a sprint or backlog tool.** The organising unit is a calendar week. There is no velocity, no estimation, and no backlog grooming.

## 6. MVP Scope

### 6.1 In Scope

- **Application Shell** — nav rail and mobile tab bar, light/dark theming via design tokens, minimal Settings including the version row (§4.1, FR-38).
- **Account, Authentication and Sync** — register, sign in, password reset, Sessions across devices, and cross-device sync (§4.2). Social sign-in optional per FR-7.
- **Week Board** — seven-day view, week navigation, inline task creation, Task Card, overflow and empty behaviour, task search, and the mobile date-pill layout (§4.3).
- **Task Detail** — full view/edit including Status, metadata, description, Subtasks, complete and delete, on desktop and mobile (§4.4, minus Linked Notes).
- **Projects** — dashboard grid, list view, creation modal with starter tasks, empty state, search (§4.5).
- **Project Detail** — header with derived stats, board and list views, drag-and-drop, sidebar About/Details, mobile board (§4.6, minus Members and Linked Notes).
- **Cross-surface rules** — Due-Date sync, shared Status model, consistent Categories (§4.7).
- **Responsive from the start** — the three designed mobile layouts ship with v1; Projects surfaces get a responsive fallback pending design.

### 6.2 Out of Scope for MVP

- **The entire Notes surface — v2.** Editor, folder tree, tags, note search, daily-notes convention, empty and unlinked states. Four design frames (`ft72J`, `W6V7FQ`, `RPGnv`, `nDqBf`) are fully specified and waiting. `[NOTE FOR PM]` This is the largest deferred item and the one most likely to be missed — the linked-notes idea is a real part of the product concept, not a nice-to-have, and the mock landing page leads with it.
- **Note attachments — v2, with Notes.** Images and files inside a Note, and the object storage to hold them. Nothing in this PRD covers upload, size or type limits, presentation in the editor, or what becomes of a stored file when its Note is deleted; the FR is written when Notes is specified. Listed explicitly because "file storage for notes" is easy to assume is already specified somewhere — it is not (§10, Q13).
- **Note linking — v2, with Notes.** The Linked Notes sections in Task Detail (`A8V5X`) and Project Detail, and the Link Note Modal (`z7ZH8`) — which the design specifies completely as a command-palette picker with search, recent notes grouped by folder, an inline "create and link" row, and keyboard navigation. Full specification preserved in `prd-addendum.md` §D so v2 does not have to re-derive it.
- **Notes rich formatting beyond markdown-lite — v3.** When Notes ships in v2 it ships as markdown-lite: headings, bold/italic, bullets, checklists, and links, rendered live as typed. The slash-command block menu, code blocks with language label and copy, callouts, backlinks, and the formatting toolbar are deferred further (`prd-addendum.md` §E).
- **All collaboration features — not planned.** See §5.
- **The marketing landing page and everything it implies — not planned.** See §5 and `prd-addendum.md` §G.
- **Mobile designs for Projects Dashboard and Notes** — no frame exists; v1 uses a responsive fallback (§10, Q4).
- **Command palette and keyboard shortcuts** — deferred; nothing beyond native browser behaviour in v1.
- **Dark theme for the authentication screens** — the three auth frames are drawn light-only (§10, Q2).

## 7. Success Metrics

This is a personal tool. The only success that matters is that it survives contact with real use.

**Primary**
- **SM-1**: **Sustained weekly use.** Litmus is opened and modified in at least 4 of any 6 consecutive weeks, three months after v1. Validates the product thesis end to end — chiefly FR-9, FR-35.
- **SM-2**: **The second copy is gone.** No task planning happens in any other tool (notes app, calendar, paper) for the projects Litmus holds. Validates FR-35, FR-36.

**Secondary**
- **SM-3**: **Monday planning is fast.** Laying out a week takes under five minutes, because most of it arrived automatically from Projects rather than being typed. Validates FR-35, FR-11.
- **SM-4**: **Mobile earns its build.** At least some weeks include a planning or status-change session done on the phone. Validates FR-15, FR-34, FR-8 — and retroactively justifies both "synced from day one" and the cost of building authentication.

**Counter-metrics (do not optimize)**
- **SM-C1**: **Number of Tasks in the system.** More tasks is not better; a Week Board with 40 items on it is a failure of the product's calm, not a sign of engagement. Counterbalances SM-1.
- **SM-C2**: **Time spent in the app.** Litmus should be opened, read, adjusted, and closed. Long sessions mean planning has become the work. Counterbalances SM-3.
- **SM-C3**: **Number of Accounts.** Exactly one. Any growth here means the product has drifted into being a service, which is a decision to make deliberately rather than discover. Counterbalances the existence of §4.2.

## 8. Cross-Cutting NFRs

- **Performance** — The Week Board renders a full week in under one second on a warm load. Drag-and-drop, Status changes, and Subtask toggles reflect optimistically and immediately, never waiting on a round trip.
- **Offline tolerance** — Reading and editing work without connectivity; changes queue and sync on reconnect (FR-8). The app never presents a blank screen because the network is down.
- **Sync latency** — A change on one device is visible on another within a few seconds when both are online.
- **Durability** — No user-entered content is lost on refresh, crash, or connectivity loss. Deletion is the only path to data loss, and it confirms first (FR-22).
- **Responsive behaviour** — Every surface is usable from 390 px (the design's mobile frame width) up to 1600 px (the desktop frame width). Auth screens are drawn at 1440 px and must degrade to phone width. No horizontal page scroll at any width.
- **Accessibility** — Text and interactive elements meet WCAG AA contrast in **both** themes; the pastel tag palette and the theme-invariant `dot-*` tokens are the risk area and must be verified rather than assumed. Every action reachable by drag has a non-drag equivalent (FR-31, FR-34). `[ASSUMPTION: AA is the target — inferred from the design file's own stated component principle "every component meets WCAG AA contrast out of the box".]`
- **Security** — Passwords stored as salted hashes only; reset links single-use and time-limited; authentication errors non-enumerating (§4.2). Access tokens are short-lived and refresh tokens rotate on use, with reuse of a spent refresh token invalidating the session family.

  `[AMENDED 2026-08-21: this bullet previously required that "session tokens are not readable by page scripts", i.e. httpOnly cookies. That requirement is dropped, deliberately. Honouring it requires terminating the session on a server the product controls, and — because a browser that cannot read its own token cannot talk to the database directly either — it requires hand-writing every endpoint behind that server. The architecture instead has the client hold its own session, which removes the backend entirely (see docs/architecture.md §2.1). The residual risk is narrower than it sounds: the threat is XSS, and an XSS against an httpOnly-cookie session can still act as the user — it merely cannot carry the token off-device. For a single-user tool with no third-party embeds and no content authored by anyone else, that is an acceptable trade, and it is paid for by the three compensating requirements below.]`

- **Content Security Policy** — A strict CSP is served on every page: no inline scripts, no `unsafe-eval`, and an explicit origin allowlist. This is affordable precisely because §8's Privacy requirement already forbids third-party analytics, telemetry, ad tooling and embeds — there is nothing legitimate to allow.
- **Untrusted content is sanitised before render** — Note bodies are user-authored markup rendered back into the page, making them the app's most likely injection vector. Every render path that turns stored content into markup sanitises it first. This is a v2 requirement in practice, since Notes ships in v2, but it is stated here because it is a condition of the security posture above rather than a feature of Notes.
- **Privileged credentials never reach the client** — Any key capable of bypassing per-user data isolation exists only in deployment secrets. The client ships only credentials that are safe to publish, and data isolation is enforced by the database itself rather than by application code that could forget.
- **Theming integrity** — No colour is hard-coded outside the token layer (FR-2), so a token change propagates everywhere.
- **Privacy** — Single-tenant personal data. No third-party analytics, no telemetry, no ad tooling, no third-party embeds on any screen.

## 9. Design System and Tone

The design file is the visual authority; this section names only what carries product meaning.

- **Tone** — Calm and neutral. Soft pastel category tags on quiet surfaces, generous rounding, low contrast between chrome and background. The interface should recede when the week is full — a heavy week should not produce a loud screen.
- **Palette** — 21 named tokens with paired light/dark values; `accent` `#4A72E0` and the six `dot-*` tokens are theme-invariant. Full table in `prd-addendum.md` §A.
- **Iconography** — Phosphor Icons throughout, at consistent weight.
- **Typeface** — Inter.
- **Auth screens** — a two-pane composition: form left, brand panel right carrying a headline, a supporting line, and decorative rotated **Task Card** instances. The product's own component used as marketing imagery, which is a nice constraint: if the Task Card is ugly, the sign-in screen is ugly.
- **Copy voice** — Plain, second-person, short. Empty states explain the concept rather than apologise ("Create a project to group related tasks, track progress, and plan them into your week."). Hint text states rules directly ("Tasks with a due date automatically appear on your Week board."). Auth copy is warm without being cute ("Sign in to pick up where you left off.").
- **Anti-references** — Not dense enterprise chrome; not a gamified productivity app. No streaks, badges, celebration animations, or nudges. Notably, also not the landing page's growth-marketing register — no social proof, no urgency, no "join 12,000+".

## 10. Open Questions

1. **Is social sign-in real?** FR-7 specs Google and Apple as designed but optional, because they were grouped with landing-page copy during discovery. Confirm keep or drop — dropping is free now and costly later. *(Blocks: FR-7 only.)*
2. **Dark theme for auth screens.** All three auth frames are light-only while every app screen has a dark variant. Deliberate, or just not drawn yet? Signing in at night into a dark app via a white screen is a visible seam.
3. **What happens to the register route after the one Account exists?** FR-4 assumes registration effectively closes. Disabled, hidden, or simply unlinked?
4. **Mobile design for the Projects Dashboard and list view.** No frame exists. v1 ships a responsive fallback — does that need real design before build, or is the fallback acceptable to start? *(Blocks: FR-23, FR-24 on mobile.)*
5. **Settings scope and design.** FR-3 infers theme, week start, account details, and sign-out. Is that the whole of it? *(No frame exists.)*
6. **Task search results.** FR-16 specifies the field; the results presentation is inferred. Also: should search span Projects as well as Tasks?
7. **Category management.** Where do Categories come from — a fixed list, or user-created? The design shows only four (Design, Dev, QA, Docs) with no management surface.
8. **Project lifecycle.** Project Detail shows `Status: Active`, implying other values. Can a Project be archived or completed, and what happens to its Tasks on the Week Board if so?
9. **Week start day.** FR-3 offers it as a setting, but every frame shows Mon–Sun. Is configurability actually wanted, or should Monday be fixed?
10. **The Members chip and Team column.** FR-28 and FR-24 keep them, reading "1", to preserve the designed layouts. Keep, or redesign those layouts without them?
11. **Data export.** Listed as a Non-Goal (§5) but flagged there as worth revisiting — it is cheap insurance and the mock landing page was right to promise it. Pull into v1.1? *(Cheaper than assumed — roughly an afternoon against the planned schema.)*
12. **~~Where does a task with no Project and no Due Date live?~~** **Resolved 2026-08-21 → FR-39.** Nowhere, because the state is now unreachable. A Task must have a Project or a Due Date; clearing whichever is the last one is refused, at the data layer as well as in the interface. This was chosen over building an "Unscheduled" surface to hold such Tasks — the state is rare, arises only by clearing a field, and a rule that keeps every Task on at least one board is simpler than a third place to look.
13. **~~Note attachments have no requirement anywhere.~~** **Resolved 2026-08-21 → deferred to v2**, with the Notes surface (§6.2). Nothing in v1 uploads, stores, or renders a file, so v1 needs no object storage at all. The FR covering upload, size and type limits, editor presentation, and what happens to a stored file when its Note is deleted is written when Notes is specified for v2 — it is listed in §6.2 so it is not mistaken for something already covered.
14. **~~Does the version string belong anywhere besides Settings?~~** **Resolved 2026-08-21 → no.** The Settings About row is the only place the version appears. Not on the auth screens, not in the page source, not in the console.

## 11. Assumptions Index

*Every `[ASSUMPTION]` in this document, surfaced for confirmation:*

1. **§2.2** — Members, roles, "Invite member" and "Share" in the design frames are visual dressing, not v1 requirements. *(Confirmed in discovery.)*
2. **§4.1 / FR-1** — The Notes nav item is shown disabled in v1 rather than hidden, since Notes is a committed v2 surface.
3. **§4.1 / FR-3** — Settings scope (theme, week start day, account details, sign-out) is inferred; no design frame exists.
4. **§4.2 / FR-4** — Registration effectively closes after the single Account exists; the mechanism is undecided.
5. **§4.2 / FR-7** — Google and Apple sign-in are optional and droppable without redesign; email and password is the required path.
6. **§4.2 / FR-8** — Last-write-wins per field is acceptable for sync conflicts, because there is a single human editor.
7. **§4.3 / FR-16** — Task search matches titles only and presents results as a simple list; the results state is undesigned.
8. **§4.4 / FR-21** — Completing all Subtasks does not auto-complete the parent Task; the two are decoupled.
9. **§4.5 / FR-24** — The list view's Team column is retained in v1 showing a single avatar, rather than removed.
10. **§4.6 / FR-32** — The Members stat chip is retained reading "1" to preserve the four-chip stat row layout.
11. **§4.7 / FR-37** — A Task carries at most one Category; single-valued is inferred from the frames.
12. **§8** — WCAG AA is the accessibility target, inferred from the design file's own stated component principle.
13. **§8** — Client-held session tokens are an acceptable risk for a single-user tool, given a strict CSP, sanitised rendering of stored content, and rotating refresh tokens. *(Amended 2026-08-21; supersedes the original httpOnly requirement. Rationale in §8 and `docs/architecture.md` §2.1.)*
14. **§4.7 / FR-39** — Making "a Task must have a Project or a Due Date" a hard rule is preferable to building an "Unscheduled" surface. *(Decided 2026-08-21, resolving §10 Q12.)*
15. **§4.1 / FR-38** — `1.0.0` marks completion of the MVP scope in §6.1 rather than an arbitrary date, and the marketing v1/v2/v3 milestones used throughout this document are **not** semantic-version majors. They are scope milestones; the version number describes compatibility.

## 12. Revision History

*This document is versioned. Any change to it bumps `version` in the frontmatter — see
`CLAUDE.md` § Document versioning for the rule.*

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-08-19 | Initial PRD. FR-1…FR-37, journeys, glossary, MVP cut, NFRs, 11 open questions. |
| 2.0.0 | 2026-08-21 | **Major — a stated requirement was withdrawn.** §8's "session tokens are not readable by page scripts" is dropped and replaced with CSP, sanitised rendering, and rotating refresh tokens (assumption 13). Adds FR-38 (version visible in Settings) and FR-39 (every Task has a Project or a Due Date), the latter amending FR-11, FR-20 and FR-35. Resolves open questions 12, 13 and 14; lists note attachments explicitly as v2 in §6.2. |
