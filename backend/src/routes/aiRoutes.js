const express = require('express');
const {
  chat,
  getConversations,
  getConversationById,
  deleteConversation,
  recordFeedback,
} = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All AI assistant routes require authentication
router.use(authenticate);

// Chat endpoint: POST /api/ai/chat
router.post('/chat', chat);

// Conversation list: GET /api/ai/conversations
router.get('/conversations', getConversations);

// Conversation details: GET /api/ai/conversations/:id
router.get('/conversations/:id', getConversationById);

// Delete conversation: DELETE /api/ai/conversations/:id
router.delete('/conversations/:id', deleteConversation);

// Feedback endpoint: POST /api/ai/feedback
router.post('/feedback', recordFeedback);

module.exports = router;
