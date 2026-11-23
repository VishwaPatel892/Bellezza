const mongoose = require('mongoose');

const remedySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Remedy name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Hydration and dry skin care',
        'Gentle soothing skin care',
        'Oily skin care',
        'Acne-related skin care',
        'Skin barrier support',
        'General skin maintenance',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    ingredients: [
      {
        name: { type: String, required: true },
        amount: { type: String, default: '' },
        purpose: { type: String, default: '' },
      },
    ],
    preparationInstructions: {
      type: [String],
      required: true,
    },
    applicationInstructions: {
      type: [String],
      required: true,
    },
    frequency: {
      type: String,
      default: '1-2 times weekly as tolerated',
    },
    potentialBenefits: {
      type: [String],
      default: [],
    },
    scientificExplanation: {
      type: String,
      required: true,
    },
    evidenceLevel: {
      type: String,
      required: true,
      enum: [
        'Strong evidence',
        'Moderate evidence',
        'Limited evidence',
        'Traditional use / insufficient clinical evidence',
      ],
      default: 'Moderate evidence',
    },
    evidenceExplanation: {
      type: String,
      default:
        'Assigned according to peer-reviewed clinical dermatology trials, in-vitro barrier permeability assays, and standardized botanical pharmacology reference compendia.',
    },
    possibleIrritationRisks: {
      type: [String],
      default: [],
    },
    allergyWarnings: {
      type: [String],
      default: [],
    },
    contraindications: {
      type: [String],
      default: [
        'Do not apply on open wounds, infected lesions, or active cystic lesions.',
        'Discontinue immediately if erythema, burning, or pruritus occurs.',
      ],
    },
    patchTestingGuidance: {
      type: String,
      default:
        'Apply a dime-sized amount to the inner forearm or behind the ear for 24-48 hours prior to facial application. If erythema, burning, or itching develops, do not apply to the face.',
    },
    suitableSkinTypes: {
      type: [String],
      enum: ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'All'],
      default: ['All'],
    },
    targetedConcerns: {
      type: [String],
      default: [],
    },
    references: [
      {
        citation: { type: String, required: true },
        source: { type: String, default: 'PubMed / Dermatology Reference' },
        publicationYear: { type: Number, default: 2020 },
        url: { type: String, default: '' },
      },
    ],
    lastReviewedDate: {
      type: Date,
      default: Date.now,
    },
    reviewerNotes: {
      type: String,
      default:
        'Reviewed against board-certified dermatology literature and FDA/AYUSH botanical cosmetic safety monographs. Excludes harmful DIY practices.',
    },
  },
  {
    timestamps: true,
  }
);

remedySchema.index({ name: 'text', description: 'text', 'ingredients.name': 'text' });

const Remedy = mongoose.model('Remedy', remedySchema);

module.exports = Remedy;
