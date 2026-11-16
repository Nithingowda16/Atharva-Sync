/**
 * Atharva Travels ETS — Employee Android App
 * DateSelector Component
 * 
 * Features:
 * - Multi-date selection (e.g. full week Mon-Fri booking with 1-tap)
 * - Quick presets: "Work Week (Mon-Fri)", "Next 7 Days", "Today Only"
 * - 14-day upcoming transit window
 * - Pure white aesthetic with solid black selected state (#000000)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';

export interface DateItem {
  dateString: string; // YYYY-MM-DD
  dayName: string;    // Mon, Tue, etc.
  dayNumber: string;  // 16, 17, etc.
  monthName: string;  // Nov
  isWeekend?: boolean;
}

interface DateSelectorProps {
  selectedDates?: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onToggleDate?: (date: string) => void;
  onSelectMultipleDates?: (dates: string[]) => void;
  dates?: DateItem[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDates,
  selectedDate,
  onSelectDate,
  onToggleDate,
  onSelectMultipleDates,
  dates,
}) => {
  // Normalize active selection array
  const activeSelectedList: string[] = selectedDates
    ? selectedDates
    : selectedDate
    ? [selectedDate]
    : [new Date().toISOString().split('T')[0]];

  // Generate upcoming 14 days (2 full work weeks)
  const generateUpcomingDays = (): DateItem[] => {
    const list: DateItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();
      list.push({
        dateString: iso,
        dayName: i === 0 ? 'Today' : dayNames[dayIdx],
        dayNumber: String(d.getDate()),
        monthName: monthNames[d.getMonth()],
        isWeekend: dayIdx === 0 || dayIdx === 6,
      });
    }
    return list;
  };

  const daysList = dates && dates.length > 0 ? dates : generateUpcomingDays();

  // Handle single card click (Toggle in / out of multi-selection)
  const handleCardPress = (dateStr: string) => {
    if (onToggleDate) {
      onToggleDate(dateStr);
    } else if (onSelectMultipleDates) {
      if (activeSelectedList.includes(dateStr)) {
        if (activeSelectedList.length > 1) {
          onSelectMultipleDates(activeSelectedList.filter((d) => d !== dateStr));
        }
      } else {
        onSelectMultipleDates([...activeSelectedList, dateStr].sort());
      }
    } else if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  // Preset 1: Select Work Week (Mon to Fri)
  const handleSelectWorkWeek = () => {
    const workDays = daysList
      .filter((d) => !d.isWeekend)
      .slice(0, 5)
      .map((d) => d.dateString);

    if (onSelectMultipleDates) {
      onSelectMultipleDates(workDays);
    } else if (onToggleDate && workDays[0]) {
      onToggleDate(workDays[0]);
    }
  };

  // Preset 2: Select Next 7 Days
  const handleSelectNext7Days = () => {
    const sevenDays = daysList.slice(0, 7).map((d) => d.dateString);
    if (onSelectMultipleDates) {
      onSelectMultipleDates(sevenDays);
    }
  };

  // Preset 3: Today Only
  const handleSelectTodayOnly = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (onSelectMultipleDates) {
      onSelectMultipleDates([todayIso]);
    } else if (onSelectDate) {
      onSelectDate(todayIso);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Quick Preset Filter Chips */}
      <View style={styles.presetsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSelectWorkWeek}
          style={styles.presetChip}
        >
          <Ionicons name="briefcase-outline" size={13} color="#000000" />
          <Text style={styles.presetChipText}>Entire Work Week (Mon–Fri)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSelectNext7Days}
          style={styles.presetChip}
        >
          <Ionicons name="calendar-outline" size={13} color="#000000" />
          <Text style={styles.presetChipText}>Next 7 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSelectTodayOnly}
          style={styles.presetChip}
        >
          <Text style={styles.presetChipText}>Today Only</Text>
        </TouchableOpacity>
      </View>

      {/* Date Cards Horizontal Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {daysList.map((item) => {
          const isSelected = activeSelectedList.includes(item.dateString);
          return (
            <TouchableOpacity
              key={item.dateString}
              activeOpacity={0.75}
              onPress={() => handleCardPress(item.dateString)}
              style={[
                styles.dateCard,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color="#000000" />
                </View>
              )}

              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.textSelected : styles.textNumber,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.monthName,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}
              >
                {item.monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selection Status Badge */}
      <View style={styles.statusRow}>
        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
        <Text style={styles.statusText}>
          {activeSelectedList.length === 1
            ? `1 Date Selected (${activeSelectedList[0]})`
            : `${activeSelectedList.length} Commute Dates Selected (${activeSelectedList.slice(0, 3).join(', ')}${activeSelectedList.length > 3 ? '...' : ''})`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 5,
  },
  presetChipText: {
    ...typography.presets.captionSmall,
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 11,
  },
  container: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  dateCard: {
    width: 66,
    height: 82,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardSelected: {
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    ...typography.presets.captionSmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  monthName: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    marginTop: 2,
  },
  textUnselected: {
    color: '#64748B',
  },
  textNumber: {
    color: '#0F172A',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  statusText: {
    ...typography.presets.captionSmall,
    color: '#15803D',
    fontWeight: '600',
  },
});
