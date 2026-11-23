const { journalService } = require('../services/journalService');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

const getEntries = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const result = await journalService.getEntries(userId, req.query);
    return sendSuccess(res, result, 'Journal entries retrieved.');
  } catch (error) {
    next(error);
  }
};

const createEntry = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const entry = await journalService.upsertDailyEntry(userId, req.body);
    return sendCreated(res, entry, 'Skin journal entry recorded.');
  } catch (error) {
    next(error);
  }
};

const getEntryById = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const entry = await journalService.getEntryById(userId, req.params.id);
    return sendSuccess(res, entry, 'Journal entry retrieved.');
  } catch (error) {
    next(error);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const entry = await journalService.updateEntry(userId, req.params.id, req.body);
    return sendSuccess(res, entry, 'Journal entry updated.');
  } catch (error) {
    next(error);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const result = await journalService.deleteEntry(userId, req.params.id);
    return sendSuccess(res, result, 'Journal entry deleted.');
  } catch (error) {
    next(error);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const timeline = await journalService.getTimeline(userId);
    return sendSuccess(res, timeline, 'Skin progress timeline retrieved.');
  } catch (error) {
    next(error);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const progress = await journalService.getProgressStatistics(userId);
    return sendSuccess(res, progress, 'Skin progress statistics computed.');
  } catch (error) {
    next(error);
  }
};

const savePhoto = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const photo = await journalService.savePhoto(userId, req.body);
    return sendCreated(res, photo, 'Progress photo saved.');
  } catch (error) {
    next(error);
  }
};

const getPhotos = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const photos = await journalService.getPhotos(userId);
    return sendSuccess(res, photos, 'Progress photos retrieved.');
  } catch (error) {
    next(error);
  }
};

const deletePhoto = async (req, res, next) => {
  try {
    const userId = req.userId || req.user.id;
    const result = await journalService.deletePhoto(userId, req.params.id);
    return sendSuccess(res, result, 'Progress photo removed.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
