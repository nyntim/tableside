import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatRelativeDate } from '@tableside/shared';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Money,
  Sparkline,
  SkeletonGroup,
  StatusBadge,
  Table,
  radius,
  spacing,
  typography,
  useResponsive,
  useTheme,
} from '@tableside/ui';
import { useHomeMetrics } from '@/features/home/useHomeMetrics';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useResponsive();
  const [recentFilter, setRecentFilter] = useState<'recent' | 'pending' | 'today'>('recent');
  const {
    metrics,
    recentOrders,
    lowAvailabilityItems,
    settings,
    isLoading,
    isError,
    refetch,
    range,
    setRange,
  } = useHomeMetrics();
  const filteredOrders = useMemo(
    () =>
      recentOrders.filter((order) => {
        if (recentFilter === 'pending') return order.status === 'pending';
        if (recentFilter === 'today') {
          return new Date(order.createdAt).toDateString() === new Date().toDateString();
        }
        return true;
      }),
    [recentFilter, recentOrders],
  );
  const statusCount = (status: string) =>
    metrics?.ordersByStatus.find((entry) => entry.status === status)?.count ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography['3xl'], { color: colors.text }]}>Good morning</Text>
          <Text style={[typography.sm, { color: colors.textMuted }]}>
            Here’s what’s happening at Tableside Kitchen.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button label="New Order" onPress={() => router.push('/orders?new=1' as never)} />
          <Button label="Add Menu Item" variant="secondary" onPress={() => router.push('/menu?new=1' as never)} />
        </View>
      </View>

      {isError ? <ErrorState onRetry={refetch} message="Dashboard data could not be loaded." /> : null}

      {isLoading || !metrics ? (
        <SkeletonGroup count={4} />
      ) : (
        <>
          <View style={styles.hero}>
            <Card style={styles.chartCard}>
              <View style={styles.cardHeading}>
                <View>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>REVENUE</Text>
                  <Money cents={metrics.totalRevenueCents} emphasize />
                </View>
                <View style={styles.rangeRow}>
                  {(['7d', '30d'] as const).map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => setRange(value)}
                        style={({ hovered }) => [
                        styles.rangeChip,
                        {
                          backgroundColor:
                            range === value
                              ? colors.primary
                              : hovered
                                ? colors.surfaceHover
                                : colors.surface,
                          borderColor: range === value ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.xs,
                          { color: range === value ? colors.primaryText : colors.textMuted },
                        ]}
                      >
                        {value === '7d' ? '7 days' : '30 days'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Sparkline
                values={metrics.revenueByDay.map((entry) => entry.revenueCents)}
                width={Math.max(240, Math.min(620, width - 400))}
              />
            </Card>
            <Card title="Today" style={styles.todayCard}>
              {(['pending', 'preparing', 'ready', 'completed'] as const).map((status) => (
                <View key={status} style={styles.todayRow}>
                  <Text style={[typography.sm, { color: colors.textMuted, textTransform: 'capitalize' }]}>
                    {status}
                  </Text>
                  <Text style={[typography.lg, { color: colors.text }]}>{statusCount(status)}</Text>
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.summaryRow}>
            <Card title="Popular Items" style={styles.summaryCard}>
              {metrics.popularItems.slice(0, 4).map((item, index) => (
                <View key={item.menuItemId} style={styles.listRow}>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>{index + 1}</Text>
                  <Text style={[typography.sm, { color: colors.text, flex: 1 }]}>{item.name}</Text>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>{item.quantitySold}</Text>
                </View>
              ))}
            </Card>
            <Card title="Avg Prep Time" style={styles.summaryCard}>
              <Text style={[typography['3xl'], { color: colors.text }]}>
                {settings?.prepTimeMinutes ?? 0}
                <Text style={[typography.sm, { color: colors.textMuted }]}> min</Text>
              </Text>
              <Text style={[typography.xs, { color: colors.textMuted }]}>Target preparation window</Text>
            </Card>
            <Card title="Low Availability" style={styles.summaryCard}>
              <Text style={[typography['3xl'], { color: lowAvailabilityItems.length ? colors.warning : colors.text }]}>
                {lowAvailabilityItems.length}
              </Text>
              <Text style={[typography.sm, { color: colors.primary }]} onPress={() => router.push('/menu' as never)}>
                Review menu →
              </Text>
            </Card>
          </View>

          <Text style={[typography.lg, { color: colors.text }]}>Order flow</Text>
          <View style={styles.flowRow}>
            <Card title="New Orders" style={styles.flowCard}>
              <Text style={[typography['3xl'], { color: colors.text }]}>{statusCount('pending')}</Text>
              <Text style={[typography.xs, { color: colors.textMuted }]}>Awaiting confirmation</Text>
              {metrics.popularItems.slice(0, 3).map((item) => (
                <View key={item.menuItemId} style={styles.listRow}>
                  <Text style={[typography.sm, { color: colors.text, flex: 1 }]}>{item.name}</Text>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>{item.quantitySold}</Text>
                </View>
              ))}
            </Card>
            <Card title="Completed Today" style={styles.flowCard}>
              <Text style={[typography['3xl'], { color: colors.success }]}>{statusCount('completed')}</Text>
              <Text style={[typography.xs, { color: colors.textMuted }]}>Successfully fulfilled</Text>
              <Money cents={metrics.totalRevenueCents} size="medium" />
            </Card>
          </View>

          <Card title="Recent Orders">
            <View style={styles.rangeRow}>
              {(['recent', 'pending', 'today'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setRecentFilter(filter)}
                  style={({ hovered }) => [
                    styles.rangeChip,
                    {
                      backgroundColor:
                        recentFilter === filter
                          ? colors.primary
                          : hovered
                            ? colors.surfaceHover
                            : colors.surface,
                      borderColor: recentFilter === filter ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[typography.xs, { color: recentFilter === filter ? colors.primaryText : colors.textMuted, textTransform: 'capitalize' }]}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
            {filteredOrders.length ? (
              <Table
                data={filteredOrders}
                keyExtractor={(order) => order.id}
                onRowPress={(order) => router.push(`/orders?selected=${order.id}` as never)}
                columns={[
                  { key: 'number', header: 'Order', render: (order) => <Text style={{ color: colors.text }}>{order.orderNumber}</Text> },
                  { key: 'status', header: 'Status', render: (order) => <StatusBadge status={order.status} /> },
                  { key: 'total', header: 'Total', render: (order) => <Money cents={order.totalCents} size="small" /> },
                  { key: 'time', header: 'Placed', render: (order) => <Text style={{ color: colors.textMuted }}>{formatRelativeDate(order.createdAt)}</Text> },
                ]}
              />
            ) : (
              <EmptyState title="No matching recent orders" actionLabel="View all orders" onAction={() => router.push('/orders' as never)} />
            )}
          </Card>
        </>
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[4],
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  rangeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  rangeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  chartCard: { flex: 2, minWidth: 280 },
  todayCard: { flex: 1, minWidth: 240 },
  cardHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3] },
  todayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  summaryCard: { flex: 1, minWidth: 220 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  flowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  flowCard: { flex: 1, minWidth: 280 },
});
