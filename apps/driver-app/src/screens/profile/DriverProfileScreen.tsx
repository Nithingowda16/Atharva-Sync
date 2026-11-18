/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Driver Profile, Documents, Rating & Settings Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { DriverProfile } from '../../types';

interface DriverProfileScreenProps {
  profile: DriverProfile;
  onOpenLanguage: () => void;
  onLogout: () => void;
  onBack: () => void;
}

export const DriverProfileScreen: React.FC<DriverProfileScreenProps> = ({
  profile,
  onOpenLanguage,
  onLogout,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();

  const handleLogoutPress = () => {
    Alert.alert(
      t('logoutButton'),
      'Are you sure you want to end your pilot shift and log out?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logoutButton'), style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const getLanguageLabel = () => {
    if (language === 'kn') return 'ಕನ್ನಡ (Kannada)';
    if (language === 'hi') return 'हिन्दी (Hindi)';
    return 'English';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar with Safe Notch Padding */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('driverProfile')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pilot Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarInitials}>
              {profile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Text>
          </View>
          <Text style={styles.driverName}>{profile.fullName}</Text>
          <Text style={styles.driverPhone}>{profile.phone}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.complianceBadge}>
              <Text style={styles.complianceBadgeText}>COMPLIANCE: {profile.complianceStatus}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>★ {profile.rating.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.totalTripsCompleted}</Text>
            <Text style={styles.statLabel}>{t('tripsCompleted')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Punctuality</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Safety Violations</Text>
          </View>
        </View>

        {/* Vehicle & License Section */}
        <Text style={styles.sectionHeading}>VEHICLE & FLEET PERMITS</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('plateNumber')}</Text>
            <Text style={styles.infoValueHighlight}>{profile.assignedVehiclePlate}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('model')}</Text>
            <Text style={styles.infoValue}>{profile.assignedVehicleModel}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('licenseNumber')}</Text>
            <Text style={styles.infoValue}>{profile.licenseNumber}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('licenseExpiry')}</Text>
            <Text style={styles.infoValue}>{profile.licenseExpiry}</Text>
          </View>
        </View>

        {/* Compliance Badges */}
        <Text style={styles.sectionHeading}>DIGITAL COMPLIANCE DOCUMENTS</Text>
        <View style={styles.complianceList}>
          <View style={styles.docRow}>
            <Text style={styles.docIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Commercial Transport Badge (Karnataka)</Text>
              <Text style={styles.docSub}>Verified by Police & Atharva Safety Cell</Text>
            </View>
          </View>
          <View style={styles.docRow}>
            <Text style={styles.docIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Vehicle Insurance & Fitness Certificate</Text>
              <Text style={styles.docSub}>Valid until Dec 2027 • Comprehensive Fleet Coverage</Text>
            </View>
          </View>
          <View style={styles.docRow}>
            <Text style={styles.docIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Speed Governor & Panic Button Certificate</Text>
              <Text style={styles.docSub}>AIS 140 GPS Compliant</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <Text style={styles.sectionHeading}>PREFERENCES</Text>
        <TouchableOpacity style={styles.preferenceRow} onPress={onOpenLanguage} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: spacing.md }}>🌐</Text>
            <View>
              <Text style={styles.preferenceTitle}>{t('changeLanguage')}</Text>
              <Text style={styles.preferenceValue}>{getLanguageLabel()}</Text>
            </View>
          </View>
          <Text style={styles.preferenceArrow}>›</Text>
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>{t('logoutButton')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Atharva Pilot v1.0.0 • Enterprise Transport System (ETS)
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInitials: {
    color: colors.textDark,
    fontSize: typography.fontSizes.xxl,
    fontWeight: '900',
  },
  driverName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: '800',
    marginBottom: 2,
  },
  driverPhone: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  complianceBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.success,
  },
  complianceBadgeText: {
    color: colors.success,
    fontSize: typography.fontSizes.xs,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ratingBadgeText: {
    color: colors.accent,
    fontSize: typography.fontSizes.xs,
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs - 1,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  sectionHeading: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
  },
  infoValueHighlight: {
    color: colors.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs + 2,
  },
  complianceList: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  docIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  docTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
  },
  docSub: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  preferenceTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
  },
  preferenceValue: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  preferenceArrow: {
    color: colors.textSecondary,
    fontSize: 22,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
});
