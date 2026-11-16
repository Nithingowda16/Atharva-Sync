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

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
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
import { bookingService, authService, addressService } from '../services';
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
  // Navigation State — Start directly with Onboarding slides
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Onboarding');
  const [activeTab, setActiveTab] = useState<MainTab>('Bookings');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Hardware Back Button & Back Gesture Navigation for Android
  useEffect(() => {
    const onBackPress = () => {
      // 1. If Quick Action sheet is open, close it first
      if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
        return true;
      }

      // 2. Screen-specific back routing
      switch (currentScreen) {
        case 'Onboarding':
          // First screen: allow system default (exit/minimize)
          return false;

        case 'Login':
          // Return to onboarding carousel
          setCurrentScreen('Onboarding');
          return true;

        case 'ForgotPassword':
          setCurrentScreen('Login');
          return true;

        case 'Home':
          // Root home screen: let system default minimize
          return false;

        case 'Profile':
          // Back to main Bookings tab
          setActiveTab('Bookings');
          setCurrentScreen('Home');
          return true;

        case 'MyBookings':
        case 'RideDetails':
        case 'LiveTracking':
        case 'QrBoarding':
        case 'CreateSchedule':
        case 'EmergencySos':
        case 'Notifications':
          setCurrentScreen('Home');
          return true;

        case 'ShiftSelection':
        case 'PickupLocation':
        case 'RouteSelection':
        case 'BookingReview':
          setCurrentScreen('CreateSchedule');
          return true;

        case 'History':
        case 'MyAddress':
        case 'HelpSupport':
        case 'Feedback':
        case 'Settings':
          setCurrentScreen('Profile');
          return true;

        default:
          return false;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [currentScreen, isBottomSheetOpen]);

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(null);

  // Active / Confirmed Rides State
  const [bookingsList, setBookingsList] = useState<RideRecord[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideRecord | null>(null);

  // Synchronize live commute from Web Portal backend
  const refreshLiveCommute = async () => {
    try {
      const rides = await bookingService.getBookings();
      if (rides && rides.length > 0) {
        setBookingsList(rides);
        setSelectedRide(rides[0]);
      }
    } catch (e) {
      console.warn('Error syncing commute from web portal:', e);
    }
  };

  useEffect(() => {
    refreshLiveCommute();
    // Auto-populate pickup location from employee's primary saved address
    const empId = user?.employeeId || '111';
    addressService.getPrimaryAddress(empId).then((primary) => {
      if (primary) {
        setBookingDraft((prev) => ({
          ...prev,
          pickupPoint: prev.pickupPoint || {
            id: primary.id,
            name: `${primary.label}: ${primary.addressLine}`,
            landmark: primary.landmark || 'Residential Landmark',
            address: `${primary.addressLine}, ${primary.city} ${primary.pincode || ''}`,
            latitude: primary.latitude || 12.9719,
            longitude: primary.longitude || 77.6412,
            isPrimary: true,
          },
        }));
      }
    });
  }, [user]);

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

  // Confirm Booking Handler (sends to central backend & updates local state)
  const handleBookingConfirmed = async () => {
    if (bookingDraft.shift && bookingDraft.pickupPoint) {
      // 1. Submit to backend API / database
      bookingService.createSchedule(bookingDraft).then((res) => {
        if (res.success) {
          refreshLiveCommute();
        }
      });

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
        return <SplashScreen onFinish={() => setCurrentScreen('Onboarding')} />;

      case 'Onboarding':
        return (
          <OnboardingScreen
            onFinish={() => setCurrentScreen('Login')}
          />
        );

      case 'Login':
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              const session = await authService.getSession();
              setUser(
                session || {
                  employeeId: 'EMP-9042',
                  fullName: 'Amrutha Rao',
                  email: 'amrutha.rao@walmart.internal',
                  department: 'Core Supply Chain Engineering',
                }
              );
              refreshLiveCommute();
              setCurrentScreen('Home');
            }}
            onNavigateForgotPassword={() => setCurrentScreen('ForgotPassword')}
            onBackToOnboarding={() => setCurrentScreen('Onboarding')}
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
            onBoarded={() => {
              if (selectedRide) {
                const updated: RideRecord = { ...selectedRide, boardingStatus: 'BOARDED' };
                setSelectedRide(updated);
                setBookingsList((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }
            }}
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
            direction={bookingDraft.direction || 'LOGIN'}
            onBack={() => setCurrentScreen('CreateSchedule')}
            onApplyShift={(shift) => {
              setBookingDraft((prev) => ({ ...prev, shift }));
              setCurrentScreen('CreateSchedule');
            }}
          />
        );

      case 'PickupLocation':
        return (
          <PickupLocationScreen
            employeeId={user?.employeeId || '111'}
            onBack={() => setCurrentScreen('CreateSchedule')}
            onSelectPickup={(pickup) => {
              setBookingDraft((prev) => ({ ...prev, pickupPoint: pickup }));
              setCurrentScreen('CreateSchedule');
            }}
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
        return (
          <MyAddressScreen
            employeeId={user?.employeeId || '111'}
            onBack={() => setCurrentScreen('Profile')}
            onAddAddress={(newAddr) => {
              setBookingDraft((prev) => ({
                ...prev,
                pickupPoint: {
                  id: newAddr.id,
                  name: `${newAddr.label}: ${newAddr.addressLine}`,
                  landmark: newAddr.landmark || 'Residential Landmark',
                  address: `${newAddr.addressLine}, ${newAddr.city} ${newAddr.pincode || ''}`,
                  latitude: newAddr.latitude || 12.9719,
                  longitude: newAddr.longitude || 77.6412,
                  isPrimary: true,
                },
              }));
            }}
          />
        );

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

