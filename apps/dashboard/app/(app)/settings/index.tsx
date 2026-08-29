import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  Button,
  ErrorState,
  Input,
  Money,
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
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('');
  const [minOrderCents, setMinOrderCents] = useState('');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurantName);
      setTimezone(settings.timezone);
      setTaxRateBps(String(settings.taxRateBps));
      setServiceFeeBps(String(settings.serviceFeeBps));
      setDeliveryFeeCents(String(settings.deliveryFeeCents));
      setAcceptingOrders(settings.acceptingOrders);
      setPrepTimeMinutes(String(settings.prepTimeMinutes));
      setMinOrderCents(String(settings.minOrderCents));
      setAutoAcceptOrders(settings.autoAcceptOrders);
    }
  }, [settings]);

  if (isError) {
    return <ErrorState onRetry={refetch} message="Settings could not be loaded." />;
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
      <Text style={[typography['3xl'], { color: colors.text }]}>Settings</Text>
      <Text style={[typography.sm, { color: colors.textMuted }]}>Business configuration and operations</Text>
      {isError ? <ErrorState onRetry={refetch} message="Settings could not be loaded." /> : null}

      <SettingsSection label="Restaurant Profile">
        <SettingRow label="Restaurant name" onEdit={() => setEditing('name')}>
          {editing === 'name' ? <Input value={restaurantName} onChangeText={setRestaurantName} /> : <Value text={restaurantName} />}
        </SettingRow>
        <SettingRow label="Timezone" onEdit={() => setEditing('timezone')}>
          {editing === 'timezone' ? <Input value={timezone} onChangeText={setTimezone} /> : <Value text={timezone} />}
        </SettingRow>
      </SettingsSection>

      <SettingsSection label="Ordering">
        <SettingRow label="Preparation time" onEdit={() => setEditing('prep')}>
          {editing === 'prep' ? <Input value={prepTimeMinutes} onChangeText={setPrepTimeMinutes} keyboardType="number-pad" /> : <Value text={`${prepTimeMinutes} minutes`} />}
        </SettingRow>
        <SettingRow label="Auto-accept orders">
          <Switch value={autoAcceptOrders} onValueChange={setAutoAcceptOrders} trackColor={{ false: colors.border, true: colors.success }} />
        </SettingRow>
        <SettingRow label="Service availability">
          <Switch value={acceptingOrders} onValueChange={setAcceptingOrders} trackColor={{ false: colors.border, true: colors.success }} />
        </SettingRow>
        <SettingRow label="Minimum order" onEdit={() => setEditing('minimum')}>
          {editing === 'minimum' ? <Input value={minOrderCents} onChangeText={setMinOrderCents} keyboardType="number-pad" hint="Value in cents" /> : <Money cents={Number(minOrderCents)} size="small" />}
        </SettingRow>
        <SettingRow label="Delivery fee" onEdit={() => setEditing('delivery')}>
          {editing === 'delivery' ? <Input value={deliveryFeeCents} onChangeText={setDeliveryFeeCents} keyboardType="number-pad" hint="Value in cents" /> : <Money cents={Number(deliveryFeeCents)} size="small" />}
        </SettingRow>
        <SettingRow label="Tax rate" onEdit={() => setEditing('tax')}>
          {editing === 'tax' ? <Input value={taxRateBps} onChangeText={setTaxRateBps} keyboardType="number-pad" /> : <Value text={`${Number(taxRateBps) / 100}%`} />}
        </SettingRow>
        <SettingRow label="Service fee" onEdit={() => setEditing('serviceFee')}>
          {editing === 'serviceFee' ? <Input value={serviceFeeBps} onChangeText={setServiceFeeBps} keyboardType="number-pad" /> : <Value text={`${Number(serviceFeeBps) / 100}%`} />}
        </SettingRow>
      </SettingsSection>

      <SettingsSection label="Hours">
        <SettingRow label="Weekly schedule" onEdit={() => setEditing('hours')}>
          <Value text={settings.openingHours?.length ? `${settings.openingHours.length} days configured` : 'Not configured'} />
        </SettingRow>
      </SettingsSection>
      <SettingsSection label="Team & Roles">
        <SettingRow label="Team management"><Value text="Not configured in this workspace" muted /></SettingRow>
      </SettingsSection>
      <SettingsSection label="Notifications">
        <SettingRow label="Notification preferences"><Value text="Not configured in this workspace" muted /></SettingRow>
      </SettingsSection>

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
            prepTimeMinutes: Number(prepTimeMinutes),
            minOrderCents: Number(minOrderCents),
            autoAcceptOrders,
          } as Parameters<typeof save>[0])
        }
      />
    </ScrollView>
  );
}

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[typography.xs, styles.sectionLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function SettingRow({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[typography.sm, { color: colors.textMuted, flex: 1 }]}>{label}</Text>
      <View style={styles.settingValue}>{children}</View>
      {onEdit ? (
        <Pressable onPress={onEdit}>
          <Text style={[typography.sm, { color: colors.primary }]}>Edit</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Value({ text, muted }: { text: string; muted?: boolean }) {
  const { colors } = useTheme();
  return <Text style={[typography.sm, { color: muted ? colors.textMuted : colors.text }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
    borderBottomWidth: 1,
    gap: spacing[4],
  },
  settingValue: { minWidth: 220, alignItems: 'flex-end' },
  sectionLabel: { letterSpacing: 1, marginTop: spacing[4], marginBottom: spacing[1] },
});
