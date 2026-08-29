import {
  customers,
  orderItems,
  orders,
  orderStatusEvents,
} from '@tableside/db';
import type { Database } from '@tableside/db';
import { generateOrderNumber } from '@tableside/shared';
import {
  actionRequiresReason,
  calculateOrderTotals,
  getAllowedActions,
  getNextStatus,
  getStatusTimestampField,
  isStoreOpen,
  type OrderAction,
} from '@tableside/types';
import { and, count, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import {
  invalidTransitionError,
  minOrderError,
  notFound,
  storeClosedError,
  totalMismatchError,
  unavailableItemError,
  validationError,
} from '../lib/errors.js';
import { ensureCustomerExists } from './customers.service.js';
import { getMenuItemsForOrder } from './menu.service.js';
import { getSettings } from './settings.service.js';

function mapOrder(row: typeof orders.$inferSelect, customerName?: string) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    preparingAt: row.preparingAt?.toISOString() ?? null,
    readyAt: row.readyAt?.toISOString() ?? null,
    dispatchedAt: row.dispatchedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    allowedActions: getAllowedActions(row.status, row.fulfillmentType),
    customerName,
  };
}

export async function listOrders(
  db: Database,
  params: {
    page: number;
    pageSize: number;
    status?: (typeof orders.$inferSelect)['status'];
    fulfillmentType?: (typeof orders.$inferSelect)['fulfillmentType'];
    customerId?: string;
    search?: string;
    from?: string;
    to?: string;
  },
) {
  const conditions = [];
  if (params.status) conditions.push(eq(orders.status, params.status));
  if (params.fulfillmentType) {
    conditions.push(eq(orders.fulfillmentType, params.fulfillmentType));
  }
  if (params.customerId) conditions.push(eq(orders.customerId, params.customerId));
  if (params.from) conditions.push(gte(orders.createdAt, new Date(params.from)));
  if (params.to) conditions.push(lte(orders.createdAt, new Date(params.to)));
  if (params.search) {
    conditions.push(
      ilike(orders.orderNumber, `%${params.search}%`),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (params.page - 1) * params.pageSize;

  const [{ total }] = await db.select({ total: count() }).from(orders).where(where);

  const rows = await db
    .select({
      order: orders,
      customerName: customers.name,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(params.pageSize)
    .offset(offset);

  return {
    data: rows.map(({ order, customerName }) => mapOrder(order, customerName)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / params.pageSize),
    },
  };
}

export async function getOrderDetail(db: Database, id: string) {
  const [row] = await db
    .select({
      order: orders,
      customer: customers,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) throw notFound('Order');

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(orderItems.createdAt);

  const timeline = await db
    .select()
    .from(orderStatusEvents)
    .where(eq(orderStatusEvents.orderId, id))
    .orderBy(orderStatusEvents.createdAt);

  return {
    ...mapOrder(row.order, row.customer.name),
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    customer: {
      ...row.customer,
      createdAt: row.customer.createdAt.toISOString(),
      updatedAt: row.customer.updatedAt.toISOString(),
    },
    timeline: timeline.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

export async function createOrder(
  db: Database,
  input: {
    customerId: string;
    fulfillmentType: (typeof orders.$inferSelect)['fulfillmentType'];
    items: Array<{ menuItemId: string; quantity: number }>;
    notes?: string | null;
    expectedTotalCents?: number;
  },
) {
  await ensureCustomerExists(db, input.customerId);
  const settings = await getSettings(db);

  if (!isStoreOpen(settings.openingHours, settings.timezone, settings.acceptingOrders)) {
    throw storeClosedError();
  }

  const menuItemIds = input.items.map((item) => item.menuItemId);
  const menuRows = await getMenuItemsForOrder(db, menuItemIds);

  if (menuRows.length !== menuItemIds.length) {
    const foundIds = new Set(menuRows.map((row) => row.item.id));
    const missing = menuItemIds.filter((id) => !foundIds.has(id));
    throw unavailableItemError(missing);
  }

  const menuMap = new Map(menuRows.map((row) => [row.item.id, row]));

  const lineItems = input.items.map((requested) => {
    const row = menuMap.get(requested.menuItemId)!;
    const lineTotalCents = row.item.priceCents * requested.quantity;
    return {
      menuItemId: row.item.id,
      nameSnapshot: row.item.name,
      unitPriceCents: row.item.priceCents,
      quantity: requested.quantity,
      lineTotalCents,
    };
  });

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

  if (subtotalCents < settings.minOrderCents) {
    throw minOrderError(settings.minOrderCents);
  }

  const totals = calculateOrderTotals({
    subtotalCents,
    taxRateBps: settings.taxRateBps,
    serviceFeeBps: settings.serviceFeeBps,
    deliveryFeeCents: settings.deliveryFeeCents,
    fulfillmentType: input.fulfillmentType,
  });

  if (
    input.expectedTotalCents !== undefined &&
    input.expectedTotalCents !== totals.totalCents
  ) {
    throw totalMismatchError(input.expectedTotalCents, totals.totalCents);
  }

  const initialStatus = settings.autoAcceptOrders ? 'confirmed' : 'pending';

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        customerId: input.customerId,
        status: initialStatus,
        fulfillmentType: input.fulfillmentType,
        subtotalCents,
        taxCents: totals.taxCents,
        serviceFeeCents: totals.serviceFeeCents,
        deliveryFeeCents: totals.deliveryFeeCents,
        totalCents: totals.totalCents,
        notes: input.notes ?? null,
        confirmedAt: settings.autoAcceptOrders ? new Date() : null,
      })
      .returning();

    await tx.insert(orderItems).values(
      lineItems.map((item) => ({
        ...item,
        orderId: order!.id,
      })),
    );

    if (settings.autoAcceptOrders) {
      await tx.insert(orderStatusEvents).values({
        orderId: order!.id,
        fromStatus: null,
        toStatus: 'confirmed',
        action: 'confirm',
        reason: 'Auto-accepted by settings',
      });
    } else {
      await tx.insert(orderStatusEvents).values({
        orderId: order!.id,
        fromStatus: null,
        toStatus: 'pending',
        action: 'confirm',
        reason: 'Order submitted',
      });
    }

    return getOrderDetail(tx as unknown as Database, order!.id);
  });
}

export async function transitionOrder(
  db: Database,
  id: string,
  action: OrderAction,
  reason?: string | null,
) {
  const detail = await getOrderDetail(db, id);
  const currentStatus = detail.status;

  if (actionRequiresReason(action) && !reason?.trim()) {
    throw validationError(`Reason is required for action "${action}"`);
  }

  const nextStatus = getNextStatus(currentStatus, action, detail.fulfillmentType);
  if (!nextStatus) {
    throw invalidTransitionError(detail.allowedActions, action);
  }

  const timestampField = getStatusTimestampField(nextStatus);
  const timestampUpdate = timestampField
    ? { [timestampField]: new Date() }
    : {};

  const reasonUpdate =
    action === 'cancel'
      ? { cancelReason: reason ?? null }
      : action === 'reject'
        ? { rejectReason: reason ?? null }
        : {};

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orders)
      .set({
        status: nextStatus,
        updatedAt: new Date(),
        ...timestampUpdate,
        ...reasonUpdate,
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) throw notFound('Order');

    await tx.insert(orderStatusEvents).values({
      orderId: id,
      fromStatus: currentStatus,
      toStatus: nextStatus,
      action,
      reason: reason ?? null,
    });

    return getOrderDetail(tx as unknown as Database, id);
  });
}

export async function getPendingOrderCount(db: Database) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, 'pending'));
  return Number(value);
}

export async function getRecentOrders(db: Database, limit = 5) {
  const rows = await db
    .select({
      order: orders,
      customerName: customers.name,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return rows.map(({ order, customerName }) => mapOrder(order, customerName));
}
