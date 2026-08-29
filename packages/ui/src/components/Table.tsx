import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

function isInteractiveTarget(event: { nativeEvent?: { target?: unknown }; target?: unknown }) {
  const target = (event as { target?: { closest?: (selector: string) => unknown } }).target
    ?? (event.nativeEvent as { target?: { closest?: (selector: string) => unknown } } | undefined)?.target;
  if (target && typeof target.closest === 'function') {
    return Boolean(
      target.closest('input, button, [role="checkbox"], [role="switch"], [role="combobox"]'),
    );
  }
  return false;
}

export type TableColumn<T> = {
  key: string;
  header: string;
  flex?: number;
  minWidth?: number;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRowPress?: (row: T) => void;
  rowHasError?: (row: T) => boolean;
};

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data',
  selectable,
  selectedKeys = [],
  onSelectionChange,
  onRowPress,
  rowHasError,
}: TableProps<T>) {
  const { colors } = useTheme();
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const sortedData = [...data].sort((a, b) => {
    if (!sort) return 0;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return 0;
    const aValue = column.sortValue(a);
    const bValue = column.sortValue(b);
    const result =
      typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue));
    return sort.direction === 'asc' ? result : -result;
  });
  const allSelected = data.length > 0 && data.every((row) => selectedKeys.includes(keyExtractor(row)));
  const toggleSelection = (key: string) =>
    onSelectionChange?.(
      selectedKeys.includes(key)
        ? selectedKeys.filter((selectedKey) => selectedKey !== key)
        : [...selectedKeys, key],
    );

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Text style={[typography.sm, { color: colors.textMuted }]}>{emptyMessage}</Text>
      </View>
    );
  }

  const cellStyle = (column: TableColumn<T>) => [
    styles.cell,
    {
      flex: column.flex ?? 1,
      minWidth: column.minWidth ?? 88,
    },
  ];

  return (
    <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
      <View style={[styles.table, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.row, styles.headerRow, { backgroundColor: colors.surface }]}>
          {selectable ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allSelected }}
              onPress={() =>
                onSelectionChange?.(allSelected ? [] : data.map((row) => keyExtractor(row)))
              }
              style={styles.checkboxCell}
            >
              <Text style={{ color: allSelected ? colors.primary : colors.textMuted }}>
                {allSelected ? '☑' : '☐'}
              </Text>
            </Pressable>
          ) : null}
          {columns.map((column) => (
            <Pressable
              key={column.key}
              disabled={!column.sortable}
              onPress={() =>
                setSort((current) => ({
                  key: column.key,
                  direction:
                    current?.key === column.key && current.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              style={[cellStyle(column), styles.headerCell]}
            >
              <Text style={[typography.sm, { color: colors.textMuted, fontWeight: '600' }]}>
                {column.header}
                {sort?.key === column.key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}
              </Text>
            </Pressable>
          ))}
        </View>
        {sortedData.map((row) => {
          const key = keyExtractor(row);
          const hasError = rowHasError?.(row) ?? false;
          const rowTone = [
            styles.row,
            { borderTopWidth: 1, borderTopColor: colors.border },
            hoveredKey === key && { backgroundColor: colors.surfaceHover },
            hasError && { borderLeftColor: colors.error, borderLeftWidth: 3 },
          ];
          return (
            <View key={key} style={rowTone}>
              {selectable ? (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedKeys.includes(key) }}
                  onPress={(event) => {
                    event?.stopPropagation?.();
                    toggleSelection(key);
                  }}
                  style={styles.checkboxCell}
                >
                  <Text style={{ color: selectedKeys.includes(key) ? colors.primary : colors.textMuted }}>
                    {selectedKeys.includes(key) ? '☑' : '☐'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={(event) => {
                  if (isInteractiveTarget(event)) return;
                  onRowPress?.(row);
                }}
                onHoverIn={() => setHoveredKey(key)}
                onHoverOut={() => setHoveredKey(null)}
                style={({ pressed }) => [styles.rowBody, pressed && { backgroundColor: colors.surfaceHover }]}
              >
                {columns.map((column) => (
                  <View key={column.key} style={cellStyle(column)}>
                    {column.render(row)}
                  </View>
                ))}
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    minWidth: '100%',
  },
  table: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: '100%',
    minWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
    borderTopWidth: 0,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    alignItems: 'stretch',
  },
  headerRow: {
    borderTopWidth: 0,
  },
  headerCell: {
    alignItems: 'flex-start',
  },
  checkboxCell: {
    width: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  empty: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[6],
    alignItems: 'center',
  },
});
