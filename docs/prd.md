# Product Requirements Document — Litmus

**Doc status:** Draft, derived from `litmus.pen` design file
**Product type:** Personal task, project & notes management web app (with responsive mobile layouts)
**Owner:** _TBD_
**Last updated:** August 19, 2026

---

## 1. Overview

Litmus is a personal productivity app that unifies three connected surfaces:

1. **Week** — a 7-day kanban-style board for daily task planning
2. **Projects** — grouped, longer-running bodies of work with their own boards
3. **Notes** — a linked, folder-based note-taking workspace

The three surfaces are cross-linked: tasks belong to projects, tasks can carry due dates that automatically surface them on the Week board, and notes can be linked to tasks/projects and vice versa. The product supports light and dark themes and has dedicated mobile layouts for its core screens.

### 1.1 Design tokens (from `.pen` file)

| Token            | Light                                                  | Dark              |
| ---------------- | ------------------------------------------------------ | ----------------- |
| `bg`             | `#F7F6F3`                                              | `#15151B`         |
| `surface`        | `#FFFFFF`                                              | `#1F1F28`         |
| `sidebar`        | `#FFFFFF`                                              | `#1A1A21`         |
| `text-primary`   | `#3A3A46`                                              | `#ECECF2`         |
| `text-secondary` | `#9B9BA8`                                              | `#8B8B99`         |
| `border`         | `#EFEDE9`                                              | `#2B2B35`         |
| `accent`         | `#4A72E0` (fixed)                                      | `#4A72E0` (fixed) |
| Pastel tags      | lavender, mint, peach, blue, yellow (light/dark pairs) | —                 |

Design language: soft pastel category tags, rounded corners, calm neutral surfaces, icon set = **Phosphor Icons**.

---

## 2. Goals

- Give a single user a fast, low-friction way to plan a week, manage multi-task projects, and keep linked notes — without needing three separate apps.
- Keep task planning (Week) and project structure (Projects) in sync automatically via due dates.
- Make notes a first-class, linkable citizen rather than a bolt-on.
- Ship responsive (desktop + mobile) parity for the three core surfaces.

## 3. Non-goals (not evidenced in the design file)

- Multi-user real-time collaboration / permissions beyond a lightweight "Share" action and avatar stacks
- Notifications/reminders system
- Calendar/external integrations (Google Calendar, etc.)
- Billing/subscription flows

---

## 4. Information Architecture

```
Sidebar Rail (global nav — persistent, icon rail)
├── Week        (calendar-blank icon)
├── Projects    (folder-simple icon)
├── Notes       (note-pencil icon)
└── Settings    (gear-six icon, bottom)
```

Global nav is present on every primary desktop screen; on mobile it collapses to a bottom tab bar with Week / Projects / Notes.

---

## 5. Screen Inventory

Each screen below is tagged with its **Screen ID** (the node `id` from the source `.pen` file) for direct traceability back to the design file.

| #   | Screen Name                          | Screen ID | Platform | Type          |
| --- | ------------------------------------ | --------- | -------- | ------------- |
| 1   | Week — Board (default)               | `s4eslt`  | Desktop  | Primary       |
| 2   | Week — Board (Dark theme)            | `OsCBi`   | Desktop  | Theme variant |
| 3   | Week — Board (Mobile)                | `tqz8m`   | Mobile   | Primary       |
| 4   | Week — Board (with Task Detail open) | `gVeeb`   | Desktop  | State         |
| 5   | Week — Empty state                   | `rOs0l`   | Desktop  | Empty state   |
| 6   | Week — Overflow / sticky add         | `xiXYN`   | Desktop  | Edge case     |
| 7   | Task Detail Panel                    | `A8V5X`   | Desktop  | Overlay/panel |
| 8   | Task Detail (Mobile)                 | `I33L1Q`  | Mobile   | Overlay/panel |
| 9   | Projects — Dashboard (grid)          | `j5kVj`   | Desktop  | Primary       |
| 10  | Projects — Dashboard (Dark theme)    | `lljnL`   | Desktop  | Theme variant |
| 11  | Projects — Dashboard (Empty state)   | `o9B30`   | Desktop  | Empty state   |
| 12  | Projects — New Project Modal         | `Y5TXZ`   | Desktop  | Modal         |
| 13  | Projects — List View                 | `XaHLd`   | Desktop  | Primary       |
| 14  | Project — Detail (List/table view)   | `AeZUD`   | Desktop  | Primary       |
| 15  | Project — Detail (Board/kanban view) | `gheFw`   | Desktop  | Primary       |
| 16  | Project — Detail (Mobile board)      | `Er1gs`   | Mobile   | Primary       |
| 17  | Projects — Link Note Modal           | `z7ZH8`   | Desktop  | Modal         |
| 18  | Notes — Editor                       | `ft72J`   | Desktop  | Primary       |
| 19  | Notes — Editor (Dark theme)          | `W6V7FQ`  | Desktop  | Theme variant |
| 20  | Notes — Empty state                  | `RPGnv`   | Desktop  | Empty state   |
| 21  | Notes — Editor (Unlinked note)       | `nDqBf`   | Desktop  | State         |

**Reusable components** (also tagged with IDs, referenced throughout):

| Component    | ID      | Used on                        |
| ------------ | ------- | ------------------------------ |
| Task Card    | `GjmCT` | Week board, Project board      |
| Project Card | `Tqx3s` | Projects dashboard (grid mode) |

---

## 6. Feature Requirements by Screen

### 6.1 Week Board — `s4eslt` (+ dark `OsCBi`, mobile `tqz8m`, empty `rOs0l`, overflow `xiXYN`)

**Purpose:** Primary landing surface — plan and view tasks across the current 7-day week.

**Requirements:**

- FR-1.1: Header displays title "My Week", current week date range, and a live task count (e.g. "12 tasks").
- FR-1.2: Global search field, scoped to tasks (placeholder "Search tasks").
- FR-1.3: Week navigation via previous/next caret controls and a "Today" jump button.
- FR-1.4: Board renders 7 day columns (Mon–Sun), each showing day name, date number, and a per-day task count.
- FR-1.5: Each day column supports inline task creation via a persistent "Add a task" affordance at the bottom of the column.
- FR-1.6: Each task is rendered as a **Task Card** (`GjmCT`) showing: title, project name + icon, a colored category tag, optional time, and a subtask completion fraction (e.g. "2/5") when subtasks exist.
- FR-1.7: Clicking a task card opens the **Task Detail Panel** (`A8V5X`) as an overlay without leaving the board (see `gVeeb` state).
- FR-1.8: Empty state (`rOs0l`): when the week has 0 tasks, all day columns render with a "0" count and the add-task affordance remains available per day (no separate illustrated empty state was found for this screen — it degrades gracefully to zeroed columns).
- FR-1.9: Overflow state (`xiXYN`): a day column with a high task count (e.g. 10) must handle overflow via scroll within the column while keeping the "Add a task" control reachable/sticky.
- FR-1.10: Theme parity — full light/dark support (`OsCBi`).
- FR-1.11: Mobile layout (`tqz8m`): condenses the week into a horizontal date-pill strip (single-letter day + date number); selecting a pill filters a single-day task list below, headed by "[Day], [Date]" and a "Today · N tasks" indicator; add-task affordance is scoped to the selected day ("Add a task to [Day]").

### 6.2 Task Detail Panel — `A8V5X` (mobile `I33L1Q`)

**Purpose:** View and edit full detail for a single task.

**Requirements:**

- FR-2.1: Panel opens as a right-side overlay (desktop) with a close/back control, a "favorite/star" toggle, and an overflow ("more") menu.
- FR-2.2: Editable task title field.
- FR-2.3: Status control with three states: **To Do**, **In Progress**, **Done**.
- FR-2.4: Metadata fields, each with icon + label + value: Category (tag), Project (folder, links to Project Detail), Date, Time (start–end range), Priority (flag — e.g. High), Assignee (user).
- FR-2.5: Free-text Description field.
- FR-2.6: **Linked Notes** section — lists linked notes with name + last-edited timestamp, each opening the source note; includes a "Link a note" action that opens the Link Note Modal (`z7ZH8`).
- FR-2.7: **Subtasks** section — checklist with a completion counter (e.g. "1 of 4"), individually toggleable items, and an "Add subtask" action.
- FR-2.8: Primary actions: "Mark Complete" and "Delete" (destructive).
- FR-2.9: Mobile variant (`I33L1Q`) mirrors the same information architecture in a full-screen mobile layout.

### 6.3 Projects — Dashboard — `j5kVj` (+ dark `lljnL`, empty `o9B30`)

**Purpose:** Landing surface for all projects, grid view.

**Requirements:**

- FR-3.1: Header shows "Projects" title and summary subtitle ("N active projects · N tasks").
- FR-3.2: Search field scoped to projects.
- FR-3.3: View toggle between grid (squares-four) and list (rows) layouts — list mode routes to `XaHLd`.
- FR-3.4: Primary "New Project" action opens the New Project Modal (`Y5TXZ`).
- FR-3.5: Each project renders as a **Project Card** (`Tqx3s`): folder icon, project name, task count, overflow menu, description, progress bar + percentage, due-this-week count, and stacked member-avatar initials.
- FR-3.6: Empty state (`o9B30`): shown when 0 projects exist — icon, "No projects yet" heading, supporting copy, and a prominent "New Project" CTA.
- FR-3.7: Full dark theme parity (`lljnL`).

### 6.4 Projects — New Project Modal — `Y5TXZ`

**Purpose:** Create a new project, optionally pre-seeded with tasks.

**Requirements:**

- FR-4.1: Modal over the Projects Dashboard with a close (×) control.
- FR-4.2: Required "Project Name" text field.
- FR-4.3: Color/label picker (pastel palette) with a checked/selected state indicator.
- FR-4.4: Optional "Description" text field.
- FR-4.5: Inline task list builder — add multiple starter tasks, each optionally assigned a due date ("Set date" affordance if undated) — via a repeatable "Add a task" row.
- FR-4.6: Footer actions: "Cancel" and primary "Create Project".

### 6.5 Projects — List View — `XaHLd`

**Purpose:** Tabular alternative to the grid dashboard for scanning all projects at once.

**Requirements:**

- FR-5.1: Table with columns: Project, Progress, Tasks, Due, Team.
- FR-5.2: Each row: folder icon + project name + "Updated [time ago]", progress percentage, task count, due-count with calendar icon, stacked team-member initials, and a chevron to open Project Detail.
- FR-5.3: Same header/search/view-toggle/new-project affordances as the grid Dashboard.

### 6.6 Project — Detail — List/Table view `AeZUD` and Board/Kanban view `gheFw` (mobile board `Er1gs`)

**Purpose:** Work within a single project's task list, in either a status-grouped table or a drag-drop kanban board.

**Requirements:**

- FR-6.1: Breadcrumb navigation ("Projects / [Project Name]") with a back control.
- FR-6.2: View switcher between kanban (`kanban` icon) and list (`list-bullets` icon) — maps to `gheFw` and `AeZUD` respectively.
- FR-6.3: "Share" action and an overflow ("more") menu.
- FR-6.4: Primary "New Task" action.
- FR-6.5: Project header card: name, description, progress bar with percentage + "N of M tasks done", and four stat chips — Total Tasks, Due This Week, Members, Priority.
- FR-6.6: Contextual hint text: "Tasks with a due date automatically appear on your Week board" — documents the Week↔Projects sync behavior as a product rule (see §7).
- FR-6.7: Tasks are grouped into three status columns/sections: **To Do**, **In Progress**, **Done**, each with a live item count.
- FR-6.8: List view (`AeZUD`): each task row shows title, category tag, optional due date, a status dropdown (caret), and assignee avatar.
- FR-6.9: Board view (`gheFw`): each task is a draggable card (drag handle, category tag, title, optional due date/"Set date" affordance, assignee avatar); columns support an inline "add task to this column" control; drag-and-drop must support an explicit drop-target affordance ("Drop to move here").
- FR-6.10: Mobile board (`Er1gs`): condensed header with progress %, Board/List toggle, per-status tab counts, and a long-press-to-drag interaction pattern (helper text: "Hold to drag a card, or open it to change status"); includes a per-column "Add task to [Status]" control.

### 6.7 Projects — Link Note Modal — `z7ZH8`

**Purpose:** Attach an existing note to a project or task from within Project Detail.

**Requirements:**

- FR-7.1: Rendered as a modal/overlay on top of the Project Detail (Board) screen.
- FR-7.2: Allows selecting from existing notes to link to the current project/task context (invoked from the Task Detail Panel's "Link a note" action, FR-2.6).

### 6.8 Notes — Editor — `ft72J` (+ dark `W6V7FQ`, empty `RPGnv`, unlinked `nDqBf`)

**Purpose:** Hierarchical note-taking workspace, cross-linked to projects/tasks.

**Requirements:**

- FR-8.1: Left panel: "Notes" header with new-note, new-folder, and overflow actions; search field ("Search notes").
- FR-8.2: Collapsible folder tree (expand/collapse caret) containing folders (e.g. "Getting Started", "Projects" → nested project sub-folders, "Daily Notes", "Ideas", "Reading List") and file entries.
- FR-8.3: Daily-notes convention supported (folder containing date-named notes, e.g. "2026-08-13").
- FR-8.4: Note view: breadcrumb path (e.g. Projects / Design System / Components), last-edited timestamp, bookmark/star and overflow actions.
- FR-8.5: **Linked context** row: when a note is linked to a project/task, shows the linked project (folder icon) and linked task (checkbox icon) with a quick "+ Link" action; when unlinked (`nDqBf`), shows a "Link project or task" prompt instead.
- FR-8.6: Tag chips displayed under the title (e.g. `#design-system`, `#ui`, `#components`).
- FR-8.7: Rich-text body supporting headings, paragraphs, and bulleted lists.
- FR-8.8: Unlinked-note variant (`nDqBf`) additionally surfaces a checklist pulled from a related task and a callout/tip element (lightbulb icon) — supports notes that reference task progress without a hard link.
- FR-8.9: Empty state (`RPGnv`): shown when no note is open — icon, "No note open" heading, supporting copy, "New Note" and "New Folder" CTAs.
- FR-8.10: Full dark theme parity (`W6V7FQ`).

---

## 7. Cross-Cutting Product Rules

1. **Week ⇄ Project sync:** Any task with a due date automatically appears on the Week board on that date, regardless of which surface it was created in (documented in-product via the hint text on `gheFw`/`AeZUD`).
2. **Notes linking:** Notes may be linked to a Project and/or a Task; linkage is bidirectional (visible from both the Task Detail Panel and the Note editor).
3. **Status model:** Tasks use a single shared status enum — To Do / In Progress / Done — consistent across Week, Project Board, and Project List.
4. **Category tagging:** Tasks carry a category/label (e.g. Design, Dev, QA, Docs) rendered as a pastel-colored tag consistently across all task surfaces.
5. **Theming:** Every primary screen must ship in both light and dark themes.
6. **Responsive parity:** Week, Task Detail, and Project Board have confirmed mobile layouts; Projects Dashboard and Notes should be assumed to need mobile treatment even though no mobile frame was found in the source file (gap — see §9).

---

## 8. User (persona) reference

The design file uses a single seeded user — initials **"NK"** — with additional collaborators appearing as avatar initials only: **AL, JS, ML**. This suggests Litmus is primarily single-player/personal, with lightweight multi-person assignment (assignee field, team avatars, "Share" action) rather than full team collaboration.

---

## 9. Open Questions / Gaps in the Source Design

- No mobile frame exists for the **Projects Dashboard** or **Notes** surfaces — needs design before mobile build.
- The **Link Note Modal** (`z7ZH8`) frame body duplicates the Project Detail (Board) content in the source file, suggesting the modal's own contents (note picker/search) weren't fully specified — needs design follow-up.
- No settings screen exists despite a Settings nav item (`gear-six` icon) — scope undefined.
- No onboarding/auth flow present in the file.
- "Share" action on Project Detail has no destination screen — sharing scope/permissions undefined.

---

## 10. Traceability Appendix — All Screen & Component IDs

```
bi8Au    Frame (blank canvas artifact — not a product screen)
s4eslt   Week — Board (default, light)
GjmCT    [component] Task Card
OsCBi    Week — Board (dark theme)
tqz8m    Week — Board (mobile)
gVeeb    Week — Board (Task Detail open)
A8V5X    Task Detail Panel
I33L1Q   Task Detail (mobile)
Tqx3s    [component] Project Card
j5kVj    Projects — Dashboard (grid)
Y5TXZ    Projects — New Project Modal
XaHLd    Projects — List View
AeZUD    Project — Detail (list/table)
gheFw    Project — Detail (board/kanban)
Er1gs    Project — Detail (mobile board)
ft72J    Notes — Editor
lljnL    Projects — Dashboard (dark)
W6V7FQ   Notes — Editor (dark)
rOs0l    Week — Empty state
o9B30    Projects — Empty state
RPGnv    Notes — Empty state
nDqBf    Notes — Editor (unlinked note)
z7ZH8    Projects — Link Note Modal
xiXYN    Week — Overflow (sticky add)
```
