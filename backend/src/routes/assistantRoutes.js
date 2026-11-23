const express = require('express');
const assistantController = require('../controllers/assistantController');
const { validateBody } = require('../middleware/validation');
const { authenticate } = require('../middleware/authMiddleware');
const { verifyToken } = require('../utils/generateToken');

const router = express.Router();

// Middleware to extract user if token present (optional auth)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

const askSchema = {
  query: {
    required: true,
    type: 'string',
    min: 2,
    max: 500,
  },
};

router.post('/ask', optionalAuth, validateBody(askSchema), assistantController.ask);
router.get('/history', authenticate, assistantController.getHistory);

module.exports = router;

