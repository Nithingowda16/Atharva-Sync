/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Authentication / Start Duty Modal (Matches Screenshot 3)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, borderRadius, typography, spacing } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface StartDutyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPhone?: string;
}

export const StartDutyModal: React.FC<StartDutyModalProps> = ({
  visible,
  onClose,
  onSuccess,
  defaultPhone = '9876543210',
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState(defaultPhone);
  const [otp, setOtp] = useState('');

  const handleGetOtp = () => {
    if (!phone || phone.trim().length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep('OTP');
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.trim().length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP sent to your phone (Demo PIN: 1234).');
      return;
    }
    setStep('PHONE');
    setOtp('');
    onSuccess();
  };

  const handleClose = () => {
    setStep('PHONE');
    setOtp('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>AUTHENTICATION</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {step === 'PHONE' ? (
            <>
              <Text style={styles.label}>Enter your mobile number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                maxLength={10}
              />
              <TouchableOpacity style={styles.actionBtn} onPress={handleGetOtp} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>Get OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter 4-digit OTP sent to +91 {phone}</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholder="• • • •"
                placeholderTextColor="#94A3B8"
                maxLength={4}
                autoFocus
              />
              <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyOtp} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>Verify & Start Duty</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748B',
  },
  closeIcon: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  actionBtn: {
    backgroundColor: '#1565C0',
    height: 46,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
