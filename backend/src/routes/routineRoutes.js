const express = require('express');
const routineController = require('../controllers/routineController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All routine endpoints require authentication
router.use(authenticate);

// List / history / statistics
router.get('/', routineController.getRoutines);
router.post('/', routineController.createRoutine);
router.get('/history', routineController.getRoutineHistory);
router.get('/statistics', routineController.getRoutineStatistics);

// Single routine actions
router.get('/:id', routineController.getRoutineById);
router.put('/:id', routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);

// Complete routine or toggle step
router.post('/:id/complete', routineController.completeRoutine);
router.patch('/:id/steps/:stepNumber/toggle', routineController.toggleStep);

module.exports = router;
