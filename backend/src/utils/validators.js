const mongoose = require('mongoose');

const ALLOWED_SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'Not sure', 'Unsure'];
const ALLOWED_SENSITIVITY_LEVELS = ['Low', 'Moderate', 'Medium', 'High', 'Not sure', 'Unsure'];
const ALLOWED_IRRITATION_OPTIONS = ['Yes', 'No', 'Sometimes', 'Not sure'];
const ALLOWED_ROUTINE_PREFERENCES = ['Simple', 'Advanced', 'Flexible', 'Not sure'];

/**
 * Validate standard email format.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Validate password requirements (minimum 6 characters).
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
  if (typeof password !== 'string') return false;
  return password.length >= 6;
};

/**
 * Validate 24-hex character MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Normalize skin type to Capitalized standard (e.g. 'dry' -> 'Dry').
 * @param {string} skinType
 * @returns {string|null}
 */
const normalizeSkinType = (skinType) => {
  if (!skinType || typeof skinType !== 'string') return null;
  const match = ALLOWED_SKIN_TYPES.find(
    (t) => t.toLowerCase() === skinType.trim().toLowerCase()
  );
  return match || null;
};

/**
 * Normalize sensitivity level (e.g. 'low' -> 'Low').
 * @param {string} level
 * @returns {string|null}
 */
const normalizeSensitivity = (level) => {
  if (!level || typeof level !== 'string') return null;
  const match = ALLOWED_SENSITIVITY_LEVELS.find(
    (l) => l.toLowerCase() === level.trim().toLowerCase()
  );
  return match || null;
};

/**
 * Normalize email string to lowercase trimmed format.
 * @param {string} email
 * @returns {string}
 */
const normalizeEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

module.exports = {
  ALLOWED_SKIN_TYPES,
  ALLOWED_SENSITIVITY_LEVELS,
  ALLOWED_IRRITATION_OPTIONS,
  ALLOWED_ROUTINE_PREFERENCES,
  isValidEmail,
  isValidPassword,
  isValidObjectId,
  normalizeSkinType,
  normalizeSensitivity,
  normalizeEmail,
};

