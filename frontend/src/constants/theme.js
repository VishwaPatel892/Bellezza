// ─────────────────────────────────────────────
// Bellezza Design System — src/constants/theme.js
// ─────────────────────────────────────────────

// ── Color Palette ────────────────────────────
export const COLORS = {
  // Brand
  burgundy:     '#722F37',
  darkBurgundy: '#4E2027',
  dustyPink:    '#D7A7B1',

  // Backgrounds
  background:   '#F8F4E7',
  cream:        '#F8F4E7',
  softCream:    '#FDF8F0',
  warmWhite:    '#FFFFFF',
  white:        '#FFFFFF',

  // Text
  textPrimary:   '#292326',
  textSecondary: '#777078',
  textMuted:     '#B0AAB0',

  // Borders
  border:       '#E9DFD9',
  borderSubtle: '#F3EDE7',

  // Status
  success: '#4F8068',
  warning: '#C28A46',
  error:   '#B84C52',

  // Aliases used by old components
  primary: '#722F37',
};

// ── Font Family Keys ──────────────────────────
export const FONTS = {
  playfair:       'PlayfairDisplay_700Bold',
  playfairReg:    'PlayfairDisplay_400Regular',
  inter:          'Inter_400Regular',
  interMedium:    'Inter_500Medium',
  interSemiBold:  'Inter_600SemiBold',
  interBold:      'Inter_700Bold',
};

// ── Typography ────────────────────────────────
export const TYPOGRAPHY = {
  displayLarge:  { fontFamily: FONTS.playfair,      fontSize: 32, lineHeight: 42 },
  displayMedium: { fontFamily: FONTS.playfair,      fontSize: 26, lineHeight: 34 },
  headingLarge:  { fontFamily: FONTS.playfairReg,   fontSize: 22, lineHeight: 30 },
  headingMedium: { fontFamily: FONTS.interBold,     fontSize: 18, lineHeight: 25 },
  headingSmall:  { fontFamily: FONTS.interSemiBold, fontSize: 15, lineHeight: 21 },
  bodyLarge:     { fontFamily: FONTS.inter,         fontSize: 16, lineHeight: 24 },
  bodyMedium:    { fontFamily: FONTS.inter,         fontSize: 14, lineHeight: 21 },
  bodySmall:     { fontFamily: FONTS.inter,         fontSize: 12, lineHeight: 18 },
  caption:       { fontFamily: FONTS.interMedium,   fontSize: 10, lineHeight: 14, letterSpacing: 0.5  },
  label:         { fontFamily: FONTS.interSemiBold, fontSize: 11, lineHeight: 16, letterSpacing: 0.8  },
  button:        { fontFamily: FONTS.interSemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.3  },
  overline:      { fontFamily: FONTS.interBold,     fontSize: 9,  lineHeight: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
};

// ── Spacing ───────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── Border Radii ──────────────────────────────
export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 9999,
};

// ── Shadows ───────────────────────────────────
export const SHADOWS = {
  none: {},
  subtle: {
    shadowColor:   '#722F37',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius:  6,
    elevation:     2,
  },
  card: {
    shadowColor:   '#292326',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius:  10,
    elevation:     3,
  },
  elevated: {
    shadowColor:   '#292326',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  16,
    elevation:     6,
  },
};
