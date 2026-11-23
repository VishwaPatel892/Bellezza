const mongoose = require('mongoose');

const skinJournalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    overallCondition: {
      type: String,
      enum: ['Radiant / Calm', 'Balanced', 'Mildly Irritated', 'Dry / Flaky', 'Congested / Breakouts', 'Flushed / Reactive'],
      default: 'Balanced',
    },
    dryness: {
      type: Number,
      min: 1,
      max: 5,
      default: 2,
    },
    oiliness: {
      type: Number,
      min: 1,
      max: 5,
      default: 2,
    },
    redness: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    breakouts: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    sensitivity: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    hydrationPerception: {
      type: String,
      enum: ['Dehydrated', 'Moderate', 'Plump / Hydrated'],
      default: 'Moderate',
    },
    texturePerception: {
      type: String,
      enum: ['Rough / Bumpy', 'Uneven', 'Smooth / Refined'],
      default: 'Smooth / Refined',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    productsUsed: {
      type: [String],
      default: [],
    },
    sleepHours: {
      type: Number,
      default: null,
    },
    waterIntakeLiters: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

skinJournalSchema.index({ userId: 1, date: 1 }, { unique: true });

const SkinJournal = mongoose.model('SkinJournal', skinJournalSchema);

module.exports = SkinJournal;
