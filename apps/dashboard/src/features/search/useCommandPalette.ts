import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useGetCustomers,
  useGetMenuItems,
  useGetOrders,
  type GetCustomers200,
  type GetMenuItems200Item,
  type GetOrders200,
} from '@tableside/api-client';
import { unwrapResponse } from '@/lib/api';

export type SearchScope = 'all' | 'orders' | 'menu' | 'customers' | 'settings';

export type CommandResult = {
  id: string;
  scope: Exclude<SearchScope, 'all'>;
  title: string;
  subtitle: string;
  href: string;
};

export function useCommandPalette() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const ordersQuery = useGetOrders({ pageSize: 5, search: query || undefined });
  const customersQuery = useGetCustomers({ pageSize: 5, search: query || undefined });
  const menuQuery = useGetMenuItems();
  const orders = unwrapResponse<GetOrders200>(ordersQuery.data)?.data ?? [];
  const customers = unwrapResponse<GetCustomers200>(customersQuery.data)?.data ?? [];
  const menu = unwrapResponse<GetMenuItems200Item[]>(menuQuery.data) ?? [];

  const results = useMemo<CommandResult[]>(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const orderResults = orders.map((order) => ({
      id: `order-${order.id}`,
      scope: 'orders' as const,
      title: order.orderNumber,
      subtitle: order.customerName ?? 'Guest order',
      href: `/orders?selected=${order.id}`,
    }));
    const customerResults = customers.map((customer) => ({
      id: `customer-${customer.id}`,
      scope: 'customers' as const,
      title: customer.name,
      subtitle: customer.email ?? 'Customer',
      href: `/crm?selected=${customer.id}`,
    }));
    const menuResults = menu
      .filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.categoryName?.toLowerCase().includes(needle),
      )
      .slice(0, 5)
      .map((item) => ({
        id: `menu-${item.id}`,
        scope: 'menu' as const,
        title: item.name,
        subtitle: item.categoryName ?? 'Menu item',
        href: `/menu?selected=${item.id}`,
      }));
    const settingsResults: CommandResult[] = [
      ['Restaurant profile', 'Name and timezone'],
      ['Ordering', 'Prep time and availability'],
      ['Hours', 'Weekly opening hours'],
    ]
      .filter(([title, subtitle]) => `${title} ${subtitle}`.toLowerCase().includes(needle))
      .map(([title, subtitle], index) => ({
        id: `settings-${index}`,
        scope: 'settings',
        title,
        subtitle,
        href: '/settings',
      }));
    return [...orderResults, ...menuResults, ...customerResults, ...settingsResults].filter(
      (result) => scope === 'all' || result.scope === scope,
    );
  }, [customers, menu, orders, query, scope]);

  return {
    query,
    setQuery,
    scope,
    setScope,
    results,
    isLoading: ordersQuery.isLoading || customersQuery.isLoading || menuQuery.isLoading,
    openResult: (result: CommandResult) => router.push(result.href as never),
    searchAllOrders: () =>
      router.push(`/orders?search=${encodeURIComponent(query.trim())}` as never),
  };
}
