const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: String,
  icon: String,
  bannerImage: String,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Display
  displayOrder: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  productCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Filters
  filters: [{
    name: String,
    type: {
      type: String,
      enum: ['color', 'size', 'price', 'brand', 'material']
    },
    values: [String]
  }],
  
  // Attributes
  attributes: [{
    name: String,
    required: Boolean,
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean']
    },
    options: [String],
    defaultValue: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for child categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save middleware to update slug
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;