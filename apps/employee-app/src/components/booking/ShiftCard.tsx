/**
 * Atharva Travels ETS — Employee Android App
 * ShiftCard Component
 * 
 * Recreates the exact row visual from Reference Screenshot 1 ("Select Shift"):
 * - Shift column (Shift time e.g., 08:30 AM)
 * - Travel time column (Duration e.g., 45 mins)
 * - Subtle border unselected, deep royal blue border selected
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftRecord } from '../../types';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';

interface ShiftCardProps {
  shift: ShiftRecord;
  selected: boolean;
  onPress: () => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
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
      <View style={styles.shiftCol}>
        <Text style={[styles.shiftTime, selected && styles.textSelected]}>
          {shift.shiftTime}
        </Text>
        {shift.shiftWindow && (
          <Text style={styles.shiftWindowText}>{shift.shiftWindow}</Text>
        )}
      </View>

      <View style={styles.travelTimeCol}>
        <Text style={[styles.travelDuration, selected && styles.textSelected]}>
          {shift.travelDurationMinutes} mins
        </Text>
        <Text style={styles.estLabel}>Est. Commute</Text>
      </View>

      <View
        style={[
          styles.radioCircle,
          selected ? styles.radioSelected : styles.radioUnselected,
        ]}
      >
        {selected && (
          <View style={styles.radioInnerDot} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
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
  shiftCol: {
    flex: 1.2,
  },
  shiftTime: {
    ...typography.presets.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  shiftWindowText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  travelTimeCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  travelDuration: {
    ...typography.presets.cardTitle,
    fontSize: 15,
    color: colors.textPrimary,
  },
  estLabel: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
});

