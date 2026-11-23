const express = require('express');
const {
  getSupportedCities,
  getCurrentClimate,
} = require('../controllers/climateController');

const router = express.Router();

// Supported Indian cities: GET /api/climate/cities
router.get('/cities', getSupportedCities);

// Real-time weather and climate guidance: GET /api/climate/current?city=&lat=&lon=
router.get('/current', getCurrentClimate);

module.exports = router;

