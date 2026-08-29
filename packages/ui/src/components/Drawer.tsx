import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { palette, shadows, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type DrawerProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export function Drawer({ visible, title, onClose, children, width = 400, style }: DrawerProps) {
  const { colors } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={onClose} />
        <View
          style={[
            styles.panel,
            shadows.md,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              width,
              maxWidth: '100%',
            },
            style,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            {title ? (
              <Text style={[typography.lg, { color: colors.text, flex: 1 }]}>{title}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={[typography.lg, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.body} contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderLeftWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
    flexGrow: 1,
  },
});
