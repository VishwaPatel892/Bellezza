const mongoose = require('mongoose');

/**
 * Basic pure-JS email format validator
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Password strength validator (minimum 6 characters, at least one letter and one number)
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * MongoDB ObjectId validator
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Creates reusable validator middleware for request body, params, or query
 * @param {'body' | 'params' | 'query'} source
 * @param {Object} schema - Field rules: { fieldName: { required, type, enum, min, max, isEmail, isPassword, isObjectId, custom } }
 */
const createValidator = (source, schema) => {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const isPresent = value !== undefined && value !== null && value !== '';

      // Check required
      if (rules.required && !isPresent) {
        errors.push({ field, message: rules.message || `${field} is required` });
        continue;
      }

      // If optional and not provided, skip further checks
      if (!isPresent) continue;

      // Type check
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push({ field, message: `${field} must be an array` });
            continue;
          }
        } else if (rules.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({ field, message: `${field} must be a valid number` });
            continue;
          }
        } else if (rules.type === 'boolean') {
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push({ field, message: `${field} must be a boolean` });
            continue;
          }
        } else if (typeof value !== rules.type) {
          errors.push({ field, message: `${field} must be a ${rules.type}` });
          continue;
        }
      }

      // Email format
      if (rules.isEmail && !isValidEmail(value)) {
        errors.push({ field, message: `${field} must be a valid email address` });
      }

      // Password requirements
      if (rules.isPassword && !isValidPassword(value)) {
        errors.push({
          field,
          message: `${field} must be at least 6 characters long and contain both letters and numbers`,
        });
      }

      // MongoDB ObjectId
      if (rules.isObjectId && !isValidObjectId(value)) {
        errors.push({ field, message: `${field} must be a valid 24-character hex ObjectId` });
      }

      // Permitted values (Enum)
      if (rules.enum && Array.isArray(rules.enum)) {
        if (Array.isArray(value)) {
          const invalid = value.filter((v) => !rules.enum.includes(v));
          if (invalid.length > 0) {
            errors.push({
              field,
              message: `${field} contains invalid values: ${invalid.join(', ')}. Permitted values: ${rules.enum.join(', ')}`,
            });
          }
        } else if (!rules.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of: ${rules.enum.join(', ')}`,
          });
        }
      }

      // String min/max length or number min/max value
      if (rules.min !== undefined) {
        if (typeof value === 'string' && value.length < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
        } else if (typeof value === 'number' && value < rules.min) {
          errors.push({ field, message: `${field} cannot be less than ${rules.min}` });
        }
      }

      if (rules.max !== undefined) {
        if (typeof value === 'string' && value.length > rules.max) {
          errors.push({ field, message: `${field} must not exceed ${rules.max} characters` });
        } else if (typeof value === 'number' && value > rules.max) {
          errors.push({ field, message: `${field} cannot exceed ${rules.max}` });
        }
      }

      // Custom rule function
      if (typeof rules.custom === 'function') {
        const customResult = rules.custom(value, data);
        if (customResult !== true) {
          errors.push({ field, message: typeof customResult === 'string' ? customResult : `${field} is invalid` });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidObjectId,
  validateBody: (schema) => createValidator('body', schema),
  validateParams: (schema) => createValidator('params', schema),
  validateQuery: (schema) => createValidator('query', schema),
};
