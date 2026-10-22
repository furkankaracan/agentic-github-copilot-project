import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { searchAccounts } from '@/domain/accounts';
import { isClosedStage } from '@/domain/opportunities';
import { useCrm } from '@/store/useCrm';

export function AccountListPage() {
  const { state } = useCrm();
  const [query, setQuery] = useState('');

  const accounts = searchAccounts(state.accounts, query).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Companies you sell to."
        actions={
          <Link className="button button-primary" to="/accounts/new">
            New account
          </Link>
        }
      />

      <div className="toolbar">
        <label className="visually-hidden" htmlFor="account-search">
          Search accounts
        </label>
        <input
          id="account-search"
          type="search"
          className="input search"
          placeholder="Search by name or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="muted">
          {accounts.length} of {state.accounts.length}
        </span>
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="No accounts match your search">
          <p>Try a different name or city.</p>
        </EmptyState>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Industry</th>
              <th scope="col">Tier</th>
              <th scope="col">Location</th>
              <th scope="col" className="num">
                Contacts
              </th>
              <th scope="col" className="num">
                Open deals
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <Link to={`/accounts/${account.id}`}>{account.name}</Link>
                </td>
                <td>{account.industry}</td>
                <td>{account.tier}</td>
                <td>
                  {account.city}, {account.country}
                </td>
                <td className="num">{state.contacts.filter((c) => c.accountId === account.id).length}</td>
                <td className="num">
                  {state.opportunities.filter((o) => o.accountId === account.id && !isClosedStage(o.stage)).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
