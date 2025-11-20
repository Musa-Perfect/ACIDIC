const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'tshirts', 
      'sweaters', 
      'hoodies', 
      'pants', 
      'twopieces', 
      'accessories'
    ]
  },
  subcategory: String,
  brand: {
    type: String,
    default: 'ACIDIC'
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    lowStockAlert: {
      type: Number,
      default: 10
    }
  },
  variants: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      required: true
    },
    color: {
      name: String,
      hex: String
    },
    price: Number,
    comparePrice: Number,
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    sku: String
  }],
  attributes: {
    material: String,
    fit: {
      type: String,
      enum: ['slim', 'regular', 'oversized', 'relaxed']
    },
    care: [String],
    sustainability: {
      ecoFriendly: Boolean,
      organic: Boolean,
      recycled: Boolean,
      description: String
    }
  },
  seo: {
    title: String,
    description: String,
    slug: String
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  salesCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
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
    }
  }
}, {
  timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = 'ACD';
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  
  if (!this.seo?.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Update average rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { product: this._id, status: 'approved' }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].ratingCount;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);