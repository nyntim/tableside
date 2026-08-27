import React from 'react';
import { Text, type TextProps } from 'react-native';
import { formatMoney } from '@odyssey/shared';
import { typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type MoneyTextProps = TextProps & {
  cents: number;
  currency?: string;
  emphasize?: boolean;
};

export function MoneyText({ cents, currency = 'USD', emphasize, style, ...rest }: MoneyTextProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        emphasize ? typography.lg : typography.base,
        { color: colors.text, fontWeight: emphasize ? '700' : '500', fontVariant: ['tabular-nums'] },
        style,
      ]}
      {...rest}
    >
      {formatMoney(cents, currency)}
    </Text>
  );
}
