import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type TimelineEntry = {
  id: string;
  label: string;
  timestamp?: string;
  detail?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'error';
};

export type TimelineProps = {
  entries: TimelineEntry[];
};

/** Shared rail timeline for lifecycle stages (Orders) and per-record feeds (CRM). */
export function Timeline({ entries }: TimelineProps) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="list">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const dotColor =
          entry.tone === 'success'
            ? colors.success
            : entry.tone === 'warning'
              ? colors.warning
              : entry.tone === 'error'
                ? colors.error
                : colors.textMuted;
        return (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor, borderColor: colors.surface }]} />
              <View
                style={[
                  styles.line,
                  { backgroundColor: colors.border, opacity: isLast ? 0 : 1 },
                ]}
              />
            </View>
            <View style={styles.content}>
              <View style={styles.heading}>
                <Text style={[typography.sm, styles.label, { color: colors.text }]}>
                  {entry.label}
                </Text>
                {entry.timestamp ? (
                  <Text style={[typography.xs, { color: colors.textMuted }]}>
                    {entry.timestamp}
                  </Text>
                ) : null}
              </View>
              {typeof entry.detail === 'string' ? (
                <Text style={[typography.xs, { color: colors.textMuted }]}>{entry.detail}</Text>
              ) : (
                entry.detail
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    flexDirection: 'row',
    minHeight: 56,
    alignItems: 'stretch',
  },
  rail: {
    width: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    borderWidth: 2,
    zIndex: 1,
  },
  line: {
    width: 2,
    flexGrow: 1,
    minHeight: 24,
    marginTop: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingLeft: spacing[2],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  label: {
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
});
