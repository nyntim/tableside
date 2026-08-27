import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, shadows, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  show: (message: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: Omit<ToastMessage, 'id'>) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { ...message, id }]);
      const duration = message.duration ?? 4000;
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  const { colors } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => {
        const variantColor = getVariantColor(colors, toast.variant ?? 'default');
        return (
          <Pressable
            key={toast.id}
            onPress={() => onDismiss(toast.id)}
            style={[
              styles.toast,
              shadows.md,
              { backgroundColor: colors.surface, borderLeftColor: variantColor, borderColor: colors.border },
            ]}
          >
            <Text style={[typography.sm, { color: colors.text, fontWeight: '600' }]}>{toast.title}</Text>
            {toast.description ? (
              <Text style={[typography.xs, { color: colors.textMuted, marginTop: spacing[1] }]}>
                {toast.description}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function getVariantColor(
  colors: ReturnType<typeof useTheme>['colors'],
  variant: ToastVariant,
) {
  switch (variant) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    default:
      return colors.info;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing[6],
    right: spacing[4],
    left: spacing[4],
    zIndex: 9999,
    gap: spacing[2],
    alignItems: 'flex-end',
  },
  toast: {
    maxWidth: 360,
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing[3],
  },
});

export { ToastProvider as ToasterProvider };
