const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 15 // VAT in South Africa
  },
  
  // Inventory
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  allowBackorders: {
    type: Boolean,
    default: false
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: String,
  tags: [String],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  
  // Product attributes
  brand: {
    type: String,
    default: 'ACIDIC'
  },
  color: [String],
  size: [{
    name: String,
    stock: Number,
    skuSuffix: String
  }],
  material: String,
  weight: Number, // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: Number
  }],
  
  // Variants
  variants: [{
    sku: String,
    attributes: {
      color: String,
      size: String
    },
    price: Number,
    stock: Number,
    images: [String]
  }],
  
  // Features & specifications
  features: [{
    title: String,
    description: String
  }],
  specifications: Map,
  careInstructions: [String],
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Reviews & ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  
  // Sales & popularity
  views: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'out-of-stock', 'discontinued', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  
  // Dates
  releaseDate: {
    type: Date,
    default: Date.now
  },
  saleStartDate: Date,
  saleEndDate: Date,
  
  // Related products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return this.price;
  }
  return null;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0 || this.allowBackorders;
});

// Virtual for low stock
productSchema.virtual('isLowStock').get(function() {
  return this.trackInventory && this.stock <= this.lowStockThreshold;
});

// Method to update stock
productSchema.methods.updateStock = function(quantity) {
  if (this.trackInventory) {
    this.stock += quantity;
    if (this.stock < 0 && !this.allowBackorders) {
      throw new Error('Insufficient stock');
    }
  }
  return this.save();
};

// Method to update rating
productSchema.methods.updateRating = function(newRating, oldRating = null) {
  if (oldRating) {
    // Remove old rating
    this.rating.distribution[oldRating]--;
    this.rating.count--;
    this.rating.average = ((this.rating.average * (this.rating.count + 1)) - oldRating) / this.rating.count;
  }
  
  // Add new rating
  this.rating.distribution[newRating]++;
  this.rating.count++;
  this.rating.average = ((this.rating.average * (this.rating.count - 1)) + newRating) / this.rating.count;
  
  return this.save();
};

// Indexes for better performance
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'tags': 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;