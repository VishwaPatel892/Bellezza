const mongoose = require('mongoose');

const cachedProductSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    barcode: {
      type: String,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: 'Unknown Brand',
      trim: true,
    },
    category: {
      type: String,
      default: 'skincare',
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    ingredientList: {
      type: [String],
      default: [],
    },
    ingredientsText: {
      type: String,
      default: '',
    },
    packaging: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Open Beauty Facts',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    completenessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rawMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastRetrievedAt: {
      type: Date,
      default: Date.now,
    },
    // TTL index: automatically expire cache records after 7 days (604800 seconds)
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expires: '7d' },
    },
  },
  {
    timestamps: true,
  }
);

cachedProductSchema.index({ name: 'text', brand: 'text', category: 'text' });

const CachedProduct = mongoose.model('CachedProduct', cachedProductSchema);

module.exports = CachedProduct;

