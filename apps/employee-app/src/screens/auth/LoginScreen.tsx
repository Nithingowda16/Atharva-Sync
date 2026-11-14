/**
 * Atharva Travels ETS — Employee Android App
 * LoginScreen
 * 
 * Clean corporate login interface.
 * Shows validation errors, loading state, show/hide password toggle,
 * and forgot password navigation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { authService } from '../../services';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateForgotPassword: () => void;
  onBypassForDemo?: () => void; // Clean demo switch for previewing screens
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateForgotPassword,
  onBypassForDemo,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Employee ID or corporate email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password or PIN.');
      return;
    }

    setIsLoading(true);
    const result = await authService.login({
      identifier,
      secret: password,
    });
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      // In Phase 1 Frontend: State that backend authentication will be enabled in Phase 2
      setErrorMessage(result.error || 'Authentication service will connect in Phase 2.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Badge */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus" size={32} color={colors.primary} />
            </View>
            <Text style={styles.appTitle}>Atharva Travels</Text>
            <Text style={styles.appSubtitle}>Enterprise Transport System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Employee Login</Text>
            <Text style={styles.formSubtitle}>
              Sign in with your corporate employee credentials to view assigned shifts and commute routes.
            </Text>

            {/* Validation Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Field 1: Employee ID */}
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
                  placeholder="e.g. EMP-1048 or corporate email"
                  placeholderTextColor={colors.textMuted}
                  value={identifier}
                  onChangeText={(text: string) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Field 2: Password / PIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password / PIN</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your security password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In CTA */}
            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.signInButton}
            />

            {/* Demo Screen Preview Switch (Allows exploring the frontend screens) */}
            {onBypassForDemo && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onBypassForDemo}
                style={styles.previewModeButton}
              >
                <Text style={styles.previewModeText}>
                  Explore Frontend App Interface (Phase 1 Preview)
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  formTitle: {
    ...typography.presets.sectionTitle,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.presets.captionSmall,
    color: colors.error,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
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
    height: '100%',
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  signInButton: {
    marginBottom: spacing.md,
  },
  previewModeButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  previewModeText: {
    ...typography.presets.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

