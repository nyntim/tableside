import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.lg, { color: colors.error, fontWeight: '600', textAlign: 'center' }]}>
        {title}
      </Text>
      <Text style={[typography.sm, { color: colors.textMuted, textAlign: 'center' }]}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[3],
  },
});
