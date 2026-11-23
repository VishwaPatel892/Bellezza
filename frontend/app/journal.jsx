import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Droplets,
  Flame,
  Activity,
  Columns,
  Trash2,
  Smile,
  Shield,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { journalService } from '../src/services/journalService';
import { useAuth } from '../src/hooks/useAuth';

const CONDITIONS = [
  'Radiant / Calm',
  'Balanced',
  'Dry / Flaky',
  'Congested / Breakouts',
  'Flushed / Reactive',
];

const HYDRATION_LEVELS = ['Dehydrated', 'Moderate', 'Plump / Hydrated'];
const ANGLES = ['Frontal / Full Face', 'Right Cheek', 'Left Cheek', 'Forehead / T-Zone'];

export default function JournalScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('entries'); // 'entries' | 'progress' | 'timeline' | 'photos'
  const [entries, setEntries] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [progress, setProgress] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Entry Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [overallCondition, setOverallCondition] = useState('Balanced');
  const [dryness, setDryness] = useState(2);
  const [oiliness, setOiliness] = useState(2);
  const [redness, setRedness] = useState(1);
  const [breakouts, setBreakouts] = useState(1);
  const [sensitivity, setSensitivity] = useState(1);
  const [hydrationPerception, setHydrationPerception] = useState('Moderate');
  const [notes, setNotes] = useState('');
  const [savingEntry, setSavingEntry] = useState(false);

  // Photo Upload Modal
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState(null);
  const [photoAngle, setPhotoAngle] = useState('Frontal / Full Face');
  const [photoNotes, setPhotoNotes] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Photo Compare Modal
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [comparePhotoA, setComparePhotoA] = useState(null);
  const [comparePhotoB, setComparePhotoB] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [entriesData, timelineData, progressData, photosData] = await Promise.all([
        journalService.getEntries({ limit: 20 }),
        journalService.getTimeline(),
        journalService.getProgress(),
        journalService.getPhotos(),
      ]);

      setEntries(entriesData?.entries || []);
      setTimeline(timelineData || []);
      setProgress(progressData || null);
      setPhotos(photosData || []);
    } catch (err) {
      console.warn('Error loading journal data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    try {
      setSavingEntry(true);
      const payload = {
        date: new Date().toISOString().split('T')[0],
        overallCondition,
        dryness,
        oiliness,
        redness,
        breakouts,
        sensitivity,
        hydrationPerception,
        notes,
      };

      await journalService.createEntry(payload);
      setModalVisible(false);
      setNotes('');
      Alert.alert('Entry Saved', 'Your daily skin check-in has been logged.');
      await loadAllData();
    } catch (err) {
      Alert.alert('Save Error', err.message || 'Could not save journal entry.');
    } finally {
      setSavingEntry(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Media library access is required to attach progress photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedPhotoUri(result.assets[0].uri);
        setPhotoModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Image Picker Error', err.message);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedPhotoUri) return;
    try {
      setUploadingPhoto(true);
      await journalService.savePhoto({
        photoUri: selectedPhotoUri,
        angle: photoAngle,
        notes: photoNotes,
        date: new Date().toISOString().split('T')[0],
      });
      setPhotoModalVisible(false);
      setSelectedPhotoUri(null);
      setPhotoNotes('');
      Alert.alert('Photo Saved', 'Progress photo stored in your private gallery.');
      await loadAllData();
    } catch (err) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = (photoId) => {
    Alert.alert('Delete Photo', 'Permanently remove this progress photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await journalService.deletePhoto(photoId);
          loadAllData();
        },
      },
    ]);
  };

  const renderRatingPills = (value, setter, max = 5) => {
    return (
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((lvl) => {
          const isSelected = value === lvl;
          return (
            <TouchableOpacity
              key={lvl}
              style={[styles.ratingPill, isSelected && styles.ratingPillSelected]}
              onPress={() => setter(lvl)}
            >
              <Text style={[styles.ratingPillText, isSelected && styles.ratingPillTextSelected]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <ArrowLeft size={20} color={COLORS.burgundy} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerSubtitle}>BARRIER OBSERVATION & EVOLUTION</Text>
          <Text style={styles.headerTitle}>Skin Journal</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.iconCircle, styles.addBtnCircle]}>
          <Plus size={20} color={COLORS.cream} />
        </TouchableOpacity>
      </View>

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.subTab, activeTab === 'entries' && styles.subTabActive]}
          onPress={() => setActiveTab('entries')}
        >
          <Text style={[styles.subTabText, activeTab === 'entries' && styles.subTabTextActive]}>
            Check-Ins
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeTab === 'progress' && styles.subTabActive]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.subTabText, activeTab === 'progress' && styles.subTabTextActive]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeTab === 'timeline' && styles.subTabActive]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.subTabText, activeTab === 'timeline' && styles.subTabTextActive]}>
            Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeTab === 'photos' && styles.subTabActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.subTabText, activeTab === 'photos' && styles.subTabTextActive]}>
            Photos ({photos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.burgundy} />
          <Text style={styles.loadingText}>Syncing journal logs & photos...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: ENTRIES LIST */}
          {activeTab === 'entries' && (
            <View>
              {/* Daily Check-In Prompt Card */}
              <TouchableOpacity
                style={[styles.quickCheckInCard, SHADOWS.card]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.quickCheckInIcon}>
                  <Sparkles size={20} color={COLORS.cream} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickCheckInTitle}>Today's Skin Check-In</Text>
                  <Text style={styles.quickCheckInSubtitle}>
                    Log hydration, oiliness, and blemish counts for {new Date().toLocaleDateString('en-IN')}.
                  </Text>
                </View>
                <Plus size={20} color={COLORS.burgundy} />
              </TouchableOpacity>

              {entries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Smile size={32} color={COLORS.dustyPink} />
                  <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Track your skin condition daily to identify trends and active tolerance.
                  </Text>
                </View>
              ) : (
                entries.map((entry) => (
                  <View key={entry._id} style={[styles.entryCard, SHADOWS.subtle]}>
                    <View style={styles.entryHeader}>
                      <View style={styles.conditionTag}>
                        <Text style={styles.conditionTagText}>{entry.overallCondition}</Text>
                      </View>
                      <Text style={styles.entryDate}>{entry.date}</Text>
                    </View>

                    {/* Metric Micro Pills */}
                    <View style={styles.microMetricsRow}>
                      <View style={styles.microMetric}>
                        <Text style={styles.microLabel}>Dryness</Text>
                        <Text style={styles.microValue}>{entry.dryness}/5</Text>
                      </View>
                      <View style={styles.microMetric}>
                        <Text style={styles.microLabel}>Oiliness</Text>
                        <Text style={styles.microValue}>{entry.oiliness}/5</Text>
                      </View>
                      <View style={styles.microMetric}>
                        <Text style={styles.microLabel}>Breakouts</Text>
                        <Text style={styles.microValue}>{entry.breakouts}/5</Text>
                      </View>
                      <View style={styles.microMetric}>
                        <Text style={styles.microLabel}>Redness</Text>
                        <Text style={styles.microValue}>{entry.redness}/5</Text>
                      </View>
                    </View>

                    {entry.notes ? <Text style={styles.entryNotes}>"{entry.notes}"</Text> : null}
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 2: PROGRESS ANALYTICS */}
          {activeTab === 'progress' && (
            <View>
              {progress ? (
                <>
                  {/* Trajectory Banner */}
                  <View style={[styles.trajectoryCard, SHADOWS.card]}>
                    <TrendingUp size={24} color={COLORS.burgundy} />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text style={styles.trajectoryTitle}>Trajectory: {progress.trajectory}</Text>
                      <Text style={styles.trajectoryInsight}>{progress.insight}</Text>
                    </View>
                  </View>

                  {/* Summary Metric Grid */}
                  <View style={styles.analyticsGrid}>
                    <View style={[styles.analyticsCell, SHADOWS.subtle]}>
                      <Text style={styles.analyticsCellNumber}>{progress.consistencyScore}%</Text>
                      <Text style={styles.analyticsCellLabel}>14-Day Consistency</Text>
                    </View>
                    <View style={[styles.analyticsCell, SHADOWS.subtle]}>
                      <Text style={styles.analyticsCellNumber}>{progress.averages?.breakouts || 1}</Text>
                      <Text style={styles.analyticsCellLabel}>Avg Breakout Score</Text>
                    </View>
                    <View style={[styles.analyticsCell, SHADOWS.subtle]}>
                      <Text style={styles.analyticsCellNumber}>{progress.averages?.dryness || 2}</Text>
                      <Text style={styles.analyticsCellLabel}>Avg Dryness Score</Text>
                    </View>
                    <View style={[styles.analyticsCell, SHADOWS.subtle]}>
                      <Text style={styles.analyticsCellNumber}>{progress.averages?.oiliness || 2}</Text>
                      <Text style={styles.analyticsCellLabel}>Avg Oiliness Score</Text>
                    </View>
                  </View>

                  {/* Trend History List */}
                  <View style={styles.trendListCard}>
                    <Text style={styles.trendListHeader}>Recent Daily Ratings (1-5 Scale)</Text>
                    {progress.trendHistory?.slice(-7).map((t, idx) => (
                      <View key={idx} style={styles.trendRow}>
                        <Text style={styles.trendDate}>{t.date}</Text>
                        <View style={styles.trendBarsRow}>
                          <Text style={styles.trendBarText}>Dry: {t.dryness}</Text>
                          <Text style={styles.trendBarText}>Oil: {t.oiliness}</Text>
                          <Text style={[styles.trendBarText, { color: COLORS.error }]}>Blemishes: {t.breakouts}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.emptySubtitle}>Log at least 2 entries to view progress analytics.</Text>
              )}
            </View>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <View style={styles.timelineWrapper}>
              {timeline.length === 0 ? (
                <Text style={styles.emptySubtitle}>Timeline will generate as you record check-ins and routines.</Text>
              ) : (
                timeline.map((event, idx) => (
                  <View key={event.id || idx} style={styles.timelineItem}>
                    <View style={styles.timelineNode}>
                      <View style={styles.timelineDot} />
                      {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={[styles.timelineCard, SHADOWS.subtle]}>
                      <Text style={styles.timelineDate}>{event.date}</Text>
                      <Text style={styles.timelineTitle}>{event.title}</Text>
                      <Text style={styles.timelineDescription}>{event.description}</Text>
                      {event.photoUri && (
                        <Image source={{ uri: event.photoUri }} style={styles.timelineThumb} />
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: PROGRESS PHOTOS */}
          {activeTab === 'photos' && (
            <View>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage}>
                  <Camera size={16} color={COLORS.cream} />
                  <Text style={styles.addPhotoBtnText}>Upload Photo</Text>
                </TouchableOpacity>

                {photos.length >= 2 && (
                  <TouchableOpacity
                    style={styles.compareBtn}
                    onPress={() => {
                      setComparePhotoA(photos[0]);
                      setComparePhotoB(photos[photos.length - 1]);
                      setCompareModalVisible(true);
                    }}
                  >
                    <Columns size={16} color={COLORS.burgundy} />
                    <Text style={styles.compareBtnText}>Compare Dates</Text>
                  </TouchableOpacity>
                )}
              </View>

              {photos.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Camera size={32} color={COLORS.dustyPink} />
                  <Text style={styles.emptyTitle}>Private Progress Gallery</Text>
                  <Text style={styles.emptySubtitle}>
                    Capture consistent weekly photos in natural daylight to observe barrier changes over 8–12 weeks. Photos remain encrypted and private.
                  </Text>
                </View>
              ) : (
                <View style={styles.photosGrid}>
                  {photos.map((p) => (
                    <View key={p._id} style={[styles.photoCard, SHADOWS.subtle]}>
                      <Image source={{ uri: p.photoUri }} style={styles.gridImage} resizeMode="cover" />
                      <View style={styles.photoMeta}>
                        <Text style={styles.photoDate}>{p.date}</Text>
                        <Text style={styles.photoAngle}>{p.angle}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.photoDeleteBtn}
                        onPress={() => handleDeletePhoto(p._id)}
                      >
                        <Trash2 size={14} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}

      {/* NEW CHECK-IN ENTRY MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Skin Check-In</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              <Text style={styles.formLabel}>Overall Skin State</Text>
              <View style={styles.conditionOptionsWrap}>
                {CONDITIONS.map((cond) => {
                  const isSelected = overallCondition === cond;
                  return (
                    <TouchableOpacity
                      key={cond}
                      style={[styles.condPill, isSelected && styles.condPillActive]}
                      onPress={() => setOverallCondition(cond)}
                    >
                      <Text style={[styles.condPillText, isSelected && styles.condPillTextActive]}>
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Dryness Rating (1 = Supple, 5 = Flaking / Tight)</Text>
              {renderRatingPills(dryness, setDryness)}

              <Text style={styles.formLabel}>Oiliness Rating (1 = Matte, 5 = Highly Shiny)</Text>
              {renderRatingPills(oiliness, setOiliness)}

              <Text style={styles.formLabel}>Blemish Count / Breakouts (1 = None, 5 = Active Clusters)</Text>
              {renderRatingPills(breakouts, setBreakouts)}

              <Text style={styles.formLabel}>Sensitivity / Stinging (1 = Calm, 5 = Burning / Flushed)</Text>
              {renderRatingPills(sensitivity, setSensitivity)}

              <Text style={styles.formLabel}>Hydration Perception</Text>
              <View style={styles.ratingRow}>
                {HYDRATION_LEVELS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.condPill, hydrationPerception === h && styles.condPillActive]}
                    onPress={() => setHydrationPerception(h)}
                  >
                    <Text style={[styles.condPillText, hydrationPerception === h && styles.condPillTextActive]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Observations & Notes</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Noticed any changes after adding a new active or climate shift?..."
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, savingEntry && { opacity: 0.7 }]}
              onPress={handleSaveEntry}
              disabled={savingEntry}
            >
              {savingEntry ? (
                <ActivityIndicator color={COLORS.cream} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Log Check-In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PHOTO UPLOAD MODAL */}
      <Modal visible={photoModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Progress Photo</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedPhotoUri && (
              <Image source={{ uri: selectedPhotoUri }} style={styles.previewImage} />
            )}

            <Text style={styles.formLabel}>Capture Angle</Text>
            <View style={styles.conditionOptionsWrap}>
              {ANGLES.map((ang) => (
                <TouchableOpacity
                  key={ang}
                  style={[styles.condPill, photoAngle === ang && styles.condPillActive]}
                  onPress={() => setPhotoAngle(ang)}
                >
                  <Text style={[styles.condPillText, photoAngle === ang && styles.condPillTextActive]}>
                    {ang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.singleInput}
              placeholder="e.g. Week 4 post-niacinamide introduction"
              placeholderTextColor={COLORS.textMuted}
              value={photoNotes}
              onChangeText={setPhotoNotes}
            />

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSavePhoto}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator color={COLORS.cream} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Save to Private Journal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SIDE-BY-SIDE PHOTO COMPARISON MODAL */}
      <Modal visible={compareModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Before & After Comparison</Text>
              <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.compareRow}>
              {comparePhotoA && (
                <View style={styles.compareCol}>
                  <Text style={styles.compareDateLabel}>Date: {comparePhotoA.date}</Text>
                  <Image source={{ uri: comparePhotoA.photoUri }} style={styles.compareImage} />
                  <Text style={styles.compareNote}>{comparePhotoA.angle}</Text>
                </View>
              )}

              {comparePhotoB && (
                <View style={styles.compareCol}>
                  <Text style={styles.compareDateLabel}>Date: {comparePhotoB.date}</Text>
                  <Image source={{ uri: comparePhotoB.photoUri }} style={styles.compareImage} />
                  <Text style={styles.compareNote}>{comparePhotoB.angle}</Text>
                </View>
              )}
            </View>

            <Text style={styles.compareNotice}>
              Notice: Cutaneous changes emerge gradually over 28–56 day skin cell turnover cycles. Natural lighting consistency ensures valid visual comparisons.
            </Text>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { marginTop: SPACING.md }]}
              onPress={() => setCompareModalVisible(false)}
            >
              <Text style={styles.modalSubmitBtnText}>Close Comparison</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtnCircle: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.overline,
    fontSize: 9,
    color: COLORS.burgundy,
    letterSpacing: 1.2,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.text,
    fontSize: 16,
  },
  tabNavRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    gap: 6,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subTabActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  subTabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  subTabTextActive: {
    color: COLORS.cream,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  quickCheckInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 47, 55, 0.25)',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  quickCheckInIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCheckInTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  quickCheckInSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  entryCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conditionTag: {
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  conditionTagText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.burgundy,
    fontSize: 11,
  },
  entryDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  microMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 244, 231, 0.5)',
    borderRadius: RADIUS.sm,
    padding: 6,
    marginVertical: 4,
  },
  microMetric: {
    alignItems: 'center',
    flex: 1,
  },
  microLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  microValue: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  entryNotes: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  trajectoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
    marginBottom: SPACING.md,
  },
  trajectoryTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  trajectoryInsight: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  analyticsCell: {
    width: '48%',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analyticsCellNumber: {
    ...TYPOGRAPHY.headlineLarge,
    fontSize: 22,
    color: COLORS.burgundy,
  },
  analyticsCellLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  trendListCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trendListHeader: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: SPACING.sm,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  trendDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 11,
  },
  trendBarsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trendBarText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  timelineWrapper: {
    paddingLeft: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineNode: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.burgundy,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(114, 47, 55, 0.2)',
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  timelineTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
  },
  timelineDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  timelineThumb: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addPhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  addPhotoBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 12,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.burgundy,
    gap: 6,
  },
  compareBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
    fontSize: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoCard: {
    width: '48%',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  photoMeta: {
    padding: SPACING.xs,
  },
  photoDate: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
    color: COLORS.text,
  },
  photoAngle: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.burgundy,
    fontSize: 18,
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  conditionOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  condPill: {
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  condPillActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  condPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
  },
  condPillTextActive: {
    color: COLORS.cream,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  ratingPill: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingPillSelected: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  ratingPillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingPillTextSelected: {
    color: COLORS.cream,
  },
  textArea: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    color: COLORS.text,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  singleInput: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalSubmitBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 14,
  },
  compareRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  compareCol: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compareDateLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
    color: COLORS.burgundy,
    marginBottom: 4,
  },
  compareImage: {
    width: '100%',
    height: 150,
    borderRadius: RADIUS.sm,
  },
  compareNote: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  compareNotice: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
});
