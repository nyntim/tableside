import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useGetMenuItems,
  useGetMetricsSummary,
  useGetOrders,
  useGetSettings,
} from '@tableside/api-client';
import type {
  GetMenuItems200Item,
  GetMetricsSummary200,
  GetMetricsSummaryRange,
  GetOrders200,
  GetSettings200,
} from '@tableside/api-client';
import { unwrapResponse } from '@/lib/api';

export function useHomeMetrics() {
  const [range, setRange] = useState<GetMetricsSummaryRange>('7d');
  const query = useGetMetricsSummary({ range });
  const ordersQuery = useGetOrders({ pageSize: 6 });
  const menuQuery = useGetMenuItems();
  const settingsQuery = useGetSettings();
  const recentOrders = unwrapResponse<GetOrders200>(ordersQuery.data)?.data ?? [];
  const menuItems = unwrapResponse<GetMenuItems200Item[]>(menuQuery.data) ?? [];

  return {
    metrics: unwrapResponse<GetMetricsSummary200>(query.data),
    recentOrders,
    lowAvailabilityItems: menuItems.filter((item) => !item.isAvailable),
    settings: unwrapResponse<GetSettings200>(settingsQuery.data),
    isLoading:
      query.isLoading || ordersQuery.isLoading || menuQuery.isLoading || settingsQuery.isLoading,
    isError: query.isError || ordersQuery.isError || menuQuery.isError || settingsQuery.isError,
    refetch: () => {
      void query.refetch();
      void ordersQuery.refetch();
      void menuQuery.refetch();
      void settingsQuery.refetch();
    },
    range,
    setRange,
  };
}
