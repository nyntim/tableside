import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  onDismiss,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <View style={[styles.container, { backgroundColor: palette.errorMuted, borderLeftColor: colors.error }]}>
      <Text style={[typography.lg, { color: colors.error }]}>△</Text>
      <View style={styles.copy}>
        <Text style={[typography.sm, { color: colors.text, fontWeight: '600' }]}>{title}</Text>
        <Text style={[typography.xs, { color: colors.textMuted }]}>{message}</Text>
      </View>
      {onRetry ? <Button label="Retry" variant="ghost" size="sm" onPress={onRetry} /> : null}
      <Pressable
        accessibilityLabel="Dismiss error"
        onPress={() => {
          setDismissed(true);
          onDismiss?.();
        }}
      >
        <Text style={[typography.sm, { color: colors.textMuted }]}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    borderLeftWidth: 3,
    borderRadius: radius.md,
  },
  copy: { flex: 1, gap: spacing[1] },
});
