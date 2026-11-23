const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

/**
 * Get authenticated user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.userId || req.user.id);
    return sendSuccess(res, profile, 'Profile retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Update basic user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.userId || req.user.id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve skin profile
 * GET /api/users/skin-profile
 */
const getSkinProfile = async (req, res, next) => {
  try {
    const data = await userService.getSkinProfile(req.userId || req.user.id);
    return sendSuccess(res, data, 'Skin profile retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Update clinical skin profile
 * PUT /api/users/skin-profile
 */
const updateSkinProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateSkinProfile(req.userId || req.user.id, req.body);
    return sendSuccess(res, updated, 'Skin profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Update DPDP Consent Preferences
 * PUT /api/users/consent
 */
const updateConsent = async (req, res, next) => {
  try {
    const updated = await userService.updateDpdpConsent(req.userId || req.user.id, req.body);
    return sendSuccess(res, updated, 'Consent preferences updated under DPDP Act 2023.');
  } catch (error) {
    next(error);
  }
};

/**
 * Export all personal user data (DPDP Act Right to Access & Portability)
 * GET /api/users/export-data
 */
const exportData = async (req, res, next) => {
  try {
    const data = await userService.exportUserData(req.userId || req.user.id);
    return sendSuccess(res, data, 'User data exported successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account with password confirmation
 * DELETE /api/users/account
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await userService.deleteUserAccount(req.userId || req.user.id, password);
    return sendSuccess(res, result, 'Account deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getSkinProfile,
  updateProfile,
  updateSkinProfile,
  updateConsent,
  exportData,
  deleteAccount,
  // Backward compatibility alias for PUT /api/users/me
  updateMe: updateProfile,
};
