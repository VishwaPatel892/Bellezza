import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export function FeatureCard({
  title = 'Your skin, understood.',
  description = 'Get personalized guidance for your skincare journey.',
  buttonText = 'Talk to Bellezza AI',
  onPress,
  style,
}) {
  return (
    <View style={[styles.card, SHADOWS.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Sparkles size={12} color={COLORS.cream} />
          <Text style={styles.badgeText}>BELLEZZA SCIENCE</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
        <ArrowRight size={16} color={COLORS.burgundy} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.cream,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.cream,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(248, 244, 231, 0.85)',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.cream,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
    fontSize: 13,
  },
});

