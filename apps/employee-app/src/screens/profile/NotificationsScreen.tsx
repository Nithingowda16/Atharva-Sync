/**
 * Atharva Travels ETS — Employee Android App
 * NotificationsScreen
 * 
 * Strict No-Mock-Data:
 * When no notifications exist: "No notifications" empty state.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { NotificationRecord } from '../../types';

interface NotificationsScreenProps {
  onBack: () => void;
  notifications?: NotificationRecord[];
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  notifications = [],
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Notifications" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <EmptyState
            iconName="notifications-outline"
            title="No notifications"
            description="You are all caught up! Real-time alerts regarding trip departure, cab delays, and security will appear here."
          />
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((item) => (
              <RoundedCard
                key={item.id}
                style={[
                  styles.notifCard,
                  !item.isRead && styles.unreadCard,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.notifTextCol}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <Text style={styles.notifTime}>{item.timestamp}</Text>
                </View>
              </RoundedCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  listContainer: {
    gap: spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notifTextCol: {
    flex: 1,
  },
  notifTitle: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  notifBody: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
    marginTop: 4,
  },
});

