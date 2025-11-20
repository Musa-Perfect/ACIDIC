const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/user');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock
      if (product.inventory.stock < item.quantity && !product.inventory.allowBackorder) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Calculate item total
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        variant: item.variant,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url
      });
    }

    // Calculate shipping (R150 fixed for now)
    const shipping = 150;
    const tax = subtotal * 0.15; // 15% VAT for South Africa
    const grandTotal = subtotal + shipping + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total: {
        subtotal,
        shipping,
        tax,
        grandTotal
      },
      shippingAddress,
      payment: {
        method: paymentMethod
      }
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.stock': -item.quantity }
      });
    }

    // Update user loyalty points
    const user = await User.findById(req.user.id);
    user.loyalty.points += Math.floor(subtotal / 10);
    user.updateLoyaltyTier();
    await user.save();

    // Populate order data
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('items.product', 'name images');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status and tracking
    order.status = status;
    
    if (status === 'shipped' && trackingNumber) {
      order.shipping.trackingNumber = trackingNumber;
      order.shipping.carrier = carrier;
      order.shipping.shippedDate = new Date();
    }

    if (status === 'delivered') {
      order.shipping.deliveryDate = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};