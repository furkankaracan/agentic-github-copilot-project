---
name: domain-development
description: "How to add or change business rules in the Contoso CRM domain layer (src/domain) and expose them through the store (src/store) — create/find/transition functions, validation, DomainError, DomainContext, store commands and the four-place action registration. Use when writing, editing or reviewing anything under src/domain/ or src/store/, adding a validation rule, adding a new user action, or writing domain/store unit tests."
---

# Domain development — Contoso CRM

This skill governs **all** business logic. It is the equivalent of a senior engineer's walkthrough of "how we build a feature here". The always-on instructions (`domain-contract`, `error-handling`, `testing`) state the rules; this skill shows the moves.

## Orientation (must know)

- Domain modules: `accounts.ts`, `contacts.ts`, `opportunities.ts`, `orders.ts`, `metrics.ts`, plus shared `types.ts`, `errors.ts`, `validation.ts`, `context.ts`.
- Every function is **pure**: inputs in, new object out, `DomainError` on rule violations. No React, no I/O, no clock.
- Signature convention: `fn(input | entity, stateSlice, ctx)` — take the **smallest** `Pick<CrmState, …>` you need, and `ctx: DomainContext` last when you create ids or timestamps.
- The store (`src/store/`) only orchestrates. `CrmProvider.run()` converts `DomainError` → `Result`.

## Workflow for a new rule or operation

1. **Find the closest existing function** (`grep` for `create`, `find`, `transition` in `src/domain/`) and mirror it.
2. **Read the matching reference** (not preloaded):
   - New module or function shape → [references/domain-module-skeleton.md](references/domain-module-skeleton.md)
   - Exposing it to the UI → [references/store-commands.md](references/store-commands.md)
   - Tests → [references/testing-patterns.md](references/testing-patterns.md)
3. Anything touching `stage` or `status` → load the **`crm-lifecycle`** skill first.
4. **Test first** (`npm test -- src/domain/<module>.test.ts`), confirm red, implement, confirm green.
5. Wire the action in the four places (domain → command → `CrmActions` → `CrmStore` actions).
6. `npm run verify`.

## Decision guide

| You need to… | Do this |
| --- | --- |
| Reject bad input | `requireText` / `requireEmail` / `requirePositiveAmount` / `requireIsoDate`, or `throw new DomainError(ValidationFailed, msg, { field })` |
| Look up a referenced entity | `findAccount` / `findContact` / `findOpportunity` / `findOrder` (throws `NOT_FOUND`) |
| Enforce uniqueness | Compare case-insensitively against the slice; throw `CONFLICT` with `{ field }` |
| Change a stage/status | Transition table + transition function only (see `crm-lifecycle`) |
| Compute something for the dashboard | Pure function in `metrics.ts` over `readonly Opportunity[]` |
| Update an existing entity | `update<Entity>(entity, patch, state, ctx)` returning `{ ...entity, ...validatedPatch }` — validate every patched field with the same helpers as `create<Entity>` |
| Delete an entity | `assertCanDelete<Entity>(id, state)` throwing `CONFLICT` when dependants exist; the command filters the list |

## Gotchas

- `Object.values(Industry)` is the list of valid values — use it to validate enum-like inputs coming from a `<select>`.
- Optional fields: spread conditionally (`...(phone ? { phone } : {})`) so `undefined` keys never appear — tests use `toEqual`.
- Money is rounded to cents in the domain (`Math.round(x * 100) / 100`), formatted only in the UI.
- `createSeedState()` returns a deep clone; never import the raw arrays.
