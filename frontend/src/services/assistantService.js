import { api } from './api';
import { FALLBACK_PRODUCTS } from './productService';

export const assistantService = {
  ask: async (query) => {
    try {
      const response = await api.post('/assistant/ask', { query });
      if (response.data) return response.data;
    } catch {
      // Local fallback intelligent response
    }

    const lower = query.toLowerCase();
    let answer = 'Bellezza Science Insight: For your skin query, we recommend a balanced regimen focusing on acid mantle protection (pH 5.5), barrier restoration with bio-mimetic ceramides, and daily broad-spectrum photoprotection.';
    let suggestedIngredients = ['Ceramides', 'Centella Asiatica', 'Broad-Spectrum SPF'];
    let scientificInsights = 'Maintaining structural lamellar lipids in a 3:1:1 ratio protects skin cells from trans-epidermal water loss.';
    let recommendedProducts = [FALLBACK_PRODUCTS[1], FALLBACK_PRODUCTS[2]];

    if (lower.includes('retinol') || lower.includes('wrinkle') || lower.includes('aging')) {
      answer = 'Introduce microencapsulated bio-retinoids 2-3 nights per week to accelerate cellular turnover without compromising your skin barrier.';
      suggestedIngredients = ['Granactive Retinoid', 'Copper Peptides', 'Olive Squalane'];
      scientificInsights = 'Retinoids stimulate fibroblast pro-collagen production and compact the stratum corneum.';
      recommendedProducts = [FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[1]];
    } else if (lower.includes('acne') || lower.includes('blemish') || lower.includes('pore')) {
      answer = 'Combine 10% pure Niacinamide with Zinc PCA to modulate sebocyte lipogenesis and clarify congested pores.';
      suggestedIngredients = ['10% Niacinamide', 'Zinc PCA', 'Papain Enzymes'];
      scientificInsights = 'Niacinamide stabilizes follicular cellular cohesion, preventing micro-comedone formation.';
      recommendedProducts = [FALLBACK_PRODUCTS[4], FALLBACK_PRODUCTS[3]];
    }

    return {
      query,
      answer,
      scientificInsights,
      suggestedIngredients,
      recommendedProducts,
      timestamp: new Date().toISOString(),
    };
  },

  getHistory: async () => {
    try {
      const response = await api.get('/assistant/history');
      if (response.data) return response.data;
    } catch {
      // Local fallback
    }
    return [];
  },
};
