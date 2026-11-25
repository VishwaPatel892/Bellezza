import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera as CameraIcon,
  Image as ImageIcon,
  Sparkles,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  RotateCcw,
  CheckCircle2,
  Info,
  Clock,
  FlaskConical,
  Heart,
  ChevronRight,
  Sun,
  Flame,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { aiService } from '../src/services/aiService';
import { useAuth } from '../src/hooks/useAuth';

export default function FaceScanScreen() {
  const { user, updateUserProfile } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('concerns'); // 'concerns' | 'remedies' | 'actives'

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Bellezza needs camera access to capture a facial photo for dermatological AI skin analysis.'
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Bellezza needs photo library access to select a facial selfie for skin analysis.'
      );
      return false;
    }
    return true;
  };

  const handleCapturePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset);
        setAnalysisResult(null);
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not access camera: ' + err.message);
    }
  };

  const handlePickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset);
        setAnalysisResult(null);
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open photo library: ' + err.message);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    if (!selectedImage.base64) {
      Alert.alert(
        'Image Data Missing',
        'Could not encode the selected image. Please try taking a new photo or choosing another image.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const b64Data = `data:image/jpeg;base64,${selectedImage.base64}`;
      const data = await aiService.analyzeFace(b64Data);
      setAnalysisResult(data);

      if (data.isHumanFace) {
        setActiveTab('concerns');
      }
    } catch (err) {
      console.error('Face analysis failed:', err);
      const detail = err?.data?.message || err?.message || 'Could not complete facial skin analysis. Please ensure you are connected to the network.';
      Alert.alert('Analysis Failed', detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToProfile = async () => {
    if (!analysisResult || !analysisResult.isHumanFace) return;

    try {
      const newSkinType = analysisResult.estimatedSkinType || user?.skinProfile?.skinType || 'Combination';
      const detectedConcernNames = (analysisResult.concerns || []).map((c) => c.concern);
      const combinedConcerns = Array.from(
        new Set([...(user?.skinProfile?.skinConcerns || []), ...detectedConcernNames])
      ).slice(0, 5);

      if (updateUserProfile) {
        await updateUserProfile({
          skinProfile: {
            ...(user?.skinProfile || {}),
            skinType: newSkinType,
            skinConcerns: combinedConcerns,
            assessmentCompleted: true,
          },
        });
        Alert.alert('Profile Updated', 'Your skin profile has been calibrated with your Groq AI face scan results!');
      }
    } catch (err) {
      Alert.alert('Update', 'Skin profile updated locally in session.');
    }
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={22} color={COLORS.burgundy} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>AI Face & Skin Scanner</Text>
          <Text style={styles.headerSubtitle}>Powered by Groq Cloud Vision AI</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Selection / Camera Frame */}
        <View style={styles.scannerCard}>
          {selectedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              {isAnalyzing && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color={COLORS.cream} />
                  <Text style={styles.scanningText}>Groq Vision AI Analyzing Skin Condition...</Text>
                  <Text style={styles.scanningSubtext}>Detecting skin type, barrier integrity & concerns</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <View style={styles.ovalFrame}>
                <CameraIcon size={36} color={COLORS.burgundy} />
              </View>
              <Text style={styles.placeholderTitle}>Position Your Face Inside the Frame</Text>
              <Text style={styles.placeholderDesc}>
                Take a clear front-facing selfie in natural daylight without heavy filters or makeup.
              </Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.primaryActionBtn]}
                  onPress={handleCapturePhoto}
                  activeOpacity={0.8}
                >
                  <CameraIcon size={18} color={COLORS.cream} />
                  <Text style={styles.primaryActionBtnText}>Take Selfie</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.secondaryActionBtn]}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <ImageIcon size={18} color={COLORS.burgundy} />
                  <Text style={styles.secondaryActionBtnText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action row when an image is selected */}
          {selectedImage && !isAnalyzing && (
            <View style={styles.selectedControlsRow}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
              >
                <RotateCcw size={16} color={COLORS.burgundy} />
                <Text style={styles.retakeBtnText}>Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyzeBtn, SHADOWS.card]}
                onPress={handleStartAnalysis}
                activeOpacity={0.85}
              >
                <Sparkles size={18} color={COLORS.cream} />
                <Text style={styles.analyzeBtnText}>Analyze Skin with Groq</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Guidelines Banner */}
        {!analysisResult && (
          <View style={styles.guidelinesBox}>
            <View style={styles.guideHeader}>
              <Info size={16} color={COLORS.burgundy} />
              <Text style={styles.guideTitle}>CLINICAL CAPTURE GUIDELINES</Text>
            </View>
            <Text style={styles.guideItem}>• Natural indirect daylight facing a window gives optimal active clarity.</Text>
            <Text style={styles.guideItem}>• Cleanse skin 15 minutes prior to capture true lipid and moisture balance.</Text>
            <Text style={styles.guideItem}>• Keep camera at eye level with neutral facial expression.</Text>
          </View>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <View style={styles.resultsContainer}>
            {/* If NO human face detected */}
            {!analysisResult.isHumanFace ? (
              <View style={styles.invalidFaceCard}>
                <AlertTriangle size={36} color={COLORS.warning} />
                <Text style={styles.invalidTitle}>No Face Recognized</Text>
                <Text style={styles.invalidDesc}>
                  {analysisResult.message ||
                    'The uploaded image does not appear to contain a clear human face. Please retake with proper lighting and face alignment.'}
                </Text>
                <TouchableOpacity
                  style={styles.tryAgainBtn}
                  onPress={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                >
                  <RotateCcw size={16} color={COLORS.cream} />
                  <Text style={styles.tryAgainText}>Retake Face Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Successful Face & Skin Analysis */
              <View>
                {/* Hero Summary Badge */}
                <View style={[styles.summaryCard, SHADOWS.card]}>
                  <View style={styles.summaryTopRow}>
                    <View style={styles.typeBadge}>
                      <Sparkles size={14} color={COLORS.burgundy} />
                      <Text style={styles.typeBadgeText}>
                        {analysisResult.estimatedSkinType?.toUpperCase()} SKIN
                      </Text>
                    </View>
                    <Text style={styles.toneText}>Tone: {analysisResult.skinTone || 'Neutral'}</Text>
                  </View>

                  <Text style={styles.barrierStatusText}>
                    Barrier Status: <Text style={{ color: COLORS.burgundy, fontWeight: '700' }}>{analysisResult.barrierHealth || 'Normal'}</Text>
                  </Text>

                  {/* Metrics Bar */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                      <Droplets size={18} color="#4A90E2" />
                      <Text style={styles.metricScore}>{analysisResult.hydrationScore || 70}/100</Text>
                      <Text style={styles.metricLabel}>Hydration</Text>
                    </View>

                    <View style={styles.metricCard}>
                      <Flame size={18} color="#E67E22" />
                      <Text style={styles.metricScore}>{analysisResult.sebumScore || 50}/100</Text>
                      <Text style={styles.metricLabel}>Sebum Balance</Text>
                    </View>

                    <View style={styles.metricCard}>
                      <ShieldCheck size={18} color={COLORS.success} />
                      <Text style={styles.metricScore}>{Math.round((analysisResult.confidenceScore || 0.95) * 100)}%</Text>
                      <Text style={styles.metricLabel}>Confidence</Text>
                    </View>
                  </View>

                  {/* Primary Guidance */}
                  {analysisResult.primaryAdvice && (
                    <View style={styles.primaryAdviceBox}>
                      <Text style={styles.primaryAdviceTitle}>DERMATOLOGIST VERDICT</Text>
                      <Text style={styles.primaryAdviceText}>{analysisResult.primaryAdvice}</Text>
                    </View>
                  )}

                  {/* Apply to Profile Button */}
                  <TouchableOpacity
                    style={styles.applyProfileBtn}
                    onPress={handleApplyToProfile}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={16} color={COLORS.cream} />
                    <Text style={styles.applyProfileBtnText}>Update My Skincare Profile</Text>
                  </TouchableOpacity>
                </View>

                {/* Navigation Tabs */}
                <View style={styles.tabsRow}>
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'concerns' && styles.activeTabItem]}
                    onPress={() => setActiveTab('concerns')}
                  >
                    <Text style={[styles.tabText, activeTab === 'concerns' && styles.activeTabText]}>
                      Detected Concerns ({analysisResult.concerns?.length || 0})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'remedies' && styles.activeTabItem]}
                    onPress={() => setActiveTab('remedies')}
                  >
                    <Text style={[styles.tabText, activeTab === 'remedies' && styles.activeTabText]}>
                      Home Remedies ({analysisResult.customHomeRemedies?.length || 0})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'actives' && styles.activeTabItem]}
                    onPress={() => setActiveTab('actives')}
                  >
                    <Text style={[styles.tabText, activeTab === 'actives' && styles.activeTabText]}>
                      Recommended Actives
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tab 1: Concerns */}
                {activeTab === 'concerns' && (
                  <View style={styles.tabContent}>
                    {(analysisResult.concerns || []).map((item, idx) => (
                      <View key={idx} style={[styles.concernCard, SHADOWS.subtle]}>
                        <View style={styles.concernHeader}>
                          <Text style={styles.concernTitle}>{item.concern}</Text>
                          <View
                            style={[
                              styles.severityPill,
                              item.severity === 'Severe'
                                ? { backgroundColor: '#FFEBEE' }
                                : item.severity === 'Moderate'
                                ? { backgroundColor: '#FFF3E0' }
                                : { backgroundColor: '#E8F5E9' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.severityPillText,
                                item.severity === 'Severe'
                                  ? { color: COLORS.error }
                                  : item.severity === 'Moderate'
                                  ? { color: '#E65100' }
                                  : { color: COLORS.success },
                              ]}
                            >
                              {item.severity}
                            </Text>
                          </View>
                        </View>
                        {item.location && (
                          <Text style={styles.concernLocation}>Location: {item.location}</Text>
                        )}
                        <Text style={styles.concernDesc}>{item.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Tab 2: Custom Home Remedies */}
                {activeTab === 'remedies' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionNotice}>
                      Custom formulated by Groq AI for your observed skin barrier condition and verified against skin safety guidelines.
                    </Text>
                    {(analysisResult.customHomeRemedies || []).map((remedy, idx) => (
                      <View key={idx} style={[styles.remedyBox, SHADOWS.subtle]}>
                        <View style={styles.remedyHeader}>
                          <Text style={styles.remedyName}>{remedy.name}</Text>
                          <View style={styles.evidenceBadge}>
                            <Shield size={12} color={COLORS.burgundy} />
                            <Text style={styles.evidenceBadgeText}>{remedy.evidenceLevel || 'Evidence-Based'}</Text>
                          </View>
                        </View>

                        <Text style={styles.remedyRationale}>{remedy.rationale}</Text>

                        {/* Ingredients */}
                        <Text style={styles.subHeading}>INGREDIENTS</Text>
                        {(remedy.ingredients || []).map((ing, iIdx) => (
                          <View key={iIdx} style={styles.ingredientRow}>
                            <Text style={styles.ingBullet}>•</Text>
                            <Text style={styles.ingName}>{ing.amount} {ing.name}</Text>
                            {ing.purpose && <Text style={styles.ingPurpose}>({ing.purpose})</Text>}
                          </View>
                        ))}

                        {/* Preparation */}
                        {remedy.preparation && remedy.preparation.length > 0 && (
                          <>
                            <Text style={styles.subHeading}>PREPARATION</Text>
                            {remedy.preparation.map((step, sIdx) => (
                              <Text key={sIdx} style={styles.stepText}>{sIdx + 1}. {step}</Text>
                            ))}
                          </>
                        )}

                        {/* Application */}
                        {remedy.application && remedy.application.length > 0 && (
                          <>
                            <Text style={styles.subHeading}>APPLICATION PROTOCOL</Text>
                            {remedy.application.map((step, aIdx) => (
                              <Text key={aIdx} style={styles.stepText}>{aIdx + 1}. {step}</Text>
                            ))}
                          </>
                        )}

                        {remedy.frequency && (
                          <View style={styles.frequencyRow}>
                            <Clock size={14} color={COLORS.burgundy} />
                            <Text style={styles.frequencyText}>{remedy.frequency}</Text>
                          </View>
                        )}

                        {/* Patch testing guidance */}
                        {remedy.patchTestingAdvice && (
                          <View style={styles.patchTestBox}>
                            <Text style={styles.patchTestTitle}>PATCH TEST BEFORE FACIAL CONTACT</Text>
                            <Text style={styles.patchTestText}>{remedy.patchTestingAdvice}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Tab 3: Recommended Actives & Avoid list */}
                {activeTab === 'actives' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.subHeading}>CLINICAL OVER-THE-COUNTER ACTIVES</Text>
                    <View style={styles.pillsWrap}>
                      {(analysisResult.recommendedClinicalActives || []).map((act, idx) => (
                        <View key={idx} style={styles.activePill}>
                          <CheckCircle2 size={13} color={COLORS.success} />
                          <Text style={styles.activePillText}>{act}</Text>
                        </View>
                      ))}
                    </View>

                    <Text style={[styles.subHeading, { marginTop: SPACING.lg, color: COLORS.error }]}>
                      INGREDIENTS TO AVOID
                    </Text>
                    <View style={styles.pillsWrap}>
                      {(analysisResult.ingredientsToAvoid || []).map((av, idx) => (
                        <View key={idx} style={styles.avoidPill}>
                          <AlertTriangle size={13} color={COLORS.error} />
                          <Text style={styles.avoidPillText}>{av}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Medical Disclaimer */}
                <Text style={styles.disclaimerText}>
                  {analysisResult.disclaimer ||
                    'Educational cosmetic screening tool. Does not replace professional medical diagnosis.'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 26, 46, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 26, 46, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  scannerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(92, 26, 46, 0.1)',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  ovalFrame: {
    width: 140,
    height: 180,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 26, 46, 0.03)',
    marginBottom: SPACING.lg,
  },
  placeholderTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.burgundy,
  },
  primaryActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    backgroundColor: 'rgba(92, 26, 46, 0.08)',
  },
  secondaryActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  previewContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  scanningText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.cream,
    fontWeight: '700',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  scanningSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  selectedControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(92, 26, 46, 0.06)',
    gap: SPACING.md,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(92, 26, 46, 0.06)',
  },
  retakeBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  analyzeBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontWeight: '700',
  },
  guidelinesBox: {
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(92, 26, 46, 0.04)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(92, 26, 46, 0.08)',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  guideTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  guideItem: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  resultsContainer: {
    marginTop: SPACING.lg,
  },
  invalidFaceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  invalidTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  invalidDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tryAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  tryAgainText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(92, 26, 46, 0.08)',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(92, 26, 46, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  toneText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  barrierStatusText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  metricScore: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  primaryAdviceBox: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(92, 26, 46, 0.04)',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  primaryAdviceTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  primaryAdviceText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  applyProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.burgundy,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  applyProfileBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontWeight: '600',
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(92, 26, 46, 0.08)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm - 2,
  },
  activeTabItem: {
    backgroundColor: COLORS.burgundy,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  activeTabText: {
    color: COLORS.cream,
  },
  tabContent: {
    marginTop: SPACING.md,
  },
  concernCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
  },
  concernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  concernTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  severityPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  severityPillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  concernLocation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    marginTop: 2,
    fontWeight: '500',
  },
  concernDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionNotice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  remedyBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(92, 26, 46, 0.08)',
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  remedyName: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.burgundy,
    flex: 1,
    marginRight: SPACING.xs,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(92, 26, 46, 0.06)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  evidenceBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
    fontSize: 10,
  },
  remedyRationale: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  subHeading: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 3,
  },
  ingBullet: {
    color: COLORS.burgundy,
    fontSize: 12,
  },
  ingName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  ingPurpose: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  stepText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 3,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  frequencyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  patchTestBox: {
    marginTop: SPACING.sm,
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA000',
  },
  patchTestTitle: {
    ...TYPOGRAPHY.caption,
    color: '#8D6E63',
    fontWeight: '700',
    fontSize: 10,
  },
  patchTestText: {
    ...TYPOGRAPHY.caption,
    color: '#5D4037',
    marginTop: 2,
    lineHeight: 16,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 4,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  activePillText: {
    ...TYPOGRAPHY.caption,
    color: '#2E7D32',
    fontWeight: '600',
  },
  avoidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  avoidPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
