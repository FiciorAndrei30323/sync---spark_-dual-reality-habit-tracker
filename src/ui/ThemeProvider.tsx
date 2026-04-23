import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAppStore } from '@/src/store';
import { calculateVibrancy, getVibrancyCSSProperties, type VibrancyState } from '@/src/lib/vibrancy';

// Radix UI foundation and Pillar color Hex codes will map here.
export type Theme = 'natural' | 'midnight' | 'emerald';
export type PillarStyles = Record<string, string>;

interface ThemeContextType {
  theme: Theme;
  // Extensible for specific pillar color overrides once Designer approves them
  pillarColors: PillarStyles | null; 
  /** Dynamic Saturation state derived from 7-day trailing consistency */
  vibrancy: VibrancyState;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { stats, appMode, habits } = useAppStore();
  const theme = stats.activeTheme;

  // Calculate vibrancy from real habit data
  const vibrancy = useMemo(
    () => calculateVibrancy(habits),
    [habits]
  );

  // Generate the CSS property overrides for dynamic saturation
  const vibrancyCSS = useMemo(
    () => getVibrancyCSSProperties(vibrancy.factor),
    [vibrancy.factor]
  );

  useEffect(() => {
    // Remove old hardcoded class toggles
    const root = window.document.documentElement;
    root.classList.remove('theme-natural', 'theme-midnight', 'theme-emerald', 'rpg-mode');
    
    // Inject semantic Tailwind variables/classes dynamically
    root.classList.add(`theme-${theme}`);
    
    if (appMode === 'rpg' || appMode === 'guild') {
      root.classList.add('rpg-mode');
    }

    // Inject Dynamic Saturation CSS custom properties onto <html>
    // This scales all pillar colors and the accent by the user's vibrancy factor,
    // so the entire UI "wakes up" as the user proves consistency.
    for (const [prop, value] of Object.entries(vibrancyCSS)) {
      root.style.setProperty(prop, value as string);
    }

    // Cleanup: remove injected properties when dependencies change
    return () => {
      for (const prop of Object.keys(vibrancyCSS)) {
        root.style.removeProperty(prop);
      }
    };
  }, [theme, appMode, vibrancyCSS]);

  return (
    <ThemeContext.Provider value={{ theme, pillarColors: null, vibrancy }}>
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
