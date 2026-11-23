import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Sparkles,
  ChevronRight,
  BookOpen,
  Info,
  MapPin,
  Sun,
  Droplets,
  Shield,
  X,
  Check,
  ArrowRight,
  Camera,
  GitCompare,
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { SearchBar } from '../../src/components/common/SearchBar';
import { SectionHeader } from '../../src/components/common/SectionHeader';
import { FeatureCard } from '../../src/components/cards/FeatureCard';
import { SkinConcernCard } from '../../src/components/cards/SkinConcernCard';
import { RoutineCard } from '../../src/components/cards/RoutineCard';
import { ProductCard } from '../../src/components/cards/ProductCard';
import { IngredientCard } from '../../src/components/cards/IngredientCard';
import { RemedyCard } from '../../src/components/cards/RemedyCard';
import { productService, FALLBACK_PRODUCTS } from '../../src/services/productService';
import { climateService } from '../../src/services/climateService';
import { INDIAN_CITIES } from '../../src/constants/indianMarket';
import {
  SAMPLE_INGREDIENTS,
  SAMPLE_REMEDIES,
  SKIN_CONCERNS,
  DEFAULT_MORNING_ROUTINE,
  DEFAULT_EVENING_ROUTINE,
  DAILY_TIP,
} from '../../src/data/sampleData';

export default function HomeScreen() {
  const { user, toggleSavedProduct, toggleSavedIngredient } = useAuth();
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [morningSteps, setMorningSteps] = useState(DEFAULT_MORNING_ROUTINE);
  const [eveningSteps, setEveningSteps] = useState(DEFAULT_EVENING_ROUTINE);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  // Climate-Aware States
  const [selectedCityId, setSelectedCityId] = useState(user?.preferredCity || 'mumbai');
  const [climateData, setClimateData] = useState(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    productService
      .getProducts()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setProducts(res);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real-time Indian climate skincare data
  useEffect(() => {
    climateService
      .getCurrentClimate({ cityId: selectedCityId })
      .then((data) => {
        if (data) setClimateData(data);
      })
      .catch(() => {});
  }, [selectedCityId]);

  const toggleMorningStep = (id) => {
    setMorningSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const toggleEveningStep = (id) => {
    setEveningSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const handleSelectConcern = (concern) => {
    setSelectedConcern(concern.name);
    router.push({
      pathname: '/(tabs)/explore',
      params: { category: 'Skin Concerns', query: concern.name },
    });
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Bellezza Notifications',
      'Daily ritual reminder scheduled for 08:00 AM and 09:00 PM IST.'
    );
  };

  const savedProductIds = user?.savedProducts || [];
  const savedIngredientIds = user?.savedIngredients || [];

  return (
    <ScreenContainer padded={false} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>Your glow starts here.</Text>
            <Text style={styles.headerTitle}>
              {user?.name ? `Welcome, ${user.name}` : 'Welcome to Bellezza'}
            </Text>
            <Text style={styles.headerDesc}>The Science Behind Your Glow in India.</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.iconButton}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={COLORS.burgundy} />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.avatarButton}
              accessibilityLabel="Profile"
            >
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar - Navigates to Explore */}
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Search Indian brands, INCI actives, remedies..."
            onPress={() => router.push('/(tabs)/explore')}
          />
        </View>

        {/* Climate-Aware Skincare Card */}
        <View style={styles.climateCardWrap}>
          <View style={[styles.climateCard, SHADOWS.subtle]}>
            <View style={styles.climateCardHeader}>
              <View style={styles.cityLocationRow}>
                <MapPin size={15} color={COLORS.burgundy} />
                <Text style={styles.cityName}>
                  {climateData?.city || 'Mumbai, Maharashtra'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCityModalVisible(true)}
                style={styles.changeCityBtn}
                accessibilityLabel="Change city"
              >
                <Text style={styles.changeCityText}>Change City</Text>
              </TouchableOpacity>
            </View>

            {climateData?.metrics ? (
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Sun size={16} color={COLORS.warning} />
                  <Text style={styles.metricValue}>
                    {Math.round(climateData.metrics.temperature)}°C
                  </Text>
                  <Text style={styles.metricLabel}>Temp</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Droplets size={16} color="#4A90E2" />
                  <Text style={styles.metricValue}>
                    {climateData.metrics.humidity}%
                  </Text>
                  <Text style={styles.metricLabel}>Humidity</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Shield size={16} color={climateData.metrics.uvIndex >= 6 ? COLORS.error : COLORS.success} />
                  <Text style={styles.metricValue}>
                    UV {climateData.metrics.uvIndex?.toFixed(1) || '5.0'}
                  </Text>
                  <Text style={styles.metricLabel}>Solar UV</Text>
                </View>
              </View>
            ) : null}

            {climateData?.skincareGuidance?.recommendations?.[0] ? (
              <View style={styles.climateAdviceBox}>
                <Text style={styles.climateAdviceTitle}>
                  CLIMATE ADVICE: {climateData.skincareGuidance.recommendations[0].title.toUpperCase()}
                </Text>
                <Text style={styles.climateAdviceText}>
                  {climateData.skincareGuidance.recommendations[0].advice}
                </Text>
              </View>
            ) : null}

            <Text style={styles.climateDisclaimer}>
              Weather data from Open-Meteo. Environmental context for photoprotection and hydration; does not replace medical advice.
            </Text>
          </View>
        </View>

        {/* Personalized Skin Assessment Callout */}
        <View style={styles.assessmentSection}>
          {!user?.skinProfile?.assessmentCompleted ? (
            <View style={[styles.assessmentPromptCard, SHADOWS.card]}>
              <View style={styles.assessmentBadge}>
                <Sparkles size={12} color={COLORS.burgundy} />
                <Text style={styles.assessmentBadgeText}>SKIN PROFILE QUESTIONNAIRE</Text>
              </View>
              <Text style={styles.assessmentTitle}>Unlock Your Tailored Skincare Regimen</Text>
              <Text style={styles.assessmentDesc}>
                Take the 7-step assessment to calibrate active concentrations, avoid personal allergens, and get tailored Indian climate product recommendations.
              </Text>
              <TouchableOpacity
                style={styles.assessmentBtn}
                onPress={() => router.push('/assessment')}
                activeOpacity={0.8}
              >
                <Text style={styles.assessmentBtnText}>Take Skin Assessment</Text>
                <ArrowRight size={16} color={COLORS.cream} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.assessedSummaryCard, SHADOWS.subtle]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assessedSubtitle}>PERSONALIZED SKIN PROFILE</Text>
                <Text style={styles.assessedTitle}>
                  {user.skinProfile.skinType} Skin • {user.skinProfile.sensitivityLevel || 'Low'} Sensitivity
                </Text>
                <Text style={styles.assessedGoals}>
                  {(user.skinProfile.skincareGoals || []).slice(0, 2).join(' • ') || 'Healthy skin barrier maintenance'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => router.push('/assessment')}
              >
                <Text style={styles.retakeBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* AI Skincare Card */}
        <View style={styles.featureSection}>
          <FeatureCard
            title="Your skin, understood."
            description="Get personalized guidance for Indian skin tones, hyperpigmentation, and tropical humidity."
            buttonText="Talk to Bellezza AI"
            onPress={() => router.push('/(tabs)/assistant')}
          />
        </View>

        {/* Daily Skincare Tip Banner */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Info size={16} color={COLORS.burgundy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>DAILY SKIN SCIENCE TIP</Text>
            <Text style={styles.tipText}>{DAILY_TIP.tip}</Text>
          </View>
        </View>

        {/* Skin Concerns */}
        <View style={styles.section}>
          <SectionHeader
            subtitle="TARGETED CARE"
            title="Skin Concerns"
            actionLabel="View all"
            onAction={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Skin Concerns' } })}
            style={{ paddingHorizontal: SPACING.lg }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardList}
          >
            {SKIN_CONCERNS.map((concern) => (
              <SkinConcernCard
                key={concern.id}
                concern={concern}
                isSelected={selectedConcern === concern.name}
                onPress={() => handleSelectConcern(concern)}
                style={{ width: 140 }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Routines Preview */}
        <View style={styles.section}>
          <SectionHeader
            subtitle="DAILY REGIMEN"
            title="Personalized Protocols"
            actionLabel="View all"
            onAction={() => router.push('/(tabs)/routine')}
            style={{ paddingHorizontal: SPACING.lg }}
          />
          <RoutineCard
            title="Morning Photoprotection Routine"
            type="morning"
            steps={morningSteps}
            onToggleStep={toggleMorningStep}
            onViewDetails={() => router.push('/(tabs)/routine')}
          />
          <RoutineCard
            title="Nocturnal Cellular Recovery"
            type="evening"
            steps={eveningSteps}
            onToggleStep={toggleEveningStep}
            onViewDetails={() => router.push('/(tabs)/routine')}
          />
        </View>

        {/* Recommended Products */}
        <View style={styles.section}>
          <SectionHeader
            subtitle="INDIA-FIRST FORMULAS"
            title="Recommended Products"
            actionLabel="Explore catalog"
            onAction={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Products' } })}
            style={{ paddingHorizontal: SPACING.lg }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardList}
          >
            {products.map((prod) => {
              const id = prod.id || prod._id;
              return (
                <ProductCard
                  key={id}
                  product={{
                    ...prod,
                    keyIngredients: prod.ingredientList || prod.keyIngredients || [],
                  }}
                  isSaved={savedProductIds.includes(id)}
                  onToggleSave={() => toggleSavedProduct(id)}
                  onPress={() =>
                    Alert.alert(
                      prod.name,
                      `${prod.description}\n\nPrice: ${prod.priceFormatted || `₹${prod.priceInr || prod.price}`}\nRetailer: ${prod.retailer || 'Nykaa / Indian Retail'}\nKey Actives: ${(prod.ingredientList || prod.keyIngredients || []).slice(0, 4).join(', ')}`
                    )
                  }
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Active Ingredients Section */}
        <View style={styles.section}>
          <SectionHeader
            subtitle="SCIENCE-BACKED"
            title="Active Ingredients"
            actionLabel="View all"
            onAction={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Ingredients' } })}
            style={{ paddingHorizontal: SPACING.lg }}
          />
          <View style={{ paddingHorizontal: SPACING.lg }}>
            {SAMPLE_INGREDIENTS.slice(0, 3).map((ing) => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                isSaved={savedIngredientIds.includes(ing.id)}
                onToggleSave={toggleSavedIngredient}
                onPress={() =>
                  Alert.alert(
                    ing.name,
                    `${ing.summary}\n\nConcentration: ${ing.concentration}\nBenefits:\n• ${ing.benefits.join('\n• ')}`
                  )
                }
              />
            ))}
          </View>
        </View>

        {/* Home Remedies */}
        <View style={styles.section}>
          <SectionHeader
            subtitle="TRADITIONAL & EVIDENCE-INFORMED"
            title="Home Care Remedies"
            actionLabel="View all"
            onAction={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Home Remedies' } })}
            style={{ paddingHorizontal: SPACING.lg }}
          />
          <View style={{ paddingHorizontal: SPACING.lg }}>
            {SAMPLE_REMEDIES.slice(0, 2).map((remedy) => {
              const id = remedy._id || remedy.id;
              return (
                <RemedyCard
                  key={id}
                  remedy={remedy}
                  onPress={() => router.push({ pathname: '/remedy-detail', params: { id } })}
                />
              );
            })}
          </View>
        </View>

        {/* Skin Journal & Progress Photo Banner */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
          <View style={[styles.journalBannerCard, SHADOWS.subtle]}>
            <View style={styles.journalIconWrap}>
              <Camera size={20} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.journalSubtitle}>CLINICAL TRACKING</Text>
              <Text style={styles.journalTitle}>Skin Journal & Progress Photos</Text>
              <Text style={styles.journalDesc}>
                Log daily skin conditions and capture secure progress photos for side-by-side comparison.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.journalActionBtn}
              onPress={() => router.push('/journal')}
              accessibilityLabel="Open Skin Journal"
            >
              <ArrowRight size={16} color={COLORS.cream} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Indian City Selection Modal */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>INDIAN METEOROLOGY</Text>
                <Text style={styles.modalTitle}>Select Your City</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalNotice}>
              Real-time atmospheric humidity and solar UV index are monitored via Open-Meteo to deliver climate-specific barrier recommendations.
            </Text>

            <ScrollView style={{ maxHeight: 340 }}>
              {INDIAN_CITIES.map((city) => {
                const isSelected = selectedCityId === city.id;
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.cityRow, isSelected && styles.cityRowActive]}
                    onPress={() => {
                      setSelectedCityId(city.id);
                      setCityModalVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cityRowName, isSelected && { color: COLORS.burgundy, fontWeight: '700' }]}>
                        {city.name}, {city.state}
                      </Text>
                      <Text style={styles.cityRowClimate}>{city.climateType}</Text>
                    </View>
                    {isSelected && <Check size={18} color={COLORS.burgundy} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.burgundy,
    fontSize: 24,
    lineHeight: 30,
  },
  headerDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 15,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  /* Climate Card */
  climateCardWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  climateCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  climateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cityLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityName: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 14,
    color: COLORS.burgundy,
  },
  changeCityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
  },
  changeCityText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.burgundy,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.softCream,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderSubtle,
  },
  climateAdviceBox: {
    backgroundColor: '#FAF5EE',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
  },
  climateAdviceTitle: {
    ...TYPOGRAPHY.overline,
    fontSize: 9,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  climateAdviceText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  climateDisclaimer: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: 12,
  },

  featureSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.softCream,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 10,
    marginBottom: 2,
  },
  tipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  horizontalCardList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(41, 35, 38, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
  },
  modalTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.burgundy,
    fontSize: 20,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNotice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  cityRowActive: {
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
  },
  cityRowName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  cityRowClimate: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  assessmentSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  assessmentPromptCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 47, 55, 0.25)',
  },
  assessmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
    gap: 4,
  },
  assessmentBadgeText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  assessmentTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.burgundy,
    fontSize: 18,
    marginBottom: 4,
  },
  assessmentDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  assessmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  assessmentBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 14,
  },
  assessedSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assessedSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  assessedTitle: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
    marginTop: 2,
  },
  assessedGoals: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  retakeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.burgundy,
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
  },
  retakeBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
    fontSize: 12,
  },
  journalBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  journalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#FDF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 9,
  },
  journalTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginTop: 1,
  },
  journalDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  journalActionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
});
