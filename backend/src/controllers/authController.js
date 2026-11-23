const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

/**
 * Handle new user registration
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to Bellezza.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return sendSuccess(res, result, 'Login successful. Welcome back.');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.userId || req.user.id);
    return sendSuccess(res, user, 'Authenticated profile retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 * POST /api/auth/logout
 * Explains stateless client-side token deletion behavior.
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      {
        tokenRevoked: true,
        note: 'JWT access tokens are stateless. The client application must securely remove the stored token from device storage to terminate the local session.',
      },
      'Signed out successfully.'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
