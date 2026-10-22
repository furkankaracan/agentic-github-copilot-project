# PR checklist

Apply only the sections whose files changed. Each item cites its source rule.

## A. Domain (`src/domain/**`)

| # | Item | Rule |
| --- | --- | --- |
| A1 | Business rules live here, not in pages/commands | domain-contract › Where logic lives |
| A2 | Functions are pure; inputs not mutated; new objects returned | domain-contract › Immutable |
| A3 | Ids/time from `DomainContext` — no `Date.now()`, `new Date()`, `Math.random()` | domain-contract › DomainContext |
| A4 | Only `DomainError` thrown, correct `code`, `details.field` for field errors | error-handling |
| A5 | Shared validators reused (`requireText`, …); `find<Entity>` reused | error-handling › Rules |
| A6 | Stage/status changed only via transition table + function | crm-lifecycle › Rule 1 |
| A7 | New stage/status updated in all 6 places (type, table, labels, CSS, tests, skill) | crm-lifecycle › Rule 6 |
| A8 | Enum values referenced via `as const` object, no string literals | code-style › TypeScript |

## B. Store (`src/store/**`)

| # | Item | Rule |
| --- | --- | --- |
| B1 | New action wired in all four places | domain-contract › Registration contract |
| B2 | Commands contain no business `if`s | domain-contract › Where logic lives |
| B3 | `run()` catch not widened | error-handling › Store |

## C. UI (`src/features/**`, `src/components/**`, `src/AppRoutes.tsx`, `src/styles.css`)

| # | Item | Rule |
| --- | --- | --- |
| C1 | No business rules in components (asks the domain) | react-ui-authoring › Before writing code |
| C2 | Actions via `useCrm().actions`; `Result` handled; `ErrorBanner` shown; no `try/catch` | error-handling › UI |
| C3 | Every input labelled; buttons name their action; destructive = `button-danger` | react-ui-authoring › Non-negotiables |
| C4 | Empty state for lists; `NotFound` for unknown ids | react-ui-authoring |
| C5 | New page registered in `AppRoutes.tsx` | domain-contract › Registration contract |
| C6 | Money/dates via `formatMoney`/`formatDate` | code-style › User-facing copy |
| C7 | Styling via classes + tokens; no inline style except data-driven values; no UI libraries | react-ui-authoring › Orientation |

## D. Tests

| # | Item | Rule |
| --- | --- | --- |
| D1 | Behaviour change has tests in the right file | testing › Placement |
| D2 | Red → green evidence stated in PR | testing › Test-first |
| D3 | Errors asserted by `code`, never message | testing › Assertions |
| D4 | Assertions fail if the subject does nothing; expectations derived from rules | testing › Assertions |
| D5 | No mocking of domain/store in UI tests; no seed edits to make tests pass | testing › Mocking |

## E. Seed data (`src/data/seed.ts`)

| # | Item | Rule |
| --- | --- | --- |
| E1 | Additive only — no deleted/renumbered/re-staged records | domain-contract › Seed data |

## F. Workflows (`.github/workflows/**`)

| # | Item | Rule |
| --- | --- | --- |
| F1 | No untrusted `${{ }}` inside `run:` | workflow-security |
| F2 | Least-privilege `permissions:` | workflow-security |

## G. Agent configuration (`.github/agents|instructions|skills|hooks|prompts/**`)

| # | Item | Rule |
| --- | --- | --- |
| G1 | No widened `tools` lists without justification in the PR body | least privilege |
| G2 | Hooks not weakened; code owner reviewed the change | CODEOWNERS |

## H. Scope & hygiene

| # | Item | Rule |
| --- | --- | --- |
| H1 | No unrelated refactors/reformatting | editing-discipline |
| H2 | No file deletions without stated consent | editing-discipline › Deletions |
| H3 | Design doc for the issue deleted in the final feature PR (if one existed) | copilot-instructions › Handoffs |

## Noise — do not comment on

- Pure formatting the linter accepts.
- Single-line mechanical drive-bys (typo, unused import) unless they hide a bug.
- Personal style preferences not backed by a rule above.
