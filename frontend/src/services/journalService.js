import { api } from './api';

export const journalService = {
  getEntries: async (params = {}) => {
    try {
      const res = await api.get('/journal', { params });
      return res.data;
    } catch {
      return { entries: [], total: 0 };
    }
  },

  createEntry: async (entryData) => {
    const res = await api.post('/journal', entryData);
    return res.data;
  },

  getEntryById: async (id) => {
    const res = await api.get(`/journal/${id}`);
    return res.data;
  },

  updateEntry: async (id, data) => {
    const res = await api.put(`/journal/${id}`, data);
    return res.data;
  },

  deleteEntry: async (id) => {
    const res = await api.delete(`/journal/${id}`);
    return res.data;
  },

  getTimeline: async () => {
    try {
      const res = await api.get('/journal/timeline');
      return res.data || [];
    } catch {
      return [];
    }
  },

  getProgress: async () => {
    try {
      const res = await api.get('/journal/progress');
      return res.data;
    } catch {
      return null;
    }
  },

  savePhoto: async (photoData) => {
    const res = await api.post('/journal/photos', photoData);
    return res.data;
  },

  getPhotos: async () => {
    try {
      const res = await api.get('/journal/photos');
      return res.data || [];
    } catch {
      return [];
    }
  },

  deletePhoto: async (id) => {
    const res = await api.delete(`/journal/photos/${id}`);
    return res.data;
  },
};

export default journalService;
