import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider, ToastProvider } from '@odyssey/ui';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
