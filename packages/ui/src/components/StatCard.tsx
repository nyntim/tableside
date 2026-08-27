import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadows, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: string;
  trendUp?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, hint, trend, trendUp, style }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadows.sm,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[typography.sm, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography['2xl'], { color: colors.text, marginTop: spacing[1] }]}>{value}</Text>
      {hint ? (
        <Text style={[typography.xs, { color: colors.textMuted, marginTop: spacing[1] }]}>{hint}</Text>
      ) : null}
      {trend ? (
        <Text
          style={[
            typography.xs,
            {
              color: trendUp === false ? colors.error : colors.success,
              marginTop: spacing[2],
              fontWeight: '600',
            },
          ]}
        >
          {trend}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[4],
    minWidth: 160,
    flex: 1,
  },
});
