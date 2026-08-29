import { menuItems, orderItems, orders } from '@tableside/db';
import type { Database } from '@tableside/db';
import { ORDER_STATUSES } from '@tableside/types';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';

function getRangeStart(range: 'today' | '7d' | '30d') {
  const now = new Date();
  const start = new Date(now);
  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return start;
}

export async function getMetricsSummary(db: Database, range: 'today' | '7d' | '30d') {
  const start = getRangeStart(range);

  const [{ totalOrders }] = await db
    .select({ totalOrders: count() })
    .from(orders)
    .where(gte(orders.createdAt, start));

  const [{ totalRevenueCents }] = await db
    .select({
      totalRevenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), eq(orders.status, 'completed')));

  const [{ pendingOrders }] = await db
    .select({ pendingOrders: count() })
    .from(orders)
    .where(eq(orders.status, 'pending'));

  const revenue = Number(totalRevenueCents);
  const orderCount = Number(totalOrders);
  const averageOrderValueCents =
    orderCount > 0 ? Math.round(revenue / Math.max(orderCount, 1)) : 0;

  const popularItems = await db
    .select({
      menuItemId: orderItems.menuItemId,
      name: orderItems.nameSnapshot,
      quantitySold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      revenueCents: sql<number>`coalesce(sum(${orderItems.lineTotalCents}), 0)::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.createdAt, start), eq(orders.status, 'completed')))
    .groupBy(orderItems.menuItemId, orderItems.nameSnapshot)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);

  const ordersByStatus = await Promise.all(
    ORDER_STATUSES.map(async (status) => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(orders)
        .where(and(gte(orders.createdAt, start), eq(orders.status, status)));
      return { status, count: Number(value) };
    }),
  );

  const revenueByDay = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      orderCount: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), eq(orders.status, 'completed')))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return {
    totalOrders: orderCount,
    totalRevenueCents: revenue,
    pendingOrders: Number(pendingOrders),
    averageOrderValueCents,
    popularItems,
    ordersByStatus,
    revenueByDay,
  };
}

export async function getMenuItemSales(db: Database) {
  return db
    .select({
      item: menuItems,
      quantitySold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
    })
    .from(menuItems)
    .leftJoin(orderItems, eq(orderItems.menuItemId, menuItems.id))
    .groupBy(menuItems.id);
}
