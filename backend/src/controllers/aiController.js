const { aiService } = require('../services/aiService');
const { groqService } = require('../services/groqService');
const User = require('../models/User');
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

/**
 * AI Face Recognition and Skin Analysis via Groq Vision
 * POST /api/ai/face-analysis
 */
const analyzeFace = async (req, res, next) => {
  try {
    const { image, base64 } = req.body || {};
    const imageData = image || base64;

    if (!imageData) {
      return sendError(res, 'Facial image data (base64 or URL) is required.', 400);
    }

    // Fetch user profile if logged in
    let userProfile = {};
    const userId = req.userId || req.user?.id;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userProfile = {
          name: user.name,
          skinProfile: user.skinProfile,
          allergies: [
            ...(user.skinProfile?.knownIngredientAllergies || []),
            ...(user.skinProfile?.irritationTriggers || []),
          ],
        };
      }
    }

    // Call Groq Vision Model
    const analysis = await groqService.analyzeFaceSkin(imageData, userProfile);

    // If a face is detected and user is logged in, optionally save assessment insights
    if (analysis.isHumanFace && userId) {
      try {
        const user = await User.findById(userId);
        if (user && !user.skinProfile?.assessmentCompleted) {
          user.skinProfile = {
            ...user.skinProfile,
            skinType: analysis.estimatedSkinType || user.skinProfile?.skinType || 'Combination',
            skinConcerns: Array.from(
              new Set([
                ...(user.skinProfile?.skinConcerns || []),
                ...(analysis.concerns || []).map((c) => c.concern),
              ])
            ).slice(0, 5),
          };
          await user.save();
        }
      } catch (saveErr) {
        console.warn('[analyzeFace] Could not update user profile from face analysis:', saveErr.message);
      }
    }

    return sendSuccess(res, analysis, analysis.isHumanFace ? 'Face and skin condition analyzed successfully.' : 'No human face detected.');
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
  analyzeFace,
  getConversations,
  getConversationById,
  deleteConversation,
  recordFeedback,
};
