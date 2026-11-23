import { api } from './api';

export const userService = {
  /**
   * Get authenticated user profile
   * @returns {Promise<object>}
   */
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  /**
   * Update basic profile fields (name, profileImage, notification preferences)
   * @param {object} data
   * @returns {Promise<object>}
   */
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  /**
   * Update clinical skin profile
   * @param {object} skinData
   * @returns {Promise<object>}
   */
  updateSkinProfile: async (skinData) => {
    const res = await api.put('/users/skin-profile', skinData);
    return res.data;
  },

  /**
   * Get personalized skin profile
   * @returns {Promise<object>}
   */
  getSkinProfile: async () => {
    const res = await api.get('/users/skin-profile');
    return res.data;
  },

  /**
   * Update DPDP Act Consent Preferences
   * @param {object} consentData - { skinProfileConsent, locationConsent, analyticsConsent }
   */
  updateConsent: async (consentData) => {
    const res = await api.put('/users/consent', consentData);
    return res.data;
  },

  /**
   * Export all user data under DPDP Act 2023
   * @returns {Promise<object>}
   */
  exportUserData: async () => {
    const res = await api.get('/users/export-data');
    return res.data;
  },

  /**
   * Delete account with password confirmation
   * @param {string} password
   * @returns {Promise<object>}
   */
  deleteAccount: async (password) => {
    const res = await api.delete('/users/account', { password });
    return res.data;
  },
};

export default userService;

