import { describe, expect, it } from 'vitest';
import { createTestContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { calculateOrderTotal, createOrderFromOpportunity, nextOrderNumber } from './orders';
import { OpportunityStage, OrderStatus, type Opportunity, type Order } from './types';

function opportunity(stage: OpportunityStage, overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-1',
    accountId: 'acc-1',
    name: 'Predictive Maintenance',
    amount: 95000,
    currency: 'EUR',
    stage,
    expectedCloseDate: '2026-07-30',
    createdAt: '2026-03-20T09:00:00.000Z',
    ...overrides,
  };
}

function order(orderNumber: string, opportunityId: string): Order {
  return {
    id: `ord-${orderNumber}`,
    orderNumber,
    accountId: 'acc-1',
    opportunityId,
    status: OrderStatus.Draft,
    lines: [],
    total: 0,
    currency: 'EUR',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return (error as DomainError).code;
  }
  return undefined;
}

describe('createOrderFromOpportunity', () => {
  it('creates a Draft order with one line for the won amount', () => {
    const ctx = createTestContext('2026-10-22T09:00:00.000Z');

    const created = createOrderFromOpportunity(opportunity(OpportunityStage.ClosedWon), { orders: [] }, ctx);

    expect(created.status).toBe(OrderStatus.Draft);
    expect(created.orderNumber).toBe('SO-2026-0001');
    expect(created.accountId).toBe('acc-1');
    expect(created.opportunityId).toBe('opp-1');
    expect(created.lines).toEqual([{ id: 'line-test-1', product: 'Predictive Maintenance', quantity: 1, unitPrice: 95000 }]);
    expect(created.total).toBe(95000);
  });

  it.each([
    OpportunityStage.Prospecting,
    OpportunityStage.Qualification,
    OpportunityStage.Proposal,
    OpportunityStage.Negotiation,
    OpportunityStage.ClosedLost,
  ])('refuses to create an order from a %s opportunity', (stage) => {
    expect(codeOf(() => createOrderFromOpportunity(opportunity(stage), { orders: [] }, createTestContext()))).toBe(
      DomainErrorCode.InvalidTransition,
    );
  });

  it('refuses a second order for the same opportunity', () => {
    const existing = [order('SO-2026-0001', 'opp-1')];
    expect(
      codeOf(() =>
        createOrderFromOpportunity(opportunity(OpportunityStage.ClosedWon), { orders: existing }, createTestContext()),
      ),
    ).toBe(DomainErrorCode.Conflict);
  });
});

describe('nextOrderNumber', () => {
  it('continues from the highest existing sequence', () => {
    const existing = [order('SO-2026-0002', 'a'), order('SO-2026-0007', 'b'), order('SO-2026-0003', 'c')];
    expect(nextOrderNumber(existing, '2026-10-22T00:00:00.000Z')).toBe('SO-2026-0008');
  });
});

describe('calculateOrderTotal', () => {
  it('sums quantity × unit price and rounds to cents', () => {
    expect(
      calculateOrderTotal([
        { id: 'l1', product: 'A', quantity: 3, unitPrice: 19.99 },
        { id: 'l2', product: 'B', quantity: 1, unitPrice: 0.015 },
      ]),
    ).toBe(59.99);
  });
});
