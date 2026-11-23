const remedyService = require('../services/remedyService');
const { sendSuccess } = require('../utils/response');

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

module.exports = {
  getRemedies,
  searchRemedies,
  getCategories,
  getRecommended,
  getRemedyById,
  saveRemedy,
  unsaveRemedy,
  getSavedRemedies,
};
