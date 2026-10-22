---
description: "Error-handling contract: DomainError is the only error the domain throws; the store turns it into a Result; the UI shows it with ErrorBanner."
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Error-handling contract

Applies to every TypeScript file under `src/`.

## The one error type: `DomainError`

`src/domain/errors.ts`. Every rule violation in the domain layer is reported with it:

```ts
throw new DomainError(DomainErrorCode.ValidationFailed, 'Amount must be greater than zero.', { field: 'amount' });
```

| Part | Purpose | Rules |
| --- | --- | --- |
| `code` | Stable, machine-readable (`VALIDATION_FAILED`, `NOT_FOUND`, `INVALID_TRANSITION`, `CONFLICT`) | Tests assert on it. Add a new code only when none of the four fits, and update this file. |
| `message` | Human-readable English sentence shown to the user | Name the problem and, when possible, the fix. It may change at any time. |
| `details` | Structured diagnostics (`field`, ids, `from`/`to`) | Never rendered. Include `field` when the error belongs to one form field — forms highlight it. |

## Rules

- **Never `throw new Error(...)`** or throw a string in `src/domain/` or `src/store/`. ESLint enforces this (`no-restricted-syntax`).
- Use the shared validators in `src/domain/validation.ts` (`requireText`, `requireEmail`, `requirePositiveAmount`, `requireIsoDate`) before writing a new check.
- `find<Entity>` helpers throw `NOT_FOUND`; reuse them instead of `list.find(...)` + manual throw.
- An invalid stage/status change is always `INVALID_TRANSITION`; a uniqueness or "already exists" violation is always `CONFLICT`.
- **Do not catch inside the domain.** Let `DomainError` propagate to the store.
- A programming error that is not a business rule (e.g. `useCrm` used outside its provider) may throw `TypeError` — outside `src/domain/` only.

## Store

`CrmProvider.run()` converts a `DomainError` into `{ ok: false, error }`. Any other exception is a bug and is re-thrown. Do not widen that `catch`.

## UI

- Never wrap `actions.*` in `try/catch`. Branch on the returned `Result`:
  ```tsx
  const result = actions.createAccount(form);
  if (result.ok) navigate(`/accounts/${result.value.id}`);
  else setError(result.error);
  ```
- Show the error with `<ErrorBanner error={error} />` (it has `role="alert"`). Never render `error.details` or `error.code` to users.
- Clear the error (`setError(null)`) after the next successful action.

## Tests

Assert on `error.code` and `instanceof DomainError` — **never on message text**.
