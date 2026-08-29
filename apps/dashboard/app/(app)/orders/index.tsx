import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Modal,
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
import { formatRelativeDate } from '@tableside/shared';
import {
  FULFILLMENT_TYPES,
  ORDER_STATUSES,
  getFulfillmentLabel,
  getStatusLabel,
  isDestructiveAction,
  type FulfillmentType,
  calculateOrderTotals,
} from '@tableside/types';
import {
  useCreateOrder,
  useOrderDetail,
  useOrdersList,
  type OrderListItem,
} from '@/features/orders/useOrders';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...ORDER_STATUSES.map((status) => ({
    label: getStatusLabel(status),
    value: status,
  })),
];

const CHANNEL_OPTIONS = [
  { label: 'All channels', value: '' },
  ...FULFILLMENT_TYPES.map((type) => ({
    label: getFulfillmentLabel(type),
    value: type,
  })),
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
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
    closeCreateOrder,
    isCreatingOrder,
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
          options={CHANNEL_OPTIONS}
          value={filters.fulfillmentType ?? ''}
          onChange={(value) => setChannel(value || undefined)}
        />
        <Button label="Export" variant="secondary" onPress={exportOrders} />
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
      <CreateOrderDrawer
        visible={isCreatingOrder}
        onClose={closeCreateOrder}
        onCreated={async (orderId) => {
          closeCreateOrder();
          await refetch();
          openOrder(orderId);
        }}
      />
      <OrderDrawer orderId={selectedOrderId} onClose={closeOrder} />
    </ScrollView>
  );
}

function CreateOrderDrawer({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (orderId: string) => void | Promise<void>;
}) {
  const { colors } = useTheme();
  const {
    submit,
    isSubmitting,
    customers,
    menuItems,
    settings,
    isLoading,
    isError,
    refetch,
  } = useCreateOrder();

  const [customerId, setCustomerId] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [menuItemId, setMenuItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<
    Array<{ menuItemId: string; quantity: number; name: string; priceCents: number }>
  >([]);

  useEffect(() => {
    if (!visible) {
      setCustomerId('');
      setFulfillmentType('pickup');
      setMenuItemId('');
      setQuantity('1');
      setItems([]);
    }
  }, [visible]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    [customers],
  );

  const menuOptions = useMemo(
    () =>
      menuItems.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [menuItems],
  );

  const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const totals = settings
    ? calculateOrderTotals({
        subtotalCents,
        taxRateBps: settings.taxRateBps,
        serviceFeeBps: settings.serviceFeeBps,
        deliveryFeeCents: settings.deliveryFeeCents,
        fulfillmentType,
      })
    : null;

  const addItem = () => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    const qty = Number(quantity);
    if (!menuItem || !qty) return;
    setItems((current) => [
      ...current,
      { menuItemId, quantity: qty, name: menuItem.name, priceCents: menuItem.priceCents },
    ]);
    setMenuItemId('');
    setQuantity('1');
  };

  return (
    <Drawer visible={visible} title="New order" onClose={onClose} width={480}>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGroup count={6} />
      ) : (
        <>
          <Select label="Customer" options={customerOptions} value={customerId} onChange={setCustomerId} />
          <Select
            label="Fulfillment"
            options={FULFILLMENT_TYPES.map((type) => ({
              label: getFulfillmentLabel(type),
              value: type,
            }))}
            value={fulfillmentType}
            onChange={(value) => setFulfillmentType(value as FulfillmentType)}
          />
          <Card title="Add items">
            <Select label="Menu item" options={menuOptions} value={menuItemId} onChange={setMenuItemId} />
            <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
            <Button label="Add item" variant="secondary" onPress={addItem} />
          </Card>
          <Card title="Line items">
            {items.length === 0 ? (
              <Text style={{ color: colors.textMuted }}>No items added yet</Text>
            ) : (
              items.map((item, index) => (
                <View key={`${item.menuItemId}-${index}`} style={styles.lineRow}>
                  <Text style={{ color: colors.text, flex: 1 }}>
                    {item.quantity}× {item.name}
                  </Text>
                  <Money cents={item.priceCents * item.quantity} size="small" />
                </View>
              ))
            )}
            {totals ? (
              <View style={styles.totalRow}>
                <Text style={[typography.lg, { color: colors.text, fontWeight: '700' }]}>Estimated total</Text>
                <Money cents={totals.totalCents} emphasize />
              </View>
            ) : null}
          </Card>
          <Button
            label="Create order"
            loading={isSubmitting}
            disabled={!customerId || items.length === 0}
            onPress={async () => {
              const created = await submit({
                customerId,
                fulfillmentType,
                items: items.map(({ menuItemId: id, quantity: qty }) => ({ menuItemId: id, quantity: qty })),
                expectedTotalCents: totals?.totalCents,
              });
              if (created?.id) await onCreated(created.id);
            }}
          />
        </>
      )}
    </Drawer>
  );
}

function OrderDrawer({ orderId, onClose }: { orderId?: string; onClose: () => void }) {
  const { colors } = useTheme();
  const detail = useOrderDetail(orderId ?? '');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const needsReason = pendingAction === 'cancel' || pendingAction === 'reject';

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
          <Text style={[typography.sm, { color: colors.textMuted }]}>
            {getFulfillmentLabel(detail.order.fulfillmentType)} · {detail.order.customer.name}
          </Text>
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
                onPress={() => setPendingAction(action)}
              />
            ))}
          </View>
          <Modal
            visible={!!pendingAction}
            title={`Confirm ${pendingAction?.replaceAll('_', ' ') ?? ''}`}
            onRequestClose={() => {
              setPendingAction(null);
              setReason('');
            }}
            onCancel={() => {
              setPendingAction(null);
              setReason('');
            }}
            onConfirm={async () => {
              if (!pendingAction) return;
              await detail.performTransition(pendingAction, reason || undefined);
              setPendingAction(null);
              setReason('');
            }}
            loading={detail.isTransitioning}
            confirmLabel="Apply"
          >
            {needsReason ? (
              <Input
                label="Reason"
                value={reason}
                onChangeText={setReason}
                placeholder="Required for cancel/reject"
              />
            ) : (
              <Text style={{ color: colors.textMuted }}>Apply this transition to the order?</Text>
            )}
          </Modal>
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
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  lineRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
