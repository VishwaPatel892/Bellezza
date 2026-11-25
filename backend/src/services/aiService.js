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

    // 2. Fetch or create conversation (if user is authenticated)
    let conversation = null;
    let contextMessages = [{ sender: 'user', text: message.trim() }];

    if (userId) {
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

      // Append user message
      conversation.messages.push({
        sender: 'user',
        text: message.trim(),
        timestamp: new Date(),
      });

      contextMessages = conversation.messages.slice(-8);
    }

    // 3. Generate response using Groq / Gemini / Grounded dermatology engine
    const systemInstruction = buildSystemInstruction(userContext);
    const aiResult = await aiProvider.generateResponse(
      systemInstruction,
      contextMessages,
      userContext
    );

    // 4. Append assistant reply if conversation is persisted
    const assistantMessage = {
      sender: 'assistant',
      text: aiResult.text,
      citations: aiResult.citations || [],
      timestamp: new Date(),
    };

    if (conversation) {
      conversation.messages.push(assistantMessage);
      await conversation.save();
    }

    return {
      conversationId: conversation?._id || null,
      title: conversation?.title || 'Skincare Consultation',
      reply: aiResult.text,
      citations: aiResult.citations || [],
      provider: aiResult.provider,
      model: aiResult.model,
      timestamp: assistantMessage.timestamp,
      messageId: conversation?.messages?.[conversation.messages.length - 1]?._id || null,
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
