import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  ErrorState,
  MoneyText,
  SkeletonGroup,
  StatCard,
  spacing,
  typography,
  useTheme,
} from '@odyssey/ui';
import { useHomeMetrics } from '@/features/home/useHomeMetrics';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { metrics, isLoading, isError, refetch, range, setRange } = useHomeMetrics();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>Dashboard</Text>
        <Text style={[typography.sm, { color: colors.textMuted }]}>
          Key performance indicators for your restaurant
        </Text>
      </View>

      <View style={styles.rangeRow}>
        {(['today', '7d', '30d'] as const).map((value) => (
          <Text
            key={value}
            onPress={() => setRange(value)}
            style={[
              typography.sm,
              styles.rangeChip,
              {
                color: range === value ? colors.primaryText : colors.text,
                backgroundColor: range === value ? colors.primary : colors.surfaceMuted,
              },
            ]}
          >
            {value === 'today' ? 'Today' : value === '7d' ? '7 days' : '30 days'}
          </Text>
        ))}
      </View>

      {isLoading || !metrics ? (
        <SkeletonGroup count={4} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard label="Total orders" value={metrics.totalOrders} />
            <StatCard
              label="Revenue"
              value={<MoneyText cents={metrics.totalRevenueCents} emphasize />}
            />
            <StatCard label="Pending" value={metrics.pendingOrders} />
            <StatCard
              label="Avg order value"
              value={<MoneyText cents={metrics.averageOrderValueCents} />}
            />
          </View>

          <Card title="Popular items">
            {metrics.popularItems.slice(0, 5).map((item) => (
              <View key={item.menuItemId} style={styles.listRow}>
                <Text style={[typography.sm, { color: colors.text, flex: 1 }]}>{item.name}</Text>
                <Text style={[typography.sm, { color: colors.textMuted }]}>
                  {item.quantitySold} sold
                </Text>
                <MoneyText cents={item.revenueCents} style={{ marginLeft: spacing[3] }} />
              </View>
            ))}
          </Card>

          <Card title="Orders by status">
            <View style={styles.statusGrid}>
              {metrics.ordersByStatus.map((entry) => (
                <View key={entry.status} style={[styles.statusCell, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>{entry.status}</Text>
                  <Text style={[typography.lg, { color: colors.text, fontWeight: '700' }]}>
                    {entry.count}
                  </Text>
                </View>
              ))}
            </View>
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
    gap: spacing[1],
  },
  rangeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  rangeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statusCell: {
    padding: spacing[3],
    borderRadius: 8,
    minWidth: 100,
  },
});
