const Remedy = require('../models/Remedy');
const SavedRemedy = require('../models/SavedRemedy');
const User = require('../models/User');

const EVIDENCE_BASED_REMEDIES = [
  {
    name: 'Colloidal Oatmeal Barrier Compress',
    category: 'Skin barrier support',
    description:
      'Finely pulverized whole oat grain (Avena sativa) rich in beta-glucans and avenanthramides that physically bind moisture and downregulate inflammatory cytokines in reactive skin.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Colloidal Oatmeal (USP Grade)', amount: '2 tbsp', purpose: 'Anti-pruritic & barrier lipid support' },
      { name: 'Distilled Lukewarm Water', amount: '1/2 cup', purpose: 'Hydrating suspension medium' },
    ],
    preparationInstructions: [
      'Blend USP colloidal oatmeal into lukewarm distilled water until a smooth, milky paste forms.',
      'Allow mixture to steep for 2 minutes to activate colloidal beta-glucan mucilage.',
    ],
    applicationInstructions: [
      'Soak a sterile 100% cotton gauze or clean cloth in the colloidal oat liquid.',
      'Lay gently over cleansed facial areas showing redness or tight dryness for 10-15 minutes.',
      'Rinse lightly with tepid water and follow immediately with a ceramide-rich moisturizer.',
    ],
    frequency: '2-3 times weekly or during acute dry/reactive barrier episodes',
    potentialBenefits: [
      'Relieves sensation of itching and burning',
      'Temporarily reinforces stratum corneum barrier lipids',
      'Diminishes transepidermal water loss (TEWL)',
    ],
    scientificExplanation:
      'Colloidal oatmeal contains avenanthramides, distinct polyphenolic alkaloids unique to oats, documented to suppress NF-κB activation and interleukin-8 release in human dermal fibroblasts. Its high beta-glucan polysaccharide fraction forms a hydrophilic occlusive film over compromised skin.',
    evidenceLevel: 'Strong evidence',
    evidenceExplanation:
      'FDA-recognized Category I skin protectant backed by multiple randomized controlled trials demonstrating reduction in clinical erythema and epidermal dryness scores.',
    possibleIrritationRisks: ['Extremely low; occasional contact allergy in individuals with gluten or oat hypersensitivity.'],
    allergyWarnings: ['Do not use if you have an established oat, cereal grain, or contact avenin allergy.'],
    contraindications: [
      'Active weeping fungal infections (tinea faciei).',
      'Open surgical wounds or infected ulcerations.',
    ],
    patchTestingGuidance:
      'Apply prepared oat paste to inner forearm for 24 hours. Verify absence of redness before facial contact.',
    suitableSkinTypes: ['Dry', 'Sensitive', 'Normal', 'Combination', 'All'],
    targetedConcerns: ['Dryness', 'Redness', 'Sensitivity', 'Skin barrier support'],
    references: [
      {
        citation: 'Kurtz ES, Wallo W. Colloidal oatmeal: history, chemistry and clinical properties. J Drugs Dermatol. 2007.',
        source: 'PubMed PMID: 17373175',
        publicationYear: 2007,
      },
      {
        citation: 'Reynertson KA, et al. Anti-inflammatory activities of colloidal oatmeal (Avena sativa) contribute to the effectiveness of oats in dry, irritated skin. J Drugs Dermatol. 2015.',
        source: 'PubMed PMID: 25607907',
        publicationYear: 2015,
      },
    ],
  },
  {
    name: 'Chilled Green Tea Polyphenol Compress',
    category: 'Gentle soothing skin care',
    description:
      'Sterile steep of Camellia sinensis concentrated in epigallocatechin gallate (EGCG) providing topical antioxidant defense against environmental UV-induced oxidative stress and excess sebum peroxidation.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Pure Organic Green Tea Leaf', amount: '1 bag / 2g', purpose: 'Topical EGCG polyphenol source' },
      { name: 'Boiling Purified Water', amount: '1 cup', purpose: 'Aqueous extraction' },
    ],
    preparationInstructions: [
      'Steep organic green tea in boiling water for 8 minutes to maximize polyphenol yield.',
      'Discard tea bag, allow infusion to cool to room temperature, then refrigerate for 30 minutes in a clean container.',
    ],
    applicationInstructions: [
      'Soak clean cotton pads in the chilled green tea infusion.',
      'Gently press across forehead, nose, and cheeks for 5-10 minutes post-cleansing.',
      'Pat dry and continue with regular serum and sunscreen steps.',
    ],
    frequency: 'Daily in the morning or 3 times weekly',
    potentialBenefits: [
      'Cools sun-stressed or flushed facial skin',
      'Topical scavenge of free radicals from solar UV radiation',
      'Mild astringency without drying denatured alcohols',
    ],
    scientificExplanation:
      'Green tea polyphenols, predominantly EGCG, act as potent biological antioxidants inhibiting 5-alpha-reductase in human sebocytes, modulating lipid synthesis, and downregulating AP-1 transcription factors responsible for collagenase activation.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'Supported by controlled clinical trials showing significant reduction in sebum secretion and UV-induced erythema in human volunteers, though topical stability varies with preparation.',
    possibleIrritationRisks: ['Rare contact dermatitis to tannins in hyper-reactive skin.'],
    allergyWarnings: ['Avoid if known hypersensitivity to Camellia sinensis extracts.'],
    contraindications: [
      'Do not apply boiling or hot liquid directly to the skin.',
      'Do not store open tea infusions for more than 48 hours to avoid microbial contamination.',
    ],
    patchTestingGuidance: 'Test cold infusion on inner wrist for 12 hours before full facial compress.',
    suitableSkinTypes: ['Oily', 'Combination', 'Normal', 'Sensitive'],
    targetedConcerns: ['Excess oil', 'Redness', 'Dullness', 'Uneven skin tone'],
    references: [
      {
        citation: 'Saric S, et al. Green Tea and Other Tea Polyphenols: Effects on Sebum Production and Acne Vulgaris. Antioxidants (Basel). 2016.',
        source: 'PubMed PMID: 28036057',
        publicationYear: 2016,
      },
      {
        citation: 'Katiyar SK. Green tea prevents non-melanoma skin cancer by enhancing DNA repair. Arch Biochem Biophys. 2011.',
        source: 'PubMed PMID: 21111695',
        publicationYear: 2011,
      },
    ],
  },
  {
    name: 'Medical-Grade Raw Honey Occlusive Mask',
    category: 'Acne-related skin care',
    description:
      'Monofloral unpasteurized honey delivering high osmolarity, endogenous glucose oxidase enzymatic hydrogen peroxide release, and gluconic acid for gentle humectant replenishment.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Pure Raw Honey (Unpasteurized)', amount: '1 tsp', purpose: 'Enzymatic antimicrobial & humectant' },
    ],
    preparationInstructions: [
      'Ensure skin is freshly cleansed with a gentle pH-balanced cleanser.',
      'Measure 1 teaspoon of clean, unheated raw honey into a clean porcelain saucer.',
    ],
    applicationInstructions: [
      'With sterile fingertips or brush, apply a thin translucent layer over clean, slightly damp skin.',
      'Leave on for 15-20 minutes. Do not scrub or abrade during removal.',
      'Rinse thoroughly with lukewarm water. Pat dry with a clean towel.',
    ],
    frequency: '1-2 times weekly',
    potentialBenefits: [
      'Attracts ambient moisture as a natural humectant',
      'Provides mild bacteriostatic environment against surface Cutibacterium acnes',
      'Softens stratum corneum desquamation without physical abrasion',
    ],
    scientificExplanation:
      'Raw honey maintains a low pH (3.2–4.5) and high osmolarity that inhibits bacterial proliferation. Dilution with skin surface moisture activates glucose oxidase to generate slow, low-dose hydrogen peroxide (<1 mM), exerting mild antimicrobial action without the cytotoxic tissue damage of high-strength commercial peroxides.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'Extensively investigated in wound-healing pharmacology; clinical trials document broad-spectrum bacteriostatic efficacy against standard epidermal isolates.',
    possibleIrritationRisks: ['Pollen or bee protein allergic reactions in sensitized individuals.'],
    allergyWarnings: ['Strictly contraindicated for individuals with bee venom, pollen, or honey allergies.'],
    contraindications: [
      'Severe pollen allergies.',
      'Cystic nodular acne requiring systemic dermatological medication.',
      'Children under 1 year of age.',
    ],
    patchTestingGuidance: 'Apply a drop of raw honey behind ear for 24 hours. Observe for urticaria or itching.',
    suitableSkinTypes: ['Dry', 'Normal', 'Combination', 'Oily'],
    targetedConcerns: ['Acne and breakouts', 'Dryness', 'Uneven texture', 'Dullness'],
    references: [
      {
        citation: 'Mandal MD, Mandal S. Honey: its medicinal property and antibacterial activity. Asian Pac J Trop Biomed. 2011.',
        source: 'PubMed PMID: 23569748',
        publicationYear: 2011,
      },
      {
        citation: 'Burlando B, Cornara L. Honey in dermatology and skin care: a review. J Cosmet Dermatol. 2013.',
        source: 'PubMed PMID: 24305429',
        publicationYear: 2013,
      },
    ],
  },
  {
    name: 'Pure Cold-Pressed Aloe Vera Soothing Gel',
    category: 'Hydration and dry skin care',
    description:
      'Sterile inner fillet gel from Aloe barbadensis Miller containing acemannan polysaccharides, bradykinase enzymes, and zinc for acute solar redness mitigation.',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: '100% Pure Inner Fillet Aloe Vera Gel', amount: '1 tbsp', purpose: 'Acemannan mucopolysaccharide hydration' },
    ],
    preparationInstructions: [
      'Use certified pure decolorized inner-leaf aloe gel free from yellow aloin latex and added fragrance.',
    ],
    applicationInstructions: [
      'Smooth a thin, even coat over facial skin following sun exposure or mild weather irritation.',
      'Allow gel to absorb for 10 minutes. Can be left on or followed with an emollient cream.',
    ],
    frequency: 'As needed for acute post-sun or heated weather soothing',
    potentialBenefits: [
      'Instant evaporative cooling and soothing sensation',
      'Provides lightweight non-comedogenic hydration',
      'Mitigates UV-induced prostaglandin erythema',
    ],
    scientificExplanation:
      'Aloe vera inner gel contains polymannose (chiefly acemannan) and sterols (lupeol, campesterol, beta-sitosterol) which inhibit cyclooxygenase and thromboxane pathways, reducing vascular permeability and inflammatory redness without occluding follicles.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'Multiple double-blind clinical trials validate acceleration of superficial burn healing and reduction of UV erythema index.',
    possibleIrritationRisks: ['Contact dermatitis if unpurified raw leaf aloin/anthraquinone sap is present.'],
    allergyWarnings: ['Avoid if allergic to plants of the Liliaceae family (garlic, onions, tulips).'],
    contraindications: [
      'Never apply unpurified outer yellow leaf latex directly to face (contains irritating aloin).',
      'Deep chemical burns or infected dermatitis.',
    ],
    patchTestingGuidance: 'Apply a small dab to inner elbow for 24 hours to rule out Liliaceae family cross-sensitivity.',
    suitableSkinTypes: ['All', 'Sensitive', 'Oily', 'Normal', 'Dry', 'Combination'],
    targetedConcerns: ['Redness', 'Sensitivity', 'Dryness', 'Skin barrier support'],
    references: [
      {
        citation: 'Surjushe A, Vasani R, Saple DG. Aloe vera: a short review. Indian J Dermatol. 2008.',
        source: 'PubMed PMID: 19882025',
        publicationYear: 2008,
      },
    ],
  },
  {
    name: 'Centella Asiatica (Gotu Kola) Infused Hydration Tonic',
    category: 'Skin barrier support',
    description:
      'Traditional Ayurvedic botanical infusion of Mandukaparni (Centella asiatica) rich in madecassoside and asiaticoside triterpenes that support dermal collagen synthesis and microcirculation.',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Dried Centella Asiatica Leaves', amount: '1 tbsp', purpose: 'Bio-active triterpenoid glycosides' },
      { name: 'Purified Spring Water', amount: '1 cup', purpose: 'Gentle extraction solvent' },
    ],
    preparationInstructions: [
      'Boil purified water, add dried Gotu Kola leaves, and steep covered for 10 minutes.',
      'Strain through a fine micro-mesh filter into a clean glass dropper bottle. Cool completely.',
    ],
    applicationInstructions: [
      'Dispense 4-5 drops onto fingertips and press gently into clean skin morning and evening before creams.',
      'Store refrigerated for up to 3 days maximum.',
    ],
    frequency: 'Once or twice daily',
    potentialBenefits: [
      'Supports natural skin repair and elasticity',
      'Helps soothe mild inflammation and superficial erythema',
      'Complements medical barrier restoration regimens',
    ],
    scientificExplanation:
      'Asiaticoside and madecassoside, active triterpenoids of Centella asiatica, stimulate type I collagen mRNA expression in human dermal fibroblasts and increase intracellular fibronectin, accelerating tissue re-epithelialization.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'Extensive pharmaceutical and dermatological studies establish wound-healing and anti-inflammatory properties of Centella triterpenes in topical formulations.',
    possibleIrritationRisks: ['Extremely low; mild transient tingling in hypersensitive individuals.'],
    allergyWarnings: ['Avoid if allergic to plants of the Apiaceae / Umbelliferae family (parsley, celery).'],
    contraindications: ['Do not use if infusion appears cloudy or has been stored past 72 hours.'],
    patchTestingGuidance: 'Patch test liquid on jawline for 24 hours prior to full facial routine.',
    suitableSkinTypes: ['All', 'Sensitive', 'Dry', 'Combination'],
    targetedConcerns: ['Skin barrier support', 'Redness', 'Fine lines', 'Uneven texture'],
    references: [
      {
        citation: 'Bylka W, et al. Centella asiatica in cosmetology. Postepy Dermatol Alergol. 2013.',
        source: 'PubMed PMID: 24278476',
        publicationYear: 2013,
      },
    ],
  },
  {
    name: 'Calendula Flower Petal Calming Compress',
    category: 'Gentle soothing skin care',
    description:
      'Mild aqueous infusion of Calendula officinalis (Marigold) petals containing faradiol esters and carotenoids that reduce cutaneous micro-vascular swelling and oxidative stress.',
    imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Organic Dried Calendula Petals', amount: '1 tbsp', purpose: 'Anti-inflammatory triterpene faradiol' },
      { name: 'Boiled Distilled Water', amount: '1 cup', purpose: 'Extraction medium' },
    ],
    preparationInstructions: [
      'Pour freshly boiled distilled water over dried calendula petals in a covered ceramic cup.',
      'Steep for 12 minutes to extract water-soluble flavonoids. Strain thoroughly and cool to room temperature.',
    ],
    applicationInstructions: [
      'Moisten soft compress pads in the calendula liquid and apply over flushed, windburned, or tired skin.',
      'Rest comfortably for 10 minutes. Follow with normal routine moisturizer.',
    ],
    frequency: '2-3 times per week as needed',
    potentialBenefits: [
      'Provides calming relief for wind-burned or climate-sensitized skin',
      'Mild topical comfort without stinging or alcohol residue',
    ],
    scientificExplanation:
      'Calendula contains triterpenoid faradiol monoesters that demonstrate potent dose-dependent anti-edematous action equivalent to low-strength indomethacin in pharmacological animal models, without steroidal side effects.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'German Commission E and European Medicines Agency (EMA) approved botanical for topical relief of minor skin inflammations and superficial wound healing.',
    possibleIrritationRisks: ['Rare allergic contact dermatitis in individuals sensitized to the Asteraceae/Compositae family.'],
    allergyWarnings: ['Do not use if known allergy to daisies, ragweed, chrysanthemums, or marigolds.'],
    contraindications: ['Asteraceae plant family contact allergies.'],
    patchTestingGuidance: 'Apply compress liquid to inner forearm for 24 hours before facial use.',
    suitableSkinTypes: ['Sensitive', 'Dry', 'Normal', 'All'],
    targetedConcerns: ['Redness', 'Sensitivity', 'Skin barrier support'],
    references: [
      {
        citation: 'Preethi KC, Kuttan R. Wound healing activity of flower extract of Calendula officinalis. J Basic Clin Physiol Pharmacol. 2009.',
        source: 'PubMed PMID: 19601397',
        publicationYear: 2009,
      },
    ],
  },
  {
    name: "Multani Mitti (Fuller's Earth) & Rosewater Purifying Clay",
    category: 'Oily skin care',
    description:
      'Purified magnesium-aluminum silicate clay blended with Rosa damascena hydrosol to adsorb cutaneous sebum and surface micro-pollutants without disrupting stratum corneum lipids.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: "Cosmetic Grade Multani Mitti (Fuller's Earth)", amount: '1 tbsp', purpose: 'Mineral sebum adsorption' },
      { name: 'Pure Steam-Distilled Rosewater', amount: '1-2 tbsp', purpose: 'Mild astringent vehicle' },
    ],
    preparationInstructions: [
      "Mix purified cosmetic-grade Fuller's earth powder with steam-distilled rosewater until a smooth, thin paste forms.",
    ],
    applicationInstructions: [
      'Apply thinly across oily T-zone (forehead, nose, chin). Avoid delicate eye contour.',
      'Leave on for 8-10 minutes until semi-dry (do NOT allow to crack or bake completely dry).',
      'Rinse gently with tepid water without scrubbing. Immediately apply hydrator.',
    ],
    frequency: 'Once weekly for oily/combination skin',
    potentialBenefits: ['Adsorbs superficial facial sebum', 'Refines the appearance of congested pores'],
    scientificExplanation:
      'Smectite clay minerals possess high cation-exchange capacity, binding lipophilic surface sebum and particulate urban matter through surface capillary action.',
    evidenceLevel: 'Traditional use / insufficient clinical evidence',
    evidenceExplanation:
      'Extensively utilized across the Indian subcontinent; mineral clay adsorption is documented in physical chemistry compendia, though controlled clinical acne trials remain limited.',
    possibleIrritationRisks: ['Over-drying or tightness if left on past the point of cracking.'],
    allergyWarnings: ['Do not use if sensitized to rose extracts.'],
    contraindications: ['Dry, compromised, or peeling skin.'],
    patchTestingGuidance: 'Apply a quarter-sized dab to jawline for 10 minutes to verify tolerability.',
    suitableSkinTypes: ['Oily', 'Combination'],
    targetedConcerns: ['Excess oil', 'Enlarged pores'],
    references: [
      {
        citation: 'Meier L, Kempe S. Clay minerals in pharmaceutical and cosmetic preparations. Int J Pharm. 2013.',
        source: 'PubMed PMID: 23416207',
        publicationYear: 2013,
      },
    ],
  },
  {
    name: 'Chilled Cucumber & Phytosqualane Maintenance Compress',
    category: 'General skin maintenance',
    description:
      'Sterile aqueous Cucumis sativus fruit extract delivering ascorbic acid, caffeic acid, and silica to hydrate and de-puff skin during warm Indian climate transitions.',
    imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Fresh Organic Cucumber Juice (Cold-Pressed & Filtered)', amount: '2 tbsp', purpose: 'Enzymatic de-puffing & hydration' },
      { name: 'Plant-Derived Squalane', amount: '2 drops', purpose: 'Biomimetic emollient lock' },
    ],
    preparationInstructions: [
      'Press fresh cucumber juice and filter thoroughly through sterile gauze. Mix in 2 drops of plant squalane.',
    ],
    applicationInstructions: [
      'Saturate cotton pads with the chilled mixture and rest across closed eyelids and cheeks for 10 minutes.',
    ],
    frequency: '2-3 times weekly in hot or humid weather',
    potentialBenefits: ['Rapid cooling and refreshing feel', 'Reduces transient periorbital morning puffiness'],
    scientificExplanation:
      'Cucumis sativus fruit extract contains caffeic acid and ascorbic acid which reduce fluid extravasation, paired with high water content (96%) for immediate hydration.',
    evidenceLevel: 'Moderate evidence',
    evidenceExplanation:
      'Validated in clinical cosmetology studies for skin hydration kinetics and periorbital edema reduction.',
    possibleIrritationRisks: ['Extremely low.'],
    allergyWarnings: ['Avoid if allergic to Cucurbitaceae plant family (cucumbers, melons).'],
    contraindications: ['None documented under standard topical use.'],
    patchTestingGuidance: 'Test on inner arm for 15 minutes prior to eye application.',
    suitableSkinTypes: ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
    targetedConcerns: ['Dullness', 'Dryness', 'Skin barrier support'],
    references: [
      {
        citation: 'Mukherjee PK, et al. Phytochemical and therapeutic potential of cucumber. Fitoterapia. 2013.',
        source: 'PubMed PMID: 23098877',
        publicationYear: 2013,
      },
    ],
  },
];

/**
 * Seed default remedies into database if empty
 */
const seedRemediesIfEmpty = async () => {
  for (const remedy of EVIDENCE_BASED_REMEDIES) {
    await Remedy.findOneAndUpdate(
      { name: remedy.name },
      { $set: remedy },
      { upsert: true, new: true }
    );
  }
};

/**
 * List all remedies with optional filtering
 */
const getRemedies = async ({ category, search, skinType, page = 1, limit = 20 }) => {
  await seedRemediesIfEmpty();

  const query = {};

  if (category) {
    query.category = category;
  }

  if (skinType) {
    query.suitableSkinTypes = { $in: [skinType, 'All'] };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Remedy.countDocuments(query);
  const remedies = await Remedy.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    remedies,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / parseInt(limit, 10)),
  };
};

/**
 * Search remedies
 */
const searchRemedies = async (searchTerm) => {
  await seedRemediesIfEmpty();
  if (!searchTerm || !searchTerm.trim()) {
    return Remedy.find().limit(20);
  }

  const regex = new RegExp(searchTerm.trim(), 'i');
  return Remedy.find({
    $or: [
      { name: regex },
      { category: regex },
      { description: regex },
      { 'ingredients.name': regex },
      { targetedConcerns: regex },
    ],
  }).limit(30);
};

/**
 * Get distinct remedy categories
 */
const getCategories = async () => {
  await seedRemediesIfEmpty();
  const dbCats = await Remedy.distinct('category');
  const defaults = [
    'Hydration and dry skin care',
    'Gentle soothing skin care',
    'Oily skin care',
    'Acne-related skin care',
    'Skin barrier support',
    'General skin maintenance',
  ];
  return Array.from(new Set([...defaults, ...dbCats]));
};

/**
 * Get single remedy by ID
 */
const getRemedyById = async (id) => {
  await seedRemediesIfEmpty();
  const remedy = await Remedy.findById(id);
  if (!remedy) {
    const error = new Error('Home remedy not found');
    error.statusCode = 404;
    throw error;
  }
  return remedy;
};

/**
 * Get personalized remedy recommendations based on user skin profile
 */
const getRecommendedRemedies = async (userId) => {
  await seedRemediesIfEmpty();
  const user = await User.findById(userId);

  const skinType = user?.skinProfile?.skinType || 'Combination';
  const skinConcerns = user?.skinProfile?.skinConcerns || [];
  const knownAllergies = (user?.skinProfile?.knownIngredientAllergies || []).map((a) => a.toLowerCase());

  let query = {
    suitableSkinTypes: { $in: [skinType, 'All'] },
  };

  if (skinConcerns.length > 0) {
    query.targetedConcerns = { $in: skinConcerns };
  }

  let candidates = await Remedy.find(query);
  if (candidates.length === 0) {
    candidates = await Remedy.find().limit(6);
  }

  // Filter out any remedy whose ingredients or warnings overlap with user's known allergies
  const safeRemedies = candidates.filter((remedy) => {
    const remedyText = (
      remedy.name +
      ' ' +
      remedy.ingredients.map((i) => i.name).join(' ') +
      ' ' +
      remedy.allergyWarnings.join(' ')
    ).toLowerCase();

    return !knownAllergies.some((allergy) => remedyText.includes(allergy));
  });

  return safeRemedies.slice(0, 10);
};

/**
 * Save remedy for authenticated user
 */
const saveRemedy = async (userId, remedyId, notes = '') => {
  const remedy = await Remedy.findById(remedyId);
  if (!remedy) {
    const error = new Error('Remedy not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = await SavedRemedy.findOne({ userId, remedyId });
  if (existing) {
    if (notes) {
      existing.personalNotes = notes;
      await existing.save();
    }
    return existing;
  }

  return SavedRemedy.create({ userId, remedyId, personalNotes: notes });
};

/**
 * Unsave remedy for authenticated user
 */
const unsaveRemedy = async (userId, remedyId) => {
  return SavedRemedy.findOneAndDelete({ userId, remedyId });
};

/**
 * Get all saved remedies for user
 */
const getSavedRemedies = async (userId) => {
  const saved = await SavedRemedy.find({ userId })
    .populate('remedyId')
    .sort({ createdAt: -1 });

  return saved
    .filter((s) => s.remedyId !== null)
    .map((s) => ({
      ...s.remedyId.toJSON(),
      savedAt: s.createdAt,
      personalNotes: s.personalNotes,
    }));
};

module.exports = {
  seedRemediesIfEmpty,
  getRemedies,
  searchRemedies,
  getCategories,
  getRemedyById,
  getRecommendedRemedies,
  saveRemedy,
  unsaveRemedy,
  getSavedRemedies,
};
