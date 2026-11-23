/**
 * Indian Market Utilities: Currency formatting, Phone validation, Timezone helpers
 */

const DEFAULT_CURRENCY = 'INR';
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format an amount in Indian Rupees (INR)
 * e.g. 1499 -> "₹1,499"
 * @param {number} amount
 * @returns {string}
 */
function formatInr(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate an Indian mobile number (10 digits starting with 6, 7, 8, or 9)
 * Supports optional +91, 91, or 0 prefix
 * @param {string} phone
 * @returns {boolean}
 */
function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Normalize an Indian phone number to international format: +91XXXXXXXXXX
 * @param {string} phone
 * @returns {string}
 */
function normalizeIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (match && match[1]) {
    return `+91${match[1]}`;
  }
  return phone;
}

/**
 * Predefined Indian Skincare Brands
 */
const POPULAR_INDIAN_BRANDS = [
  'Minimalist',
  'The Derma Co',
  'Plum',
  'Dot & Key',
  'Dr. Sheth\'s',
  'Re\'equil',
  'Sebamed India',
  'Cetaphil India',
  'Bioderma India',
  'Forest Essentials',
  'Kama Ayurveda',
  'Aqualogica',
  'Himalaya',
  'Biotique',
  'Neutrogena',
  'Bellezza Lab',
];

/**
 * Major Indian Cities and Meteorological Coordinates
 */
const INDIAN_CITIES = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, climateType: 'Tropical Coastal' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lon: 77.2090, climateType: 'Semi-Arid Extreme' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, climateType: 'Tropical Savanna Plateau' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, climateType: 'Tropical Wet & Dry' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, climateType: 'Subtropical Humid' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, climateType: 'Semi-Arid Warm' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, climateType: 'Tropical Wet & Dry' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, climateType: 'Hot Semi-Arid' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, climateType: 'Hot Semi-Arid Desert' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, climateType: 'Tropical Monsoon' },
];

module.exports = {
  DEFAULT_CURRENCY,
  DEFAULT_TIMEZONE,
  formatInr,
  isValidIndianPhone,
  normalizeIndianPhone,
  POPULAR_INDIAN_BRANDS,
  INDIAN_CITIES,
};

