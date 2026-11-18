/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * High-Visibility Offline Status Banner & Outbox Sync Trigger
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from '../services/syncService';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme';

export const OfflineBanner: React.FC = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(syncService.getIsOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubNet = syncService.subscribeToNetwork((connected) => {
      setIsOnline(connected);
    });

    const unsubSync = syncService.subscribeToSync((count) => {
      setPendingCount(count);
    });

    return () => {
      unsubNet();
      unsubSync();
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncService.flushOutbox();
    setIsSyncing(false);
  };

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, isOnline ? styles.syncPendingBg : styles.offlineBg]}>
      <View style={styles.left}>
        <Ionicons
          name={isOnline ? 'cloud-upload-outline' : 'cloud-offline'}
          size={20}
          color={colors.textPrimary}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOnline ? 'Pending Server Sync' : t('offlineBannerTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {pendingCount} {t('pendingSyncCount')}
          </Text>
        </View>
      </View>

      {isOnline && (
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleManualSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.textDark} />
          ) : (
            <Text style={styles.syncBtnText}>{t('syncNow')}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  offlineBg: {
    backgroundColor: '#B45309', // Dark Amber
  },
  syncPendingBg: {
    backgroundColor: '#0284C7', // Sky Blue
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  syncBtn: {
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  syncBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    color: colors.textDark,
  },
});
