import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('accentColor');
    return (saved as AccentColor) || 'blue';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      if (theme === 'auto') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme === 'dark');
      }
    };

    updateDarkMode();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateDarkMode();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply accent color
    root.setAttribute('data-accent', accentColor);
  }, [isDark, accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    accentColor,
    isDark,
    setTheme,
    setAccentColor,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
