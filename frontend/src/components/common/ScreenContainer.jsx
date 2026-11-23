import React from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export function ScreenContainer({
  children,
  scrollable = true,
  padded = true,
  style,
  contentStyle,
  keyboardAvoid = false,
  ...scrollProps
}) {
  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : children;

  const content = keyboardAvoid ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : inner;

  return (
    <SafeAreaView style={[styles.safe, style]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  padded: { padding: SPACING.md, paddingBottom: 100 },
});

