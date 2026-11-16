/**
 * Atharva Travels ETS — Employee Android App
 * BookingSummaryCard Component
 * 
 * Features:
 * - Multi-date scheduling breakdown (e.g. 5 days / 10 trips)
 * - Round-trip (Login + Logout) shift timing display
 * - Pure white theme with solid black accents
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDraft } from '../../types';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface BookingSummaryCardProps {
  draft: BookingDraft;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ draft }) => {
  const dates = draft.selectedDates && draft.selectedDates.length > 0
    ? draft.selectedDates
    : draft.date
    ? [draft.date]
    : [];

  const isBoth = draft.direction === 'BOTH';
  const totalTrips = isBoth ? dates.length * 2 : dates.length;

  return (
    <View style={styles.summaryContainer}>
      {/* 1. Travel Dates Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar" size={18} color="#000000" />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>COMMUTE SCHEDULE DATES</Text>
          <Text style={styles.summaryValue}>
            {dates.length === 1
              ? dates[0]
              : `${dates.length} Days (${dates[0]} to ${dates[dates.length - 1]})`}
          </Text>
          {dates.length > 1 && (
            <Text style={styles.subDetailText}>
              Dates: {dates.join(', ')}
            </Text>
          )}
        </View>
      </View>

      {/* 2. Direction */}
      <View style={styles.summaryRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={isBoth ? 'swap-horizontal' : draft.direction === 'LOGIN' ? 'business' : 'home'}
            size={18}
            color="#000000"
          />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>COMMUTE DIRECTION</Text>
          <Text style={styles.summaryValue}>
            {isBoth
              ? 'Round Trip (Both Login & Logout)'
              : draft.direction === 'LOGIN'
              ? 'Office Login (Inward to Campus)'
              : 'Office Logout (Outward to Home)'}
          </Text>
        </View>
      </View>

      {/* 3. Shift Timings */}
      <View style={styles.summaryRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="time" size={18} color="#000000" />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>SHIFT TIMINGS</Text>
          {isBoth ? (
            <View style={styles.bothShiftsCol}>
              <Text style={styles.summaryValue}>
                ☀️ Login: {draft.loginShift?.shiftTime || '09:30'}
              </Text>
              <Text style={styles.summaryValue}>
                🌙 Logout: {draft.logoutShift?.shiftTime || '18:30'}
              </Text>
            </View>
          ) : (
            <Text style={styles.summaryValue}>
              {draft.shift?.shiftTime || draft.loginShift?.shiftTime || draft.logoutShift?.shiftTime || '09:30'}
            </Text>
          )}
        </View>
      </View>

      {/* 4. Boarding / Drop Location */}
      <View style={styles.summaryRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={18} color="#000000" />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryLabel}>PICKUP / DROP LOCATION</Text>
          <Text style={styles.summaryValue}>
            {draft.pickupPoint ? draft.pickupPoint.name : 'Primary Saved Address'}
          </Text>
          {draft.pickupPoint?.landmark && (
            <Text style={styles.subDetailText}>
              Landmark: {draft.pickupPoint.landmark}
            </Text>
          )}
        </View>
      </View>

      {/* 5. Total Trips Pill */}
      <View style={styles.totalTripsStrip}>
        <Ionicons name="checkmark-done-circle" size={16} color="#16A34A" />
        <Text style={styles.totalTripsText}>
          Total Confirmed Trips to Schedule: <Text style={styles.totalTripsHighlight}>{totalTrips} Trips</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  summaryLabel: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  summaryValue: {
    ...typography.presets.bodyBold,
    color: '#0F172A',
    marginTop: 2,
  },
  subDetailText: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    marginTop: 2,
  },
  bothShiftsCol: {
    gap: 2,
    marginTop: 2,
  },
  totalTripsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
    marginTop: spacing.xs,
  },
  totalTripsText: {
    ...typography.presets.captionSmall,
    color: '#15803D',
  },
  totalTripsHighlight: {
    fontWeight: '800',
    color: '#166534',
  },
});
