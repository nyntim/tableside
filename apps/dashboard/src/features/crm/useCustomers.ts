import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useGetCustomers,
  useGetCustomersId,
  usePatchCustomersId,
  usePostCustomers,
} from '@tableside/api-client';
import type {
  GetCustomers200,
  GetCustomers200DataItem,
  GetCustomersId200,
  PostCustomersBody,
  PostCustomers201,
} from '@tableside/api-client';
import { useToast } from '@tableside/ui';
import { unwrapResponse } from '@/lib/api';

export function useCustomersList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useGetCustomers({ page, pageSize: 20, search: search || undefined });
  const payload = unwrapResponse<GetCustomers200>(query.data);

  return {
    customers: payload?.data ?? [],
    meta: payload?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    search,
    setSearch,
    setPage,
    openCustomer: (id: string) => router.push(`/crm/${id}` as never),
  };
}

export function useCustomerDetail(customerId: string) {
  const { show } = useToast();
  const query = useGetCustomersId(customerId, { query: { enabled: !!customerId } });
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
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
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
