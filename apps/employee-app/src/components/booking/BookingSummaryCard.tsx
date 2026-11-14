/**
 * Atharva Travels ETS — Employee Android App
 * BookingSummaryCard Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDraft } from '../../types';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { IconContainer } from '../common/IconContainer';

interface BookingSummaryCardProps {
  draft: BookingDraft;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ draft }) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <IconContainer size={36}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </IconContainer>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>Travel Date</Text>
          <Text style={styles.summaryValue}>{draft.date || 'Not Selected'}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <IconContainer size={36}>
          <Ionicons
            name={draft.direction === 'LOGIN' ? 'business-outline' : 'home-outline'}
            size={18}
            color={colors.primary}
          />
        </IconContainer>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>Commute Journey</Text>
          <Text style={styles.summaryValue}>
            {draft.direction === 'LOGIN' ? 'Go to work (Login)' : 'Return home (Logout)'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <IconContainer size={36}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
        </IconContainer>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>Shift Window</Text>
          <Text style={styles.summaryValue}>
            {draft.shift ? `${draft.shift.shiftTime} (${draft.shift.travelDurationMinutes}m est)` : 'Not Selected'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <IconContainer size={36}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
        </IconContainer>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>Pickup Location</Text>
          <Text style={styles.summaryValue}>
            {draft.pickupPoint ? draft.pickupPoint.name : 'Not Selected'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTextCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  summaryLabel: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.presets.cardTitle,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 1,
  },
});

