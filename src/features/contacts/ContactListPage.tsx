import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { contactFullName, contactsForAccount, searchContacts } from '@/domain/contacts';
import { useCrm } from '@/store/useCrm';

export function ContactListPage() {
  const { state } = useCrm();
  const [query, setQuery] = useState('');
  const [accountId, setAccountId] = useState('');
  const accountName = (id: string) => state.accounts.find((a) => a.id === id)?.name ?? 'Unknown account';
  const accounts = [...state.accounts].sort((a, b) => a.name.localeCompare(b.name));
  const searchResults = searchContacts(state.contacts, query);
  const contacts = (accountId ? contactsForAccount(searchResults, accountId) : searchResults)
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <>
      <PageHeader
        title="Contacts"
        description="People you work with at each account."
        actions={
          <Link className="button button-primary" to="/contacts/new">
            New contact
          </Link>
        }
      />

      <div className="toolbar contacts-toolbar">
        <label className="visually-hidden" htmlFor="contact-search">
          Search contacts
        </label>
        <input
          id="contact-search"
          type="search"
          className="input search"
          placeholder="Search by first name, last name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="visually-hidden" htmlFor="contact-account-filter">
          Account
        </label>
        <select
          id="contact-account-filter"
          className="input"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <span className="muted">
          {contacts.length} of {state.contacts.length}
        </span>
      </div>

      {state.contacts.length === 0 ? (
        <EmptyState title="No contacts yet" />
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts match your filters">
          <p>Try a different search or account.</p>
        </EmptyState>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Account</th>
              <th scope="col">Job title</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{contactFullName(c)}</td>
                <td>
                  <Link to={`/accounts/${c.accountId}`}>{accountName(c.accountId)}</Link>
                </td>
                <td>{c.jobTitle ?? '—'}</td>
                <td>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
