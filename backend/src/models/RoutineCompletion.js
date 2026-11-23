const mongoose = require('mongoose');

const routineCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    completedSteps: [
      {
        stepNumber: Number,
        title: String,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    totalSteps: {
      type: Number,
      default: 0,
    },
    allCompleted: {
      type: Boolean,
      default: false,
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'evening', 'weekly', 'custom'],
      default: 'morning',
    },
  },
  {
    timestamps: true,
  }
);

routineCompletionSchema.index({ userId: 1, routineId: 1, date: 1 }, { unique: true });

const RoutineCompletion = mongoose.model('RoutineCompletion', routineCompletionSchema);

module.exports = RoutineCompletion;
