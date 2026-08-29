import rawTheme from './theme.json';

export const colors = rawTheme.colors;
export const spacing = rawTheme.spacing;
export const radii = rawTheme.radii;

export const typography = {
  metadata: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  moneySmall: { fontSize: 14, lineHeight: 18, fontWeight: '700' as const },
  money: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
  moneyLarge: { fontSize: 32, lineHeight: 36, fontWeight: '700' as const },
} as const;

export const elevation = {
  overlay: {
    shadowColor: '#000000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

export const breakpoints = {
  ...rawTheme.breakpoints,
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  elevation,
  breakpoints,
} as const;

export type Theme = typeof theme;
