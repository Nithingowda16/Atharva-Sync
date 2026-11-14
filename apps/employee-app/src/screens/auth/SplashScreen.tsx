/**
 * Atharva Travels ETS — Employee Android App
 * SplashScreen
 * 
 * Clean white branding splash screen with smooth loading transition.
 * Prepares the structure for future authentication session check in Phase 2.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Atharva Travels Monogram Icon */}
        <View style={styles.logoBadge}>
          <Ionicons name="bus" size={40} color={colors.primary} />
        </View>

        <Text style={styles.brandTitle}>ATHARVA TRAVELS</Text>
        <Text style={styles.subTitle}>ENTERPRISE TRANSPORT SYSTEM</Text>

        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>EMPLOYEE COMMUTE</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure 24x7 Corporate Mobility</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  subTitle: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  pillContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    ...typography.presets.caption,
    color: colors.textMuted,
  },
});

