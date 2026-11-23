const { climateService } = require('../services/climateService');
const { sendSuccess } = require('../utils/response');

/**
 * Get list of supported Indian cities
 * GET /api/climate/cities
 */
const getSupportedCities = async (req, res, next) => {
  try {
    const cities = climateService.getSupportedCities();
    return sendSuccess(res, cities, 'Supported Indian cities retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current climate metrics and personalized skincare guidance
 * GET /api/climate/current?city=&lat=&lon=
 */
const getCurrentClimate = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;
    const climateData = await climateService.getClimateSkincare({
      cityId: city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });
    return sendSuccess(res, climateData, 'Real-time climate skincare guidance retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupportedCities,
  getCurrentClimate,
};

