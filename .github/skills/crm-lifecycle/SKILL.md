---
name: crm-lifecycle
description: "The Contoso CRM state machines: the opportunity stage pipeline (Prospecting → Qualification → Proposal → Negotiation → Closed Won / Closed Lost) and the order lifecycle (Draft → Submitted → Fulfilled → Invoiced, plus Cancelled), including the business rules for converting won opportunities into orders, loss reasons, probabilities and which transitions are allowed. Use when reading, writing, planning or reviewing anything that changes or depends on opportunity.stage or order.status."
---

# CRM lifecycle — opportunity stages & order statuses

This is the institutional knowledge a new engineer would otherwise have to ask the sales-ops lead for. Getting a transition wrong silently corrupts the pipeline numbers on the dashboard.

## The loop (mental model)

```
Account ─┬─ Contact (people at the account)
         └─ Opportunity  Prospecting → Qualification → Proposal → Negotiation ─┬─► Closed Won ──► Order (Draft)
                              │              │            │           │        │                     │
                              └──────────────┴────────────┴───────────┴────────┴─► Closed Lost        ▼
                                                                                         Draft → Submitted → Fulfilled → Invoiced
                                                                                           └──────────┴─► Cancelled
```

## Non-negotiable rules

1. **One source of truth per lifecycle.** Each lifecycle is a `<ENTITY>_TRANSITIONS` table in its domain module plus one `transition<Entity>()` function. The UI asks `allowedTransitions()` which buttons to show — it never hard-codes stage logic.
2. **Closed is terminal.** `ClosedWon`, `ClosedLost`, `Invoiced` and `Cancelled` have no outgoing transitions. Re-opening is a new opportunity, not a transition.
3. **No skipping.** Opportunities move forward exactly one open stage at a time; they can be lost from any open stage; they can be won only from `Negotiation`.
4. **Closing stamps time.** Entering `ClosedWon`/`ClosedLost` sets `closedAt = ctx.now()`.
5. **Orders come only from won opportunities**, one order per opportunity, starting as `Draft` (`createOrderFromOpportunity`).
6. **Adding a stage or status** requires, in one PR: the `as const` value in `types.ts`, the transition table, the labels map (`STAGE_LABELS` / `ORDER_STATUS_LABELS`), the badge CSS class (`.badge-stage-*` / `.badge-order-*` in `src/styles.css`), table-driven tests, and an update to this skill.

## Details (read the one you need)

- [references/opportunity-stages.md](references/opportunity-stages.md) — stage table, probabilities, loss reasons, pipeline metrics.
- [references/order-lifecycle.md](references/order-lifecycle.md) — order status table, who may do what, totals and line rules.

## Implementation status

| Capability | Status |
| --- | --- |
| Opportunity transitions (`transitionOpportunity`) | ✅ implemented |
| Order creation from won opportunity | ✅ implemented |
| Order status transitions (`ORDER_TRANSITIONS`, `transitionOrder`) | ⛔ not implemented yet — spec in `references/order-lifecycle.md` |
| Loss reason on Closed Lost | ⛔ not implemented yet — spec in `references/opportunity-stages.md` |
| Stage probabilities / weighted pipeline | ⛔ not implemented yet — spec in `references/opportunity-stages.md` |

When you implement one of these, follow the spec exactly and flip its row to ✅ in the same PR.
