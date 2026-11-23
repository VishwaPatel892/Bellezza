const express = require('express');
const {
  getEntries,
  createEntry,
  getEntryById,
  updateEntry,
  deleteEntry,
  getTimeline,
  getProgress,
  savePhoto,
  getPhotos,
  deletePhoto,
} = require('../controllers/journalController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All journal routes require authentication
router.use(authenticate);

// Timeline & statistics
router.get('/timeline', getTimeline);
router.get('/progress', getProgress);

// Progress photo management
router.get('/photos', getPhotos);
router.post('/photos', savePhoto);
router.delete('/photos/:id', deletePhoto);

// Journal CRUD
router.get('/:id', getEntryById);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);
router.get('/', getEntries);
router.post('/', createEntry);

module.exports = router;
