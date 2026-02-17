// ============================================================
//  ACIDIC CART — clean single-source-of-truth implementation
// ============================================================

// ── State ────────────────────────────────────────────────────
let cart = [];

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Load from localStorage (support legacy 'cart' key too)
  const saved = localStorage.getItem('acidicCart') || localStorage.getItem('cart');
  if (saved) {
    try {
      cart = JSON.parse(saved) || [];
      // Migrate old key
      localStorage.removeItem('cart');
      saveCart();
    } catch (e) {
      cart = [];
    }
  }

  updateCartCount();
  ensureCartOverlay();
});

// ── Persistence ──────────────────────────────────────────────
function saveCart() {
  localStorage.setItem('acidicCart', JSON.stringify(cart));
}

// ── Overlay helper ───────────────────────────────────────────
function ensureCartOverlay() {
  if (!document.getElementById('cart-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.className = 'cart-overlay';
    overlay.addEventListener('click', () => toggleCart(false));
    document.body.appendChild(overlay);
  }
}

// ── Sidebar toggle ───────────────────────────────────────────
function toggleCart(show = true) {
  ensureCartOverlay();

  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');

  if (!sidebar) {
    console.error('cart-sidebar element not found in DOM');
    return;
  }

  if (show) {
    loadCartItems();
    sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Called from nav menu
function triggerCart() {
  toggleCart(true);
}

// Escape key closes sidebar
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
      toggleCart(false);
    }
  }
});

// ── Cart count badge ─────────────────────────────────────────
function updateCartCount() {
  // Delegate to main.js's function if available (it reads from localStorage so always accurate)
  if (typeof updateMenuCartCount === 'function') {
    updateMenuCartCount();
    return;
  }

  // Fallback if main.js not loaded yet
  var badge = document.getElementById('cart-count');
  if (!badge) return;
  var total = cart.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
  if (total > 0) {
    badge.textContent = total;
    badge.style.setProperty('display', 'flex', 'important');
    badge.style.setProperty('opacity', '1', 'important');
    badge.style.setProperty('visibility', 'visible', 'important');
  } else {
    badge.textContent = '';
    badge.style.setProperty('display', 'none', 'important');
  }
}

// ── Add to cart ──────────────────────────────────────────────
function addToCart(product, size, customization) {
  size = size || 'Medium';
  customization = customization || null;

  const idx = cart.findIndex(item =>
    item.id === product.id &&
    item.size === size &&
    JSON.stringify(item.customization) === JSON.stringify(customization)
  );

  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || '',
      size: size,
      customization: customization,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
  }

  saveCart();
  updateCartCount();
  showAddToCartAnimation();
  setTimeout(function() { toggleCart(true); }, 300);
}

// Add with color + size tracking (used by product detail pages)
function addToCartWithDetails(product, color, size, quantity) {
  quantity = quantity || 1;

  const idx = cart.findIndex(item =>
    item.id === product.id &&
    item.size === size &&
    item.color === color
  );

  if (idx > -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: (product.images && product.images[0]) || product.image || '',
      size: size || 'Medium',
      color: color || 'Black',
      quantity: quantity,
      category: product.category || '',
      variantId: product.id + '-' + (color || 'default') + '-' + (size || 'M'),
      sku: product.sku || ('ACID-' + Date.now().toString().slice(-6)),
      isCustomized: !!product.customization,
      customization: product.customization || null,
      addedAt: new Date().toISOString()
    });
  }

  saveCart();
  updateCartCount();
  showAddToCartAnimation(product.name, color, size);
  return cart.length - 1;
}

// ── Render sidebar items ─────────────────────────────────────
function loadCartItems() {
  var container = document.getElementById('cart-items');
  var totalEl   = document.getElementById('cart-total');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="empty-cart">' +
        '<p>Your cart is empty</p>' +
        '<button class="continue-shopping" onclick="toggleCart(false)">Continue Shopping</button>' +
      '</div>';
    if (totalEl) totalEl.textContent = 'R0';
    return;
  }

  var total = 0;
  container.innerHTML = '';

  var colorHex = {
    Black:'#000000', White:'#ffffff', Red:'#ff0000', Blue:'#0000ff',
    Lime:'#00ff00', Cyan:'#00ffff', Cream:'#fffdd0', Green:'#008000',
    Brown:'#964b00', Pink:'#ffc0cb', Grey:'#808080', Navy:'#001f5b'
  };

  cart.forEach(function(item, index) {
    total += item.price * item.quantity;

    var hex = item.color ? (colorHex[item.color] || '#cccccc') : null;
    var needsBorder = item.color === 'White' || item.color === 'Cream';

    var colorHTML = hex
      ? '<div class="cart-item-color"><span>Color:</span><div class="color-display">' +
        '<div class="color-dot" style="background:' + hex + ';' + (needsBorder ? 'border:1px solid #ccc' : '') + '"></div>' +
        '<span class="color-name">' + item.color + '</span></div></div>'
      : '';

    var sizeHTML = item.size
      ? '<div class="cart-item-size"><span>Size:</span><span class="size-value">' + item.size + '</span></div>'
      : '';

    var badges =
      (item.isCustomized ? '<span class="custom-badge">Custom</span>' : '') +
      (item.bundle       ? '<span class="bundle-badge">Bundle</span>' : '');

    var el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset.index = index;
    el.innerHTML =
      '<div class="cart-item-image">' +
        '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==\'">' +
        (item.quantity > 1 ? '<span class="quantity-badge">' + item.quantity + '</span>' : '') +
      '</div>' +
      '<div class="cart-item-details">' +
        '<h4 class="cart-item-name">' + item.name + ' ' + badges + '</h4>' +
        '<p class="cart-item-price">R' + item.price.toFixed(2) + ' each</p>' +
        '<p class="cart-item-total">R' + (item.price * item.quantity).toFixed(2) + ' total</p>' +
        '<div class="cart-item-variants">' + sizeHTML + colorHTML + '</div>' +
        '<div class="cart-item-actions">' +
          '<div class="quantity-controls">' +
            '<button class="quantity-btn" onclick="updateQuantity(' + index + ', -1)"' + (item.quantity <= 1 ? ' disabled' : '') + '>−</button>' +
            '<span class="quantity-display">' + item.quantity + '</span>' +
            '<button class="quantity-btn" onclick="updateQuantity(' + index + ', 1)">+</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="remove-item" onclick="confirmRemoveItem(' + index + ')" title="Remove">×</button>';

    container.appendChild(el);
  });

  if (totalEl) totalEl.textContent = 'R' + total.toFixed(2);
}

// ── Quantity update ──────────────────────────────────────────
function updateQuantity(index, change) {
  if (index < 0 || index >= cart.length) return;

  var newQty = cart[index].quantity + change;
  if (newQty <= 0) { confirmRemoveItem(index); return; }
  if (newQty > 99) return;

  cart[index].quantity = newQty;
  saveCart();
  updateCartCount();
  loadCartItems();
}

// ── Remove item ──────────────────────────────────────────────
function confirmRemoveItem(index) {
  if (index < 0 || index >= cart.length) return;

  var name = cart[index].name;
  var modal = document.createElement('div');
  modal.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:rgba(0,0,0,0.7);display:flex;align-items:center;' +
    'justify-content:center;z-index:10001;';
  modal.innerHTML =
    '<div style="background:#fff;border-radius:10px;padding:30px;max-width:380px;width:90%;text-align:center;">' +
      '<h3 style="margin:0 0 12px">Remove Item</h3>' +
      '<p style="color:#555;margin-bottom:20px">Remove <strong>' + name + '</strong> from your cart?</p>' +
      '<div style="display:flex;gap:10px;">' +
        '<button onclick="this.closest(\'div[style]\').remove()" ' +
          'style="flex:1;padding:12px;background:#eee;border:none;border-radius:5px;cursor:pointer;">Cancel</button>' +
        '<button onclick="removeFromCart(' + index + ');this.closest(\'div[style]\').remove()" ' +
          'style="flex:1;padding:12px;background:#ff4444;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Remove</button>' +
      '</div>' +
    '</div>';
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  loadCartItems();
}

// ── Clear cart ────────────────────────────────────────────────
function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  loadCartItems();
}

// ── Checkout ─────────────────────────────────────────────────
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty. Add some items before checking out.');
    return;
  }
  toggleCart(false);
  openCheckout();
}

// ── Modal controls ───────────────────────────────────────────
function updateCheckoutModal() {
  var total = getCartTotal();

  var finalTotalEl   = document.getElementById('final-total');
  var paymentTotalEl = document.getElementById('payment-total');
  var paymentAmtEl   = document.getElementById('payment-amount');

  if (finalTotalEl)   finalTotalEl.textContent   = 'R' + total.toFixed(2);
  if (paymentTotalEl) paymentTotalEl.textContent = 'R' + total.toFixed(2);
  if (paymentAmtEl)   paymentAmtEl.textContent   = 'R' + total.toFixed(2);

  // Fill order items in payment modal
  var paymentOrderItems = document.getElementById('payment-order-items');
  if (paymentOrderItems) {
    paymentOrderItems.innerHTML = '';
    cart.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'order-item';
      el.innerHTML = '<span>' + item.name + ' x' + item.quantity + '</span><span>R' + (item.price * item.quantity).toFixed(2) + '</span>';
      paymentOrderItems.appendChild(el);
    });
    var delivery = document.createElement('div');
    delivery.className = 'order-item';
    delivery.innerHTML = '<span>Delivery Fee</span><span>R150.00</span>';
    paymentOrderItems.appendChild(delivery);
  }

  // Fill order items in confirmation modal
  var confirmItems = document.getElementById('confirmation-order-items');
  if (confirmItems) {
    confirmItems.innerHTML = '';
    cart.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'order-item';
      el.innerHTML = '<span>' + item.name + ' x' + item.quantity + '</span><span>R' + (item.price * item.quantity).toFixed(2) + '</span>';
      confirmItems.appendChild(el);
    });
    var delivery2 = document.createElement('div');
    delivery2.className = 'order-item';
    delivery2.innerHTML = '<span>Delivery Fee</span><span>R150.00</span>';
    confirmItems.appendChild(delivery2);
  }

  var confirmTotalEl = document.getElementById('confirmation-total');
  if (confirmTotalEl) confirmTotalEl.textContent = 'R' + total.toFixed(2);
}

function openCheckout() {
  updateCheckoutModal();
  var modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'block';
}

function closeCheckout() {
  var modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'none';
}

function openPayment() {
  var modal = document.getElementById('payment-modal');
  if (modal) modal.style.display = 'block';
}

function closePayment() {
  var modal = document.getElementById('payment-modal');
  if (modal) modal.style.display = 'none';
}

function openConfirmation() {
  var modal = document.getElementById('confirmation-modal');
  if (modal) modal.style.display = 'block';
}

function closeConfirmation() {
  var modal = document.getElementById('confirmation-modal');
  if (modal) modal.style.display = 'none';
  // Clear cart after successful purchase
  cart = [];
  saveCart();
  updateCartCount();
  loadCartItems();
}

function getCartTotal() {
  return cart.reduce(function(t, item) { return t + item.price * item.quantity; }, 0) + 150;
}

window.getCartData = function () {
  return {
    items: cart,
    total: getCartTotal(),
    itemCount: cart.reduce(function(s, item) { return s + item.quantity; }, 0)
  };
};

// ── Toast notifications ──────────────────────────────────────
function showAddToCartAnimation(name, color, size) {
  var msg = name
    ? ('✓ ' + name + (size ? ' (' + size + ')' : '') + ' added')
    : '✓ Added to Cart';
  showNotification(msg, 'success', 2400);
}

function showNotification(message, type, duration) {
  type     = type     || 'info';
  duration = duration || 2500;

  var colors = { success:'#222', error:'#e53935', info:'#1565c0', warning:'#f57c00' };
  var toast = document.createElement('div');
  toast.style.cssText =
    'position:fixed;top:80px;right:20px;' +
    'background:' + (colors[type] || '#222') + ';color:#fff;' +
    'padding:12px 18px;border-radius:8px;' +
    'z-index:10000;font-weight:bold;font-size:14px;' +
    'box-shadow:0 4px 12px rgba(0,0,0,0.3);' +
    'pointer-events:none;transition:opacity 0.3s;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ── Colour picker helper ──────────────────────────────────────
function selectColor(element, colorCode, colorName) {
  document.querySelectorAll('.color-option').forEach(function(o) { o.classList.remove('active'); });
  element.classList.add('active');

  var infoEl = document.getElementById('selected-color-info');
  var nameEl = document.getElementById('selected-color-name');
  if (infoEl) infoEl.style.display = 'block';
  if (nameEl) { nameEl.textContent = colorName; nameEl.style.color = colorCode; }
}

// ── Add customised item ───────────────────────────────────────
function addCustomizationToCart() {
  var nameEl  = document.getElementById('modal-name');
  var priceEl = document.getElementById('modal-price');
  var imgEl   = document.getElementById('modal-img');

  if (!nameEl || !priceEl) { alert('Product info not found'); return; }

  var colorEl = document.querySelector('.color-option.active');
  if (!colorEl) { alert('Please select a colour first'); return; }

  var color     = colorEl.getAttribute('data-color') || '#000';
  var colorName = colorEl.getAttribute('data-name')  || 'Custom';
  var size      = document.getElementById('size') ? document.getElementById('size').value : 'Medium';
  var price     = parseFloat(priceEl.textContent.replace('R','').replace(',','')) + 50;

  var product = {
    id:    nameEl.textContent.toLowerCase().replace(/\s+/g,'-') + '-custom',
    name:  nameEl.textContent + ' (Custom)',
    price: price,
    image: imgEl ? imgEl.src : '',
    customization: { color: color, colorName: colorName, custom: true }
  };

  addToCart(product, size, product.customization);
  if (typeof closeCustomize === 'function') closeCustomize();
}

// ── Add from product detail modal ────────────────────────────
function addSelectedToCart() {
  var nameEl  = document.getElementById('modal-name');
  var priceEl = document.getElementById('modal-price');
  var imgEl   = document.getElementById('modal-img');
  var sizeEl  = document.getElementById('size');

  if (!nameEl || !priceEl) return;

  var product = {
    id:    nameEl.textContent.toLowerCase().replace(/\s+/g,'-'),
    name:  nameEl.textContent,
    price: parseFloat(priceEl.textContent.replace('R','')),
    image: imgEl ? imgEl.src : ''
  };
  addToCart(product, sizeEl ? sizeEl.value : 'Medium');
  if (typeof closeModal === 'function') closeModal();
}

// ── Quick-add from product cards ─────────────────────────────
function processQuickAdd(productId) {
  if (typeof productData === 'undefined') return;
  var product = productData.allproducts.find(function(p) { return p.id === productId; });
  if (!product) { showNotification('Product not found', 'error'); return; }

  var qtyEl    = document.getElementById('quick-add-qty');
  var quantity = qtyEl ? (parseInt(qtyEl.value) || 1) : 1;

  var color = (window.selectedVariant && window.selectedVariant.color) || 'Black';
  var size  = (window.selectedVariant && window.selectedVariant.size)  || 'M';

  addToCartWithDetails(product, color, size, quantity);
  if (typeof closeQuickAddModal === 'function') closeQuickAddModal();
  showNotification(quantity + '× ' + product.name + ' (' + color + ', ' + size + ') added!', 'success');
}

// ── Outfit bundle ─────────────────────────────────────────────
function addOutfitToCart() {
  var layers = ['top-layer','bottom-layer','accessory-layer'];
  var items  = [];

  layers.forEach(function(id) {
    var layer = document.getElementById(id);
    if (!layer) return;
    var el = layer.querySelector('.outfit-product-item');
    if (el && !el.querySelector('p')) {
      items.push({
        id:    el.getAttribute('data-id'),
        name:  el.getAttribute('data-name'),
        price: parseFloat(el.getAttribute('data-price')),
        image: el.getAttribute('data-image'),
        size:  id === 'accessory-layer' ? 'One Size' : 'Medium'
      });
    }
  });

  if (items.length === 0) { alert('Please add at least one item to your outfit'); return; }

  var subtotal = items.reduce(function(t,i) { return t+i.price; }, 0);
  cart.push({
    id:       'outfit-bundle-' + Date.now(),
    name:     'Complete Outfit Bundle',
    price:    subtotal * 0.9,
    image:    items[0].image,
    size:     'Bundle',
    quantity: 1,
    bundle:   true,
    items:    items,
    addedAt:  new Date().toISOString()
  });

  saveCart();
  updateCartCount();
  alert('Outfit bundle added! You saved R' + (subtotal * 0.1).toFixed(2));
  toggleCart(true);
}

// ── Order confirmation helper ─────────────────────────────────
function updateConfirmationWithOrderDetails(order) {
  var itemsEl = document.getElementById('confirmation-order-items');
  var totalEl = document.getElementById('confirmation-total');
  var trackEl = document.getElementById('tracking-number');

  if (itemsEl && order.variantDetails) {
    itemsEl.innerHTML = order.variantDetails.map(function(item) {
      return '<div class="confirmation-order-item">' +
        '<div class="item-details"><div class="item-name">' + item.product + '</div>' +
        '<div class="item-variants">' +
          (item.color ? '<span>Color: ' + item.color + '</span>' : '') +
          (item.size  ? '<span>Size: '  + item.size  + '</span>' : '') +
          (item.isCustomized ? '<span class="custom-tag">Custom</span>' : '') +
        '</div></div>' +
        '<div class="item-quantity-price"><span>×' + item.quantity + '</span>' +
        '<span>R' + (item.price * item.quantity).toFixed(2) + '</span></div>' +
      '</div>';
    }).join('');
  }

  if (totalEl && order.total) totalEl.textContent = 'R' + order.total.toFixed(2);
  if (trackEl && order.orderId) trackEl.textContent = order.orderId;
}

// ── Helper ───────────────────────────────────────────────────
function formatCategory(cat) {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

// ── Checkout form validation (called from HTML button) ────────
function validateCheckoutForm() {
  var required = ['country','fname','lname','address','city','province','postal','phone','email'];
  var valid = true;

  required.forEach(function(id) {
    var el  = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (el && !el.value.trim()) {
      if (el) el.style.borderColor = 'red';
      if (err) err.style.display = 'block';
      valid = false;
    } else if (el) {
      el.style.borderColor = '';
      if (err) err.style.display = 'none';
    }
  });

  // Email format
  var emailEl  = document.getElementById('email');
  var emailErr = document.getElementById('email-error');
  if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.style.borderColor = 'red';
    if (emailErr) emailErr.style.display = 'block';
    valid = false;
  }

  // Postal code
  var postalEl  = document.getElementById('postal');
  var postalErr = document.getElementById('postal-error');
  if (postalEl && !/^[0-9]{4,10}$/.test(postalEl.value)) {
    postalEl.style.borderColor = 'red';
    if (postalErr) postalErr.style.display = 'block';
    valid = false;
  }

  if (valid) {
    closeCheckout();
    openPayment();
  }
}
window.validateCheckoutForm = validateCheckoutForm;

// ── Global exports (main.js references these via window) ─────
window.openCheckout      = openCheckout;
window.closeCheckout     = closeCheckout;
window.openPayment       = openPayment;
window.closePayment      = closePayment;
window.openConfirmation  = openConfirmation;
window.closeConfirmation = closeConfirmation;
window.checkout          = checkout;
window.toggleCart        = toggleCart;
window.addToCart         = addToCart;
window.addToCartWithDetails = addToCartWithDetails;
window.updateCartCount   = updateCartCount;
window.loadCartItems     = loadCartItems;
window.removeFromCart    = removeFromCart;
window.updateQuantity    = updateQuantity;
window.clearCart         = clearCart;
window.getCartData       = window.getCartData;