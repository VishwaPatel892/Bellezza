/**
 * Comprehensive INCI Reference Dictionary for Dermatological & Cosmetic Analysis
 * Standardized scientific reference dataset for cosmetic ingredients.
 */
const INCI_KNOWLEDGE_BASE = {
  niacinamide: {
    name: 'Niacinamide (Vitamin B3)',
    synonyms: ['Nicotinamide', 'Pyridine-3-carboxamide', 'Vitamin B3'],
    functions: ['Antioxidant', 'Skin Restoring', 'Barrier Strengthening', 'Sebum Regulating'],
    description: 'Physiologically active form of vitamin B3. Supports stratum corneum ceramide biosynthesis, modulates hyperpigmentation via melanosome transfer inhibition, and decreases transepidermal water loss.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'hyaluronic acid': {
    name: 'Hyaluronic Acid',
    synonyms: ['Sodium Hyaluronate', 'Hydrolyzed Hyaluronic Acid'],
    functions: ['Humectant', 'Moisturizing', 'Viscosity Controlling'],
    description: 'Endogenous glycosaminoglycan with exceptional hydrophilic binding capacity (up to 1,000 times its molecular weight in water). Promotes viscoelastic epidermal hydration.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'sodium hyaluronate': {
    name: 'Sodium Hyaluronate',
    synonyms: ['Hyaluronic Acid Sodium Salt'],
    functions: ['Humectant', 'Skin Conditioning', 'Hydrating'],
    description: 'Smaller molecular weight salt form of hyaluronic acid with enhanced stratum corneum penetration and deep epidermal moisture retention.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  retinol: {
    name: 'Retinol (Vitamin A)',
    synonyms: ['Vitamin A', 'All-trans-retinol'],
    functions: ['Cell-Communicating', 'Anti-Aging', 'Keratolytic', 'Antioxidant'],
    description: 'Gold-standard retinoid that binds to nuclear retinoic acid receptors (RAR). Stimulates collagen type I and III synthesis and accelerates epidermal cellular turnover.',
    comedogenicity: 0,
    irritancy: 3,
    traitFlags: ['photosensitizing'],
    severity: 'moderate',
    skinSuitability: { dry: 'caution', oily: 'beneficial', sensitive: 'caution', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'salicylic acid': {
    name: 'Salicylic Acid',
    synonyms: ['2-Hydroxybenzoic Acid', 'BHA'],
    functions: ['Chemical Exfoliant', 'Anti-Acne', 'Keratolytic', 'Anti-Inflammatory'],
    description: 'Lipophilic beta-hydroxy acid capable of penetrating the sebaceous unit. Dissolves sebum plugs, reduces follicular hyperkeratinization, and mitigates inflammatory acneiform lesions.',
    comedogenicity: 0,
    irritancy: 2,
    traitFlags: ['photosensitizing'],
    severity: 'low',
    skinSuitability: { dry: 'caution', oily: 'beneficial', sensitive: 'caution', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'glycolic acid': {
    name: 'Glycolic Acid',
    synonyms: ['Alpha Hydroxy Acid', 'AHA', 'Hydroxyacetic Acid'],
    functions: ['Chemical Exfoliant', 'Humectant', 'Keratolytic'],
    description: 'Smallest molecular size alpha-hydroxy acid. Attenuates corneocyte cohesion in the stratum corneum, promoting cellular desquamation and epidermal brightening.',
    comedogenicity: 0,
    irritancy: 3,
    traitFlags: ['photosensitizing'],
    severity: 'moderate',
    skinSuitability: { dry: 'caution', oily: 'beneficial', sensitive: 'caution', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  ceramide: {
    name: 'Ceramides (NP, AP, EOP)',
    synonyms: ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Sphingolipids'],
    functions: ['Skin-Identical', 'Barrier Repair', 'Emollient'],
    description: 'Physiological sphingolipids representing approximately 50% of intercellular stratum corneum lipid bilayers. Critical for physical barrier restoration and moisture locking.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  squalane: {
    name: 'Squalane (Olive/Plant-Derived)',
    synonyms: ['Hydrogenated Polyisobutene Squalane', 'Phytosqualane'],
    functions: ['Emollient', 'Skin Replenishing', 'Antioxidant'],
    description: 'Stable saturated hydrocarbon derivative of endogenous squalene. Provides biomimetic emollience without pore clogging or lipid peroxidation.',
    comedogenicity: 1,
    irritancy: 0,
    traitFlags: ['oil'],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'neutral', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'centella asiatica': {
    name: 'Centella Asiatica (Cica)',
    synonyms: ['Gotu Kola', 'Madecassoside', 'Asiaticoside', 'Tiger Grass'],
    functions: ['Soothing', 'Antioxidant', 'Wound Healing', 'Anti-Inflammatory'],
    description: 'Botanical triterpenoid extract. Accelerates microvascular microcirculation, stimulates fibroblast proliferation, and reduces pro-inflammatory cytokine expression.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'ascorbic acid': {
    name: 'Ascorbic Acid (Vitamin C)',
    synonyms: ['L-Ascorbic Acid', 'Pure Vitamin C'],
    functions: ['Antioxidant', 'Skin Brightening', 'Collagen Stimulating'],
    description: 'Primary biological antioxidant. Neutralizes reactive oxygen species (ROS), co-factor for prolyl hydroxylase in collagen synthesis, and suppresses tyrosinase enzyme.',
    comedogenicity: 0,
    irritancy: 2,
    traitFlags: ['photosensitizing'],
    severity: 'moderate',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'caution', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  'zinc oxide': {
    name: 'Zinc Oxide (Mineral UV Filter)',
    synonyms: ['CI 77947', 'Mineral Sunscreen Filter'],
    functions: ['UV Filter', 'Soothing', 'Astringent', 'Skin Protectant'],
    description: 'Broad-spectrum inorganic physical photoprotectant. Reflects and scatters both UVA and UVB electromagnetic radiation with minimal percutaneous absorption.',
    comedogenicity: 1,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'neutral', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  glycerin: {
    name: 'Glycerin (Glycerol)',
    synonyms: ['Glycerol', 'Propane-1,2,3-triol'],
    functions: ['Humectant', 'Skin Conditioning', 'Solvent'],
    description: 'Natural humectant trihydroxy sugar alcohol. Draws water from dermis and atmosphere into the stratum corneum and stabilizes lipid crystal structures.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  panthenol: {
    name: 'Panthenol (Pro-Vitamin B5)',
    synonyms: ['D-Panthenol', 'Dexpanthenol', 'Pro-Vitamin B5'],
    functions: ['Soothing', 'Humectant', 'Skin Protectant', 'Wound Healing'],
    description: 'Chiral precursor of coenzyme A. Accelerates cellular epithelialization, mitigates surfactant-induced skin barrier perturbation, and delivers sustained hydration.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: [],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'beneficial', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  tocopherol: {
    name: 'Tocopherol (Vitamin E)',
    synonyms: ['Alpha-Tocopherol', 'Vitamin E Acetate'],
    functions: ['Antioxidant', 'Skin Conditioning', 'Emollient'],
    description: 'Lipid-soluble chain-breaking antioxidant protecting cellular membrane unsaturated fatty acids against oxidation.',
    comedogenicity: 2,
    irritancy: 0,
    traitFlags: ['oil'],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'caution', sensitive: 'beneficial', normal: 'beneficial' },
    source: 'Bellezza INCI Scientific Index',
  },
  fragrance: {
    name: 'Fragrance / Parfum',
    synonyms: ['Parfum', 'Aroma', 'Essential Oil Fragrance Blend'],
    functions: ['Masking', 'Perfuming'],
    description: 'Complex proprietary aromatic mixture. One of the most prevalent causative agents of contact dermatitis and cutaneous hypersensitivity in cosmetic dermatology.',
    comedogenicity: 0,
    irritancy: 4,
    traitFlags: ['fragrance', 'eu_allergen'],
    severity: 'high',
    skinSuitability: { dry: 'caution', oily: 'neutral', sensitive: 'caution', normal: 'neutral' },
    source: 'Bellezza INCI Scientific Index',
  },
  'sodium lauryl sulfate': {
    name: 'Sodium Lauryl Sulfate (SLS)',
    synonyms: ['SLS', 'Sodium Dodecyl Sulfate'],
    functions: ['Surfactant', 'Cleansing Agent', 'Foaming Agent'],
    description: 'Harsh anionic detergent surfactant. Clinically documented to disrupt the lipid envelope of stratum corneum corneocytes and elevate transepidermal water loss.',
    comedogenicity: 3,
    irritancy: 5,
    traitFlags: ['sulfate'],
    severity: 'high',
    skinSuitability: { dry: 'caution', oily: 'caution', sensitive: 'caution', normal: 'caution' },
    source: 'Bellezza INCI Scientific Index',
  },
  'isopropyl myristate': {
    name: 'Isopropyl Myristate',
    synonyms: ['IPM', 'Myristic Acid Isopropyl Ester'],
    functions: ['Emollient', 'Texture Enhancer', 'Penetration Enhancer'],
    description: 'Synthetic ester oil providing dry slip. Known in comedogenicity assays to possess high pore-clogging potential for acne-prone skin.',
    comedogenicity: 5,
    irritancy: 3,
    traitFlags: ['oil'],
    severity: 'high',
    skinSuitability: { dry: 'neutral', oily: 'caution', sensitive: 'caution', normal: 'neutral' },
    source: 'Bellezza INCI Scientific Index',
  },
  'mineral oil': {
    name: 'Mineral Oil (Paraffinum Liquidum)',
    synonyms: ['Paraffinum Liquidum', 'Liquid Petrolatum'],
    functions: ['Occlusive', 'Emollient'],
    description: 'Highly refined liquid paraffin. Forms an inert hydrophobic barrier over the stratum corneum to prevent TEWL.',
    comedogenicity: 0,
    irritancy: 0,
    traitFlags: ['oil'],
    severity: 'low',
    skinSuitability: { dry: 'beneficial', oily: 'caution', sensitive: 'neutral', normal: 'neutral' },
    source: 'Bellezza INCI Scientific Index',
  },
};

/**
 * Standardize an ingredient into Bellezza canonical profile
 */
function normalizeIngredient(raw, nameOverride = '') {
  if (!raw && !nameOverride) return null;

  const rawName = (nameOverride || raw?.name || '').trim();
  const lowerKey = rawName.toLowerCase();

  // Check built-in scientific dictionary match
  let matched = null;
  for (const [key, val] of Object.entries(INCI_KNOWLEDGE_BASE)) {
    if (lowerKey === key || lowerKey.includes(key) || key.includes(lowerKey)) {
      matched = val;
      break;
    }
  }

  const name = matched?.name || raw?.name || rawName;
  const synonyms = Array.from(new Set([...(matched?.synonyms || []), ...(raw?.synonyms || [])]));
  const functions = Array.from(new Set([...(matched?.functions || []), ...(raw?.functions || ['Skin Conditioning'])]));
  const description = raw?.description || matched?.description || `Cosmetic ingredient ${name} utilized in topical dermatological formulations.`;
  const comedogenicity = raw?.comedogenicity !== undefined && raw.comedogenicity !== null ? raw.comedogenicity : (matched?.comedogenicity ?? null);
  const irritancy = raw?.irritancy !== undefined && raw.irritancy !== null ? raw.irritancy : (matched?.irritancy ?? null);
  const traitFlags = Array.from(new Set([...(matched?.traitFlags || []), ...(raw?.trait_flags || raw?.traitFlags || [])]));
  const severity = raw?.severity || matched?.severity || (irritancy >= 3 || comedogenicity >= 4 ? 'high' : irritancy >= 2 ? 'moderate' : 'low');
  const source = raw?.source || (matched ? 'Bellezza INCI Scientific Index' : 'Standard INCI Database');

  return {
    name,
    normalizedName: lowerKey,
    synonyms,
    functions,
    description,
    comedogenicity,
    irritancy,
    traitFlags,
    severity,
    skinSuitability: matched?.skinSuitability || { dry: 'neutral', oily: 'neutral', sensitive: 'neutral', normal: 'neutral' },
    source,
    sourceExplanation: 'Comedogenicity and irritancy ratings are standardized dermatological reference estimates on a 0-5 scale, not medical diagnoses.',
    casNo: raw?.cas_no || raw?.casNo || null,
    ecNo: raw?.ec_no || raw?.ecNo || null,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Perform multi-ingredient list safety & compatibility analysis
 * @param {string[]|string} ingredients - Array or comma separated string
 * @returns {object} Analysis result
 */
function analyzeIngredientList(ingredients) {
  let list = [];
  if (Array.isArray(ingredients)) {
    list = ingredients.map((i) => (typeof i === 'string' ? i.trim() : '')).filter(Boolean);
  } else if (typeof ingredients === 'string') {
    list = ingredients.split(/[,;\n]/).map((i) => i.trim()).filter(Boolean);
  }

  const normalizedItems = list.map((item) => normalizeIngredient(null, item));

  // Identify high-risk or notable flags
  const irritants = normalizedItems.filter((i) => (i.irritancy !== null && i.irritancy >= 3) || i.traitFlags.includes('fragrance') || i.traitFlags.includes('sulfate'));
  const comedogenic = normalizedItems.filter((i) => i.comedogenicity !== null && i.comedogenicity >= 3);
  const actives = normalizedItems.filter((i) => i.functions.some((f) => ['Antioxidant', 'Chemical Exfoliant', 'Cell-Communicating', 'Barrier Repair', 'Anti-Acne', 'Soothing'].includes(f)));

  let overallSafety = 'low';
  if (irritants.length > 1 || comedogenic.length > 2) {
    overallSafety = 'high';
  } else if (irritants.length > 0 || comedogenic.length > 0) {
    overallSafety = 'moderate';
  }

  return {
    totalIngredients: normalizedItems.length,
    overallSafety, // 'low' = safe/gentle, 'moderate' = moderate caution, 'high' = potential irritants/comedogens
    summary: `Analyzed ${normalizedItems.length} ingredients. Identified ${actives.length} functional actives, ${irritants.length} potential irritants, and ${comedogenic.length} pore-clogging comedogenic compounds.`,
    ingredients: normalizedItems,
    potentialIrritants: irritants.map((i) => ({ name: i.name, irritancy: i.irritancy, traitFlags: i.traitFlags })),
    potentialComedogens: comedogenic.map((i) => ({ name: i.name, comedogenicity: i.comedogenicity })),
    activeIngredients: actives.map((i) => ({ name: i.name, functions: i.functions })),
    disclaimer: 'Third-party cosmetic ratings and comedogenicity scores are standardized reference indicators, not medical diagnoses or allergy guarantees.',
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = {
  INCI_KNOWLEDGE_BASE,
  normalizeIngredient,
  analyzeIngredientList,
};

