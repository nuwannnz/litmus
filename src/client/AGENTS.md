# AGENTS.md — `src/client`

**The instructions live in [`CLAUDE.md`](./CLAUDE.md) in this directory — read that file.** It
covers the commands, the Nx layout, the feature-module contract, the data layer and styling. This
file is a pointer rather than a copy so the two cannot drift apart.

Repo-wide guidance — what Litmus is, document versioning, branching, policy — is in the
[root `CLAUDE.md`](../../CLAUDE.md).

Two things worth knowing before changing anything here:

- **There is no test runner or linter yet.** Don't invent commands or assume a framework.
- **The reducer in `libs/core` and the split between `Task` and `ProjectTask` are prototype
  code.** `docs/architecture.md` plans to replace both. Read that document as intent, not as a
  description of what is here.
