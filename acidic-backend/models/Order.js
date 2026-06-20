const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        variant: String,
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: String
      }
    ],
    total: {
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 }
    },
    shippingAddress: {
      type: Object,
      required: true
    },
    payment: {
      method: {
        type: String,
        required: true
      }
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shipping: {
      trackingNumber: String,
      carrier: String,
      shippedDate: Date,
      deliveryDate: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

