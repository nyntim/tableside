import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({ label, error, hint, containerStyle, style, ...rest }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, typography.sm, { color: colors.text }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          typography.base,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : focused ? colors.primary : colors.border,
            borderWidth: focused ? 2 : 1,
            color: colors.text,
            opacity: rest.editable === false ? 0.55 : 1,
          },
          style,
        ]}
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
      />
      {error ? (
        <Text style={[styles.hint, typography.xs, { color: colors.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, typography.xs, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
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
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 44,
  },
  hint: {
    marginTop: spacing[1],
  },
});
