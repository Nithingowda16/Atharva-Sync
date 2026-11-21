/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Duty Home Dashboard (Matches Screenshot 1)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverProfile, TripRecord } from '../../types';
import { tripService } from '../../services/tripService';
import { offlineStorage } from '../../services/offlineStorage';
import { syncService } from '../../services/syncService';
import { SideDrawer } from '../../components/SideDrawer';
import { StartDutyModal } from '../../components/StartDutyModal';
import { colors, borderRadius, typography, spacing } from '../../theme';

interface DutyHomeScreenProps {
  profile: DriverProfile;
  onStartTrip: (trip: TripRecord) => void;
  onDutyToggle: (newStatus: 'AVAILABLE' | 'OFFLINE') => void;
  onNavigateScreen: (screen: 'Home' | 'UpcomingTrips' | 'CompletedTrips' | 'SwitchOffices' | 'OfficesNavigation' | 'Language' | 'About') => void;
  hubCode: string;
}

export const DutyHomeScreen: React.FC<DutyHomeScreenProps> = ({
  profile,
  onStartTrip,
  onDutyToggle,
  onNavigateScreen,
  hubCode,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTrip, setActiveTrip] = useState<TripRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(profile.dutyStatus !== 'OFFLINE');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [lastContactMins, setLastContactMins] = useState(0);

  const loadData = async () => {
    setRefreshing(true);
    if (isOnDuty) {
      const trip = await tripService.getActiveTrip(profile.id, profile.assignedVehiclePlate);
      setActiveTrip(trip);
    } else {
      setActiveTrip(null);
    }
    setLastContactMins(0);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const pollInterval = setInterval(() => {
      if (isOnDuty) {
        tripService.getActiveTrip(profile.id, profile.assignedVehiclePlate).then((trip) => {
          setActiveTrip(trip);
        });
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [isOnDuty, profile.id, profile.assignedVehiclePlate]);

  // Periodic contact timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastContactMins((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartDutySuccess = async () => {
    setIsAuthModalOpen(false);
    setIsOnDuty(true);
    await offlineStorage.updateDutyStatus('AVAILABLE');
    onDutyToggle('AVAILABLE');
    // Fetch live assigned trip from database
    const trip = await tripService.getActiveTrip(profile.id, profile.assignedVehiclePlate);
    setActiveTrip(trip);
  };

  const handleEndDutyPress = () => {
    Alert.alert(
      'End Duty?',
      'Are you sure you want to end your pilot duty shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Duty',
          style: 'destructive',
          onPress: async () => {
            setIsOnDuty(false);
            setActiveTrip(null);
            await offlineStorage.updateDutyStatus('OFFLINE');
            onDutyToggle('OFFLINE');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Bar (Screenshot 1) with Dynamic Notch Insets */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setIsDrawerOpen(true)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={28} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {activeTrip && isOnDuty ? 'Assigned Trip' : 'No Trips Found'}
        </Text>

        <Text style={styles.hubCode}>{hubCode}</Text>
      </View>

      {/* Sub-bar: Last Contact (Screenshot 1) */}
      <View style={styles.telemetryBar}>
        <Text style={styles.telemetryText}>Last Contact : {lastContactMins} mins ago</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      >
        {!isOnDuty || !activeTrip ? (
          /* Empty State Matching Screenshot 1 */
          <View style={styles.emptyContainer}>
            <View style={styles.carCircle}>
              {/* Taxi / Cab Outline Icon with Taxi Roof Sign */}
              <Ionicons name="car-outline" size={58} color="#2563EB" />
            </View>
            <Text style={styles.emptyHeading}>No Upcoming Trips</Text>
            <Text style={styles.emptySubtitle}>
              No trip assigned to your cab. Please get in touch with your Transport Coordinator.
            </Text>
          </View>
        ) : (
          /* Active Assigned Route Card */
          <View style={styles.manifestCard}>
            <View style={styles.manifestTop}>
              <View>
                <Text style={styles.tripCodeText}>{activeTrip.tripCode}</Text>
                <Text style={styles.corporateText}>{activeTrip.corporateClient}</Text>
              </View>
              <View style={styles.shiftBadge}>
                <Ionicons name="time-outline" size={14} color="#2563EB" />
                <Text style={styles.shiftBadgeText}>{activeTrip.shiftTime}</Text>
              </View>
            </View>

            <View style={styles.routeRow}>
              <Ionicons name="navigate-circle" size={18} color="#2563EB" />
              <Text style={styles.routeText}>{activeTrip.routeName}</Text>
            </View>

            <View style={styles.metricsRow}>
              <Text style={styles.metricItem}>📍 {activeTrip.stops.length} Stops</Text>
              <Text style={styles.metricItem}>🛣️ {activeTrip.totalDistanceKm} km</Text>
              <Text style={styles.metricItem}>⏱️ ~{activeTrip.estimatedMinutes} mins</Text>
            </View>

            <TouchableOpacity
              style={styles.startRouteBtn}
              onPress={() => onStartTrip(activeTrip)}
              activeOpacity={0.85}
            >
              <Text style={styles.startRouteText}>Start Route</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Docked Bar (Screenshot 1) */}
      <View style={styles.bottomDock}>
        <View style={styles.dockLeft}>
          <Text style={styles.vendorText}>{profile.vendorName || 'Atharva Fleet'}</Text>
          <Text style={styles.plateText}>{profile.assignedVehiclePlate || 'No Assigned Vehicle'}</Text>
        </View>

        {isOnDuty ? (
          <TouchableOpacity
            style={[styles.dutyBtn, styles.endDutyBtn]}
            onPress={handleEndDutyPress}
            activeOpacity={0.8}
          >
            <Text style={styles.dutyBtnText}>End Duty</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.dutyBtn, styles.startDutyBtn]}
            onPress={() => setIsAuthModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dutyBtnText}>Start Duty</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Side Navigation Drawer (Screenshot 2) */}
      <SideDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeItem="Home"
        onNavigate={onNavigateScreen}
        profile={profile}
        hubCode={hubCode}
      />

      {/* Authentication / Start Duty Modal (Screenshot 3) */}
      <StartDutyModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleStartDutySuccess}
        defaultPhone={profile.phone.replace(/[^0-9]/g, '').slice(-10)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hamburgerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    flex: 1,
    marginLeft: spacing.sm,
  },
  hubCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
  },
  telemetryBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  telemetryText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  carCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
  },
  manifestCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  manifestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tripCodeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  corporateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF1FF',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  shiftBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: spacing.sm,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  metricItem: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  startRouteBtn: {
    backgroundColor: '#1565C0',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  startRouteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E2530',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dockLeft: {
    flex: 1,
  },
  vendorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  plateText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  dutyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  startDutyBtn: {
    backgroundColor: '#1565C0',
  },
  endDutyBtn: {
    backgroundColor: '#DC2626',
  },
  dutyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
