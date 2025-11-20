const express = require('express');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  moderateReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.get('/pending', protect, authorize('admin', 'moderator'), getPendingReviews);
router.get('/product/:productId', getProductReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/moderate', protect, authorize('admin', 'moderator'), moderateReview);

module.exports = router;