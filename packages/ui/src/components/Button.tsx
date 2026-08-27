import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useInteractionState } from '../hooks';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const { hovered, pressed, focused, handlers } = useInteractionState(isDisabled);

  const variantStyles = getVariantStyles(colors, variant, hovered, pressed);
  const sizeStyles = SIZE_STYLES[size];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        focused && { borderColor: colors.info, borderWidth: 2 },
        style,
      ]}
      {...handlers}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text style={[styles.label, sizeStyles.text, { color: variantStyles.textColor }]}>
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

function getVariantStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  variant: ButtonVariant,
  hovered: boolean,
  pressed: boolean,
) {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: hovered || pressed ? colors.surfaceMuted : colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
        textColor: colors.text,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: hovered || pressed ? colors.surfaceMuted : 'transparent',
        },
        textColor: colors.text,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: pressed ? colors.error : hovered ? '#b91c1c' : colors.error,
        },
        textColor: colors.textInverse,
      };
    default:
      return {
        container: {
          backgroundColor: pressed ? colors.primaryHover : hovered ? colors.primaryHover : colors.primary,
        },
        textColor: colors.primaryText,
      };
  }
}

const SIZE_STYLES = {
  sm: {
    container: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], minHeight: 32 },
    text: typography.sm,
  },
  md: {
    container: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], minHeight: 40 },
    text: typography.base,
  },
  lg: {
    container: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], minHeight: 48 },
    text: typography.lg,
  },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  label: {
    fontWeight: '600',
  },
});
