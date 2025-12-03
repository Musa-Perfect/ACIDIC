const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  
  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      loyaltyTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      verificationToken: crypto.randomBytes(20).toString('hex')
    });

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${user.verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verify your email - ACIDIC Clothing',
      html: `
        <h1>Welcome to ACIDIC Clothing!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name price images')
      .populate('recentlyViewed.product', 'name price images slug');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.body.avatar,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - ACIDIC Clothing',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user addresses
// @route   GET /api/auth/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If this is the first address, set as default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }
    
    user.addresses.push(req.body);
    await user.save();
    
    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.id
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...req.body
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.id
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);
    
    // If default address was deleted and there are other addresses, set first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PUT /api/auth/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    
    // Set the specified address as default
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.id
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    user.addresses[addressIndex].isDefault = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user preferences
// @route   GET /api/auth/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.preferences = {
      ...user.preferences,
      ...req.body
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/auth/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name price images slug category stock status');
    
    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Added to wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/auth/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently viewed
// @route   GET /api/auth/recently-viewed
// @access  Private
exports.getRecentlyViewed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('recentlyViewed.product', 'name price images slug');
    
    // Sort by most recent
    const recentlyViewed = user.recentlyViewed
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
      .slice(0, 20); // Limit to 20 most recent
    
    res.status(200).json({
      success: true,
      recentlyViewed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loyalty info
// @route   GET /api/auth/loyalty
// @access  Private
exports.getLoyaltyInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'loyaltyPoints loyaltyTier rewardsEarned rewardsRedeemed'
    );
    
    // Calculate progress to next tier
    let nextTier = '';
    let pointsNeeded = 0;
    let progressPercentage = 0;
    
    if (user.loyaltyTier === 'Bronze') {
      nextTier = 'Silver';
      pointsNeeded = Math.max(0, 200 - user.loyaltyPoints);
      progressPercentage = Math.min(100, (user.loyaltyPoints / 200) * 100);
    } else if (user.loyaltyTier === 'Silver') {
      nextTier = 'Gold';
      pointsNeeded = Math.max(0, 500 - user.loyaltyPoints);
      progressPercentage = Math.min(100, ((user.loyaltyPoints - 200) / 300) * 100);
    } else if (user.loyaltyTier === 'Gold') {
      nextTier = 'Platinum';
      pointsNeeded = Math.max(0, 1000 - user.loyaltyPoints);
      progressPercentage = Math.min(100, ((user.loyaltyPoints - 500) / 500) * 100);
    } else {
      nextTier = 'Max';
      progressPercentage = 100;
    }
    
    res.status(200).json({
      success: true,
      loyalty: {
        points: user.loyaltyPoints,
        tier: user.loyaltyTier,
        earned: user.rewardsEarned,
        redeemed: user.rewardsRedeemed,
        nextTier,
        pointsNeeded,
        progressPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};