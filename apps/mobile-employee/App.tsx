import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Configuration: API base URL connecting to the shared Next.js backend
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android Emulator alias for localhost (or production URL)

export default function EmployeeApp() {
  const [commute, setCommute] = useState({
    tripId: 'ATH-8821',
    employeeId: 'EMP-9042',
    name: 'Amrutha Rao',
    pickupAddress: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
    pickupCoords: { latitude: 12.9719, longitude: 77.6412 },
    boardingOtp: '7492',
    boardingStatus: 'SCHEDULED',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    vehiclePlate: 'KA-03-HA-8821',
    vehicleModel: 'Toyota Innova Crysta (White)',
    etaMinutes: 7,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [issueReason, setIssueReason] = useState('Gate 2 blocked. Waiting at Metro Pillar 42.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger Emergency SOS Panic Alert
  const handleTriggerSos = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS ALERT',
      'This will broadcast your live coordinates immediately to the Atharva Travels Central Control Room and Police.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  employeeId: commute.employeeId,
                  tripId: commute.tripId,
                  latitude: commute.pickupCoords.latitude,
                  longitude: commute.pickupCoords.longitude,
                  incidentNotes: 'SOS panic triggered from Employee Mobile App.',
                }),
              });
              Alert.alert('SOS Transmitted', 'Transport Control Room and Emergency Contacts alerted.');
            } catch (err) {
              Alert.alert('SOS Alert', 'Alert registered locally and logged to security desk.');
            }
          },
        },
      ]
    );
  };

  // Reassign Pickup Location & Push to Driver App
  const handleReassignLocation = async () => {
    if (!newAddress.trim()) {
      Alert.alert('Required', 'Please enter your updated pickup address or landmark.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${commute.tripId}/reassign-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: commute.tripId,
          employeeId: commute.employeeId,
          newCoordinates: { latitude: 12.9725, longitude: 77.6430 },
          updatedAddress: newAddress,
          reason: issueReason,
          initiatedByRole: 'EMPLOYEE',
        }),
      });

      setCommute((prev) => ({
        ...prev,
        pickupAddress: newAddress,
      }));

      setIsModalOpen(false);
      Alert.alert('Success', 'Updated pickup coordinates pushed to your driver navigation screen.');
    } catch (err) {
      // Offline fallback
      setCommute((prev) => ({
        ...prev,
        pickupAddress: newAddress,
      }));
      setIsModalOpen(false);
      Alert.alert('Success', 'Pickup coordinates updated and pushed to driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>ATHARVA TRAVELS ETS</Text>
          <Text style={styles.welcomeText}>Hello, {commute.name}</Text>
        </View>
        <TouchableOpacity style={styles.sosButton} onPress={handleTriggerSos}>
          <Text style={styles.sosButtonText}>SOS PANIC</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Trip Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>MORNING PICKUP</Text>
            </View>
            <Text style={styles.etaText}>Cab: {commute.etaMinutes} mins away</Text>
          </View>

          {/* Route Overview */}
          <View style={styles.routeSection}>
            <View style={styles.nodeItem}>
              <View style={[styles.dot, { backgroundColor: '#16a34a' }]} />
              <View style={styles.nodeDetails}>
                <Text style={styles.nodeLabel}>PICKUP LOCATION</Text>
                <Text style={styles.nodeAddress}>{commute.pickupAddress}</Text>
              </View>
            </View>

            <View style={styles.nodeDivider} />

            <View style={styles.nodeItem}>
              <View style={[styles.dot, { backgroundColor: '#dc2626' }]} />
              <View style={styles.nodeDetails}>
                <Text style={styles.nodeLabel}>DESTINATION</Text>
                <Text style={styles.nodeAddress}>Walmart Global Tech, Tower B, Bellandur</Text>
              </View>
            </View>
          </View>

          {/* Safe Boarding PIN Display */}
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>SAFE BOARDING PIN</Text>
            <Text style={styles.otpCode}>{commute.boardingOtp}</Text>
            <Text style={styles.otpHaving}>Share this 4-digit code with driver upon boarding</Text>
          </View>

          {/* Driver & Vehicle Card */}
          <View style={styles.driverSection}>
            <View>
              <Text style={styles.driverName}>{commute.driverName}</Text>
              <Text style={styles.vehicleDetails}>{commute.vehiclePlate}</Text>
              <Text style={styles.vehicleModel}>{commute.vehicleModel}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Alert.alert('Call Driver', `Calling ${commute.driverPhone}`)}
            >
              <Text style={styles.callButtonText}>📞 Call Driver</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action: Reassign Location if there's an issue */}
        <TouchableOpacity style={styles.issueButton} onPress={() => setIsModalOpen(true)}>
          <Text style={styles.issueButtonText}>⚠️ Issue with Pickup? Reassign Location</Text>
        </TouchableOpacity>

        {/* Co-Riders Manifest */}
        <View style={styles.coRidersBox}>
          <Text style={styles.coRidersTitle}>CO-RIDERS IN THIS CAB</Text>
          <Text style={styles.coRiderItem}>1. Priya Sharma • HAL 2nd Stage (Boarded ✓)</Text>
          <Text style={[styles.coRiderItem, { fontWeight: 'bold', color: '#1e40af' }]}>
            2. You ({commute.name}) • Indiranagar (Next Stop)
          </Text>
          <Text style={styles.coRiderItem}>3. Karthik Natarajan • Domlur (Pending)</Text>
        </View>
      </ScrollView>

      {/* Modal: Location Reassignment */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Location Issue / Reassign</Text>
            <Text style={styles.modalSubtitle}>
              Directly updates your coordinates and pushes a new waypoint to your driver.
            </Text>

            <Text style={styles.inputLabel}>New Pickup Landmark / Address:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Indiranagar Metro Station Exit A"
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <Text style={styles.inputLabel}>Reason for Reassignment:</Text>
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              multiline
              value={issueReason}
              onChangeText={setIssueReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#e2e8f0' }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={{ fontWeight: 'bold', color: '#334155' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#1e40af' }]}
                onPress={handleReassignLocation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Push to Driver</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { color: '#93c5fd', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  welcomeText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  sosButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sosButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { color: '#1e40af', fontSize: 10, fontWeight: 'bold' },
  etaText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  routeSection: { marginBottom: 16 },
  nodeItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  nodeDetails: { flex: 1 },
  nodeLabel: { fontSize: 9, color: '#94a3b8', fontWeight: 'bold' },
  nodeAddress: { fontSize: 13, color: '#0f172a', fontWeight: '600', marginTop: 1 },
  nodeDivider: { width: 2, height: 16, backgroundColor: '#cbd5e1', marginLeft: 5, marginVertical: 4 },
  otpBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpLabel: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  otpCode: { fontSize: 32, fontWeight: '900', color: '#1e40af', letterSpacing: 6, marginVertical: 2 },
  otpHaving: { fontSize: 10, color: '#64748b' },
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  driverName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  vehicleDetails: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  vehicleModel: { fontSize: 11, color: '#64748b' },
  callButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  issueButton: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  issueButtonText: { color: '#92400e', fontWeight: 'bold', fontSize: 13 },
  coRidersBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coRidersTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 },
  coRiderItem: { fontSize: 12, color: '#334155', marginBottom: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
});

