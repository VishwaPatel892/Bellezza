import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark, Sparkles } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export function IngredientCard({ ingredient, isSaved = false, onToggleSave, onPress, style }) {
  if (!ingredient) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, SHADOWS.subtle, style]}
      accessibilityRole="button"
      accessibilityLabel={ingredient.name}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Sparkles size={16} color={COLORS.burgundy} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.name}>{ingredient.name}</Text>
          {ingredient.alias ? <Text style={styles.alias}>{ingredient.alias}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={() => onToggleSave && onToggleSave(ingredient.id)}
          style={styles.saveBtn}
          accessibilityLabel="Save ingredient"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bookmark
            size={16}
            color={isSaved ? COLORS.burgundy : COLORS.textMuted}
            fill={isSaved ? COLORS.burgundy : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.summary} numberOfLines={2}>
        {ingredient.summary}
      </Text>

      {ingredient.benefits && ingredient.benefits.length > 0 ? (
        <View style={styles.benefitsRow}>
          {ingredient.benefits.slice(0, 3).map((b, i) => (
            <View key={i} style={styles.benefitTag}>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {ingredient.concentration ? (
        <View style={styles.footer}>
          <Text style={styles.concentrationLabel}>Typical concentration:</Text>
          <Text style={styles.concentrationValue}>{ingredient.concentration}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  name: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.burgundy,
  },
  alias: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dustyPink,
  },
  saveBtn: {
    padding: 4,
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  benefitTag: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  benefitText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  concentrationLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  concentrationValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
});

