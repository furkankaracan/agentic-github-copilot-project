import { createContext } from 'react';
import type { NewAccountInput } from '@/domain/accounts';
import type { NewContactInput } from '@/domain/contacts';
import type { NewOpportunityInput } from '@/domain/opportunities';
import type { Account, Contact, CrmState, Opportunity, OpportunityStage, Order } from '@/domain/types';
import type { Result } from './commands';

export interface CrmActions {
  createAccount: (input: NewAccountInput) => Result<Account>;
  createContact: (input: NewContactInput) => Result<Contact>;
  createOpportunity: (input: NewOpportunityInput) => Result<Opportunity>;
  moveOpportunity: (opportunityId: string, to: OpportunityStage) => Result<Opportunity>;
  createOrderFromOpportunity: (opportunityId: string) => Result<Order>;
}

export interface CrmContextValue {
  state: CrmState;
  actions: CrmActions;
}

export const CrmContext = createContext<CrmContextValue | null>(null);
