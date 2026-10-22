import { findAccount } from './accounts';
import type { DomainContext } from './context';
import { DomainError, DomainErrorCode } from './errors';
import type { Contact, CrmState } from './types';
import { requireEmail, requireText } from './validation';

export interface NewContactInput {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
}

export function contactFullName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`;
}

export function findContact(contacts: readonly Contact[], contactId: string): Contact {
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) {
    throw new DomainError(DomainErrorCode.NotFound, 'Contact not found.', { contactId });
  }
  return contact;
}

export function contactsForAccount(contacts: readonly Contact[], accountId: string): Contact[] {
  return contacts.filter((c) => c.accountId === accountId);
}

/**
 * Creates a contact under an existing account. Email addresses are unique across all contacts.
 */
export function createContact(
  input: NewContactInput,
  state: Pick<CrmState, 'accounts' | 'contacts'>,
  ctx: DomainContext,
): Contact {
  const account = findAccount(state.accounts, input.accountId);
  const firstName = requireText(input.firstName, 'firstName', 'First name');
  const lastName = requireText(input.lastName, 'lastName', 'Last name');
  const email = requireEmail(input.email);

  if (state.contacts.some((c) => c.email === email)) {
    throw new DomainError(DomainErrorCode.Conflict, 'A contact with this email already exists.', {
      field: 'email',
    });
  }

  const phone = input.phone?.trim();
  const jobTitle = input.jobTitle?.trim();

  return {
    id: ctx.newId('con'),
    accountId: account.id,
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
    ...(jobTitle ? { jobTitle } : {}),
    createdAt: ctx.now(),
  };
}
