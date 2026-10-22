---
description: "Test-first workflow, test placement, naming and assertion rules for Vitest + React Testing Library."
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Testing

Applies to every behavioural change under `src/`.

## Stack

- **Runner:** Vitest 5 (`globals: true`, `jsdom`). Setup in `src/test/setup.ts`.
- **UI:** React Testing Library + `@testing-library/user-event` + `@testing-library/jest-dom`.
- **Helpers:** `createTestContext()` (`src/domain/context.ts`) for deterministic ids/time; `renderApp({ route })` and `renderWithStore()` (`src/test/render.tsx`) for UI tests with the real store and seed data.

## Test-first workflow (mandatory)

1. **Write or extend the test first** in the correct file (see placement below).
2. **Run it and confirm it fails for the right reason**: `npm test -- <path/to/file.test.ts>`. A new test that passes immediately is suspicious — check it actually exercises the change.
3. **Implement the minimum change** to make it pass.
4. **Re-run the file**, then run `npm run verify` once at the end.
5. Refactor only after green, and only inside the scope of the change.

State the red → green evidence (command + result) in your summary or PR description.

## Placement & naming

| What | File | Style |
| --- | --- | --- |
| Domain rule | `src/domain/<module>.test.ts` (co-located) | Pure function calls, no React |
| Store command | `src/store/commands.test.ts` | Pure function calls on `createSeedState()` |
| Page / interaction | `src/features/<entities>/<entities>.ui.test.tsx` | `renderApp({ route })` + `userEvent` |

- `describe('<function or page>')` + `it('<behaviour in plain English>')`.
- Decision tables use `it.each([...])`.

## Assertions

- **Errors:** assert `instanceof DomainError` and `.code`. Never assert on message text.
- **Derive expectations from the rule, not from the first run's output.** Every assertion must fail if the subject does nothing.
- **UI queries:** prefer `getByRole` / `getByLabelText`. Use visible text only for content. Never query by CSS class or test id unless there is no accessible alternative.
- Use `findBy*` after navigation or async updates.
- No snapshot tests.

## Mocking

- **Do not mock the domain or the store in UI tests.** Use the real `CrmProvider` with seed data — the seed is small and deterministic.
- Never call `Date.now()`/`new Date()` in a test to build expectations; pass `createTestContext('<iso>')` instead.
- Do not modify `src/data/seed.ts` to make a test pass. Build the state you need in the test (`{ ...createSeedState(), opportunities: [...] }`).

## When NOT to add a test

- Pure refactors already covered by existing tests.
- Copy or CSS-only changes.
- Renames with no behavioural change.

For everything else: no test → no merge.
