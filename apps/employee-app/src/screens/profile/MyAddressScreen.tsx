import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * MyAddressScreen
 * 
 * Features:
 * - Persistent storage strictly mapped to employee ID (never lost upon navigation)
 * - Auto-detect location feature with instant GPS / telemetry reverse geocoding
 * - Home / Office / Secondary address tagging
 * - Primary address indicator (powers 1-tap schedule pickup auto-fill)
 * - Pure white theme with solid black buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { UserAddress } from '../../types';
import { addressService } from '../../services/addressService';

interface MyAddressScreenProps {
  onBack: () => void;
  employeeId?: string;
  onAddAddress?: (address: UserAddress) => void;
}

export const MyAddressScreen: React.FC<MyAddressScreenProps> = ({
  onBack,
  employeeId = '111',
  onAddAddress,
}) => {
  const [addressList, setAddressList] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Form State
  const [label, setLabel] = useState<'Home' | 'Office' | 'Secondary'>('Home');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9719,
    longitude: 77.6412,
  });

  // Load persistent addresses for this employee
  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await addressService.getAddresses(employeeId);
      setAddressList(data);
    } catch (e) {
      console.warn('Failed loading addresses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [employeeId]);

  // Auto-Detect Location Handler
  const handleAutoDetect = async () => {
    setIsDetectingLocation(true);
    try {
      const detected = await addressService.autoDetectLocation();
      setAddressLine(detected.addressLine);
      setLandmark(detected.landmark);
      setCity(detected.city);
      setPincode(detected.pincode);
      setCoords({ latitude: detected.latitude, longitude: detected.longitude });
      Alert.alert(
        'Location Auto-Detected',
        `Successfully retrieved current coordinates and transit address:\n${detected.addressLine}`
      );
    } catch (e) {
      Alert.alert('Notice', 'Unable to fetch exact GPS fix. Defaulting to Bengaluru corridor.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert('Required Field', 'Please enter your street address or tap Auto-Detect.');
      return;
    }

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      label,
      addressLine: addressLine.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim() || 'Bengaluru',
      pincode: pincode.trim() || undefined,
      latitude: coords.latitude,
      longitude: coords.longitude,
      isPrimary: addressList.length === 0 || label === 'Home',
    };

    const result = await addressService.saveAddress(employeeId, newAddr);
    setAddressList(result.addresses);
    if (onAddAddress) onAddAddress(newAddr);

    // Reset Form
    setAddressLine('');
    setLandmark('');
    setCity('Bengaluru');
    setPincode('560038');
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const updated = await addressService.deleteAddress(employeeId, id);
    setAddressList(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="My Addresses"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="add" size={24} color="#000000" />,
          onPress: () => setIsAddModalOpen(true),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Employee ID Context Banner */}
        <View style={styles.empContextBanner}>
          <Ionicons name="finger-print-outline" size={16} color="#000000" />
          <Text style={styles.empContextText}>
            Linked Roster Profile: <Text style={styles.empContextHighlight}>{employeeId}</Text>
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#000000" />
            <Text style={styles.loadingText}>Syncing addresses...</Text>
          </View>
        ) : addressList.length === 0 ? (
          <EmptyState
            iconName="location-outline"
            title="No saved addresses"
            description="Add your home residential address or landmark to ensure accurate cab routing and statutory escort rostering."
            actionTitle="Add New Address"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <View style={styles.addressContainer}>
            {addressList.map((addr) => (
              <RoundedCard key={addr.id} style={styles.addressCard}>
                <View style={styles.addressHeaderRow}>
                  <View style={styles.labelBadge}>
                    <Ionicons
                      name={addr.label === 'Home' ? 'home' : 'business'}
                      size={14}
                      color="#000000"
                    />
                    <Text style={styles.labelText}>{addr.label.toUpperCase()}</Text>
                  </View>

                  {addr.isPrimary && (
                    <View style={styles.primaryPill}>
                      <Text style={styles.primaryText}>DEFAULT PICKUP</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.addressLine}>{addr.addressLine}</Text>
                {addr.landmark && (
                  <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                )}
                <Text style={styles.cityText}>
                  {addr.city} {addr.pincode && `— ${addr.pincode}`}
                </Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDelete(addr.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={15} color={colors.error} />
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </RoundedCard>
            ))}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addAnotherButton}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addAnotherButtonText}>Add Another Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal with Auto-Detect */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <AppHeader title="Add New Address" onBack={() => setIsAddModalOpen(false)} />

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalForm}>
              {/* 1-Tap Auto-Detect Location Action */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAutoDetect}
                disabled={isDetectingLocation}
                style={styles.autoDetectButton}
              >
                {isDetectingLocation ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Ionicons name="navigate-circle" size={24} color="#000000" />
                )}
                <View style={styles.autoDetectTextCol}>
                  <Text style={styles.autoDetectTitle}>
                    {isDetectingLocation ? 'Detecting current GPS...' : '📍 Auto-Detect Current Location'}
                  </Text>
                  <Text style={styles.autoDetectSubtitle}>
                    Automatically fetch address & coordinates via device GPS
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR ENTER DETAILS</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Label Selector */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.labelSelectorRow}>
                {(['Home', 'Office', 'Secondary'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.75}
                    onPress={() => setLabel(item)}
                    style={[styles.labelChip, label === item && styles.labelChipActive]}
                  >
                    <Text
                      style={[
                        styles.labelChipText,
                        label === item && styles.labelChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Address Line */}
              <Text style={styles.inputLabel}>Apartment / Street / Area</Text>
              <TextInput
                placeholder="e.g. Indiranagar 100ft Road, HAL 2nd Stage"
                placeholderTextColor={colors.textMuted}
                value={addressLine}
                onChangeText={setAddressLine}
                style={styles.input}
              />

              {/* Landmark */}
              <Text style={styles.inputLabel}>Nearby Landmark</Text>
              <TextInput
                placeholder="e.g. Near Metro Pillar 142"
                placeholderTextColor={colors.textMuted}
                value={landmark}
                onChangeText={setLandmark}
                style={styles.input}
              />

              {/* City */}
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                placeholder="e.g. Bengaluru"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
                style={styles.input}
              />

              {/* Pincode */}
              <Text style={styles.inputLabel}>Postal Pincode</Text>
              <TextInput
                placeholder="e.g. 560038"
                placeholderTextColor={colors.textMuted}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Save Address Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={!addressLine.trim()}
                style={[
                  styles.saveAddressButton,
                  !addressLine.trim() && styles.saveAddressButtonDisabled,
                ]}
              >
                <Text style={styles.saveAddressButtonText}>Save Address to Profile</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  empContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  empContextText: {
    ...typography.presets.caption,
    color: '#64748B',
  },
  empContextHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.presets.caption,
    color: '#64748B',
  },
  addressContainer: {
    gap: spacing.md,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  labelText: {
    ...typography.presets.badge,
    color: '#0F172A',
    fontWeight: '700',
  },
  primaryPill: {
    backgroundColor: '#000000',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  primaryText: {
    ...typography.presets.badge,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  addressLine: {
    ...typography.presets.bodyBold,
    color: '#0F172A',
    marginBottom: 4,
  },
  landmarkText: {
    ...typography.presets.caption,
    color: '#64748B',
    marginBottom: 2,
  },
  cityText: {
    ...typography.presets.captionSmall,
    color: '#94A3B8',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    ...typography.presets.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    gap: 8,
    marginTop: spacing.sm,
  },
  addAnotherButtonText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalScroll: {
    padding: spacing.lg,
  },
  modalForm: {
    gap: spacing.sm,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  autoDetectTextCol: {
    flex: 1,
  },
  autoDetectTitle: {
    ...typography.presets.bodyBold,
    color: '#000000',
  },
  autoDetectSubtitle: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    ...typography.presets.captionSmall,
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  inputLabel: {
    ...typography.presets.captionBold,
    color: '#0F172A',
    marginTop: spacing.xs,
  },
  labelSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  labelChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labelChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  labelChipText: {
    ...typography.presets.captionBold,
    color: '#64748B',
  },
  labelChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.presets.body,
    color: '#0F172A',
  },
  saveAddressButton: {
    backgroundColor: '#000000',
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveAddressButtonDisabled: {
    opacity: 0.5,
  },
  saveAddressButtonText: {
    ...typography.presets.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
