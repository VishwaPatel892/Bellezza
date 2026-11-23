const Consultation = require('../models/Consultation');
const Product = require('../models/Product');

// Scientific knowledge base for skincare analysis
const DERM_KNOWLEDGE = [
  {
    keywords: ['retinol', 'retinoid', 'tretinoin', 'wrinkle', 'fine lines', 'aging'],
    scientificInsights: 'Retinoids bind to nuclear retinoic acid receptors (RARs) to stimulate pro-collagen gene expression and accelerate dermal fibroblast remodeling. Introduce gradually (2-3x weekly) and pair with ceramides to buffer TEWL.',
    suggestedIngredients: ['Hydroxypinacolone Retinoate', 'Copper Tri-peptides', 'Squalane', 'Ectoin'],
    recommendedProductCategories: ['serum', 'moisturizer'],
    answer: 'For cellular anti-aging and expression lines, bio-retinoids provide proven cell-turnover stimulation with minimal erythema. Always introduce slowly in your nocturnal routine and prioritize broad-spectrum SPF 50+ during daytime.',
  },
  {
    keywords: ['barrier', 'damaged', 'burning', 'redness', 'stinging', 'irritated', 'peeling'],
    scientificInsights: 'Stratum corneum disruption increases transepidermal water loss (TEWL) and compromises antimicrobial peptide defense. Reconstitution requires a 3:1:1 molar ratio of Ceramides, Cholesterol, and Essential Free Fatty Acids.',
    suggestedIngredients: ['Ceramide NP', 'Centella Asiatica', 'Colloidal Oat Beta-Glucan', 'Panthenol B5'],
    recommendedProductCategories: ['moisturizer', 'cleanser'],
    answer: 'Your skin barrier requires emergency physiological lipid replenishment. Pause all chemical exfoliants (AHA/BHA) and retinoids immediately. Focus on a minimalist barrier repair routine with physiological ceramides and oat beta-glucan.',
  },
  {
    keywords: ['acne', 'breakout', 'pimple', 'pores', 'blackhead', 'oil', 'blemish'],
    scientificInsights: 'Follicular hyperkeratinization combined with Cutibacterium acnes colonization triggers sterile localized inflammation. Niacinamide modulates sebocyte lipogenesis while enzymatic salicylic acid clears intra-pore keratin plugs.',
    suggestedIngredients: ['10% Niacinamide', 'Zinc PCA', 'Papain Enzymes', 'Willow Bark (Salicin)'],
    recommendedProductCategories: ['treatment', 'cleanser'],
    answer: 'Target excess sebum production and follicular inflammation with bioactive 10% Niacinamide coupled with Zinc PCA. Ensure daily gentle non-stripping cleansing so your skin does not overcompensate by producing more oil.',
  },
  {
    keywords: ['sunscreen', 'spf', 'uv', 'sun', 'protection', 'pigmentation', 'dark spot', 'melasma'],
    scientificInsights: 'Ultraviolet-A generates reactive oxygen species (ROS) inducing matrix metalloproteinase-1 (MMP-1) collagen degradation. Daily mineral-organic broad spectrum filters with PA++++ protection are fundamental to cellular longevity.',
    suggestedIngredients: ['Zinc Oxide', 'Ectoin', 'Resveratrol', 'Tinosorb S'],
    recommendedProductCategories: ['sunscreen'],
    answer: 'Daily photoprotection is the most non-negotiable step in cosmetic dermatology. Apply at least two finger lengths of SPF 50+ broad-spectrum fluid every single morning, regardless of weather or indoor exposure.',
  },
  {
    keywords: ['hydration', 'dry', 'dehydrated', 'flaky', 'tight'],
    scientificInsights: 'Skin hydration relies on intracellular Natural Moisturizing Factors (NMF) like sodium PCA, lactic acid, and multi-weight hyaluronic acid drawing water into stratum corneum micro-compartments.',
    suggestedIngredients: ['Multi-Molecular Hyaluronic Acid', 'Glycerin', 'Panthenol', 'Ceramide EOP'],
    recommendedProductCategories: ['moisturizer', 'serum'],
    answer: 'Combat epidermal dehydration by layering humectants on damp skin followed by an occlusive lipid emulsion to lock in micro-moisture throughout the day.',
  },
];

/**
 * Process a skincare consultation query
 * @param {string} userId
 * @param {string} query
 */
const askAssistant = async (userId, query) => {
  const normalized = query.toLowerCase();

  // Find best matching knowledge item
  let match = DERM_KNOWLEDGE.find((item) =>
    item.keywords.some((kw) => normalized.includes(kw))
  );

  if (!match) {
    match = {
      scientificInsights: 'Balanced epidermal health depends on maintaining the acidic acid mantle (pH 4.5-5.5) alongside synergistic active ingredients that support fibroblast viability and mitochondrial energy.',
      suggestedIngredients: ['Centella Asiatica', 'Niacinamide', 'Ceramides', 'Broad-Spectrum SPF'],
      recommendedProductCategories: ['serum', 'moisturizer', 'sunscreen'],
      answer: `Bellezza Skincare Science: For "${query}", the recommended clinical approach is a balanced routine prioritizing gentle enzymatic cleansing, barrier restoration with physiological lipids, and strict broad-spectrum UV protection.`,
    };
  }

  // Fetch recommended products
  let recommendedProducts = [];
  try {
    recommendedProducts = await Product.find({
      category: { $in: match.recommendedProductCategories },
    }).limit(3);
  } catch {
    recommendedProducts = [];
  }

  // Save consultation
  try {
    if (userId) {
      await Consultation.create({
        userId,
        query,
        response: match.answer,
        suggestedIngredients: match.suggestedIngredients,
        recommendedProductIds: recommendedProducts.map((p) => p._id),
        scientificInsights: match.scientificInsights,
      });
    }
  } catch {
    // Graceful save
  }

  return {
    query,
    answer: match.answer,
    scientificInsights: match.scientificInsights,
    suggestedIngredients: match.suggestedIngredients,
    recommendedProducts,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get consultation history for a user
 * @param {string} userId
 */
const getConsultationHistory = async (userId) => {
  try {
    return await Consultation.find({ userId })
      .populate('recommendedProductIds')
      .sort({ createdAt: -1 })
      .limit(20);
  } catch {
    return [];
  }
};

module.exports = {
  askAssistant,
  getConsultationHistory,
};
