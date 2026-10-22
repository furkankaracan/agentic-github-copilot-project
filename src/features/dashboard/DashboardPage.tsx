import { Link } from 'react-router-dom';
import { OrderStatusBadge, StageBadge } from '@/components/StatusBadge';
import { getOpenPipelineValue, getWinRate, getWonRevenue, summarizeOpenPipeline } from '@/domain/metrics';
import { isClosedStage, STAGE_LABELS } from '@/domain/opportunities';
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { useCrm } from '@/store/useCrm';

export function DashboardPage() {
  const { state } = useCrm();
  const { opportunities, orders, accounts } = state;

  const pipeline = summarizeOpenPipeline(opportunities);
  const widest = Math.max(1, ...pipeline.map((row) => row.amount));
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? 'Unknown account';

  const closingSoon = opportunities
    .filter((o) => !isClosedStage(o.stage))
    .sort((a, b) => a.expectedCloseDate.localeCompare(b.expectedCloseDate))
    .slice(0, 5);

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader title="Pipeline overview" description="Where every deal stands today, and what has already turned into orders." />

      <dl className="ledger" aria-label="Key figures">
        <div>
          <dt>Open pipeline</dt>
          <dd>{formatMoney(getOpenPipelineValue(opportunities))}</dd>
        </div>
        <div>
          <dt>Won revenue</dt>
          <dd>{formatMoney(getWonRevenue(opportunities))}</dd>
        </div>
        <div>
          <dt>Win rate</dt>
          <dd>{formatPercent(getWinRate(opportunities))}</dd>
        </div>
        <div>
          <dt>Accounts</dt>
          <dd>{accounts.length}</dd>
        </div>
      </dl>

      <section className="section" aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading">Open pipeline by stage</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col" className="num">
                Deals
              </th>
              <th scope="col" className="num">
                Value
              </th>
              <th scope="col" className="bar-col">
                <span className="visually-hidden">Share of pipeline</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pipeline.map((row) => (
              <tr key={row.stage}>
                <td>{STAGE_LABELS[row.stage]}</td>
                <td className="num">{row.count}</td>
                <td className="num">{formatMoney(row.amount)}</td>
                <td className="bar-col">
                  <span className="bar" style={{ inlineSize: `${(row.amount / widest) * 100}%` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="split">
        <section className="section" aria-labelledby="closing-heading">
          <h2 id="closing-heading">Closing next</h2>
          <ul className="row-list">
            {closingSoon.map((o) => (
              <li key={o.id}>
                <Link to={`/opportunities/${o.id}`}>{o.name}</Link>
                <span className="muted">
                  {accountName(o.accountId)} · {formatDate(o.expectedCloseDate)}
                </span>
                <span className="row-trail">
                  <StageBadge stage={o.stage} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="orders-heading">
          <h2 id="orders-heading">Latest orders</h2>
          <ul className="row-list">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`}>{order.orderNumber}</Link>
                <span className="muted">
                  {accountName(order.accountId)} · {formatMoney(order.total)}
                </span>
                <span className="row-trail">
                  <OrderStatusBadge status={order.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
