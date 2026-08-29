import { z } from 'zod';
import {
  openingHoursDaySchema,
  selectBusinessSettingsSchema,
  selectCustomerSchema,
  selectMenuCategorySchema,
  selectMenuItemSchema,
  selectOrderItemSchema,
  selectOrderSchema,
  selectOrderStatusEventSchema,
  updateBusinessSettingsSchema,
} from '@tableside/db';
import { FULFILLMENT_TYPES, ORDER_ACTIONS, ORDER_STATUSES } from './order-state-machine';

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const menuCategorySchema = selectMenuCategorySchema.extend({
  itemCount: z.number().int().min(0).optional(),
});

export const menuItemSchema = selectMenuItemSchema.extend({
  categoryName: z.string().optional(),
  imageUrl: z.string().url().nullable(),
  dietaryTags: z.array(z.string()),
});

export const customerSchema = selectCustomerSchema.extend({
  orderCount: z.number().int().min(0).optional(),
  totalSpendCents: z.number().int().min(0).optional(),
  lastOrderAt: z.string().datetime().nullable().optional(),
});

export const orderItemResponseSchema = selectOrderItemSchema;
export const orderStatusEventSchema = selectOrderStatusEventSchema;

export const orderSchema = selectOrderSchema.extend({
  allowedActions: z.array(z.enum(ORDER_ACTIONS)),
  customerName: z.string().optional(),
});

export const orderDetailSchema = orderSchema.extend({
  items: z.array(orderItemResponseSchema),
  customer: selectCustomerSchema,
  timeline: z.array(orderStatusEventSchema),
});

export const businessSettingsSchema = selectBusinessSettingsSchema.extend({
  openingHours: z.array(openingHoursDaySchema),
});

export const createMenuCategoryBodySchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateMenuCategoryBodySchema = createMenuCategoryBodySchema.partial();

export const createMenuItemBodySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(160),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  dietaryTags: z.array(z.string().min(1).max(40)).max(12).optional(),
  priceCents: z.number().int().min(0),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateMenuItemBodySchema = createMenuItemBodySchema.partial();

export const createCustomerBodySchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateCustomerBodySchema = createCustomerBodySchema.partial();

export const createOrderItemBodySchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

export const createOrderBodySchema = z.object({
  customerId: z.string().uuid(),
  fulfillmentType: z.enum(FULFILLMENT_TYPES),
  items: z.array(createOrderItemBodySchema).min(1),
  notes: z.string().max(1000).optional().nullable(),
  expectedTotalCents: z.number().int().min(0).optional(),
});

export const transitionOrderBodySchema = z.object({
  action: z.enum(ORDER_ACTIONS),
  reason: z.string().max(500).optional().nullable(),
});

export const ordersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  fulfillmentType: z.enum(FULFILLMENT_TYPES).optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const customersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
});

export const metricsQuerySchema = z.object({
  range: z.enum(['today', '7d', '30d']).default('7d'),
});

export const metricsSummarySchema = z.object({
  totalOrders: z.number().int().min(0),
  totalRevenueCents: z.number().int().min(0),
  pendingOrders: z.number().int().min(0),
  averageOrderValueCents: z.number().int().min(0),
  popularItems: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      name: z.string(),
      quantitySold: z.number().int().min(0),
      revenueCents: z.number().int().min(0),
    }),
  ),
  ordersByStatus: z.array(
    z.object({
      status: z.enum(ORDER_STATUSES),
      count: z.number().int().min(0),
    }),
  ),
  revenueByDay: z.array(
    z.object({
      date: z.string(),
      revenueCents: z.number().int().min(0),
      orderCount: z.number().int().min(0),
    }),
  ),
});

export const paginatedOrdersSchema = z.object({
  data: z.array(orderSchema),
  meta: paginationMetaSchema,
});

export const paginatedCustomersSchema = z.object({
  data: z.array(customerSchema),
  meta: paginationMetaSchema,
});

export const updateSettingsBodySchema = updateBusinessSettingsSchema;

export { openingHoursDaySchema };

export type ApiError = z.infer<typeof errorResponseSchema>;
export type OrderResponse = z.infer<typeof orderSchema>;
export type OrderDetailResponse = z.infer<typeof orderDetailSchema>;
export type MetricsSummary = z.infer<typeof metricsSummarySchema>;
