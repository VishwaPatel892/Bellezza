import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, Compass, CalendarCheck, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Understand Your Skin',
    description: 'Discover your skin type and learn about your unique skincare needs with science-backed assessments.',
    icon: Sparkles,
    tag: 'EVALUATION',
  },
  {
    id: 2,
    title: 'Find What Works for You',
    description: 'Explore skincare products, ingredients, and evidence-informed home-care options tailored for you.',
    icon: Compass,
    tag: 'DISCOVERY',
  },
  {
    id: 3,
    title: 'Build Your Perfect Routine',
    description: 'Create a personalized skincare routine, track daily rituals, and monitor your healthy skin barrier progress.',
    icon: CalendarCheck,
    tag: 'CONSISTENCY',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useAuth();

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/assessment');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <ScreenContainer scrollable={false} padded={false} style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <Text style={styles.brandName}>Bellezza</Text>
        {!isLast ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Main Slide Card */}
      <View style={styles.contentWrap}>
        <View style={[styles.visualArea, SHADOWS.card]}>
          <View style={styles.iconCircle}>
            <IconComponent size={56} color={COLORS.burgundy} />
          </View>
          <View style={styles.tagWrap}>
            <Text style={styles.tagText}>{currentSlide.tag}</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        {/* 3-step progress indicator */}
        <View style={styles.progressContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={isLast ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  brandName: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 22,
    color: COLORS.burgundy,
  },
  skipBtn: {
    padding: SPACING.xs,
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  visualArea: {
    width: width * 0.72,
    height: width * 0.72,
    maxHeight: 280,
    maxWidth: 280,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  tagWrap: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.cream,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
  },
  dot: {
    height: 6,
    borderRadius: RADIUS.full,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.burgundy,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
