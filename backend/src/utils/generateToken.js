const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a signed JWT for an authenticated user.
 * @param {string|object} userOrId - User object or userId
 * @returns {string} Signed JWT token
 */
const generateToken = (userOrId) => {
  const payload =
    typeof userOrId === 'object' && userOrId !== null
      ? { id: userOrId._id || userOrId.id, role: userOrId.role || 'user' }
      : { id: userOrId, role: 'user' };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Verify a given JWT token.
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};

