import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '@/src/store';

// Radix UI foundation and Pillar color Hex codes will map here.
export type Theme = 'natural' | 'midnight' | 'emerald';
export type PillarStyles = Record<string, string>;

interface ThemeContextType {
  theme: Theme;
  // Extensible for specific pillar color overrides once Designer approves them
  pillarColors: PillarStyles | null; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { stats, appMode } = useAppStore();
  const theme = stats.activeTheme;
  const [pillarColors, setPillarColors] = useState<PillarStyles | null>(null);

  useEffect(() => {
    // Remove old hardcoded class toggles
    const root = window.document.documentElement;
    root.classList.remove('theme-natural', 'theme-midnight', 'theme-emerald', 'rpg-mode');
    
    // Inject semantic Tailwind variables/classes dynamically
    root.classList.add(`theme-${theme}`);
    
    if (appMode === 'rpg' || appMode === 'guild') {
      root.classList.add('rpg-mode');
    }
  }, [theme, appMode]);

  return (
    <ThemeContext.Provider value={{ theme, pillarColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
