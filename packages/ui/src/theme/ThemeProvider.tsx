import React, { createContext, useContext, useMemo } from 'react';
import { lightTheme, type SemanticColors } from './tokens';

type ThemeContextValue = {
  colors: SemanticColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ colors: lightTheme }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
