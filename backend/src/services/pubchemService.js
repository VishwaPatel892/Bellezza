const { pubchem } = require('../integrations/pubchem');
const { memoryCache } = require('../utils/apiCache');

class PubChemService {
  /**
   * Retrieve chemical identity and molecular properties with caching
   * @param {string} compoundName
   */
  async getProperties(compoundName) {
    if (!compoundName) return null;
    const cleanKey = `pubchem_${compoundName.toLowerCase().trim()}`;

    const cached = memoryCache.get(cleanKey);
    if (cached) return cached;

    const data = await pubchem.getCompoundProperties(compoundName);
    if (data) {
      memoryCache.set(cleanKey, data, 1000 * 60 * 60 * 24 * 7); // 7 days cache
    }
    return data;
  }
}

const pubchemService = new PubChemService();

module.exports = {
  pubchemService,
};

