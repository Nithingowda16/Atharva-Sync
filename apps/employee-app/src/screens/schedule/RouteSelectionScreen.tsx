/**
 * Atharva Travels ETS — Employee Android App
 * RouteSelectionScreen
 * 
 * Strict No-Mock-Data:
 * Displays route corridor selection cards with deep blue selected border,
 * and clean empty state when no routes are available.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { RouteCard } from '../../components/booking/RouteCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing } from '../../theme';
import { RouteRecord } from '../../types';

interface RouteSelectionScreenProps {
  onBack: () => void;
  onSelectRoute: (route: RouteRecord) => void;
  availableRoutes?: RouteRecord[];
  currentSelectedId?: string;
}

export const RouteSelectionScreen: React.FC<RouteSelectionScreenProps> = ({
  onBack,
  onSelectRoute,
  availableRoutes = [],
  currentSelectedId,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    currentSelectedId || (availableRoutes.length > 0 ? availableRoutes[0].id : null)
  );

  const selectedRoute = availableRoutes.find((r) => r.id === selectedId);

  const handleConfirm = () => {
    if (selectedRoute) {
      onSelectRoute(selectedRoute);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Select Route" onBack={onBack} />

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollList}>
          {availableRoutes.length === 0 ? (
            <EmptyState
              iconName="map-outline"
              title="No routes available"
              description="Corridors will appear once your corporate transport team publishes transit routes for this shift."
            />
          ) : (
            availableRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                selected={route.id === selectedId}
                onPress={() => setSelectedId(route.id)}
              />
            ))
          )}
        </ScrollView>

        {availableRoutes.length > 0 && (
          <View style={styles.footerContainer}>
            <PrimaryButton
              title="Confirm Route"
              onPress={handleConfirm}
              disabled={!selectedId}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollList: {
    flexGrow: 1,
    paddingVertical: spacing.md,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

