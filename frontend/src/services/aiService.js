import { api } from './api';

export const aiService = {
  /**
   * Send message to Bellezza AI Assistant
   */
  chat: async (message, conversationId = null, category = 'general') => {
    const res = await api.post('/ai/chat', { message, conversationId, category });
    return res.data;
  },

  /**
   * Get user conversations
   */
  getConversations: async () => {
    try {
      const res = await api.get('/ai/conversations');
      return res.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Get single conversation
   */
  getConversationById: async (id) => {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data;
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (id) => {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data;
  },

  /**
   * AI Face Recognition & Skin Analysis via Groq Vision
   */
  analyzeFace: async (imageBase64) => {
    const res = await api.post('/ai/face-analysis', { image: imageBase64 });
    return res.data;
  },

  /**
   * Submit message feedback
   */
  submitFeedback: async (conversationId, messageId, feedback) => {
    const res = await api.post('/ai/feedback', { conversationId, messageId, feedback });
    return res.data;
  },
};

export default aiService;
