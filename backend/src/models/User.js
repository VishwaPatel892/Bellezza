const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skinProfileSchema = new mongoose.Schema(
  {
    skinType: {
      type: String,
      enum: {
        values: ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'Not sure', 'Unsure'],
        message: '{VALUE} is not a valid skin type classification',
      },
      default: 'Not sure',
    },
    skinConcerns: {
      type: [String],
      default: [],
    },
    sensitivityLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'Medium', 'High', 'Not sure', 'Unsure'],
      default: 'Not sure',
    },
    experiencesIrritation: {
      type: String,
      enum: ['Yes', 'No', 'Sometimes', 'Not sure'],
      default: 'Not sure',
    },
    knownIngredientAllergies: {
      type: [String],
      default: [],
    },
    irritationTriggers: {
      type: [String],
      default: [],
    },
    fragranceSensitivity: {
      type: Boolean,
      default: false,
    },
    productReactions: {
      type: [String],
      default: [],
    },
    skincareGoals: {
      type: [String],
      default: [],
    },
    currentRoutine: {
      type: [String],
      default: [],
    },
    currentProducts: {
      type: [String],
      default: [],
    },
    monthlyBudgetINR: {
      type: Number,
      default: null,
    },
    productPreferences: {
      type: [String],
      default: [],
    },
    fragranceFreePreference: {
      type: Boolean,
      default: false,
    },
    routinePreference: {
      type: String,
      enum: ['Simple', 'Advanced', 'Flexible', 'Not sure'],
      default: 'Simple',
    },
    indiaFirstPreference: {
      type: Boolean,
      default: true,
    },
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    lastAssessedAt: {
      type: Date,
      default: null,
    },
    disclaimerAcknowledged: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    skinProfile: {
      type: skinProfileSchema,
      default: () => ({}),
    },
    morningReminder: {
      type: Boolean,
      default: true,
    },
    eveningReminder: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    countryCode: {
      type: String,
      default: '+91',
    },
    preferredCity: {
      type: String,
      default: 'mumbai',
      trim: true,
    },
    savedProducts: {
      type: [String],
      default: [],
    },
    savedIngredients: {
      type: [String],
      default: [],
    },
    dpdpConsent: {
      skinProfileConsent: { type: Boolean, default: true },
      locationConsent: { type: Boolean, default: false },
      analyticsConsent: { type: Boolean, default: false },
      consentTimestamp: { type: Date, default: Date.now },
      noticeVersion: { type: String, default: '1.0-DPDP-2023' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for backwards compatibility with earlier components
userSchema.virtual('skinType').get(function () {
  return this.skinProfile?.skinType || 'Not sure';
});
userSchema.virtual('skinConcerns').get(function () {
  return this.skinProfile?.skinConcerns || [];
});
userSchema.virtual('avatarUrl').get(function () {
  return this.profileImage || '';
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization — never return password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
