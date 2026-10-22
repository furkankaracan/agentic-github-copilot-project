# Store commands — exposing a domain operation to the UI

Four edits, always together. Missing any one makes the feature unreachable or untyped.

## 1. Domain function (already written, with tests)

`src/domain/orders.ts` → `transitionOrder(order, to, ctx): Order`

## 2. Command — `src/store/commands.ts`

```ts
export function moveOrder(state: CrmState, orderId: string, to: OrderStatus, ctx: DomainContext): CommandOutcome<Order> {
  const current = findOrder(state.orders, orderId);
  const moved = transitionOrder(current, to, ctx);
  return {
    state: { ...state, orders: state.orders.map((o) => (o.id === moved.id ? moved : o)) },
    value: moved,
  };
}
```

Rules: find → call domain → replace in list. No `if` that encodes a business rule. Delete commands call the domain guard first, then `filter`.

## 3. Action type — `src/store/crmContext.ts`

```ts
export interface CrmActions {
  // …
  moveOrder: (orderId: string, to: OrderStatus) => Result<Order>;
}
```

## 4. Wiring — `src/store/CrmStore.tsx`

```ts
moveOrder: (id, to) => run((s) => moveOrder(s, id, to, domainContext)),
```

## 5. Test the command — `src/store/commands.test.ts`

At minimum: the happy path replaces only the changed entity, and a domain error propagates unchanged (`instanceof DomainError` + `code`). Use seed ids (`ord-002` is `Submitted`, `ord-001` is `Fulfilled`).

## Using it in a page

```tsx
const { state, actions } = useCrm();
const [error, setError] = useState<DomainError | null>(null);

const onSubmit = () => {
  const result = actions.moveOrder(order.id, OrderStatus.Fulfilled);
  setError(result.ok ? null : result.error);
};
```
