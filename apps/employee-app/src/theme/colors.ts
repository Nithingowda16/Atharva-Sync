/**
 * Atharva Travels ETS — Employee Android App
 * Color Palette & Design Tokens
 * 
 * Target aesthetic: Premium corporate mobility application (pure white, deep royal blue, subtle borders)
 */

export const colors = {
  // Primary Corporate Blue Palette
  primary: '#0B4EA2',          // Deep corporate blue (main CTA buttons, selected borders, active icons)
  primaryDark: '#073874',      // Pressed state / dark headers
  primaryLight: '#2563EB',     // Bright blue accent
  primarySurface: '#EBF3FC',   // Light ice-blue surface for icon containers & active tags
  primarySubtle: '#F0F6FD',    // Subtle blue background for selected cards

  // Neutral Backgrounds
  background: '#FFFFFF',       // Pure white main application background
  surface: '#F8FAFC',          // Light off-white for secondary screen areas
  card: '#FFFFFF',             // White card background
  cardMuted: '#F1F5F9',        // Muted container background
  cardSelected: '#FFFFFF',     // Selected card surface

  // Borders & Dividers
  border: '#E2E8F0',           // Very subtle unselected card border
  borderLight: '#EDF2F7',      // Ultra-soft divider
  borderSelected: '#0B4EA2',   // Deep blue selected border
  borderFocus: '#2563EB',      // Form input focus border

  // Typography Colors
  textPrimary: '#0F172A',      // Dark navy / charcoal for main titles and body
  textSecondary: '#64748B',    // Muted grey for subheaders, labels, secondary info
  textMuted: '#94A3B8',        // Placeholder text and hints
  textWhite: '#FFFFFF',        // White text on primary CTA buttons
  textPrimaryBlue: '#0B4EA2',  // Accent blue text

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
  ripple: 'rgba(11, 78, 162, 0.08)',  // Android touch ripple
} as const;

export type Colors = typeof colors;

