import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  businessSettings,
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  orderStatusEvents,
} from './schema/index.js';

export const selectMenuCategorySchema = createSelectSchema(menuCategories);
export const insertMenuCategorySchema = createInsertSchema(menuCategories, {
  name: z.string().min(1).max(120),
});

export const selectMenuItemSchema = createSelectSchema(menuItems);
export const insertMenuItemSchema = createInsertSchema(menuItems, {
  name: z.string().min(1).max(160),
  priceCents: z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
  dietaryTags: z.array(z.string().min(1).max(40)).max(12).optional(),
});

export const selectCustomerSchema = createSelectSchema(customers);
export const insertCustomerSchema = createInsertSchema(customers, {
  name: z.string().min(1).max(160),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
});

export const selectOrderSchema = createSelectSchema(orders);
export const selectOrderItemSchema = createSelectSchema(orderItems);
export const selectOrderStatusEventSchema = createSelectSchema(orderStatusEvents);
export const selectBusinessSettingsSchema = createSelectSchema(businessSettings);

export const openingHoursDaySchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean(),
});

export const updateBusinessSettingsSchema = createInsertSchema(businessSettings, {
  restaurantName: z.string().min(1).max(160),
  prepTimeMinutes: z.number().int().min(5).max(180),
  taxRateBps: z.number().int().min(0).max(2000),
  serviceFeeBps: z.number().int().min(0).max(2000),
  minOrderCents: z.number().int().min(0),
  deliveryFeeCents: z.number().int().min(0),
  openingHours: z.array(openingHoursDaySchema).length(7),
}).pick({
  restaurantName: true,
  timezone: true,
  prepTimeMinutes: true,
  autoAcceptOrders: true,
  acceptingOrders: true,
  taxRateBps: true,
  serviceFeeBps: true,
  minOrderCents: true,
  deliveryFeeCents: true,
  openingHours: true,
});
