/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Driver Sign In Screen with Multilingual Switcher
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcherModal } from '../../components/LanguageSwitcherModal';
import { authService } from '../../services/authService';
import { DriverProfile } from '../../types';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  onLoginSuccess: (profile: DriverProfile) => void;
}

export const DriverLoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const { language, t } = useLanguage();
  const [driverId, setDriverId] = useState('DRV-8821');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const languageLabels: Record<string, string> = {
    en: 'English',
    kn: 'ಕನ್ನಡ',
    hi: 'हिन्दी',
  };

  const handleLogin = async () => {
    setLoading(true);
    const res = await authService.login(driverId, pin);
    setLoading(false);

    if (res.success && res.profile) {
      onLoginSuccess(res.profile);
    } else {
      Alert.alert('Login Failed', res.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Bar with Language Selector */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langPill}
          onPress={() => setIsLangModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={16} color={colors.primary} />
          <Text style={styles.langPillText}>{languageLabels[language]}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Brand Icon & Heading */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="speedometer" size={44} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>{t('appName')}</Text>
          <Text style={styles.brandSubtitle}>{t('appTagline')}</Text>
        </View>

        {/* Login Form Box */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t('loginTitle')}</Text>
          <Text style={styles.formSubtitle}>{t('loginSubtitle')}</Text>

          {/* Driver ID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('driverIdPlaceholder')}</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={driverId}
                onChangeText={setDriverId}
                placeholder="DRV-8821"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('pinPlaceholder')}</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={pin}
                onChangeText={setPin}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
              />
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textDark} />
            ) : (
              <Text style={styles.loginBtnText}>{t('signInButton')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Helpline */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
          <Text style={styles.footerText}>Atharva 24x7 Operations Support</Text>
        </View>
      </View>

      <LanguageSwitcherModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langPillText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
    color: '#1565C0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(21, 101, 192, 0.25)',
  },
  brandTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: '#64748B',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  formTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  formSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: '#64748B',
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#1565C0',
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    elevation: 2,
  },
  loginBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  footerText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
});
