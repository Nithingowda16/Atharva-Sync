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
import { RentalzScreen } from '../screens/rentalz/RentalzScreen';
import { FlexiScheduleScreen } from '../screens/schedule/FlexiScheduleScreen';

import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { QuickActionBottomSheet, QuickActionType } from '../components/navigation/QuickActionBottomSheet';
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
        case 'Rentalz':
        case 'FlexiSchedule':
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
    selectedDates: [new Date().toISOString().split('T')[0]],
    direction: 'BOTH',
  });
  const [shiftTargetDirection, setShiftTargetDirection] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');

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
  const handleSelectQuickAction = (action: QuickActionType) => {
    setIsBottomSheetOpen(false);
    if (action === 'flexi') {
      setCurrentScreen('FlexiSchedule');
    } else if (action === 'rentalz') {
      setCurrentScreen('Rentalz');
    } else if (action === 'schedule') {
      setBookingDraft({
        date: new Date().toISOString().split('T')[0],
        selectedDates: [new Date().toISOString().split('T')[0]],
        direction: 'BOTH',
      });
      setCurrentScreen('CreateSchedule');
    } else if (action === 'manage') {
      setCurrentScreen('MyBookings');
    } else if (action === 'routes') {
      setCurrentScreen('Home');
    }
  };

  const handleFlexiRequest = (ride: RideRecord) => {
    bookingService.addConfirmedRides([ride]);
    setBookingsList((prev) => [ride, ...prev]);
    setSelectedRide(ride);
    setCurrentScreen('LiveTracking');
  };

  const handleRentalConfirmed = (ride: RideRecord) => {
    bookingService.addConfirmedRides([ride]);
    setBookingsList((prev) => [ride, ...prev]);
    setSelectedRide(ride);
    setCurrentScreen('MyBookings');
  };

  const handleCancelBooking = async (bookingId: string) => {
    await bookingService.cancelBooking(bookingId);
    setBookingsList((prev) =>
      prev.map((r) =>
        r.id === bookingId || r.tripCode === bookingId
          ? { ...r, status: 'CANCELLED', boardingStatus: 'CANCELLED' }
          : r
      )
    );
  };

  const handleReportNoShow = async (bookingId: string) => {
    await bookingService.markNoShow(bookingId);
    setBookingsList((prev) =>
      prev.map((r) =>
        r.id === bookingId || r.tripCode === bookingId
          ? { ...r, status: 'CANCELLED', boardingStatus: 'NO_SHOW' }
          : r
      )
    );
  };

  // Confirm Booking Handler (Supports Multi-Date and Round-Trip Login/Logout)
  const handleBookingConfirmed = async () => {
    if (bookingDraft.pickupPoint) {
      const datesToSchedule: string[] =
        bookingDraft.selectedDates && bookingDraft.selectedDates.length > 0
          ? bookingDraft.selectedDates
          : [bookingDraft.date || new Date().toISOString().split('T')[0]];

      const isBoth = bookingDraft.direction === 'BOTH';
      const loginShift = bookingDraft.loginShift || bookingDraft.shift;
      const logoutShift = bookingDraft.logoutShift || bookingDraft.shift;

      const createdRides: RideRecord[] = [];

      datesToSchedule.forEach((dateStr, idx) => {
        // 1. Morning Login Trip
        if ((isBoth || bookingDraft.direction === 'LOGIN') && loginShift) {
          createdRides.push({
            id: `ride-${Date.now()}-login-${idx}`,
            tripCode: `ATH-${(Date.now() + idx).toString().slice(-4)}L`,
            date: dateStr,
            shiftTime: loginShift.shiftTime,
            direction: 'LOGIN',
            status: 'SCHEDULED',
            boardingStatus: 'WAITING',
            boardingOtp: '7492',
            pickup: bookingDraft.pickupPoint!,
            destination: bookingDraft.destination || {
              id: 'dest-hq',
              name: 'Enterprise Tech Park, Tower B',
              campus: 'Campus Hub',
              city: 'Bengaluru',
            },
          });
        }

        // 2. Evening Logout Trip
        if ((isBoth || bookingDraft.direction === 'LOGOUT') && logoutShift) {
          createdRides.push({
            id: `ride-${Date.now()}-logout-${idx}`,
            tripCode: `ATH-${(Date.now() + idx).toString().slice(-4)}D`,
            date: dateStr,
            shiftTime: logoutShift.shiftTime,
            direction: 'LOGOUT',
            status: 'SCHEDULED',
            boardingStatus: 'WAITING',
            boardingOtp: '7492',
            pickup: {
              id: 'pickup-office-hub',
              name: 'Enterprise Tech Park, Tower B',
              landmark: 'Main Exit Bay 3',
              address: 'Outer Ring Rd, Bellandur, Bengaluru',
            },
            destination: {
              id: bookingDraft.pickupPoint!.id,
              name: bookingDraft.pickupPoint!.name,
              campus: bookingDraft.pickupPoint!.landmark || 'Home Residence',
              city: 'Bengaluru',
            },
          });
        }
      });

      // Persist in local store so they are retained across backend syncs
      bookingService.addConfirmedRides(createdRides);

      // Submit to backend API / database
      bookingService.createSchedule(bookingDraft).then((res) => {
        if (res.success) {
          refreshLiveCommute();
        }
      });

      setBookingsList([...createdRides, ...bookingsList]);
      if (createdRides.length > 0) {
        setSelectedRide(createdRides[0]);
      }
      // Navigate directly to My Bookings so user immediately sees their confirmed rides
      setCurrentScreen('MyBookings');
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const nextUser = await authService.updateProfile(updated);
    setUser(nextUser);
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
            user={user}
            activeRide={selectedRide || (bookingsList.length > 0 ? bookingsList[0] : null)}
            onNavigateSchedule={() => {
              setBookingDraft({
                date: new Date().toISOString().split('T')[0],
                selectedDates: [new Date().toISOString().split('T')[0]],
                direction: 'BOTH',
              });
              setCurrentScreen('CreateSchedule');
            }}
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

      case 'Rentalz':
        return (
          <RentalzScreen
            user={user}
            onBack={() => setCurrentScreen('Home')}
            onConfirmRental={handleRentalConfirmed}
          />
        );

      case 'FlexiSchedule':
        return (
          <FlexiScheduleScreen
            user={user}
            onBack={() => setCurrentScreen('Home')}
            onRequestCab={handleFlexiRequest}
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
            onCancelBooking={handleCancelBooking}
            onReportNoShow={handleReportNoShow}
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
            onOpenShiftSelection={(targetDir) => {
              setShiftTargetDirection(targetDir || (bookingDraft.direction === 'LOGOUT' ? 'LOGOUT' : 'LOGIN'));
              setCurrentScreen('ShiftSelection');
            }}
            onOpenPickupSelection={() => setCurrentScreen('PickupLocation')}
            onContinueReview={() => setCurrentScreen('BookingReview')}
          />
        );

      case 'ShiftSelection':
        return (
          <ShiftSelectionScreen
            date={bookingDraft.date || new Date().toISOString().split('T')[0]}
            direction={shiftTargetDirection}
            onBack={() => setCurrentScreen('CreateSchedule')}
            onApplyShift={(shift) => {
              if (shiftTargetDirection === 'LOGOUT') {
                setBookingDraft((prev) => ({
                  ...prev,
                  logoutShift: shift,
                  shift: prev.direction === 'LOGOUT' ? shift : prev.shift,
                }));
              } else {
                setBookingDraft((prev) => ({
                  ...prev,
                  loginShift: shift,
                  shift: prev.direction === 'LOGIN' ? shift : prev.shift,
                }));
              }
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
            onUpdateProfile={handleUpdateProfile}
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
        return (
          <HomeScreen
            user={user}
            onNavigateSchedule={() => {
              setBookingDraft({
                date: new Date().toISOString().split('T')[0],
                selectedDates: [new Date().toISOString().split('T')[0]],
                direction: 'BOTH',
              });
              setCurrentScreen('CreateSchedule');
            }}
            onNavigateMyBookings={() => setCurrentScreen('MyBookings')}
            onNavigateRideDetails={() => {}}
            onNavigateLiveTracking={() => {}}
            onNavigateQrBoarding={() => {}}
            onNavigateSos={() => setCurrentScreen('EmergencySos')}
            onNavigateNotifications={() => setCurrentScreen('Notifications')}
          />
        );
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

