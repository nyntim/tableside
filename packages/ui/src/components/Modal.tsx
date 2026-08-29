import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ModalProps as RNModalProps,
} from 'react-native';
import { palette, radius, shadows, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

export type ModalProps = Pick<RNModalProps, 'visible' | 'onRequestClose'> & {
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
};

export function Modal({
  visible,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onRequestClose,
  loading,
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose}>
      <Pressable style={[styles.overlay, { backgroundColor: palette.overlay }]} onPress={onRequestClose}>
        <Pressable
          style={[
            styles.content,
            shadows.md,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[typography.xl, { color: colors.text }]}>{title}</Text>
          <View style={styles.body}>{children}</View>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="ghost" onPress={onCancel ?? onRequestClose} />
            {onConfirm ? (
              <Button label={confirmLabel} loading={loading} onPress={onConfirm} />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  content: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[6],
    gap: spacing[4],
  },
  body: {
    gap: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
});
