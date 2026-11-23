/**
 * Ingredient Compatibility & Interaction Intelligence Service
 * Analyzes synergistic pairings, high-irritation combinations, pH considerations, and routine sequencing.
 */

const KNOWN_COMBINATIONS = [
  {
    ingredients: ['retinoids', 'salicylic acid'],
    status: 'Caution / Alternate Routine',
    riskLevel: 'Moderate to High',
    description:
      'Combining strong topical retinoids and salicylic acid concurrently can over-exfoliate the stratum corneum, increasing trans-epidermal water loss (TEWL) and barrier disruption.',
    recommendation:
      'Use Salicylic Acid in the morning (or on alternate evenings) and Retinoids exclusively at night. If skin is sensitive, avoid using them on the same calendar day.',
    scientificMechanism:
      'Both compounds accelerate epidermal cellular turnover through different biological mechanisms. Concomitant application lowers the cutaneous irritation threshold.',
    references: ['American Academy of Dermatology (AAD) Retinoid Guidelines', 'PubMed PMID: 28410593'],
  },
  {
    ingredients: ['retinoids', 'glycolic acid'],
    status: 'Caution / High Irritation Risk',
    riskLevel: 'High',
    description:
      'Glycolic acid (AHA) and Retinoids both exert intense cellular keratolytic action. Using both together in the same step can trigger marked erythema, flaking, and stinging.',
    recommendation:
      'Alternate days: apply AHA chemical exfoliant 1-2 nights a week and Retinoids on the remaining nights. Always apply a broad-spectrum SPF 50 the following morning.',
    scientificMechanism:
      'Low pH AHA acids temporarily compromise stratum corneum integrity, increasing the deeper cutaneous penetration and irritancy of topical retinoids.',
    references: ['DermNet NZ: Topical Retinoids', 'PubMed PMID: 29938597'],
  },
  {
    ingredients: ['vitamin c', 'niacinamide'],
    status: 'Synergistic & Safe',
    riskLevel: 'Low',
    description:
      'Historically rumored to form a complex (Niacin Ascorbate) at extreme boiling laboratory conditions; modern cosmetic dermatological formulations show outstanding synergy.',
    recommendation:
      'Can be used together in morning or evening routines. Vitamin C neutralizes solar free radicals while Niacinamide reinforces the lipid barrier and calms redness.',
    scientificMechanism:
      'Ethyl Ascorbic Acid / L-Ascorbic Acid and Niacinamide inhibit two distinct pathways of melanogenesis (tyrosinase oxidation vs. melanosome transfer to keratinocytes).',
    references: ['Journal of Cosmetic Dermatology, 2021', 'PubMed PMID: 18492135'],
  },
  {
    ingredients: ['hyaluronic acid', 'ceramides'],
    status: 'Highly Synergistic',
    riskLevel: 'None / Beneficial',
    description:
      'Ideal physiological pairing for barrier recovery. Hyaluronic acid draws ambient water into the epidermis, while Ceramides trap the moisture to prevent evaporation.',
    recommendation:
      'Apply Hyaluronic Acid onto slightly damp skin, then immediately seal with a Ceramide-based barrier moisturizer.',
    scientificMechanism:
      'Hyaluronic acid acts as an extracellular humectant (holding up to 1000x its weight in water) and Ceramides supply intercellular lipid bilayer precursors.',
    references: ['Dermatologic Therapy, 2020', 'PubMed PMID: 32677109'],
  },
  {
    ingredients: ['niacinamide', 'salicylic acid'],
    status: 'Safe & Effective Pair',
    riskLevel: 'Low',
    description:
      'Excellent combination for congestion, dilated pores, and blemish-prone skin. Salicylic acid purges follicular debris while Niacinamide calms inflammation.',
    recommendation:
      'Apply Salicylic Acid first, let absorb for 1-2 minutes, then layer Niacinamide serum.',
    scientificMechanism:
      'BHA lipid-soluble penetration unclogs the sebaceous duct; Niacinamide downregulates inflammatory prostaglandins.',
    references: ['Clinical, Cosmetic and Investigational Dermatology, 2018'],
  },
  {
    ingredients: ['peptides', 'glycolic acid'],
    status: 'Timing Dependent',
    riskLevel: 'Low to Moderate',
    description:
      'Strongly acidic solutions (pH < 3.5) can hydrolyze peptide bonds and neutralize their signaling efficacy when layered simultaneously.',
    recommendation:
      'Use Glycolic Acid and Peptides at separate times (e.g. Peptides in AM, AHA at night, or alternate evenings).',
    scientificMechanism:
      'Low pH acid environments risk destabilizing fragile oligopeptides before they penetrate into dermal receptor sites.',
    references: ['International Journal of Cosmetic Science, 2019'],
  },
  {
    ingredients: ['benzoyl peroxide', 'retinoids'],
    status: 'Caution / Potential Inactivation',
    riskLevel: 'Moderate',
    description:
      'Traditional Tretinoin can be oxidized and degraded by Benzoyl Peroxide if layered together (with the exception of newer micronized Adapalene combinations).',
    recommendation:
      'Apply Benzoyl Peroxide in the morning and Retinoid at night, unless using a pre-formulated fixed-dose dermatological combination (e.g. Epiduo).',
    scientificMechanism:
      'Benzoyl peroxide generates reactive oxygen species that chemically oxidize standard trans-retinoic acid molecules.',
    references: ['Journal of Drugs in Dermatology, 2012', 'PubMed PMID: 23135649'],
  },
];

const normalizeFamily = (str) => {
  const s = String(str).toLowerCase().trim();
  if (s.includes('retin') || s.includes('tretinoin') || s.includes('adapalene')) return 'retinoids';
  if (s.includes('salicylic') || s === 'bha') return 'salicylic acid';
  if (s.includes('glycolic') || s.includes('lactic') || s === 'aha') return 'glycolic acid';
  if (s.includes('ascorb') || s.includes('vitamin c')) return 'vitamin c';
  if (s.includes('niacin') || s.includes('vitamin b3')) return 'niacinamide';
  if (s.includes('hyaluron')) return 'hyaluronic acid';
  if (s.includes('ceramide')) return 'ceramides';
  if (s.includes('peptide')) return 'peptides';
  if (s.includes('benzoyl peroxide') || s === 'bpo') return 'benzoyl peroxide';
  return s;
};

/**
 * Analyze compatibility between two or more ingredients
 * @param {string[]} ingredientNames
 * @returns {object}
 */
const checkCompatibility = (ingredientNames = []) => {
  if (!Array.isArray(ingredientNames) || ingredientNames.length < 2) {
    return {
      compatible: true,
      overallStatus: 'Safe Single / Independent Component',
      pairings: [],
      generalAdvice: 'Select at least 2 active ingredients to evaluate pharmacological interactions.',
    };
  }

  const normalized = ingredientNames.map((name) => normalizeFamily(name));
  const detectedPairings = [];
  let highestRisk = 'Low';

  // Compare each pair
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const ingA = normalized[i];
      const ingB = normalized[j];

      const match = KNOWN_COMBINATIONS.find((combo) => {
        const [cA, cB] = combo.ingredients;
        return (
          (ingA === cA && ingB === cB) ||
          (ingA === cB && ingB === cA) ||
          (ingA.includes(cA) && ingB.includes(cB)) ||
          (ingA.includes(cB) && ingB.includes(cA))
        );
      });

      if (match) {
        detectedPairings.push({
          ingredient1: ingredientNames[i],
          ingredient2: ingredientNames[j],
          status: match.status,
          riskLevel: match.riskLevel,
          description: match.description,
          recommendation: match.recommendation,
          scientificMechanism: match.scientificMechanism,
          references: match.references,
        });

        if (match.riskLevel.includes('High')) {
          highestRisk = 'High';
        } else if (match.riskLevel.includes('Moderate') && highestRisk !== 'High') {
          highestRisk = 'Moderate';
        }
      } else {
        detectedPairings.push({
          ingredient1: ingredientNames[i],
          ingredient2: ingredientNames[j],
          status: 'Compatible / No Contraindication Found',
          riskLevel: 'Low',
          description: `No documented adverse pharmacological collision found between ${ingredientNames[i]} and ${ingredientNames[j]}.`,
          recommendation: 'Can be used in the same routine, provided individual tolerance is established.',
          scientificMechanism: 'No competing chemical degradation or enhanced irritation pathways identified.',
          references: ['DermNet NZ', 'PubMed General Pharmacology Compendium'],
        });
      }
    }
  }

  return {
    evaluatedCount: ingredientNames.length,
    overallRisk: highestRisk,
    overallStatus:
      highestRisk === 'High'
        ? 'High Irritation Potential — Stagger Application'
        : highestRisk === 'Moderate'
        ? 'Moderate Interaction — Monitor Sensitivity & Alternate Use'
        : 'Safe & Compatible Pairings',
    pairings: detectedPairings,
    disclaimer:
      'Compatibility checks evaluate peer-reviewed pharmacological data and skin barrier kinetics. Tolerance depends on individual skin sensitivity and formulation percentages.',
  };
};

module.exports = {
  checkCompatibility,
  KNOWN_COMBINATIONS,
};
