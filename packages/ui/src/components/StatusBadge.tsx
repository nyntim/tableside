import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, statusColors, typography } from '../theme/tokens';
import { getStatusLabel, type OrderStatus } from '@tableside/types/order-state-machine';
import { useTheme } from '../theme/ThemeProvider';

export type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors: themeColors } = useTheme();
  const colors = statusColors[status] ?? { bg: themeColors.surfaceMuted, text: themeColors.textMuted };
  const label = getStatusLabel(status as OrderStatus);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: themeColors.border },
      ]}
    >
      <Text style={[typography.xs, { color: colors.text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
