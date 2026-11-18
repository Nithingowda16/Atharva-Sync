/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Upcoming Trips Screen (Matches Screenshot 4)
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, typography, spacing } from '../../theme';
import { tripService } from '../../services/tripService';
import { TripRecord } from '../../types';

interface UpcomingTripsScreenProps {
  onBack: () => void;
  onStartTrip: (trip: TripRecord) => void;
  vehiclePlate: string;
}

export const UpcomingTripsScreen: React.FC<UpcomingTripsScreenProps> = ({
  onBack,
  onStartTrip,
  vehiclePlate,
}) => {
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUpcoming = async () => {
    setRefreshing(true);
    const active = await tripService.getActiveTrip();
    if (active && active.status === 'SCHEDULED') {
      setTrips([active]);
    } else {
      setTrips([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadUpcoming();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Notch/Status-bar Inset */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Trips</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUpcoming} />}
      >
        {trips.length === 0 ? (
          /* Empty State Matching Screenshot 4 */
          <View style={styles.emptyContainer}>
            <View style={styles.carCircle}>
              <Ionicons name="car-outline" size={54} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>No Upcoming Trips</Text>
            <Text style={styles.emptySubtitle}>
              No trip assigned to your cab. Please get in touch with your Transport Coordinator.
            </Text>
          </View>
        ) : (
          /* Assigned Trips List */
          <View style={styles.tripsList}>
            {trips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripCode}>{trip.tripCode}</Text>
                  <Text style={styles.shiftTime}>{trip.shiftTime}</Text>
                </View>

                <Text style={styles.routeName}>{trip.routeName}</Text>
                <Text style={styles.clientName}>{trip.corporateClient}</Text>

                <View style={styles.metricsRow}>
                  <Text style={styles.metricText}>📍 {trip.stops.length} Stops</Text>
                  <Text style={styles.metricText}>🛣️ {trip.totalDistanceKm} km</Text>
                  <Text style={styles.metricText}>⏱️ {trip.estimatedMinutes} mins</Text>
                </View>

                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => onStartTrip(trip)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startBtnText}>Start Route</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E3A8A',
    marginLeft: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  carCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
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
    maxWidth: 280,
  },
  tripsList: {
    width: '100%',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tripCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  clientName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: '#1565C0',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
