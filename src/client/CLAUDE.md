# CLAUDE.md — `src/client`

The Litmus web client: an Nx + npm-workspaces monorepo. Repo-wide guidance —
what Litmus is, where the PRD and design file live, document versioning,
branching, policy — is in the root `CLAUDE.md`. This file covers only what is
true inside this directory.

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
should be updated with the real invocations. (`docs/architecture.md` §7 plans
Vitest, pgTAP and Playwright; none of it exists yet.)

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
`@litmus/projects`, `@litmus/notes`) are declared in `tsconfig.base.json`.

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

> Note for when the backend lands: `docs/architecture.md` §3.1 merges `Task`
> and `ProjectTask` into one type, and §5.1 replaces this reducer with
> TanStack Query. Both are planned, neither has happened — the code here is
> still the in-memory prototype.

**Styling**: plain CSS, token-driven, split by owner — `@litmus/ui` holds
tokens/reset/shared primitives, each module ships only its own layout CSS.
Theme is `data-theme` on `<html>`, switched by `ThemeProvider`
(`@litmus/ui`) and persisted in `localStorage`.

## Versioning

`apps/web/package.json`'s `version` is the application version — the one
FR-38 shows in Settings, derived from Conventional Commits by release-please.
Don't edit it by hand. Library versions in `libs/*` are meaningless; they are
never published.
