# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Litmus is a personal task/project/notes web app: a 7-day Week board, Projects
with kanban and list views, and folder-based Notes linked back to both. Light
and dark themes are required on every primary screen, with mobile layouts for
Week, Task Detail and Project Board. It's a single-user hobby product — no
teams, invitations, or permission model.

There is no backend yet. All app state is in-memory (seed data + a reducer);
auth accepts any credentials and just stores a session in `localStorage`.

## Where things live

- **Product requirements**: `docs/prd.md` (FR-1…FR-37, journeys, glossary) and
  `docs/prd-addendum.md` (screen-ID index, deferred specs, rejected
  alternatives). Read `prd.md` first; the addendum is a companion, not a
  duplicate.
- **Design source**: `docs/ui-design.pen`, ~1.5 MB of JSON. Never read it
  whole — look up a screen by its ID (cited in `prd.md`), e.g.
  `grep -n '"id": "A8V5X"' docs/ui-design.pen`. Prefer the `pencil` MCP tools
  over raw Read/Grep when actually editing or generating design content.
- **Clickable prototype**: `docs/prototype/` — static HTML/CSS/JS, no build
  step, unrelated to the real app's code. Useful for seeing intended
  behavior (`open docs/prototype/index.html`), not a source of truth for
  implementation.
- **App code**: `src/client/`, an Nx + npm-workspaces monorepo. See
  "Architecture" below.
- **New planning docs** (architecture decisions, ADRs, further specs) belong
  in `docs/`, alongside the PRD — don't scatter them elsewhere in the repo.

## Commands

All run from `src/client/`:

```bash
npm install
npm run dev         # nx serve @litmus/web — http://localhost:4200
npm run build        # nx build @litmus/web → dist/apps/web
npm run preview       # nx preview @litmus/web
npm run typecheck     # tsc -p tsconfig.json --noEmit
npm run graph        # nx dependency graph
```

There is no test runner or linter configured yet. Don't invent test/lint
commands or assume a framework is present — if one gets added, this file
should be updated with the real invocations.

## Architecture

Nx monorepo, one shipped app today:

```
apps/web/      the app — routing, auth, the shell, the landing page
libs/ui/       design system: tokens, primitives, icons, theme, toasts
libs/domain/   types, constants, seed data, pure helpers
libs/core/     workspace state (reducer), the command registry, the module contract
libs/week/     Week board + Task Detail
libs/projects/ Projects dashboard + Project Detail
libs/notes/    Notes tree + editor
```

Dependencies run one way: `domain → ui → core → feature modules → apps/web`.
Path aliases (`@litmus/ui`, `@litmus/domain`, `@litmus/core`, `@litmus/week`,
`@litmus/projects`, `@litmus/notes`) are declared in
`src/client/tsconfig.base.json`.

**Feature modules are libraries, not folders inside the app.** Week,
Projects and Notes each export a single `AppModule` descriptor (contract in
`libs/core/src/modules/types.ts`):

```ts
export const weekModule: AppModule = {
  id: 'week',
  label: 'Week',
  icon: 'calendar',
  path: 'week',
  routes: [{ index: true, element: <WeekPage /> }],
  Bridge: WeekCommands, // publishes this module's command-palette entries
};
```

`apps/web/src/app/modules.ts` lists them; the shell builds the nav rail, the
router, and the `1`/`2`/`3` shortcuts from that list alone. **The shell never
imports a module's internals, and modules never import each other** — they
link across through `appPaths` (`@litmus/core`) and share UI through
`@litmus/ui`. Add a module by adding a library plus one entry in
`modules.ts`.

**Data layer**: `libs/core/src/workspace` holds a single reducer
(`WorkspaceAction` union) operating on `WorkspaceState` (tasks, projects,
projectTasks, notes), seeded via `structuredClone` from `libs/domain`'s seed
data. This is the one place an API would plug in — there's no fetch/service
layer to route around when it does.

**Styling**: plain CSS, token-driven, split by owner — `@litmus/ui` holds
tokens/reset/shared primitives, each module ships only its own layout CSS.
Theme is `data-theme` on `<html>`, switched by `ThemeProvider`
(`@litmus/ui`) and persisted in `localStorage`.

## Policy

- Always use feature branches and semantic comments
- Never push to `main` — PRs only, one approval required.
