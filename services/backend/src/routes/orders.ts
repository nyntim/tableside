import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppContext } from '../types.js';
import {
  createOrderRoute,
  getOrderRoute,
  listOrdersRoute,
  transitionOrderRoute,
} from './schemas.js';
import * as ordersService from '../services/orders.service.js';

export function registerOrderRoutes(app: OpenAPIHono<AppContext>) {
  app.openapi(listOrdersRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await ordersService.listOrders(c.get('db'), query);
    return c.json(result, 200);
  });

  app.openapi(getOrderRoute, async (c) => {
    const { id } = c.req.valid('param');
    const order = await ordersService.getOrderDetail(c.get('db'), id);
    return c.json(order, 200);
  });

  app.openapi(createOrderRoute, async (c) => {
    const body = c.req.valid('json');
    const order = await ordersService.createOrder(c.get('db'), body);
    return c.json(order, 201);
  });

  app.openapi(transitionOrderRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const order = await ordersService.transitionOrder(
      c.get('db'),
      id,
      body.action,
      body.reason,
    );
    return c.json(order, 200);
  });
}
