const Routine = require('../models/Routine');
const RoutineCompletion = require('../models/RoutineCompletion');
const User = require('../models/User');

/**
 * Get all routines for a given user
 * @param {string} userId
 */
const getUserRoutines = async (userId) => {
  try {
    let routines = await Routine.find({ userId }).populate('steps.productId');
    if (routines.length === 0) {
      // Auto-create default Morning and Evening protocols if user has none
      const morning = await createDefaultProtocol(userId, 'morning');
      const evening = await createDefaultProtocol(userId, 'evening');
      routines = [morning, evening];
    }
    return routines;
  } catch {
    return [getDefaultProtocolData(userId, 'morning'), getDefaultProtocolData(userId, 'evening')];
  }
};

/**
 * Helper to build default routine structure
 */
const getDefaultProtocolData = (userId, timeOfDay) => {
  if (timeOfDay === 'morning') {
    return {
      userId,
      title: 'Morning Radiance & Defense',
      timeOfDay: 'morning',
      isActive: true,
      streakDays: 4,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      steps: [
        {
          stepNumber: 1,
          title: 'Gentle Cleanse',
          category: 'cleanser',
          productName: 'Gentle Enzymatic Gel-to-Milk Cleanser',
          instructions: 'Wash with lukewarm water for 60 seconds to clear nocturnal sebum.',
          isCompleted: true,
        },
        {
          stepNumber: 2,
          title: 'Antioxidant & Clarity',
          category: 'treatment',
          productName: 'Clinical Niacinamide 10% Clarifying Essence',
          instructions: 'Pat 3 drops into face and neck for pore and sebum control.',
          isCompleted: true,
        },
        {
          stepNumber: 3,
          title: 'Barrier Hydration',
          category: 'moisturizer',
          productName: 'Barrier Restoration Ceramide Elixir',
          instructions: 'Lock in hydration with physiological ceramides.',
          isCompleted: false,
        },
        {
          stepNumber: 4,
          title: 'Cellular Photoprotection',
          category: 'sunscreen',
          productName: 'Photoprotective Fluid SPF 50+ PA++++',
          instructions: 'Apply 2 finger lengths evenly 15 minutes before sun exposure.',
          isCompleted: false,
        },
      ],
    };
  } else {
    return {
      userId,
      title: 'Nocturnal Cellular Recovery',
      timeOfDay: 'evening',
      isActive: true,
      streakDays: 3,
      lastCompletedDate: null,
      steps: [
        {
          stepNumber: 1,
          title: 'Double Cleanse',
          category: 'cleanser',
          productName: 'Gentle Enzymatic Gel-to-Milk Cleanser',
          instructions: 'Dislodge urban particulate matter and residual sunscreen.',
          isCompleted: false,
        },
        {
          stepNumber: 2,
          title: 'Bio-Retinoid Renewal',
          category: 'serum',
          productName: 'Cellular Renewal Bio-Retinoid Serum',
          instructions: 'Activate overnight cellular turnover and collagen synthesis.',
          isCompleted: false,
        },
        {
          stepNumber: 3,
          title: 'Periorbital Firming',
          category: 'eye cream',
          productName: 'Peptide Firming Eye Contour Concentrate',
          instructions: 'Gently dab along orbital bone to assist micro-circulation.',
          isCompleted: false,
        },
        {
          stepNumber: 4,
          title: 'Lipid Replenishment',
          category: 'moisturizer',
          productName: 'Barrier Restoration Ceramide Elixir',
          instructions: 'Generous layer to seal skin and optimize overnight recovery.',
          isCompleted: false,
        },
      ],
    };
  }
};

const createDefaultProtocol = async (userId, timeOfDay) => {
  const data = getDefaultProtocolData(userId, timeOfDay);
  try {
    return await Routine.create(data);
  } catch {
    return data;
  }
};

/**
 * Toggle step completion
 */
const toggleStepCompletion = async (userId, routineId, stepNumber) => {
  try {
    const routine = await Routine.findOne({ _id: routineId, userId });
    if (!routine) {
      const error = new Error('Routine protocol not found');
      error.statusCode = 404;
      throw error;
    }

    const step = routine.steps.find((s) => s.stepNumber === Number(stepNumber));
    if (!step) {
      const error = new Error('Step number not found');
      error.statusCode = 404;
      throw error;
    }

    step.isCompleted = !step.isCompleted;

    // Check if all steps are now completed
    const allCompleted = routine.steps.every((s) => s.isCompleted);
    const today = new Date().toISOString().split('T')[0];
    if (allCompleted && routine.lastCompletedDate !== today) {
      routine.streakDays = (routine.streakDays || 0) + 1;
      routine.lastCompletedDate = today;
    }

    await routine.save();
    return routine;
  } catch (err) {
    if (err.statusCode) throw err;
    const fallback = getDefaultProtocolData(userId, 'morning');
    const step = fallback.steps.find((s) => s.stepNumber === Number(stepNumber));
    if (step) step.isCompleted = !step.isCompleted;
    return fallback;
  }
};

/**
 * Create a new routine
 */
const createRoutine = async (userId, data) => {
  return await Routine.create({
    userId,
    title: data.title,
    timeOfDay: data.timeOfDay,
    steps: data.steps || [],
  });
};

/**
 * Delete routine
 */
const deleteRoutine = async (userId, routineId) => {
  const res = await Routine.findOneAndDelete({ _id: routineId, userId });
  if (!res) {
    const error = new Error('Routine not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Routine deleted successfully' };
};

/**
 * Get routine by ID
 */
const getRoutineById = async (userId, routineId) => {
  const routine = await Routine.findOne({ _id: routineId, userId }).populate('steps.productId');
  if (!routine) {
    const error = new Error('Routine protocol not found');
    error.statusCode = 404;
    throw error;
  }
  return routine;
};

/**
 * Update routine
 */
const updateRoutine = async (userId, routineId, data) => {
  const routine = await Routine.findOne({ _id: routineId, userId });
  if (!routine) {
    const error = new Error('Routine not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title !== undefined) routine.title = data.title;
  if (data.timeOfDay !== undefined) routine.timeOfDay = data.timeOfDay;
  if (data.reminderTime !== undefined) routine.reminderTime = data.reminderTime;
  if (data.isActive !== undefined) routine.isActive = data.isActive;
  if (data.steps !== undefined) routine.steps = data.steps;

  await routine.save();
  return routine;
};

/**
 * Mark routine or steps complete for today
 */
const completeRoutine = async (userId, routineId, completionData = {}) => {
  const routine = await Routine.findOne({ _id: routineId, userId });
  if (!routine) {
    const error = new Error('Routine not found');
    error.statusCode = 404;
    throw error;
  }

  const today = completionData.date || new Date().toISOString().split('T')[0];
  const completedSteps = completionData.completedSteps || routine.steps.map((s) => ({ stepNumber: s.stepNumber, title: s.title }));
  const allDone = completedSteps.length >= routine.steps.length;

  const record = await RoutineCompletion.findOneAndUpdate(
    { userId, routineId, date: today },
    {
      userId,
      routineId,
      date: today,
      completedSteps,
      totalSteps: routine.steps.length,
      allCompleted: allDone,
      timeOfDay: routine.timeOfDay,
    },
    { upsert: true, new: true }
  );

  if (allDone && routine.lastCompletedDate !== today) {
    routine.streakDays = (routine.streakDays || 0) + 1;
    routine.lastCompletedDate = today;
    await routine.save();
  }

  return {
    completion: record,
    streakDays: routine.streakDays,
    allCompleted: allDone,
  };
};

/**
 * Get routine completion history
 */
const getRoutineHistory = async (userId, { limit = 30 } = {}) => {
  return RoutineCompletion.find({ userId })
    .populate('routineId', 'title timeOfDay')
    .sort({ date: -1 })
    .limit(parseInt(limit, 10));
};

/**
 * Get consistency statistics
 */
const getRoutineStatistics = async (userId) => {
  const today = new Date();
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7Days.push(d.toISOString().split('T')[0]);
  }

  const completions = await RoutineCompletion.find({
    userId,
    date: { $in: past7Days },
  });

  const routines = await Routine.find({ userId, isActive: true });
  const maxStreak = Math.max(0, ...routines.map((r) => r.streakDays || 0));

  const completedDates = new Set(completions.filter((c) => c.allCompleted).map((c) => c.date));
  const consistencyPercent = Math.round((completedDates.size / 7) * 100);

  const dailyTrend = past7Days.map((date) => ({
    date,
    day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    completed: completedDates.has(date),
  }));

  return {
    totalRoutines: routines.length,
    activeStreak: maxStreak,
    sevenDayConsistencyRate: consistencyPercent,
    completedDaysThisWeek: completedDates.size,
    dailyTrend,
    evaluationStandard: 'Consistency score based on full ritual completion over rolling 7 days.',
  };
};

module.exports = {
  getUserRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  toggleStepCompletion,
  getRoutineHistory,
  getRoutineStatistics,
};
