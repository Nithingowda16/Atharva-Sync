/**
 * Atharva Travels ETS — Employee Android App
 * ErrorState & LoadingSkeleton Components
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { colors, typography, spacing, borderRadius } from '../../theme';

// ============================================================================
// 1. ErrorState
// ============================================================================
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to complete the action. Please check your network and try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.errorContainer, style]}>
      <View style={styles.errorIconCircle}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <View style={styles.retryButton}>
          <PrimaryButton title="Try Again" onPress={onRetry} />
        </View>
      )}
    </View>
  );
};

// ============================================================================
// 2. LoadingSkeleton (Smooth subtle pulse for cards & list rows)
// ============================================================================
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusVal?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusVal = borderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: borderRadiusVal,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 160,
  },
  skeleton: {
    backgroundColor: colors.border,
  },
});

