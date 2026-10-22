---
description: "Code style and naming conventions for every file in the repository. Consistency with neighbouring code beats generic best practice."
applyTo: "**"
---

# Code style

Always-on. Applies to every file you read, edit, or create.

## Consistency over cleverness

- **Match the surrounding code.** Mirror the structure, naming, import order and formatting of the file you are editing and of its closest sibling. This repo's conventions take precedence over generic React/TypeScript advice.
- **Discover, then act.** Before writing a helper, search `src/domain/`, `src/components/` and `src/lib/` for one that already exists (`findAccount`, `contactFullName`, `formatMoney`, `requireText`, …). Follow the closest match; do not invent a parallel abstraction.

## Don't refactor unrelated code

- Only modify lines required for the task.
- Do **not** rename, reorder imports, convert functions to arrows (or back), add comments/JSDoc, or tighten types in code you were not asked to change.
- Do **not** bundle drive-by refactors into feature work. Mention them in your summary instead.

## TypeScript

- `strict` is on. No `any` (use `unknown` + narrowing), no non-null `!` assertions on data from the store, no `@ts-ignore`.
- Named exports only. No default exports.
- Import through the `@/` alias across folders (`@/domain/types`); use relative imports only inside the same folder.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is on).
- Enumerations are `as const` objects plus a same-named union type (see `OpportunityStage` in `src/domain/types.ts`). Never add a TypeScript `enum`.
- Reference enumeration values through the object (`OpportunityStage.ClosedWon`), never as a string literal (`'ClosedWon'`).

## Naming

| Artifact | Pattern | Example |
| --- | --- | --- |
| Domain module | `src/domain/<entities>.ts` (plural, lower case) | `src/domain/orders.ts` |
| Domain create function | `create<Entity>(input, state, ctx)` | `createOpportunity` |
| Domain lookup | `find<Entity>(list, id)` — throws `NOT_FOUND` | `findAccount` |
| Domain transition | `transition<Entity>(entity, to, ctx)` | `transitionOpportunity` |
| Transition table | `<ENTITY>_TRANSITIONS` | `OPPORTUNITY_TRANSITIONS` |
| Input type | `New<Entity>Input` / `<Entity>UpdateInput` | `NewContactInput` |
| Store command | verb + entity, in `src/store/commands.ts` | `addContact`, `moveOpportunity` |
| Page component | `<Entity><Kind>Page` in `src/features/<entities>/` | `OrderDetailPage` |
| Shared component | PascalCase noun in `src/components/` | `StatusBadge` |
| Domain test | `<module>.test.ts` next to the module | `src/domain/orders.test.ts` |
| UI test | `<entities>.ui.test.tsx` in the feature folder | `src/features/accounts/accounts.ui.test.tsx` |
| CSS class | kebab-case, component-prefixed | `.stage-track`, `.badge-order-Draft` |

## Formatting

2-space indentation, single quotes, semicolons, trailing commas, max ~120 columns. Keep the style of the file you are in.

## User-facing copy

- English, sentence case ("New opportunity", not "New Opportunity").
- Buttons name their action ("Create order", "Mark as lost") — never "Submit" or "OK".
- Money is always formatted with `formatMoney`, dates with `formatDate` (`src/lib/format.ts`).
