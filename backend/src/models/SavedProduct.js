const mongoose = require('mongoose');

const savedProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

savedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

const SavedProduct = mongoose.model('SavedProduct', savedProductSchema);

module.exports = SavedProduct;
