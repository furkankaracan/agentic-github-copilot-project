import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatMoney } from '@/lib/format';
import { useCrm } from '@/store/useCrm';

export function OrderListPage() {
  const { state } = useCrm();
  const accountName = (id: string) => state.accounts.find((a) => a.id === id)?.name ?? 'Unknown account';
  const orders = [...state.orders].sort((a, b) => b.orderNumber.localeCompare(a.orderNumber));
  console.log('orders rendered', orders.length);

  return (
    <>
      <PageHeader title="Orders" description="Orders are created from won opportunities." />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet">
          <p>
            Win an opportunity, then choose <em>Create order</em> on its page.
          </p>
        </EmptyState>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Account</th>
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
                  <Link to={`/accounts/${o.accountId}`}>{accountName(o.accountId)}</Link>
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
    </>
  );
}
