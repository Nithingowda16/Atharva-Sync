import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * CreateScheduleScreen
 * 
 * Features:
 * - Multiple date selection (e.g. 1 whole week Mon-Fri same shift booking)
 * - Journey Direction: "Go to work", "Return home", and "Both (Round Trip)"
 * - Shift timing selection for Login, Logout, or Both (Morning & Evening)
 * - Auto-populated pickup location from saved profile address
 * - Transit Route selector completely removed (automated via Dijkstra routing)
 * - Pure white theme with solid black buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { DateSelector } from '../../components/booking/DateSelector';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import {
  BookingDraft,
  JourneyDirection,
  ShiftRecord,
  PickupPoint,
  DestinationOffice,
} from '../../types';

interface CreateScheduleScreenProps {
  onBack: () => void;
  onOpenShiftSelection: (directionTarget?: 'LOGIN' | 'LOGOUT') => void;
  onOpenPickupSelection: () => void;
  onContinueReview: (draft: BookingDraft) => void;
  draft: BookingDraft;
  onUpdateDraft: (updated: Partial<BookingDraft>) => void;
}

const DEFAULT_LOGIN_SHIFT: ShiftRecord = {
  id: 'shift-0930',
  shiftTime: '09:30',
  travelDurationMinutes: 35,
  direction: 'LOGIN',
  shiftWindow: 'Pickup window: 08:45 - 09:00',
  cutoffTime: '07:30',
  isAvailable: true,
};

const DEFAULT_LOGOUT_SHIFT: ShiftRecord = {
  id: 'shift-1830',
  shiftTime: '18:30',
  travelDurationMinutes: 35,
  direction: 'LOGOUT',
  shiftWindow: 'Drop window: 19:15 - 19:30',
  cutoffTime: '16:30',
  isAvailable: true,
};

export const CreateScheduleScreen: React.FC<CreateScheduleScreenProps> = ({
  onBack,
  onOpenShiftSelection,
  onOpenPickupSelection,
  onContinueReview,
  draft,
  onUpdateDraft,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];

  // Multiple Dates Selection state
  const [selectedDates, setSelectedDates] = useState<string[]>(
    draft.selectedDates && draft.selectedDates.length > 0
      ? draft.selectedDates
      : draft.date
      ? [draft.date]
      : [todayIso]
  );

  // Direction state (LOGIN | LOGOUT | BOTH)
  const currentDirection = draft.direction || 'BOTH';

  // Shifts state
  const loginShift = draft.loginShift || (draft.shift?.direction === 'LOGIN' ? draft.shift : DEFAULT_LOGIN_SHIFT);
  const logoutShift = draft.logoutShift || (draft.shift?.direction === 'LOGOUT' ? draft.shift : DEFAULT_LOGOUT_SHIFT);

  // Sync dates with parent draft
  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    onUpdateDraft({
      selectedDates: dates,
      date: dates[0] || todayIso,
    });
  };

  const handleToggleSingleDate = (dateStr: string) => {
    let updated: string[];
    if (selectedDates.includes(dateStr)) {
      if (selectedDates.length > 1) {
        updated = selectedDates.filter((d) => d !== dateStr);
      } else {
        updated = selectedDates;
      }
    } else {
      updated = [...selectedDates, dateStr].sort();
    }
    handleDatesChange(updated);
  };

  const handleDirectionChange = (dir: JourneyDirection) => {
    onUpdateDraft({
      direction: dir,
      shift: dir === 'LOGOUT' ? logoutShift : loginShift,
      loginShift,
      logoutShift,
    });
  };

  // Ensure default shifts and dates exist in draft
  useEffect(() => {
    if (!draft.selectedDates) {
      onUpdateDraft({
        selectedDates,
        date: selectedDates[0],
        loginShift,
        logoutShift,
        shift: currentDirection === 'LOGOUT' ? logoutShift : loginShift,
      });
    }
  }, []);

  const totalTripsCount =
    currentDirection === 'BOTH'
      ? selectedDates.length * 2
      : selectedDates.length;

  const isReadyToReview = Boolean(
    selectedDates.length > 0 &&
    draft.pickupPoint &&
    (currentDirection === 'BOTH' ? (loginShift && logoutShift) : (loginShift || logoutShift))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Schedule Commute" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Travel Dates Selection (Multi-Date / Week Booking) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Travel Dates</Text>
            <View style={styles.datesCountPill}>
              <Text style={styles.datesCountPillText}>
                {selectedDates.length} {selectedDates.length === 1 ? 'DAY' : 'DAYS'} SELECTED
              </Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select multiple days or an entire work week to apply identical shifts
          </Text>

          <DateSelector
            selectedDates={selectedDates}
            onSelectMultipleDates={handleDatesChange}
            onToggleDate={handleToggleSingleDate}
          />
        </View>

        {/* Section 2: Commute Journey Type (LOGIN, LOGOUT, or BOTH) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Direction</Text>
          <Text style={styles.sectionSubtitle}>Choose your shift transit directions</Text>

          <View style={styles.directionRow}>
            {/* Option A: Go to work (Login) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDirectionChange('LOGIN')}
              style={[
                styles.directionCard,
                currentDirection === 'LOGIN' ? styles.directionCardActive : styles.directionCardInactive,
              ]}
            >
              <View
                style={[
                  styles.directionIconCircle,
                  currentDirection === 'LOGIN' && styles.directionIconCircleActive,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={currentDirection === 'LOGIN' ? '#FFFFFF' : '#0F172A'}
                />
              </View>
              <Text
                style={[
                  styles.directionTitle,
                  currentDirection === 'LOGIN' && styles.directionTextActive,
                ]}
              >
                Go to work
              </Text>
              <Text style={styles.directionCaption}>Office Login</Text>
            </TouchableOpacity>

            {/* Option B: Return home (Logout) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDirectionChange('LOGOUT')}
              style={[
                styles.directionCard,
                currentDirection === 'LOGOUT' ? styles.directionCardActive : styles.directionCardInactive,
              ]}
            >
              <View
                style={[
                  styles.directionIconCircle,
                  currentDirection === 'LOGOUT' && styles.directionIconCircleActive,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={currentDirection === 'LOGOUT' ? '#FFFFFF' : '#0F172A'}
                />
              </View>
              <Text
                style={[
                  styles.directionTitle,
                  currentDirection === 'LOGOUT' && styles.directionTextActive,
                ]}
              >
                Return home
              </Text>
              <Text style={styles.directionCaption}>Office Logout</Text>
            </TouchableOpacity>

            {/* Option C: BOTH (Login & Logout Round Trip) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDirectionChange('BOTH')}
              style={[
                styles.directionCard,
                currentDirection === 'BOTH' ? styles.directionCardActive : styles.directionCardInactive,
              ]}
            >
              <View
                style={[
                  styles.directionIconCircle,
                  currentDirection === 'BOTH' && styles.directionIconCircleActive,
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={18}
                  color={currentDirection === 'BOTH' ? '#FFFFFF' : '#0F172A'}
                />
              </View>
              <Text
                style={[
                  styles.directionTitle,
                  currentDirection === 'BOTH' && styles.directionTextActive,
                ]}
              >
                Both Ways
              </Text>
              <Text style={styles.directionCaption}>Login + Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Shift Timing Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift Timing</Text>
          <Text style={styles.sectionSubtitle}>
            {currentDirection === 'BOTH'
              ? 'Configure morning pickup and evening drop timings'
              : 'Select your scheduled shift timing'}
          </Text>

          {/* If BOTH or LOGIN: Render Morning Login Shift Tile */}
          {(currentDirection === 'BOTH' || currentDirection === 'LOGIN') && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onOpenShiftSelection('LOGIN')}
              style={styles.selectorCard}
            >
              <View style={styles.selectorIconCircle}>
                <Ionicons name="sunny-outline" size={20} color="#000000" />
              </View>
              <View style={styles.selectorTextCol}>
                <View style={styles.shiftLabelRow}>
                  <Text style={styles.selectorLabel}>OFFICE LOGIN SHIFT</Text>
                  <View style={styles.directionTag}>
                    <Text style={styles.directionTagText}>INWARD</Text>
                  </View>
                </View>
                <Text style={styles.selectorValue}>
                  {loginShift ? `${loginShift.shiftTime} (${loginShift.travelDurationMinutes || 35}m travel)` : 'Select morning shift'}
                </Text>
                {loginShift?.shiftWindow && (
                  <Text style={styles.selectorSubtext}>{loginShift.shiftWindow}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}

          {/* If BOTH or LOGOUT: Render Evening Logout Shift Tile */}
          {(currentDirection === 'BOTH' || currentDirection === 'LOGOUT') && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onOpenShiftSelection('LOGOUT')}
              style={[styles.selectorCard, currentDirection === 'BOTH' && { marginTop: spacing.sm }]}
            >
              <View style={styles.selectorIconCircle}>
                <Ionicons name="moon-outline" size={20} color="#000000" />
              </View>
              <View style={styles.selectorTextCol}>
                <View style={styles.shiftLabelRow}>
                  <Text style={styles.selectorLabel}>OFFICE LOGOUT SHIFT</Text>
                  <View style={styles.directionTag}>
                    <Text style={styles.directionTagText}>OUTWARD</Text>
                  </View>
                </View>
                <Text style={styles.selectorValue}>
                  {logoutShift ? `${logoutShift.shiftTime} (${logoutShift.travelDurationMinutes || 35}m travel)` : 'Select evening shift'}
                </Text>
                {logoutShift?.shiftWindow && (
                  <Text style={styles.selectorSubtext}>{logoutShift.shiftWindow}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Section 4: Pickup Location Tile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <Text style={styles.sectionSubtitle}>
            {currentDirection === 'LOGOUT' ? 'Destination drop location for home drop' : 'Boarding location for office commute'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenPickupSelection}
            style={styles.selectorCard}
          >
            <View style={styles.selectorIconCircle}>
              <Ionicons name="location-outline" size={20} color="#000000" />
            </View>
            <View style={styles.selectorTextCol}>
              <Text style={styles.selectorLabel}>BOARDING / DROP POINT</Text>
              <Text style={styles.selectorValue}>
                {draft.pickupPoint ? draft.pickupPoint.name : 'Select pickup location'}
              </Text>
              {draft.pickupPoint?.landmark && (
                <Text style={styles.selectorSubtext}>Landmark: {draft.pickupPoint.landmark}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Multi-Trip Summary Banner */}
        <View style={styles.summaryBanner}>
          <Ionicons name="calendar" size={18} color="#000000" />
          <View style={styles.summaryBannerTextCol}>
            <Text style={styles.summaryBannerTitle}>
              Scheduling {totalTripsCount} Total Trips
            </Text>
            <Text style={styles.summaryBannerSubtitle}>
              {selectedDates.length} days • {currentDirection === 'BOTH' ? 'Round-trip (Login + Logout)' : currentDirection}
            </Text>
          </View>
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={
              totalTripsCount > 1
                ? `Continue (${totalTripsCount} Trips Selected)`
                : 'Continue to Review'
            }
            onPress={() =>
              onContinueReview({
                ...draft,
                selectedDates,
                date: selectedDates[0],
                direction: currentDirection,
                loginShift,
                logoutShift,
                shift: currentDirection === 'LOGOUT' ? logoutShift : loginShift,
              })
            }
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.presets.sectionTitle,
    color: '#0F172A',
  },
  datesCountPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  datesCountPillText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    ...typography.presets.caption,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  directionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  directionCard: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionCardInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  directionCardActive: {
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  directionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  directionIconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  directionTitle: {
    ...typography.presets.captionBold,
    color: '#0F172A',
    textAlign: 'center',
  },
  directionTextActive: {
    color: '#FFFFFF',
  },
  directionCaption: {
    ...typography.presets.captionSmall,
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  selectorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorTextCol: {
    flex: 1,
  },
  shiftLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  selectorLabel: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  directionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  directionTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectorValue: {
    ...typography.presets.bodyBold,
    color: '#0F172A',
  },
  selectorSubtext: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    marginTop: 2,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  summaryBannerTextCol: {
    flex: 1,
  },
  summaryBannerTitle: {
    ...typography.presets.captionBold,
    color: '#0F172A',
  },
  summaryBannerSubtitle: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    marginTop: 1,
  },
  ctaContainer: {
    marginTop: spacing.sm,
  },
});
