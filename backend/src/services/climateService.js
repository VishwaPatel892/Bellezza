const { weather } = require('../integrations/weather');
const { INDIAN_CITIES } = require('../utils/indianMarket');

class ClimateService {
  /**
   * Get supported Indian cities list
   */
  getSupportedCities() {
    return INDIAN_CITIES.map((c) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      climateType: c.climateType,
    }));
  }

  /**
   * Retrieve current climate metrics and personalized skincare guidance
   * @param {object} options - { cityId, lat, lon }
   */
  async getClimateSkincare({ cityId, lat, lon } = {}) {
    return await weather.getWeatherForLocation({ cityId, lat, lon });
  }
}

const climateService = new ClimateService();

module.exports = {
  climateService,
};

