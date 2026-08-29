import type { FulfillmentType } from './schema/enums.js';

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
