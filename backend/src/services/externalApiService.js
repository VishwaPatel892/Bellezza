const { openBeautyFacts } = require('../integrations/openBeautyFacts');
const { dermalytics } = require('../integrations/dermalytics');

/**
 * Service to manage external skincare API status, licensing, and metadata
 */
class ExternalApiService {
  /**
   * Health and connectivity diagnostics of integrated skincare APIs
   */
  async getStatus() {
    let obfOnline = false;
    let dermalyticsStatus = 'fallback_mode';

    try {
      const obfCheck = await openBeautyFacts.searchProducts('cream', { pageSize: 1 });
      obfOnline = obfCheck.products.length > 0;
    } catch {
      obfOnline = false;
    }

    if (process.env.DERMALYTICS_API_KEY) {
      dermalyticsStatus = 'live_api_active';
    } else {
      dermalyticsStatus = 'scientific_inci_index_active';
    }

    return {
      openBeautyFacts: {
        status: obfOnline ? 'operational' : 'degraded',
        attribution: 'Open Beauty Facts database licensed under Open Database License (ODbL).',
        url: 'https://world.openbeautyfacts.org',
      },
      dermalytics: {
        status: dermalyticsStatus,
        attribution: 'Cosmetic ingredient profiles referenced via INCI standard cosmetic indexes and Dermalytics engine.',
        url: 'https://www.dermalytics.dev',
      },
      disclaimer: 'Third-party cosmetic data, comedogenicity indices, and irritancy scores are scientific reference estimates, not medical advice.',
    };
  }
}

const externalApiService = new ExternalApiService();

module.exports = {
  externalApiService,
};

