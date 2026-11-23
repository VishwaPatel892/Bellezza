const CachedIngredient = require('../models/CachedIngredient');
const Ingredient = require('../models/Ingredient');
const User = require('../models/User');
const { dermalytics } = require('../integrations/dermalytics');
const { pubchemService } = require('./pubchemService');
const { pubmedService } = require('./pubmedService');
const { compatibilityService, checkCompatibility } = require('./compatibilityService');
const { memoryCache } = require('../utils/apiCache');
const {
  normalizeIngredient,
  analyzeIngredientList,
  INCI_KNOWLEDGE_BASE,
} = require('../utils/normalizeIngredient');

class IngredientService {
  /**
   * Search cosmetic ingredients
   * @param {string} query 
   * @returns {Promise<object[]>}
   */
  async searchIngredients(query = '') {
    const cleanQuery = query.toLowerCase().trim();
    const cacheKey = `ingredient_search_${cleanQuery}`;

    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    // 1. Search cached ingredients in MongoDB
    let dbMatches = [];
    if (cleanQuery) {
      dbMatches = await CachedIngredient.find({
        $or: [
          { normalizedName: new RegExp(cleanQuery, 'i') },
          { name: new RegExp(cleanQuery, 'i') },
          { synonyms: new RegExp(cleanQuery, 'i') },
          { functions: new RegExp(cleanQuery, 'i') },
        ],
      })
        .limit(10)
        .lean();
    }

    // 2. Query Dermalytics integration (falls back to scientific INCI dataset)
    const remoteMatches = await dermalytics.searchIngredients(cleanQuery);

    // 3. Merge results
    const map = new Map();
    dbMatches.forEach((i) => map.set(i.normalizedName, normalizeIngredient(i)));
    remoteMatches.forEach((i) => map.set(i.normalizedName, i));

    const result = Array.from(map.values());
    memoryCache.set(cacheKey, result, 1000 * 60 * 30);
    return result;
  }

  /**
   * Get single ingredient profile by name
   * @param {string} name 
   * @returns {Promise<object>}
   */
  async getIngredientByName(name) {
    if (!name) return null;
    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();
    const cacheKey = `ingredient_detail_${lowerName}`;

    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    // Check MongoDB cache
    const dbDoc = await CachedIngredient.findOne({ normalizedName: lowerName }).lean();
    if (dbDoc) {
      const normalized = normalizeIngredient(dbDoc);
      memoryCache.set(cacheKey, normalized, 1000 * 60 * 60 * 24);
      return normalized;
    }

    // Query Dermalytics / INCI dictionary
    const profile = await dermalytics.getIngredientByName(cleanName);

    // Save to MongoDB cache
    if (profile) {
      try {
        await CachedIngredient.findOneAndUpdate(
          { normalizedName: lowerName },
          {
            normalizedName: lowerName,
            name: profile.name,
            synonyms: profile.synonyms,
            functions: profile.functions,
            description: profile.description,
            comedogenicity: profile.comedogenicity,
            irritancy: profile.irritancy,
            traitFlags: profile.traitFlags,
            severity: profile.severity,
            skinSuitability: profile.skinSuitability,
            source: profile.source,
            sourceExplanation: profile.sourceExplanation,
            casNo: profile.casNo,
            ecNo: profile.ecNo,
            lastRetrievedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('[IngredientService] Failed to cache ingredient in MongoDB:', err.message);
      }
    }

    memoryCache.set(cacheKey, profile, 1000 * 60 * 60 * 24);
    return profile;
  }

  /**
   * Deep Ingredient Intelligence: Combines INCI profile, PubChem chemical identity, and PubMed clinical evidence
   * @param {string} name
   */
  async getIngredientIntelligence(name) {
    if (!name) return null;
    const cleanName = name.trim();
    const cacheKey = `ingredient_intel_${cleanName.toLowerCase()}`;

    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    // Parallel fetch: INCI Profile, PubChem chemical properties, PubMed clinical studies
    const [inciProfile, chemicalProps, clinicalStudies] = await Promise.all([
      this.getIngredientByName(cleanName),
      pubchemService.getProperties(cleanName),
      pubmedService.getDermatologyEvidence(cleanName, 3),
    ]);

    const result = {
      name: inciProfile?.name || cleanName,
      inciProfile: inciProfile || null,
      chemicalIdentity: chemicalProps || {
        source: 'NIH PubChem',
        notice: 'No exact PubChem compound record found for this cosmetic blend.',
      },
      clinicalEvidence: clinicalStudies || {
        totalStudies: 0,
        studies: [],
      },
      disclaimer: 'Chemical properties (PubChem) and clinical literature (PubMed) are presented for educational and scientific reference only and do not replace personalized dermatological diagnosis.',
      retrievedAt: new Date().toISOString(),
    };

    memoryCache.set(cacheKey, result, 1000 * 60 * 60 * 24); // 24 hours
    return result;
  }

  /**
   * List all ingredients with optional category filtering
   */
  async getIngredients(queryParams = {}) {
    const { category, search, page = 1, limit = 20 } = queryParams;

    // First search MongoDB Ingredient collection
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { inciName: new RegExp(search, 'i') },
        { function: new RegExp(search, 'i') },
      ];
    }

    let ingredients = await Ingredient.find(query).limit(parseInt(limit, 10));

    // If database empty or few, populate from INCI knowledge base
    if (ingredients.length === 0) {
      const keys = Object.keys(INCI_KNOWLEDGE_BASE);
      const list = keys.map((key) => {
        const item = INCI_KNOWLEDGE_BASE[key];
        return {
          id: key,
          name: item.name,
          inciName: item.name.toUpperCase(),
          category: item.functions?.[0] || 'Active Compound',
          function: (item.functions || []).join(', '),
          description: item.description,
          comedogenicityRating: item.comedogenicity || 0,
          irritancyRating: item.irritancy || 0,
          scientificProperties: {
            casNumber: item.casNo || '',
          },
          researchBackedBenefits: item.traitFlags || [],
          source: item.source || 'Bellezza INCI Scientific Index',
        };
      });

      if (category) {
        return list.filter((i) => i.category.toLowerCase().includes(category.toLowerCase()));
      }
      return list.slice(0, parseInt(limit, 10));
    }

    return ingredients;
  }

  /**
   * Check compatibility between two or more ingredients
   */
  async checkCompatibility(ingredientNames = []) {
    return checkCompatibility(ingredientNames);
  }

  /**
   * Save ingredient for user
   */
  async saveIngredient(userId, ingredientName) {
    if (!ingredientName || !ingredientName.trim()) {
      throw new Error('Ingredient name is required.');
    }
    const clean = ingredientName.trim();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedIngredients: clean },
    });
    return { success: true, savedIngredient: clean };
  }

  /**
   * Unsave ingredient for user
   */
  async unsaveIngredient(userId, ingredientName) {
    await User.findByIdAndUpdate(userId, {
      $pull: { savedIngredients: ingredientName },
    });
    return { success: true };
  }

  /**
   * Get user's saved ingredients
   */
  async getSavedIngredients(userId) {
    const user = await User.findById(userId);
    const saved = user?.savedIngredients || [];
    const profiles = [];

    for (const name of saved) {
      const profile = await this.getIngredientByName(name);
      profiles.push(
        profile || {
          name,
          normalizedName: name.toLowerCase(),
          description: 'Personal tracked active ingredient.',
          functions: ['Active'],
        }
      );
    }

    return profiles;
  }

  /**
   * Analyze multi-ingredient formula
   * @param {string[]|string} ingredients 
   * @param {string} userId (optional)
   * @returns {Promise<object>}
   */
  async analyzeFormula(ingredients, userId = null) {
    const baseAnalysis = await dermalytics.analyzeFormula(ingredients);

    // If authenticated user, personalize with known allergies
    if (userId) {
      try {
        const user = await User.findById(userId);
        const allergies = (user?.skinProfile?.knownIngredientAllergies || []).map((a) => a.toLowerCase());
        const triggers = (user?.skinProfile?.irritationTriggers || []).map((t) => t.toLowerCase());

        const userWarnings = [];
        const detected = (baseAnalysis.recognizedIngredients || []).map((i) => i.name.toLowerCase());

        for (const allergy of allergies) {
          if (detected.some((d) => d.includes(allergy) || allergy.includes(d))) {
            userWarnings.push(`Contains known personal allergen: ${allergy.toUpperCase()}`);
          }
        }

        for (const trigger of triggers) {
          if (detected.some((d) => d.includes(trigger) || trigger.includes(d))) {
            userWarnings.push(`Contains personal irritation trigger: ${trigger.toUpperCase()}`);
          }
        }

        baseAnalysis.userSpecificWarnings = userWarnings;
        baseAnalysis.hasUserAllergen = userWarnings.length > 0;
      } catch (err) {
        console.warn('Personalized formula analysis error:', err.message);
      }
    }

    return baseAnalysis;
  }
}

const ingredientService = new IngredientService();

module.exports = {
  ingredientService,
};

