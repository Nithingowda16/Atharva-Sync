/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Completed Trips Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing } from '../../theme';
import { offlineStorage } from '../../services/offlineStorage';
import { TripRecord } from '../../types';

interface CompletedTripsScreenProps {
  onBack: () => void;
}

export const CompletedTripsScreen: React.FC<CompletedTripsScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [completedList, setCompletedList] = useState<TripRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const active = await offlineStorage.getActiveManifest();
      if (active && active.status === 'COMPLETED') {
        setCompletedList([active]);
      } else {
        setCompletedList([]);
      }
    };
    load();
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
        <Text style={styles.headerTitle}>Completed Trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {completedList.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
              No Completed Trips
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Completed duty manifests will appear here once finalized.
            </Text>
          </View>
        ) : (
          completedList.map((trip) => (
            <View key={trip.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.tripCode}>{trip.tripCode}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>COMPLETED</Text>
                </View>
              </View>

              <Text style={styles.route}>{trip.routeName}</Text>
              <Text style={styles.meta}>
                {trip.shiftDate} • {trip.shiftTime} • {trip.totalDistanceKm} km
              </Text>
            </View>
          ))
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
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tripCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
  },
  route: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
});
