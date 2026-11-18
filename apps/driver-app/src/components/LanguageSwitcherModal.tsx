/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Language Switcher Modal (EN, Kannada, Hindi)
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSwitcherModal: React.FC<Props> = ({ visible, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  const options: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'Default Corporate' },
    { code: 'kn', label: 'ಕನ್ನಡ', nativeLabel: 'Kannada' },
    { code: 'hi', label: 'हिन्दी', nativeLabel: 'Hindi' },
  ];

  const handleSelect = async (code: Language) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('changeLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {options.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelect(opt.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.optionSubtitle}>{opt.nativeLabel}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  optionLeft: {
    flexDirection: 'column',
  },
  optionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
