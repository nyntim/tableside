import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();
  const variantColors = getVariantColors(colors, variant);

  return (
    <View style={[styles.badge, { backgroundColor: variantColors.bg }, style]}>
      <Text style={[typography.xs, { color: variantColors.text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

function getVariantColors(
  colors: ReturnType<typeof useTheme>['colors'],
  variant: BadgeVariant,
) {
  switch (variant) {
    case 'success':
      return { bg: '#dcfce7', text: colors.success };
    case 'warning':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'error':
      return { bg: '#fee2e2', text: colors.error };
    case 'info':
      return { bg: '#dbeafe', text: colors.info };
    default:
      return { bg: colors.surfaceMuted, text: colors.textMuted };
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
});
