# Design template

Save as `docs/designs/ISSUE-<number>-<kebab-slug>.md`. Plain sentences, no filler, no narration of how you did the analysis.

```markdown
# Issue #<number>: <title>

- Link: https://github.com/<owner>/<repo>/issues/<number>
- Date: <yyyy-mm-dd>
- Packages: Domain ☐ · UI ☐ · Tests ☐

## What's being asked

<The requirement in your own words, 3–8 sentences. Include who benefits and why.>

## Existing logic to know about

<Every type, domain function, command, page and test that already touches this entity — path, what it does today, and whether this work extends it, changes it, or leaves it alone. Call out any existing behaviour that contradicts the issue or a skill spec. "Nothing found — new ground" only if genuinely nothing exists.>

## Rules that apply

<Bullet list of the instructions/skill sections the implementer must follow, with links, e.g. `crm-lifecycle › order-lifecycle.md › Rules 1–3`.>

## Breakdown

| # | Requirement / acceptance criterion | Package | Why there |
| --- | --- | --- | --- |
| 1 | … | Domain / UI / Tests | … |

## Domain work

<For each item: file, function signature, rule, DomainError code + details.field, the four-place wiring (command / CrmActions / CrmStore), seed additions (additive only). "None" if empty.>

## UI work

<For each item: page/component path, what the user sees and does, exact button labels, empty/error states, route changes. "None" if empty.>

## Test plan

| Acceptance criterion | Test file | Scenario(s) |
| --- | --- | --- |
| 1 | `src/domain/orders.test.ts` | … |

## Order of work

<e.g. Domain 1 → Domain 2 → UI 1 → UI 2. Note which packages can run in parallel.>

## Open questions

<Numbered. For each: the question, who should answer, and the assumption taken if unanswered. "None — the issue was clear." if empty.>

## Manual verification

<3–6 concrete steps on http://localhost:5173 using seed ids that prove the feature works.>
```
