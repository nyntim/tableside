import { unwrapResponse } from '@/lib/api';

describe('dashboard API helpers', () => {
  it('unwraps successful metrics responses', () => {
    const metrics = unwrapResponse<{ totalOrders: number; totalRevenueCents: number }>({
      status: 200,
      data: {
        totalOrders: 12,
        totalRevenueCents: 45000,
      },
    });

    expect(metrics?.totalOrders).toBe(12);
    expect(metrics?.totalRevenueCents).toBe(45000);
  });

  it('returns undefined for error responses', () => {
    expect(
      unwrapResponse({
        status: 500,
        data: { error: { code: 'INTERNAL_ERROR', message: 'fail' } },
      }),
    ).toBeUndefined();
  });
});
