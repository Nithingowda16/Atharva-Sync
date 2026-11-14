/**
 * Atharva Travels ETS — Employee Android App
 * PrimaryButton & SecondaryButton Components
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.primaryContainer,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textWhite} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconMargin}>{icon}</View>}
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.secondaryContainer,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconMargin}>{icon}</View>}
          <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryContainer: {
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  secondaryContainer: {
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  disabledContainer: {
    backgroundColor: colors.cardMuted,
    borderColor: colors.borderLight,
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginRight: spacing.sm,
  },
  primaryText: {
    ...typography.presets.button,
    color: colors.textWhite,
  },
  secondaryText: {
    ...typography.presets.button,
    color: colors.primary,
  },
});

