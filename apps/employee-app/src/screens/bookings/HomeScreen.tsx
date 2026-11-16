import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * HomeScreen (Dashboard & Bookings Overview)
 * 
 * Strict No-Mock-Data:
 * Displays genuine empty state when no ride is scheduled, with prominent CTA
 * to Schedule Ride. Includes quick Emergency SOS button.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoundedCard } from '../../components/common/RoundedCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord } from '../../types';

interface HomeScreenProps {
  user?: any;
  activeRide?: RideRecord | null;
  onNavigateFlexiSchedule: () => void;
  onNavigateRentalz: () => void;
  onNavigateSchedule?: () => void;
  onNavigateMyBookings: () => void;
  onNavigateRideDetails: (ride: RideRecord) => void;
  onNavigateLiveTracking: (ride: RideRecord) => void;
  onNavigateQrBoarding: (ride: RideRecord) => void;
  onNavigateSos: () => void;
  onNavigateNotifications: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  activeRide = null,
  onNavigateFlexiSchedule,
  onNavigateRentalz,
  onNavigateSchedule,
  onNavigateMyBookings,
  onNavigateRideDetails,
  onNavigateLiveTracking,
  onNavigateQrBoarding,
  onNavigateSos,
  onNavigateNotifications,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandTitleCol}>
          <Text style={styles.greetingText}>HI RIDERS</Text>
          <Text style={styles.headerSubtitle}>Enterprise Mobility Platform</Text>
        </View>

        <View style={styles.topBarActions}>
          {/* Emergency SOS Quick Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateSos}
            style={styles.sosButton}
            accessibilityLabel="Emergency SOS"
          >
            <Ionicons name="shield-outline" size={16} color={colors.error} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNavigateNotifications}
            style={styles.iconButton}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Today's Commute Section */}
        <SectionHeader
          title="Today's Commute"
          subtitle="Real-time shift pickup and drop tracking"
        />

        {activeRide ? (
          // Active / Scheduled Ride Card
          <RoundedCard style={styles.activeRideCard}>
            <View style={styles.rideHeaderRow}>
              <View style={styles.directionTag}>
                <Ionicons
                  name={activeRide.direction === 'LOGIN' ? 'business-outline' : 'home-outline'}
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.directionText}>
                  {activeRide.direction === 'LOGIN' ? 'GO TO WORK' : 'RETURN HOME'}
                </Text>
              </View>
              <StatusBadge status={activeRide.status} />
            </View>

            <View style={styles.timeLocationBlock}>
              <Text style={styles.shiftTimeText}>{activeRide.shiftTime}</Text>
              <Text style={styles.tripDateText}>{activeRide.date}</Text>
            </View>

            {/* Stops Route Flow */}
            <View style={styles.routeFlow}>
              <View style={styles.stopRow}>
                <View style={styles.pickupDot} />
                <View style={styles.stopTextCol}>
                  <Text style={styles.stopLabel}>Pickup</Text>
                  <Text style={styles.stopName} numberOfLines={1}>
                    {activeRide.pickup.name}
                  </Text>
                </View>
              </View>

              <View style={styles.stopConnectorLine} />

              <View style={styles.stopRow}>
                <View style={styles.dropDot} />
                <View style={styles.stopTextCol}>
                  <Text style={styles.stopLabel}>Destination</Text>
                  <Text style={styles.stopName} numberOfLines={1}>
                    {activeRide.destination.name}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigateQrBoarding(activeRide)}
                style={styles.secondaryCardButton}
              >
                <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Boarding QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigateLiveTracking(activeRide)}
                style={styles.primaryCardButton}
              >
                <Ionicons name="navigate-outline" size={16} color={colors.textWhite} />
                <Text style={styles.primaryButtonText}>Live Tracking</Text>
              </TouchableOpacity>
            </View>
          </RoundedCard>
        ) : (
          // Strict No-Mock-Data Empty State
          <RoundedCard style={styles.emptyCard}>
            <EmptyState
              iconName="calendar-outline"
              title="No active trips yet"
              description="You have no active rides scheduled for today. Book your commute with Flexi Schedule or request a corporate Rental."
              actionTitle="Flexi Schedule"
              onAction={onNavigateFlexiSchedule}
            />
          </RoundedCard>
        )}

        {/* Corporate Mobility Services */}
        <SectionHeader
          title="Mobility Services"
          subtitle="Enterprise corporate car rentals & flexible shift scheduling"
          style={{ marginTop: spacing.lg }}
        />

        <View style={styles.quickTilesGrid}>
          {/* Tile 1: Rentalz */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onNavigateRentalz}
            style={styles.tile}
          >
            <View style={styles.tileIconContainer}>
              <Ionicons name="car-sport-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.tileTitle}>Rentalz</Text>
            <Text style={styles.tileSubtitle}>Executive hourly car rentals</Text>
          </TouchableOpacity>

          {/* Tile 2: Flexi Schedule */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onNavigateFlexiSchedule}
            style={styles.tile}
          >
            <View style={styles.tileIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.tileTitle}>Flexi Schedule</Text>
            <Text style={styles.tileSubtitle}>Multi-day & flexible shift commute</Text>
          </TouchableOpacity>
        </View>

        {/* Transport Advisory Card */}
        <RoundedCard style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.advisoryTitle}>Statutory Safety Standards</Text>
          </View>
          <Text style={styles.advisoryBody}>
            Female employees on shifts between 20:00 and 06:00 are accompanied by trained, verified security escorts in compliance with Karnataka Transport Guidelines.
          </Text>
        </RoundedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  brandTitleCol: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.presets.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    elevation: 2,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  sosText: {
    ...typography.presets.captionSmall,
    fontWeight: '800',
    color: colors.error,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  activeRideCard: {
    padding: spacing.lg,
  },
  emptyCard: {
    padding: spacing.none,
  },
  rideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  directionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  directionText: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  timeLocationBlock: {
    marginBottom: spacing.md,
  },
  shiftTimeText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tripDateText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeFlow: {
    marginVertical: spacing.sm,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7900',
    marginRight: spacing.md,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.success,
    marginRight: spacing.md,
  },
  stopConnectorLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
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
  stopName: {
    ...typography.presets.bodyMedium,
    color: colors.textPrimary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  secondaryCardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  secondaryButtonText: {
    ...typography.presets.button,
    fontSize: 13,
    color: colors.primary,
  },
  primaryCardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    ...typography.presets.button,
    fontSize: 13,
    color: colors.textWhite,
  },
  quickTilesGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  tileSubtitle: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  advisoryCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  advisoryTitle: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  advisoryBody: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

