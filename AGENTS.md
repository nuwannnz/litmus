# AGENTS.md

Guidance for coding agents working in this repository.

**The instructions live in [`CLAUDE.md`](./CLAUDE.md) — read that file.** It is the single
source of truth for what Litmus is, where the PRD, architecture and design files live, how
documents are versioned, the branching model, and repository policy. This file is a pointer
rather than a copy so the two cannot drift apart.

Scoped guidance lives alongside the code it describes: [`src/client/CLAUDE.md`](./src/client/CLAUDE.md)
covers the Nx workspace — commands, module contract, data layer, styling — and applies when
working in that directory.

The rules most often broken by an agent that skipped the file:

- **Never push to `main` or `develop`.** Feature branches are cut from `develop` and merge back
  by PR. `main` is production and only moves via a release PR from `develop`.
- **Use Conventional Commits.** The application version is derived from them, so the prefix is
  load-bearing, not decorative.
- **Bump the version** in the frontmatter of `docs/prd.md` or `docs/architecture.md` whenever you
  change either, and add a Revision History row.
- **Never read `docs/ui-design.pen` whole** — it is ~1.5 MB of JSON. Look screens up by the IDs
  cited in `docs/prd.md`.
