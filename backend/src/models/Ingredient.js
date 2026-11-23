const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
      index: true,
    },
    inciName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    chemicalName: {
      type: String,
      default: '',
    },
    synonyms: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Hyaluronic acid',
        'Niacinamide',
        'Salicylic acid',
        'Glycolic acid',
        'Lactic acid',
        'Retinoids',
        'Vitamin C',
        'Ceramides',
        'Peptides',
        'Glycerin',
        'Panthenol',
        'Zinc compounds',
        'Sunscreen filters',
        'Preservatives',
        'Fragrance ingredients',
        'Botanical extracts',
        'Antioxidants',
      ],
      index: true,
    },
    function: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    scientificProperties: {
      pubchemCid: { type: Number, default: null },
      molecularFormula: { type: String, default: '' },
      molecularWeight: { type: String, default: '' },
      iupacName: { type: String, default: '' },
      casNumber: { type: String, default: '' },
    },
    researchBackedBenefits: {
      type: [String],
      default: [],
    },
    potentialIrritationRisks: {
      type: [String],
      default: [],
    },
    knownLimitations: {
      type: [String],
      default: [],
    },
    comedogenicityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    irritancyRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    suitableSkinTypes: {
      type: [String],
      default: ['All'],
    },
    references: [
      {
        citation: { type: String, required: true },
        source: { type: String, default: 'PubMed / PubChem / DermNet' },
        url: { type: String, default: '' },
      },
    ],
    lastUpdatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ingredientSchema.index({ name: 'text', inciName: 'text', synonyms: 'text', function: 'text' });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
