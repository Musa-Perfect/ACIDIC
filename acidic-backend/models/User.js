const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/acidic/image/upload/v1/default-avatar.png'
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  addresses: [{
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'South Africa'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Enhanced profile fields
  preferences: {
    style: [String],
    colors: [String],
    sizes: {
      tops: String,
      bottoms: String,
      shoes: String
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },
  
  // Loyalty program
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  rewardsEarned: {
    type: Number,
    default: 0
  },
  rewardsRedeemed: {
    type: Number,
    default: 0
  },
  
  // Order stats
  orderCount: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  
  // Wishlist & saved items
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  recentlyViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: Date
  }],
  
  // Social features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedOutfits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit'
  }],
  
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Timestamps
  lastLogin: Date,
  lastActivity: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update loyalty tier
userSchema.methods.updateLoyaltyTier = function() {
  if (this.loyaltyPoints >= 1000) {
    this.loyaltyTier = 'Platinum';
  } else if (this.loyaltyPoints >= 500) {
    this.loyaltyTier = 'Gold';
  } else if (this.loyaltyPoints >= 200) {
    this.loyaltyTier = 'Silver';
  } else {
    this.loyaltyTier = 'Bronze';
  }
  return this.save();
};

// Method to add loyalty points
userSchema.methods.addLoyaltyPoints = async function(points, reason) {
  this.loyaltyPoints += points;
  this.rewardsEarned += points;
  await this.updateLoyaltyTier();
  
  // Log the points transaction
  await this.model('LoyaltyTransaction').create({
    user: this._id,
    points: points,
    type: 'earned',
    reason: reason,
    balance: this.loyaltyPoints
  });
  
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ loyaltyPoints: -1 });
userSchema.index({ totalSpent: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;