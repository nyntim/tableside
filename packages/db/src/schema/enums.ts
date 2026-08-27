import { pgEnum } from 'drizzle-orm/pg-core';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
  'rejected',
]);

export const fulfillmentTypeEnum = pgEnum('fulfillment_type', [
  'pickup',
  'delivery',
  'dine_in',
]);

export const orderActionEnum = pgEnum('order_action', [
  'confirm',
  'reject',
  'start_prep',
  'mark_ready',
  'dispatch',
  'complete',
  'cancel',
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type FulfillmentType = (typeof fulfillmentTypeEnum.enumValues)[number];
export type OrderAction = (typeof orderActionEnum.enumValues)[number];
