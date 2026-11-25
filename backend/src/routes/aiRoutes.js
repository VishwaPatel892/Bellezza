const express = require('express');
const {
  chat,
  analyzeFace,
  getConversations,
  getConversationById,
  deleteConversation,
  recordFeedback,
} = require('../controllers/aiController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Face Recognition & Skin Diagnostics: POST /api/ai/face-analysis
router.post('/face-analysis', optionalAuth, analyzeFace);

// Chat endpoint: POST /api/ai/chat
router.post('/chat', optionalAuth, chat);

// Conversation list: GET /api/ai/conversations
router.get('/conversations', authenticate, getConversations);

// Conversation details: GET /api/ai/conversations/:id
router.get('/conversations/:id', authenticate, getConversationById);

// Delete conversation: DELETE /api/ai/conversations/:id
router.delete('/conversations/:id', authenticate, deleteConversation);

// Feedback endpoint: POST /api/ai/feedback
router.post('/feedback', authenticate, recordFeedback);

module.exports = router;
