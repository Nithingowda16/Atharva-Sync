/**
 * Atharva Travels ETS — Employee Android App
 * LiveTrackingMapPlaceholder Component
 * 
 * Strict No-Mock-Data:
 * Prepares the surface for Google Maps / Mapbox SDK in Phase 2.
 * Displays "Live tracking unavailable - Your vehicle location will appear here once tracking is active."
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface LiveTrackingMapPlaceholderProps {
  hasActiveTelemetry?: boolean;
}

export const LiveTrackingMapPlaceholder: React.FC<LiveTrackingMapPlaceholderProps> = ({
  hasActiveTelemetry = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Decorative Map Grid Lines (SVG-style CSS simulation) */}
      <View style={styles.gridOverlay}>
        <View style={styles.roadLine1} />
        <View style={styles.roadLine2} />
        <View style={styles.roadCircle} />
      </View>

      {/* Radar Center Pulse */}
      <View style={styles.centerBeacon}>
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={styles.pinDot}>
          <Ionicons name="navigate" size={16} color={colors.textWhite} />
        </View>
      </View>

      {/* Notice Card: Strict No-Mock-Data */}
      <View style={styles.statusOverlayCard}>
        <View style={styles.radarStatusPill}>
          <View style={styles.offlineDot} />
          <Text style={styles.radarStatusText}>GPS TELEMETRY RADAR</Text>
        </View>
        <Text style={styles.title}>Live tracking unavailable</Text>
        <Text style={styles.description}>
          Your vehicle location and ETA will appear here once the assigned driver begins trip telemetry.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 260,
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  roadLine1: {
    position: 'absolute',
    top: 50,
    left: -40,
    right: -40,
    height: 14,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '-18deg' }],
  },
  roadLine2: {
    position: 'absolute',
    top: 140,
    left: -40,
    right: -40,
    height: 20,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '12deg' }],
  },
  roadCircle: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#E2E8F0',
  },
  centerBeacon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  pulseCircle: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11, 78, 162, 0.15)',
  },
  pinDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusOverlayCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  radarStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginBottom: 4,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    marginRight: 6,
  },
  radarStatusText: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

