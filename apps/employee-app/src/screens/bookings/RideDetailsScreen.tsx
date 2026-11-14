/**
 * Atharva Travels ETS — Employee Android App
 * RideDetailsScreen
 * 
 * Strict No-Mock-Data:
 * Graceful unassigned states for Driver and Vehicle cards when central dispatch
 * has not yet assigned a vehicle.
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
import { PrimaryButton, SecondaryButton } from '../../components/common/PrimaryButton';
import { TripStatusStepper } from '../../components/tracking/TripStatusStepper';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord } from '../../types';

interface RideDetailsScreenProps {
  ride?: RideRecord | null;
  onBack: () => void;
  onNavigateTracking: (ride: RideRecord) => void;
  onNavigateQr: (ride: RideRecord) => void;
}

export const RideDetailsScreen: React.FC<RideDetailsScreenProps> = ({
  ride,
  onBack,
  onNavigateTracking,
  onNavigateQr,
}) => {
  if (!ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Ride Details" onBack={onBack} />
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No ride selected</Text>
          <Text style={styles.emptySubtitle}>
            Please select an active or scheduled ride from your bookings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Ride Details" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Stepper */}
        <RoundedCard style={styles.stepperCard}>
          <View style={styles.stepperHeader}>
            <Text style={styles.tripCode}>{ride.tripCode}</Text>
            <StatusBadge status={ride.status} />
          </View>
          <TripStatusStepper currentStatus={ride.status} />
        </RoundedCard>

        {/* Schedule & Timing Card */}
        <RoundedCard style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Shift & Schedule</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{ride.date}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Shift Time</Text>
              <Text style={styles.infoValue}>{ride.shiftTime}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Direction</Text>
              <Text style={styles.infoValue}>
                {ride.direction === 'LOGIN' ? 'Login (To Work)' : 'Logout (To Home)'}
              </Text>
            </View>
          </View>
        </RoundedCard>

        {/* Pickup & Destination Card */}
        <RoundedCard style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Pickup & Drop Points</Text>

          <View style={styles.stopBlock}>
            <View style={styles.pickupDot} />
            <View style={styles.stopTextCol}>
              <Text style={styles.stopLabel}>Pickup Point</Text>
              <Text style={styles.stopTitle}>{ride.pickup.name}</Text>
              {ride.pickup.landmark && (
                <Text style={styles.stopSubtitle}>Landmark: {ride.pickup.landmark}</Text>
              )}
            </View>
          </View>

          <View style={styles.stopConnectorLine} />

          <View style={styles.stopBlock}>
            <View style={styles.dropDot} />
            <View style={styles.stopTextCol}>
              <Text style={styles.stopLabel}>Destination Office</Text>
              <Text style={styles.stopTitle}>{ride.destination.name}</Text>
              <Text style={styles.stopSubtitle}>{ride.destination.campus}</Text>
            </View>
          </View>
        </RoundedCard>

        {/* Assigned Vehicle Section (Graceful Unassigned State) */}
        <RoundedCard style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Assigned Cab</Text>
          {ride.vehicle ? (
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIconCircle}>
                <Ionicons name="car" size={24} color={colors.primary} />
              </View>
              <View style={styles.vehicleTextCol}>
                <Text style={styles.vehiclePlate}>{ride.vehicle.plateNumber}</Text>
                <Text style={styles.vehicleModel}>
                  {ride.vehicle.make} {ride.vehicle.model}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.unassignedBox}>
              <Ionicons name="time-outline" size={20} color={colors.textMuted} />
              <View style={styles.unassignedTextCol}>
                <Text style={styles.unassignedTitle}>No vehicle assigned yet</Text>
                <Text style={styles.unassignedDesc}>
                  Central operations allocates vehicles 45 mins prior to shift window.
                </Text>
              </View>
            </View>
          )}
        </RoundedCard>

        {/* Assigned Driver Section (Graceful Unassigned State) */}
        <RoundedCard style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Assigned Chauffeur</Text>
          {ride.driver ? (
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.driverTextCol}>
                <Text style={styles.driverName}>{ride.driver.fullName}</Text>
                <Text style={styles.driverPhone}>{ride.driver.phone}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.callButton}
                accessibilityLabel="Call driver"
              >
                <Ionicons name="call" size={18} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.unassignedBox}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <View style={styles.unassignedTextCol}>
                <Text style={styles.unassignedTitle}>No driver assigned yet</Text>
                <Text style={styles.unassignedDesc}>
                  Chauffeur contact details will be visible once dispatch assigns the route.
                </Text>
              </View>
            </View>
          )}
        </RoundedCard>

        {/* Action CTAs */}
        <View style={styles.actionButtonsCol}>
          <PrimaryButton
            title="View Live Tracking"
            onPress={() => onNavigateTracking(ride)}
            icon={<Ionicons name="navigate-outline" size={18} color={colors.textWhite} />}
          />
          <SecondaryButton
            title="Display Boarding QR"
            onPress={() => onNavigateQr(ride)}
            icon={<Ionicons name="qr-code-outline" size={18} color={colors.primary} />}
            style={{ marginTop: spacing.sm }}
          />
        </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  stepperCard: {
    marginBottom: spacing.md,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tripCode: {
    ...typography.presets.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeaderTitle: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.presets.cardTitle,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  stopBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: spacing.md,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.success,
    marginTop: 5,
    marginRight: spacing.md,
  },
  stopConnectorLine: {
    width: 2,
    height: 24,
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
  stopSubtitle: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vehicleTextCol: {
    flex: 1,
  },
  vehiclePlate: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  vehicleModel: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
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
  driverPhone: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unassignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  unassignedTextCol: {
    flex: 1,
  },
  unassignedTitle: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  unassignedDesc: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtonsCol: {
    marginTop: spacing.md,
  },
});

