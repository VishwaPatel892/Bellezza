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

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleLogin = async (values, { setFieldError }) => {
    setLoading(true);
    setServerError('');
    try {
      await login(values.email, values.password);
      router.replace('/(tabs)/home');
    } catch (err) {
      const errorMsg = err?.message || 'Invalid email or password.';
      if (err.status === 401) {
        setServerError('Invalid email or password. Please verify your credentials.');
      } else if (err.errors) {
        if (err.errors.email) setFieldError('email', err.errors.email);
        if (err.errors.password) setFieldError('password', err.errors.password);
      } else {
        setServerError(errorMsg);
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
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your personalized skincare protocol</Text>

            {serverError ? (
              <View style={styles.serverErrorBox}>
                <Text style={styles.serverErrorText}>{serverError}</Text>
              </View>
            ) : null}

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
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
                    placeholder="••••••••"
                    value={values.password}
                    onChangeText={(text) => {
                      setServerError('');
                      handleChange('password')(text);
                    }}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password}
                    secureTextEntry
                  />

                  <PrimaryButton
                    title="Sign In"
                    loading={loading}
                    onPress={handleSubmit}
                    style={{ marginTop: SPACING.sm }}
                  />
                </View>
              )}
            </Formik>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to Bellezza? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Create an Account</Text>
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
    paddingTop: SPACING.xxl,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  botanicalIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  brandTitle: {
    ...TYPOGRAPHY.displayLarge,
    fontSize: 32,
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
