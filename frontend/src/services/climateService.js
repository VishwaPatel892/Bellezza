import { api } from './api';

export const climateService = {
  /**
   * Get list of major Indian cities
   */
  getCities: async () => {
    try {
      const res = await api.get('/climate/cities');
      if (res && res.data) return res.data;
    } catch (err) {
      console.warn('[climateService.getCities] fallback:', err.message);
    }
    return [
      { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', climateType: 'Tropical Coastal' },
      { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', climateType: 'Semi-Arid Extreme' },
      { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', climateType: 'Tropical Savanna' },
      { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', climateType: 'Tropical Wet & Dry' },
    ];
  },

  /**
   * Get real-time weather & dermatological recommendations for an Indian location
   */
  getCurrentClimate: async ({ cityId = 'mumbai', lat, lon } = {}) => {
    try {
      const params = {};
      if (cityId) params.city = cityId;
      if (lat) params.lat = String(lat);
      if (lon) params.lon = String(lon);

      const res = await api.get('/climate/current', params);
      if (res && res.data) return res.data;
    } catch (err) {
      console.warn('[climateService.getCurrentClimate] fallback:', err.message);
    }

    return {
      city: 'Mumbai, Maharashtra',
      climateType: 'Tropical Coastal',
      metrics: {
        temperature: 31,
        feelsLike: 33,
        humidity: 65,
        uvIndex: 6,
        condition: 'Clear Sky',
        icon: 'sun',
      },
      skincareGuidance: {
        barrierFocus: 'lightweight_hydration',
        uvAlert: 'high',
        recommendations: [
          {
            type: 'photoprotection',
            title: 'Rigorous Daylight Protection',
            advice: 'Moderate-high UV radiation. Apply a broad-spectrum SPF 50+ PA++++ sunscreen 15 minutes before stepping outside.',
          },
        ],
        disclaimer: 'Weather conditions provide environmental context for topical hydration and photoprotection, but do not replace clinical dermatological advice.',
      },
      isOfflineFallback: true,
    };
  },
};

export default climateService;

