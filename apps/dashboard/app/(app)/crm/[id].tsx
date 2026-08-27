import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Card,
  ErrorState,
  Input,
  MoneyText,
  SkeletonGroup,
  spacing,
  typography,
  useTheme,
} from '@odyssey/ui';
import { useCustomerDetail } from '@/features/crm/useCustomers';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { customer, isLoading, isError, refetch, save, isSaving } = useCustomerDetail(id);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email ?? '');
      setPhone(customer.phone ?? '');
      setNotes(customer.notes ?? '');
    }
  }, [customer]);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading || !customer) {
    return (
      <View style={{ padding: spacing[6], backgroundColor: colors.background, flex: 1 }}>
        <SkeletonGroup count={5} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Button label="← Back" variant="ghost" onPress={() => router.back()} />
      <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>{customer.name}</Text>

      <Card title="Details">
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} />
        <Input label="Phone" value={phone} onChangeText={setPhone} />
        <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
        <Button
          label="Save changes"
          loading={isSaving}
          onPress={() => save({ name, email: email || null, phone: phone || null, notes: notes || null })}
        />
      </Card>

      <Card title="Stats">
        <Text style={{ color: colors.textMuted }}>Orders: {customer.orderCount ?? 0}</Text>
        <MoneyText cents={customer.totalSpendCents ?? 0} emphasize style={{ marginTop: spacing[2] }} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
});
