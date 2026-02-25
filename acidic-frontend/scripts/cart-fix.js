// ================================================================
//  COMPLETE CART SYSTEM FIX
//  This file should be loaded AFTER cart.js to fix all issues
// ================================================================

console.log('🛒 Loading Cart System Fix...');

// ── Fix 1: Initialize cart properly ──────────────────────────────
if (typeof window.cart === 'undefined') {
  window.cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
  console.log('✓ Cart initialized:', window.cart.length, 'items');
}

// ── Fix 2: Ensure saveCart function works ───────────────────────
window.saveCart = function() {
  try {
    localStorage.setItem('acidicCart', JSON.stringify(window.cart));
    console.log('✓ Cart saved:', window.cart.length, 'items');
    
    // Update count immediately after saving
    if (typeof window.updateCartCount === 'function') {
      window.updateCartCount();
    }
  } catch (error) {
    console.error('❌ Error saving cart:', error);
  }
};

// ── Fix 3: Fix updateCartCount to handle duplicate IDs ──────────
window.updateCartCount = function() {
  try {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update ALL elements with cart-count class or id
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-count, [id*="cart-count"]');
    
    cartCountElements.forEach(element => {
      if (element) {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
      }
    });
    
    console.log('✓ Cart count updated:', totalItems, 'items in', cartCountElements.length, 'badges');
    
    // Also update any cart-item-count elements
    const itemCountElements = document.querySelectorAll('.cart-item-count');
    itemCountElements.forEach(el => {
      el.textContent = totalItems;
    });
    
  } catch (error) {
    console.error('❌ Error updating cart count:', error);
  }
};

// ── Fix 4: Enhanced addToCart function ──────────────────────────
window.addToCart = function(product, size = 'Medium', customization = null) {
  console.log('🛒 Adding to cart:', product.name);
  
  try {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.size === size &&
      JSON.stringify(item.customization) === JSON.stringify(customization)
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      console.log('✓ Updated quantity for:', product.name);
    } else {
      // Add new item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.img || (product.images && product.images[0]) || '',
        size: size,
        customization: customization,
        quantity: 1,
        addedAt: new Date().toISOString()
      };
      cart.push(cartItem);
      console.log('✓ Added new item:', product.name);
    }
    
    // Save cart
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    window.cart = cart;
    
    // Update count
    window.updateCartCount();
    
    // Show notification
    if (typeof showNotification === 'function') {
      showNotification(`${product.name} added to cart!`, 'success');
    } else {
      console.log('✅ Added to cart:', product.name);
    }
    
    // Show animation
    if (typeof showAddToCartAnimation === 'function') {
      showAddToCartAnimation();
    }
    
    // Open cart sidebar
    setTimeout(() => {
      if (typeof toggleCart === 'function') {
        toggleCart(true);
      } else if (typeof openCartModal === 'function') {
        openCartModal();
      }
    }, 300);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    alert('Error adding item to cart. Please try again.');
    return false;
  }
};

// ── Fix 5: Enhanced removeFromCart function ─────────────────────
window.removeFromCart = function(index) {
  try {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    if (index >= 0 && index < cart.length) {
      const removedItem = cart[index];
      cart.splice(index, 1);
      
      localStorage.setItem('acidicCart', JSON.stringify(cart));
      window.cart = cart;
      
      console.log('✓ Removed from cart:', removedItem.name);
      
      // Update count
      window.updateCartCount();
      
      // Reload cart display
      if (typeof loadCartItems === 'function') {
        loadCartItems();
      }
      
      if (typeof showNotification === 'function') {
        showNotification('Item removed from cart', 'info');
      }
    }
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
  }
};

// ── Fix 6: Update item quantity ─────────────────────────────────
window.updateCartQuantity = function(index, newQuantity) {
  try {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    if (index >= 0 && index < cart.length) {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0
        window.removeFromCart(index);
      } else {
        cart[index].quantity = newQuantity;
        
        localStorage.setItem('acidicCart', JSON.stringify(cart));
        window.cart = cart;
        
        console.log('✓ Updated quantity for:', cart[index].name, 'to', newQuantity);
        
        // Update count
        window.updateCartCount();
        
        // Reload cart display
        if (typeof loadCartItems === 'function') {
          loadCartItems();
        }
      }
    }
  } catch (error) {
    console.error('❌ Error updating quantity:', error);
  }
};

// ── Fix 7: Calculate cart total ─────────────────────────────────
window.calculateCartTotal = function() {
  try {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      subtotal: subtotal,
      delivery: 150,
      total: subtotal + 150,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  } catch (error) {
    console.error('❌ Error calculating total:', error);
    return { subtotal: 0, delivery: 150, total: 150, itemCount: 0 };
  }
};

// ── Fix 8: Clear cart ───────────────────────────────────────────
window.clearCart = function() {
  try {
    localStorage.setItem('acidicCart', JSON.stringify([]));
    window.cart = [];
    
    console.log('✓ Cart cleared');
    
    // Update count
    window.updateCartCount();
    
    // Reload cart display
    if (typeof loadCartItems === 'function') {
      loadCartItems();
    }
    
    if (typeof showNotification === 'function') {
      showNotification('Cart cleared', 'info');
    }
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
  }
};

// ── Fix 9: Enhanced toggleCart ──────────────────────────────────
window.toggleCart = function(show = true) {
  console.log('🛒 Toggle cart:', show ? 'open' : 'close');
  
  const cartSidebar = document.getElementById('cart-sidebar');
  
  if (!cartSidebar) {
    console.warn('⚠️ Cart sidebar not found in HTML');
    
    // Try to open modal instead
    if (typeof openCartModal === 'function') {
      openCartModal();
    } else {
      alert('Cart sidebar not found. Please refresh the page.');
    }
    return;
  }
  
  // Get or create overlay
  let cartOverlay = document.getElementById('cart-overlay');
  
  if (!cartOverlay) {
    cartOverlay = document.createElement('div');
    cartOverlay.id = 'cart-overlay';
    cartOverlay.className = 'cart-overlay';
    cartOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      display: none;
    `;
    cartOverlay.onclick = function() { window.toggleCart(false); };
    document.body.appendChild(cartOverlay);
  }
  
  if (show) {
    // Open cart
    cartSidebar.style.right = '0';
    cartSidebar.style.display = 'block';
    cartOverlay.style.display = 'block';
    setTimeout(() => cartOverlay.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
    
    // Load cart items
    if (typeof loadCartItems === 'function') {
      loadCartItems();
    }
    
    console.log('✓ Cart opened');
  } else {
    // Close cart
    cartSidebar.style.right = '-400px';
    cartOverlay.classList.remove('active');
    setTimeout(() => cartOverlay.style.display = 'none', 300);
    document.body.style.overflow = '';
    
    console.log('✓ Cart closed');
  }
};

// ── Fix 10: Initialize on page load ─────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  console.log('🛒 Initializing cart system...');
  
  // Load cart from localStorage
  window.cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
  console.log('✓ Cart loaded:', window.cart.length, 'items');
  
  // Update cart count immediately
  window.updateCartCount();
  
  // Set up cart icon click handlers
  const cartIcons = document.querySelectorAll('.cart-icon, .shopping-cart, [onclick*="toggleCart"], [onclick*="openCart"]');
  
  cartIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleCart(true);
    });
  });
  
  console.log('✓ Cart click handlers attached to', cartIcons.length, 'elements');
  
  // Check cart sidebar exists
  const cartSidebar = document.getElementById('cart-sidebar');
  console.log('Cart sidebar:', cartSidebar ? '✓ Found' : '❌ Missing');
  
  // Check cart count badges
  const badges = document.querySelectorAll('.cart-count, #cart-count');
  console.log('Cart count badges:', badges.length, 'found');
  
  console.log('✅ Cart system initialized');
});

// ── Fix 11: Add to cart button handler ──────────────────────────
document.addEventListener('click', function(e) {
  const addToCartBtn = e.target.closest('.add-to-cart, [class*="add-to-cart"], button[onclick*="addToCart"]');
  
  if (addToCartBtn && !addToCartBtn.getAttribute('data-cart-handled')) {
    // Mark as handled to prevent duplicate processing
    addToCartBtn.setAttribute('data-cart-handled', 'true');
    
    console.log('🛒 Add to cart button clicked');
  }
});

// ── Fix 12: Expose all functions globally ───────────────────────
window.cartFunctions = {
  addToCart: window.addToCart,
  removeFromCart: window.removeFromCart,
  updateCartQuantity: window.updateCartQuantity,
  updateCartCount: window.updateCartCount,
  calculateCartTotal: window.calculateCartTotal,
  clearCart: window.clearCart,
  toggleCart: window.toggleCart,
  saveCart: window.saveCart
};

console.log('✅ Cart System Fix Loaded');
console.log('   Available functions:', Object.keys(window.cartFunctions).join(', '));
console.log('   Current cart:', window.cart.length, 'items');
console.log('   Cart total:', window.calculateCartTotal());