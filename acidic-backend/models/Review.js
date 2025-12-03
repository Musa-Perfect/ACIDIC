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
    ref: 'Order',
    required: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  videos: [{
    url: String,
    thumbnail: String
  }],
  
  // Product-specific ratings
  attributeRatings: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    fit: {
      type: String,
      enum: ['too-small', 'small', 'perfect', 'large', 'too-large']
    },
    comfort: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Helpfulness
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  unhelpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  verifiedPurchaseDate: Date,
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Response from business
  businessResponse: {
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: Date
  }],
  
  // Flags
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    previousRating: Number,
    previousComment: String,
    editedAt: Date,
    reason: String
  }],
  
  // Metadata
  location: String,
  device: String,
  browser: String,
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true
});

// Pre-save middleware
reviewSchema.pre('save', async function(next) {
  if (this.isModified('rating') || this.isModified('comment')) {
    this.updatedAt = new Date();
    
    if (this.isModified('rating') && this.rating) {
      // Update product rating
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.product);
      if (product) {
        await product.updateRating(this.rating, this._originalRating);
      }
    }
  }
  
  // Verify purchase if not already verified
  if (!this.isVerifiedPurchase && this.order) {
    const Order = mongoose.model('Order');
    const order = await Order.findById(this.order);
    if (order && order.user.equals(this.user) && order.status === 'delivered') {
      this.isVerifiedPurchase = true;
      this.verifiedPurchaseDate = order.deliveredAt || new Date();
    }
  }
  
  next();
});

// Method to vote helpful/unhelpful
reviewSchema.methods.voteHelpful = async function(userId, isHelpful = true) {
  const alreadyHelpful = this.helpfulUsers.includes(userId);
  const alreadyUnhelpful = this.unhelpfulUsers.includes(userId);
  
  if (isHelpful) {
    if (alreadyUnhelpful) {
      this.unhelpfulVotes--;
      this.unhelpfulUsers.pull(userId);
    }
    if (!alreadyHelpful) {
      this.helpfulVotes++;
      this.helpfulUsers.push(userId);
    }
  } else {
    if (alreadyHelpful) {
      this.helpfulVotes--;
      this.helpfulUsers.pull(userId);
    }
    if (!alreadyUnhelpful) {
      this.unhelpfulVotes++;
      this.unhelpfulUsers.push(userId);
    }
  }
  
  return this.save();
};

// Method to calculate helpfulness score
reviewSchema.methods.helpfulnessScore = function() {
  if (this.helpfulVotes + this.unhelpfulVotes === 0) return 0;
  return (this.helpfulVotes / (this.helpfulVotes + this.unhelpfulVotes)) * 100;
};

// Virtual for verified badge
reviewSchema.virtual('isVerified').get(function() {
  return this.isVerifiedPurchase;
});

// Indexes for better performance
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 });
reviewSchema.index({ 'helpfulVotes': -1 });
reviewSchema.index({ isApproved: 1, isFeatured: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;