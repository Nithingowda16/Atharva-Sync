/**
 * Atharva Travels ETS — Employee Android App
 * HelpSupportScreen
 * 
 * Strict No-Mock-Data:
 * FAQs accordion, 24x7 Transport Helpdesk contact tiles,
 * and service ticket creation modal with empty state for existing tickets.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { SupportTicket } from '../../types';

interface HelpSupportScreenProps {
  onBack: () => void;
  existingTickets?: SupportTicket[];
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
  existingTickets = [],
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(existingTickets);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'ROSTER_ISSUE' | 'CAB_DELAY' | 'ESCORT_SECURITY' | 'APP_ISSUE'>('ROSTER_ISSUE');
  const [description, setDescription] = useState('');

  const FAQS = [
    {
      id: 1,
      q: 'How are cabs assigned for my shift?',
      a: 'Central transport operations automatically optimizes routing and allocates vehicles 45 minutes prior to shift departure based on your verified residential zone.',
    },
    {
      id: 2,
      q: 'What is the night escort safety protocol?',
      a: 'All late-evening and night shifts (20:00 to 06:00) carrying female employees are accompanied by trained, background-verified armed security guards.',
    },
    {
      id: 3,
      q: 'Can I cancel or reschedule my scheduled ride?',
      a: 'Yes, rides can be modified or cancelled up to 60 minutes before the scheduled cutoff time via the Schedule / Manage Rides section.',
    },
  ];

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) return;

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketCode: `TCK-${Date.now().toString().slice(-4)}`,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      createdAt: 'Just now',
      description: description.trim(),
    };

    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Help & Support" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Helpdesk Direct Cards */}
        <View style={styles.contactRow}>
          <View style={styles.contactCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.contactTitle}>Transport Desk</Text>
            <Text style={styles.contactSubtitle}>+91 80 6000 8800</Text>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSubtitle}>transport@corporate.com</Text>
          </View>
        </View>

        {/* Raise Service Ticket Action */}
        <RoundedCard style={styles.raiseCard}>
          <View style={styles.raiseHeaderRow}>
            <View>
              <Text style={styles.raiseTitle}>Have a commute exception?</Text>
              <Text style={styles.raiseSubtitle}>Raise a tracked ticket with transport logistics</Text>
            </View>
          </View>
          <PrimaryButton
            title="Raise Service Request"
            onPress={() => setIsModalOpen(true)}
            style={{ marginTop: spacing.md }}
          />
        </RoundedCard>

        {/* My Service Requests */}
        <Text style={styles.sectionHeaderTitle}>My Service Requests</Text>
        {tickets.length === 0 ? (
          <RoundedCard style={styles.emptyCard}>
            <EmptyState
              iconName="file-tray-outline"
              title="No active requests"
              description="You have no pending service requests or grievance tickets."
            />
          </RoundedCard>
        ) : (
          <View style={styles.ticketList}>
            {tickets.map((t) => (
              <RoundedCard key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketCode}>{t.ticketCode}</Text>
                  <Text style={styles.ticketStatus}>{t.status}</Text>
                </View>
                <Text style={styles.ticketSubject}>{t.subject}</Text>
                <Text style={styles.ticketDesc}>{t.description}</Text>
              </RoundedCard>
            ))}
          </View>
        )}

        {/* Frequently Asked Questions */}
        <Text style={[styles.sectionHeaderTitle, { marginTop: spacing.xl }]}>
          Frequently Asked Questions
        </Text>
        <RoundedCard style={styles.faqCard}>
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <View key={faq.id} style={idx < FAQS.length - 1 && styles.faqItemDivider}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  style={styles.faqHeader}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                )}
              </View>
            );
          })}
        </RoundedCard>
      </ScrollView>

      {/* Raise Ticket Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <AppHeader title="Raise Service Request" onBack={() => setIsModalOpen(false)} />

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalLabel}>Subject</Text>
            <TextInput
              placeholder="Brief summary of the issue"
              placeholderTextColor={colors.textMuted}
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              placeholder="Describe the incident, shift date, or cab issue in detail..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            <PrimaryButton
              title="Submit Request"
              onPress={handleCreateTicket}
              disabled={!subject.trim() || !description.trim()}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  contactTitle: {
    ...typography.presets.cardTitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  contactSubtitle: {
    ...typography.presets.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  raiseCard: {
    marginBottom: spacing.xl,
  },
  raiseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  raiseTitle: {
    ...typography.presets.sectionTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  raiseSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderTitle: {
    ...typography.presets.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  emptyCard: {
    padding: spacing.none,
  },
  ticketList: {
    gap: spacing.md,
  },
  ticketCard: {
    padding: spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketCode: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  ticketStatus: {
    ...typography.presets.captionSmall,
    fontWeight: '700',
    color: colors.info,
  },
  ticketSubject: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  ticketDesc: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  faqCard: {
    padding: spacing.md,
  },
  faqItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  faqQuestion: {
    ...typography.presets.cardTitle,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswer: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  modalLabel: {
    ...typography.presets.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    ...typography.presets.body,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
});

