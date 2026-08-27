import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppContext } from '../types.js';
import {
  createCustomerRoute,
  getCustomerRoute,
  listCustomersRoute,
  updateCustomerRoute,
} from './schemas.js';
import * as customersService from '../services/customers.service.js';

function serializeCustomer(customer: Awaited<ReturnType<typeof customersService.getCustomerById>>) {
  return {
    ...customer,
    createdAt: new Date(customer.createdAt).toISOString(),
    updatedAt: new Date(customer.updatedAt).toISOString(),
  };
}

export function registerCustomerRoutes(app: OpenAPIHono<AppContext>) {
  app.openapi(listCustomersRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await customersService.listCustomers(c.get('db'), query);
    return c.json(
      {
        data: result.data.map(serializeCustomer),
        meta: result.meta,
      },
      200,
    );
  });

  app.openapi(getCustomerRoute, async (c) => {
    const { id } = c.req.valid('param');
    const customer = await customersService.getCustomerById(c.get('db'), id);
    return c.json(serializeCustomer(customer), 200);
  });

  app.openapi(createCustomerRoute, async (c) => {
    const body = c.req.valid('json');
    const customer = await customersService.createCustomer(c.get('db'), body);
    return c.json(serializeCustomer(customer), 201);
  });

  app.openapi(updateCustomerRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const customer = await customersService.updateCustomer(c.get('db'), id, body);
    return c.json(serializeCustomer(customer), 200);
  });
}
