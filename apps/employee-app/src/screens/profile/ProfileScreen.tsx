import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * ProfileScreen
 * 
 * Recreates the exact layout and section hierarchy:
 * - Employee identity header with quick 1-tap "Edit" badge
 * - Profile details modal: Name, Phone, Department, Work Email (Employee ID locked for compliance)
 * - Quick actions: History, Help
 * - Preferences: Personal Information, My Address
 * - More: App Feedback, Settings, Terms of Usage, Logout
 * - Solid black action buttons and pure white aesthetic
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoundedCard } from '../../components/common/RoundedCard';
import { ListRow } from '../../components/common/ListRow';
import { Divider } from '../../components/common/Divider';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { UserProfile } from '../../types';

interface ProfileScreenProps {
  user?: UserProfile | null;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onNavigateHistory: () => void;
  onNavigateHelp: () => void;
  onNavigateAddress: () => void;
  onNavigateFeedback: () => void;
  onNavigateSettings: () => void;
  onNavigateTerms: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateProfile,
  onNavigateHistory,
  onNavigateHelp,
  onNavigateAddress,
  onNavigateFeedback,
  onNavigateSettings,
  onNavigateTerms,
  onLogout,
}) => {
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDepartment, setEditDepartment] = useState(user?.department || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editSuccess, setEditSuccess] = useState(false);

  const handleOpenEdit = () => {
    setEditName(user?.fullName || '');
    setEditPhone(user?.phone || '');
    setEditDepartment(user?.department || '');
    setEditEmail(user?.email || '');
    setEditSuccess(false);
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
        department: editDepartment.trim(),
        email: editEmail.trim(),
      });
    }
    setEditSuccess(true);
    setTimeout(() => {
      setEditModalVisible(false);
      setEditSuccess(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title Header */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* User Identity Header Card */}
        <RoundedCard style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={26} color="#000000" />
          </View>
          <View style={styles.userTextCol}>
            <View style={styles.nameHeaderRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName || 'Corporate Employee'}
              </Text>
              <TouchableOpacity
                onPress={handleOpenEdit}
                style={styles.editPillBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={12} color="#000000" />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmpId}>
              {user?.employeeId ? `ID: ${user.employeeId}` : 'EMP-9042'}
            </Text>
            {user?.department && (
              <Text style={styles.userDept} numberOfLines={1}>{user.department}</Text>
            )}
            {user?.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
          </View>
        </RoundedCard>

        {/* Section 1: Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Quick actions</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="time-outline"
              title="History"
              subtitle="View past commute trips and logs"
              onPress={onNavigateHistory}
            />
            <Divider />
            <ListRow
              iconName="help-circle-outline"
              title="Help"
              subtitle="FAQs, support desk and service tickets"
              onPress={onNavigateHelp}
            />
          </RoundedCard>
        </View>

        {/* Section 2: Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="person-outline"
              title="Personal Information"
              subtitle="Edit name, phone number, and department"
              onPress={handleOpenEdit}
            />
            <Divider />
            <ListRow
              iconName="location-outline"
              title="My Address"
              subtitle="Manage home and boarding pickup locations"
              onPress={onNavigateAddress}
            />
          </RoundedCard>
        </View>

        {/* Section 3: More */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>More</Text>
          <RoundedCard style={styles.card}>
            <ListRow
              iconName="chatbox-ellipses-outline"
              title="App Feedback"
              subtitle="Share your commute feedback"
              onPress={onNavigateFeedback}
            />
            <Divider />
            <ListRow
              iconName="settings-outline"
              title="Settings"
              subtitle="Notifications and app permissions"
              onPress={onNavigateSettings}
            />
            <Divider />
            <ListRow
              iconName="document-text-outline"
              title="Terms of Usage"
              subtitle="Workplace mobility guidelines & compliance"
              onPress={onNavigateTerms}
            />
            <Divider />
            <ListRow
              iconName="log-out-outline"
              title="Logout"
              subtitle="Sign out of employee session"
              onPress={() => setLogoutDialogVisible(true)}
              isDestructive
              showArrow={false}
            />
          </RoundedCard>
        </View>

        <Text style={styles.versionFooter}>
          Atharva Travels Enterprise Mobility • Version 1.0.0
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalSubtitle}>Update personal and contact details</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Locked Corporate ID Banner */}
              <View style={styles.lockedCard}>
                <Ionicons name="lock-closed" size={18} color="#666666" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockedTitle}>Employee ID (Corporate Security)</Text>
                  <Text style={styles.lockedValue}>{user?.employeeId || 'EMP-9042'}</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>LOCKED</Text>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter full name"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>

              {/* Contact Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTACT PHONE *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#999999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DEPARTMENT</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="briefcase-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editDepartment}
                    onChangeText={setEditDepartment}
                    placeholder="e.g. Core Supply Chain Engineering"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>

              {/* Corporate Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WORK EMAIL</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="name@enterprise.internal"
                    placeholderTextColor="#999999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {editSuccess && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text style={styles.successBannerText}>Profile updated successfully!</Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveProfile}
                style={styles.saveBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        visible={logoutDialogVisible}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of your employee commute account?"
        confirmLabel="Logout"
        isDestructive
        onConfirm={() => {
          setLogoutDialogVisible(false);
          onLogout();
        }}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  pageTitle: {
    ...typography.presets.pageTitle,
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.full,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userTextCol: {
    flex: 1,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    ...typography.presets.sectionTitle,
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 4,
  },
  userEmpId: {
    ...typography.presets.caption,
    color: '#000000',
    fontWeight: '700',
    marginTop: 2,
  },
  userDept: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  userPhone: {
    ...typography.presets.captionSmall,
    color: '#4B5563',
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    paddingVertical: 2,
    paddingHorizontal: spacing.lg,
  },
  versionFooter: {
    ...typography.presets.captionSmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lockedValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  lockedBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  saveBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
