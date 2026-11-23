const express = require('express');
const {
  searchProducts,
  getProductByBarcode,
  getProductById,
  getProductsByBudget,
  submitProduct,
  getUserSubmissions,
  getProducts,
  getCategories,
  getRecommended,
  compareProducts,
  saveProduct,
  unsaveProduct,
  getSavedProducts,
} = require('../controllers/productController');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Search products endpoint with pagination: /api/products/search?q=&category=&page=&limit=
router.get('/search', searchProducts);

// Product categories: /api/products/categories
router.get('/categories', getCategories);

// Personalized recommendations based on skin profile: /api/products/recommended
router.get('/recommended', authenticate, getRecommended);

// Product comparison (up to 3 products): /api/products/compare?ids=id1,id2,id3
router.get('/compare', compareProducts);
router.post('/compare', compareProducts);

// Saved products list: /api/products/saved
router.get('/saved', authenticate, getSavedProducts);

// Save / Unsave product: POST & DELETE /api/products/:id/save
router.post('/:id/save', authenticate, saveProduct);
router.delete('/:id/save', authenticate, unsaveProduct);

// Budget-filtered product discovery: /api/products/budget?budget=&category=&brand=&minPrice=&maxPrice=&skinType=
router.get('/budget', getProductsByBudget);

// User-submitted product label & barcode: /api/products/submit
router.post('/submit', optionalAuth, submitProduct);

// User's own submissions: /api/products/submissions/my
router.get('/submissions/my', authenticate, getUserSubmissions);

// Barcode lookup endpoint: /api/products/barcode/:barcode
router.get('/barcode/:barcode', getProductByBarcode);

// Specific product by ID: /api/products/:id
router.get('/:id', getProductById);

// All products / filtered catalog: /api/products
router.get('/', getProducts);

module.exports = router;
