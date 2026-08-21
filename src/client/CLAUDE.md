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

## The local backend

`supabase/` at the **repo root** holds the local stack, and `config.toml` is committed — so a
fresh clone gets an identical Postgres and auth from one command. A Docker daemon (Docker
Desktop, OrbStack, Colima) has to be running first.

```bash
# from the repo root, not src/client/
supabase start      # pulls images on the first run, then boots Postgres + auth + Studio
supabase status     # prints the URLs and the local keys
supabase stop       # stops the containers; add --no-backup to also drop the local data
```

Install the CLI with `brew install supabase/tap/supabase`, or prefix each command with
`npx supabase@latest` for a one-off. It is deliberately not an npm dependency of this
workspace — it is a repo-level tool, not a client one. Ports come from `config.toml`:

| | URL |
|---|---|
| API — PostgREST and auth | `http://127.0.0.1:54321` |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Local inbox — auth mail | `http://127.0.0.1:54324` |

`supabase status` prints the local `anon` key; it and the API URL are what `VITE_SUPABASE_URL`
and `VITE_SUPABASE_ANON_KEY` point at locally (`docs/architecture.md` §6.2). The anon key is
public by design — RLS is the whole security model (§2.2).

Email and password sign-in works out of the box, with confirmations off locally, so mail that
would otherwise have been sent — including the FR-6 reset link — is readable in the local
inbox above. Google and Apple sign-in are left disabled rather than half-configured: FR-7 is
still an open decision (PRD §10 Q1).

Three things the config turns off on purpose — **Storage** (a v2 concern, §3.3), **Edge
Functions** (none in v1, §4.4, so `supabase/functions/` stays empty), and the
**analytics/Logflare** container (nothing depends on it and it is the slowest to boot).

There is no schema yet. `supabase/migrations/` and `seed.sql` arrive with the rest of EP-2;
until then `supabase start` gives you an empty database behind a working auth service.

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
