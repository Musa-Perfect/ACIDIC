// Cart initialization
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadCartItems();
});

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Toggle cart sidebar
function toggleCart(show = true) {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        if (show) {
            cartSidebar.style.right = '0';
            loadCartItems();
        } else {
            cartSidebar.style.right = '-400px';
        }
    }
}

// Add product to cart
function addToCart(product, size = 'Medium', customization = null) {
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.size === size && 
        JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItemIndex > -1) {
        // Item exists, update quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            customization: customization,
            quantity: 1,
            addedAt: new Date().toISOString()
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    showAddToCartAnimation();
    
    // Auto-open cart sidebar
    setTimeout(() => toggleCart(true), 300);
}

// Add selected product from modal to cart
function addSelectedToCart() {
    const product = {
        id: document.getElementById('modal-name').textContent.toLowerCase().replace(/\s+/g, '-'),
        name: document.getElementById('modal-name').textContent,
        price: parseFloat(document.getElementById('modal-price').textContent.replace('R', '')),
        image: document.getElementById('modal-img').src
    };
    const size = document.getElementById('size').value;
    
    addToCart(product, size);
    closeModal();
}

// Add customized item to cart
function addCustomizationToCart() {
    const product = {
        id: document.getElementById('modal-name').textContent.toLowerCase().replace(/\s+/g, '-') + '-custom',
        name: document.getElementById('modal-name').textContent + ' (Custom)',
        price: parseFloat(document.getElementById('modal-price').textContent.replace('R', '')) + 50, // Customization fee
        image: document.getElementById('modal-img').src
    };
    const size = document.getElementById('size').value;
    const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color') || '#000';
    
    const customization = {
        color: selectedColor,
        custom: true
    };
    
    addToCart(product, size, customization);
    closeCustomize();
}

// Add entire outfit to cart
function addOutfitToCart() {
    const topLayer = document.getElementById('top-layer');
    const bottomLayer = document.getElementById('bottom-layer');
    const accessoryLayer = document.getElementById('accessory-layer');
    
    const outfitItems = [];
    
    // Get top item
    const topItem = topLayer.querySelector('.outfit-product-item');
    if (topItem && !topItem.querySelector('p')) {
        outfitItems.push({
            id: topItem.getAttribute('data-id'),
            name: topItem.getAttribute('data-name'),
            price: parseFloat(topItem.getAttribute('data-price')),
            image: topItem.getAttribute('data-image'),
            size: 'Medium',
            category: 'top'
        });
    }
    
    // Get bottom item
    const bottomItem = bottomLayer.querySelector('.outfit-product-item');
    if (bottomItem) {
        outfitItems.push({
            id: bottomItem.getAttribute('data-id'),
            name: bottomItem.getAttribute('data-name'),
            price: parseFloat(bottomItem.getAttribute('data-price')),
            image: bottomItem.getAttribute('data-image'),
            size: 'Medium',
            category: 'bottom'
        });
    }
    
    // Get accessory item
    const accessoryItem = accessoryLayer.querySelector('.outfit-product-item');
    if (accessoryItem) {
        outfitItems.push({
            id: accessoryItem.getAttribute('data-id'),
            name: accessoryItem.getAttribute('data-name'),
            price: parseFloat(accessoryItem.getAttribute('data-price')),
            image: accessoryItem.getAttribute('data-image'),
            size: 'One Size',
            category: 'accessory'
        });
    }
    
    if (outfitItems.length === 0) {
        alert('Please add at least one item to your outfit');
        return;
    }
    
    // Add outfit bundle with discount
    const outfitBundle = {
        id: 'outfit-bundle-' + Date.now(),
        name: 'Complete Outfit Bundle',
        price: outfitItems.reduce((total, item) => total + item.price, 0) * 0.9, // 10% discount
        image: outfitItems[0].image,
        size: 'Bundle',
        quantity: 1,
        bundle: true,
        items: outfitItems,
        addedAt: new Date().toISOString()
    };
    
    cart.push(outfitBundle);
    saveCart();
    updateCartCount();
    
    // Show success message
    alert(`Outfit bundle added to cart! You saved 10% (R${(outfitItems.reduce((total, item) => total + item.price, 0) * 0.1).toFixed(2)})`);
    toggleCart(true);
}

// Load cart items in sidebar
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="continue-shopping" onclick="toggleCart(false)">Continue Shopping</button>
            </div>
        `;
        if (cartTotalElement) cartTotalElement.textContent = 'R0';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">R${item.price.toFixed(2)}</p>
                <div class="cart-item-meta">
                    ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                    ${item.customization ? `<span class="custom-badge">Custom</span>` : ''}
                    ${item.bundle ? `<span class="bundle-badge">Bundle</span>` : ''}
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">×</button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    if (cartTotalElement) cartTotalElement.textContent = `R${total.toFixed(2)}`;
}

// Update item quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            saveCart();
            updateCartCount();
            loadCartItems();
        }
    }
}

// Remove item from cart
// Enhanced remove from cart function with animation
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const cartItemElement = document.querySelectorAll('.cart-item')[index];
    if (cartItemElement) {
        // Add removal animation
        cartItemElement.classList.add('removing');
        
        // Add pulse animation to remove button
        const removeBtn = cartItemElement.querySelector('.remove-item');
        if (removeBtn) {
            removeBtn.classList.add('pulse');
        }
        
        // Remove item after animation
        setTimeout(() => {
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            loadCartItems();
            
            // Show removal feedback if cart becomes empty
            if (cart.length === 0) {
                showCartEmptyMessage();
            }
        }, 300);
    } else {
        // Fallback if element not found
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        loadCartItems();
    }
}

// Show cart empty message
function showCartEmptyMessage() {
    const anim = document.createElement('div');
    anim.className = 'add-to-cart-animation';
    anim.innerHTML = '🛒 Cart is now empty';
    anim.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #666;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2s forwards;
    `;
    
    document.body.appendChild(anim);
    
    setTimeout(() => {
        if (anim.parentNode) {
            anim.parentNode.removeChild(anim);
        }
    }, 2300);
}

// Enhanced load cart items with proper remove button functionality
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="continue-shopping" onclick="toggleCart(false); showHomePage()">
                    Continue Shopping
                </button>
            </div>
        `;
        if (cartTotalElement) cartTotalElement.textContent = 'R0';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const colorInfo = item.customization ? 
            `<div class="color-swatch">
                <div class="color-dot" style="background: ${item.customization.color}"></div>
                <span>${item.customization.colorName || 'Custom'}</span>
            </div>` : '';
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = item.customization ? 'cart-item customized-item' : 'cart-item';
        cartItemElement.setAttribute('data-item-index', index);
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                ${item.quantity > 1 ? `<span class="quantity-badge">${item.quantity}</span>` : ''}
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">R${item.price.toFixed(2)}</p>
                <p class="cart-item-unit-price">R${(item.price * item.quantity).toFixed(2)} total</p>
                <div class="cart-item-meta">
                    ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                    ${item.customization ? `<span class="custom-badge">Custom</span>` : ''}
                    ${item.bundle ? `<span class="bundle-badge">Bundle</span>` : ''}
                    ${colorInfo}
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="remove-item" onclick="confirmRemoveItem(${index})" title="Remove item from cart">
                ×
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = `R${total.toFixed(2)}`;
    }
}

// Enhanced remove item with confirmation
function confirmRemoveItem(index) {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    const itemName = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
    
    // Create custom confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    `;
    
    confirmModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h3>Remove Item</h3>
            <p>Are you sure you want to remove "<strong>${itemName}</strong>" from your cart?</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    flex: 1;
                ">Cancel</button>
                <button onclick="removeFromCart(${index}); this.closest('.modal').remove()" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    flex: 1;
                ">Remove Item</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.remove();
        }
    });
    
    // Close modal with Escape key
    const closeModal = function(e) {
        if (e.key === 'Escape') {
            confirmModal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    };
    document.addEventListener('keydown', closeModal);
}

// Enhanced update quantity function
function updateQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;
    
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity <= 0) {
        confirmRemoveItem(index);
        return;
    }
    
    // Limit maximum quantity to 99
    if (newQuantity > 99) {
        alert('Maximum quantity per item is 99');
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart();
    updateCartCount();
    loadCartItems();
    
    // Show quantity update feedback
    if (change > 0) {
        showQuantityUpdateFeedback('increased');
    } else {
        showQuantityUpdateFeedback('decreased');
    }
}

// Show quantity update feedback
function showQuantityUpdateFeedback(action) {
    const messages = {
        increased: 'Quantity increased',
        decreased: 'Quantity decreased'
    };
    
    const anim = document.createElement('div');
    anim.className = 'add-to-cart-animation';
    anim.innerHTML = `✓ ${messages[action]}`;
    anim.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 1.5s forwards;
        font-size: 14px;
    `;
    
    document.body.appendChild(anim);
    
    setTimeout(() => {
        if (anim.parentNode) {
            anim.parentNode.removeChild(anim);
        }
    }, 1800);
}

// Clear all items from cart
function clearCartWithConfirmation() {
    if (cart.length === 0) {
        alert('Your cart is already empty!');
        return;
    }
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    `;
    
    confirmModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h3>Clear Cart</h3>
            <p>Are you sure you want to remove all items (${cart.length}) from your cart?</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    flex: 1;
                ">Cancel</button>
                <button onclick="clearAllItems(); this.closest('.modal').remove()" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    flex: 1;
                ">Clear All Items</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.remove();
        }
    });
}

function clearAllItems() {
    cart = [];
    saveCart();
    updateCartCount();
    loadCartItems();
    showCartEmptyMessage();
}
// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        cart = [];
        saveCart();
        updateCartCount();
        loadCartItems();
    }
}

// Show add to cart animation
function showAddToCartAnimation() {
    // Create animation element
    const anim = document.createElement('div');
    anim.className = 'add-to-cart-animation';
    anim.innerHTML = '✓ Added to Cart';
    anim.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2s forwards;
    `;
    
    document.body.appendChild(anim);
    
    // Remove animation after it completes
    setTimeout(() => {
        if (anim.parentNode) {
            anim.parentNode.removeChild(anim);
        }
    }, 2300);
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty. Add some items before checking out.');
        return;
    }
    
    // Calculate total including delivery
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    const total = subtotal + deliveryFee;
    
    // Update final total in checkout modal
    const finalTotalElement = document.getElementById('final-total');
    if (finalTotalElement) {
        finalTotalElement.textContent = `R${total.toFixed(2)}`;
    }
    
    // Close cart and open checkout modal
    toggleCart(false);
    openCheckout();
}

// Get cart total for payment processing
function getCartTotal() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    return subtotal + deliveryFee;
}

// Get cart items for order summary
function getCartItemsForSummary() {
    return cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
    }));
}

// Export cart data for other modules
window.getCartData = function() {
    return {
        items: cart,
        total: getCartTotal(),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
};

// Initialize cart-related event listeners
// Enhanced event listeners initialization
function initCartEventListeners() {
    // Close cart when clicking outside
    document.addEventListener('click', function(event) {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar && !cartSidebar.contains(event.target) && 
            !event.target.closest('.cart-icon-container')) {
            toggleCart(false);
        }
    });
    
    // Escape key to close everything
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            toggleCart(false);
            closeModal();
            closeCustomize();
            closeCheckout();
            closePayment();
            closeConfirmation();
        }
    });
}

// Test function to verify everything works
function testCustomizationModal() {
    console.log('Testing customization modal...');
    
    // Test close function exists
    if (typeof closeCustomize === 'function') {
        console.log('✓ closeCustomize function exists');
    } else {
        console.error('✗ closeCustomize function not found');
    }
    
    // Test modal element exists
    const modal = document.getElementById('customize-modal');
    if (modal) {
        console.log('✓ Customization modal element exists');
    } else {
        console.error('✗ Customization modal element not found');
    }
    
    // Test close button exists
    const closeBtn = document.querySelector('#customize-modal .close-modal');
    if (closeBtn) {
        console.log('✓ Close button exists');
        console.log('✓ Close button onclick:', closeBtn.getAttribute('onclick'));
    } else {
        console.error('✗ Close button not found');
    }
}

// Run test on load (optional)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testCustomizationModal, 1000);
});

// Color selection function with name display
function selectColor(element, colorCode, colorName) {
    // Safety check
    if (!element) {
        console.error('Color element not found');
        return;
    }
    
    // Remove active class from all color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        if (option !== element) {
            option.classList.remove('active');
        }
    });
    
    // Add active class to selected color
    element.classList.add('active');
    
    // Update selected color info display
    updateSelectedColorDisplay(colorCode, colorName);
}

// Update selected color display
function updateSelectedColorDisplay(colorCode, colorName) {
    const selectedColorInfo = document.getElementById('selected-color-info');
    const selectedColorName = document.getElementById('selected-color-name');
    
    if (selectedColorInfo && selectedColorName) {
        selectedColorInfo.style.display = 'block';
        selectedColorName.textContent = colorName;
        selectedColorName.style.color = colorCode;
    }
}

// Enhanced add customization to cart function
function addCustomizationToCart() {
    // Get product details safely
    const productName = document.getElementById('modal-name');
    const productPrice = document.getElementById('modal-price');
    const productImage = document.getElementById('modal-img');
    
    if (!productName || !productPrice || !productImage) {
        console.error('Required modal elements not found');
        alert('Error: Product information not found. Please try again.');
        return;
    }
    
    // Get selected color safely
    const selectedColorOption = document.querySelector('.color-option.active');
    if (!selectedColorOption) {
        alert('Please select a color first');
        return;
    }
    
    const selectedColor = selectedColorOption.getAttribute('data-color') || '#000';
    const selectedColorName = selectedColorOption.getAttribute('data-name') || 'Black';
    
    // Parse price safely
    let price;
    try {
        price = parseFloat(productPrice.textContent.replace('R', '').replace(',', ''));
        if (isNaN(price)) {
            throw new Error('Invalid price');
        }
    } catch (error) {
        console.error('Error parsing price:', error);
        alert('Error: Invalid product price');
        return;
    }
    
    const product = {
        id: productName.textContent.toLowerCase().replace(/\s+/g, '-') + '-custom-' + Date.now(),
        name: productName.textContent + ' (Custom - ' + selectedColorName + ')',
        price: price + 50, // Customization fee
        image: productImage.src
    };
    
    const size = document.getElementById('size')?.value || 'Medium';
    
    const customization = {
        color: selectedColor,
        colorName: selectedColorName,
        custom: true
    };
    
    addToCart(product, size, customization);
    closeCustomize();
    showCustomizationSuccess(selectedColorName);
}

// Show customization success message
function showCustomizationSuccess(colorName) {
    const anim = document.createElement('div');
    anim.className = 'add-to-cart-animation';
    anim.innerHTML = `✓ Added Custom ${colorName} Item to Cart`;
    anim.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.5s forwards;
    `;
    
    document.body.appendChild(anim);
    
    setTimeout(() => {
        if (anim.parentNode) {
            anim.parentNode.removeChild(anim);
        }
    }, 2800);
}

// Initialize color picker when modal opens
function showCustomizeModal() {
    const customizeModal = document.getElementById('customize-modal');
    if (customizeModal) {
        customizeModal.style.display = 'block';
        
        // Initialize with default color (Black)
        const defaultColor = '#000';
        const defaultColorName = 'Black';
        updateSelectedColorDisplay(defaultColor, defaultColorName);
    }
}

// Enhanced load cart items to show color names
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="continue-shopping" onclick="toggleCart(false); showHomePage()">
                    Continue Shopping
                </button>
            </div>
        `;
        if (cartTotalElement) cartTotalElement.textContent = 'R0';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Safely get color info
        let colorInfo = '';
        if (item.customization && item.customization.colorName) {
            colorInfo = `
                <div class="color-swatch">
                    <div class="color-dot" style="background: ${item.customization.color}"></div>
                    <span>${item.customization.colorName}</span>
                </div>
            `;
        } else if (item.customization) {
            // Fallback for old items without colorName
            colorInfo = `
                <div class="color-swatch">
                    <div class="color-dot" style="background: ${item.customization.color}"></div>
                    <span>Custom</span>
                </div>
            `;
        }
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = item.customization ? 'cart-item customized-item' : 'cart-item';
        cartItemElement.setAttribute('data-item-index', index);
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                ${item.quantity > 1 ? `<span class="quantity-badge">${item.quantity}</span>` : ''}
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">R${item.price.toFixed(2)}</p>
                <p class="cart-item-unit-price">R${(item.price * item.quantity).toFixed(2)} total</p>
                <div class="cart-item-meta">
                    ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                    ${item.customization ? `<span class="custom-badge">Custom</span>` : ''}
                    ${item.bundle ? `<span class="bundle-badge">Bundle</span>` : ''}
                    ${colorInfo}
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="remove-item" onclick="confirmRemoveItem(${index})" title="Remove item from cart">
                ×
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = `R${total.toFixed(2)}`;
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .empty-cart {
        text-align: center;
        padding: 40px 20px;
    }
    
    .empty-cart p {
        color: #666;
        margin-bottom: 20px;
    }
    
    .continue-shopping {
        background: #f4b400;
        color: black;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #eee;
        gap: 15px;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 5px;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .cart-item-details h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
    }
    
    .cart-item-price {
        color: #f4b400;
        font-weight: bold;
        margin: 0 0 5px 0;
    }
    
    .cart-item-meta {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .cart-item-meta span {
        font-size: 12px;
        color: #666;
    }
    
    .custom-badge, .bundle-badge {
        background: #f4b400;
        color: black;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .quantity-controls button {
        background: #f0f0f0;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .quantity-controls button:hover {
        background: #ddd;
    }
    
    .quantity-controls span {
        font-weight: bold;
        min-width: 20px;
        text-align: center;
    }
    
    .remove-item {
        background: none;
        border: none;
        font-size: 20px;
        color: #ff4444;
        cursor: pointer;
        padding: 5px;
        line-height: 1;
    }
    
    .remove-item:hover {
        color: #cc0000;
    }
`;
document.head.appendChild(style);

// cart.js - Fixed Checkout Functionality

// Fixed Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty. Add some items before checking out.');
        return;
    }
    
    // Close cart sidebar
    toggleCart(false);
    
    // Open checkout modal after a short delay
    setTimeout(() => {
        openCheckout();
    }, 300);
}

// Get cart total for payment processing
function getCartTotal() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    return subtotal + deliveryFee;
}

// Get cart items for order summary
function getCartItemsForSummary() {
    return cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
    }));
}

// Update the checkout modal with cart items and total
function updateCheckoutModal() {
    const finalTotalElement = document.getElementById('final-total');
    const paymentTotalElement = document.getElementById('payment-total');
    const paymentAmountElement = document.getElementById('payment-amount');
    
    const total = getCartTotal();
    
    if (finalTotalElement) finalTotalElement.textContent = `R${total.toFixed(2)}`;
    if (paymentTotalElement) paymentTotalElement.textContent = `R${total.toFixed(2)}`;
    if (paymentAmountElement) paymentAmountElement.textContent = `R${total.toFixed(2)}`;
    
    // Update payment order items
    const paymentOrderItems = document.getElementById('payment-order-items');
    if (paymentOrderItems) {
        paymentOrderItems.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>R${(item.price * item.quantity).toFixed(2)}</span>
            `;
            paymentOrderItems.appendChild(itemElement);
        });
        
        // Add delivery fee
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'order-item';
        deliveryElement.innerHTML = `
            <span>Delivery Fee</span>
            <span>R150.00</span>
        `;
        paymentOrderItems.appendChild(deliveryElement);
    }
    
    // Update confirmation modal items
    const confirmationOrderItems = document.getElementById('confirmation-order-items');
    if (confirmationOrderItems) {
        confirmationOrderItems.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>R${(item.price * item.quantity).toFixed(2)}</span>
            `;
            confirmationOrderItems.appendChild(itemElement);
        });
        
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'order-item';
        deliveryElement.innerHTML = `
            <span>Delivery Fee</span>
            <span>R150.00</span>
        `;
        confirmationOrderItems.appendChild(deliveryElement);
    }
    
    const confirmationTotalElement = document.getElementById('confirmation-total');
    if (confirmationTotalElement) {
        confirmationTotalElement.textContent = `R${total.toFixed(2)}`;
    }
}

// Add these modal control functions if they don't exist
function openCheckout() {
    updateCheckoutModal();
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
    }
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

function openPayment() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.style.display = 'block';
    }
}

function closePayment() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.style.display = 'none';
    }
}

function openConfirmation() {
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        confirmationModal.style.display = 'block';
    }
}

function closeConfirmation() {
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
    
    // Clear cart after successful purchase
    cart = [];
    saveCart();
    updateCartCount();
    loadCartItems();
}

// Enhanced checkout form validation
function validateCheckoutForm() {
    const requiredFields = [
        'country', 'fname', 'lname', 'address', 
        'city', 'province', 'postal', 'phone', 'email'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(field + '-error');
        
        if (element && errorElement) {
            if (!element.value.trim()) {
                element.style.borderColor = 'red';
                errorElement.style.display = 'block';
                isValid = false;
            } else {
                element.style.borderColor = '';
                errorElement.style.display = 'none';
            }
        }
    });
    
    // Validate email format
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    if (email && emailError) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.style.borderColor = 'red';
            emailError.style.display = 'block';
            isValid = false;
        }
    }
    
    // Validate postal code
    const postal = document.getElementById('postal');
    const postalError = document.getElementById('postal-error');
    if (postal && postalError) {
        const postalRegex = /^[0-9]{4,10}$/;
        if (!postalRegex.test(postal.value)) {
            postal.style.borderColor = 'red';
            postalError.style.display = 'block';
            isValid = false;
        }
    }
    
    if (isValid) {
        closeCheckout();
        openPayment();
    }
    
    return isValid;
}

// Process payment function
function processPayment() {
    // Simulate payment processing
    const paymentButton = document.querySelector('.purchase--btn');
    const originalText = paymentButton.innerHTML;
    
    paymentButton.innerHTML = 'Processing...';
    paymentButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        closePayment();
        openConfirmation();
        
        // Update rewards if user is logged in
        updateRewardsAfterPurchase();
        
        // Reset payment button
        paymentButton.innerHTML = originalText;
        paymentButton.disabled = false;
    }, 2000);
}

// Update rewards after purchase
function updateRewardsAfterPurchase() {
    const total = getCartTotal();
    const pointsEarned = Math.floor(total / 10); // 1 point per R10 spent
    
    // Get current user points from localStorage or default to 0
    let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    userPoints += pointsEarned;
    localStorage.setItem('userPoints', userPoints);
    
    // Update confirmation modal with rewards info
    const pointsEarnedElement = document.getElementById('points-earned');
    const totalPointsElement = document.getElementById('total-points');
    const rewardsSection = document.getElementById('rewards-earned-section');
    
    if (pointsEarnedElement) pointsEarnedElement.textContent = pointsEarned;
    if (totalPointsElement) totalPointsElement.textContent = userPoints;
    if (rewardsSection) rewardsSection.style.display = 'block';
    
    // Update tier progress
    updateTierProgress(userPoints);
}

// Update tier progress in confirmation
function updateTierProgress(points) {
    const tierProgressElement = document.getElementById('tier-progress');
    if (!tierProgressElement) return;
    
    let nextTier = '';
    let pointsNeeded = 0;
    
    if (points < 100) {
        nextTier = 'Silver';
        pointsNeeded = 100 - points;
    } else if (points < 500) {
        nextTier = 'Gold';
        pointsNeeded = 500 - points;
    } else {
        tierProgressElement.textContent = 'You have reached Gold tier! 🎉';
        return;
    }
    
    tierProgressElement.textContent = `${pointsNeeded} points needed for ${nextTier} tier`;
}

// Track order function
function trackOrder() {
    alert('Tracking will be available once your order ships. You will receive an email with tracking details.');
    closeConfirmation();
}

// Contact support function
function contactSupport() {
    alert('Contact support at: support@acidic-clothing.com');
}

// Continue shopping function
function continueShopping() {
    closeConfirmation();
    // Optionally redirect to home or main shop
    showCategory('tshirts');
}

// Add event listeners for modal closing
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    const modals = ['checkout-modal', 'payment-modal', 'confirmation-modal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    if (modalId === 'checkout-modal') closeCheckout();
                    if (modalId === 'payment-modal') closePayment();
                    if (modalId === 'confirmation-modal') closeConfirmation();
                }
            });
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCheckout();
            closePayment();
            closeConfirmation();
            toggleCart(false);
        }
    });
});

// Export functions for global access
window.checkout = checkout;
window.validateCheckoutForm = validateCheckoutForm;
window.processPayment = processPayment;
window.trackOrder = trackOrder;
window.contactSupport = contactSupport;
window.continueShopping = continueShopping;

// Enhanced close customize function
function closeCustomize() {
    const customizeModal = document.getElementById('customize-modal');
    if (customizeModal) {
        customizeModal.style.display = 'none';
    }
    // Don't automatically go back to home page - let user decide
}

// Enhanced show customize modal function
function showCustomizeModal() {
    const customizeModal = document.getElementById('customize-modal');
    if (customizeModal) {
        customizeModal.style.display = 'block';
        
        // Initialize with default color (Black)
        const defaultColor = '#000';
        const defaultColorName = 'Black';
        updateSelectedColorDisplay(defaultColor, defaultColorName);
        
        // Add event listener for escape key
        const handleEscapeKey = function(e) {
            if (e.key === 'Escape') {
                closeCustomize();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        
        // Store the handler for cleanup
        customizeModal._escapeHandler = handleEscapeKey;
    }
}

// Enhanced close customize with cleanup
function closeCustomize() {
    const customizeModal = document.getElementById('customize-modal');
    if (customizeModal) {
        customizeModal.style.display = 'none';
        
        // Remove escape key listener
        if (customizeModal._escapeHandler) {
            document.removeEventListener('keydown', customizeModal._escapeHandler);
            delete customizeModal._escapeHandler;
        }
    }
}

// Close modal when clicking outside
function initModalCloseEvents() {
    const customizeModal = document.getElementById('customize-modal');
    if (customizeModal) {
        customizeModal.addEventListener('click', function(event) {
            if (event.target === customizeModal) {
                closeCustomize();
            }
        });
    }
    
    // Also initialize other modals
    const modals = ['product-modal', 'checkout-modal', 'payment-modal', 'confirmation-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    if (modalId === 'product-modal') closeModal();
                    if (modalId === 'checkout-modal') closeCheckout();
                    if (modalId === 'payment-modal') closePayment();
                    if (modalId === 'confirmation-modal') closeConfirmation();
                    if (modalId === 'customize-modal') closeCustomize();
                }
            });
        }
    });
}

// Update the back to home button in customization modal
function updateCustomizationBackButton() {
    const backButton = document.querySelector('.back-to-home');
    if (backButton) {
        backButton.onclick = function() {
            closeCustomize();
            showHomePage();
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCartEventListeners();
    initModalCloseEvents();
    updateCartCount();
    loadCartItems();
    updateAuthUI();
    updateCustomizationBackButton();
    
    // Ensure home page is shown on load
    showHomePage();
});