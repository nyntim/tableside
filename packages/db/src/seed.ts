import {
  businessSettings,
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  orderStatusEvents,
  type OrderAction,
  type OrderStatus,
} from '@odyssey/db';
import { createDb } from './client.js';
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${datePart}-${randomPart}`;
}

function calculateOrderTotals(input: {
  subtotalCents: number;
  taxRateBps: number;
  serviceFeeBps: number;
  deliveryFeeCents: number;
  fulfillmentType: 'pickup' | 'delivery' | 'dine_in';
}) {
  const taxCents = Math.round((input.subtotalCents * input.taxRateBps) / 10000);
  const serviceFeeCents = Math.round((input.subtotalCents * input.serviceFeeBps) / 10000);
  const deliveryFeeCents =
    input.fulfillmentType === 'delivery' ? input.deliveryFeeCents : 0;
  const totalCents =
    input.subtotalCents + taxCents + serviceFeeCents + deliveryFeeCents;
  return { taxCents, serviceFeeCents, deliveryFeeCents, totalCents };
}

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://odyssey:odyssey@localhost:5432/odyssey_ops';

const categorySeed = [
  { name: 'Starters', description: 'Light bites to begin', sortOrder: 1 },
  { name: 'Mains', description: 'Hearty center plates', sortOrder: 2 },
  { name: 'Desserts', description: 'Sweet finishes', sortOrder: 3 },
  { name: 'Drinks', description: 'Hot and cold beverages', sortOrder: 4 },
];

const menuSeed = [
  { category: 'Starters', name: 'Crispy Calamari', priceCents: 1299, description: 'Lemon aioli' },
  { category: 'Starters', name: 'Heirloom Tomato Salad', priceCents: 1099, description: 'Basil vinaigrette' },
  { category: 'Starters', name: 'Soup of the Day', priceCents: 899, description: 'Chef\'s daily selection' },
  { category: 'Mains', name: 'Wood-Fired Margherita Pizza', priceCents: 1699, description: 'Fresh mozzarella' },
  { category: 'Mains', name: 'Grilled Salmon', priceCents: 2499, description: 'Citrus butter, asparagus' },
  { category: 'Mains', name: 'Braised Short Rib', priceCents: 2899, description: 'Mashed potato, jus' },
  { category: 'Mains', name: 'Roasted Chicken', priceCents: 2199, description: 'Herb pan sauce' },
  { category: 'Desserts', name: 'Chocolate Lava Cake', priceCents: 999, description: 'Vanilla gelato' },
  { category: 'Desserts', name: 'Seasonal Fruit Tart', priceCents: 899, description: 'Pastry cream' },
  { category: 'Drinks', name: 'Craft Iced Tea', priceCents: 399, description: 'House brewed' },
  { category: 'Drinks', name: 'Espresso', priceCents: 349, description: 'Double shot' },
  { category: 'Drinks', name: 'Sparkling Water', priceCents: 499, description: '750ml bottle' },
];

const customerSeed = [
  { name: 'Alex Rivera', email: 'alex.rivera@example.com', phone: '+1 555-0101' },
  { name: 'Jordan Lee', email: 'jordan.lee@example.com', phone: '+1 555-0102' },
  { name: 'Sam Patel', email: 'sam.patel@example.com', phone: '+1 555-0103' },
  { name: 'Taylor Brooks', email: 'taylor.brooks@example.com', phone: '+1 555-0104' },
  { name: 'Morgan Chen', email: 'morgan.chen@example.com', phone: '+1 555-0105' },
  { name: 'Casey Nguyen', email: 'casey.nguyen@example.com', phone: '+1 555-0106' },
  { name: 'Riley Adams', email: 'riley.adams@example.com', phone: '+1 555-0107' },
  { name: 'Jamie Ortiz', email: 'jamie.ortiz@example.com', phone: '+1 555-0108' },
];

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  out_for_delivery: 'completed',
  completed: null,
  cancelled: null,
  rejected: null,
};

const actionForTransition: Partial<Record<OrderStatus, OrderAction>> = {
  confirmed: 'confirm',
  preparing: 'start_prep',
  ready: 'mark_ready',
  completed: 'complete',
  out_for_delivery: 'dispatch',
};

function daysAgo(days: number, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const db = createDb(connectionString);

  const existingSettings = await db.select().from(businessSettings).limit(1);
  if (existingSettings.length > 0) {
    console.log('Database already seeded. Skipping.');
    process.exit(0);
  }

  await db.insert(businessSettings).values({
    restaurantName: 'Odyssey Kitchen',
    timezone: 'America/New_York',
    prepTimeMinutes: 25,
    autoAcceptOrders: false,
    acceptingOrders: true,
    taxRateBps: 825,
    serviceFeeBps: 250,
    minOrderCents: 1500,
    deliveryFeeCents: 499,
  });

  const insertedCategories = await db
    .insert(menuCategories)
    .values(categorySeed)
    .returning();

  const categoryMap = new Map(insertedCategories.map((c) => [c.name, c.id]));

  const insertedItems = await db
    .insert(menuItems)
    .values(
      menuSeed.map((item, index) => ({
        categoryId: categoryMap.get(item.category)!,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        sortOrder: index,
        isAvailable: item.name !== 'Soup of the Day',
      })),
    )
    .returning();

  const insertedCustomers = await db.insert(customers).values(customerSeed).returning();
  const settings = (await db.select().from(businessSettings).limit(1))[0]!;

  const fulfillmentTypes = ['pickup', 'delivery', 'dine_in'] as const;
  let orderIndex = 0;

  for (let day = 14; day >= 0; day -= 1) {
    const ordersForDay = 2 + (day % 4);
    for (let i = 0; i < ordersForDay; i += 1) {
      const customer = insertedCustomers[orderIndex % insertedCustomers.length]!;
      const itemCount = 1 + (orderIndex % 3);
      const selectedItems = Array.from({ length: itemCount }, (_, idx) =>
        insertedItems[(orderIndex + idx) % insertedItems.length]!,
      );

      const lineItems = selectedItems.map((item) => ({
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPriceCents: item.priceCents,
        quantity: 1 + (orderIndex % 2),
        lineTotalCents: item.priceCents * (1 + (orderIndex % 2)),
      }));

      const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
      const fulfillmentType = fulfillmentTypes[orderIndex % fulfillmentTypes.length]!;
      const totals = calculateOrderTotals({
        subtotalCents,
        taxRateBps: settings.taxRateBps,
        serviceFeeBps: settings.serviceFeeBps,
        deliveryFeeCents: settings.deliveryFeeCents,
        fulfillmentType,
      });

      let status: OrderStatus = 'completed';
      if (day === 0 && i === 0) status = 'pending';
      else if (day === 0 && i === 1) status = 'preparing';
      else if (day === 0 && i === 2) status = 'ready';
      else if (day === 1 && i === 0) status = 'confirmed';
      else if (orderIndex % 17 === 0) status = 'cancelled';
      else if (orderIndex % 23 === 0) status = 'rejected';

      const createdAt = daysAgo(day, 11 + (i % 8));

      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          status,
          fulfillmentType,
          subtotalCents,
          taxCents: totals.taxCents,
          serviceFeeCents: totals.serviceFeeCents,
          deliveryFeeCents: totals.deliveryFeeCents,
          totalCents: totals.totalCents,
          notes: orderIndex % 5 === 0 ? 'No onions please' : null,
          cancelReason: status === 'cancelled' ? 'Customer changed plans' : null,
          rejectReason: status === 'rejected' ? 'Kitchen at capacity' : null,
          confirmedAt: ['confirmed', 'preparing', 'ready', 'completed', 'out_for_delivery'].includes(status)
            ? createdAt
            : null,
          preparingAt: ['preparing', 'ready', 'completed', 'out_for_delivery'].includes(status)
            ? new Date(createdAt.getTime() + 5 * 60000)
            : null,
          readyAt: ['ready', 'completed', 'out_for_delivery'].includes(status)
            ? new Date(createdAt.getTime() + 20 * 60000)
            : null,
          completedAt: status === 'completed'
            ? new Date(createdAt.getTime() + 35 * 60000)
            : null,
          cancelledAt: status === 'cancelled' ? new Date(createdAt.getTime() + 10 * 60000) : null,
          rejectedAt: status === 'rejected' ? new Date(createdAt.getTime() + 3 * 60000) : null,
          createdAt,
          updatedAt: createdAt,
        })
        .returning();

      await db.insert(orderItems).values(
        lineItems.map((item) => ({ ...item, orderId: order!.id })),
      );

      const timeline: Array<{
        fromStatus: OrderStatus | null;
        toStatus: OrderStatus;
        action: OrderAction;
        reason?: string | null;
        createdAt: Date;
      }> = [
        {
          fromStatus: null,
          toStatus: 'pending',
          action: 'confirm',
          createdAt,
        },
      ];

      let current: OrderStatus = 'pending';
      while (current !== status && statusFlow[current]) {
        const next = statusFlow[current]!;
        if (status === 'cancelled' && next !== 'cancelled') {
          timeline.push({
            fromStatus: current,
            toStatus: 'cancelled',
            action: 'cancel',
            reason: 'Customer changed plans',
            createdAt: new Date(createdAt.getTime() + timeline.length * 5 * 60000),
          });
          break;
        }
        if (status === 'rejected' && current === 'pending') {
          timeline.push({
            fromStatus: current,
            toStatus: 'rejected',
            action: 'reject',
            reason: 'Kitchen at capacity',
            createdAt: new Date(createdAt.getTime() + 3 * 60000),
          });
          break;
        }

        const action = actionForTransition[next] ?? 'complete';
        timeline.push({
          fromStatus: current,
          toStatus: next,
          action,
          createdAt: new Date(createdAt.getTime() + timeline.length * 5 * 60000),
        });
        current = next;
        if (current === status) break;
      }

      await db.insert(orderStatusEvents).values(
        timeline.map((event) => ({
          orderId: order!.id,
          ...event,
        })),
      );

      orderIndex += 1;
    }
  }

  console.log(`Seeded ${orderIndex} orders, ${insertedCustomers.length} customers, ${insertedItems.length} menu items`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
