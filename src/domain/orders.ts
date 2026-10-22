import type { DomainContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { OpportunityStage, OrderStatus, type CrmState, type Opportunity, type Order, type OrderLine } from './types';

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  [OrderStatus.Draft]: 'Draft',
  [OrderStatus.Submitted]: 'Submitted',
  [OrderStatus.Fulfilled]: 'Fulfilled',
  [OrderStatus.Invoiced]: 'Invoiced',
  [OrderStatus.Cancelled]: 'Cancelled',
};

export function findOrder(orders: readonly Order[], orderId: string): Order {
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new DomainError(DomainErrorCode.NotFound, 'Order not found.', { orderId });
  }
  return order;
}

export function orderForOpportunity(orders: readonly Order[], opportunityId: string): Order | undefined {
  return orders.find((o) => o.opportunityId === opportunityId);
}

export function calculateOrderTotal(lines: readonly OrderLine[]): number {
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  return Math.round(total * 100) / 100;
}

/** Order numbers are `SO-<year>-<4-digit sequence>`, sequence continues from the highest existing number. */
export function nextOrderNumber(orders: readonly Order[], nowIso: string): string {
  const year = new Date(nowIso).getUTCFullYear();
  const highest = orders.reduce((max, o) => {
    const seq = Number.parseInt(o.orderNumber.split('-')[2] ?? '0', 10);
    return Number.isNaN(seq) ? max : Math.max(max, seq);
  }, 0);
  return `SO-${year}-${String(highest + 1).padStart(4, '0')}`;
}

/**
 * Converts a won opportunity into a Draft order with one line for the opportunity amount.
 * Only `ClosedWon` opportunities qualify, and each opportunity produces at most one order.
 */
export function createOrderFromOpportunity(
  opportunity: Opportunity,
  state: Pick<CrmState, 'orders'>,
  ctx: DomainContext,
): Order {
  if (opportunity.stage !== OpportunityStage.ClosedWon) {
    throw new DomainError(
      DomainErrorCode.InvalidTransition,
      'Only won opportunities can be converted into an order.',
      { opportunityId: opportunity.id, stage: opportunity.stage },
    );
  }
  if (orderForOpportunity(state.orders, opportunity.id)) {
    throw new DomainError(DomainErrorCode.Conflict, 'An order already exists for this opportunity.', {
      opportunityId: opportunity.id,
    });
  }

  const now = ctx.now();
  const lines: OrderLine[] = [
    { id: ctx.newId('line'), product: opportunity.name, quantity: 1, unitPrice: opportunity.amount },
  ];

  return {
    id: ctx.newId('ord'),
    orderNumber: nextOrderNumber(state.orders, now),
    accountId: opportunity.accountId,
    opportunityId: opportunity.id,
    status: OrderStatus.Draft,
    lines,
    total: calculateOrderTotal(lines),
    currency: 'EUR',
    createdAt: now,
  };
}
