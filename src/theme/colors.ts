import { TrafficLightScore } from '../types';

export const COLORS = {
  // Rich Leaf Greens (#10B981)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Rich Leaf Green
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Clean, Soft Slates & Backgrounds
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Vibrant Pink Accents (User Preferences & Pro Tier)
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  // Moderate Warning Ambers
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // High Impact Alert Roses
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const SHADOWS = {
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hover: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  glow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
};

export interface TrafficBadgeConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  pillBg: string;
}

export function getTrafficBadgeInfo(score: TrafficLightScore): TrafficBadgeConfig {
  switch (score) {
    case 'green':
      return {
        bg: COLORS.emerald[50],
        border: COLORS.emerald[200],
        text: COLORS.emerald[800],
        dot: COLORS.emerald[500],
        label: 'Eco-Friendly',
        pillBg: COLORS.emerald[100],
      };
    case 'yellow':
      return {
        bg: COLORS.amber[50],
        border: COLORS.amber[200],
        text: COLORS.amber[800],
        dot: COLORS.amber[500],
        label: 'Moderate Impact',
        pillBg: COLORS.amber[100],
      };
    case 'red':
      return {
        bg: COLORS.rose[50],
        border: COLORS.rose[200],
        text: COLORS.rose[800],
        dot: COLORS.rose[500],
        label: 'High Impact',
        pillBg: COLORS.rose[100],
      };
  }
}
