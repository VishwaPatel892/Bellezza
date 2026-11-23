/**
 * Indian Skincare Market Constants & Configurations
 */

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
  name: 'Indian Rupee',
};

export const BUDGET_TIERS = [
  { id: 'all', label: 'All Budgets', min: 0, max: Infinity },
  { id: 'under_499', label: 'Under ₹499', min: 0, max: 499, subtitle: 'Pocket-Friendly Essentials' },
  { id: '500_999', label: '₹500 – ₹999', min: 500, max: 999, subtitle: 'Clinical Actives & Daily Care' },
  { id: '1000_1999', label: '₹1,000 – ₹1,999', min: 1000, max: 1999, subtitle: 'Specialized Formulations' },
  { id: '2000_plus', label: '₹2,000+', min: 2000, max: Infinity, subtitle: 'Luxury & Dermatological Grade' },
];

export const POPULAR_INDIAN_BRANDS = [
  'All Brands',
  'Minimalist',
  'The Derma Co',
  'Plum',
  'Dot & Key',
  'Re\'equil',
  'Dr. Sheth\'s',
  'Sebamed India',
  'Cetaphil India',
  'Bioderma India',
  'Forest Essentials',
  'Kama Ayurveda',
  'Aqualogica',
  'Himalaya',
  'Neutrogena',
  'Bellezza Lab',
];

export const INDIAN_CITIES = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', climateType: 'Tropical Coastal' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', climateType: 'Semi-Arid Extreme' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', climateType: 'Tropical Savanna' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', climateType: 'Tropical Wet & Dry' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', climateType: 'Subtropical Humid' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', climateType: 'Semi-Arid Warm' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', climateType: 'Tropical Highland' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', climateType: 'Hot Semi-Arid' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', climateType: 'Hot Desert Arid' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', climateType: 'Tropical Monsoon' },
];

