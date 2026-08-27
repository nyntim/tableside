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
import { radius, shadows, spacing, typography } from '../theme/tokens';
import { useResponsive } from '../hooks';
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
  const { isDesktop } = useResponsive();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.panel,
            shadows.md,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              width: isDesktop ? width : '100%',
              maxWidth: '100%',
            },
            !isDesktop && styles.panelMobile,
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
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    borderLeftWidth: 1,
    height: '100%',
  },
  panelMobile: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: 'auto',
    maxHeight: '90%',
    borderLeftWidth: 0,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
});
