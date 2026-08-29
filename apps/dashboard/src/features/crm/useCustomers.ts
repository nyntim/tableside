import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useGetCustomers,
  useGetCustomersId,
  useGetOrders,
  usePatchCustomersId,
  usePostCustomers,
} from '@tableside/api-client';
import type {
  GetCustomers200,
  GetCustomers200DataItem,
  GetCustomersId200,
  GetCustomersParams,
  GetOrders200,
  PostCustomersBody,
  PostCustomers201,
} from '@tableside/api-client';
import { useToast } from '@tableside/ui';
import { unwrapResponse } from '@/lib/api';

export function useCustomersList() {
  const params = useLocalSearchParams<{ selected?: string }>();
  const [filters, setFilters] = useState<GetCustomersParams>({
    page: 1,
    pageSize: 20,
  });
  const [filter, setFilter] = useState<'all' | 'vip' | 'new' | 'inactive'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(params.selected);
  const query = useGetCustomers(filters);
  const payload = unwrapResponse<GetCustomers200>(query.data);
  const search = (filters.search ?? '').trim().toLowerCase();

  return {
    customers: (payload?.data ?? []).filter((customer) => {
      if (search) {
        const haystack = [customer.name, customer.email, customer.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filter === 'vip') return (customer.totalSpendCents ?? 0) >= 10000;
      if (filter === 'new') return (customer.orderCount ?? 0) <= 1;
      if (filter === 'inactive') return (customer.orderCount ?? 0) === 0;
      return true;
    }),
    meta: payload?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    search: filters.search ?? '',
    setSearch: (next: string) =>
      setFilters((current) => ({ ...current, search: next || undefined, page: 1 })),
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    filter,
    setFilter,
    selectedCustomerId,
    openCustomer: setSelectedCustomerId,
    closeCustomer: () => setSelectedCustomerId(undefined),
  };
}

export function useCustomerDetail(customerId: string) {
  const { show } = useToast();
  const query = useGetCustomersId(customerId, { query: { enabled: !!customerId } });
  const ordersQuery = useGetOrders(
    { customerId, pageSize: 50 },
    { query: { enabled: !!customerId } },
  );
  const updateCustomer = usePatchCustomersId();
  const customer = unwrapResponse<GetCustomersId200>(query.data);

  const save = async (data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
  }) => {
    try {
      await updateCustomer.mutateAsync({ id: customerId, data });
      show({ title: 'Customer updated', variant: 'success' });
      await query.refetch();
    } catch (error) {
      show({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return {
    customer,
    orders: unwrapResponse<GetOrders200>(ordersQuery.data)?.data ?? [],
    isLoading: query.isLoading || ordersQuery.isLoading,
    isError: query.isError || ordersQuery.isError,
    refetch: () => {
      void query.refetch();
      void ordersQuery.refetch();
    },
    save,
    isSaving: updateCustomer.isPending,
  };
}

export function useCreateCustomer() {
  const router = useRouter();
  const { show } = useToast();
  const createCustomer = usePostCustomers();

  const submit = async (data: PostCustomersBody) => {
    try {
      const result = await createCustomer.mutateAsync({ data });
      const created = unwrapResponse<PostCustomers201>(result);
      show({ title: 'Customer created', variant: 'success' });
      if (created?.id) {
        router.push(`/crm/${created.id}` as never);
      }
    } catch (error) {
      show({
        title: 'Could not create customer',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return { submit, isSubmitting: createCustomer.isPending };
}

export type CustomerListItem = GetCustomers200DataItem;
