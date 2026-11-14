/**
 * Atharva Travels ETS — Employee Android App
 * RouteCard & BookingSummaryCard Components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteRecord, BookingDraft } from '../../types';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { IconContainer } from '../common/IconContainer';

// ============================================================================
// 1. RouteCard
// ============================================================================
interface RouteCardProps {
  route: RouteRecord;
  selected: boolean;
  onPress: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.codeTag}>
          <Text style={styles.codeTagText}>{route.routeCode}</Text>
        </View>
        <Text style={styles.directionBadge}>
          {route.direction === 'LOGIN' ? 'To Office' : 'To Home'}
        </Text>
      </View>

      <Text style={[styles.routeName, selected && styles.textSelected]}>
        {route.name}
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metricText}>{route.estimatedDurationMinutes} mins</Text>
        </View>
        {route.totalDistanceKm && (
          <View style={styles.metricItem}>
            <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{route.totalDistanceKm} km</Text>
          </View>
        )}
        {route.stopsCount && (
          <View style={styles.metricItem}>
            <Ionicons name="git-commit-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{route.stopsCount} stops</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// 2. BookingSummaryCard
// ============================================================================
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
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.borderSelected,
    backgroundColor: colors.primarySubtle,
    ...shadows.cardSelected,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  codeTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  codeTagText: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  directionBadge: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  routeName: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
  },
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

