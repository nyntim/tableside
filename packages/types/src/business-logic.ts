import type { OpeningHoursDay } from '@tableside/db/schema';

export { calculateOrderTotals } from '@tableside/db/totals';

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

