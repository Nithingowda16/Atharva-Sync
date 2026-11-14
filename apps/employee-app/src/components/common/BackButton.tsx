/**
 * Atharva Travels ETS — Employee Android App
 * BackButton Component
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  iconColor?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  iconColor = colors.textPrimary,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <Ionicons name="chevron-back" size={24} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});

