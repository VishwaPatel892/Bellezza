import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, ShieldAlert, Bookmark, Leaf } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export function RemedyCard({ remedy, isSaved = false, onToggleSave, onPress, style }) {
  if (!remedy) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, SHADOWS.subtle, style]}
      accessibilityRole="button"
      accessibilityLabel={remedy.name}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Leaf size={12} color={COLORS.success} />
          <Text style={styles.badgeText}>{remedy.type?.toUpperCase() || 'HOME CARE'}</Text>
        </View>
        <View style={styles.timeBadge}>
          <Clock size={12} color={COLORS.textMuted} />
          <Text style={styles.timeText}>{remedy.duration}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onToggleSave && onToggleSave(remedy.id)}
          style={styles.saveBtn}
          accessibilityLabel="Save remedy"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bookmark
            size={16}
            color={isSaved ? COLORS.burgundy : COLORS.textMuted}
            fill={isSaved ? COLORS.burgundy : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{remedy.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {remedy.description}
      </Text>

      {remedy.caution ? (
        <View style={styles.cautionRow}>
          <ShieldAlert size={12} color={COLORS.warning} />
          <Text style={styles.cautionText} numberOfLines={1}>
            {remedy.caution}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.frequency}>{remedy.frequency || 'Weekly'}</Text>
        <Text style={styles.ingredientsCount}>
          {remedy.ingredients ? `${remedy.ingredients.length} ingredients` : 'Evidence-informed'}
        </Text>
      </View>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FFF6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.success,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: SPACING.sm,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  saveBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  title: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  cautionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.warning,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  frequency: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  ingredientsCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
});

