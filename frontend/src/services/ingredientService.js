import { api } from './api';

export const ingredientService = {
  /**
   * Search cosmetic ingredients
   * @param {string} query 
   * @returns {Promise<object[]>}
   */
  searchIngredients: async (query = '') => {
    try {
      const res = await api.get('/ingredients/search', query ? { q: query } : {});
      if (res && res.data) {
        return res.data;      
      }
    } catch (err) {
      console.warn('[ingredientService.searchIngredients] API fallback:', err.message);
    }
    return [];
  },

  /**
   * Get detailed scientific profile for an ingredient
   * @param {string} name 
   * @returns {Promise<object>}
   */
  getIngredientByName: async (name) => {
    if (!name) return null;
    try {
      const res = await api.get(`/ingredients/${encodeURIComponent(name)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`[ingredientService.getIngredientByName] ${name} lookup:`, err.message);
    }
    return null;
  },

  /**
   * Deep Ingredient Intelligence (PubChem + PubMed + INCI Profile)
   * @param {string} name 
   */
  getIngredientIntelligence: async (name) => {
    if (!name) return null;
    try {
      const res = await api.get(`/ingredients/intelligence/${encodeURIComponent(name)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`[ingredientService.getIngredientIntelligence] ${name} error:`, err.message);
    }
    return null;
  },

  /**
   * Analyze formula or list of ingredients
   * @param {string[]|string} ingredients 
   * @returns {Promise<object>}
   */
  analyzeIngredients: async (ingredients) => {
    try {
      const res = await api.post('/ingredients/analyze', { ingredients });
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[ingredientService.analyzeIngredients] API fallback:', err.message);
      throw err;
    }
  },

  /**
   * Check compatibility between active ingredients
   */
  checkCompatibility: async (ingredients = []) => {
    try {
      const res = await api.post('/ingredients/compatibility', { ingredients });
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[ingredientService.checkCompatibility] error:', err.message);
      throw err;
    }
  },

  /**
   * Save ingredient
   */
  saveIngredient: async (name) => {
    const res = await api.post('/ingredients/save', { ingredientName: name });
    return res.data;
  },

  /**
   * Unsave ingredient
   */
  unsaveIngredient: async (name) => {
    const res = await api.delete('/ingredients/save', { data: { ingredientName: name } });
    return res.data;
  },

  /**
   * Get saved ingredients
   */
  getSavedIngredients: async () => {
    try {
      const res = await api.get('/ingredients/saved');
      if (res && res.data) return res.data;
    } catch {}
    return [];
  },

  /**
   * Catalog of ingredients
   */
  getIngredients: async (params = {}) => {
    try {
      const res = await api.get('/ingredients', { params });
      if (res && res.data) return res.data;
    } catch {}
    return [];
  },

  /**
   * Check external API status and attribution info
   */
  getExternalStatus: async () => {
    try {
      const res = await api.get('/external/status');
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[ingredientService.getExternalStatus] fallback:', err.message);
    }
    return {
      openBeautyFacts: { status: 'operational' },
      dermalytics: { status: 'scientific_inci_index_active' },
    };
  },
};

export default ingredientService;
