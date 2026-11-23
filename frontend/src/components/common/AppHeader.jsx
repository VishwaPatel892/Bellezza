import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';

export function AppHeader({ title, subtitle, showBack = false, right, style }) {
  return (
    <View style={[styles.header, SHADOWS.subtle, style]}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={COLORS.burgundy} />
        </TouchableOpacity>
      ) : <View style={styles.placeholder} />}

      <View style={styles.center}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.right}>{right || <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { width: 36 },
  center: { flex: 1, alignItems: 'center' },
  subtitle: { ...TYPOGRAPHY.overline, color: COLORS.dustyPink },
  title: { ...TYPOGRAPHY.headingSmall, color: COLORS.burgundy },
  right: { width: 36, alignItems: 'flex-end' },
});

