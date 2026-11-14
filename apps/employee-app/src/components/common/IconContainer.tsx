/**
 * Atharva Travels ETS — Employee Android App
 * IconContainer Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface IconContainerProps {
  children: React.ReactNode;
  size?: number;
  shape?: 'circle' | 'rounded';
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  children,
  size = 40,
  shape = 'circle',
  backgroundColor = colors.primarySurface,
  style,
}) => {
  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? borderRadius.full : borderRadius.md,
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
