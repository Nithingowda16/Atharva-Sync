import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * BookingReviewScreen
 * 
 * Features:
 * - Multi-trip confirmation breakdown (e.g. 5 days, 10 trips)
 * - Round-trip (Login + Logout) validation
 * - Transit Route removed completely (automated routing)
 * - Solid black action CTA with pure white theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { BookingSummaryCard } from '../../components/booking/BookingSummaryCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { BookingDraft } from '../../types';

interface BookingReviewScreenProps {
  draft: BookingDraft;
  onBack: () => void;
  onConfirmBooking: () => void;
}

export const BookingReviewScreen: React.FC<BookingReviewScreenProps> = ({
  draft,
  onBack,
  onConfirmBooking,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = draft.selectedDates && draft.selectedDates.length > 0
    ? draft.selectedDates
    : draft.date
    ? [draft.date]
    : [];

  const isBoth = draft.direction === 'BOTH';
  const totalTrips = isBoth ? dates.length * 2 : dates.length;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmBooking();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Review Booking" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Confirm Your Schedule</Text>
        <Text style={styles.pageSubtitle}>
          {totalTrips > 1
            ? `Scheduling ${totalTrips} total trips across ${dates.length} commute days with identical shifts.`
            : 'Please verify your commute schedule before submitting for fleet allocation.'}
        </Text>

        {/* Selected Parameters Summary Card */}
        <BookingSummaryCard draft={draft} />

        {/* Policy & Escort Safety Notice */}
        <RoundedCard style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#000000" />
            <Text style={styles.noticeTitle}>COMPLIANCE & FLEET DISPATCH POLICY</Text>
          </View>
          <Text style={styles.noticeText}>
            • Cabs are automatically routed via Dijkstra shortest-path algorithms 45 mins prior to pickup.{'\n'}
            • You will receive boarding notification, driver name, and cab plate when trip telemetry starts.{'\n'}
            • Cancellation or modifications allowed up to 60 mins before shift cutoff.
          </Text>
        </RoundedCard>

        {/* Bottom CTA Button */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={
              totalTrips > 1
                ? `Confirm & Schedule ${totalTrips} Trips`
                : 'Confirm Booking'
            }
            onPress={handleConfirm}
            loading={isSubmitting}
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
  pageTitle: {
    ...typography.presets.h2,
    color: '#0F172A',
    fontWeight: '800',
  },
  pageSubtitle: {
    ...typography.presets.caption,
    color: '#64748B',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  noticeCard: {
    marginTop: spacing.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noticeTitle: {
    ...typography.presets.captionSmall,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noticeText: {
    ...typography.presets.caption,
    color: '#64748B',
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: spacing.xl,
  },
});
