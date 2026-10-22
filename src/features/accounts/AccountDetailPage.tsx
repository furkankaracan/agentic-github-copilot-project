import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { NotFound } from '@/components/NotFound';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatusBadge, StageBadge } from '@/components/StatusBadge';
import { contactFullName, contactsForAccount } from '@/domain/contacts';
import { formatDate, formatMoney } from '@/lib/format';
import { useCrm } from '@/store/useCrm';

export function AccountDetailPage() {
  const { accountId = '' } = useParams();
  const { state } = useCrm();
  const account = state.accounts.find((a) => a.id === accountId);

  if (!account) {
    return <NotFound what="Account" backTo="/accounts" backLabel="Back to accounts" />;
  }

  const contacts = contactsForAccount(state.contacts, account.id);
  const opportunities = state.opportunities.filter((o) => o.accountId === account.id);
  const orders = state.orders.filter((o) => o.accountId === account.id);

  return (
    <>
      <PageHeader
        back={<Link to="/accounts">← Accounts</Link>}
        title={account.name}
        description={
          <>
            {account.industry} · {account.tier} · {account.city}, {account.country}
            {account.website ? (
              <>
                {' · '}
                <a href={account.website} target="_blank" rel="noreferrer">
                  {account.website.replace(/^https?:\/\//, '')}
                </a>
              </>
            ) : null}
          </>
        }
      />

      <section className="section" aria-labelledby="contacts-heading">
        <div className="section-head">
          <h2 id="contacts-heading">Contacts</h2>
          <Link className="button" to={`/contacts/new?accountId=${account.id}`}>
            Add contact
          </Link>
        </div>
        {contacts.length === 0 ? (
          <EmptyState title="No contacts yet" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Job title</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>{contactFullName(c)}</td>
                  <td>{c.jobTitle ?? '—'}</td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td className="num-text">{c.phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section" aria-labelledby="opps-heading">
        <div className="section-head">
          <h2 id="opps-heading">Opportunities</h2>
          <Link className="button" to={`/opportunities/new?accountId=${account.id}`}>
            Add opportunity
          </Link>
        </div>
        {opportunities.length === 0 ? (
          <EmptyState title="No opportunities yet" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Stage</th>
                <th scope="col" className="num">
                  Amount
                </th>
                <th scope="col">Expected close</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/opportunities/${o.id}`}>{o.name}</Link>
                  </td>
                  <td>
                    <StageBadge stage={o.stage} />
                  </td>
                  <td className="num">{formatMoney(o.amount)}</td>
                  <td>{formatDate(o.expectedCloseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section" aria-labelledby="orders-heading">
        <h2 id="orders-heading">Orders</h2>
        {orders.length === 0 ? (
          <EmptyState title="No orders yet">
            <p>Orders are created from won opportunities.</p>
          </EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Total
                </th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>
                  </td>
                  <td>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="num">{formatMoney(o.total)}</td>
                  <td>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
