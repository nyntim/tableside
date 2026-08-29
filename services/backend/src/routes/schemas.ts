import { createRoute, z } from '@hono/zod-openapi';
import {
  businessSettingsSchema,
  createCustomerBodySchema,
  createMenuCategoryBodySchema,
  createMenuItemBodySchema,
  createOrderBodySchema,
  customerSchema,
  customersQuerySchema,
  errorResponseSchema,
  menuCategorySchema,
  menuItemSchema,
  metricsQuerySchema,
  metricsSummarySchema,
  orderDetailSchema,
  ordersQuerySchema,
  paginatedCustomersSchema,
  paginatedOrdersSchema,
  transitionOrderBodySchema,
  updateCustomerBodySchema,
  updateMenuCategoryBodySchema,
  updateMenuItemBodySchema,
  updateSettingsBodySchema,
} from '@tableside/types';

const errorResponses = {
  400: {
    content: { 'application/json': { schema: errorResponseSchema } },
    description: 'Bad request',
  },
  404: {
    content: { 'application/json': { schema: errorResponseSchema } },
    description: 'Not found',
  },
  409: {
    content: { 'application/json': { schema: errorResponseSchema } },
    description: 'Conflict',
  },
  422: {
    content: { 'application/json': { schema: errorResponseSchema } },
    description: 'Validation error',
  },
  503: {
    content: { 'application/json': { schema: errorResponseSchema } },
    description: 'Service unavailable',
  },
};

export const listCategoriesRoute = createRoute({
  method: 'get',
  path: '/menu/categories',
  tags: ['Menu'],
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(menuCategorySchema) } },
      description: 'List menu categories',
    },
  },
});

export const createCategoryRoute = createRoute({
  method: 'post',
  path: '/menu/categories',
  tags: ['Menu'],
  request: {
    body: { content: { 'application/json': { schema: createMenuCategoryBodySchema } } },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: menuCategorySchema } },
      description: 'Category created',
    },
    ...errorResponses,
  },
});

export const updateCategoryRoute = createRoute({
  method: 'patch',
  path: '/menu/categories/{id}',
  tags: ['Menu'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: updateMenuCategoryBodySchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: menuCategorySchema } },
      description: 'Category updated',
    },
    ...errorResponses,
  },
});

export const deleteCategoryRoute = createRoute({
  method: 'delete',
  path: '/menu/categories/{id}',
  tags: ['Menu'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: menuCategorySchema } },
      description: 'Category deleted',
    },
    ...errorResponses,
  },
});

export const listMenuItemsRoute = createRoute({
  method: 'get',
  path: '/menu/items',
  tags: ['Menu'],
  request: {
    query: z.object({ categoryId: z.string().uuid().optional() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(menuItemSchema) } },
      description: 'List menu items',
    },
  },
});

export const createMenuItemRoute = createRoute({
  method: 'post',
  path: '/menu/items',
  tags: ['Menu'],
  request: {
    body: { content: { 'application/json': { schema: createMenuItemBodySchema } } },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: menuItemSchema } },
      description: 'Menu item created',
    },
    ...errorResponses,
  },
});

export const updateMenuItemRoute = createRoute({
  method: 'patch',
  path: '/menu/items/{id}',
  tags: ['Menu'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: updateMenuItemBodySchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: menuItemSchema } },
      description: 'Menu item updated',
    },
    ...errorResponses,
  },
});

export const deleteMenuItemRoute = createRoute({
  method: 'delete',
  path: '/menu/items/{id}',
  tags: ['Menu'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: menuItemSchema } },
      description: 'Menu item deleted',
    },
    ...errorResponses,
  },
});

export const listCustomersRoute = createRoute({
  method: 'get',
  path: '/customers',
  tags: ['Customers'],
  request: { query: customersQuerySchema },
  responses: {
    200: {
      content: { 'application/json': { schema: paginatedCustomersSchema } },
      description: 'List customers',
    },
  },
});

export const getCustomerRoute = createRoute({
  method: 'get',
  path: '/customers/{id}',
  tags: ['Customers'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: customerSchema } },
      description: 'Customer detail',
    },
    ...errorResponses,
  },
});

export const createCustomerRoute = createRoute({
  method: 'post',
  path: '/customers',
  tags: ['Customers'],
  request: {
    body: { content: { 'application/json': { schema: createCustomerBodySchema } } },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: customerSchema } },
      description: 'Customer created',
    },
    ...errorResponses,
  },
});

export const updateCustomerRoute = createRoute({
  method: 'patch',
  path: '/customers/{id}',
  tags: ['Customers'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: updateCustomerBodySchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: customerSchema } },
      description: 'Customer updated',
    },
    ...errorResponses,
  },
});

export const listOrdersRoute = createRoute({
  method: 'get',
  path: '/orders',
  tags: ['Orders'],
  request: { query: ordersQuerySchema },
  responses: {
    200: {
      content: { 'application/json': { schema: paginatedOrdersSchema } },
      description: 'List orders',
    },
  },
});

export const getOrderRoute = createRoute({
  method: 'get',
  path: '/orders/{id}',
  tags: ['Orders'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: orderDetailSchema } },
      description: 'Order detail',
    },
    ...errorResponses,
  },
});

export const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  tags: ['Orders'],
  request: {
    body: { content: { 'application/json': { schema: createOrderBodySchema } } },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: orderDetailSchema } },
      description: 'Order created',
    },
    ...errorResponses,
  },
});

export const transitionOrderRoute = createRoute({
  method: 'post',
  path: '/orders/{id}/transition',
  tags: ['Orders'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: transitionOrderBodySchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: orderDetailSchema } },
      description: 'Order transitioned',
    },
    ...errorResponses,
  },
});

export const getSettingsRoute = createRoute({
  method: 'get',
  path: '/settings',
  tags: ['Settings'],
  responses: {
    200: {
      content: { 'application/json': { schema: businessSettingsSchema } },
      description: 'Business settings',
    },
  },
});

export const updateSettingsRoute = createRoute({
  method: 'patch',
  path: '/settings',
  tags: ['Settings'],
  request: {
    body: { content: { 'application/json': { schema: updateSettingsBodySchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: businessSettingsSchema } },
      description: 'Settings updated',
    },
    ...errorResponses,
  },
});

export const getMetricsRoute = createRoute({
  method: 'get',
  path: '/metrics/summary',
  tags: ['Metrics'],
  request: { query: metricsQuerySchema },
  responses: {
    200: {
      content: { 'application/json': { schema: metricsSummarySchema } },
      description: 'Metrics summary',
    },
  },
});
