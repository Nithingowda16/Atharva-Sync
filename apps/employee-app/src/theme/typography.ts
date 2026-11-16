/**
 * Atharva Travels ETS — Employee Android App
 * Typography Scale & Hierarchy
 */

import { TextStyle } from 'react-native';

export const typography = {
  // Font Sizes
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },

  // Line Heights
  lineHeights: {
    xs: 15,
    sm: 18,
    base: 22,
    md: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    xxxl: 36,
    display: 40,
  },

  // Font Weights
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
  },

  // Pre-configured text styles
  presets: {
    h1: {
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '800',
    } as TextStyle,
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
    } as TextStyle,
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '700',
    } as TextStyle,
    pageTitle: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      letterSpacing: -0.4,
    } as TextStyle,
    sectionTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: -0.2,
    } as TextStyle,
    cardTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
    } as TextStyle,
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    } as TextStyle,
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    } as TextStyle,
    bodyBold: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    } as TextStyle,
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
    } as TextStyle,
    captionBold: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
    } as TextStyle,
    captionSmall: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '400',
    } as TextStyle,
    badge: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
    } as TextStyle,
    button: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.2,
    } as TextStyle,
  },
} as const;

