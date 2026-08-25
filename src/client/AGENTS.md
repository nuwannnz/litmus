# AGENTS.md — `src/client`

**The instructions live in [`CLAUDE.md`](./CLAUDE.md) in this directory — read that file.** It
covers the commands, the Nx layout, the feature-module contract, the data layer and styling. This
file is a pointer rather than a copy so the two cannot drift apart.

Repo-wide guidance — what Litmus is, document versioning, branching, policy — is in the
[root `CLAUDE.md`](../../CLAUDE.md).

Two things worth knowing before changing anything here:

- **Vitest and ESLint are configured, but not everywhere.** `npm test` covers `libs/domain`
  only, and there is no component/DOM testing, pgTAP or E2E yet. `CLAUDE.md` has the real
  commands and the current limits — read them there rather than assuming either way.
- **The reducer in `libs/core` is prototype code.** `docs/architecture.md` plans to replace it
  with TanStack Query. Read that document as intent, not as a description of what is here.
