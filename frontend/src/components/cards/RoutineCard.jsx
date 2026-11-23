import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export function RoutineCard({ title, type = 'morning', steps = [], onViewDetails, onToggleStep, style }) {
  const isMorning = type === 'morning';
  const completedCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={[styles.card, SHADOWS.subtle, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, isMorning ? styles.morningIcon : styles.eveningIcon]}>
            {isMorning ? <Sun size={18} color="#C28A46" /> : <Moon size={18} color={COLORS.burgundy} />}
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {completedCount} of {totalCount} steps completed
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onViewDetails} style={styles.viewBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.viewText}>View</Text>
          <ChevronRight size={14} color={COLORS.burgundy} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Step items */}
      <View style={styles.stepsList}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step.id}
            activeOpacity={0.7}
            onPress={() => onToggleStep && onToggleStep(step.id)}
            style={styles.stepRow}
          >
            <View style={styles.stepNumWrap}>
              <Text style={styles.stepNum}>{step.order}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepName, step.done && styles.stepDoneText]}>
                {step.name}
              </Text>
              {step.instruction ? (
                <Text style={styles.stepInstruction} numberOfLines={1}>
                  {step.instruction}
                </Text>
              ) : null}
            </View>
            <CheckCircle2
              size={18}
              color={step.done ? COLORS.success : COLORS.border}
              fill={step.done ? '#E6F4EA' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morningIcon: {
    backgroundColor: '#FFF7ED',
  },
  eveningIcon: {
    backgroundColor: COLORS.softCream,
  },
  title: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.full,
  },
  stepsList: {
    marginTop: SPACING.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  stepNumWrap: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepNum: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stepDoneText: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  stepInstruction: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});

