/**
 * Atharva Travels ETS — Employee Android App
 * BottomNavigation Component
 * 
 * Recreates the exact navigation pattern from reference screenshots:
 * - Left: "Bookings"
 * - Center: Elevated circular primary blue `+` action button with shadow
 * - Right: "Profile"
 * - Active state with light blue accent background
 * - Professional outline icons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { MainTab } from '../../types';

interface BottomNavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onFabPress: () => void;
  isBottomSheetOpen: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onFabPress,
  isBottomSheetOpen,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* Elevated Center FAB Button */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onFabPress}
          style={[
            styles.fab,
            isBottomSheetOpen ? styles.fabOpen : styles.fabDefault,
          ]}
          accessibilityLabel={isBottomSheetOpen ? 'Close quick menu' : 'Open quick menu'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isBottomSheetOpen ? 'close' : 'add'}
            size={28}
            color={colors.textWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Main Bottom Bar */}
      <View style={styles.bar}>
        {/* Tab 1: Bookings */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabChange('Bookings')}
          style={[
            styles.tabItem,
            activeTab === 'Bookings' && styles.tabItemActive,
          ]}
        >
          <Ionicons
            name={activeTab === 'Bookings' ? 'calendar' : 'calendar-outline'}
            size={22}
            color={activeTab === 'Bookings' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Bookings' && styles.tabLabelActive,
            ]}
          >
            Bookings
          </Text>
        </TouchableOpacity>

        {/* Center Space for Elevated FAB */}
        <View style={styles.fabSpacer} />

        {/* Tab 2: Profile */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabChange('Profile')}
          style={[
            styles.tabItem,
            activeTab === 'Profile' && styles.tabItemActive,
          ]}
        >
          <Ionicons
            name={activeTab === 'Profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'Profile' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Profile' && styles.tabLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bar: {
    height: Platform.OS === 'android' ? 64 : 70,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.card,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  tabItemActive: {
    backgroundColor: colors.primarySurface,
  },
  tabLabel: {
    ...typography.presets.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  fabSpacer: {
    width: 68,
  },
  fabContainer: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  fabDefault: {
    backgroundColor: colors.primary,
  },
  fabOpen: {
    backgroundColor: colors.textPrimary,
  },
});

