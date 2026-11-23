const express = require('express');
const {
  getRemedies,
  searchRemedies,
  getCategories,
  getRecommended,
  getRemedyById,
  saveRemedy,
  unsaveRemedy,
  getSavedRemedies,
} = require('../controllers/remedyController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Search endpoint: GET /api/remedies/search?q=
router.get('/search', searchRemedies);

// Categories list: GET /api/remedies/categories
router.get('/categories', getCategories);

// Personalized recommendations: GET /api/remedies/recommended
router.get('/recommended', authenticate, getRecommended);

// User's saved remedies: GET /api/remedies/saved
router.get('/saved', authenticate, getSavedRemedies);

// Save / Unsave remedy: POST & DELETE /api/remedies/:id/save
router.post('/:id/save', authenticate, saveRemedy);
router.delete('/:id/save', authenticate, unsaveRemedy);

// Specific remedy: GET /api/remedies/:id
router.get('/:id', getRemedyById);

// List/filter remedies: GET /api/remedies
router.get('/', optionalAuth, getRemedies);

module.exports = router;
