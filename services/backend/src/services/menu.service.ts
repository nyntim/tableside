import {
  menuCategories,
  menuItems,
  orderItems,
  orders,
} from '@tableside/db';
import type { Database } from '@tableside/db';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { OPEN_ORDER_STATUSES } from '@tableside/types';
import { conflictError, notFound } from '../lib/errors.js';

export async function listCategories(db: Database) {
  const categories = await db
    .select()
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name));

  const counts = await db
    .select({
      categoryId: menuItems.categoryId,
      itemCount: count(),
    })
    .from(menuItems)
    .groupBy(menuItems.categoryId);

  const countMap = new Map(counts.map((row) => [row.categoryId, Number(row.itemCount)]));

  return categories.map((category) => ({
    ...category,
    itemCount: countMap.get(category.id) ?? 0,
  }));
}

export async function createCategory(
  db: Database,
  input: typeof menuCategories.$inferInsert,
) {
  const [category] = await db.insert(menuCategories).values(input).returning();
  return category!;
}

export async function updateCategory(
  db: Database,
  id: string,
  input: Partial<typeof menuCategories.$inferInsert>,
) {
  const [category] = await db
    .update(menuCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(menuCategories.id, id))
    .returning();
  if (!category) throw notFound('Category');
  return category;
}

export async function deleteCategory(db: Database, id: string) {
  const items = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.categoryId, id))
    .limit(1);
  if (items.length > 0) {
    throw conflictError('Cannot delete category with menu items');
  }
  const [deleted] = await db
    .delete(menuCategories)
    .where(eq(menuCategories.id, id))
    .returning();
  if (!deleted) throw notFound('Category');
  return deleted;
}

export async function listMenuItems(db: Database, categoryId?: string) {
  const query = db
    .select({
      item: menuItems,
      categoryName: menuCategories.name,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder), asc(menuItems.name));

  const rows = categoryId
    ? await query.where(eq(menuItems.categoryId, categoryId))
    : await query;

  return rows.map(({ item, categoryName }) => ({ ...item, categoryName }));
}

export async function getMenuItemById(db: Database, id: string) {
  const [row] = await db
    .select({
      item: menuItems,
      categoryName: menuCategories.name,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(eq(menuItems.id, id))
    .limit(1);

  if (!row) throw notFound('Menu item');
  return { ...row.item, categoryName: row.categoryName };
}

export async function createMenuItem(
  db: Database,
  input: typeof menuItems.$inferInsert,
) {
  const [category] = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.id, input.categoryId))
    .limit(1);
  if (!category) throw notFound('Category');

  const [item] = await db.insert(menuItems).values(input).returning();
  return getMenuItemById(db, item!.id);
}

export async function updateMenuItem(
  db: Database,
  id: string,
  input: Partial<typeof menuItems.$inferInsert>,
) {
  const [item] = await db
    .update(menuItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning();
  if (!item) throw notFound('Menu item');
  return getMenuItemById(db, id);
}

export async function deleteMenuItem(db: Database, id: string) {
  const openOrders = await db
    .select({ orderId: orders.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.menuItemId, id),
        inArray(orders.status, [...OPEN_ORDER_STATUSES]),
      ),
    )
    .limit(1);

  if (openOrders.length > 0) {
    throw conflictError('Cannot delete menu item referenced by open orders');
  }

  const [deleted] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
  if (!deleted) throw notFound('Menu item');
  return deleted;
}

export async function getMenuItemsForOrder(db: Database, ids: string[]) {
  return db
    .select({
      item: menuItems,
      category: menuCategories,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(
      and(
        inArray(menuItems.id, ids),
        eq(menuItems.isAvailable, true),
        eq(menuCategories.isActive, true),
      ),
    );
}
