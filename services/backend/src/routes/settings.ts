import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppContext } from '../types.js';
import { getSettingsRoute, updateSettingsRoute } from './schemas.js';
import * as settingsService from '../services/settings.service.js';

function serializeSettings(settings: Awaited<ReturnType<typeof settingsService.getSettings>>) {
  return {
    ...settings,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export function registerSettingsRoutes(app: OpenAPIHono<AppContext>) {
  app.openapi(getSettingsRoute, async (c) => {
    const settings = await settingsService.getSettings(c.get('db'));
    return c.json(serializeSettings(settings), 200);
  });

  app.openapi(updateSettingsRoute, async (c) => {
    const body = c.req.valid('json');
    const settings = await settingsService.updateSettings(c.get('db'), body);
    return c.json(serializeSettings(settings), 200);
  });
}
