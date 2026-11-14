/**
 * Atharva Travels ETS — Employee Android App
 * AppHeader Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { BackButton } from './BackButton';
import { colors, typography, spacing } from '../../theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBack ? (
          <BackButton onPress={onBack} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.centerContainer}>
        {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={rightAction.onPress}
            style={styles.rightActionButton}
          >
            {rightAction.icon}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  rightActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

