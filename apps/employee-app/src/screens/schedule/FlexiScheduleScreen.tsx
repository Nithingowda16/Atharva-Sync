import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * FlexiScheduleScreen
 * 
 * Features:
 * - Purpose-built for employees who missed their scheduled cab during pickup or drop
 * - Real-time scan of active corporate cabs travelling towards employee's location
 * - Shows live ETA, vacant seats, chauffeur name, vehicle registration & corridor route
 * - 1-tap "Request Seat in this Cab" to dynamically join en-route fleet
 * - Pure white theme with solid black buttons (#000000)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord, UserProfile } from '../../types';

interface FlexiScheduleScreenProps {
  user?: UserProfile | null;
  onBack: () => void;
  onRequestCab: (ride: RideRecord) => void;
}

interface EnRouteCab {
  id: string;
  tripCode: string;
  driverName: string;
  driverPhone: string;
  rating: number;
  vehiclePlate: string;
  vehicleModel: string;
  vacantSeats: number;
  totalSeats: number;
  corridorName: string;
  etaMinutes: number;
  speedKmH: number;
  currentStop: string;
  direction: 'LOGIN' | 'LOGOUT';
}

const AVAILABLE_CABS: EnRouteCab[] = [
  {
    id: 'cab-live-8821',
    tripCode: 'ATH-8821',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    rating: 4.92,
    vehiclePlate: 'KA-03-HA-8821',
    vehicleModel: 'Toyota Innova Crysta',
    vacantSeats: 3,
    totalSeats: 6,
    corridorName: 'Indiranagar 100ft Rd -> Domlur Flyover -> ORR Campus',
    etaMinutes: 6,
    speedKmH: 38,
    currentStop: '100ft Road Metro Junction (1.2 km away)',
    direction: 'LOGIN',
  },
  {
    id: 'cab-live-4109',
    tripCode: 'ATH-4109',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98450 77123',
    rating: 4.88,
    vehiclePlate: 'KA-05-MB-4109',
    vehicleModel: 'Toyota Etios (Sedan)',
    vacantSeats: 1,
    totalSeats: 4,
    corridorName: 'Old Airport Rd -> HAL 2nd Stage -> Bellandur Hub',
    etaMinutes: 11,
    speedKmH: 42,
    currentStop: 'Leela Palace Signal (2.8 km away)',
    direction: 'LOGIN',
  },
  {
    id: 'cab-live-9920',
    tripCode: 'ATH-9920',
    driverName: 'Vinod Prasad',
    driverPhone: '+91 97411 22890',
    rating: 4.95,
    vehiclePlate: 'KA-01-MJ-9920',
    vehicleModel: 'Tata Nexon EV (Green Fleet)',
    vacantSeats: 2,
    totalSeats: 4,
    corridorName: 'CMH Road -> Indiranagar 100ft -> Bellandur Tech Park',
    etaMinutes: 15,
    speedKmH: 35,
    currentStop: 'CMH Road Junction (4.1 km away)',
    direction: 'LOGIN',
  },
];

export const FlexiScheduleScreen: React.FC<FlexiScheduleScreenProps> = ({
  user,
  onBack,
  onRequestCab,
}) => {
  const [selectedCab, setSelectedCab] = useState<EnRouteCab | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pickupAddress, setPickupAddress] = useState(
    'Gate 2, Golden Palms Apts, Indiranagar 100ft Road'
  );
  const [directionFilter, setDirectionFilter] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');

  const handleOpenConfirm = (cab: EnRouteCab) => {
    setSelectedCab(cab);
    setConfirmModalVisible(true);
  };

  const handleConfirmRequest = () => {
    if (!selectedCab) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    const newRide: RideRecord = {
      id: `flexi-${Date.now()}`,
      tripCode: selectedCab.tripCode,
      date: today,
      shiftTime: timeNow,
      direction: selectedCab.direction,
      status: 'ON_THE_WAY',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: `p-flexi-${Date.now()}`,
        name: pickupAddress,
        landmark: 'En-Route Catch-Up Stop',
        pickupTime: `In ${selectedCab.etaMinutes} mins`,
        latitude: 12.9719,
        longitude: 77.6412,
      },
      destination: {
        id: 'dest-techpark',
        name: 'Enterprise Tech Park, Tower B',
        campus: 'Outer Ring Road Campus',
        city: 'Bengaluru',
      },
      vehicle: {
        id: `v-${selectedCab.id}`,
        plateNumber: selectedCab.vehiclePlate,
        model: selectedCab.vehicleModel,
        make: 'Enterprise Fleet',
        color: 'Corporate White',
        seatingCapacity: selectedCab.totalSeats,
      },
      driver: {
        id: `drv-${selectedCab.id}`,
        fullName: selectedCab.driverName,
        phone: selectedCab.driverPhone,
        rating: selectedCab.rating,
      },
      etaMinutes: selectedCab.etaMinutes,
      currentLocation: {
        latitude: 12.9760,
        longitude: 77.6320,
        heading: 45,
        speed: selectedCab.speedKmH,
        lastUpdated: new Date().toISOString(),
      },
    };

    setConfirmModalVisible(false);
    onRequestCab(newRide);

    Alert.alert(
      'Seat Confirmed! 🎉',
      `Chauffeur ${selectedCab.driverName} (${selectedCab.vehiclePlate}) has been notified to pick you up at ${pickupAddress}. Estimated arrival in ${selectedCab.etaMinutes} mins. Boarding OTP is 7492.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Flexi Schedule" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner: Missed Cab Catch-Up Context */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="flash" size={20} color="#000000" />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Missed Your Scheduled Cab?</Text>
            <Text style={styles.heroSubtitle}>
              Atharva Flexi Corridor locates active company cabs currently travelling towards your location. Request an available vacant seat instantly.
            </Text>
          </View>
        </View>

        {/* Current Pickup Node Box */}
        <RoundedCard style={styles.locationCard}>
          <View style={styles.locationHeaderRow}>
            <Text style={styles.locationLabel}>YOUR PICKUP LOCATION</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>CORRIDOR ACTIVE</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#16A34A" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>{pickupAddress}</Text>
              <Text style={styles.locationSub}>Destination: Enterprise Tech Park, Tower B</Text>
            </View>
          </View>
        </RoundedCard>

        {/* Live Active Cabs Heading */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>
            ACTIVE CABS HEADING TOWARDS YOU ({AVAILABLE_CABS.length})
          </Text>
          <Text style={styles.scanRadiusText}>3.5 km corridor scan</Text>
        </View>

        {/* Cabs List */}
        <View style={styles.cabsList}>
          {AVAILABLE_CABS.map((cab) => (
            <RoundedCard key={cab.id} style={styles.cabCard}>
              {/* Card Top: Plate, ETA & Seats */}
              <View style={styles.cabHeaderRow}>
                <View>
                  <Text style={styles.plateText}>{cab.vehiclePlate}</Text>
                  <Text style={styles.modelText}>{cab.vehicleModel}</Text>
                </View>

                <View style={styles.badgeGroup}>
                  <View style={styles.etaPill}>
                    <Ionicons name="time-outline" size={12} color="#000000" />
                    <Text style={styles.etaPillText}>{cab.etaMinutes} MINS ETA</Text>
                  </View>
                  <View style={styles.seatsPill}>
                    <Text style={styles.seatsPillText}>{cab.vacantSeats} Seats Left</Text>
                  </View>
                </View>
              </View>

              {/* Chauffeur & Corridor Info */}
              <View style={styles.infoBox}>
                <View style={styles.chauffeurRow}>
                  <View style={styles.avatarMini}>
                    <Ionicons name="person" size={14} color="#000000" />
                  </View>
                  <Text style={styles.driverNameText}>{cab.driverName}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color="#EAB308" />
                    <Text style={styles.ratingText}>{cab.rating}</Text>
                  </View>
                  <Text style={styles.speedText}>• {cab.speedKmH} km/h</Text>
                </View>

                <View style={styles.corridorRow}>
                  <Ionicons name="navigate-outline" size={13} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.corridorText} numberOfLines={1}>
                    {cab.corridorName}
                  </Text>
                </View>

                <View style={styles.currentStopRow}>
                  <Ionicons name="radio-outline" size={13} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={styles.currentStopText} numberOfLines={1}>
                    Near: {cab.currentStop}
                  </Text>
                </View>
              </View>

              {/* Request Seat Action Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleOpenConfirm(cab)}
                style={styles.requestButton}
              >
                <Ionicons name="hand-right-outline" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.requestButtonText}>
                  Request Seat in this Cab ({cab.etaMinutes} min)
                </Text>
              </TouchableOpacity>
            </RoundedCard>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Join En-Route Cab?</Text>
                <Text style={styles.modalSubtitle}>Dynamic Catch-Up Stop Request</Text>
              </View>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Vehicle:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedCab?.vehiclePlate} ({selectedCab?.vehicleModel})
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Chauffeur:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedCab?.driverName} ({selectedCab?.driverPhone})
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Pickup At:</Text>
                <Text style={styles.modalInfoValue}>{pickupAddress}</Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Estimated Arrival:</Text>
                <Text style={[styles.modalInfoValue, { color: '#16A34A', fontWeight: '800' }]}>
                  Within {selectedCab?.etaMinutes} minutes
                </Text>
              </View>

              <View style={styles.dispatchNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#000000" style={{ marginRight: 8 }} />
                <Text style={styles.dispatchNoticeText}>
                  Chauffeur terminal will immediately receive a stop order to pick you up. Boarding OTP will be 7492.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmRequest}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>Confirm Seat Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.lg,
  },
  heroIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },
  locationCard: {
    padding: 14,
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  scanRadiusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  cabsList: {
    gap: 14,
  },
  cabCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  cabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plateText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  modelText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  etaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  seatsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  chauffeurRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  driverNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  speedText: {
    fontSize: 11,
    color: '#64748B',
  },
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corridorText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  currentStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStopText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
    flex: 1,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    height: 46,
    borderRadius: 12,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    gap: 10,
    marginBottom: 18,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  modalInfoValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  dispatchNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  dispatchNoticeText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
