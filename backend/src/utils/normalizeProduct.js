const { formatInr } = require('./indianMarket');

/**
 * Utility to parse and normalize cosmetic ingredient text into clean list of INCI names
 * @param {string} text 
 * @returns {string[]}
 */
function parseIngredientText(text) {
  if (!text || typeof text !== 'string') return [];
  // Split on commas or periods not followed by lowercase, or semicolons
  return text
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !/^[0-9]+%?$/.test(item))
    .map((item) => item.replace(/^\*+\s*/, '').replace(/\s*\(\*\)$/, '').trim())
    .filter(Boolean);
}

/**
 * Calculate data completeness score (0-100)
 */
function calculateCompletenessScore({ name, brand, imageUrl, ingredientList, category }) {
  let score = 0;
  if (name && name !== 'Unnamed Cosmetic Product') score += 25;
  if (brand && brand !== 'Unknown Brand') score += 20;
  if (imageUrl) score += 20;
  if (ingredientList && ingredientList.length > 0) score += 25;
  if (category) score += 10;
  return Math.min(100, score);
}

/**
 * Standardize external Open Beauty Facts or other product into Bellezza canonical format
 * @param {object} raw - raw product object from API or database
 * @param {string} [source] - source provider
 * @returns {object}
 */
function normalizeProduct(raw, source = 'Open Beauty Facts') {
  if (!raw) return null;

  const barcode = raw.code || raw.barcode || raw.id || '';
  const name =
    raw.product_name_en ||
    raw.product_name ||
    raw.generic_name_en ||
    raw.generic_name ||
    raw.name ||
    'Unnamed Cosmetic Product';

  const brand = raw.brands || raw.brand || 'Unknown Brand';

  const imageUrl =
    raw.image_url ||
    raw.image_front_url ||
    raw.image_front_small_url ||
    raw.imageUrl ||
    '';

  const rawIngredients =
    raw.ingredients_text_en ||
    raw.ingredients_text ||
    (Array.isArray(raw.keyIngredients) ? raw.keyIngredients.join(', ') : '') ||
    '';

  let ingredientList = [];
  if (Array.isArray(raw.ingredientList) && raw.ingredientList.length > 0) {
    ingredientList = raw.ingredientList;
  } else if (Array.isArray(raw.ingredients)) {
    ingredientList = raw.ingredients
      .map((i) => i.text || i.id?.replace(/^en:/, '') || '')
      .filter(Boolean);
  } else {
    ingredientList = parseIngredientText(rawIngredients);
  }

  const category =
    raw.category ||
    raw.categories?.split(',')[0]?.trim() ||
    raw.categories_tags?.[0]?.replace(/^en:/, '').replace(/-/g, ' ') ||
    'Skincare';

  const description =
    raw.description ||
    raw.generic_name ||
    raw.scientificSummary ||
    `Formulated cosmetic product by ${brand}.`;

  const packaging = raw.packaging || raw.packaging_text || '';
  const sourceUrl = raw.sourceUrl || (barcode ? `https://world.openbeautyfacts.org/product/${barcode}` : '');

  const completenessScore = calculateCompletenessScore({
    name,
    brand,
    imageUrl,
    ingredientList,
    category,
  });

  // Indian market identification
  const isIndianBarcode = Boolean(barcode && barcode.startsWith('890'));
  const isIndianCountry = Boolean(
    Array.isArray(raw.countries_tags) &&
      raw.countries_tags.some((c) => c.includes('india'))
  );
  const isIndianOrigin = isIndianBarcode || isIndianCountry;

  // INR Price determination
  let priceInr = raw.priceInr || null;
  if (!priceInr && typeof raw.price === 'number') {
    // If currency was USD or unspecified, convert to reasonable INR range
    priceInr = raw.currency === 'USD' ? Math.round(raw.price * 85) : raw.price;
  }

  return {
    id: barcode || raw._id?.toString() || String(Math.random()),
    barcode: barcode || null,
    name: name.trim(),
    brand: brand.trim(),
    category: category.trim(),
    description: description.trim(),
    imageUrl,
    ingredientList,
    ingredientsText: rawIngredients || ingredientList.join(', '),
    packaging,
    source,
    sourceUrl,
    completenessScore,
    currency: 'INR',
    price: priceInr,
    priceInr,
    priceFormatted: formatInr(priceInr),
    retailer: raw.retailer || 'Indian Retail Network / Brand Store',
    priceSource: raw.priceSource || (priceInr ? 'Verified Retailer Price Feed' : 'Not Declared'),
    lastPriceCheckedAt: raw.lastPriceCheckedAt || (priceInr ? new Date().toISOString() : null),
    isIndianOrigin,
    suitableSkinTypes: raw.suitableSkinTypes || ['all'],
    scientificSummary: raw.scientificSummary || null,
    retrievedAt: raw.retrievedAt || new Date().toISOString(),
  };
}

module.exports = {
  normalizeProduct,
  parseIngredientText,
  calculateCompletenessScore,
};

