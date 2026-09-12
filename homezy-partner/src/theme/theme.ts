// Homezy Partner Design System — premium blue brand
// Primary: rich blue (#1A73E8); Accent: amber; Premium dark tokens

export const colors = {
  // Brand
  primary: '#1A73E8',
  secondary: '#4A5568',
  secondaryDark: '#2D3748',
  secondaryLight: '#EDF2F7',
  primaryDark: '#0F5BC4',
  primaryLight: '#EFF6FF',
  primaryGradientStart: '#2B83F8',
  primaryGradientEnd: '#0A47A0',

  // Accent
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // Neutrals
  background: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E4E7EB',
  divider: '#F3F4F6',

  // Text
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Job status
  statusPending: '#F59E0B',
  statusConfirmed: '#3B82F6',
  statusAssigned: '#8B5CF6',
  statusArrived: '#06B6D4',
  statusInProgress: '#10B981',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E4E7EB',
  shimmerHighlight: '#F3F4F6',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  smallBold: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const, lineHeight: 16 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const theme = { colors, spacing, radius, typography, shadows };
export type Theme = typeof theme;
export default theme;

