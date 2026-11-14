/**
 * Atharva Travels ETS — Employee Android App
 * FeedbackScreen
 * 
 * Strict No-Mock-Data:
 * Rating selector (1-5 stars with Ionicons), commute category pills,
 * multiline feedback input, and validation state.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { RoundedCard } from '../../components/common/RoundedCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface FeedbackScreenProps {
  onBack: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ onBack }) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState('Punctuality');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const CATEGORIES = ['Punctuality', 'Chauffeur Behavior', 'Vehicle Cleanliness', 'Routing', 'Safety & Escort'];

  const handleSubmit = () => {
    if (!feedbackText.trim()) return;
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="App Feedback" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={44} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successDescription}>
              Your feedback helps Atharva Travels maintain SLA benchmarks and continuous employee commute safety.
            </Text>
            <PrimaryButton
              title="Return to Profile"
              onPress={onBack}
              style={{ width: '100%', marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <View>
            {/* Star Rating Card */}
            <RoundedCard style={styles.ratingCard}>
              <Text style={styles.cardTitle}>Rate Your Commute Experience</Text>
              <Text style={styles.cardSubtitle}>
                How would you rate your overall company transport service?
              </Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#F59E0B' : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </RoundedCard>

            {/* Category Selector */}
            <RoundedCard style={styles.categoryCard}>
              <Text style={styles.cardTitle}>Aspect to Highlight</Text>
              <View style={styles.categoryChipsWrap}>
                {CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.75}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.categoryChip,
                      category === item && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === item && styles.categoryChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RoundedCard>

            {/* Detailed Feedback Text */}
            <RoundedCard style={styles.textCard}>
              <Text style={styles.cardTitle}>Your Comments & Suggestions</Text>
              <TextInput
                placeholder="Share any specific notes regarding your driver, route delays, or safety experience..."
                placeholderTextColor={colors.textMuted}
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                numberOfLines={5}
                style={styles.textArea}
              />
            </RoundedCard>

            {/* Submit Button */}
            <PrimaryButton
              title="Submit Feedback"
              onPress={handleSubmit}
              disabled={!feedbackText.trim()}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>
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
  ratingCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.presets.sectionTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  starTouch: {
    padding: spacing.xs,
  },
  categoryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.presets.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.textWhite,
  },
  textCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    ...typography.presets.body,
    marginTop: spacing.md,
    textAlignVertical: 'top',
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  successIconCircle: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  successDescription: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

