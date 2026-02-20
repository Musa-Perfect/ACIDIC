// ================================================================
//  FIREBASE DATABASE SERVICE
//  Products, Orders, Inventory, Reviews management
// ================================================================

// ── Products Management ───────────────────────────────────────────

// Load all products from Firestore
async function loadProductsFromFirebase() {
  try {
    const snapshot = await firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).get();
    const products = {};
    
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      const category = product.category || 'allproducts';
      
      if (!products[category]) {
        products[category] = [];
      }
      products[category].push(product);
      
      // Add to allproducts
      if (!products.allproducts) {
        products.allproducts = [];
      }
      if (category !== 'allproducts') {
        products.allproducts.push(product);
      }
    });
    
    // Update global productData
    window.productData = products;
    
    // Save to localStorage for offline access
    localStorage.setItem('acidicProducts_firebase', JSON.stringify(products));
    
    console.log('✓ Products loaded from Firebase:', Object.keys(products).length, 'categories');
    return products;
    
  } catch (error) {
    console.error('Error loading products from Firebase:', error);
    
    // Fallback to localStorage
    const cached = localStorage.getItem('acidicProducts_firebase');
    if (cached) {
      console.log('Using cached products');
      return JSON.parse(cached);
    }
    
    throw error;
  }
}

// Add new product (Admin function)
async function addProductToFirebase(productData) {
  try {
    const docRef = await firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).add({
      ...productData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✓ Product added:', docRef.id);
    
    if (firebaseAnalytics) {
      firebaseAnalytics.logEvent('product_added', {
        product_id: docRef.id,
        product_name: productData.name
      });
    }
    
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }
}

// Update product (Admin function)
async function updateProductInFirebase(productId, updates) {
  try {
    await firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).doc(productId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✓ Product updated:', productId);
    return { success: true };
    
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
}

// ── Orders Management ─────────────────────────────────────────────

// Create new order
async function createOrderInFirebase(orderData) {
  try {
    const user = getCurrentFirebaseUser();
    if (!user) {
      throw new Error('User must be signed in to place order');
    }
    
    const order = {
      userId: user.uid,
      userEmail: user.email,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping || 150,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await firebaseDB.collection(FIREBASE_COLLECTIONS.ORDERS).add(order);
    
    // Update user's order history
    await firebaseDB.collection(FIREBASE_COLLECTIONS.USERS).doc(user.uid).update({
      orders: firebase.firestore.FieldValue.arrayUnion(docRef.id)
    });
    
    // Award reward points
    const pointsEarned = Math.floor(orderData.total / 10);
    await firebaseDB.collection(FIREBASE_COLLECTIONS.USERS).doc(user.uid).update({
      points: firebase.firestore.FieldValue.increment(pointsEarned)
    });
    
    // Clear cart
    await firebaseDB.collection(FIREBASE_COLLECTIONS.CART).doc(user.uid).delete();
    
    // Log analytics
    if (firebaseAnalytics) {
      firebaseAnalytics.logEvent('purchase', {
        transaction_id: docRef.id,
        value: orderData.total,
        currency: 'ZAR',
        items: orderData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
    
    console.log('✓ Order created:', docRef.id);
    return { success: true, orderId: docRef.id, pointsEarned };
    
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
}

// Get user orders
async function getUserOrders(userId) {
  try {
    const snapshot = await firebaseDB.collection(FIREBASE_COLLECTIONS.ORDERS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
    
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
}

// Update order status (Admin function)
async function updateOrderStatus(orderId, status) {
  try {
    await firebaseDB.collection(FIREBASE_COLLECTIONS.ORDERS).doc(orderId).update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✓ Order status updated:', orderId, status);
    return { success: true };
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}

// ── Inventory Management ──────────────────────────────────────────

// Update product inventory
async function updateInventory(productId, variantId, quantityChange) {
  try {
    const productRef = firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).doc(productId);
    
    await firebaseDB.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new Error('Product not found');
      }
      
      const product = productDoc.data();
      const inventory = product.inventory || [];
      
      const variantIndex = inventory.findIndex(v => v.variantId === variantId);
      
      if (variantIndex === -1) {
        throw new Error('Variant not found');
      }
      
      const newQuantity = inventory[variantIndex].quantity + quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory');
      }
      
      inventory[variantIndex].quantity = newQuantity;
      
      transaction.update(productRef, {
        inventory: inventory,
        totalStock: firebase.firestore.FieldValue.increment(quantityChange),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    console.log('✓ Inventory updated:', productId);
    return { success: true };
    
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: error.message };
  }
}

// Check product availability
async function checkProductAvailability(productId, variantId, quantity) {
  try {
    const productDoc = await firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).doc(productId).get();
    
    if (!productDoc.exists) {
      return { available: false, error: 'Product not found' };
    }
    
    const product = productDoc.data();
    const inventory = product.inventory || [];
    const variant = inventory.find(v => v.variantId === variantId);
    
    if (!variant) {
      return { available: false, error: 'Variant not found' };
    }
    
    const available = variant.quantity >= quantity;
    
    return {
      available: available,
      currentStock: variant.quantity,
      requested: quantity
    };
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, error: error.message };
  }
}

// ── Reviews Management ────────────────────────────────────────────

// Add product review
async function addProductReview(productId, rating, comment) {
  try {
    const user = getCurrentFirebaseUser();
    if (!user) {
      throw new Error('User must be signed in to leave review');
    }
    
    const review = {
      productId: productId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      rating: rating,
      comment: comment,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await firebaseDB.collection(FIREBASE_COLLECTIONS.REVIEWS).add(review);
    
    // Update product average rating
    await updateProductRating(productId);
    
    console.log('✓ Review added:', docRef.id);
    return { success: true, reviewId: docRef.id };
    
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
}

// Get product reviews
async function getProductReviews(productId, limit = 10) {
  try {
    const snapshot = await firebaseDB.collection(FIREBASE_COLLECTIONS.REVIEWS)
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    
    return reviews;
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
}

// Update product average rating
async function updateProductRating(productId) {
  try {
    const snapshot = await firebaseDB.collection(FIREBASE_COLLECTIONS.REVIEWS)
      .where('productId', '==', productId)
      .get();
    
    if (snapshot.empty) {
      return;
    }
    
    let totalRating = 0;
    let count = 0;
    
    snapshot.forEach(doc => {
      totalRating += doc.data().rating;
      count++;
    });
    
    const averageRating = totalRating / count;
    
    await firebaseDB.collection(FIREBASE_COLLECTIONS.PRODUCTS).doc(productId).update({
      averageRating: averageRating,
      reviewCount: count,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

// ── Analytics ─────────────────────────────────────────────────────

// Log page view
function logPageView(pageName) {
  if (firebaseAnalytics) {
    firebaseAnalytics.logEvent('page_view', {
      page_name: pageName,
      page_location: window.location.href
    });
  }
}

// Log product view
function logProductView(productId, productName) {
  if (firebaseAnalytics) {
    firebaseAnalytics.logEvent('view_item', {
      item_id: productId,
      item_name: productName
    });
  }
}

// Log add to cart
function logAddToCart(product, quantity) {
  if (firebaseAnalytics) {
    firebaseAnalytics.logEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: quantity,
      currency: 'ZAR'
    });
  }
}

// ── Export functions ──────────────────────────────────────────────
window.loadProductsFromFirebase = loadProductsFromFirebase;
window.addProductToFirebase = addProductToFirebase;
window.updateProductInFirebase = updateProductInFirebase;
window.createOrderInFirebase = createOrderInFirebase;
window.getUserOrders = getUserOrders;
window.updateOrderStatus = updateOrderStatus;
window.updateInventory = updateInventory;
window.checkProductAvailability = checkProductAvailability;
window.addProductReview = addProductReview;
window.getProductReviews = getProductReviews;
window.logPageView = logPageView;
window.logProductView = logProductView;
window.logAddToCart = logAddToCart;

console.log('✓ Firebase database service loaded');