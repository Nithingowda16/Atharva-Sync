/**
 * Atharva Travels ETS — Employee Android App
 * LiveTrackingScreen
 * 
 * Strict No-Mock-Data:
 * Incorporates the LiveTrackingMapPlaceholder with radar pulse,
 * trip status progression, and emergency SOS shortcut.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LiveTrackingMapPlaceholder } from '../../components/tracking/LiveTrackingMapPlaceholder';
import { TripStatusStepper } from '../../components/tracking/TripStatusStepper';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord } from '../../types';

interface LiveTrackingScreenProps {
  ride?: RideRecord | null;
  onBack: () => void;
  onNavigateSos: () => void;
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({
  ride,
  onBack,
  onNavigateSos,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Live Fleet Radar"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="shield-outline" size={20} color={colors.error} />,
          onPress: onNavigateSos,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Telemetry Area */}
        <LiveTrackingMapPlaceholder hasActiveTelemetry={false} />

        {/* Live Status Header */}
        <RoundedCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.tripCode}>{ride?.tripCode || 'ATH-ETS-FLEET'}</Text>
              <Text style={styles.shiftText}>
                {ride?.shiftTime ? `Shift: ${ride.shiftTime}` : 'Commute Shift'}
              </Text>
            </View>
            <StatusBadge status={ride?.status || 'SCHEDULED'} />
          </View>

          <TripStatusStepper currentStatus={ride?.status || 'SCHEDULED'} />
        </RoundedCard>

        {/* Stops Summary */}
        {ride && (
          <RoundedCard style={styles.stopsCard}>
            <Text style={styles.sectionHeaderTitle}>Transit Corridor</Text>
            <View style={styles.stopItem}>
              <View style={styles.pickupDot} />
              <View style={styles.stopTextCol}>
                <Text style={styles.stopLabel}>Pickup Node</Text>
                <Text style={styles.stopTitle}>{ride.pickup.name}</Text>
              </View>
            </View>
            <View style={styles.connector} />
            <View style={styles.stopItem}>
              <View style={styles.dropDot} />
              <View style={styles.stopTextCol}>
                <Text style={styles.stopLabel}>Destination Hub</Text>
                <Text style={styles.stopTitle}>{ride.destination.name}</Text>
              </View>
            </View>
          </RoundedCard>
        )}

        {/* Chauffeur & Vehicle Placeholder (Strict No-Mock-Data) */}
        <RoundedCard style={styles.vehicleCard}>
          <Text style={styles.sectionHeaderTitle}>Assigned Chauffeur & Vehicle</Text>
          {ride?.driver && ride?.vehicle ? (
            <View style={styles.driverInfoRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.driverTextCol}>
                <Text style={styles.driverName}>{ride.driver.fullName}</Text>
                <Text style={styles.vehiclePlate}>{ride.vehicle.plateNumber}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.unassignedNotice}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.unassignedText}>
                Vehicle and chauffeur telemetry will sync once central dispatch activates the trip.
              </Text>
            </View>
          )}
        </RoundedCard>

        {/* Safety Hotline Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateSos}
          style={styles.emergencyBanner}
        >
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <View style={styles.emergencyTextCol}>
            <Text style={styles.emergencyTitle}>Emergency Transport Desk</Text>
            <Text style={styles.emergencySubtitle}>
              Tap to broadcast instant SOS alert to Atharva 24x7 Control Room
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.error} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  statusCard: {
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tripCode: {
    ...typography.presets.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  shiftText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stopsCard: {
    marginTop: spacing.md,
  },
  sectionHeaderTitle: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.success,
    marginRight: spacing.md,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderLight,
    marginLeft: 4,
    marginVertical: 2,
  },
  stopTextCol: {
    flex: 1,
  },
  stopLabel: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    color: colors.textMuted,
  },
  stopTitle: {
    ...typography.presets.bodyMedium,
    color: colors.textPrimary,
  },
  vehicleCard: {
    marginTop: spacing.md,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  driverTextCol: {
    flex: 1,
  },
  driverName: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  vehiclePlate: {
    ...typography.presets.caption,
    color: colors.textSecondary,
  },
  unassignedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  unassignedText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.error,
  },
  emergencySubtitle: {
    ...typography.presets.captionSmall,
    color: colors.error,
    opacity: 0.85,
    marginTop: 1,
  },
});

