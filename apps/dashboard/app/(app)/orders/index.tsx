import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  MoneyText,
  Select,
  SkeletonGroup,
  StatusBadge,
  Table,
  spacing,
  typography,
  useTheme,
} from '@odyssey/ui';
import { formatRelativeDate } from '@odyssey/shared';
import { useOrdersList, type OrderListItem } from '@/features/orders/useOrders';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for delivery', value: 'out_for_delivery' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const {
    orders,
    isLoading,
    isError,
    refetch,
    setStatus,
    setSearch: applySearch,
    openOrder,
    createOrder,
  } = useOrdersList();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>Orders</Text>
          <Text style={[typography.sm, { color: colors.textMuted }]}>Manage and transition order workflow</Text>
        </View>
        <Button label="New order" onPress={createOrder} />
      </View>

      <View style={styles.filters}>
        <Input
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Order # or customer"
          containerStyle={{ flex: 1 }}
        />
        <Button label="Search" variant="secondary" onPress={() => applySearch(search)} />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value=""
          onChange={(value) => setStatus(value ? (value as never) : undefined)}
        />
      </View>

      {isLoading ? (
        <SkeletonGroup count={5} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" actionLabel="Create order" onAction={createOrder} />
      ) : (
        <Table<OrderListItem>
          columns={[
            {
              key: 'orderNumber',
              header: 'Order',
              flex: 1.2,
              render: (row) => (
                <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => openOrder(row.id)}>
                  {row.orderNumber}
                </Text>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              flex: 1,
              render: (row) => (
                <Text style={{ color: colors.text }}>{row.customerName ?? '—'}</Text>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              flex: 1,
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'total',
              header: 'Total',
              flex: 0.8,
              render: (row) => <MoneyText cents={row.totalCents} />,
            },
            {
              key: 'created',
              header: 'Created',
              flex: 0.8,
              render: (row) => (
                <Text style={{ color: colors.textMuted }}>{formatRelativeDate(row.createdAt)}</Text>
              ),
            },
          ]}
          data={orders}
          keyExtractor={(row) => row.id}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    alignItems: 'flex-end',
  },
});
