import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { statusColors, typography } from '../theme/tokens';
import { getStatusLabel } from '@odyssey/types';

export type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status] ?? { bg: '#e2e8f0', text: '#475569' };
  const label = getStatusLabel(status as Parameters<typeof getStatusLabel>[0]);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[typography.xs, { color: colors.text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
