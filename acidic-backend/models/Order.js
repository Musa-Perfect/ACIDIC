const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: String,
      color: String
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String
  }],
  total: {
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      required: true,
      default: 0
    },
    tax: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    }
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    phone: String,
    email: String
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: String
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'eft', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentDate: Date
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  shipping: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedDate: Date,
    deliveryDate: Date
  },
  notes: {
    customer: String,
    internal: String
  },
  loyaltyPoints: {
    earned: {
      type: Number,
      default: 0
    },
    used: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.orderNumber = `ACD-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.total.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate grand total
  this.total.grandTotal = this.total.subtotal + 
                         this.total.shipping + 
                         this.total.tax - 
                         this.total.discount;

  // Calculate loyalty points (1 point per R10 spent)
  this.loyaltyPoints.earned = Math.floor(this.total.subtotal / 10);

  next();
});

// Update product sales count
orderSchema.post('save', async function() {
  if (this.status === 'delivered') {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { salesCount: item.quantity }
      });
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);