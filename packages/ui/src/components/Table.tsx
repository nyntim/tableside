import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type TableColumn<T> = {
  key: string;
  header: string;
  flex?: number;
  render: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
};

export function Table<T>({ columns, data, keyExtractor, emptyMessage = 'No data' }: TableProps<T>) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Text style={[typography.sm, { color: colors.textMuted }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <View style={[styles.table, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.row, styles.headerRow, { backgroundColor: colors.surfaceMuted }]}>
          {columns.map((column) => (
            <View key={column.key} style={[styles.cell, { flex: column.flex ?? 1 }]}>
              <Text style={[typography.sm, { color: colors.textMuted, fontWeight: '600' }]}>
                {column.header}
              </Text>
            </View>
          ))}
        </View>
        {data.map((row) => (
          <View
            key={keyExtractor(row)}
            style={[styles.row, { borderTopColor: colors.border }]}
          >
            {columns.map((column) => (
              <View key={column.key} style={[styles.cell, { flex: column.flex ?? 1 }]}>
                {column.render(row)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    minWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 0,
  },
  headerRow: {
    borderTopWidth: 0,
  },
  cell: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    justifyContent: 'center',
  },
  empty: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[6],
    alignItems: 'center',
  },
});
