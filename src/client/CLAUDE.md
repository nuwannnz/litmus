# CLAUDE.md — `src/client`

The Litmus web client: an Nx + npm-workspaces monorepo. Repo-wide guidance —
what Litmus is, where the PRD and design file live, document versioning,
branching, policy — is in the root `CLAUDE.md`. This file covers only what is
true inside this directory.

## Commands

All run from `src/client/`:

```bash
npm install
npm run dev          # nx serve @litmus/web — http://localhost:4200
npm run build        # nx build @litmus/web → dist/apps/web
npm run preview      # nx preview @litmus/web
npm run typecheck    # tsc -p tsconfig.json --noEmit, over the whole workspace
npm test             # nx run-many -t test — Vitest
npm run lint         # nx run-many -t lint — ESLint, --max-warnings=0
npm run lint:fix     # the same, with --fix
npm run format       # prettier --write .
npm run format:check # prettier --check .
npm run graph        # nx dependency graph
```

`package.json` is the only source of truth for what exists — don't invent a
script that isn't in it. `npm test` and `npm run lint` fan out over every
project that has the target, so neither script needs editing when a library
gains one. For a scoped run on a feature branch, use
`npx nx affected -t lint test --base=origin/develop`; pass `--base` explicitly,
because `nx.json` sets `defaultBase` to `main`, which is the wrong comparison
point for a branch cut from `develop`.

### Testing

Vitest, and **`libs/domain` is the only project set up for it today**. The
wiring is Nx's inferred-target style: `@nx/vite/plugin` (declared in `nx.json`)
finds `libs/domain/vite.config.ts`, sees a `test` block, and infers a `test`
target from it — no `targets` entry in any `package.json` to maintain.
`apps/web/vite.config.ts` has no `test` block, so it gets no test target, and
`nx run-many -t test` currently runs exactly one project. A library joins the
suite by gaining its own `vite.config.ts` with a `test` block.

Specs sit beside the code they cover (`libs/domain/src/utils/date.spec.ts`),
and a test names the requirement it pins where it has one —
`it('FR-10: …', …)`, per `docs/architecture.md` §7.5.

What does **not** exist yet, so don't assume it: no component or DOM testing
(no jsdom, no Testing Library) — nothing in `apps/web`, `libs/ui` or the
feature libs is covered; no pgTAP against the local Postgres; no Playwright and
no E2E project. `docs/architecture.md` §7 plans all three — read it as intent,
and update this section when one of them actually lands.

### Linting and formatting

ESLint 9, flat config, one file for the whole workspace:
`src/client/eslint.config.mjs`. `@nx/eslint/plugin` infers a `lint` target for
every project, and `nx.json`'s `targetDefaults` pass `--max-warnings=0` — a
warning fails the run, so fix it rather than leave it.

The dependency direction documented under Architecture below is enforced, not
just described. Each project's `package.json` carries an `nx.tags` entry
(`type:domain`, `type:ui`, `type:core`, `type:feature`, `type:app`) and
`@nx/enforce-module-boundaries` lets a tag depend only on the layers to its
left. All three feature modules share the one `type:feature` tag, which is
absent from its own allow-list, so a feature module cannot import another.
**A new library needs its tag** — an untagged project is unconstrained.

Prettier owns formatting (`.prettierrc`, `.prettierignore`), Markdown in this
directory included; `eslint-config-prettier` sits last in the flat config so
the two never argue about style. `npm run format` fixes, `npm run format:check`
is the gate.

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

|                          | URL                                                       |
| ------------------------ | --------------------------------------------------------- |
| API — PostgREST and auth | `http://127.0.0.1:54321`                                  |
| Postgres                 | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio                   | `http://127.0.0.1:54323`                                  |
| Local inbox — auth mail  | `http://127.0.0.1:54324`                                  |

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
