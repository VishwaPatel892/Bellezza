import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Badge } from './Badge';

export const RoutineStepCard = ({ step, onToggle }) => {
  return (
    <View
      style={[
        styles.card,
        step.isCompleted ? styles.completedCard : styles.activeCard,
        SHADOWS.subtle,
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.checkboxContainer}
      >
        {step.isCompleted ? (
          <CheckCircle2 size={24} color={COLORS.success} />
        ) : (
          <Circle size={24} color={COLORS.burgundy} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.stepBadge}>STEP {step.stepNumber}</Text>
          <Badge label={step.category} variant={step.isCompleted ? 'default' : 'pink'} size="small" />
        </View>

        <Text
          style={[
            styles.title,
            step.isCompleted && styles.completedText,
          ]}
        >
          {step.title}
        </Text>

        <Text
          style={[
            styles.productName,
            step.isCompleted && styles.completedMuted,
          ]}
        >
          {step.productName}
        </Text>

        {step.instructions ? (
          <Text style={styles.instructions}>{step.instructions}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.burgundy,
  },
  completedCard: {
    backgroundColor: '#FAF8F5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    opacity: 0.88,
  },
  checkboxContainer: {
    marginRight: 14,
    marginTop: 2,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.burgundy,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.burgundy,
    marginBottom: 6,
  },
  completedMuted: {
    color: COLORS.textMuted,
  },
  instructions: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default RoutineStepCard;
