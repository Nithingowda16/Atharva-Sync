/**
 * Atharva Travels ETS — Employee Android App
 * SelectionCard Component
 * 
 * Recreates the exact selection behavior from the reference screenshots:
 * Unselected: White card, subtle border
 * Selected: White card, deep corporate blue border, clear visual emphasis
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../../theme';

interface SelectionCardProps {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  showIndicator?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  selected,
  onPress,
  children,
  style,
  showIndicator = true,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.childContainer}>{children}</View>
        {showIndicator && (
          <View style={[styles.indicator, selected ? styles.indicatorSelected : styles.indicatorUnselected]}>
            {selected && (
              <Ionicons name="checkmark" size={14} color={colors.textWhite} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childContainer: {
    flex: 1,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  indicatorUnselected: {
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    backgroundColor: 'transparent',
  },
  indicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

