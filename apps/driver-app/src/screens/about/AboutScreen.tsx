/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * About Screen (Matches Screenshot 6)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';

interface AboutScreenProps {
  onBack: () => void;
  androidId?: string;
  rfid?: string;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  androidId = 'f895ec0327017d3f',
  rfid = 'NA',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar with Safe Notch Padding */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.itemBlock}>
          <Text style={styles.label}>Android ID</Text>
          <Text style={styles.value}>{androidId}</Text>
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.label}>RFID</Text>
          <Text style={styles.value}>{rfid}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemBlock}>
          <Text style={styles.label}>Application</Text>
          <Text style={styles.value}>HR Pilot — Hi Riders ETS Driver Platform</Text>
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>v1.0.0 (6.8.56)</Text>
        </View>
      </View>
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
    padding: spacing.xl,
  },
  itemBlock: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.md,
  },
});
