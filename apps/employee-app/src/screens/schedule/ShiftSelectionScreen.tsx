import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * HI RIDERS — Employee Android App
 * ShiftSelectionScreen
 * 
 * Features:
 * - Direct shift timing selection with real-time corporate shifts
 * - Quick-select shift timing chips (09:30, 13:30, 14:00, 17:30, 18:30, 21:30, 22:30)
 * - Custom shift timing input box for custom corporate hours
 * - Shift column & Travel time column with Help info
 * - Selectable shift cards with radio indicators
 * - Solid black "Apply" CTA button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { ShiftCard } from '../../components/booking/ShiftCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { ShiftRecord, JourneyDirection } from '../../types';

interface ShiftSelectionScreenProps {
  date: string;
  direction?: 'LOGIN' | 'LOGOUT';
  onBack: () => void;
  onApplyShift: (shift: ShiftRecord) => void;
  availableShifts?: ShiftRecord[];
}

const DEFAULT_LOGIN_SHIFTS: ShiftRecord[] = [
  {
    id: 'shift-0900',
    shiftTime: '09:00',
    travelDurationMinutes: 35,
    direction: 'LOGIN',
    shiftWindow: 'Pickup window: 08:15 - 08:30',
    cutoffTime: '07:00',
    isAvailable: true,
  },
  {
    id: 'shift-0930',
    shiftTime: '09:30',
    travelDurationMinutes: 35,
    direction: 'LOGIN',
    shiftWindow: 'Pickup window: 08:45 - 09:00',
    cutoffTime: '07:30',
    isAvailable: true,
  },
  {
    id: 'shift-1330',
    shiftTime: '13:30',
    travelDurationMinutes: 30,
    direction: 'LOGIN',
    shiftWindow: 'Pickup window: 12:45 - 13:00',
    cutoffTime: '11:30',
    isAvailable: true,
  },
  {
    id: 'shift-1400',
    shiftTime: '14:00',
    travelDurationMinutes: 30,
    direction: 'LOGIN',
    shiftWindow: 'Pickup window: 13:15 - 13:30',
    cutoffTime: '12:00',
    isAvailable: true,
  },
  {
    id: 'shift-1730',
    shiftTime: '17:30',
    travelDurationMinutes: 40,
    direction: 'LOGIN',
    shiftWindow: 'Pickup window: 16:45 - 17:00',
    cutoffTime: '15:30',
    isAvailable: true,
  },
];

const DEFAULT_LOGOUT_SHIFTS: ShiftRecord[] = [
  {
    id: 'shift-1830',
    shiftTime: '18:30',
    travelDurationMinutes: 35,
    direction: 'LOGOUT',
    shiftWindow: 'Drop window: 19:15 - 19:30',
    cutoffTime: '16:30',
    isAvailable: true,
  },
  {
    id: 'shift-2130',
    shiftTime: '21:30',
    travelDurationMinutes: 40,
    direction: 'LOGOUT',
    shiftWindow: 'Night Escort Guard Assigned',
    cutoffTime: '19:30',
    isAvailable: true,
  },
  {
    id: 'shift-2230',
    shiftTime: '22:30',
    travelDurationMinutes: 35,
    direction: 'LOGOUT',
    shiftWindow: 'Late Night Guard Safeguard',
    cutoffTime: '20:30',
    isAvailable: true,
  },
];

export const ShiftSelectionScreen: React.FC<ShiftSelectionScreenProps> = ({
  date,
  direction = 'LOGIN',
  onBack,
  onApplyShift,
  availableShifts,
}) => {
  // Use provided shifts, or populate with direction-specific corporate shifts
  const initialShifts =
    availableShifts && availableShifts.length > 0
      ? availableShifts
      : direction === 'LOGOUT'
      ? DEFAULT_LOGOUT_SHIFTS
      : DEFAULT_LOGIN_SHIFTS;

  const [shiftsList, setShiftsList] = useState<ShiftRecord[]>(initialShifts);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(initialShifts[0].id);
  const [customTime, setCustomTime] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const selectedShift = shiftsList.find((s) => s.id === selectedShiftId) || shiftsList[0];

  const handleApply = () => {
    if (selectedShift) {
      onApplyShift(selectedShift);
    }
  };

  const showHelpInfo = () => {
    Alert.alert(
      'Corporate Shift Timings',
      'Shift windows and estimated travel times are synced with corporate fleet dispatch and Karnataka transport security guidelines.'
    );
  };

  // Quick select timing
  const handleQuickSelectTime = (timeStr: string) => {
    const existing = shiftsList.find((s) => s.shiftTime === timeStr);
    if (existing) {
      setSelectedShiftId(existing.id);
    } else {
      const newShift: ShiftRecord = {
        id: `custom-shift-${Date.now()}`,
        shiftTime: timeStr,
        travelDurationMinutes: 30,
        direction: direction === 'LOGOUT' ? 'LOGOUT' : 'LOGIN',
        shiftWindow: `Custom timing allocated: ${timeStr}`,
        cutoffTime: '45m prior',
        isAvailable: true,
      };
      setShiftsList([newShift, ...shiftsList]);
      setSelectedShiftId(newShift.id);
    }
  };

  const handleAddCustomTime = () => {
    const trimmed = customTime.trim();
    if (!trimmed) return;

    const newShift: ShiftRecord = {
      id: `custom-shift-${Date.now()}`,
      shiftTime: trimmed,
      travelDurationMinutes: 35,
      direction: direction === 'LOGOUT' ? 'LOGOUT' : 'LOGIN',
      shiftWindow: `Custom employee schedule: ${trimmed}`,
      cutoffTime: '60m prior',
      isAvailable: true,
    };

    setShiftsList([newShift, ...shiftsList]);
    setSelectedShiftId(newShift.id);
    setCustomTime('');
    setShowCustomInput(false);
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
          <View>
            <Text style={styles.dateHeaderLabel}>Commute Date</Text>
            <Text style={styles.dateHeaderValue}>{date}</Text>
          </View>
          <View style={styles.directionBadge}>
            <Text style={styles.directionBadgeText}>
              {direction === 'LOGIN' ? '🏢 Go to Work' : '🏠 Return Home'}
            </Text>
          </View>
        </View>

        {/* Quick Shift Timing Selector Chips */}
        <View style={styles.quickSelectorSection}>
          <Text style={styles.quickSelectorTitle}>Select Shift Timing:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {['09:00', '09:30', '13:30', '14:00', '17:30', '18:30', '21:30', '22:30'].map((time) => {
              const isSelected = selectedShift?.shiftTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  activeOpacity={0.7}
                  onPress={() => handleQuickSelectTime(time)}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                >
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={isSelected ? '#FFFFFF' : '#0F172A'}
                  />
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCustomInput(!showCustomInput)}
              style={styles.customChip}
            >
              <Ionicons name="add" size={14} color="#FF7900" />
              <Text style={styles.customChipText}>Custom</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Custom Time Input Drawer */}
        {showCustomInput && (
          <View style={styles.customInputBox}>
            <TextInput
              placeholder="Enter time (e.g. 10:15 or 15:45)"
              placeholderTextColor="#94A3B8"
              value={customTime}
              onChangeText={setCustomTime}
              style={styles.customTextInput}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddCustomTime}
              style={styles.addTimeButton}
            >
              <Text style={styles.addTimeButtonText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Columns Header (Shift vs Travel time) matching reference layout */}
        <View style={styles.columnHeadersRow}>
          <Text style={styles.shiftColHeader}>SHIFT</Text>
          <View style={styles.travelTimeColHeader}>
            <Text style={styles.travelTimeHeaderText}>TRAVEL TIME</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={showHelpInfo}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.indicatorHeaderPlaceholder} />
        </View>

        {/* Shift Cards List */}
        <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
          {shiftsList.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              selected={shift.id === selectedShiftId}
              onPress={() => setSelectedShiftId(shift.id)}
            />
          ))}
        </ScrollView>

        {/* Bottom Apply CTA */}
        <View style={styles.footerContainer}>
          <PrimaryButton
            title={`Apply Shift (${selectedShift ? selectedShift.shiftTime : '13:30'})`}
            onPress={handleApply}
            disabled={!selectedShiftId}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: spacing.sm,
  },
  dateHeaderLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dateHeaderValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  directionBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  directionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7900',
  },
  quickSelectorSection: {
    marginBottom: spacing.sm,
    paddingVertical: 4,
  },
  quickSelectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  timeChipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeChipTextSelected: {
    color: '#FFFFFF',
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
  },
  customChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7900',
  },
  customInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customTextInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  addTimeButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  columnHeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: spacing.xs,
  },
  shiftColHeader: {
    flex: 1.2,
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  travelTimeColHeader: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  travelTimeHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  indicatorHeaderPlaceholder: {
    width: 24,
  },
  scrollList: {
    paddingVertical: spacing.sm,
    paddingBottom: 80,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
