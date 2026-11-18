/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Boarding Verification Modal: Live Camera QR Scanner + 4-Digit Manual OTP
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PassengerStop, TripRecord } from '../../types';
import { tripService } from '../../services/tripService';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  visible: boolean;
  stop: PassengerStop | null;
  tripId: string;
  onClose: () => void;
  onSuccess: (updatedTrip: TripRecord) => void;
}

export const BoardingVerificationModal: React.FC<Props> = ({
  visible,
  stop,
  tripId,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'CAMERA' | 'OTP'>('OTP'); // Start with OTP for instant accessibility
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setOtpValue('');
      setErrorMessage('');
      setScanned(false);
    }
  }, [visible, stop]);

  const handleVerifyOtp = async () => {
    if (!stop || !tripId) return;
    if (otpValue.trim().length !== 4) {
      setErrorMessage(t('invalidOtp'));
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    const res = await tripService.verifyBoardingOtp(tripId, stop.id, otpValue.trim());
    setIsVerifying(false);

    if (res.success && res.updatedTrip) {
      Alert.alert('Boarding Confirmed', res.message, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess(res.updatedTrip!);
            onClose();
          },
        },
      ]);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isVerifying || !tripId) return;
    setScanned(true);
    setIsVerifying(true);

    const res = await tripService.verifyQrPayload(tripId, data);
    setIsVerifying(false);

    if (res.success && res.updatedTrip) {
      Alert.alert('QR Boarding Verified', res.message, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess(res.updatedTrip!);
            onClose();
          },
        },
      ]);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setScanned(false), 2500); // allow retry
    }
  };

  const handleToggleMode = async () => {
    if (mode === 'OTP') {
      if (!permission || !permission.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Camera Permission Required', t('cameraPermissionDenied'));
          return;
        }
      }
      setMode('CAMERA');
    } else {
      setMode('OTP');
    }
  };

  if (!stop) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('boardingTitle')}</Text>
              <Text style={styles.passengerSubtitle}>
                {stop.name} • {stop.scheduledTime}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Toggle Button */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'OTP' && styles.toggleBtnActive]}
              onPress={() => setMode('OTP')}
            >
              <Ionicons
                name="keypad-outline"
                size={18}
                color={mode === 'OTP' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[styles.toggleBtnText, mode === 'OTP' && styles.toggleBtnTextActive]}
              >
                {t('switchToOtp')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'CAMERA' && styles.toggleBtnActive]}
              onPress={handleToggleMode}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={mode === 'CAMERA' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[styles.toggleBtnText, mode === 'CAMERA' && styles.toggleBtnTextActive]}
              >
                {t('switchToCamera')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMERA QR SCANNER VIEW */}
          {mode === 'CAMERA' ? (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              >
                <View style={styles.scannerTargetBox}>
                  <View style={styles.targetCornerTL} />
                  <View style={styles.targetCornerTR} />
                  <View style={styles.targetCornerBL} />
                  <View style={styles.targetCornerBR} />
                </View>
              </CameraView>
              <Text style={styles.cameraHint}>{t('scanQrSubtitle')}</Text>
            </View>
          ) : (
            /* MANUAL OTP ENTRY VIEW */
            <View style={styles.otpWrapper}>
              <Text style={styles.otpPrompt}>{t('enterOtpSubtitle')}</Text>

              <TextInput
                style={styles.otpInput}
                keyboardType="numeric"
                maxLength={4}
                value={otpValue}
                onChangeText={(text) => {
                  setOtpValue(text);
                  setErrorMessage('');
                }}
                placeholder="0000"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.confirmBtn, otpValue.length === 4 && styles.confirmBtnActive]}
                onPress={handleVerifyOtp}
                disabled={isVerifying || otpValue.length !== 4}
                activeOpacity={0.8}
              >
                {isVerifying ? (
                  <ActivityIndicator color={colors.textDark} />
                ) : (
                  <Text style={styles.confirmBtnText}>{t('verifyOtpButton')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Error Message */}
          {Boolean(errorMessage) && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    minHeight: 460,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  passengerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.surfaceElevated,
  },
  toggleBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  cameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTargetBox: {
    width: 160,
    height: 160,
    position: 'relative',
  },
  targetCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  targetCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  targetCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  targetCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  cameraHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  otpWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  otpPrompt: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 200,
    height: 64,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 16,
    marginBottom: spacing.xl,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmBtnActive: {
    backgroundColor: colors.primary,
  },
  confirmBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: colors.textDark,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: '600',
  },
});
