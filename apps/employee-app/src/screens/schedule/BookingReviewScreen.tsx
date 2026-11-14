/**
 * Atharva Travels ETS — Employee Android App
 * BookingReviewScreen
 * 
 * Strict No-Mock-Data:
 * Displays ONLY user-selected parameters. If any parameter has not been selected,
 * shows a clean placeholder.
 * CTA "Confirm Booking" transitions the local frontend state cleanly without sending to backend.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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

  const handleConfirm = () => {
    setIsSubmitting(true);
    // Phase 1 Frontend: Transitions local state smoothly
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmBooking();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Review Booking" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Confirm Your Commute</Text>
        <Text style={styles.pageSubtitle}>
          Please verify your chosen schedule before submitting for fleet allocation.
        </Text>

        {/* Selected Parameters Summary Card */}
        <BookingSummaryCard draft={draft} />

        {/* Selected Route Info (if selected) */}
        {draft.route && (
          <RoundedCard style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Ionicons name="map-outline" size={18} color={colors.primary} />
              <Text style={styles.routeTitle}>Selected Route Corridor</Text>
            </View>
            <Text style={styles.routeName}>{draft.route.routeCode} — {draft.route.name}</Text>
            <Text style={styles.routeEst}>Est. Commute Duration: {draft.route.estimatedDurationMinutes} mins</Text>
          </RoundedCard>
        )}

        {/* Policy & Escort Safety Notice */}
        <RoundedCard style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.noticeTitle}>Compliance & Roster Policy</Text>
          </View>
          <Text style={styles.noticeText}>
            • Cabs are allocated by central operations 45 mins prior to pickup time.{'\n'}
            • You will receive boarding notification and chauffeur contact when trip starts.{'\n'}
            • Cancellation allowed up to 60 mins before shift cutoff.
          </Text>
        </RoundedCard>

        {/* Bottom CTA */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title="Confirm Booking"
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  pageTitle: {
    ...typography.presets.pageTitle,
    fontSize: 22,
    color: colors.textPrimary,
  },
  pageSubtitle: {
    ...typography.presets.body,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  routeCard: {
    marginTop: spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  routeTitle: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  routeName: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
    marginTop: 2,
  },
  routeEst: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noticeCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noticeTitle: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  noticeText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: spacing.xl,
  },
});

