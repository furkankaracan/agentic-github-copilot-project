---
description: "Domain and store registration contract: where business rules live, how state changes flow, and the four places every new action must be wired."
applyTo: "src/domain/**,src/store/**,src/AppRoutes.tsx,src/data/**"
---

# Domain & store contract

Applies to `src/domain/`, `src/store/`, `src/AppRoutes.tsx` and `src/data/`. This is the architecture a code review rejects if broken.

## Where logic lives

| Layer | May contain | Must not contain |
| --- | --- | --- |
| `src/domain/*.ts` | Validation, calculations, state machines, lookups. Pure functions over plain objects. | React, `useState`, routing, formatting for display, `Date.now()`, `Math.random()`, I/O |
| `src/store/commands.ts` | Orchestration: find entity → call domain function → return new `CrmState` | Any `if` that encodes a business rule |
| `src/store/CrmStore.tsx` | React wiring: `run()` + `actions` | Business rules, error translation beyond `DomainError → Result` |
| `src/features/**` | Rendering, form state, navigation, calling `actions.*` | Business rules (e.g. "only won deals can…"). Ask the domain: `allowedTransitions()`, `isClosedStage()` |

## State changes are immutable

Domain functions return **new** objects (`{ ...entity, field }`); commands return a new `CrmState` with the changed list replaced. Never mutate an argument. Tests check this.

## Ids and time come from `DomainContext`

Every domain function that creates or stamps something takes `ctx: DomainContext` as its last parameter and uses `ctx.newId(prefix)` / `ctx.now()`. Id prefixes: `acc`, `con`, `opp`, `ord`, `line`.

## The registration contract — wire every new action in four places

A domain function nobody can call is an invisible feature. When you add a user-triggerable operation:

1. **Domain** — the rule, in `src/domain/<entities>.ts`, with tests.
2. **Command** — `src/store/commands.ts`: `(state, …args, ctx) => CommandOutcome<T>`.
3. **Action type** — `CrmActions` in `src/store/crmContext.ts`, returning `Result<T>`.
4. **Wiring** — the `actions` object in `src/store/CrmStore.tsx`: `(…) => run((s) => command(s, …, domainContext))`.

A new **page** is additionally registered in `src/AppRoutes.tsx` (and, for top-level lists only, in `NAV_ITEMS` in `src/components/Layout.tsx`).

## State machines

Stages and statuses change **only** through a transition table + transition function (`OPPORTUNITY_TRANSITIONS` / `transitionOpportunity`). Never write `stage:` or `status:` in an object spread outside that function. Read the `crm-lifecycle` skill before touching either lifecycle.

## Seed data (`src/data/seed.ts`)

- It is the demo dataset — treat it as a fixture snapshot.
- You may **add** records or **add optional fields** when a feature needs them. Never delete, renumber or change the stage/status of existing records: tests and the live-demo script depend on `acc-001…acc-007`, `con-001…con-011`, `opp-001…opp-012`, `ord-001…ord-002`.
- A new required field on a type means every seed record needs a value — prefer optional fields.
