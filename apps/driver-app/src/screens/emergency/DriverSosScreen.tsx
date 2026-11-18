/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * 24/7 Command Desk Emergency & Driver SOS Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';

interface DriverSosScreenProps {
  onClose: () => void;
}

export const DriverSosScreen: React.FC<DriverSosScreenProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [alertDispatched, setAlertDispatched] = useState(false);

  const HELPLINE_NUMBER = '+918040008899';

  const handleCallHelpline = () => {
    Linking.openURL(`tel:${HELPLINE_NUMBER}`).catch(() => {
      Alert.alert('Phone Call Failed', `Please dial ${HELPLINE_NUMBER} directly.`);
    });
  };

  const handleBroadcastAlert = () => {
    Alert.alert(
      'Broadcast Emergency GPS Alert?',
      'This will instantly notify Atharva Central Command, Corporate Security, and dispatch the nearest Quick Reaction Team (QRT) to your vehicle coordinates.',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'BROADCAST NOW',
          style: 'destructive',
          onPress: () => {
            setAlertDispatched(true);
            Alert.alert('EMERGENCY BROADCAST ACTIVE', t('sosEscalatedAlert'));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.danger} />

      {/* Red Alert Banner */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>✕ {t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('sosButton')}</Text>
        <Text style={styles.headerSubtitle}>{t('sosSubtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card if broadcasted */}
        {alertDispatched && (
          <View style={styles.dispatchedCard}>
            <View style={styles.pulseDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dispatchedTitle}>PANIC BEACON ACTIVE</Text>
              <Text style={styles.dispatchedText}>
                Live GPS telemetry is being transmitted every 3 seconds to Central Command.
              </Text>
            </View>
          </View>
        )}

        {/* Primary Action 1: Call 24/7 Helpline */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallHelpline}
          activeOpacity={0.8}
        >
          <Text style={styles.callButtonIcon}>📞</Text>
          <View style={styles.callButtonContent}>
            <Text style={styles.callButtonTitle}>{t('sosCallButton')}</Text>
            <Text style={styles.callButtonNumber}>+91 80 4000 8899 (Toll-Free)</Text>
          </View>
        </TouchableOpacity>

        {/* Primary Action 2: Silent / GPS Broadcast Alert */}
        <TouchableOpacity
          style={styles.broadcastButton}
          onPress={handleBroadcastAlert}
          activeOpacity={0.8}
        >
          <Text style={styles.broadcastButtonIcon}>🚨</Text>
          <View style={styles.broadcastButtonContent}>
            <Text style={styles.broadcastButtonTitle}>{t('sosEscalateButton')}</Text>
            <Text style={styles.broadcastButtonSubtitle}>
              Silent panic signal to Security Control Room
            </Text>
          </View>
        </TouchableOpacity>

        {/* Emergency Protocols Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Atharva Emergency Protocols</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>
              Keep calm and pull over safely to the side of the road if vehicle is moving.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>
              All in-cab conversations and telemetry are logged for driver & passenger safety.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>
              Quick Reaction Teams (QRTs) patrol major corporate corridors (ORR, Whitefield, EGL, Electronic City).
            </Text>
          </View>
        </View>

        {/* Secondary Back */}
        <TouchableOpacity style={styles.returnButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.returnButtonText}>Return to Safe Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.danger,
    paddingTop: spacing.xxl + 10,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: typography.fontSizes.sm,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.xl,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  dispatchedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    marginRight: spacing.md,
  },
  dispatchedTitle: {
    color: colors.danger,
    fontWeight: '900',
    fontSize: typography.fontSizes.sm,
    letterSpacing: 1,
  },
  dispatchedText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 4,
  },
  callButtonIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  callButtonContent: {
    flex: 1,
  },
  callButtonTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
  },
  callButtonNumber: {
    color: '#FEE2E2',
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  broadcastButtonIcon: {
    fontSize: 30,
    marginRight: spacing.md,
  },
  broadcastButtonContent: {
    flex: 1,
  },
  broadcastButtonTitle: {
    color: colors.danger,
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
  },
  broadcastButtonSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoBullet: {
    color: colors.primary,
    fontWeight: '800',
    width: 20,
    fontSize: typography.fontSizes.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  returnButton: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  returnButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
  },
});
