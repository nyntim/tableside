import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  useGetOrders,
  useGetOrdersId,
  useGetCustomers,
  useGetMenuItems,
  useGetSettings,
  usePostOrders,
  usePostOrdersIdTransition,
} from '@tableside/api-client';
import type {
  GetOrders200,
  GetOrders200DataItem,
  GetOrdersId200,
  GetOrdersParams,
  GetOrdersStatus,
  GetCustomers200,
  GetMenuItems200Item,
  GetSettings200,
  PostOrders201,
  PostOrdersBody,
} from '@tableside/api-client';
import { formatDateTime } from '@tableside/shared';
import { getActionLabel, getStatusLabel, TERMINAL_STATUSES } from '@tableside/types';
import { useToast, type TimelineEntry } from '@tableside/ui';
import { unwrapResponse } from '@/lib/api';

export function useOrdersList() {
  const params = useLocalSearchParams<{ selected?: string; search?: string; new?: string }>();
  const [filters, setFilters] = useState<GetOrdersParams>({
    page: 1,
    pageSize: 20,
    search: params.search,
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(params.selected);
  const [isCreatingOrder, setIsCreatingOrder] = useState(params.new === '1');
  const query = useGetOrders(filters);
  const payload = unwrapResponse<GetOrders200>(query.data);
  const exportOrders = () => {
    const rows = payload?.data ?? [];
    const csv = [
      ['Order', 'Customer', 'Status', 'Channel', 'Total cents', 'Placed at'],
      ...rows.map((order) => [
        order.orderNumber,
        order.customerName ?? '',
        order.status,
        order.fulfillmentType,
        String(order.totalCents),
        order.createdAt,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      link.download = 'orders.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return {
    orders: payload?.data ?? [],
    meta: payload?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    filters,
    setStatus: (status?: GetOrdersStatus) =>
      setFilters((current) => ({ ...current, status, page: 1 })),
    setSearch: (search: string) => setFilters((current) => ({ ...current, search, page: 1 })),
    setChannel: (fulfillmentType?: string) =>
      setFilters((current) => ({
        ...current,
        fulfillmentType: fulfillmentType as GetOrdersParams['fulfillmentType'],
        page: 1,
      })),
    setDateRange: (from?: string, to?: string) =>
      setFilters((current) => ({ ...current, from, to, page: 1 })),
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    selectedOrderId,
    openOrder: (id: string) => {
      setIsCreatingOrder(false);
      setSelectedOrderId(id);
    },
    closeOrder: () => setSelectedOrderId(undefined),
    isCreatingOrder,
    createOrder: () => {
      setSelectedOrderId(undefined);
      setIsCreatingOrder(true);
    },
    closeCreateOrder: () => setIsCreatingOrder(false),
    exportOrders,
    stats: {
      totalOrders: payload?.meta.total ?? 0,
      revenueCents: (payload?.data ?? []).reduce((sum, order) => sum + order.totalCents, 0),
      averageOrderValueCents: payload?.data?.length
        ? Math.round(
            payload.data.reduce((sum, order) => sum + order.totalCents, 0) / payload.data.length,
          )
        : 0,
    },
  };
}

export function useOrderDetail(orderId: string) {
  const { show } = useToast();
  const query = useGetOrdersId(orderId, { query: { enabled: !!orderId } });
  const transition = usePostOrdersIdTransition();
  const order = unwrapResponse<GetOrdersId200>(query.data);

  const allowedActions = (order?.allowedActions ?? []).map((action) => ({
    action,
    label: getActionLabel(action),
  }));

  const performTransition = async (action: string, reason?: string) => {
    try {
      await transition.mutateAsync({ id: orderId, data: { action: action as never, reason } });
      show({ title: 'Order updated', variant: 'success' });
      await query.refetch();
    } catch (error) {
      show({
        title: 'Transition failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return {
    order,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    allowedActions,
    performTransition,
    isTransitioning: transition.isPending,
    timelineEntries: order ? toOrderTimelineEntries(order) : [],
  };
}

export function toOrderTimelineEntries(order: GetOrdersId200): TimelineEntry[] {
  return [
    {
      id: `placed-${order.id}`,
      label: 'Placed',
      timestamp: formatDateTime(order.createdAt),
    },
    ...order.timeline.map((event) => ({
      id: event.id,
      label: getStatusLabel(event.toStatus),
      timestamp: formatDateTime(event.createdAt),
      detail: event.reason ?? undefined,
      tone:
        event.toStatus === 'completed'
          ? ('success' as const)
          : TERMINAL_STATUSES.includes(event.toStatus)
            ? ('error' as const)
            : ('default' as const),
    })),
  ];
}

export function useCreateOrder() {
  const { show } = useToast();
  const createOrder = usePostOrders();
  const customersQuery = useGetCustomers({ page: 1, pageSize: 100 });
  const menuQuery = useGetMenuItems();
  const settingsQuery = useGetSettings();

  const submit = async (payload: PostOrdersBody) => {
    try {
      const result = await createOrder.mutateAsync({ data: payload });
      const created = unwrapResponse<PostOrders201>(result);
      show({ title: 'Order created', variant: 'success' });
      return created;
    } catch (error) {
      show({
        title: 'Could not create order',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
      return undefined;
    }
  };

  return {
    submit,
    isSubmitting: createOrder.isPending,
    customers: unwrapResponse<GetCustomers200>(customersQuery.data)?.data ?? [],
    menuItems: unwrapResponse<GetMenuItems200Item[]>(menuQuery.data) ?? [],
    settings: unwrapResponse<GetSettings200>(settingsQuery.data),
    isLoading: customersQuery.isLoading || menuQuery.isLoading || settingsQuery.isLoading,
    isError: customersQuery.isError || menuQuery.isError || settingsQuery.isError,
    refetch: () => {
      void customersQuery.refetch();
      void menuQuery.refetch();
      void settingsQuery.refetch();
    },
  };
}

export type OrderListItem = GetOrders200DataItem;
