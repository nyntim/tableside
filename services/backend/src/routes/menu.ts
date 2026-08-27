import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppContext } from '../types.js';
import {
  createCategoryRoute,
  createMenuItemRoute,
  deleteCategoryRoute,
  deleteMenuItemRoute,
  listCategoriesRoute,
  listMenuItemsRoute,
  updateCategoryRoute,
  updateMenuItemRoute,
} from './schemas.js';
import * as menuService from '../services/menu.service.js';

function serializeCategory(category: Awaited<ReturnType<typeof menuService.listCategories>>[0]) {
  return {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function serializeItem(
  item: Awaited<ReturnType<typeof menuService.listMenuItems>>[0] | Awaited<ReturnType<typeof menuService.deleteMenuItem>>,
) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function registerMenuRoutes(app: OpenAPIHono<AppContext>) {
  app.openapi(listCategoriesRoute, async (c) => {
    const categories = await menuService.listCategories(c.get('db'));
    return c.json(categories.map(serializeCategory), 200);
  });

  app.openapi(createCategoryRoute, async (c) => {
    const body = c.req.valid('json');
    const category = await menuService.createCategory(c.get('db'), body);
    return c.json(serializeCategory({ ...category, itemCount: 0 }), 201);
  });

  app.openapi(updateCategoryRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const category = await menuService.updateCategory(c.get('db'), id, body);
    const categories = await menuService.listCategories(c.get('db'));
    const withCount = categories.find((item) => item.id === category.id)!;
    return c.json(serializeCategory(withCount), 200);
  });

  app.openapi(deleteCategoryRoute, async (c) => {
    const { id } = c.req.valid('param');
    const deleted = await menuService.deleteCategory(c.get('db'), id);
    return c.json(serializeCategory({ ...deleted, itemCount: 0 }), 200);
  });

  app.openapi(listMenuItemsRoute, async (c) => {
    const { categoryId } = c.req.valid('query');
    const items = await menuService.listMenuItems(c.get('db'), categoryId);
    return c.json(items.map(serializeItem), 200);
  });

  app.openapi(createMenuItemRoute, async (c) => {
    const body = c.req.valid('json');
    const item = await menuService.createMenuItem(c.get('db'), body);
    return c.json(serializeItem(item), 201);
  });

  app.openapi(updateMenuItemRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const item = await menuService.updateMenuItem(c.get('db'), id, body);
    return c.json(serializeItem(item), 200);
  });

  app.openapi(deleteMenuItemRoute, async (c) => {
    const { id } = c.req.valid('param');
    const deleted = await menuService.deleteMenuItem(c.get('db'), id);
    return c.json(serializeItem(deleted), 200);
  });
}
