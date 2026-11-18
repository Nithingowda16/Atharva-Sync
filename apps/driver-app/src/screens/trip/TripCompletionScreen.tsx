/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Trip Completion & End-of-Route Signoff Screen
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
import { TripRecord } from '../../types';
import { tripService } from '../../services/tripService';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  trip: TripRecord;
  onFinish: () => void;
}

export const TripCompletionScreen: React.FC<Props> = ({ trip, onFinish }) => {
  const { t } = useLanguage();
  const [endOdometer, setEndOdometer] = useState(
    trip.startOdometer ? String(trip.startOdometer + Math.round(trip.totalDistanceKm)) : '48265'
  );
  const [womenSafetyCheck, setWomenSafetyCheck] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const boardedCount = trip.stops.filter((s) => s.status === 'BOARDED').length;
  const noShowCount = trip.stops.filter((s) => s.status === 'NO_SHOW').length;

  const handleSubmit = async () => {
    if (!endOdometer.trim() || isNaN(Number(endOdometer))) {
      Alert.alert('Invalid Odometer', 'Please enter a valid numeric final odometer reading.');
      return;
    }

    if (trip.type === 'LOGOUT' && !womenSafetyCheck) {
      Alert.alert(
        'Women Safety Confirmation',
        'Mandatory compliance: Confirm all women passengers were safely dropped and escorted before ending shift.'
      );
      return;
    }

    setSubmitting(true);
    await tripService.completeTrip(trip.id, Number(endOdometer), womenSafetyCheck);
    setSubmitting(false);

    Alert.alert('Trip Completed', t('tripFinishedSuccess'), [
      {
        text: 'OK',
        onPress: onFinish,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-done-circle" size={44} color={colors.success} />
        </View>
        <Text style={styles.title}>{t('endTripTitle')}</Text>
        <Text style={styles.subtitle}>{t('endTripSubtitle')}</Text>
      </View>

      {/* Summary Metrics */}
      <View style={styles.summaryCard}>
        <Text style={styles.tripCode}>{trip.tripCode}</Text>
        <Text style={styles.client}>{trip.corporateClient}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.success }]}>{boardedCount}</Text>
            <Text style={styles.statLbl}>{t('passengerBoarded')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.danger }]}>{noShowCount}</Text>
            <Text style={styles.statLbl}>{t('passengerNoShow')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{trip.totalDistanceKm} km</Text>
            <Text style={styles.statLbl}>{t('totalDistance')}</Text>
          </View>
        </View>
      </View>

      {/* End Odometer Input */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{t('endOdometer')}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="speedometer-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.odometerInput}
            value={endOdometer}
            onChangeText={setEndOdometer}
            keyboardType="numeric"
            placeholder={t('enterEndOdometer')}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.kmUnit}>KM</Text>
        </View>
      </View>

      {/* Women Passenger Safe Drop Disclaimer & Confirmation */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Corporate Safety Audit</Text>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setWomenSafetyCheck(!womenSafetyCheck)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={womenSafetyCheck ? 'checkbox' : 'square-outline'}
            size={24}
            color={womenSafetyCheck ? colors.primary : colors.textMuted}
          />
          <Text style={styles.checkText}>{t('womenSafetyConfirm')}</Text>
        </TouchableOpacity>
      </View>

      {/* Complete Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Ionicons name="cloud-upload" size={20} color={colors.textDark} />
        <Text style={styles.submitBtnText}>{t('completeTripBtn')}</Text>
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
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
  summaryCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  tripCode: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  client: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLbl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
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
    paddingVertical: spacing.xs,
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
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
