/**
 * Atharva Travels ETS — Employee Android App
 * Unified Theme Tokens
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

export { colors, typography, spacing, borderRadius, shadows };
export default theme;

