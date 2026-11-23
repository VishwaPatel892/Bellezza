const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { aiProvider } = require('./aiProvider');
const { buildSystemInstruction } = require('./promptManager');

class AIService {
  /**
   * Process a chat interaction, persist message history, and return assistant response
   */
  async processChat({ userId, message, conversationId = null, category = 'general' }) {
    if (!message || !message.trim()) {
      const error = new Error('Message text is required');
      error.statusCode = 400;
      throw error;
    }

    // 1. Fetch user context
    let userContext = {};
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userContext = {
          name: user.name,
          skinType: user.skinProfile?.skinType || 'Not sure',
          sensitivityLevel: user.skinProfile?.sensitivityLevel || 'Not sure',
          concerns: user.skinProfile?.skinConcerns || [],
          goals: user.skinProfile?.skincareGoals || [],
          allergies: [
            ...(user.skinProfile?.knownIngredientAllergies || []),
            ...(user.skinProfile?.irritationTriggers || []),
          ],
          currentRoutine: user.skinProfile?.currentRoutine || [],
          budget: user.skinProfile?.monthlyBudgetINR,
        };
      }
    }

    // 2. Fetch or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
    }

    if (!conversation) {
      conversation = new Conversation({
        userId,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        category,
        contextSnapshot: {
          skinType: userContext.skinType,
          sensitivityLevel: userContext.sensitivityLevel,
          concerns: userContext.concerns,
          goals: userContext.goals,
        },
        messages: [],
      });
    }

    // 3. Append user message
    conversation.messages.push({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date(),
    });

    // 4. Generate response using live Gemini or grounded dermatology engine
    let aiResult = null;
    if (aiProvider.hasLiveKey()) {
      const systemInstruction = buildSystemInstruction(userContext);
      const contents = conversation.messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      aiResult = await aiProvider.generateGeminiResponse(systemInstruction, contents);
    }

    // Fallback if no live key or network timeout
    if (!aiResult) {
      aiResult = aiProvider.generateGroundedResponse(message, userContext);
    }

    // 5. Append assistant reply
    const assistantMessage = {
      sender: 'assistant',
      text: aiResult.text,
      citations: aiResult.citations || [],
      timestamp: new Date(),
    };
    conversation.messages.push(assistantMessage);

    await conversation.save();

    return {
      conversationId: conversation._id,
      title: conversation.title,
      reply: aiResult.text,
      citations: aiResult.citations || [],
      provider: aiResult.provider,
      model: aiResult.model,
      timestamp: assistantMessage.timestamp,
      messageId: conversation.messages[conversation.messages.length - 1]._id,
    };
  }

  /**
   * Get all conversations for user
   */
  async getConversations(userId) {
    return Conversation.find({ userId })
      .select('title category updatedAt createdAt messages')
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean()
      .then((convs) =>
        convs.map((c) => ({
          id: c._id,
          title: c.title,
          category: c.category,
          messageCount: c.messages?.length || 0,
          lastMessage: c.messages?.[c.messages.length - 1]?.text?.slice(0, 60) || '',
          updatedAt: c.updatedAt,
        }))
      );
  }

  /**
   * Get conversation details with all messages
   */
  async getConversationById(userId, conversationId) {
    const conv = await Conversation.findOne({ _id: conversationId, userId });
    if (!conv) {
      const error = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }
    return conv;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userId, conversationId) {
    return Conversation.findOneAndDelete({ _id: conversationId, userId });
  }

  /**
   * Record feedback (helpful / unhelpful)
   */
  async recordFeedback(userId, { conversationId, messageId, feedback }) {
    const conv = await Conversation.findOne({ _id: conversationId, userId });
    if (!conv) {
      const error = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    const msg = conv.messages.id(messageId);
    if (msg) {
      msg.feedback = feedback;
      await conv.save();
    }

    return { success: true };
  }
}

const aiService = new AIService();

module.exports = {
  aiService,
};
