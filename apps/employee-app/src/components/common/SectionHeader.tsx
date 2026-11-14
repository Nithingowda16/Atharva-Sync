/**
 * Atharva Travels ETS — Employee Android App
 * SectionHeader Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderTitleCol}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeaderTitleCol: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

