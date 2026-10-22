import { describe, expect, it } from 'vitest';
import { createTestContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import {
  OPPORTUNITY_TRANSITIONS,
  allowedTransitions,
  canTransition,
  createOpportunity,
  transitionOpportunity,
  type NewOpportunityInput,
} from './opportunities';
import { AccountTier, Industry, OpportunityStage, type Account, type Contact, type Opportunity } from './types';

const account: Account = {
  id: 'acc-1',
  name: 'Fabrikam',
  industry: Industry.Manufacturing,
  tier: AccountTier.Strategic,
  city: 'Stuttgart',
  country: 'Germany',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const otherAccount: Account = { ...account, id: 'acc-2', name: 'Other' };
const contact: Contact = {
  id: 'con-1',
  accountId: 'acc-1',
  firstName: 'Lena',
  lastName: 'Schmidt',
  email: 'lena@fabrikam.example',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const state = { accounts: [account, otherAccount], contacts: [contact] };

const validInput: NewOpportunityInput = {
  accountId: 'acc-1',
  primaryContactId: 'con-1',
  name: 'MES Integration',
  amount: 250000,
  expectedCloseDate: '2026-12-01',
};

function opportunityIn(stage: OpportunityStage): Opportunity {
  return {
    id: 'opp-1',
    accountId: 'acc-1',
    name: 'MES Integration',
    amount: 1000,
    currency: 'EUR',
    stage,
    expectedCloseDate: '2026-12-01',
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

describe('createOpportunity', () => {
  it('always starts in Prospecting', () => {
    const opp = createOpportunity(validInput, state, createTestContext());

    expect(opp.stage).toBe(OpportunityStage.Prospecting);
    expect(opp.currency).toBe('EUR');
    expect(opp.closedAt).toBeUndefined();
  });

  it('rejects an unknown account', () => {
    expect(codeOf(() => createOpportunity({ ...validInput, accountId: 'acc-404' }, state, createTestContext()))).toBe(
      DomainErrorCode.NotFound,
    );
  });

  it('rejects a primary contact from another account', () => {
    expect(codeOf(() => createOpportunity({ ...validInput, accountId: 'acc-2' }, state, createTestContext()))).toBe(
      DomainErrorCode.ValidationFailed,
    );
  });

  it.each([0, -5, Number.NaN])('rejects a non-positive amount (%s)', (amount) => {
    expect(codeOf(() => createOpportunity({ ...validInput, amount }, state, createTestContext()))).toBe(
      DomainErrorCode.ValidationFailed,
    );
  });

  it('rejects an invalid expected close date', () => {
    expect(
      codeOf(() => createOpportunity({ ...validInput, expectedCloseDate: 'next week' }, state, createTestContext())),
    ).toBe(DomainErrorCode.ValidationFailed);
  });
});

describe('opportunity state machine', () => {
  it('only allows moving forward one stage or closing as lost from an open stage', () => {
    expect(allowedTransitions(OpportunityStage.Prospecting)).toEqual([
      OpportunityStage.Qualification,
      OpportunityStage.ClosedLost,
    ]);
    expect(canTransition(OpportunityStage.Prospecting, OpportunityStage.Proposal)).toBe(false);
    expect(canTransition(OpportunityStage.Negotiation, OpportunityStage.ClosedWon)).toBe(true);
  });

  it('treats closed stages as terminal', () => {
    expect(OPPORTUNITY_TRANSITIONS[OpportunityStage.ClosedWon]).toHaveLength(0);
    expect(OPPORTUNITY_TRANSITIONS[OpportunityStage.ClosedLost]).toHaveLength(0);
  });

  it('can only be won from Negotiation', () => {
    const stagesThatCanWin = Object.values(OpportunityStage).filter((s) =>
      canTransition(s, OpportunityStage.ClosedWon),
    );
    expect(stagesThatCanWin).toEqual([OpportunityStage.Negotiation]);
  });
});

describe('transitionOpportunity', () => {
  it('moves to the next stage without closing', () => {
    const moved = transitionOpportunity(
      opportunityIn(OpportunityStage.Qualification),
      OpportunityStage.Proposal,
      createTestContext(),
    );

    expect(moved.stage).toBe(OpportunityStage.Proposal);
    expect(moved.closedAt).toBeUndefined();
  });

  it('stamps closedAt when the opportunity is won', () => {
    const won = transitionOpportunity(
      opportunityIn(OpportunityStage.Negotiation),
      OpportunityStage.ClosedWon,
      createTestContext('2026-10-22T12:00:00.000Z'),
    );

    expect(won.stage).toBe(OpportunityStage.ClosedWon);
    expect(won.closedAt).toBe('2026-10-22T12:00:00.000Z');
  });

  it('does not mutate the original opportunity', () => {
    const original = opportunityIn(OpportunityStage.Prospecting);
    transitionOpportunity(original, OpportunityStage.Qualification, createTestContext());
    expect(original.stage).toBe(OpportunityStage.Prospecting);
  });

  it('throws INVALID_TRANSITION when skipping a stage', () => {
    expect(
      codeOf(() =>
        transitionOpportunity(opportunityIn(OpportunityStage.Prospecting), OpportunityStage.Negotiation, createTestContext()),
      ),
    ).toBe(DomainErrorCode.InvalidTransition);
  });

  it('throws INVALID_TRANSITION when reopening a closed opportunity', () => {
    expect(
      codeOf(() =>
        transitionOpportunity(opportunityIn(OpportunityStage.ClosedLost), OpportunityStage.Prospecting, createTestContext()),
      ),
    ).toBe(DomainErrorCode.InvalidTransition);
  });
});
