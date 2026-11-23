import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Heart,
  Droplets,
  HelpCircle,
  IndianRupee,
  Layers,
  ChevronRight,
  Info,
  ShieldCheck,
  Atom,
  RotateCcw,
  Compass,
  Calendar,
  Sun,
  Moon,
  AlertTriangle,
  Tag,
  X,
  ExternalLink,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { useAuth } from '../src/hooks/useAuth';
import { storage } from '../src/utils/storage';
import { skinAssessmentSchema } from '../src/utils/validationSchemas';
import { formatInr } from '../src/utils/formatters';

// Step options & data constants
const SKIN_TYPES = [
  {
    id: 'Dry',
    title: 'Dry Skin',
    description: 'Feels tight, dehydrated, flaky, or lacks moisture throughout the day.',
  },
  {
    id: 'Oily',
    title: 'Oily Skin',
    description: 'Produces excess sebum, with persistent shine across T-zone and cheeks.',
  },
  {
    id: 'Combination',
    title: 'Combination Skin',
    description: 'Oily forehead, nose, and chin (T-zone), with normal or dry cheeks.',
  },
  {
    id: 'Normal',
    title: 'Normal Skin',
    description: 'Balanced moisture and lipid barrier, rare breakouts, smooth texture.',
  },
  {
    id: 'Sensitive',
    title: 'Sensitive Skin',
    description: 'Easily irritated, reactive to environmental stress and harsh actives.',
  },
  {
    id: 'Not sure',
    title: 'Not Sure / Fluctuating',
    description: 'Skin changes frequently with climate, seasons, or uncertain patterns.',
  },
];

const SKIN_CONCERNS = [
  'Acne and breakouts',
  'Dark spots',
  'Hyperpigmentation',
  'Uneven skin tone',
  'Dryness',
  'Excess oil',
  'Enlarged pores',
  'Uneven texture',
  'Redness',
  'Sensitivity',
  'Fine lines',
  'Dullness',
];

const SENSITIVITY_LEVELS = [
  { id: 'Low', title: 'Low', subtitle: 'Rarely reacts to new skincare or actives' },
  { id: 'Moderate', title: 'Moderate', subtitle: 'Occasional tingling or redness from strong formulas' },
  { id: 'High', title: 'High', subtitle: 'Easily triggers burning, flushing, or irritation' },
  { id: 'Not sure', title: 'Not sure', subtitle: 'Uncertain about sensitivity threshold' },
];

const IRRITATION_OPTIONS = [
  { id: 'Yes', title: 'Frequently', subtitle: 'Skincare often causes stinging or bumps' },
  { id: 'Sometimes', title: 'Occasionally', subtitle: 'Only with harsh or fragranced formulas' },
  { id: 'No', title: 'Rarely / Never', subtitle: 'Skin tolerates most skincare products well' },
  { id: 'Not sure', title: 'Not sure', subtitle: 'Have not tracked reactions yet' },
];

const COMMON_ALLERGIES = [
  'Essential oils',
  'Salicylic acid',
  'Parabens',
  'Niacinamide',
  'Retinol / Retinoids',
  'Sulfates (SLS)',
  'Lanolin',
  'Glycolic acid',
];

const COMMON_TRIGGERS = [
  'Synthetic fragrance',
  'Alcohol denat',
  'Witch hazel',
  'Benzoyl peroxide',
  'Citrus extracts',
  'Menthol / Eucalyptus',
];

const SKINCARE_GOALS = [
  'Clearer-looking skin',
  'Better hydration',
  'More even-looking skin tone',
  'Oil control',
  'Reduce the appearance of dark spots',
  'Smoother skin texture',
  'Improve skin barrier care',
  'Maintain healthy-looking skin',
];

const ROUTINE_PRODUCTS = [
  'Cleanser',
  'Moisturizer',
  'Sunscreen',
  'Serum',
  'Exfoliant',
  'Retinoid products',
  'Other skincare products',
  'No current routine',
];

const BUDGET_PRESETS = [500, 1000, 2000, 3500, 5000];

const ROUTINE_PREFERENCES = [
  { id: 'Simple', title: 'Simple & Streamlined', subtitle: '2 to 3 essential daily steps (Cleanse, Hydrate, Protect)' },
  { id: 'Advanced', title: 'Targeted & Advanced', subtitle: 'Multi-step targeted routine with concentrated actives' },
  { id: 'Flexible', title: 'Flexible / Season-adaptive', subtitle: 'Adapts depending on weather and time of week' },
];

const PRODUCT_PREFERENCES = [
  'Science-backed actives',
  'Fragrance-free',
  'Dermatologically tested',
  'Clean & Minimalist',
  'Gentle botanicals',
  'Non-comedogenic',
];

// Bio-active matching engine based on dermatological evidence
const computeRecommendedActives = (values) => {
  const actives = [];
  const concerns = values.skinConcerns || [];
  const goals = values.skincareGoals || [];
  const allTargets = [...concerns, ...goals].map((s) => s.toLowerCase());

  // Oil / Acne / Blemishes
  if (allTargets.some((t) => t.includes('acne') || t.includes('oil') || t.includes('pore'))) {
    actives.push({
      name: 'Niacinamide (Vitamin B3 5-10%)',
      role: 'Sebum Normalizer & Pore Refiner',
      benefit: 'Regulates hyperactive sebaceous glands, contracts pore appearance, and strengthens skin barrier.',
    });
    actives.push({
      name: 'Salicylic Acid (BHA 1-2%)',
      role: 'Lipophilic Exfoliant',
      benefit: 'Penetrates oil-filled pores to dissolve cellular debris and prevent inflammatory breakouts.',
    });
  }

  // Dark spots / Hyperpigmentation / Uneven tone
  if (allTargets.some((t) => t.includes('dark spot') || t.includes('hyperpigmentation') || t.includes('tone') || t.includes('dullness'))) {
    actives.push({
      name: 'Alpha Arbutin & 3-O-Ethyl Ascorbic Acid',
      role: 'Tyrosinase Inhibitor',
      benefit: 'Downregulates melanogenesis to fade persistent post-inflammatory dark marks and sun spots.',
    });
  }

  // Hydration / Dryness / Barrier
  if (allTargets.some((t) => t.includes('dry') || t.includes('hydrat') || t.includes('barrier')) || values.skinType === 'Dry') {
    actives.push({
      name: 'Ceramides (NP, AP, EOP 3:1:1 Complex)',
      role: 'Stratum Corneum Lipid Shield',
      benefit: 'Replaces essential intercellular lipids to halt trans-epidermal moisture loss.',
    });
    actives.push({
      name: 'Multi-Molecular Hyaluronic Acid',
      role: 'Deep Hydrophilic Humectant',
      benefit: 'Binds up to 1000x its molecular weight in moisture into varied dermal layers.',
    });
  }

  // Texture / Fine lines / Cellular renewal
  if (allTargets.some((t) => t.includes('fine line') || t.includes('texture') || t.includes('smooth'))) {
    actives.push({
      name: 'Bakuchiol / Granactive Retinoid',
      role: 'Cellular Turnover Accelerator',
      benefit: 'Enhances collagen synthesis and refines micro-texture with minimal erythema.',
    });
  }

  // Redness / High Sensitivity
  if (values.sensitivityLevel === 'High' || allTargets.some((t) => t.includes('redness') || t.includes('sensitiv'))) {
    actives.push({
      name: 'Centella Asiatica (Cica) & Madecassoside',
      role: 'Vascular & Cellular Soother',
      benefit: 'Downregulates inflammatory cytokines and relieves surface flushing.',
    });
  }

  // Safe universal fallbacks if empty
  if (actives.length === 0) {
    actives.push({
      name: 'Niacinamide 5%',
      role: 'Multi-Tasking Cellular Care',
      benefit: 'Balances sebum, evens tone, and fortifies epidermal resilience against tropical heat.',
    });
    actives.push({
      name: 'Ceramide Barrier Complex',
      role: 'Barrier Reinforcement',
      benefit: 'Preserves optimal hydration balance throughout varied climate shifts.',
    });
  }

  return actives.slice(0, 4);
};

const getBarrierDiagnosis = (values) => {
  const type = values.skinType || 'Combination';
  const sensitivity = values.sensitivityLevel || 'Low';

  if (type === 'Oily') {
    return 'Your lipid profile indicates hyperactive sebaceous production. Your optimal protocol prioritizes lightweight water-based humectants over heavy comedogenic occlusives, coupled with gentle BHA pore clearing and broad-spectrum matte SPF 50 photoprotection.';
  }
  if (type === 'Dry') {
    return 'Your stratum corneum demonstrates depleted intercellular lipids and accelerated moisture loss. Your protocol requires physiological lipid replenishment with 3:1:1 ceramides, gentle non-stripping cleansers, and rich barrier sealing.';
  }
  if (type === 'Combination') {
    return 'Your skin displays bi-zonal physiological traits: heightened sebum across the T-zone alongside normal or dehydrated cheeks. A balancing protocol with lightweight active serums and gel-cream hydrators delivers targeted care without clogging pores.';
  }
  if (type === 'Sensitive' || sensitivity === 'High') {
    return 'Your skin barrier exhibits heightened reactive neuro-sensory thresholds. Formulations must strictly avoid added synthetic fragrances, drying alcohols, and harsh physical scrubs, centering on bio-compatible calming agents like cica and colloidal oat.';
  }
  return 'Your skin reflects balanced physiological hydration and sebum equilibrium. Your primary clinical focus is preventative broad-spectrum photoprotection against solar UV-induced photoaging and antioxidant cellular defense.';
};

export default function AssessmentScreen() {
  const { user, token, updateSkinProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [customAllergy, setCustomAllergy] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');
  const [customProduct, setCustomProduct] = useState('');

  // Prepopulate if user already has a saved skin profile
  const initialProfile = user?.skinProfile || {};

  const normalizeSkinType = (val) => {
    if (!val) return 'Not sure';
    const map = {
      dry: 'Dry',
      oily: 'Oily',
      combination: 'Combination',
      normal: 'Normal',
      sensitive: 'Sensitive',
      unknown: 'Not sure',
    };
    return map[val.toLowerCase()] || val;
  };

  const initialValues = {
    skinType: normalizeSkinType(initialProfile.skinType || user?.skinType),
    skinConcerns: initialProfile.skinConcerns || [],
    sensitivityLevel: initialProfile.sensitivityLevel || 'Not sure',
    experiencesIrritation: initialProfile.experiencesIrritation || 'Not sure',
    knownIngredientAllergies: initialProfile.knownIngredientAllergies || [],
    irritationTriggers: initialProfile.irritationTriggers || [],
    fragranceSensitivity: initialProfile.fragranceSensitivity || false,
    productReactions: initialProfile.productReactions || [],
    skincareGoals: initialProfile.skincareGoals || [],
    currentRoutine: initialProfile.currentRoutine || [],
    currentProducts: initialProfile.currentProducts || [],
    monthlyBudgetINR: initialProfile.monthlyBudgetINR || 1500,
    productPreferences: initialProfile.productPreferences || ['Dermatologically tested'],
    fragranceFreePreference: initialProfile.fragranceFreePreference || false,
    routinePreference: initialProfile.routinePreference || 'Simple',
    indiaFirstPreference: initialProfile.indiaFirstPreference !== undefined ? initialProfile.indiaFirstPreference : true,
    disclaimerAcknowledged: true,
  };

  const handleExit = () => {
    try {
      router.replace('/(tabs)/home');
    } catch (e) {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/home';
      }
    }
  };

  const handleNextStep = (values, errors) => {
    // Basic step validation before advancing
    if (step === 1 && !values.skinType) {
      Alert.alert('Selection Required', 'Please choose your primary skin type or select "Not sure".');
      return;
    }
    if (step < 7) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      handleExit();
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        assessmentCompleted: true,
        lastAssessedAt: new Date().toISOString(),
      };

      // 1. Always persist to local storage first
      try {
        await storage.set('bellezza_skin_profile', JSON.stringify(payload));
      } catch (storeErr) {
        console.warn('[Assessment] Storage warning:', storeErr);
      }

      // 2. If authenticated, update backend user profile
      if (token && typeof updateSkinProfile === 'function') {
        try {
          await updateSkinProfile(payload);
        } catch (apiErr) {
          console.warn('[Assessment] Backend update warning (saved locally):', apiErr?.message);
        }
      }

      // 3. Immediately display the comprehensive Survey Results View!
      setResultData(payload);
    } catch (err) {
      console.error('[Assessment] Submission error:', err);
      setResultData({
        ...values,
        assessmentCompleted: true,
        lastAssessedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressComplete = async (values) => {
    const cleanValues = {
      ...values,
      skinType: values.skinType || 'Not sure',
      sensitivityLevel: values.sensitivityLevel || 'Not sure',
      experiencesIrritation: values.experiencesIrritation || 'Not sure',
      routinePreference: values.routinePreference || 'Simple',
      monthlyBudgetINR: Number(values.monthlyBudgetINR) || 1500,
    };
    await handleFormSubmit(cleanValues);
  };

  const handleRemoveAssessment = async () => {
    try {
      setIsSubmitting(true);
      await storage.remove('bellezza_skin_profile');
      if (token && typeof updateSkinProfile === 'function') {
        await updateSkinProfile({
          assessmentCompleted: false,
          skinType: 'unknown',
          skinConcerns: [],
          skincareGoals: [],
          knownIngredientAllergies: [],
          irritationTriggers: [],
          currentRoutine: [],
        }).catch(() => null);
      }
    } catch (e) {
      console.warn('[Assessment] Reset assessment error:', e);
    } finally {
      setIsSubmitting(false);
      setResultData(null);
      setStep(1);
      handleExit();
    }
  };

  const toggleArrayItem = (currentArray, item, setFieldValue, fieldName) => {
    const exists = currentArray.includes(item);
    if (exists) {
      setFieldValue(fieldName, currentArray.filter((i) => i !== item));
    } else {
      setFieldValue(fieldName, [...currentArray, item]);
    }
  };

  // If survey is completed, render the Comprehensive Skin Assessment Results View
  if (resultData) {
    const recommendedActives = computeRecommendedActives(resultData);
    const barrierDiagnosis = getBarrierDiagnosis(resultData);
    const allergiesList = [
      ...(resultData.knownIngredientAllergies || []),
      ...(resultData.irritationTriggers || []),
      ...(resultData.fragranceSensitivity || resultData.fragranceFreePreference ? ['Synthetic Fragrance / Perfume'] : []),
    ];

    return (
      <View style={styles.container}>
        {/* Results Top Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={styles.headerIconButton}
            accessibilityLabel="Close results"
          >
            <X size={20} color={COLORS.burgundy} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerStepText}>EVIDENCE-INFORMED ANALYSIS</Text>
            <Text style={styles.headerTitle}>Personalized Skin Intelligence</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setResultData(null);
              setStep(1);
            }}
            style={styles.headerCloseButton}
            accessibilityLabel="Retake assessment"
          >
            <RotateCcw size={16} color={COLORS.burgundy} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Celebration Card */}
          <View style={[styles.resultHeroCard, SHADOWS.subtle]}>
            <View style={styles.resultCheckWrap}>
              <CheckCircle2 size={32} color={COLORS.cream} />
            </View>
            <Text style={styles.resultHeroSubtitle}>ASSESSMENT COMPLETED</Text>
            <Text style={styles.resultHeroTitle}>Your Skin Identity Breakdown</Text>
            <Text style={styles.resultHeroDesc}>
              Calibrated for your biological skin barrier, lifestyle concerns, and Indian meteorological climate conditions.
            </Text>

            {/* Classification Badges */}
            <View style={styles.resultBadgesRow}>
              <View style={styles.resultTypePill}>
                <Droplets size={14} color={COLORS.cream} />
                <Text style={styles.resultTypePillText}>
                  {resultData.skinType} Skin
                </Text>
              </View>

              <View style={styles.resultSensitivityPill}>
                <ShieldCheck size={14} color={COLORS.burgundy} />
                <Text style={styles.resultSensitivityPillText}>
                  {resultData.sensitivityLevel} Reactivity
                </Text>
              </View>

              <View style={styles.resultBudgetPill}>
                <IndianRupee size={13} color={COLORS.burgundy} />
                <Text style={styles.resultBudgetPillText}>
                  {resultData.monthlyBudgetINR ? formatInr(resultData.monthlyBudgetINR) : 'Flexible'}/mo
                </Text>
              </View>
            </View>
          </View>

          {/* Section 1: Dermatological Barrier Analysis */}
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Compass size={16} color={COLORS.burgundy} />
              <Text style={styles.resultSectionTitle}>BARRIER & PHYSIOLOGICAL EVALUATION</Text>
            </View>
            <View style={[styles.resultCard, SHADOWS.subtle]}>
              <Text style={styles.barrierAnalysisText}>{barrierDiagnosis}</Text>
            </View>
          </View>

          {/* Section 2: Targeted Active Compounds */}
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Atom size={16} color={COLORS.burgundy} />
              <Text style={styles.resultSectionTitle}>MATCHED ACTIVE COMPOUNDS</Text>
            </View>
            <Text style={styles.resultSectionSubtitle}>
              Evidence-based clinical actives matched to target your skin goals and primary concerns:
            </Text>

            <View style={styles.activesGrid}>
              {recommendedActives.map((active, idx) => (
                <View key={idx} style={[styles.activeCard, SHADOWS.subtle]}>
                  <View style={styles.activeCardHeader}>
                    <View style={styles.activeRoleBadge}>
                      <Text style={styles.activeRoleText}>{active.role.toUpperCase()}</Text>
                    </View>
                    <Sparkles size={14} color={COLORS.burgundy} />
                  </View>
                  <Text style={styles.activeName}>{active.name}</Text>
                  <Text style={styles.activeBenefit}>{active.benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 3: Primary Concerns & Goals */}
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Layers size={16} color={COLORS.burgundy} />
              <Text style={styles.resultSectionTitle}>FOCUS AREAS & ASPIRATIONS</Text>
            </View>

            <View style={[styles.resultCard, SHADOWS.subtle]}>
              <Text style={styles.groupFieldLabel}>TARGETED CONCERNS:</Text>
              <View style={styles.resultTagsWrap}>
                {resultData.skinConcerns && resultData.skinConcerns.length > 0 ? (
                  resultData.skinConcerns.map((c, i) => (
                    <View key={i} style={styles.concernTag}>
                      <Text style={styles.concernTagText}>{c}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>General skin maintenance</Text>
                )}
              </View>

              <Text style={[styles.groupFieldLabel, { marginTop: SPACING.md }]}>SKINCARE GOALS:</Text>
              <View style={styles.resultTagsWrap}>
                {resultData.skincareGoals && resultData.skincareGoals.length > 0 ? (
                  resultData.skincareGoals.map((g, i) => (
                    <View key={i} style={styles.goalTag}>
                      <Heart size={10} color={COLORS.burgundy} style={{ marginRight: 4 }} />
                      <Text style={styles.goalTagText}>{g}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Barrier longevity</Text>
                )}
              </View>
            </View>
          </View>

          {/* Section 4: Flagged Contraindications & Avoidances */}
          {allergiesList.length > 0 && (
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <AlertTriangle size={16} color={COLORS.error} />
                <Text style={[styles.resultSectionTitle, { color: COLORS.error }]}>
                  FLAGGED CONTRAINDICATIONS & TRIGGERS
                </Text>
              </View>

              <View style={[styles.resultCard, { borderColor: '#FCA5A5' }, SHADOWS.subtle]}>
                <Text style={styles.avoidNoticeText}>
                  Our product scanner and formula analyzer will actively warn you before recommending any formulation containing:
                </Text>
                <View style={styles.resultTagsWrap}>
                  {allergiesList.map((item, idx) => (
                    <View key={idx} style={styles.avoidTag}>
                      <Text style={styles.avoidTagText}>✕ {item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Section 5: Protocol Blueprint */}
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Calendar size={16} color={COLORS.burgundy} />
              <Text style={styles.resultSectionTitle}>RECOMMENDED DAILY BLUEPRINT</Text>
            </View>

            <View style={[styles.protocolCard, SHADOWS.subtle]}>
              <View style={styles.protocolHeader}>
                <Sun size={15} color={COLORS.warning} />
                <Text style={styles.protocolTitle}>Morning Photoprotection Ritual</Text>
              </View>
              <Text style={styles.protocolStepText}>1. Gentle pH-balanced Cleanser</Text>
              <Text style={styles.protocolStepText}>2. Antioxidant / Niacinamide Serum</Text>
              <Text style={styles.protocolStepText}>3. Lightweight Ceramide Hydrator</Text>
              <Text style={styles.protocolStepText}>4. Broad Spectrum SPF 50+ PA++++ (Essential)</Text>
            </View>

            <View style={[styles.protocolCard, { marginTop: SPACING.sm }, SHADOWS.subtle]}>
              <View style={styles.protocolHeader}>
                <Moon size={15} color={COLORS.burgundy} />
                <Text style={styles.protocolTitle}>Evening Nocturnal Recovery Ritual</Text>
              </View>
              <Text style={styles.protocolStepText}>1. Gentle Double Cleanse (Remove pollution & sunscreen)</Text>
              <Text style={styles.protocolStepText}>2. Targeted Renewal Active (BHA / Bio-Retinoid)</Text>
              <Text style={styles.protocolStepText}>3. Rich 3:1:1 Physiological Barrier Seal</Text>
            </View>
          </View>

          {/* Section 6: Non-Diagnostic Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Info size={16} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.disclaimerHeader}>Educational Dermatology Guidance</Text>
              <Text style={styles.disclaimerText}>
                This skin assessment provides cosmetic and educational skincare routine customization. It is non-diagnostic and does not replace the individualized medical advice of a certified dermatologist.
              </Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionBtnGroup}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Products' } })}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionBtnText}>Explore Recommended Products</Text>
              <ArrowRight size={16} color={COLORS.cream} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => router.push('/(tabs)/routine')}
              activeOpacity={0.8}
            >
              <Calendar size={16} color={COLORS.burgundy} />
              <Text style={styles.secondaryActionBtnText}>Open My Skincare Protocols</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineActionBtnText}>Go to Home Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retakeActionBtn}
              onPress={() => {
                setResultData(null);
                setStep(1);
              }}
              activeOpacity={0.7}
            >
              <RotateCcw size={14} color={COLORS.textMuted} />
              <Text style={styles.retakeActionBtnText}>Retake Assessment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeActionBtn}
              onPress={handleRemoveAssessment}
              activeOpacity={0.7}
              accessibilityLabel="Remove or reset assessment"
            >
              <X size={14} color="#C53030" />
              <Text style={styles.removeActionBtnText}>Remove / Clear Assessment Data</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handlePrevStep}
          style={styles.headerIconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={COLORS.burgundy} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerStepText}>STEP {step} OF 7</Text>
          <Text style={styles.headerTitle}>Personalized Skin Assessment</Text>
        </View>

        <TouchableOpacity
          onPress={handleExit}
          style={styles.headerCloseButton}
          accessibilityLabel="Exit assessment"
        >
          <Text style={styles.headerCloseText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${(step / 7) * 100}%` }]} />
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={skinAssessmentSchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, setFieldValue, handleSubmit, validateForm, errors }) => (
          <View style={styles.formContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* STEP 1: SKIN TYPE */}
              {step === 1 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <Sparkles size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Baseline Classification</Text>
                  </View>
                  <Text style={styles.questionTitle}>What is your primary skin type?</Text>
                  <Text style={styles.questionSubtitle}>
                    Select how your skin feels most often without heavy moisturizers. You can also select "Not sure".
                  </Text>

                  <View style={styles.optionsList}>
                    {SKIN_TYPES.map((type) => {
                      const isSelected = values.skinType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                          onPress={() => setFieldValue('skinType', type.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                              {type.title}
                            </Text>
                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </View>
                          <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                            {type.description}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 2: SKIN CONCERNS */}
              {step === 2 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <Layers size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Primary Focus Areas</Text>
                  </View>
                  <Text style={styles.questionTitle}>What skin concerns do you want to address?</Text>
                  <Text style={styles.questionSubtitle}>
                    Select all that apply. This helps us match active ingredients to your skin's unique needs.
                  </Text>

                  <View style={styles.chipsContainer}>
                    {SKIN_CONCERNS.map((concern) => {
                      const isSelected = values.skinConcerns.includes(concern);
                      return (
                        <TouchableOpacity
                          key={concern}
                          style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                          onPress={() =>
                            toggleArrayItem(values.skinConcerns, concern, setFieldValue, 'skinConcerns')
                          }
                          activeOpacity={0.7}
                        >
                          {isSelected && <Check size={14} color={COLORS.cream} style={{ marginRight: 6 }} />}
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {concern}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 3: SENSITIVITY & IRRITATION */}
              {step === 3 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <Shield size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Barrier & Reactivity</Text>
                  </View>
                  <Text style={styles.questionTitle}>How reactive or sensitive is your skin?</Text>
                  <Text style={styles.questionSubtitle}>
                    Sensitivity helps us calibrate active acid percentages and retinoid strengths safely.
                  </Text>

                  <Text style={styles.fieldLabel}>Sensitivity Level</Text>
                  <View style={styles.optionsList}>
                    {SENSITIVITY_LEVELS.map((lvl) => {
                      const isSelected = values.sensitivityLevel === lvl.id;
                      return (
                        <TouchableOpacity
                          key={lvl.id}
                          style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                          onPress={() => setFieldValue('sensitivityLevel', lvl.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                              {lvl.title}
                            </Text>
                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </View>
                          <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                            {lvl.subtitle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
                    Do you experience irritation or stinging from skincare products?
                  </Text>
                  <View style={styles.optionsList}>
                    {IRRITATION_OPTIONS.map((opt) => {
                      const isSelected = values.experiencesIrritation === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                          onPress={() => setFieldValue('experiencesIrritation', opt.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                              {opt.title}
                            </Text>
                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </View>
                          <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                            {opt.subtitle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 4: ALLERGIES & INGREDIENT TRIGGERS (SKIPPABLE) */}
              {step === 4 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <AlertCircle size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Safety & Allergies (Optional)</Text>
                  </View>
                  <Text style={styles.questionTitle}>Known ingredient allergies & triggers</Text>
                  <Text style={styles.questionSubtitle}>
                    Flag ingredients to automatically warn you when scanning or inspecting formulations. You can skip this step if you have no known allergies.
                  </Text>

                  {/* Fragrance toggle */}
                  <TouchableOpacity
                    style={[
                      styles.toggleCard,
                      values.fragranceSensitivity && styles.toggleCardActive,
                    ]}
                    onPress={() =>
                      setFieldValue('fragranceSensitivity', !values.fragranceSensitivity)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Fragrance Sensitivity</Text>
                      <Text style={styles.toggleSubtitle}>
                        Prefer strictly fragrance-free and essential-oil-free formulas.
                      </Text>
                    </View>
                    <View style={[styles.toggleSwitch, values.fragranceSensitivity && styles.toggleSwitchActive]}>
                      <View style={[styles.toggleThumb, values.fragranceSensitivity && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>

                  {/* Common Allergies */}
                  <Text style={styles.fieldLabel}>Known Ingredient Allergies</Text>
                  <View style={styles.chipsContainer}>
                    {COMMON_ALLERGIES.map((item) => {
                      const isSelected = values.knownIngredientAllergies.includes(item);
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                          onPress={() =>
                            toggleArrayItem(
                              values.knownIngredientAllergies,
                              item,
                              setFieldValue,
                              'knownIngredientAllergies'
                            )
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Custom allergy input */}
                  <View style={styles.customInputRow}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Add specific allergy (e.g. Benzoyl Peroxide)..."
                      placeholderTextColor={COLORS.textMuted}
                      value={customAllergy}
                      onChangeText={setCustomAllergy}
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        if (customAllergy.trim()) {
                          toggleArrayItem(
                            values.knownIngredientAllergies,
                            customAllergy.trim(),
                            setFieldValue,
                            'knownIngredientAllergies'
                          );
                          setCustomAllergy('');
                        }
                      }}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Irritation Triggers */}
                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Irritation Triggers</Text>
                  <View style={styles.chipsContainer}>
                    {COMMON_TRIGGERS.map((item) => {
                      const isSelected = values.irritationTriggers.includes(item);
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                          onPress={() =>
                            toggleArrayItem(
                              values.irritationTriggers,
                              item,
                              setFieldValue,
                              'irritationTriggers'
                            )
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 5: SKINCARE GOALS */}
              {step === 5 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <Heart size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Desired Outcomes</Text>
                  </View>
                  <Text style={styles.questionTitle}>What are your main skincare goals?</Text>
                  <Text style={styles.questionSubtitle}>
                    Select what you want your personalized daily regimen to achieve over the next 8–12 weeks.
                  </Text>

                  <View style={styles.chipsContainer}>
                    {SKINCARE_GOALS.map((goal) => {
                      const isSelected = values.skincareGoals.includes(goal);
                      return (
                        <TouchableOpacity
                          key={goal}
                          style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                          onPress={() =>
                            toggleArrayItem(values.skincareGoals, goal, setFieldValue, 'skincareGoals')
                          }
                          activeOpacity={0.7}
                        >
                          {isSelected && <Check size={14} color={COLORS.cream} style={{ marginRight: 6 }} />}
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {goal}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 6: CURRENT ROUTINE */}
              {step === 6 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <Droplets size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Current Regimen</Text>
                  </View>
                  <Text style={styles.questionTitle}>What products do you currently use?</Text>
                  <Text style={styles.questionSubtitle}>
                    Understanding what you already use prevents ingredient conflicts (e.g. pairing AHAs with Retinoids simultaneously).
                  </Text>

                  <View style={styles.optionsList}>
                    {ROUTINE_PRODUCTS.map((prod) => {
                      const isNone = prod === 'No current routine';
                      const isSelected = values.currentRoutine.includes(prod);

                      return (
                        <TouchableOpacity
                          key={prod}
                          style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                          onPress={() => {
                            if (isNone) {
                              setFieldValue('currentRoutine', isSelected ? [] : ['No current routine']);
                            } else {
                              const filtered = values.currentRoutine.filter((i) => i !== 'No current routine');
                              toggleArrayItem(filtered, prod, setFieldValue, 'currentRoutine');
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                              {prod}
                            </Text>
                            <View style={[styles.checkboxSquare, isSelected && styles.checkboxSquareSelected]}>
                              {isSelected && <Check size={14} color={COLORS.cream} />}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Optional current product notes */}
                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>
                    Current Favorite or Prescribed Products (Optional)
                  </Text>
                  <View style={styles.customInputRow}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Minimalist Salicylic Acid Cleanser..."
                      placeholderTextColor={COLORS.textMuted}
                      value={customProduct}
                      onChangeText={setCustomProduct}
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        if (customProduct.trim()) {
                          toggleArrayItem(
                            values.currentProducts,
                            customProduct.trim(),
                            setFieldValue,
                            'currentProducts'
                          );
                          setCustomProduct('');
                        }
                      }}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {values.currentProducts.length > 0 && (
                    <View style={styles.chipsContainer}>
                      {values.currentProducts.map((p, idx) => (
                        <View key={idx} style={styles.selectedProductChip}>
                          <Text style={styles.selectedProductText}>{p}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue(
                                'currentProducts',
                                values.currentProducts.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <Text style={styles.chipRemoveText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* STEP 7: BUDGET & INDIAN MARKET PREFERENCES */}
              {step === 7 && (
                <View style={styles.stepSection}>
                  <View style={styles.stepBadge}>
                    <IndianRupee size={14} color={COLORS.burgundy} />
                    <Text style={styles.stepBadgeText}>Budget & Market Fit</Text>
                  </View>
                  <Text style={styles.questionTitle}>Monthly budget & preferences</Text>
                  <Text style={styles.questionSubtitle}>
                    Customize recommendation filters for your monthly skincare investment in INR and Indian climate availability.
                  </Text>

                  {/* Monthly Budget Presets */}
                  <Text style={styles.fieldLabel}>Monthly Skincare Budget (INR)</Text>
                  <View style={styles.budgetPresetsRow}>
                    {BUDGET_PRESETS.map((preset) => {
                      const isSelected = values.monthlyBudgetINR === preset;
                      return (
                        <TouchableOpacity
                          key={preset}
                          style={[styles.budgetChip, isSelected && styles.budgetChipSelected]}
                          onPress={() => setFieldValue('monthlyBudgetINR', preset)}
                        >
                          <Text style={[styles.budgetText, isSelected && styles.budgetTextSelected]}>
                            ₹{preset.toLocaleString('en-IN')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Routine Depth Preference */}
                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Regimen Depth</Text>
                  <View style={styles.optionsList}>
                    {ROUTINE_PREFERENCES.map((pref) => {
                      const isSelected = values.routinePreference === pref.id;
                      return (
                        <TouchableOpacity
                          key={pref.id}
                          style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                          onPress={() => setFieldValue('routinePreference', pref.id)}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                              {pref.title}
                            </Text>
                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </View>
                          <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                            {pref.subtitle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Formulation Preferences */}
                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Formulation Style</Text>
                  <View style={styles.chipsContainer}>
                    {PRODUCT_PREFERENCES.map((pref) => {
                      const isSelected = values.productPreferences.includes(pref);
                      return (
                        <TouchableOpacity
                          key={pref}
                          style={[styles.chipButton, isSelected && styles.chipButtonSelected]}
                          onPress={() =>
                            toggleArrayItem(values.productPreferences, pref, setFieldValue, 'productPreferences')
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {pref}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* India First Preference Toggle */}
                  <TouchableOpacity
                    style={[styles.toggleCard, values.indiaFirstPreference && styles.toggleCardActive]}
                    onPress={() =>
                      setFieldValue('indiaFirstPreference', !values.indiaFirstPreference)
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Prioritize Indian Market Brands</Text>
                      <Text style={styles.toggleSubtitle}>
                        Focus on products verified for Indian humidity, UV indices, and local retailer availability.
                      </Text>
                    </View>
                    <View style={[styles.toggleSwitch, values.indiaFirstPreference && styles.toggleSwitchActive]}>
                      <View style={[styles.toggleThumb, values.indiaFirstPreference && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>

                  {/* Non-Diagnostic Disclaimer Box */}
                  <View style={styles.disclaimerBox}>
                    <Info size={18} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.disclaimerHeader}>Medical Disclaimer</Text>
                      <Text style={styles.disclaimerText}>
                        Bellezza skin assessment provides educational insights and cosmetic routine personalization. It does not provide medical diagnoses, treatment for dermatological diseases, or clinical prescriptions. Consult a board-certified dermatologist for persistent or severe skin conditions.
                      </Text>
                    </View>
                  </View>

                  {/* Easy Exit & Reset Actions */}
                  <View style={{ marginTop: SPACING.md, alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                      onPress={handleExit}
                      style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                      accessibilityLabel="Exit assessment without saving"
                    >
                      <Text style={{ ...TYPOGRAPHY.bodySmall, color: COLORS.burgundy, fontWeight: '600' }}>
                        Exit Assessment & Return Home
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleRemoveAssessment}
                      style={{ paddingVertical: 6, paddingHorizontal: 16 }}
                      accessibilityLabel="Remove and clear assessment data"
                    >
                      <Text style={{ ...TYPOGRAPHY.caption, color: '#C53030' }}>
                        Clear & Remove Assessment Data
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Sticky Action Bar */}
            <View style={styles.bottomBar}>
              {step === 4 && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => setStep(5)}
                >
                  <Text style={styles.skipButtonText}>Skip this step</Text>
                </TouchableOpacity>
              )}

              {step < 7 ? (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => handleNextStep(values, errors)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <ArrowRight size={18} color={COLORS.cream} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.continueButton, isSubmitting && { opacity: 0.7 }]}
                  onPress={() => handlePressComplete(values)}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  accessibilityLabel="Complete Assessment"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.cream} size="small" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>Complete Assessment</Text>
                      <CheckCircle2 size={18} color={COLORS.cream} />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 54 : SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerStepText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.text,
    fontSize: 15,
  },
  headerCloseButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerCloseText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.burgundy,
  },
  formContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  stepSection: {},
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  stepBadgeText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    marginLeft: 6,
    fontSize: 10,
  },
  questionTitle: {
    ...TYPOGRAPHY.headlineLarge,
    fontSize: 24,
    color: COLORS.burgundy,
    marginBottom: 6,
  },
  questionSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  fieldLabel: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  optionsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardOption: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardOptionSelected: {
    borderColor: COLORS.burgundy,
    backgroundColor: 'rgba(114, 47, 55, 0.03)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  cardTitleSelected: {
    color: COLORS.burgundy,
  },
  cardDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  cardDescriptionSelected: {
    color: COLORS.text,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.burgundy,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmWhite,
  },
  checkboxSquareSelected: {
    borderColor: COLORS.burgundy,
    backgroundColor: COLORS.burgundy,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipButtonSelected: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  chipText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    fontSize: 13,
  },
  chipTextSelected: {
    color: COLORS.cream,
    fontWeight: '600',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  toggleCardActive: {
    borderColor: COLORS.burgundy,
  },
  toggleTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.text,
    fontWeight: '700',
  },
  toggleSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.burgundy,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.warmWhite,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 13,
  },
  selectedProductChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 6,
  },
  selectedProductText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.burgundy,
    fontSize: 12,
  },
  chipRemoveText: {
    fontSize: 16,
    color: COLORS.burgundy,
    fontWeight: 'bold',
  },
  budgetPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  budgetChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  budgetChipSelected: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  budgetText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  budgetTextSelected: {
    color: COLORS.cream,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(114, 47, 55, 0.06)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
    marginTop: SPACING.md,
  },
  disclaimerHeader: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
    marginBottom: 2,
  },
  disclaimerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.warmWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skipButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  continueButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 15,
  },

  /* RESULTS VIEW STYLES */
  resultScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  resultHeroCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(114, 47, 55, 0.25)',
    marginBottom: SPACING.lg,
  },
  resultCheckWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  resultHeroSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  resultHeroTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.burgundy,
    fontSize: 22,
    marginTop: 4,
    textAlign: 'center',
  },
  resultHeroDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resultBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
  },
  resultTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  resultTypePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.cream,
    fontWeight: '700',
    fontSize: 12,
  },
  resultSensitivityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  resultSensitivityPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 12,
  },
  resultBudgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(215, 167, 177, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  resultBudgetPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 12,
  },
  resultSection: {
    marginBottom: SPACING.lg,
  },
  resultSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  resultSectionTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  resultSectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontSize: 11,
  },
  resultCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  barrierAnalysisText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontSize: 13,
  },
  activesGrid: {
    gap: SPACING.sm,
  },
  activeCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activeRoleBadge: {
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  activeRoleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontSize: 9,
    fontWeight: '700',
  },
  activeName: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
    fontSize: 15,
    marginTop: 2,
    marginBottom: 4,
  },
  activeBenefit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  groupFieldLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: 6,
  },
  resultTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  concernTag: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  concernTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(215, 167, 177, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  goalTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
    fontSize: 11,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  avoidNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  avoidTag: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  avoidTagText: {
    ...TYPOGRAPHY.caption,
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 11,
  },
  protocolCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  protocolTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  protocolStepText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
  actionBtnGroup: {
    gap: 10,
    marginTop: SPACING.md,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.burgundy,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
  },
  primaryActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 14,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1.5,
    borderColor: COLORS.burgundy,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
  secondaryActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
    fontSize: 13,
  },
  outlineActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outlineActionBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  retakeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  retakeActionBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  removeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 48, 48, 0.3)',
    backgroundColor: 'rgba(197, 48, 48, 0.05)',
  },
  removeActionBtnText: {
    ...TYPOGRAPHY.caption,
    color: '#C53030',
    fontWeight: '600',
    fontSize: 12,
  },
});
