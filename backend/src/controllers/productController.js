const productService = require('../services/productService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Search cosmetic products with pagination and category filtering
 * GET /api/products/search?q=&category=&page=&limit=
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q = '', category = null, page = 1, limit = 20 } = req.query;
    const result = await productService.searchProducts(q, {
      category,
      page: Number(page),
      limit: Number(limit),
    });
    return sendSuccess(res, result, 'Products retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve cosmetic product by Barcode
 * GET /api/products/barcode/:barcode
 */
const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      return sendError(res, 'Barcode parameter is required.', 400);
    }
    const product = await productService.getProductByBarcode(barcode);
    if (!product) {
      return sendError(res, `Cosmetic product with barcode ${barcode} not found.`, 404);
    }
    return sendSuccess(res, product, 'Product retrieved by barcode.');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single product by ID (supports MongoDB ID or external/barcode ID)
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }
    return sendSuccess(res, product, 'Product details retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Budget-based product discovery in INR
 * GET /api/products/budget?budget=&category=&brand=&minPrice=&maxPrice=&skinType=
 */
const getProductsByBudget = async (req, res, next) => {
  try {
    const result = await productService.getProductsByBudget(req.query);
    return sendSuccess(res, result, 'Budget-filtered products retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Submit user product label & barcode for verification
 * POST /api/products/submit
 */
const submitProduct = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id || null;
    const result = await productService.submitProduct(req.body, userId);
    return sendSuccess(res, result, 'Product submitted for verification.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user product submissions
 * GET /api/products/submissions/my
 */
const getUserSubmissions = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const submissions = await productService.getUserSubmissions(userId);
    return sendSuccess(res, submissions, 'User submissions retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * General list / filter products
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts(req.query);
    return sendSuccess(res, products, 'Products retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get product categories
 * GET /api/products/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    return sendSuccess(res, categories, 'Product categories retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized product recommendations
 * GET /api/products/recommended
 */
const getRecommended = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const recommended = await productService.getRecommendedProducts(userId);
    return sendSuccess(res, recommended, 'Personalized product recommendations retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Compare up to 3 products
 * GET /api/products/compare?ids=id1,id2,id3
 */
const compareProducts = async (req, res, next) => {
  try {
    const ids = req.query.ids || req.body?.ids || [];
    const comparison = await productService.compareProducts(ids);
    return sendSuccess(res, comparison, 'Product comparison generated.');
  } catch (error) {
    next(error);
  }
};

/**
 * Save product
 * POST /api/products/:id/save
 */
const saveProduct = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    const { notes } = req.body || {};
    const saved = await productService.saveProduct(userId, id, notes);
    return sendSuccess(res, saved, 'Product saved to routine library.');
  } catch (error) {
    next(error);
  }
};

/**
 * Unsave product
 * DELETE /api/products/:id/save
 */
const unsaveProduct = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { id } = req.params;
    await productService.unsaveProduct(userId, id);
    return sendSuccess(res, { success: true }, 'Product removed from saved items.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get saved products
 * GET /api/products/saved
 */
const getSavedProducts = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const saved = await productService.getSavedProducts(userId);
    return sendSuccess(res, saved, 'Saved products retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
