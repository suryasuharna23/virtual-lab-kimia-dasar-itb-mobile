import { Platform } from 'react-native'

// === COLORS ===
export const colors = {
  // Primary (Deep Navy)
  primary: '#1E1B4B',
  primaryLight: '#3730A3',
  primaryDark: '#111827',
  primarySoft: '#EDE9FE',

  // Accent (Warm Orange)
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#B45309',
  accentSoft: '#FEF3C7',

  // Semantic
  success: '#10B981',
  successDark: '#059669',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningSoft: '#FEF3C7',
  error: '#EF4444',
  errorDark: '#B91C1C',
  errorSoft: '#FEE2E2',
  info: '#3B82F6',
  infoDark: '#2563EB',
  infoSoft: '#DBEAFE',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey: '#E5E7EB',
  greyDark: '#9CA3AF',

  // Chemistry (Virtual Lab)
  chemistry: {
    acidic: '#EF4444',
    neutral: '#22C55E',
    basic: '#3B82F6',
    liquidBlue: '#60A5FA',
    liquidGreen: '#4ADE80',
    liquidYellow: '#FACC15',
    liquidOrange: '#FB923C',
    liquidPurple: '#A78BFA',
    liquidClear: '#E5E7EB',
  },
} as const

export interface Theme {
  background: string
  surface: string
  surfaceElevated: string
  surfacePurple: string
  border: string
  borderLight: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textOnPrimary: string
  primary: string
  primaryLight: string
  primaryDark: string
  primarySoft: string
  accent: string
  accentLight: string
  accentDark: string
  accentSoft: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  error: string
  errorSoft: string
  info: string
  infoSoft: string
}

export const lightTheme: Theme = {
  background: '#E8E5F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfacePurple: '#DDD8F0',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  primaryDark: colors.primaryDark,
  primarySoft: colors.primarySoft,
  accent: colors.accent,
  accentLight: colors.accentLight,
  accentDark: colors.accentDark,
  accentSoft: colors.accentSoft,
  success: colors.success,
  successSoft: colors.successSoft,
  warning: colors.warning,
  warningSoft: colors.warningSoft,
  error: colors.error,
  errorSoft: colors.errorSoft,
  info: colors.info,
  infoSoft: colors.infoSoft,
}

export const darkTheme: Theme = {
  background: '#0F0E1A',
  surface: '#1E1B2E',
  surfaceElevated: '#2A2744',
  surfacePurple: '#2E2A5E',
  border: '#3B3756',
  borderLight: '#4B4768',
  textPrimary: '#F5F3FF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',
  primary: '#E8E6F2',
  primaryLight: '#C4B5FD',
  primaryDark: '#2E2A5E',
  primarySoft: '#2E2A5E',
  accent: colors.accent,
  accentLight: colors.accentLight,
  accentDark: colors.accentDark,
  accentSoft: '#422006',
  success: colors.success,
  successSoft: colors.successDark, 
  warning: colors.warning,
  warningSoft: colors.warningDark,
  error: colors.error,
  errorSoft: colors.errorDark,
  info: colors.info,
  infoSoft: colors.infoDark,
}

// === TYPOGRAPHY ===
export const fontFamily = Platform.select({
  ios: {
    sans: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    mono: 'monospace',
  },
})

export const fontSize = {
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  bodyLarge: 16,
  body: 14,
  bodySmall: 12,
  caption: 11,
  overline: 10,
} as const

export const lineHeight = {
  display: 40,
  h1: 36,
  h2: 32,
  h3: 28,
  h4: 24,
  bodyLarge: 24,
  body: 20,
  bodySmall: 16,
  caption: 14,
  overline: 14,
} as const

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

// === SPACING ===
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const

export const layout = {
  screenPaddingHorizontal: 20,
  screenPaddingTop: 16,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  listItemGap: 12,
} as const

// === BORDER RADIUS ===
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const

// === SHADOWS ===
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const

// === ANIMATION ===
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const

export const springConfig = {
  damping: 15,
  stiffness: 150,
} as const

// === ICON SIZES ===
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const

export const Colors = {
  light: {
    text: lightTheme.textPrimary,
    background: lightTheme.background,
    tint: colors.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: colors.primary,
  },
  dark: {
    text: darkTheme.textPrimary,
    background: darkTheme.background,
    tint: darkTheme.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: darkTheme.primary,
  },
}

export const Fonts = {
  rounded: fontFamily?.sans ?? 'System',
  mono: fontFamily?.mono ?? 'monospace',
}
