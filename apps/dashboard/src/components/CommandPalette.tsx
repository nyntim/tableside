import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Input, SkeletonGroup, palette as tokens, radius, spacing, typography, useTheme } from '@tableside/ui';
import {
  useCommandPalette,
  type SearchScope,
} from '@/features/search/useCommandPalette';

const SCOPES: Array<{ label: string; value: SearchScope }> = [
  { label: 'All', value: 'all' },
  { label: 'Orders', value: 'orders' },
  { label: 'Menu', value: 'menu' },
  { label: 'Customers', value: 'customers' },
  { label: 'Settings', value: 'settings' },
];

export function CommandPalette({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const palette = useCommandPalette();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [palette.query, palette.scope]);

  const open = (index: number) => {
    const result = palette.results[index];
    if (!result) return;
    palette.openResult(result);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: tokens.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Input
            autoFocus
            value={palette.query}
            onChangeText={palette.setQuery}
            placeholder="Search orders, menu, customers, settings…"
            accessibilityLabel="Global search"
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'ArrowDown') {
                setActiveIndex((current) => Math.min(current + 1, palette.results.length - 1));
              } else if (nativeEvent.key === 'ArrowUp') {
                setActiveIndex((current) => Math.max(current - 1, 0));
              } else if (nativeEvent.key === 'Enter') {
                open(activeIndex);
              } else if (nativeEvent.key === 'Escape') {
                onClose();
              }
            }}
          />
          <View style={styles.chips}>
            {SCOPES.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => palette.setScope(item.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      palette.scope === item.value ? colors.primary : colors.background,
                    borderColor: palette.scope === item.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.xs,
                    { color: palette.scope === item.value ? colors.primaryText : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.results}>
            {!palette.query ? (
              <>
                <Text style={[typography.xs, styles.eyebrow, { color: colors.textMuted }]}>
                  EXAMPLES
                </Text>
                {['Find order ORD-', 'Open low availability menu items', 'Edit restaurant hours'].map(
                  (example) => (
                    <Pressable key={example} onPress={() => palette.setQuery(example)}>
                      <Text style={[typography.sm, styles.result, { color: colors.text }]}>
                        {example}
                      </Text>
                    </Pressable>
                  ),
                )}
              </>
            ) : palette.isLoading ? (
              <SkeletonGroup count={3} />
            ) : palette.results.length ? (
              palette.results.map((result, index) => (
                <Pressable
                  key={result.id}
                  onHoverIn={() => setActiveIndex(index)}
                  onPress={() => open(index)}
                  style={[
                    styles.result,
                    index === activeIndex && { backgroundColor: colors.surfaceHover },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.sm, { color: colors.text, fontWeight: '600' }]}>
                      {result.title}
                    </Text>
                    <Text style={[typography.xs, { color: colors.textMuted }]}>
                      {result.subtitle}
                    </Text>
                  </View>
                  <Text style={[typography.xs, { color: colors.textMuted }]}>{result.scope}</Text>
                </Pressable>
              ))
            ) : (
              <Pressable onPress={palette.searchAllOrders} style={styles.result}>
                <Text style={[typography.sm, { color: colors.primary }]}>
                  Search all orders for “{palette.query}”
                </Text>
              </Pressable>
            )}
          </View>
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[typography.xs, { color: colors.textMuted }]}>
              ↑↓ Navigate · ↵ Open · Esc Close
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 96,
    paddingHorizontal: spacing[4],
  },
  dialog: {
    width: '100%',
    maxWidth: 640,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
  },
  results: { minHeight: 180, gap: spacing[1] },
  eyebrow: { letterSpacing: 1, marginBottom: spacing[1] },
  result: {
    padding: spacing[3],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  footer: { borderTopWidth: 1, paddingTop: spacing[3] },
});
