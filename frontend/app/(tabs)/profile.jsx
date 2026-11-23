import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  User,
  Sparkles,
  Bookmark,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  FlaskConical,
  Heart,
  Droplets,
  X,
  Trash2,
  Lock,
  Download,
  MapPin,
  CheckCircle2,
  FileText,
  Phone,
  IndianRupee,
  Info,
  Layers,
  ArrowRight,
  Camera,
  BookOpen,
  Leaf,
  GitCompare,
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { userService } from '../../src/services/userService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';
import { CustomInput } from '../../src/components/common/CustomInput';
import { INDIAN_CITIES } from '../../src/constants/indianMarket';
import { isValidIndianPhone, formatIndianPhone, formatInr, formatIndianDate } from '../../src/utils/formatters';

const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];
const COMMON_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Dehydration', 'Sensitivity', 'Dullness'];

const profileSchema = Yup.object().shape({
  name: Yup.string().trim().min(2, 'Name too short').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().test('is-indian-phone', 'Enter a valid 10-digit Indian mobile number', (val) => {
    if (!val) return true; // optional
    return isValidIndianPhone(val);
  }),
});

export default function ProfileScreen() {
  const { user, updateProfile, updateSkinProfile, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [skinProfileModalVisible, setSkinProfileModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportedData, setExportedData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [morningNotification, setMorningNotification] = useState(user?.morningReminder ?? true);
  const [eveningNotification, setEveningNotification] = useState(user?.eveningReminder ?? true);

  // DPDP Consent States
  const [consentSkin, setConsentSkin] = useState(user?.dpdpConsent?.skinProfileConsent ?? true);
  const [consentLocation, setConsentLocation] = useState(user?.dpdpConsent?.locationConsent ?? false);
  const [consentAnalytics, setConsentAnalytics] = useState(user?.dpdpConsent?.analyticsConsent ?? false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Bellezza?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSaveBasicProfile = async (values) => {
    try {
      await updateProfile({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        preferredCity: values.preferredCity,
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Update Failed', err?.message || 'Could not update profile.');
    }
  };

  const handleToggleConsent = async (field, value) => {
    try {
      const updates = {
        skinProfileConsent: field === 'skin' ? value : consentSkin,
        locationConsent: field === 'location' ? value : consentLocation,
        analyticsConsent: field === 'analytics' ? value : consentAnalytics,
      };
      if (field === 'skin') setConsentSkin(value);
      if (field === 'location') setConsentLocation(value);
      if (field === 'analytics') setConsentAnalytics(value);

      await userService.updateConsent(updates);
    } catch (err) {
      console.warn('Consent update failed:', err.message);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await userService.exportUserData();
      setExportedData(data);
      setExportModalVisible(true);
    } catch (err) {
      Alert.alert('Export Error', err?.message || 'Could not export user data.');
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateSkinType = async (type) => {
    try {
      await updateSkinProfile({ skinType: type });
    } catch (err) {
      console.warn('Skin type update fallback:', err.message);
    }
  };

  const handleToggleConcern = async (concern) => {
    const current = user?.skinProfile?.skinConcerns || user?.skinConcerns || [];
    const updated = current.includes(concern)
      ? current.filter((c) => c !== concern)
      : [...current, concern];
    try {
      await updateSkinProfile({ skinConcerns: updated });
    } catch (err) {
      console.warn('Skin concerns update fallback:', err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Password Required', 'Please enter your password to confirm deletion.');
      return;
    }
    setDeleting(true);
    try {
      await userService.deleteAccount(deletePassword);
      await logout();
      setDeleteModalVisible(false);
      Alert.alert('Account Deleted', 'Your account and personal data have been permanently purged per DPDP Act.');
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Deletion Failed', err?.message || 'Incorrect password.');
    } finally {
      setDeleting(false);
    }
  };

  const savedProductsCount = user?.savedProducts?.length || 0;
  const savedIngredientsCount = user?.savedIngredients?.length || 0;

  return (
    <ScreenContainer padded={false} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>ACCOUNT & COMPLIANCE</Text>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={[styles.profileHeroCard, SHADOWS.subtle]}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.userName}>{user?.name || 'Bellezza Member'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            {user?.phoneNumber ? (
              <Text style={styles.userPhone}>
                <Phone size={11} color={COLORS.textSecondary} /> {formatIndianPhone(user.phoneNumber)}
              </Text>
            ) : null}
            <View style={styles.membershipTag}>
              <Sparkles size={10} color={COLORS.burgundy} />
              <Text style={styles.membershipText}>
                {user?.preferredCity ? user.preferredCity.toUpperCase() : 'INDIA'} CLINICAL MEMBER
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editProfileBtn}
            accessibilityLabel="Edit Profile"
          >
            <Text style={styles.editProfileBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Clinical Skin Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>PERSONALIZED SKIN PROFILE</Text>
            <TouchableOpacity
              onPress={() => router.push('/assessment')}
              style={styles.retakeLink}
            >
              <Text style={styles.retakeLinkText}>
                {user?.skinProfile?.assessmentCompleted ? 'Retake Assessment' : 'Start Assessment'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Detailed Skin Profile Card */}
          <View style={[styles.skinCard, SHADOWS.card]}>
            <View style={styles.skinCardHeader}>
              <View style={styles.skinTypePill}>
                <Droplets size={14} color={COLORS.burgundy} />
                <Text style={styles.skinTypePillText}>
                  {user?.skinProfile?.skinType || user?.skinType || 'Not Assessed'} Skin
                </Text>
              </View>
              <View style={styles.sensitivityPill}>
                <Shield size={13} color={COLORS.textSecondary} />
                <Text style={styles.sensitivityPillText}>
                  {user?.skinProfile?.sensitivityLevel || 'Unsure'} Reactivity
                </Text>
              </View>
            </View>

            {/* Concerns */}
            <View style={styles.profileFieldBlock}>
              <Text style={styles.profileFieldLabel}>Primary Concerns</Text>
              <View style={styles.profileTagsWrap}>
                {(user?.skinProfile?.skinConcerns || user?.skinConcerns || []).length > 0 ? (
                  (user?.skinProfile?.skinConcerns || user?.skinConcerns || []).map((c) => (
                    <View key={c} style={styles.profileTag}>
                      <Text style={styles.profileTagText}>{c}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyFieldText}>None specified</Text>
                )}
              </View>
            </View>

            {/* Skincare Goals */}
            <View style={styles.profileFieldBlock}>
              <Text style={styles.profileFieldLabel}>Skincare Goals</Text>
              <View style={styles.profileTagsWrap}>
                {(user?.skinProfile?.skincareGoals || []).length > 0 ? (
                  (user?.skinProfile?.skincareGoals || []).map((g) => (
                    <View key={g} style={[styles.profileTag, { backgroundColor: 'rgba(215, 167, 177, 0.2)' }]}>
                      <Text style={[styles.profileTagText, { color: COLORS.burgundy }]}>{g}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyFieldText}>None specified</Text>
                )}
              </View>
            </View>

            {/* Routine & Budget Row */}
            <View style={styles.profileMetricsGrid}>
              <View style={styles.profileMetricCell}>
                <Text style={styles.profileMetricLabel}>Monthly Budget</Text>
                <Text style={styles.profileMetricValue}>
                  {user?.skinProfile?.monthlyBudgetINR
                    ? formatInr(user.skinProfile.monthlyBudgetINR)
                    : 'Flexible'}
                </Text>
              </View>

              <View style={styles.profileMetricCell}>
                <Text style={styles.profileMetricLabel}>Routine Style</Text>
                <Text style={styles.profileMetricValue}>
                  {user?.skinProfile?.routinePreference || 'Simple'}
                </Text>
              </View>

              <View style={styles.profileMetricCell}>
                <Text style={styles.profileMetricLabel}>Fragrance-Free</Text>
                <Text style={styles.profileMetricValue}>
                  {user?.skinProfile?.fragranceSensitivity || user?.skinProfile?.fragranceFreePreference
                    ? 'Preferred'
                    : 'Tolerated'}
                </Text>
              </View>
            </View>

            {/* Allergies / Triggers if any */}
            {(user?.skinProfile?.knownIngredientAllergies?.length > 0 ||
              user?.skinProfile?.irritationTriggers?.length > 0) && (
              <View style={[styles.profileFieldBlock, { marginTop: SPACING.sm }]}>
                <Text style={[styles.profileFieldLabel, { color: COLORS.error }]}>
                  Known Allergies & Irritants
                </Text>
                <View style={styles.profileTagsWrap}>
                  {[
                    ...(user?.skinProfile?.knownIngredientAllergies || []),
                    ...(user?.skinProfile?.irritationTriggers || []),
                  ].map((a, idx) => (
                    <View key={idx} style={[styles.profileTag, { backgroundColor: '#FFF0F0' }]}>
                      <Text style={[styles.profileTagText, { color: COLORS.error }]}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Last Assessed timestamp */}
            {user?.skinProfile?.lastAssessedAt && (
              <Text style={styles.lastAssessedText}>
                Last assessed on {formatIndianDate(user.skinProfile.lastAssessedAt)}
              </Text>
            )}

            {/* Non-diagnostic medical disclaimer */}
            <View style={styles.profileDisclaimerBox}>
              <Info size={14} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 6 }} />
              <Text style={styles.profileDisclaimerText}>
                Self-reported profile for educational insights and cosmetic routine guidance. Not a medical diagnosis or disease evaluation.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cardActionBtn}
              onPress={() => router.push('/assessment')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardActionBtnText}>
                {user?.skinProfile?.assessmentCompleted ? 'Edit Skin Profile' : 'Take Skin Assessment'}
              </Text>
              <ArrowRight size={15} color={COLORS.cream} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(tabs)/explore', params: { query: '' } })}
            style={[styles.menuRow, SHADOWS.subtle, { marginTop: SPACING.md }]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <Bookmark size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Saved Formulations & Actives</Text>
              <Text style={styles.menuSubLabel}>
                {savedProductsCount} Products • {savedIngredientsCount} Ingredients
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/journal')}
            style={[styles.menuRow, SHADOWS.subtle]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FDF0F3' }]}>
              <Camera size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Skin Journal & Progress Photos</Text>
              <Text style={styles.menuSubLabel}>Daily condition ratings, timeline & side-by-side comparison</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/comparison')}
            style={[styles.menuRow, SHADOWS.subtle]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <GitCompare size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Product Comparison Matrix</Text>
              <Text style={styles.menuSubLabel}>Side-by-side INCI active overlap & INR price comparison</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: 'Home Remedies' } })}
            style={[styles.menuRow, SHADOWS.subtle]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#F0FFF6' }]}>
              <Leaf size={18} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Evidence-Based Home Care</Text>
              <Text style={styles.menuSubLabel}>Botanical therapies with safety contraindications</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 2: DPDP Act 2023 Privacy & Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>PRIVACY & DPDP ACT 2023</Text>

          <View style={[styles.dpdpNoticeBox, SHADOWS.subtle]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Shield size={16} color={COLORS.success} />
              <Text style={styles.dpdpNoticeTitle}>Statutory Rights & Consent</Text>
            </View>
            <Text style={styles.dpdpNoticeText}>
              In compliance with the Digital Personal Data Protection (DPDP) Act 2023, your skin health data is strictly processed based on explicit consent. You retain statutory rights to view, export, or permanently erase your records at any time.
            </Text>
          </View>

          {/* Consent Toggle: Skin Profile */}
          <View style={[styles.menuRow, SHADOWS.subtle]}>
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <Heart size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Skin Health Processing Consent</Text>
              <Text style={styles.menuSubLabel}>Enables personalized active recommendations</Text>
            </View>
            <Switch
              value={consentSkin}
              onValueChange={(val) => handleToggleConsent('skin', val)}
              trackColor={{ true: COLORS.burgundy, false: COLORS.border }}
              thumbColor={COLORS.warmWhite}
            />
          </View>

          {/* Consent Toggle: Climate & Geolocation */}
          <View style={[styles.menuRow, SHADOWS.subtle]}>
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <MapPin size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Climate & UV Location Consent</Text>
              <Text style={styles.menuSubLabel}>Fetches real-time humidity & solar UV from Open-Meteo</Text>
            </View>
            <Switch
              value={consentLocation}
              onValueChange={(val) => handleToggleConsent('location', val)}
              trackColor={{ true: COLORS.burgundy, false: COLORS.border }}
              thumbColor={COLORS.warmWhite}
            />
          </View>

          {/* Export Personal Data Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportData}
            style={[styles.menuRow, SHADOWS.subtle]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <Download size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Export My Data (JSON)</Text>
              <Text style={styles.menuSubLabel}>Right to data portability under DPDP Act 2023</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 3: Notification Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>RITUAL REMINDERS (IST)</Text>

          <View style={[styles.menuRow, SHADOWS.subtle]}>
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <Bell size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Morning Protocol Reminder</Text>
              <Text style={styles.menuSubLabel}>Daily prompt at 08:00 AM IST</Text>
            </View>
            <Switch
              value={morningNotification}
              onValueChange={(val) => {
                setMorningNotification(val);
                updateProfile({ morningReminder: val });
              }}
              trackColor={{ true: COLORS.burgundy, false: COLORS.border }}
              thumbColor={COLORS.warmWhite}
            />
          </View>

          <View style={[styles.menuRow, SHADOWS.subtle]}>
            <View style={[styles.menuIconWrap, { backgroundColor: COLORS.softCream }]}>
              <Bell size={18} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Evening Protocol Reminder</Text>
              <Text style={styles.menuSubLabel}>Daily prompt at 09:00 PM IST</Text>
            </View>
            <Switch
              value={eveningNotification}
              onValueChange={(val) => {
                setEveningNotification(val);
                updateProfile({ eveningReminder: val });
              }}
              trackColor={{ true: COLORS.burgundy, false: COLORS.border }}
              thumbColor={COLORS.warmWhite}
            />
          </View>
        </View>

        {/* Section 4: Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>ACCOUNT ACTIONS</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDeleteModalVisible(true)}
            style={[styles.menuRow, SHADOWS.subtle]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FFF0F0' }]}>
              <Trash2 size={18} color={COLORS.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: COLORS.error }]}>Delete Account & Purge Data</Text>
              <Text style={styles.menuSubLabel}>Permanent erasure under Section 12, DPDP Act 2023</Text>
            </View>
            <ChevronRight size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, SHADOWS.subtle]}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={COLORS.burgundy} />
          <Text style={[styles.logoutText, { color: COLORS.burgundy }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* DPDP DATA EXPORT MODAL */}
      <Modal visible={exportModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>DPDP ACT 2023 COMPLIANCE</Text>
                <Text style={styles.modalTitle}>Personal Data Export</Text>
              </View>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360, marginTop: 8 }}>
              <Text style={styles.exportNoticeText}>
                The following machine-readable JSON reflects all personal identification, clinical skin records, and routine history associated with your user identity:
              </Text>
              <View style={styles.jsonBox}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(exportedData, null, 2)}
                </Text>
              </View>
            </ScrollView>

            <PrimaryButton
              title="Done"
              onPress={() => setExportModalVisible(false)}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.error }]}>Delete Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteWarningText}>
              In accordance with Section 12 (Right to Erasure) of the DPDP Act 2023, your personal identity, skin consultations, submissions, and routine history will be permanently deleted.
            </Text>

            <CustomInput
              label="Confirm Your Password"
              placeholder="Enter current password"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />

            <PrimaryButton
              title={deleting ? 'Purging Account Data...' : 'Confirm Permanent Erasure'}
              loading={deleting}
              onPress={handleDeleteAccount}
              style={{ backgroundColor: COLORS.error, marginTop: SPACING.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Formik
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
                preferredCity: user?.preferredCity || 'mumbai',
              }}
              validationSchema={profileSchema}
              onSubmit={handleSaveBasicProfile}
            >
              {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                <View>
                  <CustomInput
                    label="Full Name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                  />

                  <CustomInput
                    label="Email Address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <CustomInput
                    label="Indian Mobile Number (+91)"
                    value={values.phoneNumber}
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    placeholder="9876543210"
                    error={touched.phoneNumber && errors.phoneNumber}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formInputLabel}>Primary Indian City</Text>
                  <View style={styles.cityPillsWrap}>
                    {INDIAN_CITIES.slice(0, 6).map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.cityPill,
                          values.preferredCity === city.id && styles.cityPillActive,
                        ]}
                        onPress={() => setFieldValue('preferredCity', city.id)}
                      >
                        <Text
                          style={[
                            styles.cityPillText,
                            values.preferredCity === city.id && styles.cityPillTextActive,
                          ]}
                        >
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <PrimaryButton
                    title="Save Changes"
                    onPress={handleSubmit}
                    style={{ marginTop: SPACING.md }}
                  />
                </View>
              )}
            </Formik>
          </View>
        </View>
      </Modal>

      {/* Skin Profile Modal */}
      <Modal visible={skinProfileModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Skin Profile</Text>
              <TouchableOpacity onPress={() => setSkinProfileModalVisible(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>PRIMARY SKIN TYPE</Text>
            <View style={styles.pillsRow}>
              {SKIN_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleUpdateSkinType(t)}
                  style={[
                    styles.typePill,
                    (user?.skinProfile?.skinType || user?.skinType) === t && styles.typePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      (user?.skinProfile?.skinType || user?.skinType) === t && styles.typePillTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalSubtitle, { marginTop: SPACING.md }]}>PRIMARY SKIN CONCERNS</Text>
            <View style={styles.pillsRow}>
              {COMMON_CONCERNS.map((c) => {
                const current = user?.skinProfile?.skinConcerns || user?.skinConcerns || [];
                const isSelected = current.includes(c);
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => handleToggleConcern(c)}
                    style={[styles.typePill, isSelected && styles.typePillActive]}
                  >
                    <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton
              title="Done"
              onPress={() => setSkinProfileModalVisible(false)}
              style={{ marginTop: SPACING.lg }}
            />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xs,
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.headingMedium,
    color: COLORS.cream,
    fontSize: 20,
  },
  userName: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  userPhone: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  membershipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.softCream,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  membershipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.burgundy,
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.softCream,
  },
  editProfileBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.burgundy,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.overline,
    fontSize: 10,
    color: COLORS.dustyPink,
    letterSpacing: 1.2,
  },
  retakeLink: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  retakeLinkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 11,
  },
  skinCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 47, 55, 0.2)',
    marginBottom: SPACING.xs,
  },
  skinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  skinTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  skinTypePillText: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 13,
  },
  sensitivityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  sensitivityPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  profileFieldBlock: {
    marginBottom: SPACING.sm,
  },
  profileFieldLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: 4,
  },
  profileTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  profileTag: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  profileTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '500',
  },
  emptyFieldText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  profileMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248, 244, 231, 0.5)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    justifyContent: 'space-between',
  },
  profileMetricCell: {
    flex: 1,
    alignItems: 'center',
  },
  profileMetricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  profileMetricValue: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },
  lastAssessedText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
  },
  profileDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(114, 47, 55, 0.04)',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    marginTop: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.burgundy,
  },
  profileDisclaimerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    borderRadius: RADIUS.full,
    paddingVertical: 10,
    marginTop: SPACING.md,
    gap: 6,
  },
  cardActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 13,
  },
  dpdpNoticeBox: {
    backgroundColor: '#FAF5EE',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  dpdpNoticeTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  dpdpNoticeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  menuLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  menuSubLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    gap: 8,
    marginTop: SPACING.sm,
  },
  logoutText: {
    ...TYPOGRAPHY.button,
    fontWeight: '600',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(41, 35, 38, 0.65)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: 9,
  },
  modalTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.burgundy,
    fontSize: 20,
    marginTop: 2,
  },
  deleteWarningText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  exportNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 15,
  },
  jsonBox: {
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    maxHeight: 280,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  typePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  typePillTextActive: {
    color: COLORS.cream,
    fontWeight: '600',
  },
  formInputLabel: {
    ...TYPOGRAPHY.overline,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  cityPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  cityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityPillActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  cityPillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  cityPillTextActive: {
    color: COLORS.cream,
    fontWeight: '600',
  },
});
