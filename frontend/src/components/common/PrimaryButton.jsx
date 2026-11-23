import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS } from '../../constants/theme';

export function PrimaryButton({ title, onPress, disabled, loading, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[styles.btn, (disabled || loading) && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading
        ? <ActivityIndicator size="small" color={COLORS.cream} />
        : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  disabled: { opacity: 0.45 },
  text: { ...TYPOGRAPHY.button, color: COLORS.cream },
});

