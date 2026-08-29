import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Money,
  SkeletonGroup,
  Table,
  Timeline,
  radius,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { formatDateTime, formatRelativeDate } from '@tableside/shared';
import {
  useCustomerDetail,
  useCustomersList,
  type CustomerListItem,
} from '@/features/crm/useCustomers';

export default function CrmScreen() {
  const { colors } = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const {
    customers,
    isLoading,
    isError,
    refetch,
    setSearch,
    openCustomer,
    closeCustomer,
    selectedCustomerId,
    filter,
    setFilter,
  } = useCustomersList();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[typography['3xl'], { color: colors.text }]}>CRM</Text>
      <Text style={[typography.sm, { color: colors.textMuted }]}>Customer relationships and order history</Text>
      {isError ? <ErrorState onRetry={refetch} message="Customer data could not be loaded." /> : null}

      <View style={styles.filters}>
        <Input
          label="Search customers"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Name, email, or phone"
          containerStyle={{ flex: 1 }}
          onSubmitEditing={() => setSearch(searchInput)}
        />
        <Button label="Search" variant="secondary" onPress={() => setSearch(searchInput)} />
      </View>
      <View style={styles.chips}>
        {(['all', 'vip', 'new', 'inactive'] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            style={({ hovered }) => [
              styles.chip,
              {
                backgroundColor:
                  filter === value ? colors.primary : hovered ? colors.surfaceHover : colors.surface,
                borderColor: filter === value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.xs,
                { color: filter === value ? colors.primaryText : colors.text, textTransform: 'capitalize' },
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <SkeletonGroup count={4} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="They’ll appear here after their first order."
          actionLabel="Clear filters"
          onAction={() => {
            setSearchInput('');
            setSearch('');
            setFilter('all');
          }}
        />
      ) : (
        <Table<CustomerListItem>
          selectable
          selectedKeys={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowPress={(row) => openCustomer(row.id)}
          columns={[
            {
              key: 'name',
              header: 'Name',
              flex: 1.2,
              sortable: true,
              sortValue: (row) => row.name,
              render: (row) => (
                <View style={styles.customer}>
                  <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                    <Text style={[typography.xs, { color: colors.text }]}>{initials(row.name)}</Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>{row.name}</Text>
                </View>
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
              minWidth: 104,
              sortable: true,
              sortValue: (row) => row.totalSpendCents ?? 0,
              render: (row) => <Money cents={row.totalSpendCents ?? 0} size="small" />,
            },
            {
              key: 'lastOrder',
              header: 'Last order',
              flex: 0.8,
              render: (row) => (
                <Text style={{ color: colors.textMuted }}>
                  {row.lastOrderAt ? formatRelativeDate(row.lastOrderAt) : 'Never'}
                </Text>
              ),
            },
            {
              key: 'status',
              header: 'Loyalty',
              flex: 0.6,
              render: (row) => {
                const isVip = (row.totalSpendCents ?? 0) >= 10000;
                const isActive = (row.orderCount ?? 0) > 0;
                return (
                  <Badge
                    label={isVip ? 'VIP' : isActive ? 'Active' : 'Inactive'}
                    variant={isVip ? 'outline' : isActive ? 'success' : 'neutral'}
                  />
                );
              },
            },
          ]}
          data={customers}
          keyExtractor={(row) => row.id}
        />
      )}
      <CustomerDrawer customerId={selectedCustomerId} onClose={closeCustomer} />
    </ScrollView>
  );
}

function CustomerDrawer({ customerId, onClose }: { customerId?: string; onClose: () => void }) {
  const { colors } = useTheme();
  const detail = useCustomerDetail(customerId ?? '');
  const [notes, setNotes] = useState('');
  useEffect(() => setNotes(detail.customer?.notes ?? ''), [detail.customer?.notes]);

  return (
    <Drawer visible={!!customerId} title={detail.customer?.name ?? 'Customer'} onClose={onClose} width={480}>
      {detail.isLoading ? (
        <SkeletonGroup count={5} />
      ) : detail.isError || !detail.customer ? (
        <ErrorState onRetry={detail.refetch} message="Customer details could not be loaded." />
      ) : (
        <>
          <View style={styles.summary}>
            <View style={[styles.avatarLarge, { backgroundColor: colors.surface }]}>
              <Text style={[typography.lg, { color: colors.text }]}>{initials(detail.customer.name)}</Text>
            </View>
            <View>
              <Text style={[typography.lg, { color: colors.text }]}>{detail.customer.name}</Text>
              <Text style={[typography.sm, { color: colors.textMuted }]}>
                {detail.customer.email ?? 'No email'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View>
              <Text style={[typography.xs, { color: colors.textMuted }]}>TOTAL SPENT</Text>
              <Money cents={detail.customer.totalSpendCents ?? 0} />
            </View>
            <View>
              <Text style={[typography.xs, { color: colors.textMuted }]}>ORDERS</Text>
              <Text style={[typography.lg, { color: colors.text }]}>{detail.customer.orderCount ?? 0}</Text>
            </View>
          </View>
          <Card title="Order history">
            {detail.orders.length ? (
              <Timeline
                entries={detail.orders.map((order) => ({
                  id: order.id,
                  label: `${order.orderNumber} · ${order.status.replaceAll('_', ' ')}`,
                  timestamp: formatDateTime(order.createdAt),
                  detail: <Money cents={order.totalCents} size="small" />,
                  tone: order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'default',
                }))}
              />
            ) : (
              <Text style={[typography.sm, { color: colors.textMuted }]}>No order history yet.</Text>
            )}
          </Card>
          <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
          <Button
            label="Save notes"
            loading={detail.isSaving}
            onPress={() => detail.save({ notes: notes || null })}
          />
        </>
      )}
    </Drawer>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1 },
  customer: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarLarge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  summaryStats: { flexDirection: 'row', gap: spacing[8] },
});
