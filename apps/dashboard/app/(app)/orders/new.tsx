import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  ErrorState,
  Input,
  MoneyText,
  Select,
  SkeletonGroup,
  spacing,
  typography,
  useTheme,
} from '@odyssey/ui';
import {
  useGetCustomers,
  useGetMenuItems,
  useGetSettings,
} from '@odyssey/api-client';
import { calculateOrderTotals } from '@odyssey/types';
import { useCreateOrder } from '@/features/orders/useOrders';
import { unwrapResponse } from '@/lib/api';
import type { GetCustomers200, GetMenuItems200Item, GetSettings200 } from '@odyssey/api-client';

export default function NewOrderScreen() {
  const { colors } = useTheme();
  const { submit, isSubmitting } = useCreateOrder();
  const customersQuery = useGetCustomers({ page: 1, pageSize: 100 });
  const menuQuery = useGetMenuItems();
  const settingsQuery = useGetSettings();

  const [customerId, setCustomerId] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery' | 'dine_in'>('pickup');
  const [menuItemId, setMenuItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<Array<{ menuItemId: string; quantity: number; name: string; priceCents: number }>>([]);

  const customersPayload = unwrapResponse<GetCustomers200>(customersQuery.data);
  const menuItems = unwrapResponse<GetMenuItems200Item[]>(menuQuery.data) ?? [];
  const settings = unwrapResponse<GetSettings200>(settingsQuery.data);

  const customerOptions = useMemo(
    () =>
      (customersPayload?.data ?? []).map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    [customersPayload],
  );

  const menuOptions = useMemo(
    () =>
      menuItems.map((item) => ({
        label: `${item.name} — $${(item.priceCents / 100).toFixed(2)}`,
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

  const isLoading = customersQuery.isLoading || menuQuery.isLoading || settingsQuery.isLoading;
  const isError = customersQuery.isError || menuQuery.isError || settingsQuery.isError;

  if (isError) {
    return <ErrorState onRetry={() => {
      customersQuery.refetch();
      menuQuery.refetch();
      settingsQuery.refetch();
    }} />;
  }

  if (isLoading) {
    return (
      <View style={{ padding: spacing[6], backgroundColor: colors.background, flex: 1 }}>
        <SkeletonGroup count={6} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>New order</Text>

      <Select label="Customer" options={customerOptions} value={customerId} onChange={setCustomerId} />
      <Select
        label="Fulfillment"
        options={[
          { label: 'Pickup', value: 'pickup' },
          { label: 'Delivery', value: 'delivery' },
          { label: 'Dine in', value: 'dine_in' },
        ]}
        value={fulfillmentType}
        onChange={(value) => setFulfillmentType(value as typeof fulfillmentType)}
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
              <MoneyText cents={item.priceCents * item.quantity} />
            </View>
          ))
        )}
        {totals ? (
          <View style={styles.totalRow}>
            <Text style={[typography.lg, { color: colors.text, fontWeight: '700' }]}>Estimated total</Text>
            <MoneyText cents={totals.totalCents} emphasize />
          </View>
        ) : null}
      </Card>

      <Button
        label="Create order"
        loading={isSubmitting}
        disabled={!customerId || items.length === 0}
        onPress={() =>
          submit({
            customerId,
            fulfillmentType,
            items: items.map(({ menuItemId: id, quantity: qty }) => ({ menuItemId: id, quantity: qty })),
            expectedTotalCents: totals?.totalCents,
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
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
});
