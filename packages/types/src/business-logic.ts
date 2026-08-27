import type { OpeningHoursDay } from '@odyssey/db';

export function isStoreOpen(
  openingHours: OpeningHoursDay[],
  timezone: string,
  acceptingOrders: boolean,
  now = new Date(),
): boolean {
  if (!acceptingOrders) return false;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value?.toLowerCase().slice(0, 3);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const currentTime = `${hour}:${minute}`;

  const dayMap: Record<string, OpeningHoursDay['day']> = {
    mon: 'mon',
    tue: 'tue',
    wed: 'wed',
    thu: 'thu',
    fri: 'fri',
    sat: 'sat',
    sun: 'sun',
  };

  const dayKey = weekday ? dayMap[weekday] : undefined;
  if (!dayKey) return false;

  const schedule = openingHours.find((entry) => entry.day === dayKey);
  if (!schedule || schedule.isClosed) return false;

  return currentTime >= schedule.open && currentTime <= schedule.close;
}

export function calculateOrderTotals(input: {
  subtotalCents: number;
  taxRateBps: number;
  serviceFeeBps: number;
  deliveryFeeCents: number;
  fulfillmentType: 'pickup' | 'delivery' | 'dine_in';
}) {
  const taxCents = Math.round((input.subtotalCents * input.taxRateBps) / 10000);
  const serviceFeeCents = Math.round((input.subtotalCents * input.serviceFeeBps) / 10000);
  const deliveryFeeCents =
    input.fulfillmentType === 'delivery' ? input.deliveryFeeCents : 0;
  const totalCents =
    input.subtotalCents + taxCents + serviceFeeCents + deliveryFeeCents;

  return { taxCents, serviceFeeCents, deliveryFeeCents, totalCents };
}
