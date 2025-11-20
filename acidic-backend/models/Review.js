const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    url: String,
    alt: String
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatorNotes: String,
  response: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    await product.updateRating();
  }
});

// Update product rating when review is removed
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  await product.updateRating();
});

module.exports = mongoose.model('Review', reviewSchema);