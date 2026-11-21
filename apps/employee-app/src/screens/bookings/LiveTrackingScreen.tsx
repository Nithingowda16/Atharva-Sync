import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Atharva Travels ETS — Employee Android App
 * LiveTrackingScreen
 * 
 * Features:
 * - Real-time Chauffeur Calling (Direct Phone Dialer)
 * - Quick Automated Status Messages (No chatting: 1-tap corporate pings)
 *   Options: "Reached!", "On-time arrival", "Wait 2 minutes", "Driver reached destination", "Boarded safely"
 * - Live Fleet Radar & Turn-by-Turn status
 * - Pure white theme with solid black buttons
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
import * as RN from 'react-native';
const Linking = (RN as any).Linking;
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LiveTrackingMapPlaceholder } from '../../components/tracking/LiveTrackingMapPlaceholder';
import { TripStatusStepper } from '../../components/tracking/TripStatusStepper';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { RideRecord } from '../../types';
import { getApiBaseUrl, API_ENDPOINTS } from '../../services/apiConfig';

interface LiveTrackingScreenProps {
  ride?: RideRecord | null;
  onBack: () => void;
  onNavigateSos: () => void;
}

const PREDEFINED_STATUS_MESSAGES = [
  {
    id: 'msg-reached',
    title: 'Reached pickup point!',
    subtitle: 'Waiting at the main boarding gate',
    icon: 'location',
    badge: 'PICKUP READY',
  },
  {
    id: 'msg-ontime',
    title: 'On-time arrival confirmed',
    subtitle: 'Cab is arriving exactly as scheduled',
    icon: 'time',
    badge: 'ON-TIME',
  },
  {
    id: 'msg-wait2m',
    title: 'Please wait 2 minutes',
    subtitle: 'Currently walking down to the lobby',
    icon: 'hourglass-outline',
    badge: 'COMING DOWN',
  },
  {
    id: 'msg-driver-dest',
    title: 'Driver reached destination',
    subtitle: 'Vehicle arrived at drop hub / campus',
    icon: 'checkmark-done-circle',
    badge: 'DESTINATION REACHED',
  },
  {
    id: 'msg-boarded',
    title: 'Boarded vehicle safely',
    subtitle: 'Seated inside vehicle, trip in progress',
    icon: 'shield-checkmark',
    badge: 'SAFELY BOARDED',
  },
];

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({
  ride,
  onBack,
  onNavigateSos,
}) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [latestBroadcast, setLatestBroadcast] = useState<string | null>(null);
  const [broadcastTime, setBroadcastTime] = useState<string | null>(null);

  const driverName = ride?.driver?.fullName || 'Driver Partner';
  const driverPhone = ride?.driver?.phone || '+91 98450 11223';
  const vehiclePlate = ride?.vehicle?.plateNumber || 'Fleet Cab';

  // 1. Direct Phone Call to Driver
  const handleCallDriver = () => {
    Alert.alert(
      'Call Chauffeur',
      `Dial ${driverName} (${driverPhone}) directly?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${driverPhone.replace(/\s+/g, '')}`).catch(() => {
              Alert.alert('Phone Call', `Dial manually: ${driverPhone}`);
            });
          },
        },
      ]
    );
  };

  // 2. Send 1-Tap Pre-Defined Automated Message (NO chatting)
  const handleSendAutoMessage = async (msg: typeof PREDEFINED_STATUS_MESSAGES[0]) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLatestBroadcast(msg.title);
    setBroadcastTime(timeStr);
    setIsMessageModalOpen(false);

    // Sync to backend status-message endpoint
    try {
      fetch(`${getApiBaseUrl()}${API_ENDPOINTS.STATUS_MESSAGE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: ride?.tripCode || 'ATH-8821',
          employeeId: '111',
          senderRole: 'EMPLOYEE',
          message: msg.title,
        }),
      }).catch(() => {});
    } catch (e) {}

    Alert.alert(
      'Status Broadcast Sent',
      `Auto-message broadcasted to Chauffeur ${driverName}:\n"${msg.title}"`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Live Fleet Radar"
        onBack={onBack}
        rightAction={{
          icon: <Ionicons name="shield-outline" size={20} color={colors.error} />,
          onPress: onNavigateSos,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Telemetry Area */}
        <LiveTrackingMapPlaceholder hasActiveTelemetry={false} />

        {/* Live Status Header */}
        <RoundedCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.tripCode}>{ride?.tripCode || 'ATH-8821'}</Text>
              <Text style={styles.shiftText}>
                {ride?.shiftTime ? `Shift: ${ride.shiftTime}` : 'Shift: 13:30'}
              </Text>
            </View>
            <StatusBadge status={ride?.status || 'EN_ROUTE'} />
          </View>

          <TripStatusStepper currentStatus={ride?.status || 'ON_THE_WAY'} />
        </RoundedCard>

        {/* Stops Summary */}
        <RoundedCard style={styles.stopsCard}>
          <Text style={styles.sectionHeaderTitle}>TRANSIT CORRIDOR</Text>
          <View style={styles.stopItem}>
            <View style={styles.pickupDot} />
            <View style={styles.stopTextCol}>
              <Text style={styles.stopLabel}>Pickup Node</Text>
              <Text style={styles.stopTitle}>
                {ride?.pickup?.name || 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road'}
              </Text>
            </View>
          </View>
          <View style={styles.connector} />
          <View style={styles.stopItem}>
            <View style={styles.dropDot} />
            <View style={styles.stopTextCol}>
              <Text style={styles.stopLabel}>Destination Hub</Text>
              <Text style={styles.stopTitle}>
                {ride?.destination?.name || 'Enterprise Tech Park, Tower B'}
              </Text>
            </View>
          </View>
        </RoundedCard>

        {/* Assigned Chauffeur & Vehicle Card with Calling & Auto-Message Buttons */}
        <RoundedCard style={styles.vehicleCard}>
          <Text style={styles.sectionHeaderTitle}>ASSIGNED CHAUFFEUR & VEHICLE</Text>
          <View style={styles.driverMainRow}>
            {/* Driver Avatar & Info */}
            <View style={styles.driverInfoLeft}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={20} color="#000000" />
              </View>
              <View style={styles.driverTextCol}>
                <Text style={styles.driverName}>{driverName}</Text>
                <Text style={styles.vehiclePlate}>{vehiclePlate}</Text>
              </View>
            </View>

            {/* Calling & Auto-Message Action Buttons (Circled in user reference) */}
            <View style={styles.actionButtonsCol}>
              {/* Call Chauffeur Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCallDriver}
                style={styles.callActionButton}
              >
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Auto-Message Quick Status Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsMessageModalOpen(true)}
                style={styles.messageActionButton}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Real-time Broadcast Status Strip */}
          {latestBroadcast && (
            <View style={styles.broadcastBanner}>
              <Ionicons name="radio" size={14} color="#16A34A" />
              <Text style={styles.broadcastText}>
                Broadcasted: "{latestBroadcast}" {broadcastTime && `(${broadcastTime})`}
              </Text>
            </View>
          )}
        </RoundedCard>

        {/* Safety Hotline Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateSos}
          style={styles.emergencyBanner}
        >
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <View style={styles.emergencyTextCol}>
            <Text style={styles.emergencyTitle}>Emergency Transport Desk</Text>
            <Text style={styles.emergencySubtitle}>
              Tap to broadcast instant SOS alert to HI RIDERS 24x7 Control Room
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.error} />
        </TouchableOpacity>
      </ScrollView>

      {/* Auto-Message Modal (No Chatting: Standard 1-Tap Status Pings) */}
      <Modal
        visible={isMessageModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMessageModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Quick Status Broadcast</Text>
                <Text style={styles.sheetSubtitle}>
                  1-Tap Automated Pings to Chauffeur {driverName} (No Texting)
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsMessageModalOpen(false)}
                style={styles.closeSheetBtn}
              >
                <Ionicons name="close" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.statusOptionsList}>
              {PREDEFINED_STATUS_MESSAGES.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  activeOpacity={0.75}
                  onPress={() => handleSendAutoMessage(msg)}
                  style={styles.statusOptionCard}
                >
                  <View style={styles.statusOptionIconCircle}>
                    <Ionicons name={msg.icon as any} size={20} color="#000000" />
                  </View>
                  <View style={styles.statusOptionTextCol}>
                    <Text style={styles.statusOptionTitle}>{msg.title}</Text>
                    <Text style={styles.statusOptionSub}>{msg.subtitle}</Text>
                  </View>
                  <View style={styles.sendIconPill}>
                    <Ionicons name="send" size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tripCode: {
    ...typography.presets.h2,
    color: '#0F172A',
  },
  shiftText: {
    ...typography.presets.caption,
    color: '#64748B',
  },
  stopsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionHeaderTitle: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#16A34A',
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 2,
  },
  stopTextCol: {
    flex: 1,
  },
  stopLabel: {
    ...typography.presets.captionSmall,
    color: '#94A3B8',
  },
  stopTitle: {
    ...typography.presets.bodyBold,
    color: '#0F172A',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  driverMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverTextCol: {
    flex: 1,
  },
  driverName: {
    ...typography.presets.h3,
    color: '#0F172A',
  },
  vehiclePlate: {
    ...typography.presets.captionBold,
    color: '#64748B',
    marginTop: 2,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  callActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: 8,
    marginTop: spacing.md,
  },
  broadcastText: {
    ...typography.presets.captionSmall,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    ...typography.presets.captionBold,
    color: colors.error,
  },
  emergencySubtitle: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.presets.h2,
    color: '#0F172A',
  },
  sheetSubtitle: {
    ...typography.presets.caption,
    color: '#64748B',
    marginTop: 2,
  },
  closeSheetBtn: {
    padding: 4,
  },
  statusOptionsList: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  statusOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  statusOptionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionTextCol: {
    flex: 1,
  },
  statusOptionTitle: {
    ...typography.presets.bodyBold,
    color: '#0F172A',
  },
  statusOptionSub: {
    ...typography.presets.captionSmall,
    color: '#64748B',
    marginTop: 2,
  },
  sendIconPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
