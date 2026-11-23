import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, Leaf } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../src/constants/theme';
import { useAuth } from '../src/hooks/useAuth';

export default function SplashScreen() {
  const { user, hasSeenOnboarding, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: !isWeb,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [loading, hasSeenOnboarding]);

  // Guaranteed fallback transition: never remain on splash longer than 2.5s
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, [hasSeenOnboarding]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brandWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.botanicalIcon}>
          <Leaf size={32} color={COLORS.burgundy} />
          <View style={styles.sparkleBadge}>
            <Sparkles size={12} color={COLORS.cream} />
          </View>
        </View>

        <Text style={styles.wordmark}>Bellezza</Text>
        <Text style={styles.tagline}>The Science Behind Your Glow.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MOLECULAR DERMATOLOGY & WELLNESS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  botanicalIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  wordmark: {
    ...TYPOGRAPHY.displayLarge,
    fontSize: 38,
    color: COLORS.burgundy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: COLORS.dustyPink,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xxl,
  },
  footerText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
  },
});

