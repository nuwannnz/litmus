# Adversarial review — two compliant units that still diverge

Method: construct pairs of epics one level below the spine that obey every AD to the letter, yet
produce incompatible code. Each pair is a hole to close.

Pairing used throughout: **Epic A = Week Board** (`features/weeks`) and **Epic B = Project Detail**
(`features/projects`). Both legitimately render Task lists, both mutate Tasks.

## CRITICAL

**1. Ordering within a column is undefined.**
Both epics render an ordered list of Tasks and nothing fixes the order. A sorts by time range then
title; B sorts by createdAt. Worse, either may add drag-to-reorder (natural next to FR-30's existing
drag) and persist a `sortOrder` attribute — a shared-data-shape clash that also collides with AD-3,
since it is ambiguous whether order is derived or stored. Two writers, one field, no owner.

**2. Concurrent optimistic mutations can clobber each other.**
AD-14 places the optimistic patch and rollback with the operation but says nothing about two
mutations in flight for the same Task, or what the client does with the response body. Drag a card
to Done (PATCH in flight), immediately change its date: if the first response replaces the cache
entry wholesale, the second optimistic patch is silently reverted. A and B will each invent a
different answer, and the bug appears only when the user is fast.

**3. Deleting a Project has no defined effect on its Tasks.**
FR-22 covers deleting a Task; nothing covers deleting a Project, though the Project Card carries an
overflow menu. B implements it and orphans the Tasks (dangling `projectId`); A assumes `projectId`
always resolves and renders a blank project row or throws. Data-integrity hole with no owner.

## HIGH

**4. `updatedAt` semantics are unowned.** FR-24's "Updated 2h ago" is on the Project row. Does a
Project's `updatedAt` move when one of its Tasks changes? A (owns Task writes) and B (renders the
timestamp) will answer differently, and neither is wrong under the current ADs.

**5. Time range is not covered by AD-4.** AD-4 fixes `dueDate` as a calendar day, but FR-20's
start–end time range and FR-12's optional time on the card are unaddressed. This is the exact
timezone-drift bug AD-4 exists to prevent, one field over: A stores `HH:mm` local strings, B stores
instants.

**6. UI preference persistence has two plausible homes.** FR-2 puts theme on the Account so it syncs.
FR-24 says the grid/list choice "persists" and FR-29 says the board/list choice "persists per
Project" — without saying where. A uses localStorage, B follows the theme precedent and puts it on
the Account. Two preference mechanisms, and the phone disagrees with the desktop about one of them.

**7. Project colour has no defined storage form.** FR-25's picker and FR-32's "Colour: Mint". AD-15
governs CSS but not the stored value. A stores `"pastel-mint"`, B stores `"#D6EFE4"` — and the hex
breaks theming, because pastels are the one token family whose dark values are not lightness
inversions.

## MEDIUM

**8. No item type discriminator.** AD-6 fixes the key shape but not the item body. A single-table
design needs every item to declare what it is, and needs a schema version for the v2 Notes work to
migrate against. Each module will otherwise infer type from the sort-key prefix, differently.

**9. Mutation-failure UX is unspecified.** One core operation, two call sites: A toasts, B reverts
silently. AD-14 centralises the rollback but not what the user is told.

**10. Category source ambiguity.** AD-5 says "one list in the core", which reads as fixed — but PRD
Q7 is explicitly open on whether Categories are user-created. An epic may build a management surface
in good faith. Worth stating the v1 answer outright.

## Verdict
Structurally sound where it was aimed — the FR-35/36/37 drift the spine was built to stop is
genuinely stopped by AD-1/3/4/5. The holes are all one ring out: shared *incidental* state (order,
concurrency, timestamps, preferences, colour form) rather than shared domain state.
