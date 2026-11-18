/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Standard Header with Language Quick-Switcher & SOS Shortcut
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcherModal } from './LanguageSwitcherModal';
import { syncService } from '../services/syncService';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Props {
  onSosPress?: () => void;
  onProfilePress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  title?: string;
}

export const AppHeader: React.FC<Props> = ({
  onSosPress,
  onProfilePress,
  showBack,
  onBackPress,
  title,
}) => {
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(syncService.getIsOnline());

  useEffect(() => {
    return syncService.subscribeToNetwork((connected) => {
      setIsOnline(connected);
    });
  }, []);

  const languageLabels: Record<string, string> = {
    en: 'EN',
    kn: 'ಕನ್ನಡ',
    hi: 'हिन्दी',
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.iconBtn}
              hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="bus" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.brandTitle}>{title || t('appName')}</Text>
                <View style={styles.statusDotRow}>
                  <View
                    style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]}
                  />
                  <Text style={styles.statusDotText}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          {/* Language Switcher Pill */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setIsLangModalOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={16} color={colors.primary} />
            <Text style={styles.langPillText}>{languageLabels[language] || 'EN'}</Text>
          </TouchableOpacity>

          {/* Emergency SOS Shortcut */}
          {onSosPress && (
            <TouchableOpacity
              style={styles.sosPill}
              onPress={onSosPress}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.sosPillText}>SOS</Text>
            </TouchableOpacity>
          )}

          {/* Profile Shortcut */}
          {onProfilePress && (
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={onProfilePress}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LanguageSwitcherModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.danger,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: borderRadius.full,
  },
  sosPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileBtn: {
    paddingLeft: spacing.xs,
  },
});
