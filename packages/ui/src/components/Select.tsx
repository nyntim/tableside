import React, { useState } from 'react';
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
import { palette, radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export type SelectProps<T extends string = string> = {
  label?: string;
  value?: T;
  options: SelectOption<T>[];
  placeholder?: string;
  onChange: (value: T) => void;
  disabled?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Select<T extends string = string>({
  label,
  value,
  options,
  placeholder = 'Select…',
  onChange,
  disabled,
  error,
  containerStyle,
}: SelectProps<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, typography.sm, { color: colors.text }]}>{label}</Text>
      ) : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[typography.base, { color: selected ? colors.text : colors.textMuted }]}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={{ color: colors.textMuted }}>▾</Text>
      </Pressable>
      {error ? (
        <Text style={[typography.xs, { color: colors.error }]}>{error}</Text>
      ) : null}

      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: palette.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    option.value === value && { backgroundColor: colors.surfaceHover },
                  ]}
                >
                  <Text style={[typography.base, { color: colors.text }]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  label: {
    fontWeight: '500',
  },
  trigger: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  sheet: {
    borderRadius: radius.lg,
    borderWidth: 1,
    maxHeight: 320,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
});
