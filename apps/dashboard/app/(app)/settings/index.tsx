import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  Button,
  Card,
  ErrorState,
  Input,
  SkeletonGroup,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { useSettingsForm } from '@/features/settings/useSettingsForm';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, isLoading, isError, refetch, save, isSaving } = useSettingsForm();
  const [restaurantName, setRestaurantName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [taxRateBps, setTaxRateBps] = useState('');
  const [serviceFeeBps, setServiceFeeBps] = useState('');
  const [deliveryFeeCents, setDeliveryFeeCents] = useState('');
  const [acceptingOrders, setAcceptingOrders] = useState(true);

  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurantName);
      setTimezone(settings.timezone);
      setTaxRateBps(String(settings.taxRateBps));
      setServiceFeeBps(String(settings.serviceFeeBps));
      setDeliveryFeeCents(String(settings.deliveryFeeCents));
      setAcceptingOrders(settings.acceptingOrders);
    }
  }, [settings]);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading || !settings) {
    return (
      <View style={{ padding: spacing[6], backgroundColor: colors.background, flex: 1 }}>
        <SkeletonGroup count={5} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>Settings</Text>
      <Text style={[typography.sm, { color: colors.textMuted }]}>Business configuration and fees</Text>

      <Card title="Business">
        <Input label="Restaurant name" value={restaurantName} onChangeText={setRestaurantName} />
        <Input label="Timezone" value={timezone} onChangeText={setTimezone} />
        <View style={styles.switchRow}>
          <Text style={[typography.sm, { color: colors.text }]}>Accepting orders</Text>
          <Switch value={acceptingOrders} onValueChange={setAcceptingOrders} />
        </View>
      </Card>

      <Card title="Fees & tax">
        <Input label="Tax rate (basis points)" value={taxRateBps} onChangeText={setTaxRateBps} keyboardType="number-pad" />
        <Input label="Service fee (basis points)" value={serviceFeeBps} onChangeText={setServiceFeeBps} keyboardType="number-pad" />
        <Input label="Delivery fee (cents)" value={deliveryFeeCents} onChangeText={setDeliveryFeeCents} keyboardType="number-pad" />
      </Card>

      <Button
        label="Save settings"
        loading={isSaving}
        onPress={() =>
          save({
            restaurantName,
            timezone,
            taxRateBps: Number(taxRateBps),
            serviceFeeBps: Number(serviceFeeBps),
            deliveryFeeCents: Number(deliveryFeeCents),
            acceptingOrders,
          } as Parameters<typeof save>[0])
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
});
