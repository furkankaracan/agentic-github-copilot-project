import {
  AccountTier,
  Industry,
  OpportunityStage,
  OrderStatus,
  type Account,
  type Contact,
  type CrmState,
  type Opportunity,
  type Order,
} from '@/domain/types';

/**
 * Static demo data. The app has no backend: this snapshot is loaded into memory on start
 * and every change is lost on page reload. Extend it when a feature needs new sample
 * records; never delete or renumber existing ids (tests and demo scripts reference them).
 */

const accounts: Account[] = [
  { id: 'acc-001', name: 'Northwind Traders', industry: Industry.Retail, tier: AccountTier.Enterprise, city: 'Istanbul', country: 'Türkiye', website: 'https://northwind.example', createdAt: '2026-01-12T08:30:00.000Z' },
  { id: 'acc-002', name: 'Fabrikam Industries', industry: Industry.Manufacturing, tier: AccountTier.Strategic, city: 'Stuttgart', country: 'Germany', website: 'https://fabrikam.example', createdAt: '2026-02-03T10:00:00.000Z' },
  { id: 'acc-003', name: 'Tailspin Health', industry: Industry.Healthcare, tier: AccountTier.Enterprise, city: 'Ankara', country: 'Türkiye', createdAt: '2026-02-21T13:15:00.000Z' },
  { id: 'acc-004', name: 'Woodgrove Bank', industry: Industry.Finance, tier: AccountTier.Strategic, city: 'London', country: 'United Kingdom', website: 'https://woodgrove.example', createdAt: '2026-03-09T09:45:00.000Z' },
  { id: 'acc-005', name: 'Litware Labs', industry: Industry.Technology, tier: AccountTier.SMB, city: 'Izmir', country: 'Türkiye', createdAt: '2026-04-17T15:20:00.000Z' },
  { id: 'acc-006', name: 'Adventure Works', industry: Industry.Retail, tier: AccountTier.SMB, city: 'Amsterdam', country: 'Netherlands', website: 'https://adventure-works.example', createdAt: '2026-05-05T11:10:00.000Z' },
  { id: 'acc-007', name: 'Contoso Cloud', industry: Industry.Technology, tier: AccountTier.Enterprise, city: 'Berlin', country: 'Germany', website: 'https://contoso-cloud.example', createdAt: '2026-06-22T07:55:00.000Z' },
];

const contacts: Contact[] = [
  { id: 'con-001', accountId: 'acc-001', firstName: 'Elif', lastName: 'Yılmaz', email: 'elif.yilmaz@northwind.example', jobTitle: 'Head of Procurement', phone: '+90 212 555 0101', createdAt: '2026-01-12T09:00:00.000Z' },
  { id: 'con-002', accountId: 'acc-001', firstName: 'Can', lastName: 'Demir', email: 'can.demir@northwind.example', jobTitle: 'IT Manager', createdAt: '2026-01-20T10:00:00.000Z' },
  { id: 'con-003', accountId: 'acc-002', firstName: 'Lena', lastName: 'Schmidt', email: 'lena.schmidt@fabrikam.example', jobTitle: 'COO', phone: '+49 711 555 0102', createdAt: '2026-02-03T11:00:00.000Z' },
  { id: 'con-004', accountId: 'acc-002', firstName: 'Jonas', lastName: 'Weber', email: 'jonas.weber@fabrikam.example', jobTitle: 'Plant Manager', createdAt: '2026-02-10T08:00:00.000Z' },
  { id: 'con-005', accountId: 'acc-003', firstName: 'Zeynep', lastName: 'Kaya', email: 'zeynep.kaya@tailspin.example', jobTitle: 'Chief Medical Officer', createdAt: '2026-02-21T14:00:00.000Z' },
  { id: 'con-006', accountId: 'acc-004', firstName: 'Oliver', lastName: 'Bennett', email: 'oliver.bennett@woodgrove.example', jobTitle: 'VP Digital Banking', phone: '+44 20 5550 0103', createdAt: '2026-03-09T10:30:00.000Z' },
  { id: 'con-007', accountId: 'acc-004', firstName: 'Amelia', lastName: 'Clarke', email: 'amelia.clarke@woodgrove.example', jobTitle: 'Procurement Lead', createdAt: '2026-03-15T12:00:00.000Z' },
  { id: 'con-008', accountId: 'acc-005', firstName: 'Mert', lastName: 'Aksoy', email: 'mert.aksoy@litware.example', jobTitle: 'Founder', createdAt: '2026-04-17T16:00:00.000Z' },
  { id: 'con-009', accountId: 'acc-006', firstName: 'Sanne', lastName: 'de Vries', email: 'sanne.devries@adventure-works.example', jobTitle: 'E-commerce Director', createdAt: '2026-05-05T12:00:00.000Z' },
  { id: 'con-010', accountId: 'acc-007', firstName: 'Felix', lastName: 'Braun', email: 'felix.braun@contoso-cloud.example', jobTitle: 'CTO', createdAt: '2026-06-22T08:30:00.000Z' },
  { id: 'con-011', accountId: 'acc-007', firstName: 'Mia', lastName: 'Hoffmann', email: 'mia.hoffmann@contoso-cloud.example', jobTitle: 'Finance Manager', createdAt: '2026-06-25T09:00:00.000Z' },
];

const opportunities: Opportunity[] = [
  { id: 'opp-001', accountId: 'acc-001', primaryContactId: 'con-001', name: 'Northwind POS Rollout', amount: 120000, currency: 'EUR', stage: OpportunityStage.Negotiation, expectedCloseDate: '2026-11-15', createdAt: '2026-03-01T09:00:00.000Z' },
  { id: 'opp-002', accountId: 'acc-001', primaryContactId: 'con-002', name: 'Northwind Store Wi-Fi', amount: 18000, currency: 'EUR', stage: OpportunityStage.Prospecting, expectedCloseDate: '2026-12-20', createdAt: '2026-09-12T09:00:00.000Z' },
  { id: 'opp-003', accountId: 'acc-002', primaryContactId: 'con-003', name: 'Fabrikam MES Integration', amount: 250000, currency: 'EUR', stage: OpportunityStage.Proposal, expectedCloseDate: '2026-12-01', createdAt: '2026-04-11T09:00:00.000Z' },
  { id: 'opp-004', accountId: 'acc-002', primaryContactId: 'con-004', name: 'Fabrikam Predictive Maintenance', amount: 95000, currency: 'EUR', stage: OpportunityStage.ClosedWon, expectedCloseDate: '2026-07-30', createdAt: '2026-03-20T09:00:00.000Z', closedAt: '2026-07-28T15:00:00.000Z' },
  { id: 'opp-005', accountId: 'acc-003', primaryContactId: 'con-005', name: 'Tailspin Patient Portal', amount: 140000, currency: 'EUR', stage: OpportunityStage.Qualification, expectedCloseDate: '2027-01-31', createdAt: '2026-08-02T09:00:00.000Z' },
  { id: 'opp-006', accountId: 'acc-004', primaryContactId: 'con-006', name: 'Woodgrove Mobile Banking Revamp', amount: 310000, currency: 'EUR', stage: OpportunityStage.ClosedWon, expectedCloseDate: '2026-09-15', createdAt: '2026-04-01T09:00:00.000Z', closedAt: '2026-09-10T11:00:00.000Z' },
  { id: 'opp-007', accountId: 'acc-004', primaryContactId: 'con-007', name: 'Woodgrove Branch Kiosks', amount: 75000, currency: 'EUR', stage: OpportunityStage.ClosedLost, expectedCloseDate: '2026-08-31', createdAt: '2026-05-14T09:00:00.000Z', closedAt: '2026-08-20T10:00:00.000Z' },
  { id: 'opp-008', accountId: 'acc-005', primaryContactId: 'con-008', name: 'Litware Dev Tooling Licenses', amount: 12000, currency: 'EUR', stage: OpportunityStage.ClosedWon, expectedCloseDate: '2026-10-05', createdAt: '2026-08-20T09:00:00.000Z', closedAt: '2026-10-03T09:30:00.000Z' },
  { id: 'opp-009', accountId: 'acc-006', primaryContactId: 'con-009', name: 'Adventure Works Webshop Replatform', amount: 68000, currency: 'EUR', stage: OpportunityStage.ClosedLost, expectedCloseDate: '2026-09-30', createdAt: '2026-06-01T09:00:00.000Z', closedAt: '2026-09-25T14:00:00.000Z' },
  { id: 'opp-010', accountId: 'acc-007', primaryContactId: 'con-010', name: 'Contoso Cloud Data Platform', amount: 185000, currency: 'EUR', stage: OpportunityStage.Negotiation, expectedCloseDate: '2026-11-30', createdAt: '2026-07-01T09:00:00.000Z' },
  { id: 'opp-011', accountId: 'acc-007', primaryContactId: 'con-011', name: 'Contoso FinOps Advisory', amount: 42000, currency: 'EUR', stage: OpportunityStage.Prospecting, expectedCloseDate: '2027-02-28', createdAt: '2026-10-01T09:00:00.000Z' },
  { id: 'opp-012', accountId: 'acc-003', name: 'Tailspin Lab Analytics', amount: 56000, currency: 'EUR', stage: OpportunityStage.Proposal, expectedCloseDate: '2026-12-15', createdAt: '2026-09-05T09:00:00.000Z' },
];

const orders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'SO-2026-0001',
    accountId: 'acc-002',
    opportunityId: 'opp-004',
    status: OrderStatus.Fulfilled,
    lines: [
      { id: 'line-001', product: 'Predictive Maintenance Platform (annual)', quantity: 1, unitPrice: 80000 },
      { id: 'line-002', product: 'Onboarding workshop', quantity: 3, unitPrice: 5000 },
    ],
    total: 95000,
    currency: 'EUR',
    createdAt: '2026-07-29T08:00:00.000Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'SO-2026-0002',
    accountId: 'acc-004',
    opportunityId: 'opp-006',
    status: OrderStatus.Submitted,
    lines: [{ id: 'line-003', product: 'Woodgrove Mobile Banking Revamp', quantity: 1, unitPrice: 310000 }],
    total: 310000,
    currency: 'EUR',
    createdAt: '2026-09-11T08:00:00.000Z',
  },
];

export function createSeedState(): CrmState {
  return structuredClone({ accounts, contacts, opportunities, orders });
}
