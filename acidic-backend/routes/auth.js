const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Protected routes
router.use(auth.authenticate);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);
router.delete('/account', authController.deleteAccount);

// Address management
router.get('/addresses', authController.getAddresses);
router.post('/addresses', authController.addAddress);
router.put('/addresses/:id', authController.updateAddress);
router.delete('/addresses/:id', authController.deleteAddress);
router.put('/addresses/:id/default', authController.setDefaultAddress);

// Preferences
router.get('/preferences', authController.getPreferences);
router.put('/preferences', authController.updatePreferences);

// Wishlist
router.get('/wishlist', authController.getWishlist);
router.post('/wishlist/:productId', authController.addToWishlist);
router.delete('/wishlist/:productId', authController.removeFromWishlist);

// Recently viewed
router.get('/recently-viewed', authController.getRecentlyViewed);

// Loyalty
router.get('/loyalty', authController.getLoyaltyInfo);
router.get('/loyalty/transactions', authController.getLoyaltyTransactions);

module.exports = router;