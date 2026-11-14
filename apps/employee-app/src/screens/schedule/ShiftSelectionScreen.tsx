/**
 * Atharva Travels ETS — Employee Android App
 * ShiftSelectionScreen
 * 
 * Recreates the exact visual concept from Reference Screenshot 1:
 * - Page title: "Select Shift"
 * - Date header
 * - Shift column & Travel time column, with Help/info icon
 * - Large rounded selectable cards
 * - Apply button
 * - Clean empty state when no shifts exist for the selected date
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { ShiftCard } from '../../components/booking/ShiftCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, spacing } from '../../theme';
import { ShiftRecord } from '../../types';

interface ShiftSelectionScreenProps {
  date: string;
  onBack: () => void;
  onApplyShift: (shift: ShiftRecord) => void;
  availableShifts?: ShiftRecord[];
}

export const ShiftSelectionScreen: React.FC<ShiftSelectionScreenProps> = ({
  date,
  onBack,
  onApplyShift,
  availableShifts = [],
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(
    availableShifts.length > 0 ? availableShifts[0].id : null
  );

  const selectedShift = availableShifts.find((s) => s.id === selectedShiftId);

  const handleApply = () => {
    if (selectedShift) {
      onApplyShift(selectedShift);
    }
  };

  const showHelpInfo = () => {
    Alert.alert(
      'Shift Timing Information',
      'Shift windows and estimated travel times are based on your registered pickup zone and real-time corridor traffic thresholds.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: Select Shift */}
      <AppHeader
        title="Select Shift"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />,
          onPress: showHelpInfo,
        }}
      />

      <View style={styles.contentContainer}>
        {/* Date Subheader */}
        <View style={styles.dateHeaderRow}>
          <Text style={styles.dateHeaderLabel}>Commute Date</Text>
          <Text style={styles.dateHeaderValue}>{date}</Text>
        </View>

        {/* Columns Header (Shift vs Travel time) matching reference layout */}
        <View style={styles.columnHeadersRow}>
          <Text style={styles.shiftColHeader}>Shift</Text>
          <View style={styles.travelTimeColHeader}>
            <Text style={styles.travelTimeHeaderText}>Travel time</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={showHelpInfo}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.indicatorHeaderPlaceholder} />
        </View>

        {/* Shift Cards List or Empty State */}
        <ScrollView contentContainerStyle={styles.scrollList}>
          {availableShifts.length === 0 ? (
            <EmptyState
              iconName="time-outline"
              title="No shifts available"
              description="Shifts will appear when they are available for your selected date and corporate route."
            />
          ) : (
            availableShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                selected={shift.id === selectedShiftId}
                onPress={() => setSelectedShiftId(shift.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Bottom Apply CTA */}
        {availableShifts.length > 0 && (
          <View style={styles.footerContainer}>
            <PrimaryButton
              title="Apply"
              onPress={handleApply}
              disabled={!selectedShiftId}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dateHeaderRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  dateHeaderLabel: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
  },
  dateHeaderValue: {
    ...typography.presets.sectionTitle,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },
  columnHeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  shiftColHeader: {
    flex: 1.2,
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  travelTimeColHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  travelTimeHeaderText: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicatorHeaderPlaceholder: {
    width: 22,
  },
  scrollList: {
    flexGrow: 1,
    paddingVertical: spacing.xs,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

