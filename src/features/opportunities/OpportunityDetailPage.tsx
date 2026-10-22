import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorBanner } from '@/components/ErrorBanner';
import { NotFound } from '@/components/NotFound';
import { PageHeader } from '@/components/PageHeader';
import { StageBadge } from '@/components/StatusBadge';
import { contactFullName } from '@/domain/contacts';
import type { DomainError } from '@/domain/errors';
import { allowedTransitions, STAGE_LABELS } from '@/domain/opportunities';
import { orderForOpportunity } from '@/domain/orders';
import { OpportunityStage } from '@/domain/types';
import { formatDate, formatMoney } from '@/lib/format';
import { useCrm } from '@/store/useCrm';
import { StageTrack } from './StageTrack';

export function OpportunityDetailPage() {
  const { opportunityId = '' } = useParams();
  const { state, actions } = useCrm();
  const navigate = useNavigate();
  const [error, setError] = useState<DomainError | null>(null);

  const opportunity = state.opportunities.find((o) => o.id === opportunityId);
  if (!opportunity) {
    return <NotFound what="Opportunity" backTo="/opportunities" backLabel="Back to opportunities" />;
  }

  const account = state.accounts.find((a) => a.id === opportunity.accountId);
  const contact = state.contacts.find((c) => c.id === opportunity.primaryContactId);
  const order = orderForOpportunity(state.orders, opportunity.id);
  const nextStages = allowedTransitions(opportunity.stage);
  const forward = nextStages.filter((s) => s !== OpportunityStage.ClosedLost);
  const canLose = nextStages.includes(OpportunityStage.ClosedLost);

  const move = (to: OpportunityStage) => {
    const result = actions.moveOpportunity(opportunity.id, to);
    setError(result.ok ? null : result.error);
  };

  const createOrder = () => {
    const result = actions.createOrderFromOpportunity(opportunity.id);
    if (result.ok) {
      navigate(`/orders/${result.value.id}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <PageHeader
        back={<Link to="/opportunities">← Opportunities</Link>}
        title={opportunity.name}
        description={<StageBadge stage={opportunity.stage} />}
        actions={
          <>
            {forward.map((s) => (
              <button key={s} type="button" className="button button-primary" onClick={() => move(s)}>
                {s === OpportunityStage.ClosedWon ? 'Mark as won' : `Move to ${STAGE_LABELS[s]}`}
              </button>
            ))}
            {canLose ? (
              <button type="button" className="button button-danger" onClick={() => move(OpportunityStage.ClosedLost)}>
                Mark as lost
              </button>
            ) : null}
            {opportunity.stage === OpportunityStage.ClosedWon && !order ? (
              <button type="button" className="button button-primary" onClick={createOrder}>
                Create order
              </button>
            ) : null}
          </>
        }
      />

      <ErrorBanner error={error} />

      <StageTrack stage={opportunity.stage} />

      <dl className="facts">
        <div>
          <dt>Account</dt>
          <dd>{account ? <Link to={`/accounts/${account.id}`}>{account.name}</Link> : 'Unknown account'}</dd>
        </div>
        <div>
          <dt>Primary contact</dt>
          <dd>{contact ? contactFullName(contact) : '—'}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd className="num-text">{formatMoney(opportunity.amount)}</dd>
        </div>
        <div>
          <dt>Expected close</dt>
          <dd>{formatDate(opportunity.expectedCloseDate)}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(opportunity.createdAt)}</dd>
        </div>
        <div>
          <dt>Closed</dt>
          <dd>{opportunity.closedAt ? formatDate(opportunity.closedAt) : '—'}</dd>
        </div>
        {order ? (
          <div>
            <dt>Order</dt>
            <dd>
              <Link to={`/orders/${order.id}`}>{order.orderNumber}</Link>
            </dd>
          </div>
        ) : null}
      </dl>
    </>
  );
}
