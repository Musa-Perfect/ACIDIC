const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name profile.avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { product, rating, title, comment, order } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Verify purchase if order is provided
    let verifiedPurchase = false;
    if (order) {
      const orderDoc = await Order.findOne({
        _id: order,
        user: req.user.id,
        status: 'delivered'
      });

      if (orderDoc) {
        const hasProduct = orderDoc.items.some(item => 
          item.product.toString() === product
        );
        verifiedPurchase = hasProduct;
      }
    }

    const review = await Review.create({
      user: req.user.id,
      product,
      order: order || undefined,
      rating,
      title,
      comment,
      verifiedPurchase
    });

    // Update product rating
    const productDoc = await Product.findById(product);
    await productDoc.updateRating();

    await review.populate('user', 'name profile.avatar');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name profile.avatar');

    // Update product rating
    const product = await Product.findById(review.product);
    await product.updateRating();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    // Update product rating
    const product = await Product.findById(productId);
    await product.updateRating();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get pending reviews (Admin)
// @route   GET /api/reviews/pending
// @access  Private/Admin
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Moderate review (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
exports.moderateReview = async (req, res) => {
  try {
    const { status, moderatorNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatorNotes,
        ...(status === 'approved' && { respondedAt: new Date() })
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name profile.avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update product rating if approved
    if (status === 'approved') {
      const product = await Product.findById(review.product);
      await product.updateRating();
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};