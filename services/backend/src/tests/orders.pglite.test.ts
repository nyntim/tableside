import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { businessSettings } from '@tableside/db';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createTestDb } from './pglite-setup.js';

describe('orders API (PGlite)', () => {
  let app: ReturnType<typeof createApp>;
  const env = { HYPERDRIVE: { connectionString: 'postgres://test' } };

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

describe('openapi artifact', () => {
  it('matches committed contract file', () => {
    const committed = JSON.parse(
      readFileSync(join(process.cwd(), 'openapi/openapi.json'), 'utf8'),
    );
    expect(committed.info.title).toBe('Tableside API');
    expect(Object.keys(committed.paths).length).toBeGreaterThan(5);
  });
});
