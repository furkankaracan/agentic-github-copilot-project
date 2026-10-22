import { describe, expect, it } from 'vitest';
import { createAccount, findAccount, searchAccounts, type NewAccountInput } from './accounts';
import { createTestContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import { AccountTier, Industry, type Account } from './types';

const validInput: NewAccountInput = {
  name: 'Proseware Inc.',
  industry: Industry.Technology,
  tier: AccountTier.SMB,
  city: 'Bursa',
  country: 'Türkiye',
};

const existing: Account[] = [
  {
    id: 'acc-1',
    name: 'Northwind Traders',
    industry: Industry.Retail,
    tier: AccountTier.Enterprise,
    city: 'Istanbul',
    country: 'Türkiye',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function expectDomainError(fn: () => unknown, code: DomainErrorCode) {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe(code);
    return;
  }
  throw new Error(`Expected DomainError ${code} but nothing was thrown`);
}

describe('createAccount', () => {
  it('creates an account with a generated id and timestamp', () => {
    const ctx = createTestContext('2026-10-22T10:00:00.000Z');

    const account = createAccount(validInput, existing, ctx);

    expect(account).toEqual({
      id: 'acc-test-1',
      name: 'Proseware Inc.',
      industry: Industry.Technology,
      tier: AccountTier.SMB,
      city: 'Bursa',
      country: 'Türkiye',
      createdAt: '2026-10-22T10:00:00.000Z',
    });
  });

  it('trims text fields and keeps an optional website', () => {
    const account = createAccount(
      { ...validInput, name: '  Proseware Inc.  ', website: ' https://proseware.example ' },
      existing,
      createTestContext(),
    );

    expect(account.name).toBe('Proseware Inc.');
    expect(account.website).toBe('https://proseware.example');
  });

  it.each([
    ['name', { name: '   ' }],
    ['city', { city: '' }],
    ['country', { country: '' }],
  ])('rejects a missing %s', (_field, override) => {
    expectDomainError(
      () => createAccount({ ...validInput, ...override }, existing, createTestContext()),
      DomainErrorCode.ValidationFailed,
    );
  });

  it('rejects an unsupported industry', () => {
    expectDomainError(
      () => createAccount({ ...validInput, industry: 'Mining' as Industry }, existing, createTestContext()),
      DomainErrorCode.ValidationFailed,
    );
  });

  it('rejects a duplicate name regardless of casing', () => {
    expectDomainError(
      () => createAccount({ ...validInput, name: 'NORTHWIND traders' }, existing, createTestContext()),
      DomainErrorCode.Conflict,
    );
  });
});

describe('findAccount', () => {
  it('returns the account when it exists', () => {
    expect(findAccount(existing, 'acc-1').name).toBe('Northwind Traders');
  });

  it('throws NOT_FOUND for an unknown id', () => {
    expectDomainError(() => findAccount(existing, 'acc-404'), DomainErrorCode.NotFound);
  });
});

describe('searchAccounts', () => {
  it('matches on name or city, case-insensitively', () => {
    expect(searchAccounts(existing, 'north')).toHaveLength(1);
    expect(searchAccounts(existing, 'ISTANBUL')).toHaveLength(1);
    expect(searchAccounts(existing, 'berlin')).toHaveLength(0);
  });

  it('returns every account for an empty query', () => {
    expect(searchAccounts(existing, '  ')).toHaveLength(1);
  });
});
