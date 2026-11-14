/**
 * Atharva Travels ETS — Employee Android App
 * CreateScheduleScreen
 * 
 * Recreates the structure from Reference Screenshot 4:
 * - Travel date selection
 * - Journey selection ("Go to work" vs "Return home")
 * - Pickup location selector
 * - Destination office selector
 * - Shift selector
 * - Route selector
 * - "Continue" CTA
 */

import React, { useState } from 'react';
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
import { DateSelector } from '../../components/booking/DateSelector';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { BookingDraft, JourneyDirection, ShiftRecord, PickupPoint, DestinationOffice, RouteRecord } from '../../types';

interface CreateScheduleScreenProps {
  onBack: () => void;
  onOpenShiftSelection: () => void;
  onOpenPickupSelection: () => void;
  onOpenRouteSelection: () => void;
  onContinueReview: (draft: BookingDraft) => void;
  draft: BookingDraft;
  onUpdateDraft: (updated: Partial<BookingDraft>) => void;
}

export const CreateScheduleScreen: React.FC<CreateScheduleScreenProps> = ({
  onBack,
  onOpenShiftSelection,
  onOpenPickupSelection,
  onOpenRouteSelection,
  onContinueReview,
  draft,
  onUpdateDraft,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    draft.date || new Date().toISOString().split('T')[0]
  );

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onUpdateDraft({ date });
  };

  const handleDirectionChange = (direction: JourneyDirection) => {
    onUpdateDraft({ direction });
  };

  const isReadyToReview = Boolean(draft.date && draft.shift && draft.pickupPoint);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Create Schedule" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Travel Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Date</Text>
          <Text style={styles.sectionSubtitle}>Select the date for employee transit</Text>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
          />
        </View>

        {/* Section 2: Journey Selection (Go to work vs Return home) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Type</Text>
          <Text style={styles.sectionSubtitle}>Choose your commute direction</Text>

          <View style={styles.directionRow}>
            {/* Option A: Go to work */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDirectionChange('LOGIN')}
              style={[
                styles.directionCard,
                draft.direction === 'LOGIN' ? styles.directionCardActive : styles.directionCardInactive,
              ]}
            >
              <View
                style={[
                  styles.directionIconCircle,
                  draft.direction === 'LOGIN' && styles.directionIconCircleActive,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={draft.direction === 'LOGIN' ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.directionTitle,
                  draft.direction === 'LOGIN' && styles.directionTextActive,
                ]}
              >
                Go to work
              </Text>
              <Text style={styles.directionCaption}>Office Login</Text>
            </TouchableOpacity>

            {/* Option B: Return home */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDirectionChange('LOGOUT')}
              style={[
                styles.directionCard,
                draft.direction === 'LOGOUT' ? styles.directionCardActive : styles.directionCardInactive,
              ]}
            >
              <View
                style={[
                  styles.directionIconCircle,
                  draft.direction === 'LOGOUT' && styles.directionIconCircleActive,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={draft.direction === 'LOGOUT' ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.directionTitle,
                  draft.direction === 'LOGOUT' && styles.directionTextActive,
                ]}
              >
                Return home
              </Text>
              <Text style={styles.directionCaption}>Office Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Shift Selector Tile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift Timing</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenShiftSelection}
            style={[
              styles.selectorCard,
              draft.shift && styles.selectorCardSelected,
            ]}
          >
            <View style={styles.selectorIconCircle}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.selectorTextCol}>
              <Text style={styles.selectorLabel}>Shift Window</Text>
              <Text
                style={[
                  styles.selectorValue,
                  !draft.shift && styles.placeholderValue,
                ]}
              >
                {draft.shift ? `${draft.shift.shiftTime} (${draft.shift.travelDurationMinutes}m travel)` : 'Select shift'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 4: Pickup Location Tile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenPickupSelection}
            style={[
              styles.selectorCard,
              draft.pickupPoint && styles.selectorCardSelected,
            ]}
          >
            <View style={styles.selectorIconCircle}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.selectorTextCol}>
              <Text style={styles.selectorLabel}>Boarding Stop</Text>
              <Text
                style={[
                  styles.selectorValue,
                  !draft.pickupPoint && styles.placeholderValue,
                ]}
              >
                {draft.pickupPoint ? draft.pickupPoint.name : 'Select pickup location'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 5: Transit Route Tile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transit Route</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenRouteSelection}
            style={[
              styles.selectorCard,
              draft.route && styles.selectorCardSelected,
            ]}
          >
            <View style={styles.selectorIconCircle}>
              <Ionicons name="map-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.selectorTextCol}>
              <Text style={styles.selectorLabel}>Company Corridor</Text>
              <Text
                style={[
                  styles.selectorValue,
                  !draft.route && styles.placeholderValue,
                ]}
              >
                {draft.route ? `${draft.route.routeCode} — ${draft.route.name}` : 'Select route (Optional)'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title="Continue"
            onPress={() => onContinueReview(draft)}
            disabled={!isReadyToReview}
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  directionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  directionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionCardInactive: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  directionCardActive: {
    borderWidth: 2,
    borderColor: colors.borderSelected,
    backgroundColor: colors.primarySubtle,
    ...shadows.cardSelected,
  },
  directionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  directionIconCircleActive: {
    backgroundColor: colors.primarySurface,
  },
  directionTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
    marginTop: 4,
  },
  directionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  directionCaption: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  selectorCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  selectorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectorTextCol: {
    flex: 1,
  },
  selectorLabel: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
  },
  selectorValue: {
    ...typography.presets.cardTitle,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 1,
  },
  placeholderValue: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  ctaContainer: {
    marginTop: spacing.md,
  },
});

