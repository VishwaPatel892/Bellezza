const assistantService = require('../services/assistantService');
const { sendSuccess } = require('../utils/response');

/**
 * Handle AI consultation query
 */
const ask = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { query } = req.body;
    const consultation = await assistantService.askAssistant(userId, query);
    return sendSuccess(res, consultation, 'AI Skin Consultation complete.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get past consultation history
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await assistantService.getConsultationHistory(req.user.id);
    return sendSuccess(res, history, 'Consultation history retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ask,
  getHistory,
};
