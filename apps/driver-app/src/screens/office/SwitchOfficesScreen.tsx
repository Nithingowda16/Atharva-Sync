/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Switch Offices Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing } from '../../theme';

interface SwitchOfficesScreenProps {
  onBack: () => void;
  currentOffice: string;
  onSelectOffice: (officeCode: string) => void;
}

const OFFICES = [
  { code: 'mll1-MLL', name: 'MLL Central Corporate Dispatch' },
  { code: 'EBRBLR', name: 'Enterprise Bengaluru Hub - EGL Tech Park' },
  { code: 'MANYATA-BLR', name: 'Manyata Embassy Business Park' },
  { code: 'ECITY-BLR', name: 'Electronic City Phase 1' },
  { code: 'WFD-BLR', name: 'ITPB Whitefield Campus' },
  { code: 'RMZ-BLR', name: 'RMZ Ecospace Outer Ring Road' },
];

export const SwitchOfficesScreen: React.FC<SwitchOfficesScreenProps> = ({
  onBack,
  currentOffice,
  onSelectOffice,
}) => {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.headerTitle}>Switch Offices</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {OFFICES.map((off) => {
          const isSelected = off.code === currentOffice;
          return (
            <TouchableOpacity
              key={off.code}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => {
                onSelectOffice(off.code);
                onBack();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="business"
                  size={20}
                  color={isSelected ? '#2563EB' : '#475569'}
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.code, isSelected && styles.codeSelected]}>{off.code}</Text>
                <Text style={styles.name}>{off.name}</Text>
              </View>

              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
              )}
            </TouchableOpacity>
          );
        })}
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
    padding: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF1FF',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  codeSelected: {
    color: '#2563EB',
  },
  name: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
