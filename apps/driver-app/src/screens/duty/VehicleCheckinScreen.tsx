/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Pre-Shift Vehicle Inspection & Check-in Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../i18n/LanguageContext';
import { DriverProfile } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  profile: DriverProfile;
  onCheckinComplete: (updatedProfile: DriverProfile) => void;
}

export const VehicleCheckinScreen: React.FC<Props> = ({ profile, onCheckinComplete }) => {
  const { t } = useLanguage();
  const [odometer, setOdometer] = useState('48250');
  const [acCheck, setAcCheck] = useState(true);
  const [cleanCheck, setCleanCheck] = useState(true);
  const [fuelCheck, setFuelCheck] = useState(true);

  const handleConfirm = async () => {
    if (!odometer.trim() || isNaN(Number(odometer))) {
      Alert.alert('Invalid Odometer', 'Please enter a valid numeric starting odometer reading.');
      return;
    }

    if (!acCheck || !cleanCheck || !fuelCheck) {
      Alert.alert(
        'Checklist Incomplete',
        'Corporate ETS compliance requires AC, Cleanliness, and Fuel checks to be verified before going on duty.'
      );
      return;
    }

    const updated = await offlineStorage.updateDutyStatus('AVAILABLE');
    if (updated) {
      onCheckinComplete(updated);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="clipboard-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('vehicleCheckinTitle')}</Text>
        <Text style={styles.subtitle}>{t('vehicleCheckinSubtitle')}</Text>
      </View>

      {/* Assigned Vehicle Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleRow}>
          <Ionicons name="car-sport" size={24} color={colors.primary} />
          <View>
            <Text style={styles.vehiclePlate}>{profile.assignedVehiclePlate}</Text>
            <Text style={styles.vehicleModel}>{profile.assignedVehicleModel}</Text>
          </View>
        </View>

        <View style={styles.complianceBadge}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success} />
          <Text style={styles.complianceText}>{t('documentsValid')}</Text>
        </View>
      </View>

      {/* Odometer Input */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{t('startOdometer')}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="speedometer-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.odometerInput}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            placeholder={t('enterOdometer')}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.kmUnit}>KM</Text>
        </View>
      </View>

      {/* Safety & Comfort Checklist */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Corporate Compliance Checklist</Text>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAcCheck(!acCheck)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={acCheck ? 'checkbox' : 'square-outline'}
            size={24}
            color={acCheck ? colors.primary : colors.textMuted}
          />
          <Text style={styles.checkText}>{t('acWorking')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setCleanCheck(!cleanCheck)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={cleanCheck ? 'checkbox' : 'square-outline'}
            size={24}
            color={cleanCheck ? colors.primary : colors.textMuted}
          />
          <Text style={styles.checkText}>{t('cleanCab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setFuelCheck(!fuelCheck)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={fuelCheck ? 'checkbox' : 'square-outline'}
            size={24}
            color={fuelCheck ? colors.primary : colors.textMuted}
          />
          <Text style={styles.checkText}>{t('fuelCheck')}</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleConfirm} activeOpacity={0.8}>
        <Ionicons name="power" size={20} color={colors.textDark} />
        <Text style={styles.submitBtnText}>{t('confirmCheckin')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vehiclePlate: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  vehicleModel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  odometerInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
  },
  kmUnit: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '800',
    color: colors.textMuted,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#1565C0',
    height: 54,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
