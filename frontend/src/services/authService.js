import { api } from './api';

export const authService = {
  /**
   * Register a new user account
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  /**
   * Log in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  /**
   * Retrieve currently authenticated user
   * @returns {Promise<object>}
   */
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  /**
   * Inform backend of logout
   * @returns {Promise<object>}
   */
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch {
      return { success: true };
    }
  },
};

export default authService;
