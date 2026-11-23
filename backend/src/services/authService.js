const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * Register a new user account.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
const registerUser = async ({ name, email, password }) => {
  // Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Create user (password will be hashed via Mongoose pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate user with email and password.
 * @param {object} credentials - { email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
const loginUser = async ({ email, password }) => {
  // Find user and explicitly include password for bcrypt comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Retrieve current authenticated user profile.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  // Backward compatibility
  register: registerUser,
  login: loginUser,
  getProfile: getCurrentUser,
};
