import { format, subDays } from 'date-fns';

/**
 * Dynamic Saturation Engine
 * 
 * Calculates a "vibrancy factor" (0.0 → 1.0) from the user's trailing 7-day
 * habit completion rate. This factor drives the visual richness of the entire
 * UI — pillar colors, accent saturation, and animation intensity all scale
 * with the user's real-world consistency.
 *
 * Psychological Intent:
 * - New/struggling users see a calm, muted, low-pressure interface.
 * - Consistent users are rewarded with a vivid, "alive" dashboard.
 * - The UI itself becomes a mirror of the user's identity momentum.
 */

export interface VibrancyState {
  /** 0.0 (fully muted) to 1.0 (fully vivid) */
  factor: number;
  /** Human-readable tier for UI copy and conditional rendering */
  tier: 'dormant' | 'awakening' | 'growing' | 'radiant';
  /** The raw completion ratio before smoothing (0-1) */
  rawRatio: number;
}

/**
 * Maps a vibrancy factor to a named tier.
 * These tiers can drive conditional UI elements (e.g., particle effects
 * only appear at 'radiant', BloomNode breathing slows at 'dormant').
 */
function getTier(factor: number): VibrancyState['tier'] {
  if (factor < 0.25) return 'dormant';
  if (factor < 0.50) return 'awakening';
  if (factor < 0.75) return 'growing';
  return 'radiant';
}

/**
 * Calculates the vibrancy state from the user's habits and completions.
 *
 * @param habits - Array of habits, each with a `completions` array of { date, status } objects
 * @param today  - The reference date (defaults to now)
 * @returns VibrancyState with factor, tier, and raw ratio
 */
export function calculateVibrancy(
  habits: { completions: { date: string; status: string }[] }[],
  today: Date = new Date()
): VibrancyState {
  if (habits.length === 0) {
    return { factor: 0.3, tier: 'awakening', rawRatio: 0 };
  }

  // Count completions across the trailing 7-day window
  let totalSlots = 0;
  let completedSlots = 0;

  for (let i = 0; i < 7; i++) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    for (const habit of habits) {
      totalSlots++;
      if (habit.completions.some(c => c.date === dateStr)) {
        completedSlots++;
      }
    }
  }

  const rawRatio = totalSlots > 0 ? completedSlots / totalSlots : 0;

  // Apply a floor of 0.15 so the UI never feels completely dead.
  // Apply a slight ease-in curve so early consistency is quickly rewarded.
  const MIN_VIBRANCY = 0.15;
  const factor = Math.min(1, MIN_VIBRANCY + (1 - MIN_VIBRANCY) * Math.pow(rawRatio, 0.8));

  return {
    factor,
    tier: getTier(factor),
    rawRatio,
  };
}

/**
 * Converts a hex color to HSL components.
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Generates CSS custom property overrides that scale a color's saturation
 * by the vibrancy factor. Used by ThemeProvider to inject into <html>.
 *
 * @param vibrancy - The current vibrancy factor (0-1)
 * @returns A record of CSS custom property name → value
 */
export function getVibrancyCSSProperties(vibrancy: number): Record<string, string> {
  // Define the pillar colors at full vibrancy (these match index.css @theme)
  const pillars: Record<string, string> = {
    '--color-pillar-health': '#10B981',
    '--color-pillar-health-dark': '#059669',
    '--color-pillar-work': '#3B82F6',
    '--color-pillar-work-dark': '#2563EB',
    '--color-pillar-mind': '#8B5CF6',
    '--color-pillar-mind-dark': '#6D28D9',
  };

  const properties: Record<string, string> = {};

  for (const [prop, hex] of Object.entries(pillars)) {
    const { h, s, l } = hexToHsl(hex);
    // Scale the saturation by the vibrancy factor.
    // At vibrancy 0.15 (minimum), colors become very pastel/muted.
    // At vibrancy 1.0, colors are at their full designed saturation.
    const scaledSaturation = Math.round(s * vibrancy);
    properties[prop] = `hsl(${h}, ${scaledSaturation}%, ${l}%)`;
  }

  // Also scale the accent color
  const accentHsl = hexToHsl('#10B981');
  const scaledAccentSat = Math.round(accentHsl.s * vibrancy);
  properties['--accent'] = `hsl(${accentHsl.h}, ${scaledAccentSat}%, ${accentHsl.l}%)`;

  // Expose the raw factor for animations/opacity scaling in components
  properties['--vibrancy-factor'] = vibrancy.toFixed(2);

  return properties;
}
