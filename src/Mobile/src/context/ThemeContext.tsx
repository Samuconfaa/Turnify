import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { TOKENS, ThemeTokens } from '@/constants/tokens';

interface ThemeContextValue {
  t: ThemeTokens;
  dark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  t: TOKENS.light,
  dark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const t = dark ? TOKENS.dark : TOKENS.light;
  return (
    <ThemeContext.Provider value={{ t, dark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
