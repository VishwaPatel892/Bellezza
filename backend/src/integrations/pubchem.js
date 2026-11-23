/**
 * PubChem (NIH / NCBI) PUG REST API Client
 * Primary public source for chemical identity, molecular properties, and IUPAC nomenclature.
 */

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

class PubChemClient {
  constructor() {
    this.baseUrl = PUBCHEM_BASE_URL;
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
        if (response.status === 404) return null;
        throw new Error(`PubChem API returned HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Retrieve chemical identity and physical-chemical properties for a cosmetic compound
   * @param {string} compoundName - INCI or common chemical name (e.g., 'niacinamide', 'salicylic acid')
   * @returns {Promise<object|null>}
   */
  async getCompoundProperties(compoundName) {
    if (!compoundName || typeof compoundName !== 'string') return null;

    // Clean common cosmetic prefixes/suffixes for chemical lookup
    const cleanName = compoundName
      .replace(/\s*\(.*?\)\s*/g, '') // remove parenthesized aliases like "(Vitamin B3)"
      .replace(/[0-9.]+%?/g, '')     // remove concentration percentages
      .trim();

    if (!cleanName) return null;

    const url = `${this.baseUrl}/compound/name/${encodeURIComponent(cleanName)}/property/MolecularFormula,MolecularWeight,IUPACName,InChIKey,CanonicalSMILES/JSON`;

    try {
      const data = await this._fetch(url);
      const props = data?.PropertyTable?.Properties?.[0];

      if (!props) return null;

      const cid = props.CID;
      return {
        cid,
        iupacName: props.IUPACName || cleanName,
        molecularFormula: props.MolecularFormula || '',
        molecularWeight: props.MolecularWeight ? parseFloat(props.MolecularWeight) : null,
        inChIKey: props.InChIKey || '',
        canonicalSmiles: props.ConnectivitySMILES || props.CanonicalSMILES || '',
        structure2dUrl: cid ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG` : '',
        pubChemUrl: cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : '',
        source: 'National Center for Biotechnology Information (NCBI) PubChem',
        attribution: 'Chemical identity and physical properties sourced from NIH PubChem.',
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[PubChemClient] getCompoundProperties('${cleanName}') failed:`, err.message);
      return null;
    }
  }
}

const pubchem = new PubChemClient();

module.exports = {
  PubChemClient,
  pubchem,
};

