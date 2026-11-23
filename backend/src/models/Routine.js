const mongoose = require('mongoose');

const routineStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask', 'eye cream', 'other'],
    default: 'other',
  },
  productName: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  instructions: {
    type: String,
    default: '',
  },
  frequency: {
    type: String,
    default: 'Daily',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const routineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'evening', 'weekly', 'custom'],
      required: true,
    },
    reminderTime: {
      type: String,
      default: '08:00',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    steps: [routineStepSchema],
  },
  {
    timestamps: true,
  }
);

const Routine = mongoose.model('Routine', routineSchema);

module.exports = Routine;
