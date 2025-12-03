const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Customer information
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  // Shipping information
  shippingAddress: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'South Africa'
    },
    instructions: String
  },
  
  // Billing information
  billingAddress: {
    sameAsShipping: {
      type: Boolean,
      default: true
    },
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: String
  },
  
  // Order items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      color: String,
      size: String
    },
    sku: String,
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number,
    image: String
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 150,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountCode: String,
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    gateway: String,
    currency: {
      type: String,
      default: 'ZAR'
    },
    paidAt: Date
  },
  
  // Shipping information
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'failed', 'returned'],
      default: 'pending'
    },
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: String,
    notes: String
  }],
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Cancellation/Refund
  cancellationReason: String,
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,
  
  // Loyalty points
  pointsEarned: {
    type: Number,
    default: 0
  },
  pointsRedeemed: {
    type: Number,
    default: 0
  },
  
  // Analytics
  ipAddress: String,
  userAgent: String,
  referrer: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Fulfillment
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfillmentNotes: String
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ACD-${year}${month}${day}-${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = this.subtotal + this.shippingFee + this.taxAmount - this.discountAmount;
  
  // Update status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: 'system'
    });
  }
  
  next();
});

// Method to calculate points
orderSchema.methods.calculatePoints = function() {
  // 1 point per R10 spent
  return Math.floor(this.total / 10);
};

// Method to update inventory
orderSchema.methods.updateInventory = async function(action = 'reserve') {
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    if (product) {
      if (action === 'reserve') {
        await product.updateStock(-item.quantity);
      } else if (action === 'release') {
        await product.updateStock(item.quantity);
      } else if (action === 'sold') {
        product.salesCount += item.quantity;
        await product.save();
      }
    }
  }
};

// Method to send status notifications
orderSchema.methods.sendStatusNotification = async function() {
  // This would integrate with email/notification service
  console.log(`Order ${this.orderNumber} status changed to ${this.status}`);
  // Implementation would use nodemailer or a notification service
};

// Virtual for display status
orderSchema.virtual('displayStatus').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ 'payment.transactionId': 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;