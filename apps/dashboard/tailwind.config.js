const tokens = require('../../packages/shared/src/theme.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sidebar: tokens.colors.sidebar,
        canvas: tokens.colors.canvas,
        surface: tokens.colors.surface,
        'surface-hover': tokens.colors.surfaceHover,
        primary: tokens.colors.textPrimary,
        secondary: tokens.colors.textSecondary,
        hairline: tokens.colors.hairline,
        accent: tokens.colors.accent,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
      },
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([key, value]) => [key, `${value}px`]),
      ),
      borderRadius: {
        control: `${tokens.radii.control}px`,
        card: `${tokens.radii.card}px`,
        pill: `${tokens.radii.pill}px`,
      },
      fontSize: Object.fromEntries(
        Object.entries(tokens.fontSize).map(([key, value]) => [
          key,
          [`${value[0]}px`, { lineHeight: `${value[1]}px` }],
        ]),
      ),
      screens: Object.fromEntries(
        Object.entries(tokens.breakpoints).map(([key, value]) => [key, `${value}px`]),
      ),
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
