/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Root Application Navigator & Flow Controller
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, BackHandler, Alert } from 'react-native';
import { DriverProfile, TripRecord, DriverScreenName } from '../types';
import { authService } from '../services/authService';
import { offlineStorage } from '../services/offlineStorage';
import { syncService } from '../services/syncService';
import { DriverLoginScreen } from '../screens/auth/DriverLoginScreen';
import { DutyHomeScreen } from '../screens/duty/DutyHomeScreen';
import { ActiveTripScreen } from '../screens/trip/ActiveTripScreen';
import { TripCompletionScreen } from '../screens/trip/TripCompletionScreen';
import { DriverProfileScreen } from '../screens/profile/DriverProfileScreen';
import { DriverSosScreen } from '../screens/emergency/DriverSosScreen';
import { UpcomingTripsScreen } from '../screens/trip/UpcomingTripsScreen';
import { CompletedTripsScreen } from '../screens/trip/CompletedTripsScreen';
import { OfficesScreen } from '../screens/office/OfficesScreen';
import { SwitchOfficesScreen } from '../screens/office/SwitchOfficesScreen';
import { AboutScreen } from '../screens/about/AboutScreen';
import { LanguageSwitcherModal } from '../components/LanguageSwitcherModal';
import { colors } from '../theme';

export const AppNavigator: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<DriverScreenName>('Login');
  const [activeTrip, setActiveTrip] = useState<TripRecord | null>(null);
  const [hubCode, setHubCode] = useState('mll1-MLL');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize network sync listeners and check cached session
  useEffect(() => {
    syncService.startListening();

    const bootstrap = async () => {
      try {
        const cachedProfile = await authService.getCurrentProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
          const cachedTrip = await offlineStorage.getActiveManifest();
          if (cachedTrip && cachedTrip.status === 'IN_TRANSIT') {
            setActiveTrip(cachedTrip);
            setCurrentScreen('ActiveTrip');
          } else {
            setCurrentScreen('DutyHome');
          }
        } else {
          setCurrentScreen('Login');
        }
      } catch (err) {
        console.warn('Bootstrap error:', err);
        setCurrentScreen('Login');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      syncService.stopListening();
    };
  }, []);

  // Handle Android mobile manual hardware/gesture back buttons
  useEffect(() => {
    const onHardwareBackPress = () => {
      // 1. If any modal is open, close it first
      if (isSosOpen) {
        setIsSosOpen(false);
        return true;
      }
      if (isLanguageModalOpen) {
        setIsLanguageModalOpen(false);
        return true;
      }
      // 2. If on any secondary screen, navigate back to DutyHome
      if (currentScreen !== 'DutyHome' && currentScreen !== 'Login') {
        setCurrentScreen('DutyHome');
        return true;
      }
      // 3. If on DutyHome, show confirmation before exiting app
      if (currentScreen === 'DutyHome') {
        Alert.alert(
          'Exit HR Pilot?',
          'Are you sure you want to exit the application?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      }
      // 4. On Login screen, allow default exit
      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );
    return () => backSubscription.remove();
  }, [currentScreen, isSosOpen, isLanguageModalOpen]);

  const handleLoginSuccess = (authenticatedProfile: DriverProfile) => {
    setProfile(authenticatedProfile);
    setCurrentScreen('DutyHome');
  };

  const handleDutyToggle = async (newStatus: 'AVAILABLE' | 'OFFLINE') => {
    const updated = await offlineStorage.updateDutyStatus(newStatus);
    if (updated) {
      setProfile(updated);
    }
  };

  const handleStartTrip = (trip: TripRecord) => {
    setActiveTrip(trip);
    setCurrentScreen('ActiveTrip');
  };

  const handleCompleteTripPress = (trip: TripRecord) => {
    setActiveTrip(trip);
    setCurrentScreen('TripCompletion');
  };

  const handleTripFinished = () => {
    setActiveTrip(null);
    setCurrentScreen('DutyHome');
  };

  const handleDrawerNavigate = (
    target: 'Home' | 'UpcomingTrips' | 'CompletedTrips' | 'SwitchOffices' | 'OfficesNavigation' | 'Language' | 'About'
  ) => {
    if (target === 'Home') {
      setCurrentScreen('DutyHome');
    } else if (target === 'UpcomingTrips') {
      setCurrentScreen('UpcomingTrips');
    } else if (target === 'CompletedTrips') {
      setCurrentScreen('CompletedTrips');
    } else if (target === 'SwitchOffices') {
      setCurrentScreen('SwitchOffices');
    } else if (target === 'OfficesNavigation') {
      setCurrentScreen('OfficesNavigation');
    } else if (target === 'Language') {
      setIsLanguageModalOpen(true);
    } else if (target === 'About') {
      setCurrentScreen('About');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setProfile(null);
    setActiveTrip(null);
    setCurrentScreen('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Login Screen */}
      {currentScreen === 'Login' && (
        <DriverLoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 2. Duty Home Screen (Matches Screenshot 1) */}
      {currentScreen === 'DutyHome' && profile && (
        <DutyHomeScreen
          profile={profile}
          onStartTrip={handleStartTrip}
          onDutyToggle={handleDutyToggle}
          onNavigateScreen={handleDrawerNavigate}
          hubCode={hubCode}
        />
      )}

      {/* 3. Upcoming Trips Screen (Matches Screenshot 4) */}
      {currentScreen === 'UpcomingTrips' && profile && (
        <UpcomingTripsScreen
          onBack={() => setCurrentScreen('DutyHome')}
          onStartTrip={handleStartTrip}
          vehiclePlate={profile.assignedVehiclePlate}
        />
      )}

      {/* 4. Completed Trips Screen */}
      {currentScreen === 'CompletedTrips' && (
        <CompletedTripsScreen onBack={() => setCurrentScreen('DutyHome')} />
      )}

      {/* 5. Offices Navigation Screen (Matches Screenshot 5) */}
      {currentScreen === 'OfficesNavigation' && (
        <OfficesScreen onBack={() => setCurrentScreen('DutyHome')} />
      )}

      {/* 6. Switch Offices Screen */}
      {currentScreen === 'SwitchOffices' && (
        <SwitchOfficesScreen
          onBack={() => setCurrentScreen('DutyHome')}
          currentOffice={hubCode}
          onSelectOffice={(code) => setHubCode(code)}
        />
      )}

      {/* 7. About Screen (Matches Screenshot 6) */}
      {currentScreen === 'About' && (
        <AboutScreen onBack={() => setCurrentScreen('DutyHome')} />
      )}

      {/* 8. Active Trip Cockpit (Route, stops, QR boarding) */}
      {currentScreen === 'ActiveTrip' && activeTrip && (
        <ActiveTripScreen
          trip={activeTrip}
          onBack={() => setCurrentScreen('DutyHome')}
          onCompleteTripPress={handleCompleteTripPress}
          onSosPress={() => setIsSosOpen(true)}
        />
      )}

      {/* 9. Trip Completion Screen */}
      {currentScreen === 'TripCompletion' && activeTrip && (
        <TripCompletionScreen
          trip={activeTrip}
          onFinish={handleTripFinished}
        />
      )}

      {/* 10. Driver Profile Screen */}
      {currentScreen === 'DriverProfile' && profile && (
        <DriverProfileScreen
          profile={profile}
          onBack={() => setCurrentScreen('DutyHome')}
          onLogout={handleLogout}
          onOpenLanguage={() => setIsLanguageModalOpen(true)}
        />
      )}

      {/* Global Emergency SOS Fullscreen Modal */}
      <Modal visible={isSosOpen} animationType="slide" transparent={false}>
        <DriverSosScreen onClose={() => setIsSosOpen(false)} />
      </Modal>

      {/* Multilingual Switcher Modal (English, Kannada, Hindi) */}
      <LanguageSwitcherModal
        visible={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
