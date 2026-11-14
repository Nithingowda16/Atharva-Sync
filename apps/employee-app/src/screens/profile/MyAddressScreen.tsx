/**
 * Atharva Travels ETS — Employee Android App
 * MyAddressScreen
 * 
 * Strict No-Mock-Data:
 * When no addresses exist: "No saved addresses" empty state with "Add Address" CTA.
 * Includes interactive modal to add an address in local UI state.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton, SecondaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { UserAddress } from '../../types';

interface MyAddressScreenProps {
  onBack: () => void;
  addresses?: UserAddress[];
  onAddAddress?: (address: UserAddress) => void;
}

export const MyAddressScreen: React.FC<MyAddressScreenProps> = ({
  onBack,
  addresses = [],
  onAddAddress,
}) => {
  const [addressList, setAddressList] = useState<UserAddress[]>(addresses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSave = () => {
    if (!addressLine.trim()) return;

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      label,
      addressLine: addressLine.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim() || 'Bengaluru',
      pincode: pincode.trim() || undefined,
      isPrimary: addressList.length === 0,
    };

    const updated = [...addressList, newAddr];
    setAddressList(updated);
    if (onAddAddress) onAddAddress(newAddr);

    // Reset Form
    setAddressLine('');
    setLandmark('');
    setCity('');
    setPincode('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddressList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="My Addresses"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="add" size={24} color={colors.primary} />,
          onPress: () => setIsAddModalOpen(true),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addressList.length === 0 ? (
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
                      color={colors.primary}
                    />
                    <Text style={styles.labelText}>{addr.label.toUpperCase()}</Text>
                  </View>

                  {addr.isPrimary && (
                    <View style={styles.primaryPill}>
                      <Text style={styles.primaryText}>PRIMARY</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.addressLine}>{addr.addressLine}</Text>
                {addr.landmark && (
                  <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                )}
                <Text style={styles.cityText}>{addr.city} {addr.pincode && `— ${addr.pincode}`}</Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDelete(addr.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </RoundedCard>
            ))}

            <PrimaryButton
              title="Add Another Address"
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addAnotherButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
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
              {/* Label Selector */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.labelSelectorRow}>
                {['Home', 'Office', 'Secondary'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.75}
                    onPress={() => setLabel(item)}
                    style={[
                      styles.labelChip,
                      label === item && styles.labelChipActive,
                    ]}
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
                placeholder="e.g. Flat 402, Green Palms, 100ft Road"
                placeholderTextColor={colors.textMuted}
                value={addressLine}
                onChangeText={setAddressLine}
                style={styles.input}
              />

              {/* Landmark */}
              <Text style={styles.inputLabel}>Nearby Landmark</Text>
              <TextInput
                placeholder="e.g. Near Metro Pillar 124"
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

              <PrimaryButton
                title="Save Address"
                onPress={handleSave}
                disabled={!addressLine.trim()}
                style={styles.saveButton}
              />
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  addressContainer: {
    gap: spacing.md,
  },
  addressCard: {
    padding: spacing.lg,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  labelText: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  primaryPill: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  primaryText: {
    ...typography.presets.captionSmall,
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  addressLine: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
    marginTop: 4,
  },
  landmarkText: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cityText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  deleteText: {
    ...typography.presets.captionSmall,
    color: colors.error,
    fontWeight: '600',
  },
  addAnotherButton: {
    marginTop: spacing.md,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  modalForm: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.presets.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  labelSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  labelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  labelChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelChipText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelChipTextActive: {
    color: colors.textWhite,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    ...typography.presets.body,
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});

