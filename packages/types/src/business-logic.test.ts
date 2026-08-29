import { describe, expect, it } from 'vitest';
import { calculateOrderTotals } from './business-logic';

describe('calculateOrderTotals', () => {
  const base = {
    subtotalCents: 1000,
    taxRateBps: 1000,
    serviceFeeBps: 500,
    deliveryFeeCents: 499,
  };

  it('applies tax and service fee without delivery for pickup', () => {
    expect(calculateOrderTotals({ ...base, fulfillmentType: 'pickup' })).toEqual({
      taxCents: 100,
      serviceFeeCents: 50,
      deliveryFeeCents: 0,
      totalCents: 1150,
    });
  });

  it('includes delivery fee only for delivery orders', () => {
    expect(calculateOrderTotals({ ...base, fulfillmentType: 'delivery' })).toEqual({
      taxCents: 100,
      serviceFeeCents: 50,
      deliveryFeeCents: 499,
      totalCents: 1649,
    });
  });
});
