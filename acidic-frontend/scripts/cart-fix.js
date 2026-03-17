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

// ===== CART FIXES - Enhanced cart functionality =====

// Initialize cart fixes when DOM is ready
(function() {
  'use strict';
  
  console.log('Cart fixes loaded');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartFixes);
  } else {
    initCartFixes();
  }
  
  function initCartFixes() {
    console.log('Initializing cart fixes...');
    
    // Fix cart sidebar structure
    fixCartSidebarStructure();
    
    // Add clear cart button if it doesn't exist
    addClearCartButton();
    
    // Enhance remove item functionality
    enhanceRemoveItems();
    
    // Fix close button
    fixCloseButton();
    
    // Add cart overlay if missing
    ensureCartOverlay();
    
    // Re-bind all cart events
    rebindCartEvents();
    
    console.log('Cart fixes initialized successfully');
  }
  
  // Fix cart sidebar structure
  function fixCartSidebarStructure() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (!cartSidebar) {
      console.warn('Cart sidebar not found');
      return;
    }
    
    // Add 'open' class functionality
    const originalToggleCart = window.toggleCart;
    window.toggleCart = function(show = true) {
      const cartSidebar = document.getElementById('cart-sidebar');
      const cartOverlay = document.getElementById('cart-overlay');
      
      if (cartSidebar) {
        if (show) {
          cartSidebar.classList.add('open');
          cartSidebar.style.right = '0';
          if (cartOverlay) cartOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
          
          // Load cart items
          if (typeof loadCartItems === 'function') {
            loadCartItems();
          }
        } else {
          cartSidebar.classList.remove('open');
          cartSidebar.style.right = '-400px';
          if (cartOverlay) cartOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    };
  }
  
  // Add clear cart button to footer
  function addClearCartButton() {
    const cartFooter = document.querySelector('.cart-footer');
    if (!cartFooter) return;
    
    // Check if clear cart button already exists
    if (cartFooter.querySelector('.clear-cart-btn')) return;
    
    // Create clear cart button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-cart-btn';
    clearBtn.textContent = 'Clear Cart';
    clearBtn.onclick = clearCart;
    
    // Add button after continue shopping button
    const continueBtn = cartFooter.querySelector('.continue-shopping');
    if (continueBtn) {
      continueBtn.after(clearBtn);
    } else {
      cartFooter.appendChild(clearBtn);
    }
  }
  
  // Clear entire cart
  window.clearCart = function() {
    if (cart.length === 0) {
      showNotification('Cart is already empty', 'info');
      return;
    }
    
    if (confirm('Are you sure you want to clear your entire cart?')) {
      cart = [];
      saveCart();
      updateCartCount();
      loadCartItems();
      showNotification('Cart cleared successfully', 'success');
    }
  };
  
  // Enhance remove item with better UX
  function enhanceRemoveItems() {
    // Override confirmRemoveItem if it exists
    window.confirmRemoveItem = function(index) {
      if (index < 0 || index >= cart.length) return;
      
      const item = cart[index];
      const itemName = item.name;
      
      // Remove item
      cart.splice(index, 1);
      saveCart();
      updateCartCount();
      
      // Reload cart with animation
      loadCartItems();
      
      // Show success notification
      showNotification(`${itemName} removed from cart`, 'success');
    };
    
    // Quick remove without confirmation (for X button)
    window.quickRemoveItem = function(index) {
      if (index < 0 || index >= cart.length) return;
      
      cart.splice(index, 1);
      saveCart();
      updateCartCount();
      loadCartItems();
    };
  }
  
  // Fix close button functionality
  function fixCloseButton() {
    const closeBtn = document.querySelector('.close-cart');
    if (closeBtn) {
      // Remove any existing onclick
      closeBtn.onclick = null;
      
      // Add new click handler
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleCart(false);
      });
    }
  }
  
  // Ensure cart overlay exists
  function ensureCartOverlay() {
    if (document.getElementById('cart-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.className = 'cart-overlay';
    overlay.onclick = () => toggleCart(false);
    document.body.appendChild(overlay);
  }
  
  // Re-bind cart events
  function rebindCartEvents() {
    // Close cart with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar && cartSidebar.classList.contains('open')) {
          toggleCart(false);
        }
      }
    });
    
    // Click outside to close
    document.addEventListener('click', function(e) {
      const cartSidebar = document.getElementById('cart-sidebar');
      const cartOverlay = document.getElementById('cart-overlay');
      
      if (cartOverlay && cartOverlay.classList.contains('active') && e.target === cartOverlay) {
        toggleCart(false);
      }
    });
  }
  
  // Enhanced loadCartItems with better remove buttons
  const originalLoadCartItems = window.loadCartItems;
  if (originalLoadCartItems) {
    window.loadCartItems = function() {
      // Call original function
      originalLoadCartItems();
      
      // Enhance remove buttons
      setTimeout(() => {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach((btn, index) => {
          // Update onclick to use quickRemoveItem
          const itemIndex = btn.closest('.cart-item')?.getAttribute('data-item-index');
          if (itemIndex !== null) {
            btn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              quickRemoveItem(parseInt(itemIndex));
            };
          }
        });
      }, 100);
    };
  }
  
  // Utility: Show notification
  function showNotification(message, type = 'info') {
    // Use existing notification system if available
    if (typeof window.showNotification === 'function') {
      return window.showNotification(message, type);
    }
    
    // Fallback: simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 100000;
      animation: slideInRight 0.3s ease;
      font-size: 0.95rem;
      max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Add animation keyframes
  if (!document.getElementById('cart-fix-animations')) {
    const style = document.createElement('style');
    style.id = 'cart-fix-animations';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
})();

// Export for debugging
window.cartFixes = {
  version: '1.0.0',
  initialized: true
};

console.log('Cart fixes script loaded - v1.0.0');

// ===== CART COUNT FIX - Shows actual cart capacity =====

(function() {
  'use strict';
  
  console.log('Cart count fix loaded');
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartCountFix);
  } else {
    initCartCountFix();
  }
  
  function initCartCountFix() {
    console.log('Initializing cart count fix...');
    
    // Override updateCartCount to update all badges
    enhanceUpdateCartCount();
    
    // Add item count to cart header
    addCartHeaderCount();
    
    // Fix duplicate cart-count IDs
    fixDuplicateIDs();
    
    // Initial update
    setTimeout(() => {
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
    }, 100);
    
    console.log('Cart count fix initialized');
  }
  
  // Enhanced updateCartCount function
  function enhanceUpdateCartCount() {
    const originalUpdateCartCount = window.updateCartCount;
    
    window.updateCartCount = function() {
      // Get cart from localStorage
      const storedCart = localStorage.getItem('acidicCart');
      const cart = storedCart ? JSON.parse(storedCart) : [];
      
      // Calculate total items (sum of quantities)
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      console.log(`Cart count: ${totalItems} items in cart`);
      
      // Update ALL cart count badges
      const cartCountElements = [
        document.getElementById('cart-count'),
        document.getElementById('cart-count-2'),
        ...document.querySelectorAll('.cart-count')
      ];
      
      cartCountElements.forEach(element => {
        if (element) {
          element.textContent = totalItems;
          element.style.display = totalItems > 0 ? 'flex' : 'none';
          
          // Add visual feedback when count changes
          if (totalItems > 0) {
            element.classList.add('cart-count-active');
          } else {
            element.classList.remove('cart-count-active');
          }
        }
      });
      
      // Update cart header title
      updateCartHeaderTitle(totalItems);
      
      // Update mobile cart count if exists
      const mobileCartCount = document.querySelector('.mobile-cart-count');
      if (mobileCartCount) {
        mobileCartCount.textContent = totalItems;
        mobileCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
      }
      
      // Call original function if it exists
      if (originalUpdateCartCount && typeof originalUpdateCartCount === 'function') {
        try {
          originalUpdateCartCount();
        } catch (e) {
          console.warn('Original updateCartCount had an error:', e);
        }
      }
    };
  }
  
  // Add item count to cart header
  function updateCartHeaderTitle(count) {
    const cartHeader = document.querySelector('.cart-header h3');
    if (cartHeader) {
      if (count > 0) {
        cartHeader.innerHTML = `Your Cart <span class="cart-header-count">(${count})</span>`;
      } else {
        cartHeader.textContent = 'Your Cart';
      }
    }
  }
  
  // Add permanent count display to cart header
  function addCartHeaderCount() {
    const cartHeader = document.querySelector('.cart-header h3');
    if (cartHeader && !cartHeader.querySelector('.cart-header-count')) {
      const storedCart = localStorage.getItem('acidicCart');
      const cart = storedCart ? JSON.parse(storedCart) : [];
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      if (count > 0) {
        cartHeader.innerHTML = `Your Cart <span class="cart-header-count">(${count})</span>`;
      }
    }
  }
  
  // Fix duplicate cart-count IDs
  function fixDuplicateIDs() {
    const cartCounts = document.querySelectorAll('#cart-count');
    if (cartCounts.length > 1) {
      console.warn('Found duplicate cart-count IDs, fixing...');
      cartCounts.forEach((element, index) => {
        if (index > 0) {
          element.id = `cart-count-${index + 1}`;
          element.classList.add('cart-count');
        }
      });
    }
  }
  
  // Watch for cart changes and update count
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'acidicCart' && typeof updateCartCount === 'function') {
      setTimeout(() => updateCartCount(), 10);
    }
  };
  
  // Add CSS for cart header count
  if (!document.getElementById('cart-count-fix-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-count-fix-styles';
    style.textContent = `
      /* Cart header count styling */
      .cart-header-count {
        color: #f4b400;
        font-weight: 700;
        margin-left: 0.5rem;
        font-size: 0.9em;
      }
      
      /* Cart count badge active state */
      .cart-count-active {
        animation: cart-badge-pulse 0.3s ease;
      }
      
      @keyframes cart-badge-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      /* Cart count badge styling */
      .cart-count {
        background: #f4b400;
        color: #000;
        border-radius: 50%;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0 0.3rem;
      }
    `;
    document.head.appendChild(style);
  }
  
})();

// Also enhance loadCartItems to show count
(function() {
  const originalLoadCartItems = window.loadCartItems;
  
  if (originalLoadCartItems) {
    window.loadCartItems = function() {
      originalLoadCartItems.apply(this, arguments);
      
      // Update count after loading
      setTimeout(() => {
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
      }, 50);
    };
  }
})();

// Debug helper
window.checkCart = function() {
  const storedCart = localStorage.getItem('acidicCart');
  const cart = storedCart ? JSON.parse(storedCart) : [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  console.log('=== CART DEBUG ===');
  console.log('Items in cart:', cart.length);
  console.log('Total quantity:', count);
  console.log('Cart contents:', cart);
  console.log('================');
  
  return { items: cart.length, total: count, cart };
};

console.log('Cart count fix loaded - Type checkCart() in console to debug');

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

// ===== DIRECT FIX FOR REMOVE ITEM ISSUE =====
// Add this script AFTER all other cart scripts

console.log('🔧 Direct Remove Item Fix Loading...');

// Wait for page to fully load
window.addEventListener('load', function() {
  console.log('Applying direct remove fix...');
  
  // Override removeFromCart with working version
  window.removeFromCart = function(index) {
    console.log('🗑️ removeFromCart called with index:', index);
    
    try {
      // Get cart directly from localStorage - FRESH DATA
      let currentCart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
      
      console.log('Current cart length:', currentCart.length);
      console.log('Removing index:', index);
      
      // Validate index
      if (index < 0 || index >= currentCart.length) {
        console.error('❌ Invalid index:', index, 'Cart length:', currentCart.length);
        alert('Error: Invalid item index');
        return;
      }
      
      // Get item name before removing
      const removedItem = currentCart[index];
      console.log('Removing item:', removedItem.name);
      
      // Remove the item
      currentCart.splice(index, 1);
      
      console.log('Cart after removal:', currentCart.length, 'items');
      
      // Save to localStorage
      localStorage.setItem('acidicCart', JSON.stringify(currentCart));
      
      // Update global cart variable
      window.cart = currentCart;
      
      console.log('✅ Item removed and saved');
      
      // Update cart count
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
      
      // Reload cart display
      if (typeof loadCartItems === 'function') {
        loadCartItems();
      }
      
      // Show success message
      console.log('✅ Cart updated successfully');
      
    } catch (error) {
      console.error('❌ Error in removeFromCart:', error);
      alert('Error removing item. Please refresh and try again.');
    }
  };
  
  // Override confirmRemoveItem  
  window.confirmRemoveItem = function(index) {
    console.log('❓ confirmRemoveItem called with index:', index);
    
    try {
      // Get cart
      let currentCart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
      
      if (index < 0 || index >= currentCart.length) {
        console.error('Invalid index:', index);
        return;
      }
      
      const item = currentCart[index];
      const itemName = item.name;
      
      // Simple confirm dialog
      if (confirm(`Remove "${itemName}" from cart?`)) {
        console.log('Confirmed - removing item');
        removeFromCart(index);
      } else {
        console.log('Removal cancelled');
      }
      
    } catch (error) {
      console.error('❌ Error in confirmRemoveItem:', error);
    }
  };
  
  // Override clearCart
  window.clearCart = function() {
    console.log('🗑️ clearCart called');
    
    try {
      let currentCart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
      
      if (currentCart.length === 0) {
        alert('Cart is already empty!');
        return;
      }
      
      if (confirm(`Remove all ${currentCart.length} items from cart?`)) {
        // Clear cart
        localStorage.setItem('acidicCart', '[]');
        window.cart = [];
        
        console.log('✅ Cart cleared');
        
        // Update UI
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
        
        if (typeof loadCartItems === 'function') {
          loadCartItems();
        }
        
        alert('Cart cleared successfully!');
      }
      
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      alert('Error clearing cart. Please try again.');
    }
  };
  
  console.log('✅ Direct remove fix applied');
  console.log('Functions overridden:');
  console.log('- removeFromCart');
  console.log('- confirmRemoveItem');
  console.log('- clearCart');
});

// Also fix when DOM is ready (backup)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    
    // Force re-bind all remove buttons
    function rebindRemoveButtons() {
      console.log('🔧 Re-binding remove buttons...');
      
      const removeButtons = document.querySelectorAll('.remove-item');
      console.log('Found', removeButtons.length, 'remove buttons');
      
      removeButtons.forEach((button, idx) => {
        const cartItem = button.closest('.cart-item');
        if (cartItem) {
          const itemIndex = cartItem.getAttribute('data-item-index');
          
          if (itemIndex !== null && itemIndex !== undefined) {
            // Remove old handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              const index = parseInt(itemIndex);
              console.log('Remove button clicked for index:', index);
              
              if (typeof confirmRemoveItem === 'function') {
                confirmRemoveItem(index);
              } else if (typeof removeFromCart === 'function') {
                removeFromCart(index);
              }
            });
            
            console.log('✓ Fixed button', idx, 'for item index', itemIndex);
          }
        }
      });
    }
    
    // Bind buttons now
    rebindRemoveButtons();
    
    // Also bind when cart opens
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
      const observer = new MutationObserver(function() {
        rebindRemoveButtons();
      });
      
      observer.observe(cartSidebar, {
        childList: true,
        subtree: true
      });
    }
    
    // Bind when loadCartItems is called
    const originalLoadCartItems = window.loadCartItems;
    if (originalLoadCartItems) {
      window.loadCartItems = function() {
        console.log('loadCartItems called');
        
        // Call original
        originalLoadCartItems.apply(this, arguments);
        
        // Re-bind buttons after a short delay
        setTimeout(rebindRemoveButtons, 100);
      };
    }
    
  }, 500);
});

// Debug helper
window.testRemove = function(index) {
  console.log('=== TEST REMOVE ===');
  console.log('Index:', index);
  
  const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
  console.log('Cart before:', cart);
  
  if (index >= 0 && index < cart.length) {
    const item = cart[index];
    console.log('Will remove:', item.name);
    
    removeFromCart(index);
    
    setTimeout(() => {
      const newCart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
      console.log('Cart after:', newCart);
      console.log('Success:', cart.length - 1 === newCart.length);
    }, 500);
  } else {
    console.error('Invalid index');
  }
};

console.log('🎉 Direct Remove Fix Loaded!');
console.log('💡 Use testRemove(0) to test removing first item');
console.log('✅ Cart System Fix Loaded');
console.log('   Available functions:', Object.keys(window.cartFunctions).join(', '));
console.log('   Current cart:', window.cart.length, 'items');
console.log('   Cart total:', window.calculateCartTotal());