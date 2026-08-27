import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { fulfillmentTypeEnum, orderActionEnum, orderStatusEnum } from './enums.js';

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => menuCategories.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 160 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 32 }).notNull().unique(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  fulfillmentType: fulfillmentTypeEnum('fulfillment_type').notNull().default('pickup'),
  subtotalCents: integer('subtotal_cents').notNull(),
  taxCents: integer('tax_cents').notNull(),
  serviceFeeCents: integer('service_fee_cents').notNull().default(0),
  deliveryFeeCents: integer('delivery_fee_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  notes: text('notes'),
  cancelReason: text('cancel_reason'),
  rejectReason: text('reject_reason'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  preparingAt: timestamp('preparing_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id, { onDelete: 'restrict' }),
  nameSnapshot: varchar('name_snapshot', { length: 160 }).notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  lineTotalCents: integer('line_total_cents').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatusEvents = pgTable('order_status_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: orderStatusEnum('from_status'),
  toStatus: orderStatusEnum('to_status').notNull(),
  action: orderActionEnum('action').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OpeningHoursDay = {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  open: string;
  close: string;
  isClosed: boolean;
};

export const businessSettings = pgTable('business_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantName: varchar('restaurant_name', { length: 160 }).notNull().default('Odyssey Kitchen'),
  timezone: varchar('timezone', { length: 64 }).notNull().default('America/New_York'),
  prepTimeMinutes: integer('prep_time_minutes').notNull().default(20),
  autoAcceptOrders: boolean('auto_accept_orders').notNull().default(false),
  acceptingOrders: boolean('accepting_orders').notNull().default(true),
  taxRateBps: integer('tax_rate_bps').notNull().default(825),
  serviceFeeBps: integer('service_fee_bps').notNull().default(0),
  minOrderCents: integer('min_order_cents').notNull().default(1000),
  deliveryFeeCents: integer('delivery_fee_cents').notNull().default(499),
  openingHours: jsonb('opening_hours')
    .$type<OpeningHoursDay[]>()
    .notNull()
    .default(
      sql`'[
        {"day":"mon","open":"11:00","close":"22:00","isClosed":false},
        {"day":"tue","open":"11:00","close":"22:00","isClosed":false},
        {"day":"wed","open":"11:00","close":"22:00","isClosed":false},
        {"day":"thu","open":"11:00","close":"22:00","isClosed":false},
        {"day":"fri","open":"11:00","close":"23:00","isClosed":false},
        {"day":"sat","open":"10:00","close":"23:00","isClosed":false},
        {"day":"sun","open":"10:00","close":"21:00","isClosed":false}
      ]'::jsonb`,
    ),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export * from './enums.js';
