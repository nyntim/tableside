import {
  breakpoints as sharedBreakpoints,
  colors,
  elevation,
  radii,
  spacing as sharedSpacing,
  typography as sharedTypography,
} from '@tableside/shared';

export const palette = colors;

export const spacing = {
  ...sharedSpacing,
  5: 20,
  10: 40,
  16: 64,
} as const;

export const radius = {
  sm: radii.control,
  md: radii.control,
  lg: radii.card,
  xl: radii.card,
  full: radii.pill,
} as const;

export const typography = {
  xs: sharedTypography.metadata,
  sm: sharedTypography.body,
  base: { ...sharedTypography.body, fontSize: 16, lineHeight: 24 },
  lg: sharedTypography.section,
  xl: sharedTypography.money,
  '2xl': { ...sharedTypography.title, fontSize: 24, lineHeight: 30 },
  '3xl': sharedTypography.title,
} as const;

export const shadows = {
  sm: {},
  md: elevation.overlay,
} as const;

export const breakpoints = {
  sm: sharedBreakpoints.mobile,
  md: sharedBreakpoints.desktop,
  lg: sharedBreakpoints.wide,
} as const;

export type ThemeMode = 'light' | 'dark';

export type SemanticColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceHover: string;
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
  background: colors.canvas,
  surface: colors.surface,
  surfaceMuted: colors.surface,
  surfaceHover: colors.surfaceHover,
  border: colors.hairline,
  text: colors.textPrimary,
  textMuted: colors.textSecondary,
  textInverse: colors.sidebar,
  primary: colors.accent,
  primaryHover: colors.accentHover,
  primaryText: colors.sidebar,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.accent,
};

export const darkTheme: SemanticColors = lightTheme;

export const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: colors.surface, text: colors.warning },
  confirmed: { bg: colors.surface, text: colors.textSecondary },
  preparing: { bg: colors.surface, text: colors.warning },
  ready: { bg: colors.surface, text: colors.success },
  out_for_delivery: { bg: colors.surface, text: colors.textSecondary },
  completed: { bg: colors.surface, text: colors.success },
  cancelled: { bg: colors.errorMuted, text: colors.error },
  rejected: { bg: colors.errorMuted, text: colors.error },
};
