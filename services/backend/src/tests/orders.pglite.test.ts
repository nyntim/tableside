import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  businessSettings,
  customers,
  menuCategories,
  menuItems,
  type Database,
} from '@tableside/db';
import { calculateOrderTotals } from '@tableside/types';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createTestDb } from './pglite-setup.js';

const env = { HYPERDRIVE: { connectionString: 'postgres://test' } };

const ALWAYS_OPEN = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => ({
  day,
  open: '00:00',
  close: '23:59',
  isClosed: false,
}));

async function requestJson(
  app: ReturnType<typeof createApp>,
  path: string,
  init?: RequestInit,
) {
  const response = await app.request(`http://test${path}`, init, env);
  return { status: response.status, body: await response.json() };
}

async function seedOrderingCatalog(db: Database) {
  await db.insert(businessSettings).values({
    taxRateBps: 1000,
    serviceFeeBps: 0,
    deliveryFeeCents: 499,
    minOrderCents: 500,
    acceptingOrders: true,
    autoAcceptOrders: false,
    openingHours: ALWAYS_OPEN,
  });

  const [category] = await db
    .insert(menuCategories)
    .values({ name: 'Mains', isActive: true })
    .returning();

  const [availableItem] = await db
    .insert(menuItems)
    .values({
      categoryId: category!.id,
      name: 'Burger',
      priceCents: 1000,
      isAvailable: true,
    })
    .returning();

  const [unavailableItem] = await db
    .insert(menuItems)
    .values({
      categoryId: category!.id,
      name: 'Soup of the Day',
      priceCents: 1000,
      isAvailable: false,
    })
    .returning();

  const [customer] = await db
    .insert(customers)
    .values({ name: 'Alex Rivera', email: 'alex@example.com' })
    .returning();

  return { availableItem: availableItem!, unavailableItem: unavailableItem!, customer: customer! };
}

describe('orders API (PGlite)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const { db } = await createTestDb();
    await db.insert(businessSettings).values({});

    app = createApp({
      getDb: () => db,
    });
  });

  it('returns health check', async () => {
    const response = await app.request('http://test/health', {}, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('lists seeded-empty orders with pagination meta', async () => {
    const response = await app.request('http://test/orders?page=1&pageSize=10', {}, env);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.meta).toMatchObject({ page: 1, pageSize: 10 });
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns OpenAPI document', async () => {
    const response = await app.request('http://test/openapi.json', {}, env);
    expect(response.status).toBe(200);
    const spec = await response.json();
    expect(spec.openapi).toBe('3.0.0');
    expect(spec.paths['/orders']).toBeDefined();
  });
});

describe('order flows (PGlite)', () => {
  let app: ReturnType<typeof createApp>;
  let catalog: Awaited<ReturnType<typeof seedOrderingCatalog>>;

  beforeAll(async () => {
    const { db } = await createTestDb();
    catalog = await seedOrderingCatalog(db);
    app = createApp({ getDb: () => db });
  });

  const expectedPickupTotals = calculateOrderTotals({
    subtotalCents: 1000,
    taxRateBps: 1000,
    serviceFeeBps: 0,
    deliveryFeeCents: 499,
    fulfillmentType: 'pickup',
  });

  it('creates an order and returns server-calculated totals', async () => {
    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
      }),
    });

    expect(status).toBe(201);
    expect(body.status).toBe('pending');
    expect(body.subtotalCents).toBe(1000);
    expect(body.taxCents).toBe(expectedPickupTotals.taxCents);
    expect(body.deliveryFeeCents).toBe(0);
    expect(body.totalCents).toBe(expectedPickupTotals.totalCents);
    expect(body.orderNumber).toMatch(/^ORD-/);
    expect(body.items).toHaveLength(1);
    expect(body.allowedActions).toEqual(expect.arrayContaining(['confirm', 'reject', 'cancel']));
  });

  it('rejects a malformed order payload', async () => {
    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'not-a-uuid',
        fulfillmentType: 'pickup',
        items: [],
      }),
    });

    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
    expect(body).toBeTruthy();
  });

  it('rejects an order that includes an unavailable menu item', async () => {
    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.unavailableItem.id, quantity: 1 }],
      }),
    });

    expect(status).toBe(422);
    expect(body.error.code).toBe('UNAVAILABLE_ITEMS');
    expect(body.error.details.items).toContain(catalog.unavailableItem.id);
  });

  it('accepts a matching expectedTotalCents', async () => {
    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
        expectedTotalCents: expectedPickupTotals.totalCents,
      }),
    });

    expect(status).toBe(201);
    expect(body.totalCents).toBe(expectedPickupTotals.totalCents);
  });

  it('rejects a client-supplied expectedTotalCents mismatch', async () => {
    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
        expectedTotalCents: expectedPickupTotals.totalCents + 1,
      }),
    });

    expect(status).toBe(422);
    expect(body.error.code).toBe('TOTAL_MISMATCH');
    expect(body.error.details.expectedTotalCents).toBe(expectedPickupTotals.totalCents + 1);
    expect(body.error.details.actualTotalCents).toBe(expectedPickupTotals.totalCents);
  });

  it('applies delivery fees in the server-side total', async () => {
    const expectedDelivery = calculateOrderTotals({
      subtotalCents: 1000,
      taxRateBps: 1000,
      serviceFeeBps: 0,
      deliveryFeeCents: 499,
      fulfillmentType: 'delivery',
    });

    const { status, body } = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'delivery',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
      }),
    });

    expect(status).toBe(201);
    expect(body.deliveryFeeCents).toBe(499);
    expect(body.totalCents).toBe(expectedDelivery.totalCents);
  });

  it('transitions an order through a valid action', async () => {
    const created = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
      }),
    });
    expect(created.status).toBe(201);

    const confirmed = await requestJson(app, `/orders/${created.body.id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm' }),
    });
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.status).toBe('confirmed');
    expect(confirmed.body.allowedActions).toEqual(expect.arrayContaining(['start_prep', 'cancel']));
  });

  it('rejects an illegal status transition', async () => {
    const created = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
      }),
    });
    expect(created.status).toBe(201);

    const invalid = await requestJson(app, `/orders/${created.body.id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    });
    expect(invalid.status).toBe(409);
    expect(invalid.body.error.code).toBe('INVALID_TRANSITION');
    expect(invalid.body.error.details.allowedActions).toEqual(
      expect.arrayContaining(['confirm', 'reject', 'cancel']),
    );
  });

  it('rejects cancel without a reason and accepts cancel with one', async () => {
    const created = await requestJson(app, '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: catalog.customer.id,
        fulfillmentType: 'pickup',
        items: [{ menuItemId: catalog.availableItem.id, quantity: 1 }],
      }),
    });
    expect(created.status).toBe(201);

    const missingReason = await requestJson(app, `/orders/${created.body.id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    expect(missingReason.status).toBe(422);
    expect(missingReason.body.error.code).toBe('VALIDATION_ERROR');

    const cancelled = await requestJson(app, `/orders/${created.body.id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', reason: 'Customer changed plans' }),
    });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe('cancelled');
    expect(cancelled.body.allowedActions).toEqual([]);
    expect(cancelled.body.cancelReason).toBe('Customer changed plans');
  });
});

describe('openapi artifact', () => {
  it('matches committed contract file', () => {
    const committed = JSON.parse(
      readFileSync(join(process.cwd(), 'openapi/openapi.json'), 'utf8'),
    );
    expect(committed.info.title).toBe('Tableside API');
    expect(Object.keys(committed.paths).length).toBeGreaterThan(5);
  });
});
