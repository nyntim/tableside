import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type CardProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ title, subtitle, children, onPress, footer, style }: CardProps) {
  const { colors } = useTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? (
            <Text style={[typography.lg, { color: colors.text, fontWeight: '600' }]}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={[typography.sm, { color: colors.textMuted, marginTop: spacing[1] }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
      {children ? <View style={styles.body}>{children}</View> : null}
      {footer ? <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  body: {
    padding: spacing[4],
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing[4],
  },
});
