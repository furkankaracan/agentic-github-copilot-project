import { findAccount } from './accounts';
import type { DomainContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { OpportunityStage, type CrmState, type Opportunity } from './types';
import { requireIsoDate, requirePositiveAmount, requireText } from './validation';

/**
 * The opportunity state machine. This table is the single source of truth for which
 * stage changes are allowed — never assign `opportunity.stage` anywhere else.
 */
export const OPPORTUNITY_TRANSITIONS: Readonly<Record<OpportunityStage, readonly OpportunityStage[]>> = {
  [OpportunityStage.Prospecting]: [OpportunityStage.Qualification, OpportunityStage.ClosedLost],
  [OpportunityStage.Qualification]: [OpportunityStage.Proposal, OpportunityStage.ClosedLost],
  [OpportunityStage.Proposal]: [OpportunityStage.Negotiation, OpportunityStage.ClosedLost],
  [OpportunityStage.Negotiation]: [OpportunityStage.ClosedWon, OpportunityStage.ClosedLost],
  [OpportunityStage.ClosedWon]: [],
  [OpportunityStage.ClosedLost]: [],
};

/** Display order of the open pipeline stages (closed stages excluded). */
export const OPEN_STAGES: readonly OpportunityStage[] = [
  OpportunityStage.Prospecting,
  OpportunityStage.Qualification,
  OpportunityStage.Proposal,
  OpportunityStage.Negotiation,
];

export const STAGE_LABELS: Readonly<Record<OpportunityStage, string>> = {
  [OpportunityStage.Prospecting]: 'Prospecting',
  [OpportunityStage.Qualification]: 'Qualification',
  [OpportunityStage.Proposal]: 'Proposal',
  [OpportunityStage.Negotiation]: 'Negotiation',
  [OpportunityStage.ClosedWon]: 'Closed Won',
  [OpportunityStage.ClosedLost]: 'Closed Lost',
};

export function isClosedStage(stage: OpportunityStage): boolean {
  return stage === OpportunityStage.ClosedWon || stage === OpportunityStage.ClosedLost;
}

export function allowedTransitions(stage: OpportunityStage): readonly OpportunityStage[] {
  return OPPORTUNITY_TRANSITIONS[stage];
}

export function canTransition(from: OpportunityStage, to: OpportunityStage): boolean {
  return OPPORTUNITY_TRANSITIONS[from].includes(to);
}

export function findOpportunity(opportunities: readonly Opportunity[], opportunityId: string): Opportunity {
  const opportunity = opportunities.find((o) => o.id === opportunityId);
  if (!opportunity) {
    throw new DomainError(DomainErrorCode.NotFound, 'Opportunity not found.', { opportunityId });
  }
  return opportunity;
}

export interface NewOpportunityInput {
  accountId: string;
  primaryContactId?: string;
  name: string;
  amount: number;
  expectedCloseDate: string;
}

/** Creates an opportunity. New opportunities always start in `Prospecting`. */
export function createOpportunity(
  input: NewOpportunityInput,
  state: Pick<CrmState, 'accounts' | 'contacts'>,
  ctx: DomainContext,
): Opportunity {
  const account = findAccount(state.accounts, input.accountId);
  const name = requireText(input.name, 'name', 'Opportunity name');
  const amount = requirePositiveAmount(input.amount, 'amount', 'Amount');
  const expectedCloseDate = requireIsoDate(input.expectedCloseDate, 'expectedCloseDate', 'Expected close date');

  if (input.primaryContactId) {
    const contact = state.contacts.find((c) => c.id === input.primaryContactId);
    if (!contact || contact.accountId !== account.id) {
      throw new DomainError(
        DomainErrorCode.ValidationFailed,
        'The primary contact must belong to the selected account.',
        { field: 'primaryContactId', accountId: account.id },
      );
    }
  }

  return {
    id: ctx.newId('opp'),
    accountId: account.id,
    ...(input.primaryContactId ? { primaryContactId: input.primaryContactId } : {}),
    name,
    amount,
    currency: 'EUR',
    stage: OpportunityStage.Prospecting,
    expectedCloseDate,
    createdAt: ctx.now(),
  };
}

/**
 * Moves an opportunity to the next stage. Throws `INVALID_TRANSITION` when the move is not
 * in `OPPORTUNITY_TRANSITIONS`. Closing (won or lost) stamps `closedAt`.
 */
export function transitionOpportunity(
  opportunity: Opportunity,
  to: OpportunityStage,
  ctx: DomainContext,
): Opportunity {
  if (!canTransition(opportunity.stage, to)) {
    throw new DomainError(
      DomainErrorCode.InvalidTransition,
      `Cannot move an opportunity from ${STAGE_LABELS[opportunity.stage]} to ${STAGE_LABELS[to]}.`,
      { opportunityId: opportunity.id, from: opportunity.stage, to },
    );
  }

  return {
    ...opportunity,
    stage: to,
    ...(to === OpportunityStage.ClosedWon ? { closedAt: ctx.now() } : {}),
  };
}
