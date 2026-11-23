const { INDIAN_CITIES } = require('../utils/indianMarket');
const { memoryCache } = require('../utils/apiCache');

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

class WeatherClient {
  constructor() {
    this.baseUrl = OPEN_METEO_BASE_URL;
    this.timeoutMs = 7000;
  }

  /**
   * Internal fetch with timeout
   */
  async _fetch(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Interpret WMO Weather Code
   */
  _getWeatherCondition(code) {
    if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
    if ([1, 2, 3].includes(code)) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
    if ([45, 48].includes(code)) return { condition: 'Fog / Haze', icon: 'cloud-fog' };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { condition: 'Rain / Monsoon Showers', icon: 'cloud-rain' };
    if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
    return { condition: 'Moderate Weather', icon: 'cloud' };
  }

  /**
   * Generate evidence-informed skincare guidance based on Indian climate parameters
   */
  _generateSkincareGuidance({ temp, humidity, uvIndex, cityName }) {
    const recommendations = [];
    let barrierFocus = 'balanced';
    let uvAlert = 'moderate';

    // 1. UV Index Analysis
    if (uvIndex >= 8) {
      uvAlert = 'very_high';
      recommendations.push({
        type: 'photoprotection',
        title: 'High-Energy Solar Shielding',
        advice: 'UV index is elevated. Apply a broad-spectrum SPF 50+ PA++++ sunscreen. Reapply every 2 hours if outdoors, and wear protective UV-blocking eyewear.',
      });
    } else if (uvIndex >= 6) {
      uvAlert = 'high';
      recommendations.push({
        type: 'photoprotection',
        title: 'Rigorous Daylight Protection',
        advice: 'Moderate-high UV radiation. Ensure 2 finger-lengths of photostable sunscreen 15 minutes before stepping outside.',
      });
    } else {
      uvAlert = 'moderate';
      recommendations.push({
        type: 'photoprotection',
        title: 'Baseline Photoprotection',
        advice: 'Daily broad-spectrum SPF 30+ PA+++ recommended to defend against ambient UVA photo-aging.',
      });
    }

    // 2. Humidity Analysis
    if (humidity > 70) {
      barrierFocus = 'lightweight_matte';
      recommendations.push({
        type: 'hydration',
        title: 'Tropical Humidity Adaptation',
        advice: `Humidity in ${cityName} is ${humidity}%. Switch to lightweight, oil-free gel moisturizers or water-based hyaluronic acid fluids to prevent pore congestion and follicular sweat occlusion.`,
      });
      recommendations.push({
        type: 'cleansing',
        title: 'Sebum & Sweat Balance',
        advice: 'Use a gentle pH 5.5 foaming or micellar gel cleanser in the evening to dissolve micro-pollutants and sebum oxidation without barrier disruption.',
      });
    } else if (humidity < 35) {
      barrierFocus = 'barrier_repair_occlusive';
      recommendations.push({
        type: 'hydration',
        title: 'Stratum Corneum TEWL Defense',
        advice: `Atmospheric humidity is dry (${humidity}%). Apply humectants (glycerin/hyaluronic acid) onto damp skin immediately followed by a ceramide-rich barrier cream to prevent trans-epidermal water loss.`,
      });
    } else {
      barrierFocus = 'balanced_hydration';
      recommendations.push({
        type: 'hydration',
        title: 'Balanced Climate Equilibrium',
        advice: `Optimal ambient humidity (${humidity}%). Maintain physiological lipid balance with lightweight ceramide lotion and antioxidant serum.`,
      });
    }

    // 3. Thermal stress (Temperature > 34°C)
    if (temp >= 34) {
      recommendations.push({
        type: 'soothing',
        title: 'Erythema & Calming Support',
        advice: 'Elevated ambient heat triggers cutaneous micro-vessel dilation. Consider soothing botanical actives such as Centella Asiatica (Cica), Allantoin, or Aloe to calm facial flushing.',
      });
    }

    return {
      barrierFocus,
      uvAlert,
      recommendations,
      disclaimer: 'Weather conditions provide environmental context for topical hydration and photoprotection, but do not replace clinical dermatological advice.',
    };
  }

  /**
   * Get real-time weather and skincare guidance for an Indian city or coordinates
   * @param {object} params - { cityId, lat, lon }
   */
  async getWeatherForLocation({ cityId, lat, lon } = {}) {
    let targetLat = lat;
    let targetLon = lon;
    let cityName = 'Custom Location';
    let climateType = 'Indian Subcontinent Climate';

    // If cityId provided, match against predefined Indian cities
    if (cityId) {
      const city = INDIAN_CITIES.find((c) => c.id.toLowerCase() === cityId.toLowerCase());
      if (city) {
        targetLat = city.lat;
        targetLon = city.lon;
        cityName = `${city.name}, ${city.state}`;
        climateType = city.climateType;
      }
    }

    // Default to Mumbai if neither coordinates nor cityId provided
    if (!targetLat || !targetLon) {
      const defaultCity = INDIAN_CITIES[0]; // Mumbai
      targetLat = defaultCity.lat;
      targetLon = defaultCity.lon;
      cityName = `${defaultCity.name}, ${defaultCity.state}`;
      climateType = defaultCity.climateType;
    }

    const cacheKey = `weather_${targetLat.toFixed(2)}_${targetLon.toFixed(2)}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,uv_index&timezone=Asia%2FKolkata`;

    try {
      const data = await this._fetch(url);
      const cur = data?.current || {};

      const temp = cur.temperature_2m ?? 28;
      const humidity = cur.relative_humidity_2m ?? 50;
      const feelsLike = cur.apparent_temperature ?? temp;
      const uvIndex = cur.uv_index ?? 5;
      const weatherCode = cur.weather_code ?? 0;
      const weatherInfo = this._getWeatherCondition(weatherCode);

      const guidance = this._generateSkincareGuidance({ temp, humidity, uvIndex, cityName });

      const result = {
        city: cityName,
        climateType,
        coordinates: { lat: targetLat, lon: targetLon },
        timezone: 'Asia/Kolkata',
        timestamp: cur.time || new Date().toISOString(),
        metrics: {
          temperature: temp,
          feelsLike,
          humidity,
          uvIndex,
          condition: weatherInfo.condition,
          icon: weatherInfo.icon,
        },
        skincareGuidance: guidance,
        source: 'Open-Meteo Meteorological Forecast API',
        attribution: 'Weather and solar UV index data provided by Open-Meteo under CC BY 4.0.',
      };

      memoryCache.set(cacheKey, result, 1000 * 60 * 15); // 15 minutes TTL
      return result;
    } catch (err) {
      console.warn(`[WeatherClient] getWeatherForLocation failed for ${cityName}:`, err.message);
      // Safe fallback
      return {
        city: cityName,
        climateType,
        coordinates: { lat: targetLat, lon: targetLon },
        timezone: 'Asia/Kolkata',
        timestamp: new Date().toISOString(),
        metrics: {
          temperature: 30,
          feelsLike: 32,
          humidity: 55,
          uvIndex: 6,
          condition: 'Partly Cloudy',
          icon: 'sun',
        },
        skincareGuidance: this._generateSkincareGuidance({ temp: 30, humidity: 55, uvIndex: 6, cityName }),
        source: 'Bellezza Indian Climate Baseline',
        isOfflineFallback: true,
      };
    }
  }
}

const weather = new WeatherClient();

module.exports = {
  WeatherClient,
  weather,
};

