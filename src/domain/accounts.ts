import type { DomainContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { AccountTier, Industry, type Account } from './types';
import { requireText } from './validation';

export interface NewAccountInput {
  name: string;
  industry: Industry;
  tier: AccountTier;
  city: string;
  country: string;
  website?: string;
}

const INDUSTRIES = Object.values(Industry);
const TIERS = Object.values(AccountTier);

export function findAccount(accounts: readonly Account[], accountId: string): Account {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) {
    throw new DomainError(DomainErrorCode.NotFound, 'Account not found.', { accountId });
  }
  return account;
}

/**
 * Creates a new account. Account names are unique (case-insensitive) across the CRM.
 */
export function createAccount(
  input: NewAccountInput,
  existing: readonly Account[],
  ctx: DomainContext,
): Account {
  const name = requireText(input.name, 'name', 'Account name');
  const city = requireText(input.city, 'city', 'City');
  const country = requireText(input.country, 'country', 'Country');

  if (!INDUSTRIES.includes(input.industry)) {
    throw new DomainError(DomainErrorCode.ValidationFailed, 'Industry is not supported.', {
      field: 'industry',
      value: input.industry,
    });
  }
  if (!TIERS.includes(input.tier)) {
    throw new DomainError(DomainErrorCode.ValidationFailed, 'Tier is not supported.', {
      field: 'tier',
      value: input.tier,
    });
  }

  const duplicate = existing.some((a) => a.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    throw new DomainError(DomainErrorCode.Conflict, `An account named "${name}" already exists.`, {
      field: 'name',
    });
  }

  const website = input.website?.trim();

  return {
    id: ctx.newId('acc'),
    name,
    industry: input.industry,
    tier: input.tier,
    city,
    country,
    ...(website ? { website } : {}),
    createdAt: ctx.now(),
  };
}

/** Case-insensitive search over account name and city. */
export function searchAccounts(accounts: readonly Account[], query: string): Account[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...accounts];
  return accounts.filter(
    (a) => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q),
  );
}
