import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { AppError } from './lib/errors.js';
import { getDbFromConnectionString } from './lib/db.js';
import { registerMenuRoutes } from './routes/menu.js';
import { registerCustomerRoutes } from './routes/customers.js';
import { registerOrderRoutes } from './routes/orders.js';
import { registerSettingsRoutes } from './routes/settings.js';
import { registerMetricsRoutes } from './routes/metrics.js';
import type { AppContext, GetDb } from './types.js';

export function createApp(options?: { getDb?: GetDb }) {
  const getDb = options?.getDb ?? getDbFromConnectionString;
  const app = new OpenAPIHono<AppContext>();

  app.use('*', cors());

  app.use('*', async (c, next) => {
    const db = getDb(c.env.HYPERDRIVE.connectionString);
    c.set('db', db);
    await next();
  });

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(err.toResponse(), err.status as 400);
    }
    console.error(err);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500,
    );
  });

  app.get('/health', (c) => c.json({ ok: true }));

  registerMenuRoutes(app);
  registerCustomerRoutes(app);
  registerOrderRoutes(app);
  registerSettingsRoutes(app);
  registerMetricsRoutes(app);

  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Odyssey Ops API',
      version: '1.0.0',
      description: 'Restaurant operations API for Odyssey assignment',
    },
    servers: [{ url: 'http://127.0.0.1:8799', description: 'Local development' }],
  });

  app.get(
    '/docs',
    apiReference({
      spec: { url: '/openapi.json' },
    }),
  );

  return app;
}

export type App = ReturnType<typeof createApp>;
