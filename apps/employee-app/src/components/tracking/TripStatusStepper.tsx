/**
 * Atharva Travels ETS — Employee Android App
 * TripStatusStepper Component
 * 
 * Clean visual progression for the trip lifecycle states:
 * Scheduled -> Driver Assigned -> En Route -> Boarding -> In Transit -> Completed
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripStatus } from '../../types';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface TripStatusStepperProps {
  currentStatus: TripStatus;
}

const STEPS: { status: TripStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'SCHEDULED', label: 'Scheduled', icon: 'calendar-outline' },
  { status: 'DRIVER_ASSIGNED', label: 'Assigned', icon: 'car-outline' },
  { status: 'ON_THE_WAY', label: 'On Way', icon: 'navigate-outline' },
  { status: 'BOARDING', label: 'Boarding', icon: 'qr-code-outline' },
  { status: 'COMPLETED', label: 'Completed', icon: 'checkmark-circle-outline' },
];

export const TripStatusStepper: React.FC<TripStatusStepperProps> = ({ currentStatus }) => {
  const getStepIndex = (st: TripStatus): number => {
    switch (st) {
      case 'SCHEDULED':
        return 0;
      case 'DRIVER_ASSIGNED':
        return 1;
      case 'TRIP_STARTED':
      case 'ON_THE_WAY':
      case 'APPROACHING_STOP':
      case 'ARRIVED_AT_STOP':
        return 2;
      case 'BOARDING':
      case 'DEPARTED':
      case 'IN_TRANSIT':
      case 'ARRIVED':
        return 3;
      case 'COMPLETED':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <View style={styles.cancelledBanner}>
        <Ionicons name="close-circle" size={18} color={colors.error} />
        <Text style={styles.cancelledText}>This ride has been cancelled.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isUpcoming = idx > currentIndex;

        return (
          <React.Fragment key={step.status}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                  isUpcoming && styles.circleUpcoming,
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark' : step.icon}
                  size={14}
                  color={
                    isCompleted || isCurrent ? colors.textWhite : colors.textMuted
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isCurrent && styles.stepLabelCurrent,
                  isCompleted && styles.stepLabelCompleted,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>

            {idx < STEPS.length - 1 && (
              <View
                style={[
                  styles.connectorLine,
                  idx < currentIndex ? styles.connectorCompleted : styles.connectorUpcoming,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleUpcoming: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    color: colors.textMuted,
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: colors.textPrimary,
  },
  connectorLine: {
    height: 2,
    flex: 0.8,
    marginBottom: 16,
  },
  connectorUpcoming: {
    backgroundColor: colors.borderLight,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    gap: spacing.sm,
  },
  cancelledText: {
    ...typography.presets.bodyMedium,
    color: colors.error,
    fontSize: 13,
  },
});

