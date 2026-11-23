const mongoose = require('mongoose');

const savedRemedySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    remedyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Remedy',
      required: true,
      index: true,
    },
    personalNotes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

savedRemedySchema.index({ userId: 1, remedyId: 1 }, { unique: true });

const SavedRemedy = mongoose.model('SavedRemedy', savedRemedySchema);

module.exports = SavedRemedy;
