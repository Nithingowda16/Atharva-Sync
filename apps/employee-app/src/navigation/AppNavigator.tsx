/**
 * Atharva Travels ETS — Employee Android App
 * AppNavigator (State-Driven Navigation Router)
 * 
 * Provides smooth transitions between:
 * - Splash & Authentication (Login, Forgot Password)
 * - Main Bottom Navigation (Bookings, Elevated FAB, Profile)
 * - Quick Action Bottom Sheet (Schedule Ride, Manage Ride, View Routes)
 * - Sub-screens (Shift Selection, Pickup, Routes, Review, Live Tracking, QR Boarding, SOS, etc.)
 */

import React, { useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { HomeScreen } from '../screens/bookings/HomeScreen';
import { MyBookingsScreen } from '../screens/bookings/MyBookingsScreen';
import { RideDetailsScreen } from '../screens/bookings/RideDetailsScreen';
import { LiveTrackingScreen } from '../screens/bookings/LiveTrackingScreen';
import { QrBoardingScreen } from '../screens/bookings/QrBoardingScreen';
import { CreateScheduleScreen } from '../screens/schedule/CreateScheduleScreen';
import { ShiftSelectionScreen } from '../screens/schedule/ShiftSelectionScreen';
import { PickupLocationScreen } from '../screens/schedule/PickupLocationScreen';
import { RouteSelectionScreen } from '../screens/schedule/RouteSelectionScreen';
import { BookingReviewScreen } from '../screens/schedule/BookingReviewScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { HistoryScreen } from '../screens/profile/HistoryScreen';
import { MyAddressScreen } from '../screens/profile/MyAddressScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { FeedbackScreen } from '../screens/profile/FeedbackScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EmergencySosScreen } from '../screens/emergency/EmergencySosScreen';

import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { QuickActionBottomSheet } from '../components/navigation/QuickActionBottomSheet';
import { colors } from '../theme';
import {
  ScreenName,
  MainTab,
  RideRecord,
  BookingDraft,
  ShiftRecord,
  PickupPoint,
  RouteRecord,
  UserProfile,
} from '../types';

export const AppNavigator: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Splash');
  const [activeTab, setActiveTab] = useState<MainTab>('Bookings');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(null);

  // Active / Confirmed Rides State (begins empty per strict no-mock-data rule)
  const [bookingsList, setBookingsList] = useState<RideRecord[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideRecord | null>(null);

  // Booking Draft State
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    date: new Date().toISOString().split('T')[0],
    direction: 'LOGIN',
  });

  // Handle Tab Switch
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === 'Bookings') {
      setCurrentScreen('Home');
    } else {
      setCurrentScreen('Profile');
    }
  };

  // Quick Action Sheet Handlers
  const handleSelectQuickAction = (action: 'schedule' | 'manage' | 'routes') => {
    setIsBottomSheetOpen(false);
    if (action === 'schedule') {
      setCurrentScreen('CreateSchedule');
    } else if (action === 'manage') {
      setCurrentScreen('MyBookings');
    } else if (action === 'routes') {
      setCurrentScreen('RouteSelection');
    }
  };

  // Confirm Booking Handler (completes frontend state transition)
  const handleBookingConfirmed = () => {
    if (bookingDraft.shift && bookingDraft.pickupPoint) {
      const newRide: RideRecord = {
        id: `ride-${Date.now()}`,
        tripCode: `ATH-${Date.now().toString().slice(-4)}`,
        date: bookingDraft.date || new Date().toISOString().split('T')[0],
        shiftTime: bookingDraft.shift.shiftTime,
        direction: bookingDraft.direction,
        status: 'SCHEDULED',
        boardingStatus: 'WAITING',
        boardingOtp: '7492',
        pickup: bookingDraft.pickupPoint,
        destination: bookingDraft.destination || {
          id: 'dest-hq',
          name: 'Atharva Corporate Campus',
          campus: 'Tower B, Domlur Tech Park',
          city: 'Bengaluru',
        },
        route: bookingDraft.route,
      };

      setBookingsList([newRide, ...bookingsList]);
      setSelectedRide(newRide);
      setCurrentScreen('Home');
    }
  };

  // Is Main Tab View
  const isMainTab = currentScreen === 'Home' || currentScreen === 'Profile';

  // Screen Rendering Router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen onFinish={() => setCurrentScreen('Login')} />;

      case 'Login':
        return (
          <LoginScreen
            onLoginSuccess={() => {
              setUser({
                employeeId: 'EMP-1048',
                fullName: 'Corporate Employee',
                email: 'employee@corporate.com',
                department: 'Supply Chain Operations',
              });
              setCurrentScreen('Home');
            }}
            onNavigateForgotPassword={() => setCurrentScreen('ForgotPassword')}
            onBypassForDemo={() => {
              setUser({
                employeeId: 'EMP-1048',
                fullName: 'Corporate Employee',
                email: 'employee@corporate.com',
                department: 'Supply Chain Operations',
              });
              setCurrentScreen('Home');
            }}
          />
        );

      case 'ForgotPassword':
        return <ForgotPasswordScreen onBack={() => setCurrentScreen('Login')} />;

      case 'Home':
        return (
          <HomeScreen
            activeRide={selectedRide || (bookingsList.length > 0 ? bookingsList[0] : null)}
            onNavigateSchedule={() => setCurrentScreen('CreateSchedule')}
            onNavigateMyBookings={() => setCurrentScreen('MyBookings')}
            onNavigateRideDetails={(ride) => {
              setSelectedRide(ride);
              setCurrentScreen('RideDetails');
            }}
            onNavigateLiveTracking={(ride) => {
              setSelectedRide(ride);
              setCurrentScreen('LiveTracking');
            }}
            onNavigateQrBoarding={(ride) => {
              setSelectedRide(ride);
              setCurrentScreen('QrBoarding');
            }}
            onNavigateSos={() => setCurrentScreen('EmergencySos')}
            onNavigateNotifications={() => setCurrentScreen('Notifications')}
          />
        );

      case 'MyBookings':
        return (
          <MyBookingsScreen
            onBack={() => setCurrentScreen('Home')}
            onNavigateSchedule={() => setCurrentScreen('CreateSchedule')}
            onSelectRide={(ride) => {
              setSelectedRide(ride);
              setCurrentScreen('RideDetails');
            }}
            bookings={bookingsList}
          />
        );

      case 'RideDetails':
        return (
          <RideDetailsScreen
            ride={selectedRide}
            onBack={() => setCurrentScreen('Home')}
            onNavigateTracking={() => setCurrentScreen('LiveTracking')}
            onNavigateQr={() => setCurrentScreen('QrBoarding')}
          />
        );

      case 'LiveTracking':
        return (
          <LiveTrackingScreen
            ride={selectedRide}
            onBack={() => setCurrentScreen('Home')}
            onNavigateSos={() => setCurrentScreen('EmergencySos')}
          />
        );

      case 'QrBoarding':
        return (
          <QrBoardingScreen
            ride={selectedRide}
            onBack={() => setCurrentScreen('Home')}
          />
        );

      case 'CreateSchedule':
        return (
          <CreateScheduleScreen
            draft={bookingDraft}
            onUpdateDraft={(updated) => setBookingDraft((prev) => ({ ...prev, ...updated }))}
            onBack={() => setCurrentScreen('Home')}
            onOpenShiftSelection={() => setCurrentScreen('ShiftSelection')}
            onOpenPickupSelection={() => setCurrentScreen('PickupLocation')}
            onOpenRouteSelection={() => setCurrentScreen('RouteSelection')}
            onContinueReview={() => setCurrentScreen('BookingReview')}
          />
        );

      case 'ShiftSelection':
        return (
          <ShiftSelectionScreen
            date={bookingDraft.date || new Date().toISOString().split('T')[0]}
            onBack={() => setCurrentScreen('CreateSchedule')}
            onApplyShift={(shift) => {
              setBookingDraft((prev) => ({ ...prev, shift }));
              setCurrentScreen('CreateSchedule');
            }}
            availableShifts={[]} // Strict No-Mock-Data: empty by default
          />
        );

      case 'PickupLocation':
        return (
          <PickupLocationScreen
            onBack={() => setCurrentScreen('CreateSchedule')}
            onSelectPickup={(pickup) => {
              setBookingDraft((prev) => ({ ...prev, pickupPoint: pickup }));
              setCurrentScreen('CreateSchedule');
            }}
            availablePickups={[]} // Strict No-Mock-Data: empty by default
            currentSelectedId={bookingDraft.pickupPoint?.id}
          />
        );

      case 'RouteSelection':
        return (
          <RouteSelectionScreen
            onBack={() => setCurrentScreen('CreateSchedule')}
            onSelectRoute={(route) => {
              setBookingDraft((prev) => ({ ...prev, route }));
              setCurrentScreen('CreateSchedule');
            }}
            availableRoutes={[]} // Strict No-Mock-Data: empty by default
            currentSelectedId={bookingDraft.route?.id}
          />
        );

      case 'BookingReview':
        return (
          <BookingReviewScreen
            draft={bookingDraft}
            onBack={() => setCurrentScreen('CreateSchedule')}
            onConfirmBooking={handleBookingConfirmed}
          />
        );

      case 'Profile':
        return (
          <ProfileScreen
            user={user}
            onNavigateHistory={() => setCurrentScreen('History')}
            onNavigateHelp={() => setCurrentScreen('HelpSupport')}
            onNavigateAddress={() => setCurrentScreen('MyAddress')}
            onNavigateFeedback={() => setCurrentScreen('Feedback')}
            onNavigateSettings={() => setCurrentScreen('Settings')}
            onNavigateTerms={() => setCurrentScreen('Settings')}
            onLogout={() => {
              setUser(null);
              setCurrentScreen('Login');
            }}
          />
        );

      case 'History':
        return <HistoryScreen onBack={() => setCurrentScreen('Profile')} />;

      case 'MyAddress':
        return <MyAddressScreen onBack={() => setCurrentScreen('Profile')} />;

      case 'Notifications':
        return <NotificationsScreen onBack={() => setCurrentScreen('Home')} />;

      case 'HelpSupport':
        return <HelpSupportScreen onBack={() => setCurrentScreen('Profile')} />;

      case 'Feedback':
        return <FeedbackScreen onBack={() => setCurrentScreen('Profile')} />;

      case 'Settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen('Profile')}
            onLogout={() => {
              setUser(null);
              setCurrentScreen('Login');
            }}
          />
        );

      case 'EmergencySos':
        return (
          <EmergencySosScreen
            onBack={() => setCurrentScreen('Home')}
            tripCode={selectedRide?.tripCode}
          />
        );

      default:
        return <HomeScreen onNavigateSchedule={() => setCurrentScreen('CreateSchedule')} onNavigateMyBookings={() => setCurrentScreen('MyBookings')} onNavigateRideDetails={() => {}} onNavigateLiveTracking={() => {}} onNavigateQrBoarding={() => {}} onNavigateSos={() => setCurrentScreen('EmergencySos')} onNavigateNotifications={() => setCurrentScreen('Notifications')} />;
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Screen Body */}
      <View style={styles.screenBody}>{renderScreen()}</View>

      {/* Persistent Bottom Navigation (shown on main tab screens: Home & Profile) */}
      {isMainTab && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onFabPress={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
          isBottomSheetOpen={isBottomSheetOpen}
        />
      )}

      {/* Elevated Action Bottom Sheet */}
      <QuickActionBottomSheet
        visible={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenBody: {
    flex: 1,
  },
});

