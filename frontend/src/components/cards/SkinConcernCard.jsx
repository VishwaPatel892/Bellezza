import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Flame,
  Droplets,
  Sparkles,
  Sun,
  ShieldAlert,
  Layers,
  CircleDot,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const ICON_MAP = {
  Acne: Flame,
  Dryness: Droplets,
  Oiliness: Sparkles,
  'Dark Spots': Sun,
  Sensitivity: ShieldAlert,
  'Uneven Texture': Layers,
};

export function SkinConcernCard({ concern, isSelected = false, onPress, style }) {
  if (!concern) return null;

  const IconComponent = ICON_MAP[concern.name] || CircleDot;
  const activeColor = concern.color || COLORS.burgundy;
  const bgColor = concern.bg || COLORS.softCream;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        SHADOWS.subtle,
        isSelected && { borderColor: activeColor, borderWidth: 1.5 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={concern.name}
    >
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <IconComponent size={20} color={activeColor} />
      </View>
      <Text style={[styles.name, isSelected && { color: activeColor, fontWeight: '700' }]}>
        {concern.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 104,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2,
  },
  name: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

