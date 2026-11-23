import { api } from './api';

export const remedyService = {
  getRemedies: async (params = {}) => {
    const res = await api.get('/remedies', { params });
    return res.data;
  },

  searchRemedies: async (q) => {
    const res = await api.get('/remedies/search', { params: { q } });
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/remedies/categories');
    return res.data;
  },

  getRecommended: async () => {
    const res = await api.get('/remedies/recommended');
    return res.data;
  },

  getRemedyById: async (id) => {
    const res = await api.get(`/remedies/${id}`);
    return res.data;
  },

  saveRemedy: async (id, notes = '') => {
    const res = await api.post(`/remedies/${id}/save`, { notes });
    return res.data;
  },

  unsaveRemedy: async (id) => {
    const res = await api.delete(`/remedies/${id}/save`);
    return res.data;
  },

  getSavedRemedies: async () => {
    const res = await api.get('/remedies/saved');
    return res.data;
  },
};

export default remedyService;
