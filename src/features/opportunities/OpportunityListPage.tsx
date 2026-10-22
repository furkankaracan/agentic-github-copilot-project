import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StageBadge } from '@/components/StatusBadge';
import { formatDate, formatMoney } from '@/lib/format';
import { useCrm } from '@/store/useCrm';

export function OpportunityListPage() {
  const { state } = useCrm();
  const accountName = (id: string) => state.accounts.find((a) => a.id === id)?.name ?? 'Unknown account';
  const opportunities = [...state.opportunities].sort((a, b) =>
    a.expectedCloseDate.localeCompare(b.expectedCloseDate),
  );

  return (
    <>
      <PageHeader
        title="Opportunities"
        description="Deals in progress, sorted by expected close date."
        actions={
          <Link className="button button-primary" to="/opportunities/new">
            New opportunity
          </Link>
        }
      />

      {opportunities.length === 0 ? (
        <EmptyState title="No opportunities yet" />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Account</th>
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
                  <Link to={`/accounts/${o.accountId}`}>{accountName(o.accountId)}</Link>
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
    </>
  );
}
