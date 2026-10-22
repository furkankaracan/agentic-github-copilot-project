# Domain module skeleton

Copy this shape. Real examples: `src/domain/contacts.ts` (create + find), `src/domain/opportunities.ts` (state machine).

```ts
import { findAccount } from './accounts';
import type { DomainContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import type { CrmState, Widget } from './types';
import { requireText } from './validation';

export interface NewWidgetInput {
  accountId: string;
  name: string;
  note?: string;
}

export function findWidget(widgets: readonly Widget[], widgetId: string): Widget {
  const widget = widgets.find((w) => w.id === widgetId);
  if (!widget) {
    throw new DomainError(DomainErrorCode.NotFound, 'Widget not found.', { widgetId });
  }
  return widget;
}

/** One sentence: what it does and the rule that matters. */
export function createWidget(
  input: NewWidgetInput,
  state: Pick<CrmState, 'accounts' | 'widgets'>,
  ctx: DomainContext,
): Widget {
  const account = findAccount(state.accounts, input.accountId);
  const name = requireText(input.name, 'name', 'Widget name');

  if (state.widgets.some((w) => w.accountId === account.id && w.name.toLowerCase() === name.toLowerCase())) {
    throw new DomainError(DomainErrorCode.Conflict, 'This account already has a widget with that name.', {
      field: 'name',
    });
  }

  const note = input.note?.trim();

  return {
    id: ctx.newId('wid'),
    accountId: account.id,
    name,
    ...(note ? { note } : {}),
    createdAt: ctx.now(),
  };
}
```

## Update pattern

```ts
export interface AccountUpdateInput {
  name?: string;
  city?: string;
}

export function updateAccount(
  account: Account,
  patch: AccountUpdateInput,
  state: Pick<CrmState, 'accounts'>,
): Account {
  const next = { ...account };
  if (patch.name !== undefined) {
    next.name = requireText(patch.name, 'name', 'Account name');
    // uniqueness excluding self
  }
  if (patch.city !== undefined) next.city = requireText(patch.city, 'city', 'City');
  return next;
}
```

## Delete guard pattern

```ts
export function assertCanDeleteAccount(accountId: string, state: Pick<CrmState, 'opportunities' | 'orders'>): void {
  const open = state.opportunities.filter((o) => o.accountId === accountId && !isClosedStage(o.stage));
  if (open.length > 0) {
    throw new DomainError(DomainErrorCode.Conflict, 'Close or move the open opportunities before deleting this account.', {
      accountId,
      openOpportunityIds: open.map((o) => o.id),
    });
  }
}
```

## Adding a type

- Add the interface to `src/domain/types.ts`, next to its siblings.
- New enum-like field → `as const` object + same-named union type, exported from `types.ts`.
- New list in the state → add it to `CrmState` **and** to `createSeedState()` (even if empty) so `toEqual`-based tests stay valid.
