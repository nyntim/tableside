import { customers, orders } from '@tableside/db';
import type { Database } from '@tableside/db';
import { and, asc, count, desc, eq, ilike, max, or, sql, sum } from 'drizzle-orm';
import { notFound } from '../lib/errors.js';

export async function listCustomers(
  db: Database,
  params: { page: number; pageSize: number; search?: string },
) {
  const offset = (params.page - 1) * params.pageSize;
  const pattern = `%${params.search}%`;
  const where = params.search
    ? or(
        ilike(customers.name, pattern),
        ilike(customers.email, pattern),
        ilike(customers.phone, pattern),
      )
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(customers)
    .where(where);

  const rows = await db
    .select({
      customer: customers,
      orderCount: sql<number>`coalesce(count(${orders.id}), 0)::int`,
      totalSpendCents: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalCents} else 0 end), 0)::int`,
      lastOrderAt: max(orders.createdAt),
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(where)
    .groupBy(customers.id)
    .orderBy(desc(max(orders.createdAt)), asc(customers.name))
    .limit(params.pageSize)
    .offset(offset);

  return {
    data: rows.map(({ customer, orderCount, totalSpendCents, lastOrderAt }) => ({
      ...customer,
      orderCount,
      totalSpendCents,
      lastOrderAt: lastOrderAt?.toISOString() ?? null,
    })),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / params.pageSize),
    },
  };
}

export async function getCustomerById(db: Database, id: string) {
  const [row] = await db
    .select({
      customer: customers,
      orderCount: sql<number>`coalesce(count(${orders.id}), 0)::int`,
      totalSpendCents: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalCents} else 0 end), 0)::int`,
      lastOrderAt: max(orders.createdAt),
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.id, id))
    .groupBy(customers.id)
    .limit(1);

  if (!row) throw notFound('Customer');
  return {
    ...row.customer,
    orderCount: row.orderCount,
    totalSpendCents: row.totalSpendCents,
    lastOrderAt: row.lastOrderAt?.toISOString() ?? null,
  };
}

export async function createCustomer(
  db: Database,
  input: typeof customers.$inferInsert,
) {
  const [customer] = await db.insert(customers).values(input).returning();
  return getCustomerById(db, customer!.id);
}

export async function updateCustomer(
  db: Database,
  id: string,
  input: Partial<typeof customers.$inferInsert>,
) {
  const [customer] = await db
    .update(customers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning();
  if (!customer) throw notFound('Customer');
  return getCustomerById(db, id);
}

export async function getCustomerOrders(db: Database, customerId: string, limit = 10) {
  await getCustomerById(db, customerId);
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function ensureCustomerExists(db: Database, id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!customer) throw notFound('Customer');
  return customer;
}

export async function getCustomerStats(db: Database) {
  const [stats] = await db
    .select({
      totalCustomers: count(),
      totalSpendCents: sum(orders.totalCents),
    })
    .from(customers)
    .leftJoin(orders, and(eq(orders.customerId, customers.id), eq(orders.status, 'completed')));

  return stats;
}
