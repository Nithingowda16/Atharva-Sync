import { SafeAreaView } from 'react-native-safe-area-context';
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
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { Divider } from '../../components/common/Divider';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { colors, typography, spacing } from '../../theme';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_EMULATOR_URL, DEFAULT_LAN_URL } from '../../services';

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
  const [portalUrl, setPortalUrlState] = useState(getApiBaseUrl());

  const handleSelectPreset = (url: string) => {
    setApiBaseUrl(url);
    setPortalUrlState(url);
    Alert.alert('Server Connected', `API Base URL updated to:\n${url}`);
  };

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

        {/* Section 3: Web Portal Connection */}
        <Text style={[styles.sectionHeaderTitle, { marginTop: spacing.xl }]}>
          Web Portal Server Gateway
        </Text>
        <RoundedCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Current Server URL</Text>
              <Text style={[styles.settingDesc, { color: colors.primary, fontWeight: '600' }]}>
                {portalUrl}
              </Text>
            </View>
          </View>

          <Divider />

          <Text style={[styles.settingDesc, { marginVertical: spacing.xs }]}>
            Quick Preset Selection:
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSelectPreset(DEFAULT_EMULATOR_URL)}
              style={[
                styles.presetButton,
                portalUrl === DEFAULT_EMULATOR_URL && styles.presetButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  portalUrl === DEFAULT_EMULATOR_URL && styles.presetButtonTextActive,
                ]}
              >
                Emulator (10.0.2.2)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSelectPreset(DEFAULT_LAN_URL)}
              style={[
                styles.presetButton,
                portalUrl === DEFAULT_LAN_URL && styles.presetButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  portalUrl === DEFAULT_LAN_URL && styles.presetButtonTextActive,
                ]}
              >
                Wi-Fi LAN (10.182.158.131)
              </Text>
            </TouchableOpacity>
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
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  presetButtonText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

