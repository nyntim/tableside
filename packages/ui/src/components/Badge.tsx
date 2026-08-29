import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type BadgeVariant = 'default' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();
  const variantColors = getVariantColors(colors, variant);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
          borderWidth: variantColors.border === 'transparent' ? 0 : 1,
        },
        style,
      ]}
    >
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
      return { bg: colors.success, text: palette.sidebar, border: 'transparent' };
    case 'warning':
      return { bg: colors.warning, text: palette.sidebar, border: 'transparent' };
    case 'error':
      return { bg: colors.error, text: colors.text, border: 'transparent' };
    case 'info':
      return { bg: colors.info, text: palette.sidebar, border: 'transparent' };
    case 'outline':
      return { bg: 'transparent', text: colors.textMuted, border: colors.border };
    default:
      return { bg: colors.surface, text: colors.textMuted, border: colors.border };
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
