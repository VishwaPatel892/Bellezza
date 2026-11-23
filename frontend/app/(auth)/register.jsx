import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Leaf } from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { CustomInput } from '../../src/components/common/CustomInput';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';

const registerSchema = Yup.object().shape({
  name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleRegister = async (values, { setFieldError }) => {
    setLoading(true);
    setServerError('');
    try {
      await register(values.name, values.email, values.password);
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err.status === 409) {
        setFieldError('email', 'An account with this email address already exists.');
        setServerError('An account with this email address already exists. Please sign in instead.');
      } else if (err.errors) {
        if (err.errors.name) setFieldError('name', err.errors.name);
        if (err.errors.email) setFieldError('email', err.errors.email);
        if (err.errors.password) setFieldError('password', err.errors.password);
      } else {
        setServerError(err?.message || 'Could not create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable padded={false} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentWrap}>
          {/* Logo & Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.botanicalIcon}>
              <Leaf size={28} color={COLORS.burgundy} />
            </View>
            <Text style={styles.brandTitle}>Bellezza</Text>
            <Text style={styles.brandTagline}>The Science Behind Your Glow.</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, SHADOWS.card]}>
            <Text style={styles.formTitle}>Begin Your Protocol</Text>
            <Text style={styles.formSubtitle}>Create an account to track your customized rituals</Text>

            {serverError ? (
              <View style={styles.serverErrorBox}>
                <Text style={styles.serverErrorText}>{serverError}</Text>
              </View>
            ) : null}

            <Formik
              initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <CustomInput
                    label="Full Name"
                    placeholder="e.g. Dr. Bella Thorne"
                    value={values.name}
                    onChangeText={(text) => {
                      setServerError('');
                      handleChange('name')(text);
                    }}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                  />

                  <CustomInput
                    label="Email Address"
                    placeholder="you@domain.com"
                    value={values.email}
                    onChangeText={(text) => {
                      setServerError('');
                      handleChange('email')(text);
                    }}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <CustomInput
                    label="Password"
                    placeholder="Min. 6 characters"
                    value={values.password}
                    onChangeText={(text) => {
                      setServerError('');
                      handleChange('password')(text);
                    }}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password}
                    secureTextEntry
                  />

                  <CustomInput
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                    secureTextEntry
                  />

                  <PrimaryButton
                    title="Create Account"
                    loading={loading}
                    onPress={handleSubmit}
                    style={{ marginTop: SPACING.sm }}
                  />
                </View>
              )}
            </Formik>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  contentWrap: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  botanicalIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  brandTitle: {
    ...TYPOGRAPHY.displayLarge,
    fontSize: 30,
    color: COLORS.burgundy,
    marginBottom: 2,
  },
  brandTagline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.dustyPink,
    fontFamily: 'Inter_500Medium',
  },
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    ...TYPOGRAPHY.headingLarge,
    fontSize: 20,
    color: COLORS.burgundy,
    marginBottom: 2,
  },
  formSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  serverErrorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: SPACING.md,
  },
  serverErrorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
});
