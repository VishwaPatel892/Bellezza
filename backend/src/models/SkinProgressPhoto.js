const mongoose = require('mongoose');

const skinProgressPhotoSchema = new mongoose.Schema(
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
    photoUri: {
      type: String,
      required: true,
    },
    angle: {
      type: String,
      enum: ['Frontal / Full Face', 'Right Cheek', 'Left Cheek', 'Forehead / T-Zone', 'Other'],
      default: 'Frontal / Full Face',
    },
    lightingCondition: {
      type: String,
      enum: ['Natural Daylight', 'Warm Indoor', 'Cool White / Fluorescent', 'Flash'],
      default: 'Natural Daylight',
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

const SkinProgressPhoto = mongoose.model('SkinProgressPhoto', skinProgressPhotoSchema);

module.exports = SkinProgressPhoto;
