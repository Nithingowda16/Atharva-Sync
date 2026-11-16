import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * PickupLocationScreen
 * 
 * Features:
 * - Automatically loads and displays employee's saved addresses at the top
 * - 1-Tap Auto-Detect Current GPS Location
 * - Corporate transit hubs and corridor boarding stops
 * - Instant selection and confirmation with solid black CTA
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SelectionCard } from '../../components/common/SelectionCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { PickupPoint, UserAddress } from '../../types';
import { addressService } from '../../services/addressService';

const DEFAULT_PICKUPS: PickupPoint[] = [
  {
    id: 'pk-indiranagar',
    name: 'Indiranagar 100ft Rd',
    landmark: 'Opposite Metro Pillar 142',
    address: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    latitude: 12.9719,
    longitude: 77.6412,
    isPrimary: true,
  },
  {
    id: 'pk-koramangala',
    name: 'Koramangala 5th Block',
    landmark: 'Sony World Junction',
    address: '80 Feet Rd, 5th Block, Koramangala, Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    id: 'pk-hsr',
    name: 'HSR Layout BDA Complex',
    landmark: 'Near 27th Main Bus Stand',
    address: 'Sector 6, HSR Layout, Bengaluru',
    latitude: 12.9116,
    longitude: 77.6389,
  },
  {
    id: 'pk-whitefield',
    name: 'Whitefield ITPL Main Gate',
    landmark: 'Pattandur Agrahara Metro',
    address: 'ITPL Main Rd, Whitefield, Bengaluru',
    latitude: 12.9863,
    longitude: 77.7337,
  },
  {
    id: 'pk-bellandur',
    name: 'Bellandur Central Mall',
    landmark: 'Outer Ring Road Flyover',
    address: 'Outer Ring Rd, Bellandur, Bengaluru',
    latitude: 12.9304,
    longitude: 77.6784,
  },
];

interface PickupLocationScreenProps {
  onBack: () => void;
  onSelectPickup: (pickup: PickupPoint) => void;
  employeeId?: string;
  availablePickups?: PickupPoint[];
  currentSelectedId?: string;
}

export const PickupLocationScreen: React.FC<PickupLocationScreenProps> = ({
  onBack,
  onSelectPickup,
  employeeId = '111',
  availablePickups = [],
  currentSelectedId,
}) => {
  const [savedAddresses, setSavedAddresses] = useState<PickupPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(currentSelectedId || null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Load saved addresses for this employee
  useEffect(() => {
    addressService.getAddresses(employeeId).then((addrs) => {
      if (addrs && addrs.length > 0) {
        const mapped: PickupPoint[] = addrs.map((a) => ({
          id: a.id,
          name: `${a.label}: ${a.addressLine}`,
          landmark: a.landmark || 'Saved Profile Location',
          address: `${a.addressLine}, ${a.city} ${a.pincode || ''}`,
          latitude: a.latitude || 12.9719,
          longitude: a.longitude || 77.6412,
          isPrimary: a.isPrimary,
        }));
        setSavedAddresses(mapped);
        if (!selectedId) {
          const primary = mapped.find((m) => m.isPrimary) || mapped[0];
          setSelectedId(primary.id);
        }
      }
    });
  }, [employeeId]);

  // Combined list of pickups
  const basePickups = availablePickups.length > 0 ? availablePickups : DEFAULT_PICKUPS;
  const allPickups = [...savedAddresses, ...basePickups.filter((b) => !savedAddresses.some((s) => s.id === b.id))];

  useEffect(() => {
    if (!selectedId && allPickups.length > 0) {
      setSelectedId(allPickups[0].id);
    }
  }, [allPickups.length]);

  const filteredPickups = allPickups.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.landmark && p.landmark.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedPickup = allPickups.find((p) => p.id === selectedId);

  const handleConfirm = () => {
    if (selectedPickup) {
      onSelectPickup(selectedPickup);
    }
  };

  // Auto-Detect Current Location
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const loc = await addressService.autoDetectLocation();
      const detectedPoint: PickupPoint = {
        id: `detected-${Date.now()}`,
        name: `Current Spot: ${loc.addressLine}`,
        landmark: loc.landmark,
        address: `${loc.addressLine}, ${loc.city} ${loc.pincode}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        isPrimary: true,
      };

      setSavedAddresses((prev) => [detectedPoint, ...prev]);
      setSelectedId(detectedPoint.id);
      Alert.alert('Pickup Location Detected', `Auto-detected your boarding node:\n${loc.addressLine}`);
    } catch (e) {
      Alert.alert('Notice', 'Unable to auto-detect GPS. Please select from registered hubs.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Pickup Location" onBack={onBack} />

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            placeholder="Search boarding stop or landmark..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* 1-Tap Auto-Detect GPS Location Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAutoDetect}
          disabled={isDetecting}
          style={styles.autoDetectBanner}
        >
          {isDetecting ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Ionicons name="navigate-circle" size={20} color="#000000" />
          )}
          <Text style={styles.autoDetectBannerText}>
            {isDetecting ? 'Detecting current GPS coordinates...' : 'Use Current GPS Location as Pickup'}
          </Text>
        </TouchableOpacity>

        {/* List of Pickups */}
        <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 && !searchQuery && (
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={14} color="#000000" />
              <Text style={styles.sectionHeaderText}>MY SAVED RESIDENTIAL ADDRESS</Text>
            </View>
          )}

          {filteredPickups.map((pickup) => {
            const isSaved = savedAddresses.some((s) => s.id === pickup.id);
            const isSelected = pickup.id === selectedId;

            return (
              <SelectionCard
                key={pickup.id}
                selected={isSelected}
                onPress={() => setSelectedId(pickup.id)}
              >
                <View style={styles.pickupCardContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.pickupName}>{pickup.name}</Text>
                    {isSaved && (
                      <View style={styles.savedBadge}>
                        <Text style={styles.savedBadgeText}>SAVED ADDRESS</Text>
                      </View>
                    )}
                  </View>
                  {pickup.landmark && (
                    <Text style={styles.pickupLandmark}>Landmark: {pickup.landmark}</Text>
                  )}
                  {pickup.address && (
                    <Text style={styles.pickupAddress}>{pickup.address}</Text>
                  )}
                </View>
              </SelectionCard>
            );
          })}
        </ScrollView>

        {/* Solid Black Confirm Button */}
        <View style={styles.footerContainer}>
          <PrimaryButton
            title={selectedPickup ? `Confirm: ${selectedPickup.name.split(':')[0]}` : 'Confirm Pickup Location'}
            onPress={handleConfirm}
            disabled={!selectedId}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.presets.body,
    color: '#0F172A',
  },
  autoDetectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
    marginVertical: spacing.sm,
  },
  autoDetectBannerText: {
    ...typography.presets.captionBold,
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    ...typography.presets.captionSmall,
    color: '#000000',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollList: {
    flexGrow: 1,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  pickupCardContent: {
    paddingRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickupName: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    flex: 1,
  },
  savedBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  pickupLandmark: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  pickupAddress: {
    ...typography.presets.caption,
    color: '#94A3B8',
    marginTop: 2,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
