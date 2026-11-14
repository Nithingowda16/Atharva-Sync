/**
 * Atharva Travels ETS — Employee Android App
 * ConfirmationDialog Component
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, SecondaryButton } from './PrimaryButton';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <View
                style={[
                  styles.iconCircle,
                  isDestructive ? styles.destructiveCircle : styles.defaultCircle,
                ]}
              >
                <Ionicons
                  name={isDestructive ? 'alert-triangle-outline' : 'help-circle-outline'}
                  size={28}
                  color={isDestructive ? colors.error : colors.primary}
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                <SecondaryButton
                  title={cancelLabel}
                  onPress={onCancel}
                  style={styles.cancelButton}
                />
                <PrimaryButton
                  title={confirmLabel}
                  onPress={onConfirm}
                  style={[
                    styles.confirmButton,
                    isDestructive && { backgroundColor: colors.error },
                  ]}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  defaultCircle: {
    backgroundColor: colors.primarySurface,
  },
  destructiveCircle: {
    backgroundColor: colors.errorSurface,
  },
  title: {
    ...typography.presets.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.presets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
    height: 46,
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.sm,
    height: 46,
  },
});

