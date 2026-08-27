export const palette = {
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
  brand50: '#fff7ed',
  brand100: '#ffedd5',
  brand200: '#fed7aa',
  brand300: '#fdba74',
  brand400: '#fb923c',
  brand500: '#f97316',
  brand600: '#ea580c',
  brand700: '#c2410c',
  green500: '#22c55e',
  green600: '#16a34a',
  amber500: '#f59e0b',
  red500: '#ef4444',
  red600: '#dc2626',
  blue500: '#3b82f6',
  white: '#ffffff',
  black: '#000000',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  xs: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  sm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  base: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  lg: { fontSize: 18, lineHeight: 28, fontWeight: '500' as const },
  xl: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  '2xl': { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  '3xl': { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 960,
  lg: 1200,
} as const;

export type ThemeMode = 'light' | 'dark';

export type SemanticColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  success: string;
  warning: string;
  error: string;
  info: string;
};

export const lightTheme: SemanticColors = {
  background: palette.slate50,
  surface: palette.white,
  surfaceMuted: palette.slate100,
  border: palette.slate200,
  text: palette.slate900,
  textMuted: palette.slate500,
  textInverse: palette.white,
  primary: palette.brand600,
  primaryHover: palette.brand700,
  primaryText: palette.white,
  success: palette.green600,
  warning: palette.amber500,
  error: palette.red600,
  info: palette.blue500,
};

export const darkTheme: SemanticColors = {
  background: palette.slate950,
  surface: palette.slate900,
  surfaceMuted: palette.slate800,
  border: palette.slate700,
  text: palette.slate50,
  textMuted: palette.slate400,
  textInverse: palette.slate900,
  primary: palette.brand500,
  primaryHover: palette.brand400,
  primaryText: palette.slate950,
  success: palette.green500,
  warning: palette.amber500,
  error: palette.red500,
  info: palette.blue500,
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8' },
  preparing: { bg: '#ede9fe', text: '#6d28d9' },
  ready: { bg: '#dcfce7', text: '#15803d' },
  out_for_delivery: { bg: '#cffafe', text: '#0e7490' },
  completed: { bg: '#ecfdf5', text: '#047857' },
  cancelled: { bg: '#fee2e2', text: '#b91c1c' },
  rejected: { bg: '#fecaca', text: '#991b1b' },
};
