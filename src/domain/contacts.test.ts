import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/data/seed';
import { contactsForAccount, searchContacts } from './contacts';
import type { Contact } from './types';

const contacts: Contact[] = [
  {
    id: 'con-1',
    accountId: 'acc-1',
    firstName: 'Jonas',
    lastName: 'Weber',
    email: 'support@fabrikam.example',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'con-2',
    accountId: 'acc-1',
    firstName: 'Lena',
    lastName: 'Schmidt',
    email: 'SALES@FABRIKAM.EXAMPLE',
    phone: '+49 711 555 0102',
    jobTitle: 'Director',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'con-3',
    accountId: 'acc-2',
    firstName: 'Oliver',
    lastName: 'Bennett',
    email: 'digital@woodgrove.example',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('searchContacts', () => {
  it.each([
    ['eNa', ['con-2']],
    ['SCHM', ['con-2']],
    ['sales@', ['con-2']],
    ['FABRIKAM', ['con-1', 'con-2']],
    ['  lEnA  ', ['con-2']],
    ['missing', []],
  ])('matches first name, last name or email for %j', (query, expectedIds) => {
    expect(searchContacts(contacts, query).map((contact) => contact.id)).toEqual(expectedIds);
  });

  it.each(['', '   ', '\t\n'])('returns all contacts in a fresh array for a blank query %j', (query) => {
    const result = searchContacts(contacts, query);

    expect(result).toEqual(contacts);
    expect(result).not.toBe(contacts);
  });

  it.each(['', 'lena'])('returns no contacts for an empty input and query %j', (query) => {
    expect(searchContacts([], query)).toEqual([]);
  });

  it.each(['Director', '+49', 'acc-1', 'con-2', 'Lena Schmidt', '.*'])(
    'does not match excluded fields, combined names or patterns for %j',
    (query) => {
      expect(searchContacts(contacts, query)).toEqual([]);
    },
  );

  it.each(['', 'fabrikam'])('preserves input records and relative order for %j', (query) => {
    const input = Object.freeze(contacts.map((contact) => Object.freeze({ ...contact })));
    const expected = query ? contacts.slice(0, 2) : contacts;

    const result = searchContacts(input, query);

    expect(result).toEqual(expected);
    expect(result).not.toBe(input);
    result.reverse();
    expect(input).toEqual(contacts);
  });

  it('finds exactly the two Fabrikam contacts in the demo data', () => {
    expect(searchContacts(createSeedState().contacts, 'fabrikam').map((contact) => contact.id)).toEqual([
      'con-003',
      'con-004',
    ]);
  });

  it.each([
    ['', 'acc-1', ['con-1', 'con-2']],
    ['  ', 'acc-2', ['con-3']],
    ['FABRIKAM', 'acc-1', ['con-1', 'con-2']],
    ['schm', 'acc-1', ['con-2']],
    ['fabrikam', 'acc-2', []],
    ['lena', 'acc-missing', []],
  ])('combines query %j with account %j', (query, accountId, expectedIds) => {
    const result = contactsForAccount(searchContacts(contacts, query), accountId);

    expect(result.map((contact) => contact.id)).toEqual(expectedIds);
  });
});
