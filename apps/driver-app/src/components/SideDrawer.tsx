/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * Side Navigation Drawer (Matches Screenshot 2)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '../theme';
import { syncService } from '../services/syncService';
import { DriverProfile } from '../types';

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeItem: 'Home' | 'UpcomingTrips' | 'CompletedTrips' | 'SwitchOffices' | 'OfficesNavigation' | 'Language' | 'About';
  onNavigate: (target: 'Home' | 'UpcomingTrips' | 'CompletedTrips' | 'SwitchOffices' | 'OfficesNavigation' | 'Language' | 'About') => void;
  profile: DriverProfile;
  hubCode?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

export const SideDrawer: React.FC<SideDrawerProps> = ({
  visible,
  onClose,
  activeItem,
  onNavigate,
  profile,
  hubCode = 'mll1-MLL',
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastContactMin, setLastContactMin] = useState(0);

  useEffect(() => {
    const unsub = syncService.subscribeToSync((count) => {
      setPendingCount(count);
    });
    return unsub;
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await syncService.flushOutbox();
    setLastContactMin(0);
    setSyncing(false);
  };

  const handleItemPress = (item: 'Home' | 'UpcomingTrips' | 'CompletedTrips' | 'SwitchOffices' | 'OfficesNavigation' | 'Language' | 'About') => {
    onClose();
    onNavigate(item);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Container */}
        <View style={[styles.drawerContainer, { width: DRAWER_WIDTH }]}>
          {/* Header Profile Area */}
          <View style={styles.drawerHeader}>
            <View style={styles.avatarCircle}>
              {/* Pilot / Chauffeur Cap Icon */}
              <Ionicons name="person" size={38} color="#475569" style={{ marginTop: 6 }} />
              <View style={styles.capOverlay}>
                <Ionicons name="shield-checkmark" size={14} color="#1565C0" />
              </View>
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{profile.assignedVehiclePlate || 'KA-03-AB-6182'}</Text>
              </View>
              <Text style={styles.hubText}>{hubCode}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuList} bounces={false}>
            {/* 1. Home */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'Home' && styles.menuItemActive]}
              onPress={() => handleItemPress('Home')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="home-outline"
                size={22}
                color={activeItem === 'Home' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'Home' && styles.menuTextActive]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* 2. Upcoming Trips */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'UpcomingTrips' && styles.menuItemActive]}
              onPress={() => handleItemPress('UpcomingTrips')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={activeItem === 'UpcomingTrips' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'UpcomingTrips' && styles.menuTextActive]}>
                Upcoming Trips
              </Text>
            </TouchableOpacity>

            {/* 3. Completed Trips */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'CompletedTrips' && styles.menuItemActive]}
              onPress={() => handleItemPress('CompletedTrips')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="newspaper-outline"
                size={22}
                color={activeItem === 'CompletedTrips' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'CompletedTrips' && styles.menuTextActive]}>
                Completed Trips
              </Text>
            </TouchableOpacity>

            {/* 4. Switch Offices */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'SwitchOffices' && styles.menuItemActive]}
              onPress={() => handleItemPress('SwitchOffices')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="business-outline"
                size={22}
                color={activeItem === 'SwitchOffices' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'SwitchOffices' && styles.menuTextActive]}>
                Switch Offices
              </Text>
            </TouchableOpacity>

            {/* 5. Offices Navigation */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'OfficesNavigation' && styles.menuItemActive]}
              onPress={() => handleItemPress('OfficesNavigation')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="navigate-outline"
                size={22}
                color={activeItem === 'OfficesNavigation' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'OfficesNavigation' && styles.menuTextActive]}>
                Offices Navigation
              </Text>
            </TouchableOpacity>

            {/* 6. Language */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'Language' && styles.menuItemActive]}
              onPress={() => handleItemPress('Language')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="translate"
                size={22}
                color={activeItem === 'Language' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'Language' && styles.menuTextActive]}>
                Language
              </Text>
            </TouchableOpacity>

            {/* 7. About */}
            <TouchableOpacity
              style={[styles.menuItem, activeItem === 'About' && styles.menuItemActive]}
              onPress={() => handleItemPress('About')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={activeItem === 'About' ? '#2563EB' : '#475569'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, activeItem === 'About' && styles.menuTextActive]}>
                About
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            <View style={styles.footerLeft}>
              <Text style={styles.versionText}>v6.8.56</Text>
              <View style={styles.telemetryRow}>
                <Text style={styles.telemetryText}>Last Contact : {lastContactMin} mins ago</Text>
                <Text style={styles.telemetryText}>Data Pending : {pendingCount}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleRefresh}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="sync"
                size={22}
                color={syncing ? '#2563EB' : '#334155'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawerContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxl + 16,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  capOverlay: {
    position: 'absolute',
    top: 4,
    right: 6,
  },
  headerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  plateBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  plateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  hubText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 2,
  },
  menuList: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  menuItemActive: {
    backgroundColor: '#EBF1FF',
  },
  menuIcon: {
    marginRight: spacing.lg,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  menuTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  footerLeft: {
    flex: 1,
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  telemetryRow: {
    flexDirection: 'column',
    gap: 1,
  },
  telemetryText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  refreshBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
