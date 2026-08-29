import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  ErrorState,
  Input,
  Money,
  Select,
  SkeletonGroup,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { calculateOrderTotals } from '@tableside/shared';
import { useCreateOrder } from '@/features/orders/useOrders';

export default function NewOrderScreen() {
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
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery' | 'dine_in'>('pickup');
  const [menuItemId, setMenuItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<Array<{ menuItemId: string; quantity: number; name: string; priceCents: number }>>([]);

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

  if (isError) {
    return <ErrorState onRetry={refetch} />;
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
