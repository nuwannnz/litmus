# Litmus PRD — Addendum

Companion to `prd.md`. Holds material that is real and worth keeping but does not belong in the PRD's main narrative: design-system mechanics, fully-specified deferred features, source-file traceability, and the rationale behind scope decisions. Downstream UX and architecture work should read this alongside the PRD.

---

## A. Design Tokens (complete)

Extracted verbatim from `docs/ui-design.pen`. 21 tokens; every colour in the product resolves through one of them (PRD FR-2).

| Token | Type | Light | Dark |
| --- | --- | --- | --- |
| `bg` | color | `#F7F6F3` | `#15151B` |
| `surface` | color | `#FFFFFF` | `#1F1F28` |
| `sidebar` | color | `#FFFFFF` | `#1A1A21` |
| `text-primary` | color | `#3A3A46` | `#ECECF2` |
| `text-secondary` | color | `#9B9BA8` | `#8B8B99` |
| `text-muted` | color | `#BEBECB` | `#565662` |
| `border` | color | `#EFEDE9` | `#2B2B35` |
| `accent` | color | `#4A72E0` | `#4A72E0` |
| `pastel-lav` | color | `#E5EAFB` | `#232D48` |
| `pastel-mint` | color | `#D6EFE4` | `#22352C` |
| `pastel-peach` | color | `#FBE0D2` | `#3B2E26` |
| `pastel-blue` | color | `#D8E8F7` | `#233240` |
| `pastel-yellow` | color | `#FBEFC9` | `#393324` |
| `pastel-pink` | color | `#FAD8E4` | `#3B2831` |
| `dot-lav` | color | `#6C8AE8` | `#6C8AE8` |
| `dot-mint` | color | `#8ED3B5` | `#8ED3B5` |
| `dot-peach` | color | `#F3B18C` | `#F3B18C` |
| `dot-blue` | color | `#93BEE8` | `#93BEE8` |
| `dot-yellow` | color | `#EBCB72` | `#EBCB72` |
| `dot-pink` | color | `#EE9CBE` | `#EE9CBE` |
| `font` | string | Inter | Inter |

**Notes for implementation:**
- The six `pastel-*` tokens are tag/label **backgrounds** and are the only tokens whose dark values are near-black tints rather than lightness inversions.
- The six `dot-*` tokens are theme-invariant **accent dots/borders** paired with the pastels. Pastel + dot pairs are used together (e.g. `pastel-mint` background with `dot-mint` marker).
- `accent` and every `dot-*` token are theme-invariant. Contrast must therefore be verified against **both** `bg` values — this is the concrete risk behind the PRD's WCAG AA NFR.
- Icon set is **Phosphor Icons** throughout; typeface is **Inter**.

---

## B. Source Design File — Frame Traceability

`docs/ui-design.pen`. **28 top-level frames**: 24 product screens, 2 reusable components, 1 marketing design study, 1 blank canvas artifact. App frames are 1600×1000 desktop / 390 wide mobile; the auth and landing frames are 1440 wide.

**Verification, 2026-08-19.** The design file was regenerated (format version string moved from `4` to `2.17`) and grew by four frames. All 24 previously-cited frame IDs were re-checked against the file and resolve correctly — **no ID drift**. The 21 design tokens are unchanged. The four additions are `TsKgU`, `Y9MTL5`, `xZjeU`, and `QR1ih`.

| ID | Frame name | Platform | Kind | PRD coverage |
| --- | --- | --- | --- | --- |
| `bi8Au` | Frame | — | Blank canvas artifact | Not a product screen |
| `s4eslt` | Weekly Kanban App | Desktop 1600×1000 | Primary | §4.2 |
| `OsCBi` | Weekly Kanban App — Dark | Desktop | Theme variant | §4.1 FR-2 |
| `tqz8m` | Mobile — Week | Mobile 390×844 | Primary | §4.2 FR-11 |
| `gVeeb` | Weekly Kanban — Task Detail | Desktop | State | §4.2 FR-9 |
| `rOs0l` | Week — Empty | Desktop | Empty state | §4.2 FR-10 |
| `xiXYN` | Week — Overflow (Sticky Add) | Desktop | Edge case | §4.2 FR-10 |
| `GjmCT` | **Task Card** | 250×auto | Component | §4.2 FR-8 |
| `A8V5X` | Task Detail Panel | 468×1000 | Overlay | §4.3 |
| `I33L1Q` | Mobile — Task Detail | Mobile 390×1210 | Overlay | §4.3 FR-13 |
| `Tqx3s` | **Project Card** | 460×auto | Component | §4.4 FR-19 |
| `j5kVj` | Projects — Dashboard | Desktop | Primary | §4.4 FR-19 |
| `lljnL` | Projects — Dashboard (Dark) | Desktop | Theme variant | §4.1 FR-2 |
| `o9B30` | Projects — Empty | Desktop | Empty state | §4.4 FR-22 |
| `Y5TXZ` | Projects — New Project Modal | Desktop | Modal | §4.4 FR-21 |
| `XaHLd` | Projects — List View | Desktop | Primary | §4.4 FR-20 |
| `AeZUD` | Project — Detail | Desktop | Primary (list) | §4.5 FR-27 |
| `gheFw` | Project — Detail (Board) | Desktop | Primary (board) | §4.5 FR-26 |
| `Er1gs` | Mobile — Project Board | Mobile 390×844 | Primary | §4.5 FR-30 |
| `z7ZH8` | Projects — Link Note Modal | Desktop | Modal | **Deferred v2** — §D below |
| `ft72J` | Notes — Editor | Desktop | Primary | **Deferred v2** — §E below |
| `W6V7FQ` | Notes — Editor (Dark) | Desktop | Theme variant | **Deferred v2** |
| `RPGnv` | Notes — Empty | Desktop | Empty state | **Deferred v2** |
| `nDqBf` | Notes — Editor (Unlinked) | Desktop | State | **Deferred v2** |
| `TsKgU` | Auth — Login | 1440×900, light | Primary | §4.2 FR-5 |
| `Y9MTL5` | Auth — Register | 1440×900, light | Primary | §4.2 FR-4 |
| `xZjeU` | Auth — Forgot Password | 1440×900, light | Primary | §4.2 FR-6 |
| `QR1ih` | Landing Page | 1440×auto, light | **Design study** | No FRs — §G below |

**Structural note:** `I33L1Q` is not an independent frame — it is a `ref` instance of `A8V5X` at 390 px width, overriding only the close icon (`x` instead of the desktop control). The design file is therefore explicit that mobile Task Detail is the *same component* re-flowed, not a parallel screen. Build it that way.

**Auth frame structure.** All three auth frames share one composition: a `Login Left` pane holding the `Form`, and a `Login Brand` pane holding `Brand Text`, a `Social Proof` block, and two absolutely-positioned `ref` instances of the **Task Card** component (`GjmCT`) named *Peek Design* and *Peek Meeting* — rotated −4° and +3°, drop-shadowed, with overridden content (*"Finalize onboarding flow"* / `dot-lav`, *"Sprint retro & planning"* / `dot-yellow`). The product's own component is doing duty as marketing imagery, which is worth preserving: it means the Task Card cannot be allowed to look bad. None of the three frames has a dark variant.

**Correction to the earlier `docs/prd.md`:** that document lists `z7ZH8` as an unspecified gap whose "frame body duplicates the Project Detail content". The duplication is simply the modal's backdrop — the frame carries a fully specified modal on top of it (§D).

---

## C. Why collaboration was cut

The design file is seeded with a convincing team: four named members with role labels (Nuwan K. — Owner, Alex L. — Designer, Jordan S. — Engineer, Mia L. — Product), an "Invite member" action, a "Share" action in the Project Detail header, stacked avatar groups on every Project Card and list row, a Members stat chip reading "4", and a per-Task Assignee field.

**Decision:** none of it is built in v1. Litmus is single-user.

**Rationale:** building for one real user and several fictional ones is the most expensive kind of half-measure. Real membership pulls in accounts, invitations, a permission model, per-project access checks, data isolation, and an entire second class of bugs — for a product whose stated user is its builder. Avatars that always show "NK" cost nothing; avatars that *might* show someone else cost a backend.

**Consequences kept deliberately visible in the PRD** rather than silently dropped, so the layouts stay honest:
- The Members stat chip is retained reading `1` (PRD FR-24, FR-28).
- The list view's Team column is retained showing one avatar (PRD FR-20).
- Assignee remains a Task field but always resolves to the account holder (PRD FR-16).
- Members panel, "Invite member", and "Share" are not rendered at all (PRD FR-28, §5).

Both retained-layout choices are flagged as assumptions for confirmation — the alternative is redesigning the stat row and the table without them, which is a design change rather than a scope change.

**Note on auth:** cutting collaboration does *not* cut authentication. "Synced from day one" requires one Account and a sign-in per device. That is a single-tenant identity for data portability, not the foundation of a permission model — and it should not be built as though it will become one.

---

## D. Link Note Modal (`z7ZH8`) — full specification, preserved for v2

The design specifies this completely. Recorded here so v2 does not re-derive it.

**Form:** a command-palette style overlay on top of Project Detail (board view), invoked from a "Link a note" action in the Linked Notes panel of either Project Detail or Task Detail.

**Contents, top to bottom:**
1. **Search field** — placeholder `Search notes to link…`, with an `esc` key hint rendered inline at the right edge.
2. **Create-and-link row** — `New note` / supporting line `Create a new note and link it to this project`, with an `↵` key hint. Creates a Note and links it in one action.
3. **`RECENT NOTES` section** — a list of notes, each row showing the note name with its parent folder beneath or beside it. Observed rows: *Components* (Design System), *Design Tokens* (Design System), *Guidelines* (Design System), *Roadmap 2026* (Projects), *Welcome* (Getting Started).
4. **Footer key legend** — `↑↓ Navigate` · `↵ Select` · `esc Close`.

**Implied requirements:** full keyboard operation (arrow navigation, enter to select, escape to dismiss), a recency-ordered default list before any query is typed, and folder context shown alongside every result so same-named notes in different folders are distinguishable.

---

## E. Notes surface — deferred specification

The four Notes frames are fully designed. v2 ships **markdown-lite**; the remainder is v3 or later. Both tiers are recorded so the cut line is explicit.

### E.1 Structure (v2)

- **Left panel** — "Notes" header with new-note, new-folder (`folder-simple-plus`), and overflow actions; a `Search notes` field.
- **Folder tree** — collapsible, arbitrarily nested. Observed structure: *Getting Started* (Welcome, Keyboard Shortcuts), *Projects* → *Design System* (Tokens, Components, Guidelines) and *Mobile App* (Roadmap 2026), *Daily Notes* (`2026-08-13`, `2026-08-12`), *Ideas*, *Reading List*.
- **Daily-notes convention** — a folder holding ISO-date-named notes. Worth treating as a first-class convention rather than an accident of the sample data.
- **Note header** — breadcrumb path (`Projects / Design System / Components`), `Edited 2h ago` relative timestamp, bookmark/star and overflow actions.
- **Linked context row** — when linked, shows the linked Project (folder icon) and linked Task (checkbox icon) with a `+ Link` action; when unlinked (`nDqBf`), shows a `Link project or task` prompt in its place.
- **Tag chips** below the title (`#design-system`, `#ui`, `#components`) with an `· Updated Aug 13, 2026` line.
- **Empty state** (`RPGnv`) — icon, "No note open", supporting copy "Select a note from the sidebar to start reading, or create a new one to begin writing.", and `New Note` / `New Folder` CTAs. Note the tree remains visible; only the reading pane is empty.
- **Body formatting (markdown-lite)** — headings, paragraphs, bold/italic, bulleted and numbered lists, task checklists, inline links, and note-to-note `See also:` references.

### E.2 Deferred beyond v2 (v3+)

- **Slash-command block menu** — the design's own tip text specifies the behaviour: *"Type '/' to insert a block, or select text to format it inline — markdown shortcuts like \*\*bold\*\*, \*italic\*, and # heading render live as you type."*
- **Formatting toolbar** — `text-bolder`, `text-italic`, `text-underline`, `text-strikethrough`, `link-simple`, `code` controls on text selection.
- **Code blocks** — with a language label (`tsx` observed) and a copy action.
- **Callouts** — a `lightbulb`-iconed "Tip" block.
- **Task checklists pulled from a related Task** — frame `nDqBf` shows a note surfacing a related Task's checklist without a hard link, which is a distinct feature from note↔task linking and needs its own thinking.

### E.3 Keyboard shortcuts

The tree contains a *Keyboard Shortcuts* note and the Link Note Modal specifies arrow/enter/escape navigation, so a shortcut layer was clearly intended. Deferred entirely from v1 (PRD §6.2); it should be designed as one coherent layer rather than accreted per-surface.

---

## F. Detail observed in the design worth preserving

Small specifics that would otherwise be lost between the PRD's requirement statements and the design file's 1.4 MB of JSON.

- **Sample data shape** — 6 projects, 85 tasks, 12 tasks in the sample week. Projects observed: Design System (68%, 12 tasks, 3 due), Mobile App (42%, 18, 5), Q3 Marketing (80%, 9, 2), Product Launch (30%, 24, 6), User Research (55%, 7, 1), Website Redesign (20%, 15, 4). Useful as a realistic seed/fixture set.
- **Categories observed** — Design, Dev, QA, Docs. Only four; no management surface exists (PRD Open Question 5).
- **Project attributes observed** — Status `Active`, Priority `High`, Colour `Mint`, Due date `Aug 30, 2026`, Created `Jul 28, 2026`.
- **Done-column cards** replace the due date with the literal word `Completed` rather than showing a past date.
- **Undated cards** show a `Set date` affordance with a `calendar-plus` icon in the slot where a due date would be — making the Week Board's entry point visible from the Project Board.
- **Week Board wording drift** — the default frame (`s4eslt`) uses `Add a task`; the task-detail-open frame (`gVeeb`) uses `Add task`. Pick one. `Add a task` is the majority and reads better.
- **`New Task` header button** appears on `gVeeb` but not on `s4eslt` — the PRD resolves this by specifying it as always present (FR-7).
- **Drag affordances** — `dots-six-vertical` handle on cards, `hand-grabbing` icon on the drop target, literal drop-zone text `Drop to move here`.
- **Relative timestamps** are used throughout (`Updated 2h ago`, `Edited 1d ago`, `Edited 3d ago`) rather than absolute ones — a small but consistent voice decision.
- **Mobile Week header** condenses the date range by dropping the year (`August 10 – 16 · 12 tasks` vs. desktop's `August 10 – 16, 2026 · 12 tasks`).

---

## G. Landing Page (`QR1ih`) — design study, and the claims it makes

The landing page was **confirmed during discovery as a mock**: not a deliverable, and not a source of requirements. It is recorded here because it is the clearest existing statement of how Litmus would be positioned if it were ever a product, and because several of its claims are genuinely good ideas that deserve to be found again rather than rediscovered.

### G.1 Every product claim, against its actual v1 status

| Landing page claim | Actual v1 status |
| --- | --- |
| "Now with a full Notes module" (hero badge) | **Deferred to v2** — PRD §6.2 |
| Notes: "WYSIWYG markdown editor with nested folders, **backlinks**, and links to any project or task" | v2 as markdown-lite; **backlinks are not specified anywhere in the Notes frames** and would be new scope |
| "Command palette — jump anywhere and link anything in a couple of keystrokes" | **Not in v1** — PRD §5, §6.2 |
| "Fast & light — instant load, **keyboard-first**, buttery drag-and-drop" | Drag-and-drop yes (FR-30, FR-34); keyboard-first no |
| "Your data, yours. Private by default. **Export anytime, no lock-in**" | Private yes (NFR §8); **export is a Non-Goal**, flagged for revisit as PRD Open Question 11 |
| "Dark mode — a calm dark theme that's easy on the eyes" | Yes (FR-2), except the auth screens themselves |
| "Web & mobile — a layout tuned for desktop and a focused view on your phone" | Yes (FR-15, FR-34) |
| "Everything links — connect notes to projects and tasks" | v2 with Notes |
| Pricing nav · "Free forever · No credit card required" | **No monetization at all** — PRD §5 |
| "Trusted by **12,000+ focused teams**" · "Join 12,000+ people" | Placeholder. Single user, single Account |
| `app.litmus.so/week` (browser chrome in the hero mock) | No domain split; one app |
| Footer: About, Blog, Careers, Docs, Changelog, Support, Privacy, Terms, Cookies | None exist. Note that Privacy and Terms *are* referenced by the register screen's consent checkbox (FR-4) — that link needs a destination even in a hobby build |

### G.2 Positioning language worth keeping

The mock articulates the product thesis more crisply than the PRD's own vision section did, and the phrasing is reusable in-product:

- **"The calm home for your week."** — the tagline, and a good one-line test for any future feature: does it make the week calmer?
- **"Litmus unifies your weekly tasks, projects, and notes in one minimal, focused workspace — so you always know what to do next."**
- **"Three tools, one calm flow. Tasks, projects, and notes that actually talk to each other — no more juggling five apps."** — this is the §4.7 Cross-Surface Rules requirement stated as a value proposition.
- **"Everything in its right place."** — section header for the why-Litmus grid.
- Per-module one-liners: Week — *"Plan every day on a simple kanban board. Drag tasks between days, set a due date, and always know what's next."* Projects — *"Group related work, track progress at a glance, and schedule project tasks straight into your week."* Notes — *"A WYSIWYG markdown editor with nested folders, backlinks, and links to any project or task."*

### G.3 Page structure, if it were ever built

`QR1ih` → `bEgmt` Nav (logo, links: Features / Modules / Pricing / Changelog, right: Log in + Get started) · `rqhpi` Hero (badge, H1, sub, CTA row "Get started free" + "Watch demo", note line, and an `App Preview` mock showing a browser chrome at `app.litmus.so/week` with a four-day Week Board) · `d08sK` Modules (three cards with "Learn more") · `D234Em` Features (six-cell grid) · `B5zE8w` CTA Band · `uuw76` Footer (four link columns + legal row).

### G.4 The one thing worth acting on

**Data export.** It is the only claim on the page that costs little, matters most for a tool holding years of personal planning data, and has no design dependency. The PRD keeps it as a Non-Goal per the confirmed hobby scope, but flags it in §5 and Open Question 11 as the first candidate for v1.1.
