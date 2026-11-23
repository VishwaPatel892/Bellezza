const { aiService } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');

const chat = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { message, conversationId, category } = req.body || {};

    if (!message || !message.trim()) {
      return sendError(res, 'Please provide a message.', 400);
    }

    const result = await aiService.processChat({
      userId,
      message,
      conversationId,
      category,
    });

    return sendSuccess(res, result, 'Response generated.');
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const conversations = await aiService.getConversations(userId);
    return sendSuccess(res, conversations, 'Conversations retrieved.');
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    const conversation = await aiService.getConversationById(userId, id);
    return sendSuccess(res, conversation, 'Conversation history retrieved.');
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    await aiService.deleteConversation(userId, id);
    return sendSuccess(res, { success: true }, 'Conversation deleted.');
  } catch (error) {
    next(error);
  }
};

const recordFeedback = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { conversationId, messageId, feedback } = req.body || {};
    await aiService.recordFeedback(userId, { conversationId, messageId, feedback });
    return sendSuccess(res, { success: true }, 'Feedback recorded.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getConversations,
  getConversationById,
  deleteConversation,
  recordFeedback,
};
