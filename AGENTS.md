<!-- bmad:context -->
<!-- Verified 2026-08-19 against a8b3a1e. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## litmus

Litmus is a personal task, project and notes web app: a 7-day Week board, Projects with kanban and list views, and folder-based Notes linked back to both. Light and dark themes are required on every primary screen, with mobile layouts for Week, Task Detail and Project Board. No application code exists yet and the stack is undecided — requirements live in `docs/prd.md`, the source design in `docs/ui-design.pen`, and BMad planning output lands in `_bmad-output/`.

## Policy

- Never push to main; PRs only, one approval required.
- Never hand-edit `.agent/`, `.agents/`, `.claude/skills/`, `.kiro/`, `.opencode/`, `.github/agents/` or `_bmad/` — the BMad installer overwrites them. Put overrides in `_bmad/custom/`.

## Where things are

- Requirements: `docs/prd.md`. The screen and component IDs in §5 and §10 are the index into the design file.
- Design source: `docs/ui-design.pen`, 1.4 MB of JSON. Never read it whole — look a screen up by its ID, e.g. `grep -n '"id": "A8V5X"' docs/ui-design.pen`.

## Running and verifying

- TODO: no build, test or lint commands exist yet. When the stack is chosen, set up Prettier and ESLint and record the working invocations here.

## Conventions that differ from defaults

- Scope searches to `docs/` and the app source; 4,567 of 4,569 tracked files are BMad tooling, and `.agent/skills`, `.agents/skills`, `.claude/skills` and `.kiro/skills` are byte-identical copies that return every hit four times.

<!-- /bmad:context -->
