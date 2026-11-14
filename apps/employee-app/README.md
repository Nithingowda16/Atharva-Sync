# Atharva Travels Enterprise Transport System (ETS)
## Employee Android Application (Frontend-Only Architecture)

A mobile application for corporate employees to schedule, manage, track, and board company transport vehicles.

---

## 1. Design & UI/UX Principles

- **Primary Colors**: Deep Corporate Royal Blue (`#0B4EA2`), Pure White (`#FFFFFF`), Crisp Slate Gray (`#0F172A`, `#64748B`).
- **Cards**: Large rounded corners (16-20px), subtle border (`#E2E8F0`), soft elevation.
- **Selection Card Pattern**: Subtle border when unselected, deep royal blue border (`#0B4EA2`) when selected.
- **Bottom Navigation**: Recreates the reference layout (`Bookings` / `Profile`) with an elevated center `+` action button that slides open a rounded bottom sheet.
- **No Emojis**: Professional vector outline iconography via `@expo/vector-icons` (Ionicons) with consistent stroke weight throughout the app.
- **Strict No-Mock-Data**: All screens render genuine empty states (`No bookings yet`, `No shifts available`, `No routes available`, `No notifications`, `Live tracking unavailable`) until populated by real backend records.

---

## 2. Project Structure

```text
apps/employee-app/
├── App.tsx                     # Safe Area & Root Navigator Entry
├── app.json                    # Expo Android configuration (package: com.atharvatravels.ets.employee)
├── package.json                # Dependencies (React Native 0.74, Expo 51, TypeScript)
├── tsconfig.json               # TypeScript path aliases
├── babel.config.js             # Babel preset
└── src/
    ├── theme/                  # Design tokens
    │   ├── colors.ts           # Deep blue, surface, borders, status colors
    │   ├── typography.ts       # Text scale, line heights, presets
    │   ├── spacing.ts          # Spacing & elevation tokens
    │   └── index.ts            # Unified theme exports
    ├── types/
    │   └── index.ts            # Complete domain & navigation type definitions
    ├── services/               # Phase 1 Service interfaces (Phase 2 integration hooks)
    │   ├── authService.ts
    │   ├── bookingService.ts
    │   ├── shiftService.ts
    │   ├── routeService.ts
    │   ├── tripService.ts
    │   ├── trackingService.ts
    │   ├── notificationService.ts
    │   └── index.ts
    ├── components/
    │   ├── common/             # Reusable UI primitives
    │   │   ├── AppHeader.tsx
    │   │   ├── BackButton.tsx
    │   │   ├── PrimaryButton.tsx
    │   │   ├── SecondaryButton.tsx
    │   │   ├── RoundedCard.tsx
    │   │   ├── SelectionCard.tsx
    │   │   ├── SectionHeader.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── LoadingSkeleton.tsx
    │   │   ├── StatusBadge.tsx
    │   │   ├── ListRow.tsx
    │   │   ├── IconContainer.tsx
    │   │   ├── Divider.tsx
    │   │   └── ConfirmationDialog.tsx
    │   ├── navigation/
    │   │   ├── BottomNavigation.tsx        # Elevated '+' FAB button
    │   │   └── QuickActionBottomSheet.tsx  # Slide-up modal actions
    │   ├── booking/
    │   │   ├── DateSelector.tsx
    │   │   ├── ShiftCard.tsx               # Reference Screen 1 layout
    │   │   ├── RouteCard.tsx
    │   │   └── BookingSummaryCard.tsx
    │   └── tracking/
    │       ├── LiveTrackingMapPlaceholder.tsx
    │       └── TripStatusStepper.tsx
    ├── screens/
    │   ├── auth/
    │   │   ├── SplashScreen.tsx
    │   │   ├── LoginScreen.tsx
    │   │   └── ForgotPasswordScreen.tsx
    │   ├── bookings/
    │   │   ├── HomeScreen.tsx
    │   │   ├── MyBookingsScreen.tsx
    │   │   ├── RideDetailsScreen.tsx
    │   │   ├── LiveTrackingScreen.tsx
    │   │   └── QrBoardingScreen.tsx
    │   ├── schedule/
    │   │   ├── CreateScheduleScreen.tsx    # Reference Screen 4 layout
    │   │   ├── ShiftSelectionScreen.tsx    # Reference Screen 1 layout
    │   │   ├── PickupLocationScreen.tsx
    │   │   ├── RouteSelectionScreen.tsx
    │   │   └── BookingReviewScreen.tsx
    │   ├── profile/
    │   │   ├── ProfileScreen.tsx           # Reference Screen 2 layout
    │   │   ├── HistoryScreen.tsx
    │   │   ├── MyAddressScreen.tsx
    │   │   ├── NotificationsScreen.tsx
    │   │   ├── HelpSupportScreen.tsx
    │   │   ├── FeedbackScreen.tsx
    │   │   └── SettingsScreen.tsx
    │   └── emergency/
    │       └── EmergencySosScreen.tsx
    └── navigation/
        └── AppNavigator.tsx    # State-driven application router
```

---

## 3. Running the Application

### Start Development Server
```bash
cd apps/employee-app
npm install
npm run android
```
Or with Expo CLI:
```bash
npx expo start --android
```

---

## 4. Phase 2 Backend Integration Hooks

All network operations are abstracted inside `src/services/` and will connect directly to the existing Central Atharva ETS platform (`/api/auth`, `/api/trips`, `/api/mobile/employee/commute`, `/api/sos`) without modifying the UI components.

