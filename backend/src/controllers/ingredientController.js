const { ingredientService } = require('../services/ingredientService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Search cosmetic ingredients
 * GET /api/ingredients/search?q=
 */
const searchIngredients = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const results = await ingredientService.searchIngredients(q);
    return sendSuccess(res, results, 'Ingredients retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ingredient profile by INCI or common name
 * GET /api/ingredients/:name
 */
const getIngredientByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) {
      return sendError(res, 'Ingredient name is required.', 400);
    }
    const ingredient = await ingredientService.getIngredientByName(name);
    if (!ingredient) {
      return sendError(res, `Ingredient "${name}" not found.`, 404);
    }
    return sendSuccess(res, ingredient, 'Ingredient details retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze an array or comma-separated list of ingredients
 * POST /api/ingredients/analyze
 * Body: { ingredients: string[] | string }
 */
const analyzeIngredients = async (req, res, next) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
      return sendError(res, 'Please provide an array or list of ingredients to analyze.', 400);
    }
    const userId = req.userId || req.user?.id || null;
    const analysis = await ingredientService.analyzeFormula(ingredients, userId);
    return sendSuccess(res, analysis, 'Ingredient analysis completed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Deep Ingredient Intelligence (PubChem + PubMed + INCI Profile)
 * GET /api/ingredients/intelligence/:name
 */
const getIngredientIntelligence = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) {
      return sendError(res, 'Ingredient name is required.', 400);
    }
    const intelligence = await ingredientService.getIngredientIntelligence(name);
    return sendSuccess(res, intelligence, 'Ingredient intelligence retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * List / catalog of ingredients
 * GET /api/ingredients
 */
const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await ingredientService.getIngredients(req.query);
    return sendSuccess(res, ingredients, 'Ingredients catalog retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze ingredient compatibility
 * POST /api/ingredients/compatibility
 * Body: { ingredients: string[] }
 */
const checkCompatibility = async (req, res, next) => {
  try {
    const { ingredients } = req.body || {};
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      return sendError(res, 'Please provide an array of at least 2 ingredients to check compatibility.', 400);
    }
    const result = await ingredientService.checkCompatibility(ingredients);
    return sendSuccess(res, result, 'Ingredient compatibility evaluated.');
  } catch (error) {
    next(error);
  }
};

/**
 * Save ingredient to user profile
 * POST /api/ingredients/save
 * Body: { ingredientName: string }
 */
const saveIngredient = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { ingredientName, name } = req.body || {};
    const target = ingredientName || name;
    if (!target) {
      return sendError(res, 'Ingredient name is required.', 400);
    }
    const result = await ingredientService.saveIngredient(userId, target);
    return sendSuccess(res, result, 'Ingredient saved to profile.');
  } catch (error) {
    next(error);
  }
};

/**
 * Unsave ingredient
 * DELETE /api/ingredients/save
 */
const unsaveIngredient = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { ingredientName, name } = req.body || {};
    const target = ingredientName || name;
    await ingredientService.unsaveIngredient(userId, target);
    return sendSuccess(res, { success: true }, 'Ingredient removed from saved list.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's saved ingredients
 * GET /api/ingredients/saved
 */
const getSavedIngredients = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const saved = await ingredientService.getSavedIngredients(userId);
    return sendSuccess(res, saved, 'Saved ingredients retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIngredients,
  searchIngredients,
  getIngredientByName,
  getIngredientIntelligence,
  analyzeIngredients,
  checkCompatibility,
  saveIngredient,
  unsaveIngredient,
  getSavedIngredients,
};

