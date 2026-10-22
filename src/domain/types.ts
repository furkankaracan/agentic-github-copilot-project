/**
 * Domain model for the CRM. All status/stage values are declared once here as
 * `as const` objects — reference them via the constant (`OpportunityStage.ClosedWon`),
 * never as string literals in feature code.
 */

export const Industry = {
  Technology: 'Technology',
  Manufacturing: 'Manufacturing',
  Retail: 'Retail',
  Finance: 'Finance',
  Healthcare: 'Healthcare',
} as const;
export type Industry = (typeof Industry)[keyof typeof Industry];

export const AccountTier = {
  Strategic: 'Strategic',
  Enterprise: 'Enterprise',
  SMB: 'SMB',
} as const;
export type AccountTier = (typeof AccountTier)[keyof typeof AccountTier];

export const OpportunityStage = {
  Prospecting: 'Prospecting',
  Qualification: 'Qualification',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  ClosedWon: 'ClosedWon',
  ClosedLost: 'ClosedLost',
} as const;
export type OpportunityStage = (typeof OpportunityStage)[keyof typeof OpportunityStage];

export const OrderStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Fulfilled: 'Fulfilled',
  Invoiced: 'Invoiced',
  Cancelled: 'Cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Account {
  id: string;
  name: string;
  industry: Industry;
  tier: AccountTier;
  city: string;
  country: string;
  website?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  primaryContactId?: string;
  name: string;
  amount: number;
  currency: 'EUR';
  stage: OpportunityStage;
  expectedCloseDate: string;
  createdAt: string;
  closedAt?: string;
}

export interface OrderLine {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  accountId: string;
  opportunityId: string;
  status: OrderStatus;
  lines: OrderLine[];
  total: number;
  currency: 'EUR';
  createdAt: string;
}

export interface CrmState {
  accounts: Account[];
  contacts: Contact[];
  opportunities: Opportunity[];
  orders: Order[];
}
