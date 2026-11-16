/**
 * HI RIDERS — Enterprise Transport Mobility
 * Employee Login Screen (Pure White Aesthetic)
 * 
 * Features:
 * - Pure white background (#FFFFFF)
 * - Seamlessly blended branding header & mobility overview
 * - Crisp input fields with dark text and subtle borders
 * - Full-width solid black "Sign In →" CTA button (#000000)
 * - Back button to return to Onboarding walkthrough
 * - Loading and error states
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as RN from 'react-native';
const Image = (RN as any).Image;
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateForgotPassword: () => void;
  onBackToOnboarding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateForgotPassword,
  onBackToOnboarding,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId) {
      setErrorMessage('Please enter your Employee ID or corporate email.');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter your password or PIN.');
      return;
    }

    setIsLoading(true);
    const result = await authService.login({
      identifier: trimmedId,
      secret: trimmedPass,
    });
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Authentication rejected. Please check credentials.');
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
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            {onBackToOnboarding ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onBackToOnboarding}
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="chevron-back" size={24} color="#0F172A" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>Corporate Mobility</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Centered Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoSquare}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>HI RIDERS</Text>
            <Text style={styles.brandSubtitle}>ENTERPRISE TRANSPORT MOBILITY</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Card Heading */}
            <View style={styles.headingSection}>
              <Text style={styles.cardTitle}>Employee Login</Text>
              <Text style={styles.cardSubtitle}>
                Sign in with your corporate employee credentials to view assigned shifts and commute routes.
              </Text>
            </View>

            {/* Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Input 1: Employee ID / Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employee ID / Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="e.g. EMP-9042 or corporate email"
                  placeholderTextColor="#94A3B8"
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

            {/* Input 2: Password / PIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password / PIN</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your security password"
                  placeholderTextColor="#94A3B8"
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
                  style={styles.eyeButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
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

            {/* Solid Black Sign In Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoading}
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.signInButtonText}>Signing In...</Text>
                </View>
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7900',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  logoSquare: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  logoImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7900',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  headingSection: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF7900',
  },
  signInButton: {
    height: 54,
    backgroundColor: '#000000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.65,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
