import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function DriverApp() {
  const [driverInfo] = useState({
    name: 'Suresh Babu',
    vehiclePlate: 'KA-03-HA-8821',
    tripCode: 'ATH-8821',
    tripId: 'ATH-8821',
  });

  const [stops, setStops] = useState([
    {
      id: 'p1',
      name: 'Priya Sharma',
      phone: '+91-98711-22334',
      sequence: 1,
      address: 'HAL 2nd Stage, 80ft Road',
      coords: { lat: 12.9800, lng: 77.6250 },
      status: 'BOARDED',
      boardingOtp: '3190',
      isReassigned: false,
    },
    {
      id: 'p2',
      name: 'Amrutha Rao',
      phone: '+91-98450-11223',
      sequence: 2,
      address: 'Indiranagar 100ft Road (Near Metro Pillar 42)',
      coords: { lat: 12.9725, lng: 77.6430 },
      status: 'SCHEDULED',
      boardingOtp: '7492',
      isReassigned: true, // Triggered dynamic location update
      reassignmentReason: 'Gate 2 waterlogging. Shifted 300m to Metro Pillar 42.',
    },
    {
      id: 'p3',
      name: 'Karthik Natarajan',
      phone: '+91-99887-33445',
      sequence: 3,
      address: 'Domlur Layout, Inner Ring Road',
      coords: { lat: 12.9620, lng: 77.6480 },
      status: 'SCHEDULED',
      boardingOtp: '5821',
      isReassigned: false,
    },
  ]);

  const [otpInput, setOtpInput] = useState('');
  const [activePassengerId, setActivePassengerId] = useState('p2');

  // Verify Passenger 4-Digit PIN
  const handleVerifyOtp = async (passenger: any) => {
    if (otpInput.trim() === passenger.boardingOtp) {
      setStops((prev) =>
        prev.map((s) => (s.id === passenger.id ? { ...s, status: 'BOARDED' } : s))
      );
      setOtpInput('');
      Alert.alert('PIN Verified!', `${passenger.name} has been marked as BOARDED.`);

      // Send to backend API
      try {
        await fetch(`${API_BASE_URL}/trips/${driverInfo.tripId}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: driverInfo.tripId,
            employeeId: 'EMP-9042',
            boardingOtp: passenger.boardingOtp,
          }),
        });
      } catch (err) {
        // Offline verified
      }
    } else {
      Alert.alert('Invalid PIN', 'Please enter the correct 4-digit code shown on passenger phone.');
    }
  };

  // Launch Google Maps Turn-by-Turn Navigation
  const openGoogleMapsNav = (lat: number, lng: number, label: string) => {
    const url = `google.navigation:q=${lat},${lng}&label=${encodeURIComponent(label)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      });
  };

  const nextPassenger = stops.find((s) => s.status === 'SCHEDULED') || stops[1];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Driver Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>ATHARVA TRAVELS • DRIVER CONSOLE</Text>
          <Text style={styles.driverName}>{driverInfo.name}</Text>
          <Text style={styles.vehiclePlate}>{driverInfo.vehiclePlate} • Trip #{driverInfo.tripCode}</Text>
        </View>
        <View style={styles.dutyBadge}>
          <Text style={styles.dutyText}>ON TRIP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dynamic Location Reassignment Notification Banner */}
        {nextPassenger && nextPassenger.isReassigned && (
          <View style={styles.reassignedBanner}>
            <Text style={styles.bannerTitle}>📍 ROUTE UPDATE PUSHED TO YOUR CAB</Text>
            <Text style={styles.bannerBody}>
              {nextPassenger.name}'s pickup location was updated to:
              {'\n'}
              <Text style={{ fontWeight: 'bold' }}>{nextPassenger.address}</Text>
            </Text>
            <Text style={styles.bannerReason}>Reason: "{nextPassenger.reassignmentReason}"</Text>
          </View>
        )}

        {/* Current Stop Spotlight Card */}
        {nextPassenger && (
          <View style={styles.currentStopCard}>
            <Text style={styles.sectionHeading}>CURRENT TARGET STOP (STOP {nextPassenger.sequence})</Text>
            <Text style={styles.passengerName}>{nextPassenger.name}</Text>
            <Text style={styles.stopAddress}>📍 {nextPassenger.address}</Text>

            {/* Launch Google Maps Navigation Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => openGoogleMapsNav(nextPassenger.coords.lat, nextPassenger.coords.lng, nextPassenger.name)}
            >
              <Text style={styles.navButtonText}>🗺️ Start Google Maps Navigation</Text>
            </TouchableOpacity>

            {/* OTP Verification Box */}
            <View style={styles.otpVerifyBox}>
              <Text style={styles.otpLabel}>ENTER PASSENGER 4-DIGIT PIN TO BOARD:</Text>
              <View style={styles.otpRow}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="PIN"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otpInput}
                  onChangeText={setOtpInput}
                />
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={() => handleVerifyOtp(nextPassenger)}
                >
                  <Text style={styles.verifyBtnText}>Verify & Board</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Full Trip Manifest List */}
        <View style={styles.manifestBox}>
          <Text style={styles.manifestHeading}>FULL PASSENGER MANIFEST (3 STOPS)</Text>
          {stops.map((stop) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopSequence}>
                <Text style={styles.sequenceText}>{stop.sequence}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopSub}>{stop.address}</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>Phone: {stop.phone}</Text>
              </View>
              <View>
                {stop.status === 'BOARDED' ? (
                  <Text style={styles.statusBoarded}>Boarded ✓</Text>
                ) : (
                  <Text style={styles.statusScheduled}>Pending</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: '#1e293b',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  appTitle: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  driverName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  vehiclePlate: { color: '#94a3b8', fontSize: 12, marginTop: 1 },
  dutyBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dutyText: { color: '#022c22', fontWeight: 'bold', fontSize: 11 },
  scrollContent: { padding: 16 },
  reassignedBanner: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  bannerTitle: { color: '#451a03', fontWeight: '900', fontSize: 12 },
  bannerBody: { color: '#78350f', fontSize: 12, marginTop: 4 },
  bannerReason: { color: '#451a03', fontSize: 10, fontStyle: 'italic', marginTop: 4 },
  currentStopCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  sectionHeading: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  passengerName: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  stopAddress: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
  navButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  navButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  otpVerifyBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  otpLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  otpRow: { flexDirection: 'row', gap: 8 },
  otpInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: '#475569',
  },
  verifyBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  verifyBtnText: { color: '#022c22', fontWeight: 'bold', fontSize: 13 },
  manifestBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  manifestHeading: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 12 },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  stopSequence: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sequenceText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  stopName: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  stopSub: { color: '#94a3b8', fontSize: 11 },
  statusBoarded: { color: '#10b981', fontWeight: 'bold', fontSize: 11 },
  statusScheduled: { color: '#f59e0b', fontWeight: 'bold', fontSize: 11 },
});

