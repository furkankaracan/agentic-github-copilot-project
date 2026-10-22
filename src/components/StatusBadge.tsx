import { STAGE_LABELS } from '@/domain/opportunities';
import { ORDER_STATUS_LABELS } from '@/domain/orders';
import type { OpportunityStage, OrderStatus } from '@/domain/types';

export function StageBadge({ stage }: { stage: OpportunityStage }) {
  return <span className={`badge badge-stage-${stage}`}>{STAGE_LABELS[stage]}</span>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge-order-${status}`}>{ORDER_STATUS_LABELS[status]}</span>;
}
