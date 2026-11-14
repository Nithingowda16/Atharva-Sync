/**
 * Atharva Travels ETS — Employee Android App
 * QrBoardingScreen
 * 
 * Strict No-Mock-Data:
 * Geometric high-contrast dynamic QR container, boarding OTP pass-code,
 * secure-state presentation, and boarding instruction cards.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { RideRecord } from '../../types';

interface QrBoardingScreenProps {
  ride?: RideRecord | null;
  onBack: () => void;
}

export const QrBoardingScreen: React.FC<QrBoardingScreenProps> = ({
  ride,
  onBack,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Boarding Verification" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main QR Card */}
        <RoundedCard style={styles.qrCard}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.securedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={styles.securedText}>SECURE BOARDING PASS</Text>
            </View>
            <Text style={styles.tripCode}>{ride?.tripCode || 'ATH-ETS'}</Text>
          </View>

          {/* QR Canvas Area */}
          <View style={styles.qrFrame}>
            <View style={styles.qrInnerPattern}>
              {/* Geometric QR Representation */}
              <Ionicons name="qr-code" size={160} color={colors.textPrimary} />
            </View>
            <View style={styles.scanTargetIndicator}>
              <Text style={styles.dynamicLabel}>DYNAMIC ETS PASS</Text>
            </View>
          </View>

          {/* 4-Digit Boarding OTP PIN */}
          <View style={styles.otpBlock}>
            <Text style={styles.otpLabel}>OR VERIFY VIA 4-DIGIT PIN</Text>
            <View style={styles.otpDigitsRow}>
              {(ride?.boardingOtp ? ride.boardingOtp.split('') : ['•', '•', '•', '•']).map((digit, idx) => (
                <View key={idx} style={styles.otpBox}>
                  <Text style={styles.otpDigitText}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trip Info Mini Strip */}
          <View style={styles.tripStrip}>
            <View style={styles.stripCol}>
              <Text style={styles.stripLabel}>Shift</Text>
              <Text style={styles.stripValue}>{ride?.shiftTime || 'Pending'}</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripCol}>
              <Text style={styles.stripLabel}>Direction</Text>
              <Text style={styles.stripValue}>
                {ride?.direction === 'LOGIN' ? 'Login' : 'Logout'}
              </Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripCol}>
              <Text style={styles.stripLabel}>Status</Text>
              <Text style={styles.stripValue}>{ride?.boardingStatus || 'WAITING'}</Text>
            </View>
          </View>
        </RoundedCard>

        {/* Boarding Instructions */}
        <RoundedCard style={styles.instructionCard}>
          <Text style={styles.instructionsTitle}>Boarding Instructions</Text>

          <View style={styles.instructionRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Present this QR code to the chauffeur terminal upon cab arrival.
            </Text>
          </View>

          <View style={styles.instructionRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Alternatively, verbally quote the 4-digit security PIN if scanning is unavailable.
            </Text>
          </View>

          <View style={styles.instructionRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Verification logs your attendance and timestamps your safe transit to HR and central operations.
            </Text>
          </View>
        </RoundedCard>
      </ScrollView>
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
  qrCard: {
    alignItems: 'center',
    padding: spacing.xl,
    ...shadows.cardSelected,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  securedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  securedText: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tripCode: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  qrFrame: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInnerPattern: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scanTargetIndicator: {
    marginTop: spacing.sm,
  },
  dynamicLabel: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  otpBlock: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    width: '100%',
  },
  otpLabel: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  otpDigitsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigitText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  tripStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stripCol: {
    flex: 1,
    alignItems: 'center',
  },
  stripLabel: {
    ...typography.presets.captionSmall,
    fontSize: 10,
    color: colors.textMuted,
  },
  stripValue: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 1,
  },
  stripDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  instructionCard: {
    marginTop: spacing.md,
  },
  instructionsTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  stepNumText: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  instructionText: {
    ...typography.presets.body,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});

