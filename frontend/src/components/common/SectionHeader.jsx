import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export function SectionHeader({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  title: {
    ...TYPOGRAPHY.headingMedium,
    color: COLORS.textPrimary,
  },
  action: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.burgundy,
    fontFamily: 'Inter_600SemiBold',
  },
});

