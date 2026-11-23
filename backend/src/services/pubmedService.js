const { pubmed } = require('../integrations/pubmed');
const { memoryCache } = require('../utils/apiCache');

class PubMedService {
  /**
   * Search peer-reviewed dermatological studies for an ingredient with caching
   * @param {string} ingredientName
   * @param {number} maxResults
   */
  async getDermatologyEvidence(ingredientName, maxResults = 3) {
    if (!ingredientName) return { totalStudies: 0, studies: [] };
    const cleanKey = `pubmed_${ingredientName.toLowerCase().trim()}_${maxResults}`;

    const cached = memoryCache.get(cleanKey);
    if (cached) return cached;

    const data = await pubmed.searchDermatologicalStudies(ingredientName, maxResults);
    if (data && data.studies) {
      memoryCache.set(cleanKey, data, 1000 * 60 * 60 * 24 * 7); // 7 days cache
    }
    return data;
  }
}

const pubmedService = new PubMedService();

module.exports = {
  pubmedService,
};

