const {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeSkinType,
  normalizeSensitivity,
  ALLOWED_SKIN_TYPES,
  ALLOWED_SENSITIVITY_LEVELS,
  ALLOWED_IRRITATION_OPTIONS,
  ALLOWED_ROUTINE_PREFERENCES,
} = require('../utils/validators');

/**
 * Format validation response according to Bellezza API specifications:
 * {
 *   success: false,
 *   message: "Validation failed",
 *   errors: { field: "error description" }
 * }
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

/**
 * Validate registration request body
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password || !isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  // Normalize email for downstream handler
  req.body.name = name.trim();
  req.body.email = normalizeEmail(email);
  next();
};

/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  req.body.email = normalizeEmail(email);
  next();
};

/**
 * Validate profile update body
 */
const validateProfileUpdate = (req, res, next) => {
  const { name, profileImage } = req.body || {};
  const errors = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (name.trim().length > 100) {
      errors.name = 'Name cannot exceed 100 characters';
    } else {
      req.body.name = name.trim();
    }
  }

  if (profileImage !== undefined && typeof profileImage !== 'string') {
    errors.profileImage = 'Profile image must be a valid string URL or path';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  next();
};

/**
 * Validate skin profile update body
 */
const validateSkinProfileUpdate = (req, res, next) => {
  const {
    skinType,
    skinConcerns,
    sensitivityLevel,
    experiencesIrritation,
    knownIngredientAllergies,
    irritationTriggers,
    fragranceSensitivity,
    productReactions,
    skincareGoals,
    currentRoutine,
    currentProducts,
    monthlyBudgetINR,
    productPreferences,
    fragranceFreePreference,
    routinePreference,
    indiaFirstPreference,
    assessmentCompleted,
  } = req.body || {};
  const errors = {};

  if (skinType !== undefined) {
    const normalized = normalizeSkinType(skinType);
    if (!normalized) {
      errors.skinType = `Invalid skin type. Allowed values: ${ALLOWED_SKIN_TYPES.join(', ')}`;
    } else {
      req.body.skinType = normalized;
    }
  }

  if (sensitivityLevel !== undefined) {
    const normalized = normalizeSensitivity(sensitivityLevel);
    if (!normalized) {
      errors.sensitivityLevel = `Invalid sensitivity level. Allowed values: ${ALLOWED_SENSITIVITY_LEVELS.join(', ')}`;
    } else {
      req.body.sensitivityLevel = normalized;
    }
  }

  if (experiencesIrritation !== undefined) {
    const match = ALLOWED_IRRITATION_OPTIONS.find(
      (opt) => opt.toLowerCase() === String(experiencesIrritation).trim().toLowerCase()
    );
    if (!match) {
      errors.experiencesIrritation = `Invalid irritation option. Allowed values: ${ALLOWED_IRRITATION_OPTIONS.join(', ')}`;
    } else {
      req.body.experiencesIrritation = match;
    }
  }

  if (routinePreference !== undefined) {
    const match = ALLOWED_ROUTINE_PREFERENCES.find(
      (opt) => opt.toLowerCase() === String(routinePreference).trim().toLowerCase()
    );
    if (!match) {
      errors.routinePreference = `Invalid routine preference. Allowed values: ${ALLOWED_ROUTINE_PREFERENCES.join(', ')}`;
    } else {
      req.body.routinePreference = match;
    }
  }

  if (monthlyBudgetINR !== undefined && monthlyBudgetINR !== null) {
    const num = Number(monthlyBudgetINR);
    if (isNaN(num) || num < 0) {
      errors.monthlyBudgetINR = 'Monthly budget must be a positive number';
    } else {
      req.body.monthlyBudgetINR = num;
    }
  }

  const arrayFields = [
    { key: 'skinConcerns', max: 20, name: 'Skin concerns' },
    { key: 'knownIngredientAllergies', max: 50, name: 'Known allergies' },
    { key: 'irritationTriggers', max: 50, name: 'Irritation triggers' },
    { key: 'productReactions', max: 50, name: 'Product reactions' },
    { key: 'skincareGoals', max: 20, name: 'Skincare goals' },
    { key: 'currentRoutine', max: 20, name: 'Current routine items' },
    { key: 'currentProducts', max: 50, name: 'Current products' },
    { key: 'productPreferences', max: 20, name: 'Product preferences' },
  ];

  for (const { key, max, name } of arrayFields) {
    if (req.body[key] !== undefined) {
      if (!Array.isArray(req.body[key])) {
        errors[key] = `${name} must be an array of strings`;
      } else if (req.body[key].length > max) {
        errors[key] = `${name} exceeds maximum allowed size (${max})`;
      }
    }
  }

  const boolFields = [
    'fragranceSensitivity',
    'fragranceFreePreference',
    'indiaFirstPreference',
    'assessmentCompleted',
  ];

  for (const field of boolFields) {
    if (req.body[field] !== undefined) {
      req.body[field] = Boolean(req.body[field]);
    }
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  next();
};

/**
 * Validate account deletion confirmation body
 */
const validateAccountDeletion = (req, res, next) => {
  const { password } = req.body || {};
  const errors = {};

  if (!password || typeof password !== 'string') {
    errors.password = 'Password confirmation is required to delete your account';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateSkinProfileUpdate,
  validateAccountDeletion,
  sendValidationError,
};

