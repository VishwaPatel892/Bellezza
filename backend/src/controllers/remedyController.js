const remedyService = require('../services/remedyService');
const { groqService } = require('../services/groqService');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getRemedies = async (req, res, next) => {
  try {
    const { category, search, skinType, page, limit } = req.query;
    const result = await remedyService.getRemedies({ category, search, skinType, page, limit });
    return sendSuccess(res, result, 'Remedies retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const searchRemedies = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const remedies = await remedyService.searchRemedies(query);
    return sendSuccess(res, remedies, 'Search results retrieved.');
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await remedyService.getCategories();
    return sendSuccess(res, categories, 'Categories retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const getRecommended = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const recommended = await remedyService.getRecommendedRemedies(userId);
    return sendSuccess(res, recommended, 'Personalized remedies retrieved.');
  } catch (error) {
    next(error);
  }
};

const getRemedyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const remedy = await remedyService.getRemedyById(id);
    return sendSuccess(res, remedy, 'Remedy details retrieved.');
  } catch (error) {
    next(error);
  }
};

const saveRemedy = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    const { notes } = req.body || {};
    const saved = await remedyService.saveRemedy(userId, id, notes);
    return sendSuccess(res, saved, 'Remedy saved to personal library.');
  } catch (error) {
    next(error);
  }
};

const unsaveRemedy = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    await remedyService.unsaveRemedy(userId, id);
    return sendSuccess(res, { success: true }, 'Remedy removed from saved list.');
  } catch (error) {
    next(error);
  }
};

const getSavedRemedies = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const saved = await remedyService.getSavedRemedies(userId);
    return sendSuccess(res, saved, 'Saved remedies retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * AI Home Remedy Formulation powered by Groq 120B
 * POST /api/remedies/ai-formulate
 */
const aiFormulate = async (req, res, next) => {
  try {
    const { concern, skinType, allergies, availableIngredients } = req.body || {};

    if (!concern || !concern.trim()) {
      return sendError(res, 'Please provide a skin concern for remedy formulation (e.g. "Acne", "Dry barrier", "Dark spots").', 400);
    }

    // Inherit user profile allergies if logged in
    let userAllergies = allergies || [];
    let userSkinType = skinType || 'Combination';
    const userId = req.userId || req.user?.id;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userSkinType = skinType || user.skinProfile?.skinType || 'Combination';
        userAllergies = Array.from(new Set([
          ...userAllergies,
          ...(user.skinProfile?.knownIngredientAllergies || []),
          ...(user.skinProfile?.irritationTriggers || []),
        ]));
      }
    }

    const remedy = await groqService.formulateHomeRemedy({
      concern,
      skinType: userSkinType,
      allergies: userAllergies,
      availableIngredients: availableIngredients || [],
    });

    return sendSuccess(res, remedy, 'Evidence-based home remedy formulated successfully by Groq AI.');
  } catch (error) {
    next(error);
  }
};

/**
 * AI DIY Remedy Safety and Irritation Evaluation powered by Groq
 * POST /api/remedies/ai-safety-check
 */
const aiSafetyCheck = async (req, res, next) => {
  try {
    const { remedyName, ingredients, allergies } = req.body || {};

    if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
      return sendError(res, 'Please provide list of ingredients to audit for safety.', 400);
    }

    const audit = await groqService.evaluateRemedySafety({
      remedyName: remedyName || 'Custom Recipe',
      ingredients,
      userAllergies: allergies || [],
    });

    return sendSuccess(res, audit, 'Remedy safety audit completed.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRemedies,
  searchRemedies,
  getCategories,
  getRecommended,
  getRemedyById,
  saveRemedy,
  unsaveRemedy,
  getSavedRemedies,
  aiFormulate,
  aiSafetyCheck,
};
