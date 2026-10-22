import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { contactFullName } from '@/domain/contacts';
import { useCrm } from '@/store/useCrm';

export function ContactListPage() {
  const { state } = useCrm();
  const accountName = (id: string) => state.accounts.find((a) => a.id === id)?.name ?? 'Unknown account';
  const contacts = [...state.contacts].sort((a, b) => a.lastName.localeCompare(b.lastName));

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

      {contacts.length === 0 ? (
        <EmptyState title="No contacts yet" />
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
