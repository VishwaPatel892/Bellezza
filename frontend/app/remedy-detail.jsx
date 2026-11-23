import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  ShieldAlert,
  CheckCircle2,
  Info,
  BookOpen,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Droplets,
  Clock,
  RotateCcw,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { remedyService } from '../src/services/remedyService';

export default function RemedyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRemedy();
  }, [id]);

  const loadRemedy = async () => {
    try {
      setLoading(true);
      const data = await remedyService.getRemedyById(id);
      setRemedy(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load remedy details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!remedy) return;
    try {
      setSaving(true);
      if (isSaved) {
        await remedyService.unsaveRemedy(remedy._id);
        setIsSaved(false);
      } else {
        await remedyService.saveRemedy(remedy._id);
        setIsSaved(true);
        Alert.alert('Saved', 'Remedy saved to your personal skincare library.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save remedy.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.burgundy} />
        <Text style={styles.loadingText}>Loading scientific remedy details...</Text>
      </View>
    );
  }

  if (!remedy) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Remedy not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getEvidenceColor = (level) => {
    switch (level) {
      case 'Strong evidence':
        return COLORS.success;
      case 'Moderate evidence':
        return COLORS.burgundy;
      case 'Limited evidence':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <ArrowLeft size={20} color={COLORS.burgundy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Evidence-Based Remedy
        </Text>
        <TouchableOpacity
          onPress={handleToggleSave}
          disabled={saving}
          style={[styles.iconCircle, isSaved && styles.iconCircleActive]}
        >
          <Bookmark size={20} color={isSaved ? COLORS.cream : COLORS.burgundy} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        {remedy.imageUrl ? (
          <Image source={{ uri: remedy.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : null}

        {/* Title & Category */}
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{remedy.category?.toUpperCase()}</Text>
          </View>
          <View style={[styles.evidenceBadge, { borderColor: getEvidenceColor(remedy.evidenceLevel) }]}>
            <Sparkles size={11} color={getEvidenceColor(remedy.evidenceLevel)} style={{ marginRight: 4 }} />
            <Text style={[styles.evidenceBadgeText, { color: getEvidenceColor(remedy.evidenceLevel) }]}>
              {remedy.evidenceLevel}
            </Text>
          </View>
        </View>

        <Text style={styles.remedyTitle}>{remedy.name}</Text>
        <Text style={styles.remedyDescription}>{remedy.description}</Text>

        {/* Scientific Mechanism Box */}
        <View style={styles.scienceCard}>
          <View style={styles.sectionHeaderRow}>
            <BookOpen size={16} color={COLORS.burgundy} />
            <Text style={styles.sectionHeaderTitle}>DERMATOLOGICAL MECHANISM</Text>
          </View>
          <Text style={styles.scienceText}>{remedy.scientificExplanation}</Text>
          <View style={styles.evidenceExplBox}>
            <Text style={styles.evidenceExplLabel}>EVIDENCE LEVEL RATIONALE:</Text>
            <Text style={styles.evidenceExplText}>{remedy.evidenceExplanation}</Text>
          </View>
        </View>

        {/* Ingredients & Amounts */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Ingredients & Formulation</Text>
          {remedy.ingredients?.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <View style={styles.bulletDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ingredientName}>
                  {ing.name} {ing.amount ? `(${ing.amount})` : ''}
                </Text>
                {ing.purpose ? <Text style={styles.ingredientPurpose}>{ing.purpose}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Step-by-Step Instructions */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Preparation & Application</Text>
          <Text style={styles.subHeading}>Preparation:</Text>
          {remedy.preparationInstructions?.map((step, idx) => (
            <View key={`prep-${idx}`} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{idx + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <Text style={[styles.subHeading, { marginTop: SPACING.md }]}>Application:</Text>
          {remedy.applicationInstructions?.map((step, idx) => (
            <View key={`app-${idx}`} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{idx + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <View style={styles.frequencyRow}>
            <Clock size={14} color={COLORS.burgundy} />
            <Text style={styles.frequencyText}>Recommended Frequency: {remedy.frequency}</Text>
          </View>
        </View>

        {/* Safety, Warnings & Patch Testing */}
        <View style={[styles.sectionCard, styles.safetyCard]}>
          <View style={styles.sectionHeaderRow}>
            <ShieldAlert size={18} color={COLORS.error} />
            <Text style={[styles.sectionHeaderTitle, { color: COLORS.error }]}>SAFETY & CONTRAINDICATIONS</Text>
          </View>

          {remedy.allergyWarnings?.length > 0 && (
            <View style={styles.warningItem}>
              <AlertTriangle size={14} color={COLORS.error} style={{ marginTop: 2, marginRight: 6 }} />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: '700' }}>Allergy Warning: </Text>
                {remedy.allergyWarnings.join(' ')}
              </Text>
            </View>
          )}

          <View style={styles.warningItem}>
            <Info size={14} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 6 }} />
            <Text style={styles.warningText}>
              <Text style={{ fontWeight: '700' }}>Patch-Testing Protocol: </Text>
              {remedy.patchTestingGuidance}
            </Text>
          </View>

          {remedy.contraindications?.map((c, idx) => (
            <Text key={idx} style={styles.contraindicationText}>
              • {c}
            </Text>
          ))}
        </View>

        {/* References */}
        {remedy.references?.length > 0 && (
          <View style={styles.referencesCard}>
            <Text style={styles.referencesHeader}>Peer-Reviewed References</Text>
            {remedy.references.map((ref, idx) => (
              <View key={idx} style={styles.refRow}>
                <Text style={styles.refCitation}>[{idx + 1}] {ref.citation}</Text>
                <Text style={styles.refSource}>{ref.source} ({ref.publicationYear})</Text>
              </View>
            ))}
          </View>
        )}

        {/* Non-Diagnostic Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Bellezza evidence-based home remedies provide supportive cosmetic and botanical guidance. They do not replace prescribed clinical treatments for dermatological conditions such as cystic acne, eczema, or skin infections.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  backButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.full,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 52 : SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 9,
    letterSpacing: 1,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    backgroundColor: COLORS.warmWhite,
  },
  evidenceBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  remedyTitle: {
    ...TYPOGRAPHY.headlineLarge,
    fontSize: 24,
    color: COLORS.burgundy,
    marginVertical: SPACING.xs,
  },
  remedyDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  scienceCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  scienceText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  evidenceExplBox: {
    backgroundColor: 'rgba(248, 244, 231, 0.6)',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
  },
  evidenceExplLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 9,
    color: COLORS.burgundy,
    marginBottom: 2,
  },
  evidenceExplText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  cardHeading: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subHeading: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.burgundy,
    marginTop: 6,
    marginRight: 8,
  },
  ingredientName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  ingredientPurpose: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(114, 47, 55, 0.1)',
    color: COLORS.burgundy,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },
  stepText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    flex: 1,
    lineHeight: 18,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  frequencyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  safetyCard: {
    borderColor: 'rgba(235, 87, 87, 0.3)',
    backgroundColor: '#FFFAFA',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  contraindicationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  referencesCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referencesHeader: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: SPACING.xs,
  },
  refRow: {
    marginBottom: 6,
  },
  refCitation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '500',
  },
  refSource: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.burgundy,
    marginBottom: SPACING.lg,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
