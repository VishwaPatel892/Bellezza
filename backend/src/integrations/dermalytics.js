const config = require('../config/env');
const {
  normalizeIngredient,
  analyzeIngredientList,
  INCI_KNOWLEDGE_BASE,
} = require('../utils/normalizeIngredient');

const DERMALYTICS_BASE_URL = 'https://api.dermalytics.dev';

/**
 * Dermalytics External API Integration Client
 */
class DermalyticsClient {
  constructor() {
    this.baseUrl = DERMALYTICS_BASE_URL;
    this.apiKey = process.env.DERMALYTICS_API_KEY || null;
    this.timeoutMs = 6000;
  }

  /**
   * Internal fetch with bearer auth and timeout
   */
  async _fetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'BellezzaApp/1.0 (contact@bellezza.skin)',
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Dermalytics API returned ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Search cosmetic ingredients
   * @param {string} query 
   * @returns {Promise<object[]>}
   */
  async searchIngredients(query) {
    const cleanQuery = (query || '').toLowerCase().trim();

    // 1. If API key exists, attempt live call
    if (this.apiKey) {
      try {
        const data = await this._fetch(`/v1/ingredients?q=${encodeURIComponent(cleanQuery)}`);
        if (Array.isArray(data.ingredients)) {
          return data.ingredients.map((i) => normalizeIngredient(i));
        }
      } catch (err) {
        console.warn('[Dermalytics] searchIngredients remote call fallback:', err.message);
      }
    }

    // 2. Fallback to scientific INCI reference index
    const matches = Object.entries(INCI_KNOWLEDGE_BASE)
      .filter(([key, val]) => {
        if (!cleanQuery) return true;
        return (
          key.includes(cleanQuery) ||
          val.name.toLowerCase().includes(cleanQuery) ||
          val.functions.some((f) => f.toLowerCase().includes(cleanQuery))
        );
      })
      .map(([, val]) => normalizeIngredient(val));

    return matches;
  }

  /**
   * Get single ingredient profile by name
   * @param {string} name 
   * @returns {Promise<object>}
   */
  async getIngredientByName(name) {
    if (!name) return null;
    const cleanName = name.trim();

    // 1. If API key configured, attempt remote lookup
    if (this.apiKey) {
      try {
        const data = await this._fetch(`/v1/ingredients/${encodeURIComponent(cleanName)}`);
        if (data) {
          return normalizeIngredient(data);
        }
      } catch (err) {
        console.warn(`[Dermalytics] getIngredientByName(${cleanName}) fallback:`, err.message);
      }
    }

    // 2. Fallback to internal scientific dictionary
    return normalizeIngredient(null, cleanName);
  }

  /**
   * Analyze multi-ingredient formula
   * @param {string[]|string} ingredients 
   * @returns {Promise<object>}
   */
  async analyzeFormula(ingredients) {
    const list = Array.isArray(ingredients)
      ? ingredients
      : (ingredients || '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

    // 1. If API key configured, attempt remote analysis
    if (this.apiKey && list.length > 0) {
      try {
        const data = await this._fetch('/v1/analyze', {
          method: 'POST',
          body: JSON.stringify({ ingredients: list }),
        });
        if (data && data.ingredients) {
          return {
            totalIngredients: data.ingredients.length,
            overallSafety: data.safety_status || 'low',
            summary: `Verified via Dermalytics INCI Engine. Evaluated ${data.ingredients.length} chemical and botanical compounds.`,
            ingredients: data.ingredients.map((i) => normalizeIngredient(i)),
            disclaimer: 'Third-party cosmetic ratings are dermatological reference indicators, not medical diagnoses.',
            source: 'Dermalytics API',
            analyzedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Dermalytics] analyzeFormula remote call fallback:', err.message);
      }
    }

    // 2. Perform deep local scientific dermatological analysis
    return analyzeIngredientList(list);
  }
}

const dermalytics = new DermalyticsClient();

module.exports = {
  DermalyticsClient,
  dermalytics,
};

