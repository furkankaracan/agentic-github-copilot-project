# Work types — analysis checklist per issue type

## Feature (new behaviour)

- Which entity owns the rule? → the matching `src/domain/<entities>.ts`.
- New user action? → four-place wiring (domain → command → `CrmActions` → `CrmStore`).
- New page? → `src/AppRoutes.tsx` (+ `NAV_ITEMS` only for top-level lists).
- New field? → optional on the type; additive seed values; form field with `invalid` highlighting via `details.field`.
- Lifecycle involved? → `crm-lifecycle` skill is the spec.
- Typical packages: Domain 1–2 items, UI 1–2 items.

## Bug

- Reproduce with seed data first; write down exact steps and the wrong vs. expected value.
- Find the rule the code violates (instruction or skill spec) and cite it.
- **First work item is always a failing test** that reproduces the bug.
- Fix at the lowest layer that owns the rule (usually domain, not the page).
- Check for siblings with the same mistake (e.g. other metrics filtering the same stages).

## Test coverage

- List each untested exported function and its branches (validation, not-found, conflict, transitions).
- Tests-only package. If a test reveals a real bug, the design records it as a separate follow-up — tests do not change production code.

## UI-only change (layout, copy, list filtering, sorting)

- Keep state local to the page (`useState`), derived data computed during render.
- Filtering/search helpers that encode a rule (e.g. "matches name or city") belong in the domain (`searchAccounts`) so they're unit-testable.
- Confirm accessible names for new controls (labels for inputs, button text that names the action).

## Workflow / tooling

- Follow `workflow-security.instructions.md`; least-privilege `permissions`.
- Never changes app behaviour; package is "Domain" only if source changes too.

## Pitfalls seen before

- Designing a new stage/status without updating labels, badge CSS and the skill.
- Putting "only when won" checks in a component instead of asking the domain.
- Editing existing seed records to make a demo work.
- Forgetting that the dashboard "Open pipeline" must equal the by-stage table sum.
