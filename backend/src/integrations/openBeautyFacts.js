const { normalizeProduct } = require('../utils/normalizeProduct');

const OBF_BASE_URL = 'https://world.openbeautyfacts.org';
const USER_AGENT = 'BellezzaApp/1.0 (contact@bellezza.skin; https://bellezza.skin)';

/**
 * Open Beauty Facts External API Integration Client
 */
class OpenBeautyFactsClient {
  constructor() {
    this.baseUrl = OBF_BASE_URL;
    this.userAgent = USER_AGENT;
    this.timeoutMs = 8000;
  }

  /**
   * Helper fetch with timeout and headers
   */
  async _fetch(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Open Beauty Facts API returned status ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Search cosmetic products by free text query or category
   * @param {string} query 
   * @param {object} options - { page = 1, pageSize = 20, category }
   * @returns {Promise<{ products: object[], total: number, page: number, pageSize: number }>}
   */
  async searchProducts(query, { page = 1, pageSize = 20, category } = {}) {
    try {
      let url = '';
      if (category && !query) {
        // Search by category tag
        const cleanCat = encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'));
        url = `${this.baseUrl}/api/v2/search?categories_tags_en=${cleanCat}&page=${page}&page_size=${pageSize}&fields=code,product_name,product_name_en,brands,image_url,image_front_url,ingredients_text,ingredients_text_en,categories,categories_tags,packaging`;
      } else {
        const cleanQuery = encodeURIComponent(query || 'cream');
        url = `${this.baseUrl}/cgi/search.pl?search_terms=${cleanQuery}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`;
      }

      const data = await this._fetch(url);
      const rawProducts = Array.isArray(data.products) ? data.products : [];
      const normalized = rawProducts
        .map((p) => normalizeProduct(p, 'Open Beauty Facts'))
        .filter((p) => Boolean(p.name && p.name !== 'Unnamed Cosmetic Product'));

      return {
        products: normalized,
        total: data.count || normalized.length,
        page: Number(page),
        pageSize: Number(pageSize),
        source: 'Open Beauty Facts',
      };
    } catch (error) {
      console.warn('[OpenBeautyFacts] searchProducts failed:', error.message);
      return {
        products: [],
        total: 0,
        page: Number(page),
        pageSize: Number(pageSize),
        source: 'Open Beauty Facts',
        error: error.message,
      };
    }
  }

  /**
   * Retrieve cosmetic product by Barcode (EAN / UPC)
   * @param {string} barcode 
   * @returns {Promise<object|null>}
   */
  async getProductByBarcode(barcode) {
    if (!barcode) return null;
    const cleanBarcode = barcode.trim();
    const url = `${this.baseUrl}/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`;

    try {
      const data = await this._fetch(url);
      if (data.status === 1 && data.product) {
        return normalizeProduct(data.product, 'Open Beauty Facts');
      }
      return null;
    } catch (error) {
      console.warn(`[OpenBeautyFacts] getProductByBarcode(${cleanBarcode}) failed:`, error.message);
      return null;
    }
  }

  /**
   * Retrieve product by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async getProductById(id) {
    return this.getProductByBarcode(id);
  }
}

const openBeautyFacts = new OpenBeautyFactsClient();

module.exports = {
  OpenBeautyFactsClient,
  openBeautyFacts,
};

