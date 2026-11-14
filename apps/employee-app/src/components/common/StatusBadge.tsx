/**
 * Atharva Travels ETS — Employee Android App
 * StatusBadge Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { TripStatus } from '../../types';

interface StatusBadgeProps {
  status: TripStatus | string;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  let bg: string = colors.infoSurface;
  let textCol: string = colors.info;
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'SCHEDULED':
      bg = colors.primarySurface;
      textCol = colors.primary;
      label = 'Scheduled';
      break;
    case 'DRIVER_ASSIGNED':
      bg = colors.primarySurface;
      textCol = colors.primary;
      label = 'Driver Assigned';
      break;
    case 'TRIP_STARTED':
    case 'ON_THE_WAY':
    case 'IN_TRANSIT':
      bg = colors.successSurface;
      textCol = colors.success;
      label = 'En Route';
      break;
    case 'ARRIVED_AT_STOP':
    case 'BOARDING':
      bg = colors.warningSurface;
      textCol = colors.warning;
      label = 'Boarding';
      break;
    case 'COMPLETED':
      bg = colors.successSurface;
      textCol = colors.success;
      label = 'Completed';
      break;
    case 'CANCELLED':
      bg = colors.errorSurface;
      textCol = colors.error;
      label = 'Cancelled';
      break;
    default:
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: textCol }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

