import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  Edit2,
  Bell,
  Flame,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';
import { CustomInput } from '../../src/components/common/CustomInput';
import { routineService, FALLBACK_ROUTINES } from '../../src/services/routineService';
import { notificationService } from '../../src/services/notificationService';

const stepValidationSchema = Yup.object().shape({
  name: Yup.string().trim().min(2, 'Name too short').required('Step name is required'),
  instruction: Yup.string().trim().max(120, 'Max 120 characters'),
});

export default function RoutineScreen() {
  const [activeTab, setActiveTab] = useState('morning'); // 'morning' | 'evening'
  const [routines, setRoutines] = useState(FALLBACK_ROUTINES);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  // Notification States
  const [morningReminderEnabled, setMorningReminderEnabled] = useState(true);
  const [eveningReminderEnabled, setEveningReminderEnabled] = useState(true);

  // Fetch routines and statistics from backend
  const loadRoutineData = useCallback(async () => {
    try {
      const [fetchedRoutines, fetchedStats] = await Promise.all([
        routineService.getRoutines(),
        routineService.getStatistics(),
      ]);
      if (Array.isArray(fetchedRoutines) && fetchedRoutines.length > 0) {
        setRoutines(fetchedRoutines);
      }
      if (fetchedStats) {
        setStatistics(fetchedStats);
      }
    } catch (err) {
      console.warn('Failed to fetch routines:', err.message);
    }
  }, []);

  useEffect(() => {
    loadRoutineData();
  }, [loadRoutineData]);

  // Current active routine
  const currentRoutine =
    routines.find((r) => r.timeOfDay === activeTab) ||
    routines.find((r) => r.timeOfDay?.toLowerCase() === activeTab) ||
    routines[0];

  const currentSteps = currentRoutine?.steps || [];
  const completedCount = currentSteps.filter((s) => s.isCompleted || s.done).length;
  const totalCount = currentSteps.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleStepDone = async (stepNumber) => {
    if (!currentRoutine?._id) return;
    try {
      // Optimistic update
      setRoutines((prev) =>
        prev.map((r) => {
          if (r._id === currentRoutine._id) {
            return {
              ...r,
              steps: r.steps.map((s) =>
                s.stepNumber === stepNumber ? { ...s, isCompleted: !s.isCompleted } : s
              ),
            };
          }
          return r;
        })
      );
      await routineService.toggleStep(currentRoutine._id, stepNumber);
    } catch (err) {
      console.warn('Step toggle error:', err.message);
    }
  };

  const handleCompleteFullRoutine = async () => {
    if (!currentRoutine?._id) return;
    try {
      setLoading(true);
      const res = await routineService.completeRoutine(currentRoutine._id, {
        completedSteps: currentSteps.map((s) => s.stepNumber),
      });
      Alert.alert(
        'Ritual Completed ✨',
        res.message || 'Great consistency! Your skin barrier is supported for today.'
      );
      loadRoutineData();
    } catch (err) {
      Alert.alert('Protocol Logged', 'Routine completed locally for today!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMorningReminder = async (enabled) => {
    setMorningReminderEnabled(enabled);
    if (enabled) {
      await notificationService.requestPermissions();
      await notificationService.scheduleMorningReminder(8, 0);
      Alert.alert('Reminder Set', 'Daily morning skincare reminder scheduled for 08:00 AM IST.');
    } else {
      await notificationService.cancelAll();
    }
  };

  const handleToggleEveningReminder = async (enabled) => {
    setEveningReminderEnabled(enabled);
    if (enabled) {
      await notificationService.requestPermissions();
      await notificationService.scheduleEveningReminder(21, 0);
      Alert.alert('Reminder Set', 'Daily nocturnal skin recovery reminder scheduled for 09:00 PM IST.');
    } else {
      await notificationService.cancelAll();
    }
  };

  const handleDeleteStep = (stepNumber) => {
    Alert.alert('Remove Step', 'Are you sure you want to remove this ritual step?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setRoutines((prev) =>
            prev.map((r) => {
              if (r._id === currentRoutine._id) {
                return {
                  ...r,
                  steps: r.steps
                    .filter((s) => s.stepNumber !== stepNumber)
                    .map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
                };
              }
              return r;
            })
          );
        },
      },
    ]);
  };

  const handleOpenAddModal = () => {
    setEditingStep(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (step) => {
    setEditingStep(step);
    setModalVisible(true);
  };

  const handleSaveStep = (values, { resetForm }) => {
    if (editingStep) {
      setRoutines((prev) =>
        prev.map((r) => {
          if (r._id === currentRoutine._id) {
            return {
              ...r,
              steps: r.steps.map((s) =>
                s.stepNumber === editingStep.stepNumber
                  ? {
                      ...s,
                      title: values.name.trim(),
                      productName: values.name.trim(),
                      instructions: values.instruction.trim(),
                    }
                  : s
              ),
            };
          }
          return r;
        })
      );
    } else {
      const newStep = {
        stepNumber: currentSteps.length + 1,
        title: values.name.trim(),
        productName: values.name.trim(),
        category: 'treatment',
        instructions: values.instruction ? values.instruction.trim() : '',
        isCompleted: false,
      };
      setRoutines((prev) =>
        prev.map((r) => {
          if (r._id === currentRoutine._id) {
            return {
              ...r,
              steps: [...r.steps, newStep],
            };
          }
          return r;
        })
      );
    }
    resetForm();
    setModalVisible(false);
  };

  return (
    <ScreenContainer padded={false} style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>DAILY PROTOCOLS & REMINDERS</Text>
          <Text style={styles.headerTitle}>My Routine</Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAddModal}
          style={styles.addBtn}
          accessibilityLabel="Add Step"
        >
          <Plus size={18} color={COLORS.cream} />
        </TouchableOpacity>
      </View>

      {/* Routine Type Switcher Tabs */}
      <View style={styles.tabsWrap}>
        <TouchableOpacity
          onPress={() => setActiveTab('morning')}
          style={[styles.tab, activeTab === 'morning' && styles.activeTab]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'morning' }}
        >
          <Sun
            size={16}
            color={activeTab === 'morning' ? COLORS.burgundy : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'morning' && styles.activeTabText,
            ]}
          >
            Morning Protocol
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('evening')}
          style={[styles.tab, activeTab === 'evening' && styles.activeTab]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'evening' }}
        >
          <Moon
            size={16}
            color={activeTab === 'evening' ? COLORS.burgundy : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'evening' && styles.activeTabText,
            ]}
          >
            Evening Protocol
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Streak & Consistency Banner */}
        <View style={[styles.statsCard, SHADOWS.subtle]}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Flame size={16} color={COLORS.burgundy} />
                <Text style={styles.statNumber}>
                  {statistics?.streakDays ?? currentRoutine?.streakDays ?? 3} Days
                </Text>
              </View>
              <Text style={styles.statLabel}>Active Streak</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Award size={16} color={COLORS.burgundy} />
                <Text style={styles.statNumber}>
                  {statistics?.consistencyPercentage ?? 85}%
                </Text>
              </View>
              <Text style={styles.statLabel}>7-Day Consistency</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Calendar size={16} color={COLORS.burgundy} />
                <Text style={styles.statNumber}>
                  {statistics?.totalCompleted ?? 12}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Rituals</Text>
            </View>
          </View>
        </View>

        {/* Reminder Settings Pill */}
        <View style={styles.reminderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Bell size={16} color={COLORS.burgundy} />
            <View>
              <Text style={styles.reminderTitle}>
                {activeTab === 'morning' ? 'Morning Reminder (08:00 AM)' : 'Evening Reminder (09:00 PM)'}
              </Text>
              <Text style={styles.reminderSubtitle}>Push notification to adhere to routine</Text>
            </View>
          </View>
          <Switch
            value={activeTab === 'morning' ? morningReminderEnabled : eveningReminderEnabled}
            onValueChange={
              activeTab === 'morning' ? handleToggleMorningReminder : handleToggleEveningReminder
            }
            trackColor={{ true: COLORS.burgundy, false: COLORS.border }}
            thumbColor={COLORS.warmWhite}
          />
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, SHADOWS.subtle]}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressTitle}>Completion Progress</Text>
            <Text style={styles.progressPercent}>
              {completedCount} / {totalCount} Done ({Math.round(progressPercent)}%)
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {progressPercent === 100
              ? '✨ Protocol fully checked for today! Tap below to record completion.'
              : 'Tap each checkbox as you apply each cosmetic active.'}
          </Text>

          {progressPercent === 100 ? (
            <TouchableOpacity
              style={styles.completeRitualBtn}
              onPress={handleCompleteFullRoutine}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.cream} />
              ) : (
                <>
                  <Sparkles size={16} color={COLORS.cream} />
                  <Text style={styles.completeRitualBtnText}>Log Today's Ritual</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Steps List */}
        <View style={styles.stepsContainer}>
          {currentSteps.map((step) => {
            const isDone = step.isCompleted || step.done;
            return (
              <View key={step.stepNumber} style={[styles.stepCard, SHADOWS.subtle]}>
                <TouchableOpacity
                  onPress={() => toggleStepDone(step.stepNumber)}
                  style={styles.checkboxTouch}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={`Mark step ${step.title || step.name} complete`}
                >
                  {isDone ? (
                    <CheckCircle2 size={22} color={COLORS.success} fill="#E6F4EA" />
                  ) : (
                    <Circle size={22} color={COLORS.border} />
                  )}
                </TouchableOpacity>

                <View style={styles.stepInfo}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>
                      STEP {step.stepNumber} • {step.category?.toUpperCase() || 'CARE'}
                    </Text>
                  </View>
                  <Text style={[styles.stepName, isDone && styles.stepNameDone]}>
                    {step.title || step.productName || step.name}
                  </Text>
                  {step.instructions || step.instruction ? (
                    <Text style={styles.stepInstruction}>
                      {step.instructions || step.instruction}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenEditModal(step)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Edit step"
                  >
                    <Edit2 size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteStep(step.stepNumber)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Delete step"
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add Step Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAddModal}
          style={styles.addStepDashedBtn}
        >
          <Plus size={18} color={COLORS.burgundy} style={{ marginRight: 6 }} />
          <Text style={styles.addStepDashedText}>Add Another Step</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal for Add / Edit Step */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingStep ? 'Edit Routine Step' : 'Add New Step'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Formik
              initialValues={{
                name: editingStep?.title || editingStep?.productName || editingStep?.name || '',
                instruction: editingStep?.instructions || editingStep?.instruction || '',
              }}
              validationSchema={stepValidationSchema}
              onSubmit={handleSaveStep}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <CustomInput
                    label="Product or Step Name"
                    placeholder="e.g. Ceramide Barrier Cream"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                  />

                  <CustomInput
                    label="Usage Notes (Optional)"
                    placeholder="e.g. 2 pumps, press into skin after serum"
                    value={values.instruction}
                    onChangeText={handleChange('instruction')}
                    onBlur={handleBlur('instruction')}
                    error={touched.instruction && errors.instruction}
                  />

                  <PrimaryButton
                    title={editingStep ? 'Update Step' : 'Save to Protocol'}
                    onPress={handleSubmit}
                    style={{ marginTop: SPACING.sm }}
                  />
                </View>
              )}
            </Formik>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 26,
    color: COLORS.burgundy,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrap: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: 8,
    marginVertical: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.warmWhite,
    borderColor: COLORS.burgundy,
    borderWidth: 1.5,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  statsCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 14,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderSubtle,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginBottom: SPACING.md,
  },
  reminderTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  reminderSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  progressCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
  },
  progressPercent: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.full,
  },
  progressHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  completeRitualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.burgundy,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  completeRitualBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 12,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: SPACING.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  checkboxTouch: {
    marginRight: SPACING.sm + 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepNumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  stepNumText: {
    ...TYPOGRAPHY.overline,
    fontSize: 8,
    color: COLORS.dustyPink,
  },
  stepName: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  stepNameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  stepInstruction: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: SPACING.sm,
  },
  actionBtn: {
    padding: 4,
  },
  addStepDashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.burgundy,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    backgroundColor: 'rgba(114, 47, 55, 0.03)',
  },
  addStepDashedText: {
    ...TYPOGRAPHY.button,
    color: COLORS.burgundy,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(41, 35, 38, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.headingMedium,
    color: COLORS.burgundy,
  },
});
