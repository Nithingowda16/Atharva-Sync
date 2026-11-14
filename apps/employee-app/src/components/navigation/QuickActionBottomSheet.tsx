/**
 * Atharva Travels ETS — Employee Android App
 * QuickActionBottomSheet Component
 * 
 * Recreates the exact bottom-sheet behavior from the reference application:
 * - Dimmed backdrop
 * - Large rounded top corners (24px)
 * - White surface with spacious action cards
 * - Transforms the center '+' into close state
 * - Relevant ETS actions: Schedule Ride, Manage Ride, View Routes
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconContainer } from '../common/IconContainer';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface QuickActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (action: 'schedule' | 'manage' | 'routes') => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const QuickActionBottomSheet: React.FC<QuickActionBottomSheetProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 4,
          speed: 14,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: fadeAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet Card */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handleIndicator} />

        <Text style={styles.sheetTitle}>Quick Commute Actions</Text>
        <Text style={styles.sheetSubtitle}>
          Choose an option to manage your company transport
        </Text>

        <View style={styles.actionsList}>
          {/* Action 1: Schedule Ride */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onSelectAction('schedule')}
            style={styles.actionCard}
          >
            <IconContainer size={44} shape="rounded" backgroundColor={colors.primarySurface}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </IconContainer>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionCardTitle}>Schedule Ride</Text>
              <Text style={styles.actionCardSubtitle}>
                Book your upcoming shift commute to office or home
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Action 2: Manage Ride */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onSelectAction('manage')}
            style={styles.actionCard}
          >
            <IconContainer size={44} shape="rounded" backgroundColor={colors.primarySurface}>
              <Ionicons name="list-outline" size={24} color={colors.primary} />
            </IconContainer>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionCardTitle}>Manage Rides</Text>
              <Text style={styles.actionCardSubtitle}>
                View, modify or cancel scheduled and active commute
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Action 3: View Routes */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onSelectAction('routes')}
            style={styles.actionCard}
          >
            <IconContainer size={44} shape="rounded" backgroundColor={colors.primarySurface}>
              <Ionicons name="map-outline" size={24} color={colors.primary} />
            </IconContainer>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionCardTitle}>View Routes</Text>
              <Text style={styles.actionCardSubtitle}>
                Explore corporate corridors, stops and timing schedules
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 60, // Above bottom nav
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    ...shadows.bottomSheet,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionCardTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  actionCardSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

