import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  useGetOrders,
  useGetOrdersId,
  usePostOrders,
  usePostOrdersIdTransition,
} from '@odyssey/api-client';
import type {
  GetOrders200,
  GetOrders200DataItem,
  GetOrdersId200,
  GetOrdersParams,
  GetOrdersStatus,
  PostOrders201,
  PostOrdersBody,
} from '@odyssey/api-client';
import { getActionLabel } from '@odyssey/types';
import { useToast } from '@odyssey/ui';
import { unwrapResponse } from '@/lib/api';

export function useOrdersList() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetOrdersParams>({ page: 1, pageSize: 20 });
  const query = useGetOrders(filters);
  const payload = unwrapResponse<GetOrders200>(query.data);

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
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    openOrder: (id: string) => router.push(`/orders/${id}` as never),
    createOrder: () => router.push('/orders/new' as never),
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
  };
}

export function useCreateOrder() {
  const router = useRouter();
  const { show } = useToast();
  const createOrder = usePostOrders();

  const submit = async (payload: PostOrdersBody) => {
    try {
      const result = await createOrder.mutateAsync({ data: payload });
      const created = unwrapResponse<PostOrders201>(result);
      show({ title: 'Order created', variant: 'success' });
      if (created?.id) {
        router.replace(`/orders/${created.id}` as never);
      }
    } catch (error) {
      show({
        title: 'Could not create order',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return {
    submit,
    isSubmitting: createOrder.isPending,
  };
}

export function useOrderRouteParams() {
  const params = useLocalSearchParams<{ id: string }>();
  return params.id;
}

export type OrderListItem = GetOrders200DataItem;
