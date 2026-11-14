/**
 * Atharva Travels ETS — Employee Android App
 * ProfileScreen
 * 
 * Recreates the exact layout and section hierarchy from Reference Screenshot 2:
 * - Employee identity header
 * - Quick actions: History, Help (with circular light-blue icon containers, right arrows)
 * - Preferences: My Address
 * - More: App Feedback, Settings, Terms of Usage, Logout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoundedCard } from '../../components/common/RoundedCard';
import { ListRow } from '../../components/common/ListRow';
import { Divider } from '../../components/common/Divider';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { UserProfile } from '../../types';

interface ProfileScreenProps {
  user?: UserProfile | null;
  onNavigateHistory: () => void;
  onNavigateHelp: () => void;
  onNavigateAddress: () => void;
  onNavigateFeedback: () => void;
  onNavigateSettings: () => void;
  onNavigateTerms: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigateHistory,
  onNavigateHelp,
  onNavigateAddress,
  onNavigateFeedback,
  onNavigateSettings,
  onNavigateTerms,
  onLogout,
}) => {
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title Header */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* User Identity Header Card */}
        <RoundedCard style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={styles.userTextCol}>
            <Text style={styles.userName}>
              {user?.fullName || 'Corporate Employee'}
            </Text>
            <Text style={styles.userEmpId}>
              {user?.employeeId ? `ID: ${user.employeeId}` : 'Atharva ETS Commuter'}
            </Text>
            {user?.department && (
              <Text style={styles.userDept}>{user.department}</Text>
            )}
          </View>
        </RoundedCard>

        {/* Section 1: Quick Actions (Reference Screenshot 2) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Quick actions</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="time-outline"
              title="History"
              subtitle="View past commute trips and logs"
              onPress={onNavigateHistory}
            />
            <Divider />
            <ListRow
              iconName="help-circle-outline"
              title="Help"
              subtitle="FAQs, support desk and service tickets"
              onPress={onNavigateHelp}
            />
          </RoundedCard>
        </View>

        {/* Section 2: Preferences (Reference Screenshot 2) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="location-outline"
              title="My Address"
              subtitle="Manage home and boarding pickup locations"
              onPress={onNavigateAddress}
            />
          </RoundedCard>
        </View>

        {/* Section 3: More (Reference Screenshot 2) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>More</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="chatbox-ellipses-outline"
              title="App Feedback"
              subtitle="Share your commute feedback"
              onPress={onNavigateFeedback}
            />
            <Divider />
            <ListRow
              iconName="settings-outline"
              title="Settings"
              subtitle="Notifications and app permissions"
              onPress={onNavigateSettings}
            />
            <Divider />
            <ListRow
              iconName="document-text-outline"
              title="Terms of Usage"
              subtitle="Workplace mobility guidelines & compliance"
              onPress={onNavigateTerms}
            />
            <Divider />
            <ListRow
              iconName="log-out-outline"
              title="Logout"
              subtitle="Sign out of employee session"
              onPress={() => setLogoutDialogVisible(true)}
              isDestructive
              showArrow={false}
            />
          </RoundedCard>
        </View>

        <Text style={styles.versionFooter}>
          Atharva Travels ETS • Version 1.0.0 (Phase 1 Frontend)
        </Text>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        visible={logoutDialogVisible}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of your employee commute account?"
        confirmLabel="Logout"
        isDestructive
        onConfirm={() => {
          setLogoutDialogVisible(false);
          onLogout();
        }}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  pageTitle: {
    ...typography.presets.pageTitle,
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  userTextCol: {
    flex: 1,
  },
  userName: {
    ...typography.presets.sectionTitle,
    fontSize: 18,
    color: colors.textPrimary,
  },
  userEmpId: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userDept: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    paddingVertical: 2,
    paddingHorizontal: spacing.lg,
  },
  versionFooter: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

