const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  citations: [
    {
      source: { type: String, default: 'Bellezza Clinical Dermatology Reference' },
      title: { type: String, default: '' },
      url: { type: String, default: '' },
    },
  ],
  feedback: {
    type: String,
    enum: ['helpful', 'unhelpful', null],
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Skincare Consultation',
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'ingredient', 'routine', 'remedy', 'sunscreen', 'barrier'],
      default: 'general',
    },
    contextSnapshot: {
      skinType: String,
      sensitivityLevel: String,
      concerns: [String],
      goals: [String],
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
