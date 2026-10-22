# Order lifecycle

Source: `src/domain/orders.ts`. Creation is implemented; **status transitions are specified here but not implemented yet.**

## Statuses

| Status | Meaning |
| --- | --- |
| Draft | Created from a won opportunity. Lines may still change. |
| Submitted | Sent to fulfilment. Lines are frozen. |
| Fulfilled | Delivered to the customer. |
| Invoiced | Invoice issued. Terminal. |
| Cancelled | Abandoned before fulfilment. Terminal. |

## Transition table (spec)

Implement exactly this as `ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>>`:

| From | Allowed next statuses | Action label in the UI |
| --- | --- | --- |
| Draft | Submitted, Cancelled | "Submit order", "Cancel order" |
| Submitted | Fulfilled, Cancelled | "Mark as fulfilled", "Cancel order" |
| Fulfilled | Invoiced | "Mark as invoiced" |
| Invoiced | — | — |
| Cancelled | — | — |

## Rules

1. `transitionOrder(order, to, ctx)` throws `INVALID_TRANSITION` (with `details: { orderId, from, to }`) for anything not in the table.
2. **Submitting requires at least one line and a total > 0** — otherwise `VALIDATION_FAILED` with `details.field = 'lines'`.
3. **Cancelling requires a reason** (non-empty `cancellationReason`, max 280 chars) — otherwise `VALIDATION_FAILED` with `details.field = 'cancellationReason'`.
4. Every transition records `statusChangedAt = ctx.now()`. Optional history (`statusHistory: { status, at }[]`) is welcome but not required.
5. Cancelling an order does **not** re-open its opportunity; the opportunity stays Closed Won.
6. Order lines can be added/removed/edited **only in Draft** (`CONFLICT` otherwise). Totals are always recomputed with `calculateOrderTotal(lines)` — never accepted from input.

## Order numbers

`SO-<year>-<4-digit sequence>`; the sequence continues from the highest existing number (`nextOrderNumber`). Never reuse a number, even after cancellation.

## Seed data you can rely on

| Id | Number | Status |
| --- | --- | --- |
| `ord-001` | SO-2026-0001 | Fulfilled |
| `ord-002` | SO-2026-0002 | Submitted |

`opp-008` is Closed Won **without** an order — creating its order yields `SO-2026-0003` in `Draft`.
