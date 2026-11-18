/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Offices Navigation Screen (Matches Screenshot 5)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, typography, spacing } from '../../theme';

interface OfficeLocation {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface OfficesScreenProps {
  onBack: () => void;
}

const AVAILABLE_OFFICES: OfficeLocation[] = [
  {
    id: 'off-1',
    code: 'EBRBLR',
    name: 'Enterprise Bengaluru Hub - EGL Tech Park',
    address: 'Embassy GolfLinks Business Park, Domlur, Bengaluru',
    latitude: 12.9495,
    longitude: 77.6445,
  },
  {
    id: 'off-2',
    code: 'MANYATA-BLR',
    name: 'Manyata Embassy Business Park',
    address: 'Outer Ring Road, Nagavara, Bengaluru',
    latitude: 13.0489,
    longitude: 77.6208,
  },
  {
    id: 'off-3',
    code: 'ECITY-BLR',
    name: 'Electronic City Campus - Tower 4',
    address: 'Electronics City Phase 1, Hosur Road, Bengaluru',
    latitude: 12.8452,
    longitude: 77.6602,
  },
  {
    id: 'off-4',
    code: 'WFD-BLR',
    name: 'ITPB / Whitefield Technology Campus',
    address: 'International Tech Park, Whitefield, Bengaluru',
    latitude: 12.9863,
    longitude: 77.7308,
  },
  {
    id: 'off-5',
    code: 'RMZ-BLR',
    name: 'RMZ Ecospace Tech Park',
    address: 'Sarjapur-Marathahalli Outer Ring Road, Bellandur, Bengaluru',
    latitude: 12.926,
    longitude: 77.6835,
  },
];

export const OfficesScreen: React.FC<OfficesScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  const handleNavigate = (office: OfficeLocation) => {
    const url = `google.navigation:q=${office.latitude},${office.longitude}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`
          );
        }
      })
      .catch(() => {
        Alert.alert('Navigation Error', `Unable to open navigation to ${office.name}.`);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Notch/Status-bar Inset */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offices</Text>
      </View>

      {/* Office List */}
      <ScrollView contentContainerStyle={styles.content}>
        {AVAILABLE_OFFICES.map((office) => (
          <TouchableOpacity
            key={office.id}
            style={styles.officeCard}
            onPress={() => handleNavigate(office)}
            activeOpacity={0.8}
          >
            {/* Building Icon inside Circle */}
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={20} color="#1E293B" />
            </View>

            {/* Office Code */}
            <View style={styles.infoCol}>
              <Text style={styles.officeCode}>{office.code}</Text>
              <Text style={styles.officeName} numberOfLines={1}>
                {office.name}
              </Text>
            </View>

            {/* Blue Navigation Arrow Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleNavigate(office)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E3A8A',
    marginLeft: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  officeCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  officeName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
