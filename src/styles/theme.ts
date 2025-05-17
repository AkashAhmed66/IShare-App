export const COLORS = {
  primary: '#211C84', // Dark blue
  primaryDark: '#1A1766', // Darker shade of primary
  primaryLight: '#4D55CC', // Medium blue
  secondary: '#7A73D1', // Light purple
  accent: '#B5A8D5', // Pale lavender
  background: '#F8F8FF', // Light background with slight purple tint
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E5',
  notification: '#FF3B30',
  error: '#E11900',
  success: '#05944F',
  warning: '#FFC043',
  inactive: '#CCCCCC',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  highDemand: 'rgba(122, 115, 209, 0.3)', // Light purple with opacity for high demand areas
  
  // New palette colors for consistent reference
  darkBlue: '#211C84',
  mediumBlue: '#4D55CC',
  lightPurple: '#7A73D1',
  paleLavender: '#B5A8D5',
};

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  margin: 20,

  // font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  h5: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,
  small: 10,
};

export const FONTS = {
  largeTitle: { fontFamily: 'System', fontSize: SIZES.largeTitle, fontWeight: '700' as const },
  h1: { fontFamily: 'System', fontSize: SIZES.h1, fontWeight: '700' as const },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, fontWeight: '700' as const },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, fontWeight: '600' as const },
  h4: { fontFamily: 'System', fontSize: SIZES.h4, fontWeight: '600' as const },
  h5: { fontFamily: 'System', fontSize: SIZES.h5, fontWeight: '600' as const },
  body1: { fontFamily: 'System', fontSize: SIZES.body1, fontWeight: '400' as const },
  body2: { fontFamily: 'System', fontSize: SIZES.body2, fontWeight: '400' as const },
  body3: { fontFamily: 'System', fontSize: SIZES.body3, fontWeight: '400' as const },
  body4: { fontFamily: 'System', fontSize: SIZES.body4, fontWeight: '400' as const },
  body5: { fontFamily: 'System', fontSize: SIZES.body5, fontWeight: '400' as const },
  small: { fontFamily: 'System', fontSize: SIZES.small, fontWeight: '400' as const },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
}; 