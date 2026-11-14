/**
 * Atharva Travels ETS — Employee Android App
 * HistoryScreen
 * 
 * Strict No-Mock-Data:
 * When no past trip records exist: "No trip history".
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing } from '../../theme';
import { RideRecord } from '../../types';

interface HistoryScreenProps {
  onBack: () => void;
  historyRides?: RideRecord[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onBack,
  historyRides = [],
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Trip History" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {historyRides.length === 0 ? (
          <EmptyState
            iconName="time-outline"
            title="No trip history"
            description="Your completed commute trips and timestamps will be logged here once you begin traveling with Atharva ETS."
          />
        ) : (
          <View>
            {/* When history records exist from backend in Phase 2 */}
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
});

