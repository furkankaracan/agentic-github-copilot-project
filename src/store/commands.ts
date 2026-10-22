import { createAccount, type NewAccountInput } from '@/domain/accounts';
import { createContact, type NewContactInput } from '@/domain/contacts';
import type { DomainContext } from '@/domain/context';
import type { DomainError } from '@/domain/errors';
import {
  createOpportunity,
  findOpportunity,
  transitionOpportunity,
  type NewOpportunityInput,
} from '@/domain/opportunities';
import { createOrderFromOpportunity } from '@/domain/orders';
import type { Account, Contact, CrmState, Opportunity, OpportunityStage, Order } from '@/domain/types';

/**
 * Store commands: pure `(state, input, ctx) => { state, value }` functions.
 * They only orchestrate — every business rule lives in `src/domain/`.
 */

export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

export interface CommandOutcome<T> {
  state: CrmState;
  value: T;
}

export function addAccount(state: CrmState, input: NewAccountInput, ctx: DomainContext): CommandOutcome<Account> {
  const account = createAccount(input, state.accounts, ctx);
  return { state: { ...state, accounts: [...state.accounts, account] }, value: account };
}

export function addContact(state: CrmState, input: NewContactInput, ctx: DomainContext): CommandOutcome<Contact> {
  const contact = createContact(input, state, ctx);
  return { state: { ...state, contacts: [...state.contacts, contact] }, value: contact };
}

export function addOpportunity(
  state: CrmState,
  input: NewOpportunityInput,
  ctx: DomainContext,
): CommandOutcome<Opportunity> {
  const opportunity = createOpportunity(input, state, ctx);
  return { state: { ...state, opportunities: [...state.opportunities, opportunity] }, value: opportunity };
}

export function moveOpportunity(
  state: CrmState,
  opportunityId: string,
  to: OpportunityStage,
  ctx: DomainContext,
): CommandOutcome<Opportunity> {
  const current = findOpportunity(state.opportunities, opportunityId);
  const moved = transitionOpportunity(current, to, ctx);
  return {
    state: { ...state, opportunities: state.opportunities.map((o) => (o.id === moved.id ? moved : o)) },
    value: moved,
  };
}

export function convertOpportunityToOrder(
  state: CrmState,
  opportunityId: string,
  ctx: DomainContext,
): CommandOutcome<Order> {
  const opportunity = findOpportunity(state.opportunities, opportunityId);
  const order = createOrderFromOpportunity(opportunity, state, ctx);
  return { state: { ...state, orders: [...state.orders, order] }, value: order };
}
