import { useEffect } from 'react';
import { useUIStore } from '../store';

/**
 * useTheme — applies the active theme to the DOM and keeps it in sync
 * with system preference changes.
 */
export function useTheme() {
  const themeMode = useUIStore((s) => s.theme.mode);
  const setThemeMode = useUIStore((s) => s.setThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (mode: 'light' | 'dark' | 'system') => {
      if (mode === 'system') {
        return mql.matches ? 'dark' : 'light';
      }
      return mode;
    };

    // Apply with smooth transition (TDesign dark mode = theme-mode attribute)
    root.classList.add('theme-transition');
    if (resolveTheme(themeMode) === 'dark') {
      root.setAttribute('theme-mode', 'dark');
    } else {
      root.removeAttribute('theme-mode');
    }

    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 600);

    return () => clearTimeout(timer);
  }, [themeMode]);

  // Listen to system preference changes when in "system" mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      if (mql.matches) {
        root.setAttribute('theme-mode', 'dark');
      } else {
        root.removeAttribute('theme-mode');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [themeMode]);

  return { themeMode, setThemeMode };
}
