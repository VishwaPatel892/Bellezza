const routineService = require('../services/routineService');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Get user routines
 */
const getRoutines = async (req, res, next) => {
  try {
    const routines = await routineService.getUserRoutines(req.user.id);
    return sendSuccess(res, routines, 'Routines retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle routine step completion
 */
const toggleStep = async (req, res, next) => {
  try {
    const { id, stepNumber } = req.params;
    const routine = await routineService.toggleStepCompletion(req.user.id, id, stepNumber);
    return sendSuccess(res, routine, 'Step status updated.');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new routine
 */
const createRoutine = async (req, res, next) => {
  try {
    const routine = await routineService.createRoutine(req.user.id, req.body);
    return sendCreated(res, routine, 'Routine protocol created.');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete routine
 */
const deleteRoutine = async (req, res, next) => {
  try {
    const result = await routineService.deleteRoutine(req.user.id, req.params.id);
    return sendSuccess(res, result, 'Routine deleted.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get routine by ID
 */
const getRoutineById = async (req, res, next) => {
  try {
    const routine = await routineService.getRoutineById(req.userId || req.user.id, req.params.id);
    return sendSuccess(res, routine, 'Routine details retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Update routine
 */
const updateRoutine = async (req, res, next) => {
  try {
    const routine = await routineService.updateRoutine(req.userId || req.user.id, req.params.id, req.body);
    return sendSuccess(res, routine, 'Routine protocol updated.');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark routine complete
 */
const completeRoutine = async (req, res, next) => {
  try {
    const result = await routineService.completeRoutine(req.userId || req.user.id, req.params.id, req.body);
    return sendSuccess(res, result, 'Routine marked completed.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get routine history
 */
const getRoutineHistory = async (req, res, next) => {
  try {
    const history = await routineService.getRoutineHistory(req.userId || req.user.id, req.query);
    return sendSuccess(res, history, 'Routine history retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get routine statistics
 */
const getRoutineStatistics = async (req, res, next) => {
  try {
    const stats = await routineService.getRoutineStatistics(req.userId || req.user.id);
    return sendSuccess(res, stats, 'Routine statistics retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  toggleStep,
  completeRoutine,
  getRoutineHistory,
  getRoutineStatistics,
};
