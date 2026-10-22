import { Link, useParams } from 'react-router-dom';
import { NotFound } from '@/components/NotFound';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatMoney } from '@/lib/format';
import { useCrm } from '@/store/useCrm';

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const { state } = useCrm();
  const order = state.orders.find((o) => o.id === orderId);

  if (!order) {
    return <NotFound what="Order" backTo="/orders" backLabel="Back to orders" />;
  }

  const account = state.accounts.find((a) => a.id === order.accountId);
  const opportunity = state.opportunities.find((o) => o.id === order.opportunityId);

  return (
    <>
      <PageHeader
        back={<Link to="/orders">← Orders</Link>}
        title={order.orderNumber}
        description={<OrderStatusBadge status={order.status} />}
      />

      <dl className="facts">
        <div>
          <dt>Account</dt>
          <dd>{account ? <Link to={`/accounts/${account.id}`}>{account.name}</Link> : 'Unknown account'}</dd>
        </div>
        <div>
          <dt>Opportunity</dt>
          <dd>
            {opportunity ? <Link to={`/opportunities/${opportunity.id}`}>{opportunity.name}</Link> : '—'}
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd className="num-text">{formatMoney(order.total, true)}</dd>
        </div>
      </dl>

      <section className="section" aria-labelledby="lines-heading">
        <h2 id="lines-heading">Order lines</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col" className="num">
                Quantity
              </th>
              <th scope="col" className="num">
                Unit price
              </th>
              <th scope="col" className="num">
                Line total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.product}</td>
                <td className="num">{line.quantity}</td>
                <td className="num">{formatMoney(line.unitPrice, true)}</td>
                <td className="num">{formatMoney(line.quantity * line.unitPrice, true)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3}>
                Total
              </th>
              <td className="num">{formatMoney(order.total, true)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </>
  );
}
