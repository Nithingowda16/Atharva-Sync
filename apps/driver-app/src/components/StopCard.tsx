/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Passenger Stop Card with Call, Navigation, and Boarding Verification
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PassengerStop } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Props {
  stop: PassengerStop;
  isCurrent?: boolean;
  onVerifyPress: (stop: PassengerStop) => void;
  onNoShowPress: (stop: PassengerStop) => void;
  onArrivedPress?: (stop: PassengerStop) => void;
}

export const StopCard: React.FC<Props> = ({
  stop,
  isCurrent,
  onVerifyPress,
  onNoShowPress,
  onArrivedPress,
}) => {
  const { t } = useLanguage();

  const handleCall = () => {
    if (stop.phone) {
      Linking.openURL(`tel:${stop.phone}`).catch(() => {
        Alert.alert('Calling Failed', `Could not initiate call to ${stop.phone}`);
      });
    }
  };

  const handleNavigate = () => {
    const lat = stop.coords.latitude;
    const lng = stop.coords.longitude;
    const label = encodeURIComponent(stop.name);
    // Standard Android navigation intent
    const url = `google.navigation:q=${lat},${lng}&mode=d`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(fallbackUrl);
        }
      })
      .catch(() => Linking.openURL(fallbackUrl));
  };

  const isBoarded = stop.status === 'BOARDED';
  const isNoShow = stop.status === 'NO_SHOW';

  return (
    <View style={[styles.card, isCurrent && styles.cardCurrent]}>
      {/* Top Header: Sequence + Name + Status */}
      <View style={styles.headerRow}>
        <View style={styles.seqRow}>
          <View style={[styles.seqBadge, isCurrent && styles.seqBadgeCurrent]}>
            <Text style={[styles.seqText, isCurrent && styles.seqTextCurrent]}>
              #{stop.sequence}
            </Text>
          </View>
          <View>
            <Text style={styles.nameText}>{stop.name}</Text>
            <Text style={styles.timeText}>{stop.scheduledTime}</Text>
          </View>
        </View>

        {/* Status Chip */}
        <View
          style={[
            styles.statusChip,
            isBoarded && styles.chipSuccess,
            isNoShow && styles.chipDanger,
            !isBoarded && !isNoShow && styles.chipWarning,
          ]}
        >
          <Text
            style={[
              styles.statusChipText,
              isBoarded && styles.chipTextSuccess,
              isNoShow && styles.chipTextDanger,
              !isBoarded && !isNoShow && styles.chipTextWarning,
            ]}
          >
            {isBoarded
              ? t('passengerBoarded')
              : isNoShow
              ? t('passengerNoShow')
              : t('passengerWaiting')}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <Ionicons name="location-sharp" size={16} color={colors.primary} />
        <Text style={styles.addressText}>{stop.address}</Text>
      </View>

      {/* Reassignment Note (e.g. Dynamic Gate / Waterlogging shift) */}
      {stop.isReassigned && (
        <View style={styles.reassignAlert}>
          <Ionicons name="information-circle" size={16} color={colors.accent} />
          <Text style={styles.reassignText}>
            {stop.reassignmentReason || t('reassignedBadge')}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {!isBoarded && !isNoShow && (
        <View style={styles.actionsRow}>
          {/* Call Button */}
          <TouchableOpacity style={styles.btnSecondary} onPress={handleCall} activeOpacity={0.7}>
            <Ionicons name="call" size={16} color={colors.primary} />
            <Text style={styles.btnSecondaryText}>{t('callPassenger')}</Text>
          </TouchableOpacity>

          {/* Maps Navigation Button */}
          <TouchableOpacity style={styles.btnSecondary} onPress={handleNavigate} activeOpacity={0.7}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <Text style={styles.btnSecondaryText}>{t('navigateGmaps')}</Text>
          </TouchableOpacity>

          {/* Arrived Trigger */}
          {onArrivedPress && (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => onArrivedPress(stop)}
              activeOpacity={0.7}
            >
              <Ionicons name="pin" size={16} color={colors.accent} />
              <Text style={[styles.btnSecondaryText, { color: colors.accent }]}>
                {t('arrivedPoint')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Verify Boarding Button */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => onVerifyPress(stop)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>{t('verifyBoarding')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* No Show Link */}
      {!isBoarded && !isNoShow && (
        <TouchableOpacity
          style={styles.noShowLink}
          onPress={() => onNoShowPress(stop)}
          activeOpacity={0.7}
        >
          <Text style={styles.noShowLinkText}>{t('reportNoShow')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardCurrent: {
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  seqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  seqBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seqBadgeCurrent: {
    backgroundColor: '#1565C0',
  },
  seqText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '800',
    color: '#64748B',
  },
  seqTextCurrent: {
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: typography.fontSizes.xs,
    color: '#64748B',
    marginTop: 1,
  },
  statusChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  chipSuccess: {
    backgroundColor: colors.successLight,
  },
  chipDanger: {
    backgroundColor: colors.dangerLight,
  },
  chipWarning: {
    backgroundColor: colors.warningLight,
  },
  statusChipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
  },
  chipTextSuccess: {
    color: colors.success,
  },
  chipTextDanger: {
    color: colors.danger,
  },
  chipTextWarning: {
    color: colors.warning,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: '#475569',
    lineHeight: 18,
  },
  reassignAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  reassignText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    color: colors.accent,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  btnSecondaryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: '#1565C0',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1565C0',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginLeft: 'auto',
  },
  btnPrimaryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noShowLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingVertical: 2,
  },
  noShowLinkText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
