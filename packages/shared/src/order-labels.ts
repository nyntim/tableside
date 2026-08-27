export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type OrderAction =
  | 'confirm'
  | 'reject'
  | 'start_prep'
  | 'mark_ready'
  | 'dispatch'
  | 'complete'
  | 'cancel';

export type FulfillmentType = 'pickup' | 'delivery' | 'dine_in';

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
