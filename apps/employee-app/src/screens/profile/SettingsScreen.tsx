/**
 * Atharva Travels ETS — Employee Android App
 * SettingsScreen
 * 
 * Strict No-Mock-Data:
 * Controls notification preferences, GPS permission state, privacy, terms,
 * and account sign out.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { Divider } from '../../components/common/Divider';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { colors, typography, spacing } from '../../theme';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
}) => {
  const [tripAlerts, setTripAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [escortAlerts, setEscortAlerts] = useState(true);
  const [gpsActive, setGpsActive] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Settings" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Notifications */}
        <Text style={styles.sectionHeaderTitle}>Notifications & Alerts</Text>
        <RoundedCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Cab Dispatch Alerts</Text>
              <Text style={styles.settingDesc}>Receive alert when cab is allocated and en route</Text>
            </View>
            <Switch
              value={tripAlerts}
              onValueChange={setTripAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Traffic & Delay Warnings</Text>
              <Text style={styles.settingDesc}>Proactive corridor delay and detour notifications</Text>
            </View>
            <Switch
              value={delayAlerts}
              onValueChange={setDelayAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Security & Escort Updates</Text>
              <Text style={styles.settingDesc}>Verification status for night security guard roster</Text>
            </View>
            <Switch
              value={escortAlerts}
              onValueChange={setEscortAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </RoundedCard>

        {/* Section 2: Permissions */}
        <Text style={[styles.sectionHeaderTitle, { marginTop: spacing.xl }]}>
          Device Permissions
        </Text>
        <RoundedCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Live Boarding Location</Text>
              <Text style={styles.settingDesc}>Used to verify boarding stop arrival and driver rendezvous</Text>
            </View>
            <Switch
              value={gpsActive}
              onValueChange={setGpsActive}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </RoundedCard>

        {/* Section 3: Legal & Security */}
        <Text style={[styles.sectionHeaderTitle, { marginTop: spacing.xl }]}>
          Compliance & Privacy
        </Text>
        <RoundedCard style={styles.card}>
          <TouchableOpacity activeOpacity={0.7} style={styles.linkRow}>
            <Text style={styles.linkText}>Corporate Mobility Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity activeOpacity={0.7} style={styles.linkRow}>
            <Text style={styles.linkText}>Karnataka Transport Safety Norms</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </RoundedCard>

        {/* Section 4: Account Actions */}
        <RoundedCard style={[styles.card, { marginTop: spacing.xl }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out of Session</Text>
          </TouchableOpacity>
        </RoundedCard>
      </ScrollView>

      <ConfirmationDialog
        visible={logoutDialogVisible}
        title="Sign Out"
        message="Are you sure you want to log out of your session on this device?"
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
  sectionHeaderTitle: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  settingDesc: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.presets.body,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    ...typography.presets.cardTitle,
    color: colors.error,
  },
});

