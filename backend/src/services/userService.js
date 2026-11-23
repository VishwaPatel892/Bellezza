const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Routine = require('../models/Routine');
const ProductSubmission = require('../models/ProductSubmission');
const { isValidIndianPhone, normalizeIndianPhone } = require('../utils/indianMarket');

/**
 * Retrieve user profile by verified authenticated user ID
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Update basic user profile fields (name, profileImage, notification preferences)
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object>}
 */
const updateUserProfile = async (userId, updates) => {
  const allowed = [
    'name',
    'profileImage',
    'morningReminder',
    'eveningReminder',
    'phoneNumber',
    'countryCode',
    'preferredCity',
  ];
  const updateData = {};

  for (const field of allowed) {
    if (updates[field] !== undefined) {
      if (field === 'phoneNumber' && updates.phoneNumber) {
        if (!isValidIndianPhone(updates.phoneNumber)) {
          const error = new Error('Please enter a valid 10-digit Indian mobile number.');
          error.statusCode = 400;
          throw error;
        }
        updateData.phoneNumber = normalizeIndianPhone(updates.phoneNumber);
      } else {
        updateData[field] = updates[field];
      }
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: updateData }, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

/**
 * Update DPDP Consent Preferences
 */
const updateDpdpConsent = async (userId, consentUpdates = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.dpdpConsent) {
    user.dpdpConsent = {};
  }

  if (consentUpdates.skinProfileConsent !== undefined) {
    user.dpdpConsent.skinProfileConsent = Boolean(consentUpdates.skinProfileConsent);
  }
  if (consentUpdates.locationConsent !== undefined) {
    user.dpdpConsent.locationConsent = Boolean(consentUpdates.locationConsent);
  }
  if (consentUpdates.analyticsConsent !== undefined) {
    user.dpdpConsent.analyticsConsent = Boolean(consentUpdates.analyticsConsent);
  }
  user.dpdpConsent.consentTimestamp = new Date();

  await user.save();
  return user.toJSON();
};

/**
 * Export all personal data under DPDP Act 2023 (Right to Access & Data Portability)
 */
const exportUserData = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const [routines, consultations, submissions] = await Promise.all([
    Routine.find({ userId }).lean(),
    Consultation.find({ userId }).lean(),
    ProductSubmission.find({ submittedBy: userId }).lean(),
  ]);

  delete user.password;
  delete user.__v;

  return {
    exportDate: new Date().toISOString(),
    complianceStandard: 'Digital Personal Data Protection (DPDP) Act 2023',
    jurisdiction: 'India (Republic of India)',
    userProfile: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      countryCode: user.countryCode || '+91',
      preferredCity: user.preferredCity || 'mumbai',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    clinicalSkinProfile: user.skinProfile || {},
    consentRecords: user.dpdpConsent || {},
    savedRoutines: routines || [],
    clinicalConsultations: consultations || [],
    productSubmissions: submissions || [],
  };
};

/**
 * Retrieve personalized skin profile
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getSkinProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return {
    skinProfile: user.skinProfile || {},
    disclaimer:
      'Bellezza skin assessment is provided for educational and cosmetic personalization purposes only. It is not a medical diagnosis, clinical evaluation, or disease detection.',
  };
};

/**
 * Update clinical skin profile
 * @param {string} userId
 * @param {object} skinData
 * @returns {Promise<object>}
 */
const updateSkinProfile = async (userId, skinData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.skinProfile) {
    user.skinProfile = {};
  }

  const allowedFields = [
    'skinType',
    'skinConcerns',
    'sensitivityLevel',
    'experiencesIrritation',
    'knownIngredientAllergies',
    'irritationTriggers',
    'fragranceSensitivity',
    'productReactions',
    'skincareGoals',
    'currentRoutine',
    'currentProducts',
    'monthlyBudgetINR',
    'productPreferences',
    'fragranceFreePreference',
    'routinePreference',
    'indiaFirstPreference',
    'assessmentCompleted',
    'disclaimerAcknowledged',
  ];

  for (const field of allowedFields) {
    if (skinData[field] !== undefined) {
      user.skinProfile[field] = skinData[field];
    }
  }

  if (skinData.assessmentCompleted !== undefined) {
    user.skinProfile.assessmentCompleted = Boolean(skinData.assessmentCompleted);
  } else if (skinData.skinType || (skinData.skinConcerns && skinData.skinConcerns.length > 0)) {
    user.skinProfile.assessmentCompleted = true;
  }

  user.skinProfile.lastAssessedAt = new Date();

  await user.save();
  return user.toJSON();
};

/**
 * Delete account with required password confirmation
 * @param {string} userId
 * @param {string} passwordConfirmation
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const deleteUserAccount = async (userId, passwordConfirmation) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(passwordConfirmation);
  if (!isMatch) {
    const error = new Error('Invalid password confirmation. Account deletion denied.');
    error.statusCode = 401;
    throw error;
  }

  // Delete all associated user records per privacy data retention policy (DPDP Act)
  await Promise.all([
    User.findByIdAndDelete(userId),
    Consultation.deleteMany({ userId }).catch(() => null),
    Routine.deleteMany({ userId }).catch(() => null),
    ProductSubmission.deleteMany({ submittedBy: userId }).catch(() => null),
  ]);

  return {
    success: true,
    message: 'User account and associated records have been permanently deleted in accordance with the DPDP Act 2023.',
  };
};

module.exports = {
  getUserProfile,
  getSkinProfile,
  updateUserProfile,
  updateSkinProfile,
  updateDpdpConsent,
  exportUserData,
  deleteUserAccount,
  // Backward compatibility alias
  updateProfile: updateUserProfile,
};
