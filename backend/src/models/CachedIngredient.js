const mongoose = require('mongoose');

const cachedIngredientSchema = new mongoose.Schema(
  {
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    synonyms: {
      type: [String],
      default: [],
    },
    functions: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    comedogenicity: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    irritancy: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    traitFlags: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'unknown'],
      default: 'low',
    },
    skinSuitability: {
      dry: { type: String, default: 'neutral' },
      oily: { type: String, default: 'neutral' },
      sensitive: { type: String, default: 'neutral' },
      normal: { type: String, default: 'neutral' },
    },
    source: {
      type: String,
      default: 'Bellezza INCI Scientific Index',
    },
    sourceExplanation: {
      type: String,
      default: 'Comedogenicity and irritancy ratings are standardized dermatological reference estimates on a 0-5 scale, not medical diagnoses.',
    },
    casNo: {
      type: String,
      default: null,
    },
    ecNo: {
      type: String,
      default: null,
    },
    lastRetrievedAt: {
      type: Date,
      default: Date.now,
    },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: '30d' },
    },
  },
  {
    timestamps: true,
  }
);

cachedIngredientSchema.index({ normalizedName: 'text', name: 'text', synonyms: 'text', functions: 'text' });

const CachedIngredient = mongoose.model('CachedIngredient', cachedIngredientSchema);

module.exports = CachedIngredient;

