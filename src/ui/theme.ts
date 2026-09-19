import { useColorScheme } from 'react-native';
import { useGame } from '../state/GameContext';

/**
 * Two flat colour palettes. `useTheme()` picks one based on the setting
 * (dark / light / follow the system) — no theme context needed.
 */

export type Palette = {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textDim: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  gold: string;
};

const darkPalette: Palette = {
  dark: true,
  bg: '#0E1016',
  card: '#171A23',
  cardAlt: '#1F2430',
  border: '#262C3A',
  text: '#F2F4F8',
  textDim: '#A3ABBD',
  textFaint: '#6B7386',
  accent: '#6C8CFF',
  accentSoft: 'rgba(108,140,255,0.16)',
  success: '#3DD68C',
  danger: '#FF6B6B',
  gold: '#F5C451',
};

const lightPalette: Palette = {
  dark: false,
  bg: '#F4F6FB',
  card: '#FFFFFF',
  cardAlt: '#EDF1F9',
  border: '#DFE5F0',
  text: '#131722',
  textDim: '#5B6478',
  textFaint: '#8B93A5',
  accent: '#3F63E8',
  accentSoft: 'rgba(63,99,232,0.12)',
  success: '#17A46A',
  danger: '#D94141',
  gold: '#C8912A',
};

export function useTheme(): Palette {
  const { state } = useGame();
  const system = useColorScheme();
  const mode = state.settings.theme;
  const dark = mode === 'system' ? system !== 'light' : mode === 'dark';
  return dark ? darkPalette : lightPalette;
}

/** Shared spacing/radius values so screens stay visually consistent. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
