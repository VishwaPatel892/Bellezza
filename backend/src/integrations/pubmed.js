/**
 * PubMed (NCBI / NLM) E-Utilities API Client
 * Primary public source for peer-reviewed biomedical and dermatological literature.
 */

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

class PubMedClient {
  constructor() {
    this.baseUrl = PUBMED_BASE_URL;
    this.timeoutMs = 8000;
  }

  /**
   * Helper fetch with timeout and headers
   */
  async _fetch(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BellezzaIndia/1.0 (contact@bellezza.skin)',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`PubMed API returned HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Classify evidence tier based on study title and publication characteristics
   */
  _determineEvidenceTier(title = '') {
    const t = title.toLowerCase();
    if (t.includes('systematic review') || t.includes('meta-analysis') || t.includes('randomized controlled') || t.includes('double-blind')) {
      return {
        level: 'Level 1: High Evidence',
        type: 'Systematic Review / Randomized Controlled Trial (RCT)',
        description: 'Rigorous peer-reviewed clinical trial with control group or multi-study systematic synthesis.',
      };
    }
    if (t.includes('clinical trial') || t.includes('cohort') || t.includes('in vivo') || t.includes('patient') || t.includes('comparative study')) {
      return {
        level: 'Level 2: Moderate Evidence',
        type: 'Human Clinical Cohort / In-Vivo Trial',
        description: 'Controlled in-vivo dermatological study assessing cutaneous efficacy in human participants.',
      };
    }
    return {
      level: 'Level 3: Preliminary Evidence',
      type: 'Mechanistic / In-Vitro Molecular Assay',
      description: 'Laboratory assay exploring cellular pathways, stratum corneum permeability, or antioxidant mechanisms.',
    };
  }

  /**
   * Search PubMed for peer-reviewed dermatological studies related to an ingredient
   * @param {string} ingredientName
   * @param {number} maxResults
   * @returns {Promise<object>}
   */
  async searchDermatologicalStudies(ingredientName, maxResults = 3) {
    if (!ingredientName || typeof ingredientName !== 'string') {
      return { totalStudies: 0, studies: [], source: 'PubMed / National Library of Medicine' };
    }

    const cleanName = ingredientName
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/[0-9.]+%?/g, '')
      .trim();

    if (!cleanName) {
      return { totalStudies: 0, studies: [], source: 'PubMed / National Library of Medicine' };
    }

    try {
      // Step 1: E-Search for PubMed IDs
      const searchTerm = `(${encodeURIComponent(cleanName)}) AND (dermatology[Title/Abstract] OR "skin"[Title/Abstract] OR "stratum corneum"[Title/Abstract])`;
      const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${searchTerm}&retmode=json&retmax=${maxResults}&sort=pub_date`;

      const searchData = await this._fetch(searchUrl);
      const totalCount = parseInt(searchData?.esearchresult?.count || '0', 10);
      const idList = searchData?.esearchresult?.idlist || [];

      if (idList.length === 0) {
        return {
          totalStudies: totalCount,
          studies: [],
          evidenceSummary: `No indexed clinical dermatology studies found for "${cleanName}".`,
          source: 'PubMed / National Library of Medicine',
        };
      }

      // Step 2: E-Summary for article titles, authors, and journals
      const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
      const summaryData = await this._fetch(summaryUrl);
      const resultObj = summaryData?.result || {};

      const studies = idList.map((pmid) => {
        const item = resultObj[pmid];
        if (!item) return null;

        const title = item.title ? item.title.replace(/\[|\]/g, '') : 'Clinical Study';
        const authors = Array.isArray(item.authors)
          ? item.authors.slice(0, 3).map((a) => a.name).join(', ') + (item.authors.length > 3 ? ' et al.' : '')
          : 'Dermatology Research Group';

        const tier = this._determineEvidenceTier(title);

        return {
          pmid,
          title,
          authors,
          journal: item.source || item.fulljournalname || 'Dermatology Journal',
          pubDate: item.pubdate || item.epubdate || 'Recent',
          articleUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          evidenceLevel: tier.level,
          evidenceType: tier.type,
          evidenceDescription: tier.description,
        };
      }).filter(Boolean);

      return {
        totalStudies: totalCount,
        studies,
        evidenceSummary: `Found ${totalCount} peer-reviewed studies on PubMed evaluating cutaneous dynamics of ${cleanName}.`,
        source: 'National Library of Medicine (NLM) PubMed',
        attribution: 'Clinical evidence retrieved from PubMed / US National Institutes of Health.',
        limitations: 'Published scientific studies describe general physiological mechanisms and clinical cohort outcomes; they do not guarantee individualized topical tolerance or efficacy.',
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[PubMedClient] searchDermatologicalStudies('${cleanName}') failed:`, err.message);
      return {
        totalStudies: 0,
        studies: [],
        evidenceSummary: 'PubMed clinical index temporarily unreachable.',
        source: 'PubMed / National Library of Medicine',
        error: err.message,
      };
    }
  }
}

const pubmed = new PubMedClient();

module.exports = {
  PubMedClient,
  pubmed,
};

