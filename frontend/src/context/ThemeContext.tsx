import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'cosmic';

const STORAGE_KEY = 'sportportal_theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove('theme-light', 'theme-cosmic');
  if (theme === 'light') el.classList.add('theme-light');
  else if (theme === 'cosmic') el.classList.add('theme-cosmic');
}

export function getInitialTheme(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
