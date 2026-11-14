/**
 * Atharva Travels ETS — Employee Android App
 * EmergencySosScreen
 * 
 * Strict No-Mock-Data:
 * Professional corporate panic & emergency alert workflow.
 * Frontend UI flow only in Phase 1 (does not dispatch actual backend alerts).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton, SecondaryButton } from '../../components/common/PrimaryButton';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { emergencyService } from '../../services';

interface EmergencySosScreenProps {
  onBack: () => void;
  tripCode?: string;
}

export const EmergencySosScreen: React.FC<EmergencySosScreenProps> = ({
  onBack,
  tripCode,
}) => {
  const [sosDispatched, setSosDispatched] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmTrigger = async () => {
    setConfirmDialogVisible(false);
    setLoading(true);
    await emergencyService.triggerSos(tripCode);
    setLoading(false);
    setSosDispatched(true);
  };

  const handleCancelAlert = () => {
    setSosDispatched(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Emergency Assistance" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sosDispatched ? (
          // Alert Dispatched State (Simulated for Phase 1 Frontend)
          <View style={styles.alertDispatchedCard}>
            <View style={styles.dispatchedIconCircle}>
              <Ionicons name="shield-checkmark" size={48} color={colors.error} />
            </View>
            <Text style={styles.dispatchedTitle}>SOS Alert Transmitted</Text>
            <Text style={styles.dispatchedDesc}>
              Atharva 24x7 Central Operations Command, Quick Response Team (QRT), and corporate safety supervisors have been notified.
            </Text>

            <View style={styles.hotlineBox}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <View style={styles.hotlineTextCol}>
                <Text style={styles.hotlineLabel}>Direct Control Room Hotline</Text>
                <Text style={styles.hotlineNumber}>+91 80 6000 8800</Text>
              </View>
            </View>

            <SecondaryButton
              title="Cancel Emergency Alert"
              onPress={handleCancelAlert}
              style={{ width: '100%', marginTop: spacing.xl }}
            />
          </View>
        ) : (
          <View>
            {/* Warning Info Banner */}
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={20} color={colors.error} />
              <Text style={styles.warningBannerText}>
                Use strictly for physical safety emergencies, vehicle breakdown in vulnerable zones, or immediate security threats.
              </Text>
            </View>

            {/* Big SOS Trigger Button */}
            <View style={styles.sosButtonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmDialogVisible(true)}
                style={styles.bigSosButton}
              >
                <Ionicons name="alert" size={44} color={colors.textWhite} />
                <Text style={styles.bigSosButtonText}>TRIGGER SOS</Text>
              </TouchableOpacity>
              <Text style={styles.tapNotice}>Tap button to initiate emergency protocol</Text>
            </View>

            {/* Trip Context Card */}
            <RoundedCard style={styles.card}>
              <Text style={styles.cardSectionTitle}>Commute Incident Context</Text>
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Active Trip Reference:</Text>
                <Text style={styles.contextValue}>{tripCode || 'No Active Commute'}</Text>
              </View>
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Escort Monitoring:</Text>
                <Text style={styles.contextValue}>Central Command Active</Text>
              </View>
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Response Fleet:</Text>
                <Text style={styles.contextValue}>Bengaluru QRT Mobile Units</Text>
              </View>
            </RoundedCard>

            {/* Emergency Contacts */}
            <RoundedCard style={styles.card}>
              <Text style={styles.cardSectionTitle}>Emergency Contacts</Text>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
                <View style={styles.contactTextCol}>
                  <Text style={styles.contactName}>Central Transport Desk (24/7)</Text>
                  <Text style={styles.contactNumber}>+91 80 6000 8800</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <Ionicons name="shield-outline" size={18} color={colors.primary} />
                <View style={styles.contactTextCol}>
                  <Text style={styles.contactName}>Police Control Room</Text>
                  <Text style={styles.contactNumber}>112 (Toll Free)</Text>
                </View>
              </View>
            </RoundedCard>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Step */}
      <ConfirmationDialog
        visible={confirmDialogVisible}
        title="Confirm Emergency SOS"
        message="Are you sure you want to broadcast an emergency alert to the Atharva Central Operations Control Room?"
        confirmLabel="Broadcast SOS"
        isDestructive
        onConfirm={handleConfirmTrigger}
        onCancel={() => setConfirmDialogVisible(false)}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  warningBannerText: {
    ...typography.presets.caption,
    color: colors.error,
    flex: 1,
    lineHeight: 18,
  },
  sosButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  bigSosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
    shadowColor: colors.error,
    borderWidth: 6,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  bigSosButtonText: {
    ...typography.presets.sectionTitle,
    fontSize: 16,
    color: colors.textWhite,
    marginTop: 6,
    letterSpacing: 1,
  },
  tapNotice: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardSectionTitle: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  contextLabel: {
    ...typography.presets.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  contextValue: {
    ...typography.presets.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  contactTextCol: {
    marginLeft: spacing.md,
  },
  contactName: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  contactNumber: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  alertDispatchedCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  dispatchedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dispatchedTitle: {
    ...typography.presets.sectionTitle,
    color: colors.error,
    marginBottom: 6,
  },
  dispatchedDesc: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  hotlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    width: '100%',
    gap: spacing.md,
  },
  hotlineTextCol: {
    flex: 1,
  },
  hotlineLabel: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
  },
  hotlineNumber: {
    ...typography.presets.cardTitle,
    color: colors.primary,
    fontSize: 16,
  },
});

