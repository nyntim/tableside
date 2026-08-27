import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  MoneyText,
  SkeletonGroup,
  Table,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { useCustomersList, type CustomerListItem } from '@/features/crm/useCustomers';

export default function CrmScreen() {
  const { colors } = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const { customers, isLoading, isError, refetch, setSearch, openCustomer } = useCustomersList();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>CRM</Text>
      <Text style={[typography.sm, { color: colors.textMuted }]}>Customer relationships and order history</Text>

      <View style={styles.filters}>
        <Input
          label="Search customers"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Name, email, or phone"
          containerStyle={{ flex: 1 }}
        />
        <Button label="Search" variant="secondary" onPress={() => setSearch(searchInput)} />
      </View>

      {isLoading ? (
        <SkeletonGroup count={4} />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers found" description="Try adjusting your search." />
      ) : (
        <Table<CustomerListItem>
          columns={[
            {
              key: 'name',
              header: 'Name',
              flex: 1.2,
              render: (row) => (
                <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => openCustomer(row.id)}>
                  {row.name}
                </Text>
              ),
            },
            {
              key: 'email',
              header: 'Email',
              flex: 1,
              render: (row) => <Text style={{ color: colors.textMuted }}>{row.email ?? '—'}</Text>,
            },
            {
              key: 'orders',
              header: 'Orders',
              flex: 0.6,
              render: (row) => <Text style={{ color: colors.text }}>{row.orderCount ?? 0}</Text>,
            },
            {
              key: 'spend',
              header: 'Total spend',
              flex: 0.8,
              render: (row) => <MoneyText cents={row.totalSpendCents ?? 0} />,
            },
          ]}
          data={customers}
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
  filters: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-end',
  },
});
