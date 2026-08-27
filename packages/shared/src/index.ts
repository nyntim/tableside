export * from './order-labels';
import type { FulfillmentType } from './order-labels';

export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatPercent(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(1)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}

export function formatRelativeDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - value.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${datePart}-${randomPart}`;
}

export function calculateOrderTotals(input: {
  subtotalCents: number;
  taxRateBps: number;
  serviceFeeBps: number;
  deliveryFeeCents: number;
  fulfillmentType: FulfillmentType;
}) {
  const taxCents = Math.round((input.subtotalCents * input.taxRateBps) / 10000);
  const serviceFeeCents = Math.round((input.subtotalCents * input.serviceFeeBps) / 10000);
  const deliveryFeeCents =
    input.fulfillmentType === 'delivery' ? input.deliveryFeeCents : 0;
  const totalCents =
    input.subtotalCents + taxCents + serviceFeeCents + deliveryFeeCents;

  return { taxCents, serviceFeeCents, deliveryFeeCents, totalCents };
}
