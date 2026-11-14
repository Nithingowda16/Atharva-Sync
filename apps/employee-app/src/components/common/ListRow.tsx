/**
 * Atharva Travels ETS — Employee Android App
 * ListRow Component
 * 
 * Recreates the exact row interaction from the reference Profile screen:
 * Circular icon container, title, optional subtitle, and right chevron indicator.
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconContainer } from './IconContainer';
import { colors, typography, spacing } from '../../theme';

interface ListRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
  isDestructive?: boolean;
  style?: ViewStyle;
}

export const ListRow: React.FC<ListRowProps> = ({
  iconName,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  isDestructive = false,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <IconContainer
        size={38}
        backgroundColor={isDestructive ? colors.errorSurface : colors.primarySurface}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={isDestructive ? colors.error : colors.primary}
        />
      </IconContainer>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            isDestructive && { color: colors.error },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {value && <Text style={styles.valueText}>{value}</Text>}

      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    ...typography.presets.cardTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});

