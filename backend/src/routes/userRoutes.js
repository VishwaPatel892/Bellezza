const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  validateProfileUpdate,
  validateSkinProfileUpdate,
  validateAccountDeletion,
} = require('../middleware/validateRequest');

const router = express.Router();

// User profile endpoints
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateProfileUpdate, userController.updateProfile);
router.get('/skin-profile', authenticate, userController.getSkinProfile);
router.put('/skin-profile', authenticate, validateSkinProfileUpdate, userController.updateSkinProfile);
router.delete('/account', authenticate, validateAccountDeletion, userController.deleteAccount);

// DPDP Act 2023 Compliance Endpoints
router.get('/export-data', authenticate, userController.exportData);
router.put('/consent', authenticate, userController.updateConsent);

// Backward compatibility with earlier frontend calls
router.put('/me', authenticate, validateProfileUpdate, userController.updateMe);

module.exports = router;
