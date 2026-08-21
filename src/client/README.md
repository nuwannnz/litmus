# Litmus client

Nx monorepo for the Litmus client. One React + TypeScript app today (`apps/web`,
built with Vite); the layering is set up so a desktop shell can be added later
without moving any feature code.

## Getting started

```bash
npm install
npm run dev        # http://localhost:4200
npm run build      # → dist/apps/web
npm run typecheck
npm run graph      # Nx dependency graph
```

Auth is not wired to a backend yet: any credentials sign you in, and the session
is kept in `localStorage`. All workspace data is the seed set in `@litmus/domain`.

## Layout

```
apps/
  web/            the shipped app — routing, auth, the shell, the landing page
libs/
  ui/             design system: tokens, primitives, icons, theme, toasts
  domain/         types, constants, seed data, pure helpers
  core/           workspace state, the command registry, the module contract
  week/           Week board + Task Detail
  projects/       Projects dashboard + Project Detail
  notes/          Notes tree + editor
```

Dependencies run one way: `domain → ui → core → feature modules → apps/web`.

## Modules

Week, Projects and Notes are libraries, not folders inside the app. Each exports
a single `AppModule` descriptor:

```ts
export const weekModule: AppModule = {
  id: 'week',
  label: 'Week',
  icon: 'calendar',
  path: 'week',
  routes: [{ index: true, element: <WeekPage /> }],
  Bridge: WeekCommands,   // publishes this module's command-palette entries
};
```

`apps/web/src/app/modules.ts` lists them; the shell builds the navigation rail,
the router and the `1`/`2`/`3` shortcuts from that list alone. The shell never
imports a module's internals, and modules never import each other — they link
across through `appPaths` and share UI through `@litmus/ui`.

That is what keeps the promised split cheap. To lift Notes into its own Nx app,
add `apps/notes-app`, point it at `@litmus/notes`, and drop `notesModule` from
the web app's list. Nothing inside `libs/notes` has to change.

## Adding the desktop app

Add `apps/desktop` (Electron or Tauri) with its own Vite config and reuse the
same libraries — the renderer can mount `AppShell` with the same module list.
Only `apps/web` holds web-specific concerns, so nothing needs to be untangled
first.

## Styling

CSS is plain, token-driven and split by owner: `@litmus/ui` holds the tokens,
the reset and every shared primitive; each module ships the layout only it uses.
Themes are `data-theme` on `<html>`, switched by `ThemeProvider` and remembered
in `localStorage`.

## Not built yet

The API. Every mutation goes through the reducer in `libs/core/src/workspace`,
so that is the single place the data layer plugs into. Drag-and-drop, inline
editing, search, the command palette and both themes all work against in-memory
state today.
