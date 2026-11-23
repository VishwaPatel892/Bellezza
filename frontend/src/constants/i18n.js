/**
 * Localization dictionary supporting English and Hindi
 * Architecture ready for Tamil, Telugu, Bengali, and other regional languages
 */

export const STRINGS = {
  en: {
    appName: 'Bellezza',
    tagline: 'The Science Behind Your Glow',
    welcome: 'Welcome',
    welcomeSubtitle: 'Discover a routine that works for your skin.',
    explore: 'Explore',
    routines: 'Routines',
    assistant: 'Assistant',
    profile: 'Profile',
    climateSkincare: 'Climate-Aware Skincare',
    uvIndex: 'UV Index',
    humidity: 'Humidity',
    temperature: 'Temp',
    budgetFilter: 'Filter by Budget',
    indianBrands: 'Popular Indian Brands',
    barcodeLookup: 'Barcode Lookup',
    analyzeFormula: 'Analyze Formula',
    ingredientIntelligence: 'Ingredient Intelligence',
    pubchemProperties: 'PubChem Chemical Properties',
    pubmedEvidence: 'PubMed Clinical Evidence',
    submitProduct: 'Submit Indian Product',
    dpdpPrivacy: 'DPDP Privacy & Compliance',
    exportData: 'Export My Data (JSON)',
    deleteAccount: 'Delete Account',
    disclaimer: 'Information is provided for educational reference and does not constitute medical advice.',
  },
  hi: {
    appName: 'बेलैज़ा',
    tagline: 'आपकी त्वचा के निखार का विज्ञान',
    welcome: 'स्वागत है',
    welcomeSubtitle: 'अपनी त्वचा के अनुकूल दैनिक देखभाल खोजें।',
    explore: 'खोजें',
    routines: 'रूटीन',
    assistant: 'सहायक',
    profile: 'प्रोफाइल',
    climateSkincare: 'मौसम-अनुकूल त्वचा देखभाल',
    uvIndex: 'यूवी सूचकांक',
    humidity: 'नमी',
    temperature: 'तापमान',
    budgetFilter: 'बजट के अनुसार खोजें',
    indianBrands: 'प्रमुख भारतीय ब्रांड्स',
    barcodeLookup: 'बारकोड खोज',
    analyzeFormula: 'सामग्री का विश्लेषण',
    ingredientIntelligence: 'घटक विज्ञान व प्रमाण',
    pubchemProperties: 'पबकेम रासायनिक गुण',
    pubmedEvidence: 'पबमेड नैदानिक प्रमाण',
    submitProduct: 'उत्पाद जोड़ें',
    dpdpPrivacy: 'डेटा गोपनीयता व डीपीइपी अनुपालन',
    exportData: 'मेरा डेटा निर्यात करें',
    deleteAccount: 'खाता हटाएं',
    disclaimer: 'यह जानकारी केवल शैक्षणिक संदर्भ के लिए है और चिकित्सकीय सलाह नहीं है।',
  },
};

let currentLanguage = 'en';

export const setAppLanguage = (lang) => {
  if (STRINGS[lang]) {
    currentLanguage = lang;
  }
};

export const getAppLanguage = () => currentLanguage;

export const t = (key) => {
  return STRINGS[currentLanguage]?.[key] || STRINGS.en[key] || key;
};

