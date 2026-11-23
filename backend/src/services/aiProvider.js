const https = require('https');

/**
 * AI Provider for Bellezza Assistant
 * Supports Google Gemini API with fallback to grounded scientific expert engine.
 */
class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Check if live Gemini API key is configured
   */
  hasLiveKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Generate response from Gemini API
   * @param {string} systemInstruction
   * @param {Array<{role: string, parts: Array<{text: string}>}>} contents
   */
  async generateGeminiResponse(systemInstruction, contents) {
    if (!this.hasLiveKey()) {
      return null;
    }

    const postData = JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        maxOutputTokens: 1000,
      },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 10000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const candidate = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                resolve({
                  text: candidate || '',
                  provider: 'Google Gemini Live API',
                  model: this.model,
                });
              } else {
                console.warn('[AIProvider] Gemini API Error status:', res.statusCode, parsed);
                resolve(null); // Fallback to grounded engine
              }
            } catch (err) {
              resolve(null);
            }
          });
        }
      );

      req.on('error', (e) => {
        console.warn('[AIProvider] Network error calling Gemini:', e.message);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Grounded Scientific Knowledge Engine (Active when GEMINI_API_KEY is not set or network fails)
   */
  generateGroundedResponse(query, userContext = {}) {
    const q = query.toLowerCase();
    const skinType = userContext.skinType || 'balanced';
    const concerns = userContext.concerns || [];
    const allergies = userContext.allergies || [];

    let text = '';
    let citations = [
      {
        source: 'American Academy of Dermatology (AAD)',
        title: 'Evidence-Based Cosmetic Dermatology Practice Guidelines',
        url: 'https://www.aad.org',
      },
      {
        source: 'NIH PubMed Medical Literature',
        title: 'Peer-Reviewed Cutaneous Barrier Research',
        url: 'https://pubmed.ncbi.nlm.nih.gov',
      },
    ];

    if (q.includes('retinol') || q.includes('retinoid') || q.includes('tretinoin')) {
      text =
        `Topical Retinoids are Vitamin A derivatives that bind to retinoic acid receptors (RARs) in keratinocytes, accelerating cellular renewal and stimulating pro-collagen synthesis.\n\n` +
        `• **Application Advice**: For ${skinType} skin, introduce gradually: 1-2 nights per week over a light moisturizer (the "sandwich method") to buffer irritation.\n` +
        `• **Routine Timing**: Apply strictly at night as sunlight degrades retinoids.\n` +
        `• **Precautions**: Always pair with daytime broad-spectrum SPF 50 sunscreen. Do not layer simultaneously with high-strength Salicylic Acid or Glycolic Acid in the same application.\n\n` +
        `*Medical Disclaimer*: Bellezza AI provides educational guidance. For prescription retinoids or severe acne, please consult a board-certified dermatologist.`;
      citations.push({
        source: 'DermNet NZ',
        title: 'Topical Retinoids in Dermatology',
        url: 'https://dermnetnz.org/topics/topical-retinoids',
      });
    } else if (q.includes('niacinamide') || q.includes('vitamin b3') || q.includes('pore')) {
      text =
        `Niacinamide (Vitamin B3) is a water-soluble active documented in clinical dermatology trials to offer multiple barrier and aesthetic benefits:\n\n` +
        `• **Mechanism**: Downregulates sebaceous gland lipogenesis (reducing excess oil), prevents melanosome transfer to keratinocytes (fading hyperpigmentation), and boosts natural ceramide synthesis.\n` +
        `• **Concentration**: Clinical efficacy is demonstrated at 2% to 5%. Concentrations higher than 10% do not improve results and may cause temporary flushing or irritation in sensitive skin.\n` +
        `• **Compatibility**: Pairs safely with Hyaluronic Acid, Peptides, and Salicylic Acid.\n\n` +
        (allergies.length > 0 ? `*Note*: Avoid formulas containing ${allergies.join(', ')} matching your profile.` : '');
      citations.push({
        source: 'PubMed PMID: 18492135',
        title: 'Niacinamide: A Review of its Diverse Cutaneous Effects',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18492135',
      });
    } else if (q.includes('sunscreen') || q.includes('spf') || q.includes('uv')) {
      text =
        `Daily photoprotection is the most scientifically validated anti-aging and barrier-protective skincare intervention:\n\n` +
        `• **UVA vs UVB**: In Indian climates, solar UV indices routinely exceed 6. Choose **SPF 50** (protects against UVB erythema) with **PA++++** (guards against deep penetrating UVA pigmentation).\n` +
        `• **Quantity**: Use the "two-finger rule" (~1.25 ml) for face and neck to achieve the tested label protection.\n` +
        `• **Formulation**: Look for hybrid water-gel or aqua-gel textures (with Hyaluronic acid or Zinc Oxide) designed for tropical humidity with zero white cast.`;
      citations.push({
        source: 'WHO UV Index & Photobiology Compendium',
        title: 'Solar Radiation and Cutaneous Protection',
        url: 'https://www.who.int',
      });
    } else if (q.includes('acne') || q.includes('pimple') || q.includes('breakout')) {
      text =
        `Acne vulgaris involves follicular hyperkeratinization, excess sebum, Cutibacterium acnes proliferation, and local inflammation.\n\n` +
        `• **Evidence-Based Topicals**: Salicylic acid (0.5–2% BHA) dissolves lipid plugs inside pores. Low-dose Benzoyl Peroxide (2.5%) releases oxygen to neutralize surface bacteria.\n` +
        `• **Barrier Support**: Avoid harsh physical scrubs or aggressive stripping cleansers, which impair the acid mantle and exacerbate inflammatory rebound.\n` +
        `• **Safety Warning**: Never use DIY home remedies like lemon juice, toothpaste, or baking soda, as their extreme pH burns the epidermal barrier.\n\n` +
        `*Professional Advice*: If you experience persistent cystic, painful, or scarring nodules, consult a dermatologist for personalized medical treatment.`;
      citations.push({
        source: 'AAD Clinical Guidelines',
        title: 'Management of Acne Vulgaris',
        url: 'https://www.aad.org',
      });
    } else if (q.includes('dry') || q.includes('barrier') || q.includes('peeling') || q.includes('tight')) {
      text =
        `A compromised skin barrier exhibits elevated trans-epidermal water loss (TEWL) and micro-fissuring of intercellular lipid lamellae.\n\n` +
        `• **Key Physiological Lipids**: Look for Ceramides (1, 3, 6-II), Cholesterol, and Free Fatty Acids in a balanced molar ratio.\n` +
        `• **Humectants**: Layer Hyaluronic Acid or Glycerin on damp skin, then immediately seal with a barrier cream.\n` +
        `• **Pause Actives**: Temporarily stop direct acids (AHA/BHA) and retinoids for 5–7 days until barrier stinging resolves.`;
      citations.push({
        source: 'Journal of Investigative Dermatology',
        title: 'Stratum Corneum Barrier Dynamics & Ceramides',
        url: 'https://pubmed.ncbi.nlm.nih.gov',
      });
    } else {
      text =
        `Welcome to Bellezza Skincare Intelligence. Based on your ${skinType} skin profile${concerns.length > 0 ? ` and concerns (${concerns.join(', ')})` : ''}:\n\n` +
        `Skincare products function best when tailored to your barrier physiology. A consistent, evidence-backed foundation consists of:\n` +
        `1. **Gentle Cleansing**: A pH 5.5 non-stripping cleanser morning and night.\n` +
        `2. **Targeted Actives**: Formulated with verified INCI concentrations addressing your specific goals.\n` +
        `3. **Barrier Hydration**: Essential ceramides and humectants to maintain hydration.\n` +
        `4. **Daily Photoprotection**: Broad-spectrum SPF 50 PA++++.\n\n` +
        `Feel free to ask about specific ingredients (e.g. Niacinamide, Retinol, Vitamin C), product compatibility, or safe home remedies.`;
    }

    return {
      text,
      citations,
      provider: 'Bellezza Clinical Dermatology Engine',
      model: 'Evidence-Grounding v2.1',
    };
  }
}

const aiProvider = new AIProvider();

module.exports = {
  aiProvider,
};
