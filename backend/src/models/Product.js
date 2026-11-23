const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      default: 'Bellezza Lab',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask', 'eye cream'],
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    scientificSummary: {
      type: String,
      required: true,
      default: 'Clinically formulated with bio-active compounds to optimize dermal cellular renewal.',
    },
    keyIngredients: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    suitableSkinTypes: {
      type: [String],
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
      default: ['all'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    priceInr: {
      type: Number,
      min: 0,
      default: function () {
        return this.price;
      },
    },
    retailer: {
      type: String,
      default: 'Verified Indian Skincare Retailer',
    },
    lastPriceCheckedAt: {
      type: Date,
      default: Date.now,
    },
    priceSource: {
      type: String,
      default: 'Authorized Brand Store / Nykaa / Amazon IN',
    },
    barcode: {
      type: String,
      default: null,
      sparse: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    usageInstructions: {
      type: String,
      default: 'Apply 3-4 drops evenly onto cleansed skin morning and evening. Pat gently until absorbed.',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
