/**
 * Atharva Travels ETS — Employee Android App
 * DateSelector Component
 * 
 * Clean, native-feeling mobile date picker bar.
 * Ready to receive availability from the backend in Phase 2.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';

interface DateItem {
  dateString: string; // YYYY-MM-DD
  dayName: string;    // Mon, Tue, etc.
  dayNumber: string;  // 16, 17, etc.
  monthName: string;  // Nov
  isAvailable?: boolean;
}

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dates?: DateItem[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  dates,
}) => {
  // Generate next 7 days dynamically based on current date
  const generateUpcomingDays = (): DateItem[] => {
    const list: DateItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      list.push({
        dateString: iso,
        dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
        dayNumber: String(d.getDate()),
        monthName: monthNames[d.getMonth()],
        isAvailable: true,
      });
    }
    return list;
  };

  const daysList = dates && dates.length > 0 ? dates : generateUpcomingDays();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {daysList.map((item) => {
        const isSelected = item.dateString === selectedDate;
        return (
          <TouchableOpacity
            key={item.dateString}
            activeOpacity={0.75}
            onPress={() => onSelectDate(item.dateString)}
            style={[
              styles.dateCard,
              isSelected ? styles.cardSelected : styles.cardUnselected,
            ]}
          >
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dateCard: {
    width: 64,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  cardUnselected: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSelected: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.cardSelected,
  },
  dayName: {
    ...typography.presets.captionSmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  monthName: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    marginTop: 2,
  },
  textUnselected: {
    color: colors.textSecondary,
  },
  textNumber: {
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.textWhite,
  },
});

