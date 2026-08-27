import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon}
      <Text style={[typography.lg, { color: colors.text, fontWeight: '600', textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.sm, { color: colors.textMuted, textAlign: 'center' }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
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
