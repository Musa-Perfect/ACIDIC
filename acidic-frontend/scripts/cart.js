// Cart initialization - USE CONSISTENT KEY
let cart = JSON.parse(localStorage.getItem('acidicCart')) || []; // Changed from 'cart' to 'acidicCart'

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // First try to load from 'acidicCart', then from 'cart' (for backward compatibility)
    const acidicCart = JSON.parse(localStorage.getItem('acidicCart'));
    const oldCart = JSON.parse(localStorage.getItem('cart'));
    
    if (acidicCart) {
        cart = acidicCart;
    } else if (oldCart) {
        cart = oldCart;
        // Migrate to new key
        localStorage.setItem('acidicCart', JSON.stringify(cart));
        localStorage.removeItem('cart');
    }
    
    updateCartCount();
    loadCartItems();
});

// Save cart to localStorage - USE CONSISTENT KEY
function saveCart() {
    localStorage.setItem('acidicCart', JSON.stringify(cart));
}

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

// Enhanced add to cart function with color and size tracking
function addToCartWithDetails(product, color, size, quantity = 1) {
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.size === size && 
        item.color === color
    );

    if (existingItemIndex > -1) {
        // Item exists, update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item with color and size details
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image || 'acidic 1.jpg',
            size: size || 'Medium',
            color: color || 'Black',
            quantity: quantity,
            category: product.category,
            variantId: `${product.id}-${color || 'default'}-${size || 'M'}`,
            selectedAt: new Date().toISOString(),
            addedAt: new Date().toISOString(),
            // Additional metadata for admin
            sku: product.sku || `ACID-${product.category?.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
            productId: product.id,
            colorName: color || 'Black',
            sizeCode: size || 'M',
            originalPrice: product.price,
            // For customization
            isCustomized: product.customization ? true : false,
            customization: product.customization || null
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    showAddToCartAnimation(product.name, color, size);
    
    return cart.length - 1; // Return index of added item
}

// Enhanced quick add to cart function
function processQuickAdd(productId) {
    console.log('Processing quick add for product:', productId);
    
    const product = productData.allproducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quick-add-qty').value);
    
    // Validate quantity
    if (quantity < 1 || quantity > 10) {
        showNotification('Quantity must be between 1 and 10', 'error');
        return;
    }
    
    // Get selected variants
    const selectedColor = window.selectedVariant?.color || 
                         product.variants?.find(v => v.name === 'Color')?.options[0] || 
                         'Black';
    const selectedSize = window.selectedVariant?.size || 
                        product.variants?.find(v => v.name === 'Size')?.options[0] || 
                        'M';
    
    // Check if size selected (if product has sizes)
    const hasSizes = product.variants?.some(v => v.name === 'Size');
    if (hasSizes && (!selectedSize || selectedSize === 'Select Size')) {
        showNotification('Please select a size', 'error');
        return;
    }
    
    // Check stock
    let stockAvailable = true;
    let stockQuantity = product.totalStock;
    
    if (product.inventory) {
        const inventoryItem = product.inventory.find(item => 
            item.color === selectedColor && 
            item.size === selectedSize
        );
        
        if (inventoryItem) {
            stockQuantity = inventoryItem.stock;
            stockAvailable = inventoryItem.stock >= quantity;
        }
    }
    
    if (!stockAvailable) {
        showNotification(`Only ${stockQuantity} items available in stock`, 'error');
        return;
    }
    
    // Add to cart with details
    const itemIndex = addToCartWithDetails(product, selectedColor, selectedSize, quantity);
    
    // Close modal
    closeQuickAddModal();
    
    // Show success message with details
    showNotification(`${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) added to cart!`, 'success');
}

// Enhanced customization to cart
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
    const size = document.getElementById('size')?.value || 'Medium';
    
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
    
    // Find product in product data
    const productId = productName.textContent.toLowerCase().replace(/\s+/g, '-');
    let product = productData.allproducts.find(p => p.name === productName.textContent);
    
    if (!product) {
        product = {
            id: productId,
            name: productName.textContent + ' (Custom)',
            price: price + 50, // Customization fee
            images: [productImage.src],
            category: 'custom',
            customization: {
                color: selectedColor,
                colorName: selectedColorName,
                custom: true,
                type: 'color-customization'
            }
        };
    }
    
    // Add to cart with customization details
    const itemIndex = addToCartWithDetails(
        product, 
        selectedColorName, 
        size, 
        1
    );
    
    // Mark as customized
    if (cart[itemIndex]) {
        cart[itemIndex].isCustomized = true;
        cart[itemIndex].customizationDetails = {
            originalColor: 'Default',
            customColor: selectedColorName,
            colorCode: selectedColor,
            customFee: 50
        };
        saveCart();
    }
    
    closeCustomize();
    showCustomizationSuccess(selectedColorName);
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
        
        // Get color display
        let colorDisplay = '';
        if (item.color) {
            const colorHexMap = {
                'Black': '#000000',
                'White': '#ffffff',
                'Red': '#ff0000',
                'Blue': '#0000ff',
                'Lime': '#00ff00',
                'Cyan': '#00ffff',
                'Cream': '#fffdd0',
                'Green': '#008000',
                'Brown': '#964b00',
                'Pink': '#ffc0cb'
            };
            const hex = colorHexMap[item.color] || '#cccccc';
            const needsBorder = item.color === 'White' || item.color === 'Cream';
            
            colorDisplay = `
                <div class="cart-item-color">
                    <span>Color:</span>
                    <div class="color-display">
                        <div class="color-dot" style="background: ${hex}; ${needsBorder ? 'border: 1px solid #ccc' : ''}"></div>
                        <span class="color-name">${item.color}</span>
                    </div>
                </div>
            `;
        }
        
        // Get size display
        let sizeDisplay = item.size ? `
            <div class="cart-item-size">
                <span>Size:</span>
                <span class="size-value">${item.size}</span>
            </div>
        ` : '';
        
        // Customization badge
        const customBadge = item.isCustomized ? `<span class="custom-badge">Custom</span>` : '';
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.setAttribute('data-item-index', index);
        cartItemElement.setAttribute('data-variant-id', item.variantId || '');
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                ${item.quantity > 1 ? `<span class="quantity-badge">${item.quantity}</span>` : ''}
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name} ${customBadge}</h4>
                <p class="cart-item-price">R${item.price.toFixed(2)} each</p>
                <p class="cart-item-total">R${(item.price * item.quantity).toFixed(2)} total</p>
                
                <div class="cart-item-variants">
                    ${sizeDisplay}
                    ${colorDisplay}
                </div>
                
                <div class="cart-item-meta">
                    ${item.sku ? `<div class="cart-item-sku">SKU: ${item.sku}</div>` : ''}
                    ${item.category ? `<div class="cart-item-category">${formatCategory(item.category)}</div>` : ''}
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

// Update confirmation with order details
function updateConfirmationWithOrderDetails(order) {
    const confirmationOrderItems = document.getElementById('confirmation-order-items');
    const confirmationTotal = document.getElementById('confirmation-total');
    const trackingNumber = document.getElementById('tracking-number');
    
    if (confirmationOrderItems) {
        confirmationOrderItems.innerHTML = '';
        order.variantDetails.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'confirmation-order-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${item.product}</div>
                    <div class="item-variants">
                        ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                        ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                        ${item.isCustomized ? `<span class="custom-tag">Custom</span>` : ''}
                    </div>
                </div>
                <div class="item-quantity-price">
                    <span class="quantity">x${item.quantity}</span>
                    <span class="price">R${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
            confirmationOrderItems.appendChild(itemElement);
        });
        
        // Add delivery
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'confirmation-order-item';
        deliveryElement.innerHTML = `
            <div class="item-details">
                <div class="item-name">Delivery Fee</div>
                <div class="item-variants">
                    <span>Standard Delivery</span>
                </div>
            </div>
            <div class="item-quantity-price">
                <span class="price">R150.00</span>
            </div>
        `;
        confirmationOrderItems.appendChild(deliveryElement);
    }
    
    if (confirmationTotal) {
        confirmationTotal.textContent = `R${order.total.toFixed(2)}`;
    }
    
    if (trackingNumber) {
        trackingNumber.textContent = order.orderId;
    }
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

// Enhanced Rewards System
// Reuse existing cart (initialized at top of file) to avoid redeclaring the block-scoped variable
cart = cart || JSON.parse(localStorage.getItem('cart')) || [];
let paymentInProgress = false;
let paymentProcessed = false;

// Initialize rewards when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeUserData();
    updateCartCount();
    loadCartItems();
    checkUserLoginStatus();
    updateAuthUI();
    updateLoyaltyProgramDisplay();
    updateOrderHistoryDisplay();
});

// Initialize user data structure
function initializeUserData() {
    let userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        userData = {
            points: 0,
            tier: 'Bronze',
            joinDate: new Date().toISOString(),
            orderHistory: [],
            rewardHistory: [],
            totalSpent: 0,
            lastPurchase: null
        };
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    return userData;
}

// Enhanced process payment with proper rewards linking
function processPayment() {
    if (paymentInProgress) {
        alert('Payment is already being processed. Please wait...');
        return;
    }
    
    if (paymentProcessed) {
        alert('Payment has already been processed for this order.');
        return;
    }
    
    const paymentButton = document.querySelector('.purchase--btn');
    const originalText = paymentButton.innerHTML;
    
    paymentInProgress = true;
    paymentButton.innerHTML = '🔄 Processing Payment...';
    paymentButton.disabled = true;
    
    setTimeout(() => {
        paymentProcessed = true;
        paymentInProgress = false;
        
        // Process successful payment with rewards
        processSuccessfulPayment();
        
        paymentButton.innerHTML = originalText;
        paymentButton.disabled = false;
    }, 3000);
}

// Enhanced successful payment processing
function processSuccessfulPayment() {
    closePayment();
    
    // Get user info from checkout form
    const userEmail = document.getElementById('email')?.value || 'guest@example.com';
    const userName = `${document.getElementById('fname')?.value || ''} ${document.getElementById('lname')?.value || ''}`.trim();
    
    // Create comprehensive order details
    const orderDetails = {
        orderId: 'ACD-' + Date.now().toString().slice(-8),
        items: [...cart],
        subtotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        deliveryFee: 150,
        total: getCartTotal(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        status: 'confirmed',
        customer: {
            email: userEmail,
            name: userName,
            address: document.getElementById('address')?.value || ''
        },
        paymentMethod: document.getElementById('payment-method')?.value || 'Card'
    };
    
    // Save order to history
    saveOrderToHistory(orderDetails);
    
    // Process rewards ONLY if user is logged in
    if (checkUserLoginStatus()) {
        const rewardsData = processRewardsForOrder(orderDetails);
        updateConfirmationModal(orderDetails, rewardsData);
        showRewardsNotification(rewardsData);
    } else {
        // Show confirmation without rewards for guest users
        updateConfirmationModal(orderDetails, null);
    }
    
    openConfirmation();
    clearCartAfterPurchase();
}

// Process rewards for order (only for logged-in users)
function processRewardsForOrder(orderDetails) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return null;
    }
    
    let userData = JSON.parse(localStorage.getItem('userData')) || initializeUserData();
    
    // Calculate points based on tier multiplier
    const pointsMultiplier = getTierMultiplier(userData.tier);
    const pointsEarned = Math.floor(orderDetails.total * pointsMultiplier);
    
    // Update user data
    userData.points += pointsEarned;
    userData.totalSpent = (userData.totalSpent || 0) + orderDetails.total;
    userData.lastPurchase = orderDetails.timestamp;
    
    // Update tier based on total points
    const newTier = calculateTier(userData.points);
    const tierChanged = userData.tier !== newTier;
    userData.tier = newTier;
    
    // Add reward transaction
    const rewardTransaction = {
        type: 'earned',
        points: pointsEarned,
        orderId: orderDetails.orderId,
        date: orderDetails.timestamp,
        description: `Purchase on ${orderDetails.date}`,
        orderTotal: orderDetails.total,
        tier: userData.tier
    };
    
    userData.rewardHistory.unshift(rewardTransaction);
    
    // Add to order history in user data
    userData.orderHistory.unshift({
        orderId: orderDetails.orderId,
        date: orderDetails.timestamp,
        total: orderDetails.total,
        items: orderDetails.items.length,
        status: 'completed',
        pointsEarned: pointsEarned
    });
    
    // Save updated user data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return {
        pointsEarned: pointsEarned,
        totalPoints: userData.points,
        tier: userData.tier,
        tierChanged: tierChanged,
        oldTier: tierChanged ? userData.tier : null
    };
}

// Get tier multiplier for points calculation
function getTierMultiplier(tier) {
    const multipliers = {
        'Bronze': 0.1,   // 1 point per R10 spent
        'Silver': 0.125, // 1.25 points per R10 spent
        'Gold': 0.15     // 1.5 points per R10 spent
    };
    return multipliers[tier] || multipliers['Bronze'];
}

// Enhanced update confirmation modal
function updateConfirmationModal(orderDetails, rewardsData) {
    const confirmationOrderItems = document.getElementById('confirmation-order-items');
    const confirmationTotal = document.getElementById('confirmation-total');
    const trackingNumber = document.getElementById('tracking-number');
    const confirmationAddress = document.getElementById('confirmation-address');
    const rewardsSection = document.getElementById('rewards-earned-section');
    
    // Update order items
    if (confirmationOrderItems) {
        confirmationOrderItems.innerHTML = '';
        orderDetails.items.forEach(item => {
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
    
    if (confirmationTotal) {
        confirmationTotal.textContent = `R${orderDetails.total.toFixed(2)}`;
    }
    
    if (trackingNumber) {
        trackingNumber.textContent = orderDetails.orderId;
    }
    
    if (confirmationAddress) {
        const address = [
            document.getElementById('address')?.value,
            document.getElementById('city')?.value,
            document.getElementById('province')?.value,
            document.getElementById('postal')?.value
        ].filter(Boolean).join(', ');
        confirmationAddress.textContent = address || 'Address not provided';
    }
    
    // Update rewards section
    if (rewardsSection) {
        if (rewardsData && checkUserLoginStatus()) {
            rewardsSection.style.display = 'block';
            updateRewardsDisplayInConfirmation(rewardsData, orderDetails);
        } else {
            rewardsSection.style.display = 'none';
        }
    }
}

// Update rewards display in confirmation
function updateRewardsDisplayInConfirmation(rewardsData, orderDetails) {
    const pointsEarnedElement = document.getElementById('points-earned');
    const totalPointsElement = document.getElementById('total-points');
    const tierProgressElement = document.getElementById('tier-progress');
    
    if (pointsEarnedElement) pointsEarnedElement.textContent = rewardsData.pointsEarned;
    if (totalPointsElement) totalPointsElement.textContent = rewardsData.totalPoints;
    
    if (tierProgressElement) {
        if (rewardsData.tierChanged) {
            tierProgressElement.innerHTML = `🎉 <strong>Congratulations! You've reached ${rewardsData.tier} tier!</strong>`;
            tierProgressElement.style.color = '#2ecc71';
        } else {
            const nextTierInfo = getNextTierInfo(rewardsData.totalPoints);
            if (nextTierInfo.pointsNeeded > 0) {
                tierProgressElement.textContent = `${nextTierInfo.pointsNeeded} points needed for ${nextTierInfo.nextTier} tier`;
            } else {
                tierProgressElement.textContent = `You've reached ${rewardsData.tier} tier! 🎉`;
            }
        }
    }
    
    // Add date information
    const rewardsInfo = document.querySelector('.rewards-info');
    if (rewardsInfo) {
        let dateInfo = rewardsInfo.querySelector('.reward-date');
        if (!dateInfo) {
            dateInfo = document.createElement('p');
            dateInfo.className = 'reward-date';
            rewardsInfo.appendChild(dateInfo);
        }
        dateInfo.textContent = `Earned on ${orderDetails.date}`;
    }
}

// Show rewards notification
function showRewardsNotification(rewardsData) {
    if (!rewardsData) return;
    
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
        <div class="points-notification-content">
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">×</button>
            <div class="points-icon">🎁</div>
            <div class="points-details">
                <h4>Rewards Earned!</h4>
                <p>You earned <strong>${rewardsData.pointsEarned} points</strong></p>
                <p>Total points: <strong>${rewardsData.totalPoints}</strong></p>
                ${rewardsData.tierChanged ? 
                    `<p style="color: #f4b400; font-weight: bold;">🎉 Welcome to ${rewardsData.tier} Tier!</p>` : 
                    `<p>Current tier: <strong>${rewardsData.tier}</strong></p>`
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 6000);
}

// Enhanced loyalty program display
function updateLoyaltyProgramDisplay() {
    const currentUser = getCurrentUser();
    const userPointsElement = document.getElementById('user-points');
    const pointsProgressElement = document.getElementById('points-progress');
    const tierInfoElement = document.getElementById('tier-info');
    const currentBenefitsElement = document.getElementById('current-benefits');
    
    if (!currentUser) {
        // Show login prompt for guests
        if (userPointsElement) userPointsElement.textContent = '0 Points';
        if (pointsProgressElement) pointsProgressElement.style.width = '0%';
        if (tierInfoElement) tierInfoElement.textContent = 'Sign in to earn rewards';
        if (currentBenefitsElement) currentBenefitsElement.innerHTML = '<p>Create an account to start earning points!</p>';
        updateTierHighlighting('Bronze');
        return;
    }
    
    const userData = JSON.parse(localStorage.getItem('userData')) || initializeUserData();
    const userPoints = userData.points || 0;
    const userTier = userData.tier || 'Bronze';
    
    if (userPointsElement) {
        userPointsElement.textContent = `${userPoints} Points`;
    }
    
    if (pointsProgressElement) {
        const progress = calculateTierProgress(userPoints, userTier);
        pointsProgressElement.style.width = `${progress}%`;
    }
    
    if (tierInfoElement) {
        tierInfoElement.textContent = getTierBenefitsText(userTier);
    }
    
    if (currentBenefitsElement) {
        currentBenefitsElement.innerHTML = getCurrentBenefits(userTier);
    }
    
    updateTierHighlighting(userTier);
    updateClaimableTiers(userPoints);
}

// Calculate tier progress percentage
function calculateTierProgress(points, tier) {
    switch (tier) {
        case 'Bronze':
            return Math.min((points / 100) * 100, 100);
        case 'Silver':
            return Math.min(((points - 100) / 400) * 100, 100);
        case 'Gold':
            return 100;
        default:
            return 0;
    }
}

// Get next tier information
function getNextTierInfo(currentPoints) {
    if (currentPoints < 100) {
        return { nextTier: 'Silver', pointsNeeded: 100 - currentPoints };
    } else if (currentPoints < 500) {
        return { nextTier: 'Gold', pointsNeeded: 500 - currentPoints };
    } else {
        return { nextTier: 'Gold', pointsNeeded: 0 };
    }
}

// Calculate tier based on points
function calculateTier(points) {
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
}

// Get tier benefits text
function getTierBenefitsText(tier) {
    switch (tier) {
        case 'Bronze':
            return 'Earn 1 point per R10 spent • 10% Off Next Purchase';
        case 'Silver':
            return 'Earn 1.25 points per R10 spent • 10% Off + Free Delivery';
        case 'Gold':
            return 'Earn 1.5 points per R10 spent • 10% Off + Free Delivery + Exclusive Drops';
        default:
            return 'Earn 1 point per R10 spent';
    }
}

// Get current benefits HTML
function getCurrentBenefits(tier) {
    const benefits = {
        'Bronze': ['10% Off Next Purchase', 'Early Access to Sales'],
        'Silver': ['10% Off All Purchases', 'Free Delivery', 'Priority Support'],
        'Gold': ['15% Off All Purchases', 'Free Express Delivery', 'Exclusive Product Drops', 'Personal Stylist Access']
    };
    
    const currentBenefits = benefits[tier] || benefits['Bronze'];
    return currentBenefits.map(benefit => `<div class="benefit-item">✓ ${benefit}</div>`).join('');
}

// Update tier highlighting
function updateTierHighlighting(currentTier) {
    const tiers = ['bronze-tier', 'silver-tier', 'gold-tier'];
    
    tiers.forEach(tier => {
        const element = document.getElementById(tier);
        if (element) {
            element.classList.remove('active-tier', 'claimable-tier', 'claimed-tier');
            if (tier === `${currentTier.toLowerCase()}-tier`) {
                element.classList.add('active-tier');
            }
        }
    });
}

// Update claimable tiers
function updateClaimableTiers(points) {
    if (points >= 100) {
        const silverTier = document.getElementById('silver-tier');
        if (silverTier) silverTier.classList.add('claimable-tier');
    }
    if (points >= 500) {
        const goldTier = document.getElementById('gold-tier');
        if (goldTier) goldTier.classList.add('claimable-tier');
    }
}

// Enhanced order history display
function updateOrderHistoryDisplay() {
    const orderHistoryList = document.getElementById('order-history-list');
    if (!orderHistoryList) return;
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        orderHistoryList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <p>Please log in to view your order history and rewards</p>
                <button onclick="showSignUp()" style="
                    background: #f4b400; 
                    color: black; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin-top: 15px;
                    font-weight: bold;
                ">
                    Sign In / Register
                </button>
            </div>
        `;
        return;
    }
    
    const userData = JSON.parse(localStorage.getItem('userData')) || initializeUserData();
    const orderHistory = userData.orderHistory || [];
    
    if (orderHistory.length === 0) {
        orderHistoryList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <p>No orders yet</p>
                <p style="font-size: 14px; margin-top: 10px;">Start shopping to earn rewards!</p>
            </div>
        `;
        return;
    }
    
    orderHistoryList.innerHTML = orderHistory.map(order => `
        <div class="order-history-item">
            <div class="order-header">
                <strong>Order #${order.orderId}</strong>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-details">
                <span>R${order.total?.toFixed(2) || '0.00'}</span>
                ${order.pointsEarned ? `<span class="reward-points">+${order.pointsEarned} pts</span>` : ''}
            </div>
            <div class="order-items">${order.items || 0} items • ${order.status || 'completed'}</div>
        </div>
    `).join('');
}

// Enhanced user authentication functions
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const currentUser = {
            email: user.email,
            name: user.name,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeLogin();
        updateAuthUI();
        updateLoyaltyProgramDisplay();
        updateOrderHistoryDisplay();
        
        // Show welcome back message with points if available
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.points > 0) {
            alert(`Welcome back, ${user.name}! You have ${userData.points} reward points.`);
        } else {
            alert(`Welcome back, ${user.name}!`);
        }
    } else {
        alert('Invalid email or password');
    }
}

function signUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    const newUser = {
        name: name,
        email: email,
        password: password,
        joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize user data for rewards
    const userData = {
        points: 100, // Welcome bonus
        tier: 'Bronze',
        joinDate: new Date().toISOString(),
        orderHistory: [],
        rewardHistory: [{
            type: 'welcome',
            points: 100,
            date: new Date().toISOString(),
            description: 'Welcome bonus'
        }],
        totalSpent: 0
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    
    const currentUser = {
        email: email,
        name: name,
        loggedIn: true,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    closeSignUp();
    updateAuthUI();
    updateLoyaltyProgramDisplay();
    updateOrderHistoryDisplay();
    
    alert(`Welcome to ACIDIC, ${name}! You've received 100 welcome points! 🎉`);
}

// Enhanced auth UI update
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authLink = document.getElementById('auth-link');
    
    if (authLink) {
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const points = userData?.points || 0;
            authLink.innerHTML = `Hi, ${currentUser.name} <small style="color: #f4b400;">(${points} pts)</small>`;
            authLink.onclick = function() {
                if (confirm('Do you want to logout?')) {
                    localStorage.removeItem('currentUser');
                    updateAuthUI();
                    updateLoyaltyProgramDisplay();
                    updateOrderHistoryDisplay();
                    alert('Logged out successfully');
                }
            };
        } else {
            authLink.textContent = 'Sign Up';
            authLink.onclick = showSignUp;
        }
    }
}

// Check if user is logged in
function checkUserLoginStatus() {
    const currentUser = getCurrentUser();
    const isLoggedIn = currentUser && currentUser.loggedIn === true;
    return isLoggedIn;
}

// Get current logged in user
function getCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.loggedIn === true) {
        return currentUser;
    }
    return null;
}

// Add at the top after cart initialization
const CartConfig = {
    STORAGE_KEYS: {
        CURRENT: 'acidicCart',
        LEGACY: 'cart',
        USER_DATA: 'userData',
        CURRENT_USER: 'currentUser',
        USERS: 'users'
    },
    CONSTANTS: {
        DELIVERY_FEE: 150,
        CUSTOMIZATION_FEE: 50,
        MAX_QUANTITY: 99,
        MIN_QUANTITY: 1,
        MAX_QUICK_ADD: 10,
        ANIMATION_DURATION: 300,
        ESCAPE_KEY: 'Escape'
    },
    TIERS: {
        BRONZE: { min: 0, multiplier: 0.1, name: 'Bronze' },
        SILVER: { min: 100, multiplier: 0.125, name: 'Silver' },
        GOLD: { min: 500, multiplier: 0.15, name: 'Gold' }
    },
    COLOR_MAP: {
        'Black': '#000000',
        'White': '#ffffff',
        'Red': '#ff0000',
        'Blue': '#0000ff',
        'Lime': '#00ff00',
        'Cyan': '#00ffff',
        'Cream': '#fffdd0',
        'Green': '#008000',
        'Brown': '#964b00',
        'Pink': '#ffc0cb'
    }
};

// Replace the cart array with a state management object
const CartState = {
    items: JSON.parse(localStorage.getItem(CartConfig.STORAGE_KEYS.CURRENT)) || [],
    
    // Getters
    get count() {
        return this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },
    
    get subtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    get total() {
        return this.subtotal + CartConfig.CONSTANTS.DELIVERY_FEE;
    },
    
    // Methods
    save() {
        localStorage.setItem(CartConfig.STORAGE_KEYS.CURRENT, JSON.stringify(this.items));
        return this;
    },
    
    clear() {
        this.items = [];
        return this.save();
    },
    
    findItem(productId, size, color) {
        return this.items.findIndex(item => 
            item.id === productId && 
            item.size === size && 
            item.color === color
        );
    },
    
    getItem(index) {
        return this.items[index];
    },
    
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            return this.save();
        }
        return false;
    }
};

// Update all cart references to use CartState

class CartUtils {
    static generateVariantId(productId, color = 'default', size = 'M') {
        return `${productId}-${color}-${size}`;
    }
    
    static generateSku(category = 'generic', id) {
        const prefix = category ? category.slice(0, 3).toUpperCase() : 'GEN';
        return `ACID-${prefix}-${Date.now().toString().slice(-6)}`;
    }
    
    static formatPrice(price) {
        return `R${parseFloat(price).toFixed(2)}`;
    }
    
    static validateQuantity(quantity) {
        return quantity >= CartConfig.CONSTANTS.MIN_QUANTITY && 
               quantity <= CartConfig.CONSTANTS.MAX_QUANTITY;
    }
    
    static getColorHex(colorName) {
        return CartConfig.COLOR_MAP[colorName] || '#cccccc';
    }
    
    static needsBorder(colorName) {
        return colorName === 'White' || colorName === 'Cream';
    }
    
    static createProductItem(product, color, size, quantity = 1) {
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image || 'acidic 1.jpg',
            size: size || 'Medium',
            color: color || 'Black',
            quantity: quantity,
            category: product.category,
            variantId: this.generateVariantId(product.id, color, size),
            selectedAt: new Date().toISOString(),
            addedAt: new Date().toISOString(),
            sku: product.sku || this.generateSku(product.category, product.id),
            productId: product.id,
            colorName: color || 'Black',
            sizeCode: size || 'M',
            originalPrice: product.price,
            isCustomized: !!product.customization,
            customization: product.customization || null
        };
    }
}

// Consolidated animation function
function showNotification(message, type = 'success', duration = 2000) {
    const anim = document.createElement('div');
    anim.className = `notification ${type}`;
    anim.innerHTML = `✓ ${message}`;
    anim.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease ${duration}ms forwards;
    `;
    
    document.body.appendChild(anim);
    setTimeout(() => anim.remove(), duration + 300);
}

// Optimized cart item creation
function createCartItemElement(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `cart-item ${item.isCustomized ? 'customized-item' : ''}`;
    itemDiv.dataset.index = index;
    itemDiv.dataset.variantId = item.variantId || '';
    
    const colorDisplay = item.color ? `
        <div class="cart-item-color">
            <span>Color:</span>
            <div class="color-display">
                <div class="color-dot" style="
                    background: ${CartUtils.getColorHex(item.color)}; 
                    ${CartUtils.needsBorder(item.color) ? 'border: 1px solid #ccc' : ''}
                "></div>
                <span class="color-name">${item.color}</span>
            </div>
        </div>
    ` : '';
    
    itemDiv.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" 
                 onerror="this.src='data:image/svg+xml;base64,${btoa('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text></svg>')}'">
            ${item.quantity > 1 ? `<span class="quantity-badge">${item.quantity}</span>` : ''}
        </div>
        <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name} ${item.isCustomized ? '<span class="custom-badge">Custom</span>' : ''}</h4>
            <p class="cart-item-price">${CartUtils.formatPrice(item.price)} each</p>
            <p class="cart-item-total">${CartUtils.formatPrice(item.price * item.quantity)} total</p>
            
            <div class="cart-item-variants">
                ${item.size ? `<div class="cart-item-size"><span>Size:</span><span class="size-value">${item.size}</span></div>` : ''}
                ${colorDisplay}
            </div>
            
            <div class="cart-item-meta">
                ${item.sku ? `<div class="cart-item-sku">SKU: ${item.sku}</div>` : ''}
                ${item.category ? `<div class="cart-item-category">${formatCategory(item.category)}</div>` : ''}
            </div>
            
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" 
                            ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        </div>
        <button class="remove-item" onclick="confirmRemoveItem(${index})" title="Remove item">×</button>
    `;
    
    return itemDiv;
}

// Optimized add to cart with details
function addToCartWithDetails(product, color, size, quantity = 1) {
    if (!CartUtils.validateQuantity(quantity)) {
        showNotification(`Quantity must be between ${CartConfig.CONSTANTS.MIN_QUANTITY} and ${CartConfig.CONSTANTS.MAX_QUANTITY}`, 'error');
        return -1;
    }
    
    const existingIndex = CartState.findItem(product.id, size, color);
    
    if (existingIndex > -1) {
        CartState.items[existingIndex].quantity += quantity;
    } else {
        const newItem = CartUtils.createProductItem(product, color, size, quantity);
        CartState.items.push(newItem);
    }
    
    CartState.save();
    updateCartCount();
    
    // Show success animation
    showNotification(`${quantity} x ${product.name} (${color}, ${size}) added to cart!`);
    
    // Auto-open cart sidebar
    setTimeout(() => toggleCart(true), CartConfig.CONSTANTS.ANIMATION_DURATION);
    
    return existingIndex > -1 ? existingIndex : CartState.items.length - 1;
}

// Optimized load cart items
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (CartState.items.length === 0) {
        cartItemsContainer.innerHTML = createEmptyCartHTML();
        if (cartTotalElement) cartTotalElement.textContent = 'R0';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    CartState.items.forEach((item, index) => {
        cartItemsContainer.appendChild(createCartItemElement(item, index));
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = CartUtils.formatPrice(CartState.total);
    }
}

// Optimized update quantity
function updateQuantity(index, change) {
    const item = CartState.getItem(index);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
        confirmRemoveItem(index);
        return;
    }
    
    if (newQuantity > CartConfig.CONSTANTS.MAX_QUANTITY) {
        showNotification(`Maximum quantity is ${CartConfig.CONSTANTS.MAX_QUANTITY}`, 'error');
        return;
    }
    
    item.quantity = newQuantity;
    CartState.save();
    updateCartCount();
    loadCartItems();
    
    showNotification(`Quantity ${change > 0 ? 'increased' : 'decreased'}`, 'success', 1500);
}

// Add event delegation for cart items
function initCartEventDelegation() {
    document.addEventListener('click', function(e) {
        // Handle quantity buttons
        if (e.target.closest('.quantity-btn')) {
            const btn = e.target.closest('.quantity-btn');
            const cartItem = btn.closest('.cart-item');
            if (cartItem) {
                const index = parseInt(cartItem.dataset.index);
                const change = btn.textContent === '+' ? 1 : -1;
                updateQuantity(index, change);
            }
        }
        
        // Handle remove buttons
        if (e.target.closest('.remove-item')) {
            const btn = e.target.closest('.remove-item');
            const cartItem = btn.closest('.cart-item');
            if (cartItem) {
                const index = parseInt(cartItem.dataset.index);
                confirmRemoveItem(index);
            }
        }
    });
    
    document.addEventListener('input', function(e) {
        if (e.target.id === 'quick-add-qty') {
            const value = parseInt(e.target.value);
            if (!CartUtils.validateQuantity(value)) {
                e.target.value = Math.min(Math.max(value, 1), CartConfig.CONSTANTS.MAX_QUICK_ADD);
            }
        }
    });
}

class ModalManager {
    static modals = new Map();
    
    static register(modalId, openFunc, closeFunc) {
        this.modals.set(modalId, { open: openFunc, close: closeFunc });
    }
    
    static open(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.open();
            this.addEscapeListener(modalId);
        }
    }
    
    static close(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.close();
            this.removeEscapeListener(modalId);
        }
    }
    
    static closeAll() {
        this.modals.forEach((_, id) => this.close(id));
    }
    
    static addEscapeListener(modalId) {
        const handler = (e) => {
            if (e.key === CartConfig.CONSTANTS.ESCAPE_KEY) {
                this.close(modalId);
                document.removeEventListener('keydown', handler);
            }
        };
        document.addEventListener('keydown', handler);
        this.modals.get(modalId).escapeHandler = handler;
    }
    
    static removeEscapeListener(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.escapeHandler) {
            document.removeEventListener('keydown', modal.escapeHandler);
            delete modal.escapeHandler;
        }
    }
}

// Initialize modals
document.addEventListener('DOMContentLoaded', function() {
    ModalManager.register('cart-sidebar', () => toggleCart(true), () => toggleCart(false));
    ModalManager.register('customize-modal', showCustomizeModal, closeCustomize);
    ModalManager.register('checkout-modal', openCheckout, closeCheckout);
    // ... register other modals
});

// Instead of creating style element, load external CSS
function loadCartStyles() {
    if (!document.getElementById('cart-styles')) {
        const link = document.createElement('link');
        link.id = 'cart-styles';
        link.rel = 'stylesheet';
        link.href = 'styles/cart.css'; // External CSS file
        document.head.appendChild(link);
    }
}