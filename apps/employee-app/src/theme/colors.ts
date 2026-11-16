/**
 * Atharva Travels ETS — Employee Android App
 * Color Palette & Design Tokens
 * 
 * Target aesthetic: Premium corporate mobility application (pure white, deep royal blue, subtle borders)
 */

export const colors = {
  // Primary Luxury Black Palette for Main Buttons
  primary: '#000000',          // Solid black (main CTA buttons, primary actions, floating FAB)
  primaryDark: '#18181B',      // Pressed state / dark headers
  primaryLight: '#27272A',     // Dark slate accent
  primarySurface: '#F1F5F9',   // Light subtle surface for icon containers & badges
  primarySubtle: '#F8FAFC',    // Subtle surface for selected cards

  // Hi Riders Vibrant Orange Accent
  accent: '#FF7900',           // Vibrant orange accent (pins, status tags, brand highlights)
  accentDark: '#F4510B',       // Deep orange
  accentSurface: '#FFF7ED',    // Very light orange tint for active badges

  // Neutral Backgrounds (Pure White Application Theme)
  background: '#FFFFFF',       // Pure white main application background
  surface: '#F8FAFC',          // Light off-white for secondary screen areas
  card: '#FFFFFF',             // Clean white card background
  cardMuted: '#F1F5F9',        // Muted container background
  cardSelected: '#FFFFFF',     // Selected card surface

  // Borders & Dividers
  border: '#E2E8F0',           // Very subtle card & input border
  borderLight: '#F1F5F9',      // Ultra-soft divider
  borderSelected: '#000000',   // Black selected border
  borderFocus: '#000000',      // Form input focus border

  // Typography Colors
  textPrimary: '#0F172A',      // Dark slate / black for main titles and body
  textSecondary: '#64748B',    // Muted grey for subheaders, labels, secondary info
  textMuted: '#94A3B8',        // Placeholder text and hints
  textWhite: '#FFFFFF',        // White text on black CTA buttons
  textPrimaryBlue: '#000000',  // Primary text

  // Operational Status Colors
  success: '#059669',          // Green for active, on-time, boarded
  successSurface: '#ECFDF5',   // Green badge surface
  successBorder: '#A7F3D0',    // Green border

  warning: '#D97706',          // Amber for delayed, pending approval
  warningSurface: '#FFFBEB',   // Amber badge surface
  warningBorder: '#FDE68A',    // Amber border

  error: '#DC2626',            // Red for emergency, cancelled, alert
  errorSurface: '#FEF2F2',     // Red badge surface
  errorBorder: '#FECACA',      // Red border

  info: '#0284C7',             // Light blue info
  infoSurface: '#F0F9FF',      // Info badge surface
  infoBorder: '#BAE6FD',       // Info border

  // Interactive Overlays
  overlay: 'rgba(15, 23, 42, 0.45)', // Backdrop dimming for Bottom Sheet & Dialogs
  ripple: 'rgba(0, 0, 0, 0.08)',      // Android touch ripple
} as const;

export type Colors = typeof colors;

