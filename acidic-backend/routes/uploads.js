const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-sellers', productController.getBestSellers);
router.get('/categories', productController.getCategories);
router.get('/categories/:slug', productController.getCategoryProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/reviews', productController.getProductReviews);
router.get('/slug/:slug', productController.getProductBySlug);

// Protected routes (require authentication)
router.use(auth.authenticate);
router.post('/:id/view', productController.recordView);
router.post('/:id/wishlist', productController.toggleWishlist);
router.post('/:id/reviews', productController.createReview);

// Admin routes (require admin role)
router.use(auth.authorize('admin'));
router.post('/', upload.array('images', 10), productController.createProduct);
router.put('/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/status', productController.updateProductStatus);
router.put('/:id/inventory', productController.updateInventory);
router.post('/:id/images', upload.array('images', 10), productController.addProductImages);
router.delete('/:id/images/:imageId', productController.removeProductImage);
router.post('/:id/variants', productController.addVariant);
router.put('/:id/variants/:variantId', productController.updateVariant);
router.delete('/:id/variants/:variantId', productController.removeVariant);

// Bulk operations
router.post('/bulk/create', upload.single('file'), productController.bulkCreateProducts);
router.post('/bulk/update', upload.single('file'), productController.bulkUpdateProducts);
router.post('/bulk/inventory', upload.single('file'), productController.bulkUpdateInventory);

module.exports = router;