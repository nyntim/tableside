import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppContext } from '../types.js';
import { getMetricsRoute } from './schemas.js';
import * as metricsService from '../services/metrics.service.js';

export function registerMetricsRoutes(app: OpenAPIHono<AppContext>) {
  app.openapi(getMetricsRoute, async (c) => {
    const { range } = c.req.valid('query');
    const metrics = await metricsService.getMetricsSummary(c.get('db'), range);
    return c.json(metrics, 200);
  });
}
