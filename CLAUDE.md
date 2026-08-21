# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scoped guidance lives alongside the code it describes — `src/client/CLAUDE.md` covers the Nx
workspace (commands, module contract, data layer, styling) and is loaded when working in there.
Keep repo-wide facts here and workspace detail there.

## What this is

Litmus is a personal task/project/notes web app: a 7-day Week board, Projects
with kanban and list views, and folder-based Notes linked back to both. Light
and dark themes are required on every primary screen, with mobile layouts for
Week, Task Detail and Project Board. It's a single-user hobby product — no
teams, invitations, or permission model.

There is no backend yet. All app state is in-memory (seed data + a reducer);
auth accepts any credentials and just stores a session in `localStorage`.
`docs/architecture.md` describes the backend that is planned but not built —
read it as intent, not as a description of the code.

## Where things live

- **Product requirements**: `docs/prd.md` (FR-1…FR-39, journeys, glossary) and
  `docs/prd-addendum.md` (screen-ID index, deferred specs, rejected
  alternatives). Read `prd.md` first; the addendum is a companion, not a
  duplicate.
- **Architecture**: `docs/architecture.md` — stack decisions, data model,
  environments, branching, CI/CD, versioning. Status is `proposed`: none of it
  is implemented yet.
- **Design source**: `docs/ui-design.pen`, ~1.5 MB of JSON. Never read it
  whole — look up a screen by its ID (cited in `prd.md`), e.g.
  `grep -n '"id": "A8V5X"' docs/ui-design.pen`. Prefer the `pencil` MCP tools
  over raw Read/Grep when actually editing or generating design content.
- **Clickable prototype**: `docs/prototype/` — static HTML/CSS/JS, no build
  step, unrelated to the real app's code. Useful for seeing intended
  behavior (`open docs/prototype/index.html`), not a source of truth for
  implementation.
- **App code**: `src/client/`, an Nx + npm-workspaces monorepo. See
  `src/client/CLAUDE.md`.
- **New planning docs** (architecture decisions, ADRs, further specs) belong
  in `docs/`, alongside the PRD — don't scatter them elsewhere in the repo.

## Document versioning

`docs/prd.md` and `docs/architecture.md` carry a `version` in their YAML
frontmatter and a Revision History table at the end. **Any change to either
file bumps the version and adds a row.** Semantic versioning, applied to
prose:

- **MAJOR** — a previously stated requirement or decision is **withdrawn or
  reversed**. Work already built against the old text is now wrong.
- **MINOR** — new requirements, sections or decisions **added**. Everything
  already stated still holds.
- **PATCH** — clarifications, typos, formatting, cross-reference fixes. No
  one's understanding changes.

Also update `updated:` in the frontmatter. When the two documents disagree,
`prd.md` wins — it says what the product must do; `architecture.md` says how,
and declares which PRD version it was written against via `requires:`.

Never renumber an existing FR. New requirements take the next free number even
when that puts them out of order in their section — FR IDs are referenced from
tests, commits and the addendum, and stability is worth more than tidiness.

## Branching and environments

```
feature/*  ──PR──▶  develop  ──PR──▶  main
   │                   │                │
   local            dev env         production
```

- **`main` is production.** Deployed and tagged. Never commit to it directly.
- **`develop` is the dev environment.** Everything integrates here first.
- **Cut feature branches from `develop`**, never from `main`, and merge them
  back into `develop` by PR.
- **Release by PR from `develop` into `main`.**
- **Hotfixes** branch from `main` and PR into `main`, then are **immediately
  back-merged into `develop`** — otherwise the next release reverts them.
- After a release, **back-merge `main` into `develop`**: release-please commits
  the version bump and `CHANGELOG.md` onto `main` only.

CI/CD is GitHub Actions — `ci.yml` on every PR, `deploy-dev.yml` on `develop`,
`deploy-prod.yml` and `release-please.yml` on `main`. Details in
`docs/architecture.md` §6.

## Policy

- Always use feature branches and semantic comments (Conventional Commits —
  the app version is derived from them, so the prefix is load-bearing).
- Never push to `main` or `develop` directly — PRs only, one approval required.
- Bump the document version whenever `docs/prd.md` or `docs/architecture.md`
  changes (see above).
