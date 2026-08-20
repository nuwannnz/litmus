# Rubric walk — good-spine checklist

**Fixes the real divergence points for the level below.** Yes, for domain state. FR-35/36/37 — the
PRD's own named risk — are structurally enforced by AD-1/3/4/5 rather than documented. Misses the
ring of *incidental* shared state; see review-adversarial-seams.md.

**Every Rule enforceable, and actually prevents its stated divergence.** Mostly. AD-2 and AD-15 are
mechanically enforced by lint. AD-6's "sub as first argument so an unscoped query cannot compile" is
a genuine compile-time barrier. AD-3, AD-4, AD-8, AD-12, AD-14 are review-enforced but stated
concretely enough to check in a diff. AD-16 is the softest — "must also be reachable" is a testable
claim but not a mechanical one; acceptable for an accessibility rule.

**Nothing under Deferred lets two units diverge.** Checked each. Notes, real-time push, offline,
server search, observability, export, registration closure and social sign-in are all additive or
external. The read-scaling deferral carries an explicit tripwire in AD-3. Clean.

**Named tech verified-current.** Yes — see review-currency-check.md.

**Brownfield ratification.** Not applicable; no application code exists. AGENTS.md's standing
policies (PR-only to main, never hand-edit `_bmad/`) are unaffected by this spine, and its "no build
or test commands yet" TODO is now answerable.

**Covers the driving spec's capabilities.** All seven PRD feature groups are mapped, plus
persistence, API and delivery. FR-1 through FR-37 accounted for.

**Parent spine.** None inherited.

**Every dimension decided, deferred, or an open question.** Operational envelope is present and
strong (AD-17/18/19 plus deployment and promotion diagrams) — the dimension most often left silent.
Security: AD-6, AD-20, AD-21. Data model: AD-6/7/8. Delivery: AD-19.

*Finding — schema evolution is silent.* Nothing says how a stored item's shape changes over time,
which matters because a single-table design is shared by every module and Notes is a committed v2
addition. Needs a type discriminator and schema version.

*Finding — testing gets one conventions row.* Thin, but arguably correct at this altitude for a
solo hobby build; the row does name the fixture set, which is the part that must not diverge.

## Verdict
Strong on the domain risk it was built for and on the operational envelope. Two structural gaps to
close (schema evolution, and the incidental-state ring), then it is a solid build substrate.
