import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export function CustomInput({
  label,
  error,
  secureTextEntry,
  multiline,
  numberOfLines,
  style,
  containerStyle,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.inputRow,
        multiline && styles.multilineRow,
        error ? styles.inputError : null,
      ]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            {showPassword
              ? <EyeOff size={18} color={COLORS.textMuted} />
              : <Eye size={18} color={COLORS.textMuted} />}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  multilineRow: { alignItems: 'flex-start', paddingTop: SPACING.sm },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, ...TYPOGRAPHY.bodyMedium, color: COLORS.textPrimary, height: 48 },
  multilineInput: { height: undefined, minHeight: 100 },
  eyeBtn: { padding: 4 },
  errorText: { ...TYPOGRAPHY.bodySmall, color: COLORS.error, marginTop: 4 },
});

