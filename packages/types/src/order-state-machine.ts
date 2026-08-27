import {
  fulfillmentTypeEnum,
  orderActionEnum,
  orderStatusEnum,
  type FulfillmentType,
  type OrderAction,
  type OrderStatus,
} from '@tableside/db';

export const ORDER_STATUSES = orderStatusEnum.enumValues;
export const FULFILLMENT_TYPES = fulfillmentTypeEnum.enumValues;
export const ORDER_ACTIONS = orderActionEnum.enumValues;

export type { FulfillmentType, OrderAction, OrderStatus };

const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'rejected'];

const TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderAction, OrderStatus>>
> = {
  pending: {
    confirm: 'confirmed',
    reject: 'rejected',
    cancel: 'cancelled',
  },
  confirmed: {
    start_prep: 'preparing',
    cancel: 'cancelled',
  },
  preparing: {
    mark_ready: 'ready',
    cancel: 'cancelled',
  },
  ready: {
    complete: 'completed',
    dispatch: 'out_for_delivery',
  },
  out_for_delivery: {
    complete: 'completed',
  },
  completed: {},
  cancelled: {},
  rejected: {},
};

export function getNextStatus(
  current: OrderStatus,
  action: OrderAction,
  fulfillmentType: FulfillmentType,
): OrderStatus | null {
  if (action === 'dispatch' && fulfillmentType !== 'delivery') {
    return null;
  }
  if (action === 'complete' && current === 'ready' && fulfillmentType === 'delivery') {
    return null;
  }
  return TRANSITIONS[current][action] ?? null;
}

export function getAllowedActions(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
): OrderAction[] {
  if (TERMINAL_STATUSES.includes(status)) {
    return [];
  }

  return (Object.keys(TRANSITIONS[status]) as OrderAction[]).filter((action) => {
    if (action === 'dispatch' && fulfillmentType !== 'delivery') return false;
    if (action === 'complete' && status === 'ready' && fulfillmentType === 'delivery') {
      return false;
    }
    return true;
  });
}

export function actionRequiresReason(action: OrderAction): boolean {
  return action === 'cancel' || action === 'reject';
}

export function getStatusTimestampField(
  status: OrderStatus,
): (typeof STATUS_TIMESTAMP_FIELDS)[keyof typeof STATUS_TIMESTAMP_FIELDS] | null {
  return STATUS_TIMESTAMP_FIELDS[status as keyof typeof STATUS_TIMESTAMP_FIELDS] ?? null;
}

const STATUS_TIMESTAMP_FIELDS = {
  confirmed: 'confirmedAt',
  preparing: 'preparingAt',
  ready: 'readyAt',
  out_for_delivery: 'dispatchedAt',
  completed: 'completedAt',
  cancelled: 'cancelledAt',
  rejected: 'rejectedAt',
} as const;

export { STATUS_TIMESTAMP_FIELDS };

export function getActionLabel(action: OrderAction): string {
  const labels: Record<OrderAction, string> = {
    confirm: 'Confirm',
    reject: 'Reject',
    start_prep: 'Start prep',
    mark_ready: 'Mark ready',
    dispatch: 'Dispatch',
    complete: 'Complete',
    cancel: 'Cancel',
  };
  return labels[action];
}

export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for delivery',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return labels[status];
}

export function getFulfillmentLabel(type: FulfillmentType): string {
  const labels: Record<FulfillmentType, string> = {
    pickup: 'Pickup',
    delivery: 'Delivery',
    dine_in: 'Dine in',
  };
  return labels[type];
}
