import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * RentalzScreen
 * 
 * Corporate On-Demand & Hourly Car Rental Booking:
 * - Packages: Half Day (4h/40km), Full Day (8h/80km), Airport Transfer, Outstation
 * - Fleet: Executive Sedan, Prime SUV (Innova Crysta), Executive EV
 * - Pure white background (#FFFFFF) with solid black buttons (#000000)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord, UserProfile } from '../../types';

interface RentalzScreenProps {
  user?: UserProfile | null;
  onBack: () => void;
  onConfirmRental: (ride: RideRecord) => void;
}

type PackageId = 'HALF_DAY' | 'FULL_DAY' | 'AIRPORT' | 'OUTSTATION';
type VehicleCategory = 'SEDAN' | 'SUV' | 'EV';

interface PackageOption {
  id: PackageId;
  name: string;
  duration: string;
  rate: string;
  icon: string;
}

const PACKAGES: PackageOption[] = [
  {
    id: 'HALF_DAY',
    name: 'Half Day',
    duration: '4 Hrs • 40 Km',
    rate: '₹1,499',
    icon: 'time-outline',
  },
  {
    id: 'FULL_DAY',
    name: 'Full Day',
    duration: '8 Hrs • 80 Km',
    rate: '₹2,799',
    icon: 'calendar-outline',
  },
  {
    id: 'AIRPORT',
    name: 'Airport Transfer',
    duration: 'City to Airport BLR',
    rate: '₹1,199',
    icon: 'airplane-outline',
  },
  {
    id: 'OUTSTATION',
    name: 'Outstation',
    duration: 'Intercity • 250km/day',
    rate: '₹14/Km',
    icon: 'trail-sign-outline',
  },
];

const VEHICLES: { id: VehicleCategory; name: string; subtitle: string; seats: number; icon: string }[] = [
  {
    id: 'SEDAN',
    name: 'Executive Sedan',
    subtitle: 'Maruti Dzire / Toyota Etios',
    seats: 4,
    icon: 'car-outline',
  },
  {
    id: 'SUV',
    name: 'Prime SUV',
    subtitle: 'Toyota Innova Crysta',
    seats: 6,
    icon: 'car-sport-outline',
  },
  {
    id: 'EV',
    name: 'Business Electric',
    subtitle: 'Tata Nexon EV / BYD',
    seats: 4,
    icon: 'flash-outline',
  },
];

const TIME_SLOTS = ['08:00 AM', '09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '07:00 PM'];

export const RentalzScreen: React.FC<RentalzScreenProps> = ({
  user,
  onBack,
  onConfirmRental,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<PackageId>('HALF_DAY');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('SUV');
  const [selectedTime, setSelectedTime] = useState<string>('09:30 AM');
  const [rentalDate, setRentalDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pickupAddress, setPickupAddress] = useState<string>(
    'Indiranagar 100ft Road, Bengaluru'
  );
  const [destination, setDestination] = useState<string>(
    'Kempegowda Int. Airport (BLR)'
  );
  const [purpose, setPurpose] = useState<string>(
    'Client Site Visit & Business Meeting'
  );

  const activePackage = PACKAGES.find((p) => p.id === selectedPkg)!;
  const activeVehicle = VEHICLES.find((v) => v.id === selectedVehicle)!;

  const handleBooking = () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Required', 'Please enter a pickup address.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRide: RideRecord = {
      id: `rent-${Date.now()}`,
      tripCode: `RNT-${randomSuffix}`,
      date: rentalDate,
      shiftTime: selectedTime,
      direction: 'LOGIN',
      status: 'SCHEDULED',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: `p-${Date.now()}`,
        name: pickupAddress,
        landmark: 'Executive Rental Pickup',
        pickupTime: selectedTime,
        latitude: 12.9719,
        longitude: 77.6412,
      },
      destination: {
        id: `d-${Date.now()}`,
        name: destination || 'Corporate Campus Hub',
        campus: `${activePackage.name} Rental (${activeVehicle.name})`,
        city: 'Bengaluru',
      },
      vehicle: {
        id: `v-rent-${randomSuffix}`,
        plateNumber: 'KA-01-MJ-' + randomSuffix,
        model: activeVehicle.subtitle,
        make: activeVehicle.name,
        color: 'Corporate White',
        seatingCapacity: activeVehicle.seats,
      },
    };

    onConfirmRental(newRide);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Atharva Rentalz" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Corporate Car Rentals</Text>
            <Text style={styles.heroSubtitle}>
              On-demand dedicated chauffeur service for corporate travel, client meetings & airport runs.
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>PRE-APPROVED</Text>
          </View>
        </View>

        {/* Section 1: Choose Package */}
        <Text style={styles.sectionTitle}>1. SELECT RENTAL PACKAGE</Text>
        <View style={styles.packagesGrid}>
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPkg === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                activeOpacity={0.8}
                onPress={() => setSelectedPkg(pkg.id)}
                style={[styles.packageCard, isSelected && styles.packageCardActive]}
              >
                <View style={styles.packageHeader}>
                  <Ionicons
                    name={pkg.icon as any}
                    size={22}
                    color={isSelected ? '#FFFFFF' : '#000000'}
                  />
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.packageName, isSelected && styles.packageNameActive]}>
                  {pkg.name}
                </Text>
                <Text style={[styles.packageDuration, isSelected && styles.packageDurationActive]}>
                  {pkg.duration}
                </Text>
                <Text style={[styles.packageRate, isSelected && styles.packageRateActive]}>
                  {pkg.rate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: Choose Vehicle */}
        <Text style={styles.sectionTitle}>2. CHOOSE VEHICLE CATEGORY</Text>
        <View style={styles.vehicleList}>
          {VEHICLES.map((v) => {
            const isSelected = selectedVehicle === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.8}
                onPress={() => setSelectedVehicle(v.id)}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
              >
                <View style={[styles.vehicleIconWrap, isSelected && styles.vehicleIconWrapActive]}>
                  <Ionicons
                    name={v.icon as any}
                    size={22}
                    color={isSelected ? '#FFFFFF' : '#000000'}
                  />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, isSelected && styles.vehicleNameActive]}>
                    {v.name}
                  </Text>
                  <Text style={styles.vehicleSubtitle}>{v.subtitle}</Text>
                </View>
                <View style={[styles.seatsBadge, isSelected && styles.seatsBadgeActive]}>
                  <Ionicons
                    name="people-outline"
                    size={13}
                    color={isSelected ? '#FFFFFF' : '#4B5563'}
                  />
                  <Text style={[styles.seatsText, isSelected && styles.seatsTextActive]}>
                    {v.seats} Seats
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3: Time Slot */}
        <Text style={styles.sectionTitle}>3. REPORTING TIME</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <TouchableOpacity
                key={slot}
                activeOpacity={0.75}
                onPress={() => setSelectedTime(slot)}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#000000'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section 4: Locations & Purpose */}
        <Text style={styles.sectionTitle}>4. LOCATION & TRIP DETAILS</Text>
        <RoundedCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>PICKUP LOCATION</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={18} color="#000000" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                value={pickupAddress}
                onChangeText={setPickupAddress}
                placeholder="Enter pickup address"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>DESTINATION / CLIENT SITE</Text>
            <View style={styles.inputRow}>
              <Ionicons name="navigate-outline" size={18} color="#000000" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                value={destination}
                onChangeText={setDestination}
                placeholder="Enter destination or airport"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>PURPOSE / COST CENTER</Text>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={18} color="#000000" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Business meeting / Client visit"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </RoundedCard>

        {/* Rental Summary Card */}
        <RoundedCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Package:</Text>
            <Text style={styles.summaryValue}>{activePackage.name} ({activePackage.duration})</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehicle Tier:</Text>
            <Text style={styles.summaryValue}>{activeVehicle.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Employee Cost:</Text>
            <Text style={[styles.summaryValue, { color: '#16A34A', fontWeight: '800' }]}>
              Company Billed ({user?.department || 'Corporate Mobility'})
            </Text>
          </View>
        </RoundedCard>

        {/* Confirm Button */}
        <PrimaryButton
          title={`Confirm Rental Request (${activePackage.rate})`}
          onPress={handleBooking}
          style={styles.confirmBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroBanner: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  heroBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.xl,
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
  },
  packageCardActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  packageNameActive: {
    color: '#FFFFFF',
  },
  packageDuration: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  packageDurationActive: {
    color: '#D1D5DB',
  },
  packageRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  packageRateActive: {
    color: '#FFFFFF',
  },
  vehicleList: {
    gap: 10,
    marginBottom: spacing.xl,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
  },
  vehicleCardActive: {
    borderColor: '#000000',
    backgroundColor: '#F9FAFB',
  },
  vehicleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleIconWrapActive: {
    backgroundColor: '#000000',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  vehicleNameActive: {
    fontWeight: '800',
  },
  vehicleSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatsBadgeActive: {
    backgroundColor: '#000000',
  },
  seatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 3,
  },
  seatsTextActive: {
    color: '#FFFFFF',
  },
  timeScroll: {
    marginBottom: spacing.xl,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    padding: 16,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  summaryCard: {
    padding: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#000000',
  },
});
