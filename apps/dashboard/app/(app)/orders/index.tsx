import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Money,
  Select,
  SkeletonGroup,
  StatusBadge,
  Table,
  Timeline,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { formatRelativeDate, isDestructiveAction } from '@tableside/shared';
import {
  useOrderDetail,
  useOrdersList,
  type OrderListItem,
} from '@/features/orders/useOrders';

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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact');
  const {
    orders,
    isLoading,
    isError,
    refetch,
    setStatus,
    setChannel,
    setSearch: applySearch,
    openOrder,
    closeOrder,
    selectedOrderId,
    createOrder,
    exportOrders,
    filters,
    stats,
  } = useOrdersList();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[typography['3xl'], { color: colors.text }]}>Orders</Text>
          <Text style={[typography.sm, { color: colors.textMuted }]}>Manage and transition order workflow</Text>
        </View>
        <Button label="New order" onPress={createOrder} />
      </View>

      {isError ? <ErrorState onRetry={() => refetch()} message="Orders could not be loaded." /> : null}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[typography.xs, { color: colors.textMuted }]}>TOTAL ORDERS</Text>
          <Text style={[typography.lg, { color: colors.text }]}>{stats.totalOrders}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[typography.xs, { color: colors.textMuted }]}>REVENUE</Text>
          <Money cents={stats.revenueCents} />
        </View>
        <View style={styles.stat}>
          <Text style={[typography.xs, { color: colors.textMuted }]}>AVG ORDER VALUE</Text>
          <Money cents={stats.averageOrderValueCents} />
        </View>
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
          value={filters.status ?? ''}
          onChange={(value) => setStatus(value ? (value as never) : undefined)}
        />
        <Select
          label="Channel"
          options={[
            { label: 'All channels', value: '' },
            { label: 'Pickup', value: 'pickup' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Dine in', value: 'dine_in' },
          ]}
          value={filters.fulfillmentType ?? ''}
          onChange={(value) => setChannel(value || undefined)}
        />
        <View style={styles.toolbarButtons}>
          <Button
            label={density === 'compact' ? '☷ Compact' : '☰ Comfortable'}
            variant="ghost"
            onPress={() => setDensity((current) => (current === 'compact' ? 'comfortable' : 'compact'))}
          />
          <Button label="Export" variant="secondary" onPress={exportOrders} />
        </View>
      </View>

      {isLoading ? (
        <SkeletonGroup count={5} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" actionLabel="Create order" onAction={createOrder} />
      ) : (
        <Table<OrderListItem>
          selectable
          selectedKeys={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowPress={(row) => openOrder(row.id)}
          columns={[
            {
              key: 'orderNumber',
              header: 'Order',
              flex: 1.2,
              sortable: true,
              sortValue: (row) => row.orderNumber,
              render: (row) => (
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  {row.orderNumber}
                </Text>
              ),
            },
            {
              key: 'items',
              header: 'Items',
              flex: 0.5,
              render: () => <Text style={{ color: colors.textMuted }}>View</Text>,
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
              minWidth: 104,
              sortable: true,
              sortValue: (row) => row.totalCents,
              render: (row) => <Money cents={row.totalCents} size="small" />,
            },
            {
              key: 'channel',
              header: 'Channel',
              flex: 0.8,
              render: (row) => (
                <Text style={{ color: colors.text, textTransform: 'capitalize' }}>
                  {row.fulfillmentType.replaceAll('_', ' ')}
                </Text>
              ),
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
      <OrderDrawer orderId={selectedOrderId} onClose={closeOrder} />
    </ScrollView>
  );
}

function OrderDrawer({ orderId, onClose }: { orderId?: string; onClose: () => void }) {
  const { colors } = useTheme();
  const detail = useOrderDetail(orderId ?? '');

  return (
    <Drawer visible={!!orderId} title={detail.order?.orderNumber ?? 'Order'} onClose={onClose} width={480}>
      {detail.isLoading ? (
        <SkeletonGroup count={5} />
      ) : detail.isError || !detail.order ? (
        <ErrorState onRetry={() => detail.refetch()} message="Order details could not be loaded." />
      ) : (
        <>
          <View>
            <Text style={[typography.xs, { color: colors.textMuted }]}>ORDER TOTAL</Text>
            <Money cents={detail.order.totalCents} emphasize />
          </View>
          <StatusBadge status={detail.order.status} />
          <Card title="Timeline">
            <Timeline entries={detail.timelineEntries} />
          </Card>
          <Card title="Line items">
            {detail.order.items.map((item) => (
              <View key={item.id} style={styles.lineItem}>
                <Text style={[typography.sm, { color: colors.text, flex: 1 }]}>
                  {item.quantity} × {item.nameSnapshot}
                </Text>
                <Money cents={item.lineTotalCents} size="small" />
              </View>
            ))}
          </Card>
          <Input
            label="Notes"
            value={detail.order.notes ?? ''}
            editable={false}
            multiline
            hint="Order notes are recorded at creation."
          />
          <View style={styles.actions}>
            {detail.allowedActions.map(({ action, label }) => (
              <Button
                key={action}
                label={label}
                variant={isDestructiveAction(action) ? 'danger' : 'primary'}
                loading={detail.isTransitioning}
                onPress={() => detail.performTransition(action)}
              />
            ))}
          </View>
        </>
      )}
    </Drawer>
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
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[6] },
  stat: { minWidth: 160, gap: spacing[1] },
  toolbarButtons: { flexDirection: 'row', gap: spacing[2], alignItems: 'center' },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
