'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
  themes: ['light', 'dark'],
  systemTheme: 'light'
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
}

export default function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'light',
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = false,
  storageKey = 'theme',
  themes = ['light', 'dark']
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<string>('light');

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) || defaultTheme;
    setThemeState(stored);

    if (enableSystem) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemTheme(mq.matches ? 'dark' : 'light');
    }
  }, [defaultTheme, enableSystem, storageKey]);

  // Apply attribute to <html>
  useEffect(() => {
    const resolved = theme === 'system' && enableSystem ? systemTheme : theme;

    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          '*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
        )
      );
      document.head.appendChild(css);

      applyAttribute(resolved);

      getComputedStyle(document.body).height; // force reflow
      setTimeout(() => document.head.removeChild(css), 1);
    } else {
      applyAttribute(resolved);
    }

    if (enableColorScheme) {
      document.documentElement.style.colorScheme =
        resolved === 'light' || resolved === 'dark' ? resolved : '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, systemTheme]);

  function applyAttribute(resolved: string) {
    if (attribute === 'class') {
      document.documentElement.classList.remove(...themes);
      if (resolved) document.documentElement.classList.add(resolved);
    } else {
      if (resolved) {
        document.documentElement.setAttribute(attribute, resolved);
      } else {
        document.documentElement.removeAttribute(attribute);
      }
    }
  }

  // System theme listener
  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [enableSystem]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const setTheme = useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (_) {}
    },
    [storageKey]
  );

  const resolvedTheme = theme === 'system' && enableSystem ? systemTheme : theme;

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      systemTheme
    }),
    [theme, setTheme, resolvedTheme, enableSystem, themes, systemTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
