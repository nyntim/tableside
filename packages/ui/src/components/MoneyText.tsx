import React from 'react';
import { Text, type TextProps } from 'react-native';
import { typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type MoneyProps = TextProps & {
  cents: number;
  currency?: string;
  emphasize?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export function Money({
  cents,
  currency = 'USD',
  emphasize,
  size = emphasize ? 'large' : 'medium',
  style,
  ...rest
}: MoneyProps) {
  const { colors } = useTheme();
  const absoluteCents = Math.abs(cents);
  const whole = Math.floor(absoluteCents / 100);
  const fraction = String(absoluteCents % 100).padStart(2, '0');
  const currencyPart =
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? '$';
  const wholeStyle =
    size === 'large' ? typography['3xl'] : size === 'small' ? typography.sm : typography.xl;
  const centsStyle = size === 'large' ? typography.sm : typography.xs;

  return (
    <Text
      style={[
        wholeStyle,
        { color: colors.text, fontWeight: '700', fontVariant: ['tabular-nums'] },
        style,
      ]}
      accessibilityLabel={new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
        cents / 100,
      )}
      {...rest}
    >
      {cents < 0 ? '−' : ''}
      {currencyPart}
      {whole.toLocaleString('en-US')}
      <Text
        style={[
          centsStyle,
          {
            color: colors.text,
            fontWeight: '700',
            position: 'relative',
            top: size === 'large' ? -7 : -4,
          },
        ]}
      >
        .{fraction}
      </Text>
    </Text>
  );
}

/** @deprecated Use Money. */
export const MoneyText = Money;
export type MoneyTextProps = MoneyProps;
