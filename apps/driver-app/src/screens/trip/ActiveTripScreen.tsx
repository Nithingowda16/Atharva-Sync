/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Active Trip Route Cockpit: Ordered Stops, Live Telemetry, & Boarding Verifier
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { OfflineBanner } from '../../components/OfflineBanner';
import { StopCard } from '../../components/StopCard';
import { BoardingVerificationModal } from '../scanner/BoardingVerificationModal';
import { TripRecord, PassengerStop } from '../../types';
import { tripService } from '../../services/tripService';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  trip: TripRecord;
  onBack: () => void;
  onCompleteTripPress: (trip: TripRecord) => void;
  onSosPress: () => void;
}

export const ActiveTripScreen: React.FC<Props> = ({
  trip,
  onBack,
  onCompleteTripPress,
  onSosPress,
}) => {
  const { t } = useLanguage();
  const [currentTrip, setCurrentTrip] = useState<TripRecord>(trip);
  const [selectedStopForVerify, setSelectedStopForVerify] = useState<PassengerStop | null>(null);

  // Find the current active stop (first stop still WAITING)
  const currentActiveStop = currentTrip.stops.find((s) => s.status === 'WAITING');
  const boardedCount = currentTrip.stops.filter((s) => s.status === 'BOARDED').length;
  const noShowCount = currentTrip.stops.filter((s) => s.status === 'NO_SHOW').length;
  const remainingCount = currentTrip.stops.filter((s) => s.status === 'WAITING').length;

  const handleVerifyPress = (stop: PassengerStop) => {
    setSelectedStopForVerify(stop);
  };

  const handleNoShowPress = (stop: PassengerStop) => {
    Alert.alert(
      t('noShowDialogTitle'),
      `${t('noShowDialogBody')}\n\nPassenger: ${stop.name}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirmNoShowBtn'),
          style: 'destructive',
          onPress: async () => {
            const res = await tripService.reportNoShow(currentTrip.id, stop.id);
            if (res.success && res.updatedTrip) {
              setCurrentTrip(res.updatedTrip);
            }
          },
        },
      ]
    );
  };

  const handleArrivedPress = (stop: PassengerStop) => {
    Alert.alert(t('arrivedAlertTitle'), `${t('arrivedAlertBody')} (${stop.name})`);
  };

  const handleBoardingSuccess = (updated: TripRecord) => {
    setCurrentTrip(updated);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        showBack
        onBackPress={onBack}
        onSosPress={onSosPress}
        title={currentTrip.tripCode}
      />
      <OfflineBanner />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Progress & Route Banner */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.clientTitle}>{currentTrip.corporateClient}</Text>
              <Text style={styles.routeSubtitle}>{currentTrip.routeName}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{t('inTransit')}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    currentTrip.stops.length > 0
                      ? ((boardedCount + noShowCount) / currentTrip.stops.length) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          {/* Progress Stats */}
          <View style={styles.progressStats}>
            <Text style={styles.progressStatText}>
              <Text style={{ color: colors.success, fontWeight: '800' }}>{boardedCount}</Text>{' '}
              {t('passengerBoarded')}
            </Text>
            <Text style={styles.progressStatText}>
              <Text style={{ color: colors.danger, fontWeight: '800' }}>{noShowCount}</Text>{' '}
              {t('passengerNoShow')}
            </Text>
            <Text style={styles.progressStatText}>
              <Text style={{ color: colors.primary, fontWeight: '800' }}>{remainingCount}</Text>{' '}
              Remaining
            </Text>
          </View>
        </View>

        {/* Section: Current Target Stop */}
        {currentActiveStop && (
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.targetDot} />
              <Text style={styles.sectionLabel}>{t('currentStop')}</Text>
            </View>
            <StopCard
              stop={currentActiveStop}
              isCurrent
              onVerifyPress={handleVerifyPress}
              onNoShowPress={handleNoShowPress}
              onArrivedPress={handleArrivedPress}
            />
          </View>
        )}

        {/* Section: All Stops Manifest */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('upcomingStops')}</Text>
          {currentTrip.stops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              isCurrent={currentActiveStop?.id === stop.id}
              onVerifyPress={handleVerifyPress}
              onNoShowPress={handleNoShowPress}
              onArrivedPress={handleArrivedPress}
            />
          ))}
        </View>

        {/* Complete Trip Action Button */}
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => onCompleteTripPress(currentTrip)}
          activeOpacity={0.8}
        >
          <Ionicons name="flag-outline" size={22} color={colors.textDark} />
          <Text style={styles.completeBtnText}>{t('completeTripBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Camera QR + OTP Boarding Modal */}
      <BoardingVerificationModal
        visible={Boolean(selectedStopForVerify)}
        stop={selectedStopForVerify}
        tripId={currentTrip.id}
        onClose={() => setSelectedStopForVerify(null)}
        onSuccess={handleBoardingSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
    elevation: 2,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clientTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  routeSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#1565C0',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1565C0',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1565C0',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressStatText: {
    fontSize: typography.fontSizes.xs,
    color: '#64748B',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1565C0',
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  completeBtn: {
    backgroundColor: '#1565C0',
    height: 54,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    elevation: 2,
  },
  completeBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
