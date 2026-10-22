# Testing patterns

Canonical examples in the repo:

- Domain: `src/domain/opportunities.test.ts`, `src/domain/orders.test.ts`
- Store: `src/store/commands.test.ts`
- UI: `src/features/opportunities/opportunities.ui.test.tsx`

## Domain test skeleton

```ts
import { describe, expect, it } from 'vitest';
import { createTestContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { transitionOrder } from './orders';
import { OrderStatus, type Order } from './types';

function orderIn(status: OrderStatus): Order {
  return { id: 'ord-1', orderNumber: 'SO-2026-0001', accountId: 'acc-1', opportunityId: 'opp-1',
           status, lines: [], total: 0, currency: 'EUR', createdAt: '2026-01-01T00:00:00.000Z' };
}

function codeOf(fn: () => unknown): string | undefined {
  try { fn(); } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return (error as DomainError).code;
  }
  return undefined;
}

describe('transitionOrder', () => {
  it('submits a draft order', () => {
    const next = transitionOrder(orderIn(OrderStatus.Draft), OrderStatus.Submitted, createTestContext());
    expect(next.status).toBe(OrderStatus.Submitted);
  });

  it.each([
    [OrderStatus.Draft, OrderStatus.Invoiced],
    [OrderStatus.Invoiced, OrderStatus.Cancelled],
  ])('rejects %s → %s', (from, to) => {
    expect(codeOf(() => transitionOrder(orderIn(from), to, createTestContext()))).toBe(DomainErrorCode.InvalidTransition);
  });
});
```

## Scenario checklist — enumerate before writing

For each function under test:

- [ ] Happy path (assert the full returned object or every changed field).
- [ ] Each required input missing/blank → `VALIDATION_FAILED`.
- [ ] Each referenced id unknown → `NOT_FOUND`.
- [ ] Each uniqueness rule → `CONFLICT` (including case-insensitive match).
- [ ] Each forbidden transition → `INVALID_TRANSITION` (use `it.each` over the table).
- [ ] Input object is not mutated.
- [ ] Timestamps/ids come from `createTestContext('<iso>')`.

## UI test skeleton

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';

it('submits a draft order from its detail page', async () => {
  const user = userEvent.setup();
  renderApp({ route: '/orders/ord-003' });
  await user.click(screen.getByRole('button', { name: 'Submit order' }));
  expect(screen.getByText('Submitted')).toBeInTheDocument();
});
```

Need a record that is not in the seed? Build the state in the test:

```ts
const state = createSeedState();
state.orders.push({ ...state.orders[0], id: 'ord-test', status: OrderStatus.Draft });
renderApp({ route: '/orders/ord-test', state });
```

## Anti-patterns (reviewers reject these)

- Asserting on `error.message`.
- Expected values copied from a first run instead of derived from the rule.
- `expect(true).toBe(true)`-style tests, or assertions that pass when the function returns `undefined`.
- Mocking `useCrm` or domain functions in UI tests.
- Editing `seed.ts` to make a test pass.
