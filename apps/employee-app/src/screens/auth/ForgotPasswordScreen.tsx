/**
 * Atharva Travels ETS — Employee Android App
 * ForgotPasswordScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { authService } from '../../services';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBack }) => {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Please enter your Employee ID or corporate email.');
      return;
    }
    setError(null);
    setLoading(true);
    await authService.requestPasswordReset(identifier);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Forgot Password" onBack={onBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Ionicons name="mail-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.successTitle}>Request Submitted</Text>
              <Text style={styles.successDescription}>
                If your Employee ID ({identifier}) matches our transport registry, your IT administrator and corporate helpdesk will be notified to assist with credentials verification.
              </Text>
              <PrimaryButton
                title="Return to Login"
                onPress={onBack}
                style={styles.returnButton}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reset Credentials</Text>
              <Text style={styles.cardDescription}>
                Enter your Employee ID or registered email. Central Transport Security will dispatch verification details.
              </Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Employee ID / Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="e.g. EMP-1048 or email@corporate.com"
                    placeholderTextColor={colors.textMuted}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <PrimaryButton
                title="Request Verification"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.presets.captionSmall,
    color: colors.error,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.presets.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.presets.body,
    color: colors.textPrimary,
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  successDescription: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  returnButton: {
    width: '100%',
  },
});

