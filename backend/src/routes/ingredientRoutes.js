const express = require('express');
const {
  getIngredients,
  searchIngredients,
  getIngredientByName,
  getIngredientIntelligence,
  analyzeIngredients,
  checkCompatibility,
  saveIngredient,
  unsaveIngredient,
  getSavedIngredients,
} = require('../controllers/ingredientController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Search cosmetic ingredients: GET /api/ingredients/search?q=
router.get('/search', searchIngredients);

// Compatibility checker: POST /api/ingredients/compatibility
router.post('/compatibility', checkCompatibility);

// Analyze formula or ingredient list: POST /api/ingredients/analyze
router.post('/analyze', optionalAuth, analyzeIngredients);

// User saved ingredients: GET, POST, DELETE /api/ingredients/saved & /save
router.get('/saved', authenticate, getSavedIngredients);
router.post('/save', authenticate, saveIngredient);
router.delete('/save', authenticate, unsaveIngredient);

// Deep Ingredient Intelligence (PubChem + PubMed + INCI): GET /api/ingredients/intelligence/:name
router.get('/intelligence/:name', getIngredientIntelligence);

// Single ingredient profile: GET /api/ingredients/:name
router.get('/:name', getIngredientByName);

// Catalog listing: GET /api/ingredients
router.get('/', getIngredients);

module.exports = router;
