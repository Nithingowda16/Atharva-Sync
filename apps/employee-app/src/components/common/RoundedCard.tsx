/**
 * Atharva Travels ETS — Employee Android App
 * RoundedCard Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../theme';

interface RoundedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'surface' | 'outlined';
}

export const RoundedCard: React.FC<RoundedCardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'surface' && styles.surfaceCard,
    variant === 'outlined' && styles.outlinedCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  surfaceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    ...shadows.none,
  },
  outlinedCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.none,
  },
});

