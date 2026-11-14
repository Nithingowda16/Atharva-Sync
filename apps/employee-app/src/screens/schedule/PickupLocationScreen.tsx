/**
 * Atharva Travels ETS — Employee Android App
 * PickupLocationScreen
 * 
 * Strict No-Mock-Data:
 * Search bar, selectable pickup cards with blue border when chosen,
 * and clean empty state when no registered pickups are available.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SelectionCard } from '../../components/common/SelectionCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { PickupPoint } from '../../types';

interface PickupLocationScreenProps {
  onBack: () => void;
  onSelectPickup: (pickup: PickupPoint) => void;
  availablePickups?: PickupPoint[];
  currentSelectedId?: string;
}

export const PickupLocationScreen: React.FC<PickupLocationScreenProps> = ({
  onBack,
  onSelectPickup,
  availablePickups = [],
  currentSelectedId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    currentSelectedId || (availablePickups.length > 0 ? availablePickups[0].id : null)
  );

  const filteredPickups = availablePickups.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.landmark && p.landmark.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedPickup = availablePickups.find((p) => p.id === selectedId);

  const handleConfirm = () => {
    if (selectedPickup) {
      onSelectPickup(selectedPickup);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Pickup Location" onBack={onBack} />

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search boarding stop or landmark..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* List of Pickups or Empty State */}
        <ScrollView contentContainerStyle={styles.scrollList}>
          {filteredPickups.length === 0 ? (
            <EmptyState
              iconName="location-outline"
              title="No pickup locations"
              description="No registered boarding stops found. Stops will populate according to your residential roster."
            />
          ) : (
            filteredPickups.map((pickup) => (
              <SelectionCard
                key={pickup.id}
                selected={pickup.id === selectedId}
                onPress={() => setSelectedId(pickup.id)}
              >
                <View style={styles.pickupCardContent}>
                  <Text style={styles.pickupName}>{pickup.name}</Text>
                  {pickup.landmark && (
                    <Text style={styles.pickupLandmark}>Landmark: {pickup.landmark}</Text>
                  )}
                  {pickup.address && (
                    <Text style={styles.pickupAddress}>{pickup.address}</Text>
                  )}
                </View>
              </SelectionCard>
            ))
          )}
        </ScrollView>

        {/* Confirm Button */}
        {availablePickups.length > 0 && (
          <View style={styles.footerContainer}>
            <PrimaryButton
              title="Confirm Pickup Location"
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.presets.body,
    color: colors.textPrimary,
  },
  scrollList: {
    flexGrow: 1,
    paddingVertical: spacing.xs,
  },
  pickupCardContent: {
    paddingRight: spacing.sm,
  },
  pickupName: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  pickupLandmark: {
    ...typography.presets.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  pickupAddress: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

