import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Card,
  ErrorState,
  Input,
  Modal,
  Money,
  SkeletonGroup,
  StatusBadge,
  Timeline,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { getFulfillmentLabel, isDestructiveAction } from '@tableside/shared';
import { useOrderDetail, useOrderRouteParams } from '@/features/orders/useOrders';

export default function OrderDetailScreen() {
  const router = useRouter();
  const orderId = useOrderRouteParams();
  const { colors } = useTheme();
  const { order, isLoading, isError, refetch, allowedActions, performTransition, isTransitioning, timelineEntries } =
    useOrderDetail(orderId);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading || !order) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <SkeletonGroup count={6} />
      </View>
    );
  }

  const needsReason = pendingAction === 'cancel' || pendingAction === 'reject';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Button label="← Back to orders" variant="ghost" onPress={() => router.back()} />

      <View style={styles.header}>
        <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>{order.orderNumber}</Text>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.actions}>
        {allowedActions.map(({ action, label }) => (
          <Button
            key={action}
            label={label}
            variant={isDestructiveAction(action) ? 'danger' : 'primary'}
            onPress={() => setPendingAction(action)}
          />
        ))}
      </View>

      <Card title="Summary">
        <Text style={{ color: colors.textMuted }}>Customer: {order.customer.name}</Text>
        <Text style={{ color: colors.textMuted }}>
          Fulfillment: {getFulfillmentLabel(order.fulfillmentType)}
        </Text>
        <Money cents={order.totalCents} emphasize style={{ marginTop: spacing[2] }} />
      </Card>

      <Card title="Items">
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={{ color: colors.text, flex: 1 }}>
              {item.quantity}× {item.nameSnapshot}
            </Text>
            <Money cents={item.lineTotalCents} />
          </View>
        ))}
      </Card>

      <Card title="Timeline">
        <Timeline entries={timelineEntries} />
      </Card>

      <Modal
        visible={!!pendingAction}
        title={`Confirm ${pendingAction}`}
        onRequestClose={() => setPendingAction(null)}
        onCancel={() => setPendingAction(null)}
        onConfirm={async () => {
          if (pendingAction) {
            await performTransition(pendingAction, reason || undefined);
            setPendingAction(null);
            setReason('');
          }
        }}
        loading={isTransitioning}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  loading: {
    padding: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
  },
});
