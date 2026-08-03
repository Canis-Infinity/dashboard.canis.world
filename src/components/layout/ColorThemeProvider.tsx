// @ts-nocheck
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { COLOR_THEMES, DEFAULT_COLOR_THEME } from '@/config/colorThemes';

const STORAGE_KEY = 'infinity-color-theme';
const ColorThemeContext = createContext(null);

function isKnownTheme(value) {
  return COLOR_THEMES.some((theme) => theme.value === value);
}

export function ColorThemeProvider({ children }) {
  const [colorTheme, setColorThemeState] = useState(DEFAULT_COLOR_THEME);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme = isKnownTheme(storedTheme) ? storedTheme : DEFAULT_COLOR_THEME;
    setColorThemeState(nextTheme);
    document.documentElement.dataset.colorTheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }, []);

  function setColorTheme(nextTheme) {
    const safeTheme = isKnownTheme(nextTheme) ? nextTheme : DEFAULT_COLOR_THEME;
    setColorThemeState(safeTheme);
    document.documentElement.dataset.colorTheme = safeTheme;
    window.localStorage.setItem(STORAGE_KEY, safeTheme);
  }

  const value = useMemo(() => ({ colorTheme, setColorTheme, colorThemes: COLOR_THEMES }), [colorTheme]);

  return <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>;
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error('useColorTheme must be used within ColorThemeProvider');
  }
  return context;
}
