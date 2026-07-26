'use client';

import { createContext, useContext, useState } from 'react';

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string;
  themes: string[];
  systemTheme: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  themes: ['light'],
  systemTheme: 'light'
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useState('light');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: () => {},
        resolvedTheme: theme,
        themes: ['light'],
        systemTheme: 'light'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
