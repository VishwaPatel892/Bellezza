const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask', 'eye cream', 'other'],
      default: 'other',
    },
    priceInr: {
      type: Number,
      min: 0,
      default: null,
    },
    retailer: {
      type: String,
      default: 'Indian Retail Store / Online Store',
      trim: true,
    },
    ingredientsText: {
      type: String,
      default: '',
      trim: true,
    },
    labelImageUrl: {
      type: String,
      default: '',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected'],
      default: 'pending_verification',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

productSubmissionSchema.index({ barcode: 1, status: 1 });

const ProductSubmission = mongoose.model('ProductSubmission', productSubmissionSchema);

module.exports = ProductSubmission;

