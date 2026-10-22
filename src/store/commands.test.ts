import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/data/seed';
import { createTestContext } from '@/domain/context';
import { DomainError, DomainErrorCode } from '@/domain/errors';
import { AccountTier, Industry, OpportunityStage, OrderStatus } from '@/domain/types';
import { addAccount, convertOpportunityToOrder, moveOpportunity } from './commands';

describe('store commands', () => {
  it('addAccount appends the new account without mutating the previous state', () => {
    const before = createSeedState();
    const { state, value } = addAccount(
      before,
      { name: 'Proseware', industry: Industry.Technology, tier: AccountTier.SMB, city: 'Bursa', country: 'Türkiye' },
      createTestContext(),
    );

    expect(state.accounts).toHaveLength(before.accounts.length + 1);
    expect(state.accounts.at(-1)).toBe(value);
    expect(before.accounts.some((a) => a.id === value.id)).toBe(false);
  });

  it('moveOpportunity replaces only the moved opportunity', () => {
    const before = createSeedState();
    const { state, value } = moveOpportunity(before, 'opp-002', OpportunityStage.Qualification, createTestContext());

    expect(value.stage).toBe(OpportunityStage.Qualification);
    expect(state.opportunities).toHaveLength(before.opportunities.length);
    expect(state.opportunities.find((o) => o.id === 'opp-001')).toBe(before.opportunities.find((o) => o.id === 'opp-001'));
  });

  it('convertOpportunityToOrder turns the remaining won seed opportunity into a Draft order', () => {
    const before = createSeedState();
    const { state, value } = convertOpportunityToOrder(before, 'opp-008', createTestContext('2026-10-22T09:00:00.000Z'));

    expect(value.status).toBe(OrderStatus.Draft);
    expect(value.orderNumber).toBe('SO-2026-0003');
    expect(state.orders).toHaveLength(before.orders.length + 1);
  });

  it('propagates domain errors unchanged', () => {
    const before = createSeedState();
    try {
      moveOpportunity(before, 'opp-007', OpportunityStage.Prospecting, createTestContext());
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(DomainErrorCode.InvalidTransition);
    }
  });
});
