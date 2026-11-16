import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * MyBookingsScreen
 * 
 * Features:
 * - Segmented tabs: UPCOMING, ACTIVE, COMPLETED, CANCELLED
 * - Rich ride cards displaying Shift, Direction, Pickup/Drop nodes, Boarding OTP
 * - Strict 6-Hour Cancellation Cutoff Enforcement with Corporate Policy Validation
 * - "Report No-Show" popup modal with reason selection & fleet dispatch notification
 * - Solid black action CTAs and pure white background (#FFFFFF)
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
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord } from '../../types';
import { checkCancellationEligibility } from '../../utils/cancellationPolicy';

interface MyBookingsScreenProps {
  onBack: () => void;
  onNavigateSchedule: () => void;
  onSelectRide: (ride: RideRecord) => void;
  onCancelBooking?: (bookingId: string) => void;
  onReportNoShow?: (bookingId: string) => void;
  bookings?: RideRecord[];
}

type TabType = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const CANCEL_REASONS = [
  'Working from Home (WFH)',
  'Taking personal / alternate transport',
  'Approved leave / off day',
  'Shift timings rescheduled by manager',
];

const NOSHOW_REASONS = [
  'Unable to reach pickup point in time',
  'Arranged alternate ride / personal vehicle',
  'Medical emergency / unwell',
  'Working from home today',
];

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  onBack,
  onNavigateSchedule,
  onSelectRide,
  onCancelBooking,
  onReportNoShow,
  bookings = [],
}) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('UPCOMING');

  // Cancel Modal State
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelTargetRide, setCancelTargetRide] = useState<RideRecord | null>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState(CANCEL_REASONS[0]);

  // No-Show Modal State
  const [noShowModalVisible, setNoShowModalVisible] = useState(false);
  const [noShowTargetRide, setNoShowTargetRide] = useState<RideRecord | null>(null);
  const [selectedNoShowReason, setSelectedNoShowReason] = useState(NOSHOW_REASONS[0]);

  const filteredBookings = bookings.filter((b) => {
    switch (selectedTab) {
      case 'UPCOMING':
        return (
          b.status === 'SCHEDULED' ||
          b.status === 'DRIVER_ASSIGNED'
        );
      case 'ACTIVE':
        return (
          b.status === 'TRIP_STARTED' ||
          b.status === 'ON_THE_WAY' ||
          b.status === 'BOARDING' ||
          b.status === 'IN_TRANSIT' ||
          b.status === 'EN_ROUTE' ||
          b.status === 'BOARDED'
        );
      case 'COMPLETED':
        return b.status === 'COMPLETED';
      case 'CANCELLED':
        return b.status === 'CANCELLED' || b.boardingStatus === 'NO_SHOW';
      default:
        return true;
    }
  });

  // Handle Cancel Click with 6-Hour Validation
  const handleInitiateCancel = (ride: RideRecord) => {
    const check = checkCancellationEligibility(ride.date, ride.shiftTime);
    if (!check.eligible) {
      Alert.alert(
        'Cancellation Locked 🔒',
        check.message,
        [{ text: 'Understood' }]
      );
      return;
    }
    setCancelTargetRide(ride);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (cancelTargetRide && onCancelBooking) {
      onCancelBooking(cancelTargetRide.id);
      Alert.alert(
        'Booking Cancelled',
        `Trip ${cancelTargetRide.tripCode} on ${cancelTargetRide.date} at ${cancelTargetRide.shiftTime} has been cancelled. Vehicle slot released.`
      );
    }
    setCancelModalVisible(false);
    setCancelTargetRide(null);
  };

  // Handle No-Show Click
  const handleInitiateNoShow = (ride: RideRecord) => {
    setNoShowTargetRide(ride);
    setNoShowModalVisible(true);
  };

  const handleConfirmNoShow = () => {
    if (noShowTargetRide && onReportNoShow) {
      onReportNoShow(noShowTargetRide.id);
      Alert.alert(
        'No-Show Recorded',
        `Central dispatch notified that you are unavailable. Chauffeur released to proceed on route without delay.`
      );
    }
    setNoShowModalVisible(false);
    setNoShowTargetRide(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="My Bookings"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="add" size={24} color="#000000" />,
          onPress: onNavigateSchedule,
        }}
      />

      {/* Segmented Control Bar */}
      <View style={styles.segmentContainer}>
        {(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as TabType[]).map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.segmentItem,
                isActive && styles.segmentItemActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <EmptyState
            iconName="calendar-outline"
            title="No bookings in this tab"
            description={
              selectedTab === 'UPCOMING'
                ? 'You have no upcoming commute bookings. Tap below to schedule shifts.'
                : selectedTab === 'ACTIVE'
                ? 'No active trips in transit at this moment.'
                : selectedTab === 'COMPLETED'
                ? 'No past completed trips found.'
                : 'No cancelled trips.'
            }
            actionTitle={selectedTab === 'UPCOMING' ? 'Schedule Commute' : undefined}
            onAction={selectedTab === 'UPCOMING' ? onNavigateSchedule : undefined}
          />
        ) : (
          <View style={styles.bookingsList}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>
                {filteredBookings.length} {filteredBookings.length === 1 ? 'COMMUTE TRIP' : 'COMMUTE TRIPS'}
              </Text>
              {selectedTab === 'UPCOMING' && (
                <Text style={styles.policyHintText}>Cancellation allowed &gt; 6h to shift</Text>
              )}
            </View>

            {filteredBookings.map((ride) => (
              <RoundedCard key={ride.id} style={styles.rideCard}>
                {/* Top Bar: Direction Pill + Status */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.directionPill}>
                    <Ionicons
                      name={ride.direction === 'LOGIN' ? 'business-outline' : 'home-outline'}
                      size={12}
                      color="#000000"
                    />
                    <Text style={styles.directionPillText}>
                      {ride.direction === 'LOGIN' ? 'GO TO WORK' : 'RETURN HOME'}
                    </Text>
                  </View>

                  {ride.boardingStatus === 'NO_SHOW' ? (
                    <View style={styles.noShowBadge}>
                      <Text style={styles.noShowBadgeText}>NO-SHOW</Text>
                    </View>
                  ) : (
                    <StatusBadge status={ride.status} />
                  )}
                </View>

                {/* Trip Code & Timing */}
                <View style={styles.tripMetaRow}>
                  <View>
                    <Text style={styles.tripCodeText}>{ride.tripCode}</Text>
                    <Text style={styles.tripDateText}>{ride.date}</Text>
                  </View>

                  <View style={styles.shiftBadge}>
                    <Ionicons name="time-outline" size={14} color="#000000" />
                    <Text style={styles.shiftBadgeText}>Shift: {ride.shiftTime}</Text>
                  </View>
                </View>

                {/* Stops Timeline */}
                <View style={styles.routeTimeline}>
                  {/* Pickup Node */}
                  <View style={styles.nodeRow}>
                    <View style={styles.pickupDot} />
                    <View style={styles.nodeTextCol}>
                      <Text style={styles.nodeLabel}>PICKUP</Text>
                      <Text style={styles.nodeTitle} numberOfLines={1}>
                        {ride.pickup?.name || 'Boarding Location'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.nodeConnectorLine} />

                  {/* Destination Node */}
                  <View style={styles.nodeRow}>
                    <View style={styles.dropDot} />
                    <View style={styles.nodeTextCol}>
                      <Text style={styles.nodeLabel}>DESTINATION</Text>
                      <Text style={styles.nodeTitle} numberOfLines={1}>
                        {ride.destination?.name || 'Enterprise Tech Park, Tower B'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* OTP & Action Strip */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.otpPill}>
                    <Text style={styles.otpPillLabel}>OTP:</Text>
                    <Text style={styles.otpPillValue}>{ride.boardingOtp || '7492'}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSelectRide(ride)}
                    style={styles.detailsBtn}
                  >
                    <Text style={styles.detailsBtnText}>Details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#000000" />
                  </TouchableOpacity>
                </View>

                {/* Operations Action Row (Cancel & No-Show) */}
                {selectedTab === 'UPCOMING' && (
                  <View style={styles.actionsBar}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleInitiateCancel(ride)}
                      style={styles.cancelBtn}
                    >
                      <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                      <Text style={styles.cancelBtnText}>Cancel (&gt;6h)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleInitiateNoShow(ride)}
                      style={styles.noShowBtn}
                    >
                      <Ionicons name="alert-circle-outline" size={14} color="#6B7280" />
                      <Text style={styles.noShowBtnText}>No-Show</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </RoundedCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Cancellation Modal (6-Hour Policy) */}
      <Modal
        visible={cancelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Cancel Shift Commute</Text>
                <Text style={styles.modalSubtitle}>
                  Trip {cancelTargetRide?.tripCode} • {cancelTargetRide?.shiftTime} Shift
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.policyNoticeBox}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.policyNoticeText}>
                Cancellation verified: More than 6 hours prior to shift reporting.
              </Text>
            </View>

            <Text style={styles.reasonLabel}>PLEASE SELECT CANCELLATION REASON:</Text>
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedCancelReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCancelReason(reason)}
                  style={[styles.reasonOption, isSelected && styles.reasonOptionActive]}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? '#000000' : '#9CA3AF'}
                  />
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Keep Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmCancel}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmBtnText}>Confirm Cancellation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* No-Show Pop Up Modal */}
      <Modal
        visible={noShowModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNoShowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Report Employee No-Show</Text>
                <Text style={styles.modalSubtitle}>
                  Trip {noShowTargetRide?.tripCode} • {noShowTargetRide?.shiftTime}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setNoShowModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="alert-triangle" size={18} color="#D97706" style={{ marginRight: 8 }} />
              <Text style={styles.warningBoxText}>
                Reporting No-Show notifies Central Dispatch and allows the chauffeur to depart without delay.
              </Text>
            </View>

            <Text style={styles.reasonLabel}>REASON FOR NO-SHOW / UNAVAILABILITY:</Text>
            {NOSHOW_REASONS.map((reason) => {
              const isSelected = selectedNoShowReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  activeOpacity={0.75}
                  onPress={() => setSelectedNoShowReason(reason)}
                  style={[styles.reasonOption, isSelected && styles.reasonOptionActive]}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? '#000000' : '#9CA3AF'}
                  />
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setNoShowModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>I Will Board</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmNoShow}
                style={[styles.modalConfirmBtn, { backgroundColor: '#000000' }]}
              >
                <Text style={styles.modalConfirmBtnText}>Confirm No-Show</Text>
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 4,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  segmentItemActive: {
    backgroundColor: '#000000',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  bookingsList: {
    gap: spacing.lg,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  policyHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  directionPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  noShowBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noShowBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  tripMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tripCodeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  tripDateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  shiftBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  routeTimeline: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    marginRight: 10,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    marginRight: 10,
  },
  nodeConnectorLine: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
    marginVertical: 2,
  },
  nodeTextCol: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  otpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  otpPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  otpPillValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1.5,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  noShowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  noShowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  policyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  policyNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  warningBoxText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  reasonOptionActive: {
    borderColor: '#000000',
    backgroundColor: '#F8FAFC',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  reasonTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
