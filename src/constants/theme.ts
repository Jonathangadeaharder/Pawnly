/**
 * Theme Constants
 * Modern, friendly, and inviting design system
 * Based on the blueprint's specifications for a "perfect and modern" UI
 */

export const Colors = {
  // Primary palette - light and clean, promoting focus
  primary: '#B15653', // Spicy Red - for key buttons and CTAs
  primaryLight: '#D17875',
  primaryDark: '#8A3D3B',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#E9ECEF',

  // Chess board colors
  boardLight: '#F0D9B5',
  boardDark: '#B58863',

  // Semantic colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Text colors
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',

  // UI elements
  border: '#DEE2E6',
  disabled: '#CED4DA',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Gamification colors
  streak: '#FF6B35', // Flame color
  milestone: '#FFD700', // Gold for achievements
  xp: '#9C27B0', // Purple for XP
};

export const Typography = {
  // Font family - DM Sans (modern sans-serif)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font weights
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const Animations = {
  // Duration in milliseconds
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Easing functions (for react-native-reanimated)
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

/**
 * Board themes for user customization
 */
export const BoardThemes = {
  modern: {
    name: 'Modern',
    light: '#F0D9B5',
    dark: '#B58863',
  },
  wood: {
    name: 'Wood',
    light: '#D4A574',
    dark: '#8B5A3C',
  },
  neo: {
    name: 'Neo',
    light: '#E8EDF9',
    dark: '#7B8FA3',
  },
  green: {
    name: 'Classic Green',
    light: '#FFFFDD',
    dark: '#769656',
  },
  blue: {
    name: 'Ocean Blue',
    light: '#DEE3E6',
    dark: '#8CA2AD',
  },
};

export type BoardThemeName = keyof typeof BoardThemes;

/**
 * Piece themes
 */
export const PieceThemes = {
  modern: 'modern',
  classic: 'classic',
  neo: 'neo',
} as const;

export type PieceThemeName = keyof typeof PieceThemes;

/**
 * Digital Coach personalities
 */
export const CoachPersonalities = {
  friendly: {
    name: 'The Friendly Coach',
    tone: 'encouraging',
    unlocked: true,
  },
  attacker: {
    name: 'The Attacker',
    tone: 'aggressive',
    unlocked: false,
  },
  positional: {
    name: 'The Positional Master',
    tone: 'strategic',
    unlocked: false,
  },
  tactical: {
    name: 'The Tactician',
    tone: 'sharp',
    unlocked: false,
  },
};

export type CoachPersonalityName = keyof typeof CoachPersonalities;
