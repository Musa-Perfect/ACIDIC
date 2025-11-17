// === CART & CHECKOUT FUNCTIONALITY ===
const cart = [];
const DELIVERY_FEE = 150;
let currentPaymentTotal = 0;

function addSelectedToCart() {
    const size = document.getElementById("size").value;
    const existing = cart.find(
        (i) => i.name === currentItem.name && i.size === size
    );
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            name: currentItem.name,
            price: currentItem.price,
            size,
            qty: 1,
        });
    }
    updateCart();
    toggleCart(true);
    closeModal();
    updateCartCount();
}

function addCustomizationToCart() {
    const size = document.getElementById("size").value;
    const customItem = {
        name: `${currentItem.name} (Custom - ${selectedColor})`,
        price: currentItem.price, // No extra cost for customization
        size,
        qty: 1,
        customizations: {
            color: selectedColor,
        },
    };

    cart.push(customItem);
    updateCart();
    toggleCart(true);
    closeCustomize();
    updateCartCount();
    alert("Custom item added to cart!");
}

// Update addSelectedToCart function to store correct image
function addSelectedToCart() {
    const size = document.getElementById("size").value;
    const existing = cart.find(
        (i) => i.name === currentItem.name && i.size === size
    );
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            name: currentItem.name,
            price: currentItem.price,
            size,
            qty: 1,
            productId: currentItem.id, // Store the product ID
            image: currentItem.img, // Store the exact image from currentItem
            originalProduct: { ...currentItem } // Store full product data for reference
        });
    }
    updateCart();
    toggleCart(true);
    closeModal();
}

// Update addCustomizationToCart function
function addCustomizationToCart() {
    const size = document.getElementById("size").value;
    
    const customItem = {
        name: `${currentItem.name} (Custom - ${selectedColor})`,
        price: currentItem.price,
        size,
        qty: 1,
        productId: currentItem.id,
        image: currentItem.img, // Store original product image
        originalProduct: { ...currentItem }, // Store original product data
        customizations: {
            color: selectedColor,
        },
    };

    cart.push(customItem);
    updateCart();
    toggleCart(true);
    closeCustomize();
    alert("Custom item added to cart!");
}

// Enhanced findProductImage function that prioritizes stored image
function findProductImage(item) {
    // First priority: Use the image stored with the cart item
    if (item.image) {
        return item.image;
    }
    
    // Second priority: Use product ID to find image
    if (item.productId) {
        const product = findProductById(item.productId);
        if (product && product.img) {
            return product.img;
        }
    }
    
    // Third priority: Search by product name
    const productByName = findProductByName(item.name);
    if (productByName && productByName.img) {
        return productByName.img;
    }
    
    // Final fallback
    return "acidic 1.jpg";
}

// Enhanced updateCart function with better image handling
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    let total = 0;
    let totalItems = 0;
    
    // Clear cart items
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M9 19C9 19.6 8.6 20 8 20C7.4 20 7 19.6 7 19C7 18.4 7.4 18 8 18C8.6 18 9 18.4 9 19ZM17 19C17 19.6 16.6 20 16 20C15.4 20 15 19.6 15 19C15 18.4 15.4 18 16 18C16.6 18 17 18.4 17 19Z" 
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Your cart is empty</p>
                <p style="font-size: 14px; margin-top: 10px; color: #999;">Add some products to get started!</p>
            </div>
        `;
    } else {
        // Show cart items with images
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            totalItems += item.qty;
            
            // Get product image - this will now use the stored image
            const productImage = findProductImage(item);
            
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
                <div class="cart-item-image">
                    <img src="${productImage}" alt="${item.name}" onerror="handleCartImageError(this)">
                    ${item.qty > 1 ? `<div class="quantity-badge">${item.qty}</div>` : ''}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">
                        ${item.name}
                        ${item.customizations ? '<span class="customization-badge">CUSTOM</span>' : ''}
                    </div>
                    <div class="cart-item-meta">Size: ${item.size}</div>
                    <div class="cart-item-price">R${item.price * item.qty}</div>
                    <div class="cart-item-unit-price">R${item.price} each</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" onclick="decreaseQuantity(${index})" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.qty}</span>
                    <button class="quantity-btn increase" onclick="increaseQuantity(${index})">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>`;
            cartItems.appendChild(div);
        });
    }
    
    totalEl.textContent = "R" + total;
    updateCartCount();
}

// Add quantity adjustment functions
function increaseQuantity(index) {
    if (index >= 0 && index < cart.length) {
        cart[index].qty++;
        updateCart();
    }
}

function decreaseQuantity(index) {
    if (index >= 0 && index < cart.length && cart[index].qty > 1) {
        cart[index].qty--;
        updateCart();
    }
}

// Update addSelectedToCart function in cart.js
function addSelectedToCart() {
    const size = document.getElementById("size").value;
    const existing = cart.find(
        (i) => i.name === currentItem.name && i.size === size
    );
    
    if (existing) {
        existing.qty++;
    } else {
        // Find the full product to get its ID and ensure we have image
        const fullProduct = findProductByName(currentItem.name);
        
        cart.push({
            name: currentItem.name,
            price: currentItem.price,
            size,
            qty: 1,
            productId: fullProduct?.id, // Store product ID for better lookup
            image: currentItem.img // Store image directly
        });
    }
    updateCart();
    toggleCart(true);
    closeModal();
}

// Update addCustomizationToCart function
function addCustomizationToCart() {
    const size = document.getElementById("size").value;
    
    const customItem = {
        name: `${currentItem.name} (${selectedColorName})`,
        price: currentItem.price,
        size,
        qty: 1,
        productId: currentItem.id,
        image: currentItem.img,
        originalProduct: { ...currentItem },
        customizations: {
            color: selectedColor,
            colorName: selectedColorName
        },
    };

    cart.push(customItem);
    updateCart();
    toggleCart(true);
    closeCustomize();
    alert(`Custom ${selectedColorName} item added to cart!`);
    
    // Reset color selection for next time
    resetColorSelection();
}

// Reset color selection to default
function resetColorSelection() {
    selectedColor = "black";
    selectedColorName = "Black";
    
    // Reset visual selection
    document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("active");
    });
    
    // Set black as active
    const blackOption = document.querySelector('.color-option[data-color="black"]');
    if (blackOption) {
        blackOption.classList.add("active");
    }
    
    // Reset info display
    const colorInfo = document.getElementById("selected-color-info");
    if (colorInfo) {
        colorInfo.innerHTML = `Selected: <strong>Black</strong>`;
    }
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <span>${item.name} (${item.size}) x${item.qty}</span>
            <span>R${item.price * item.qty}</span>
            <button onclick="removeFromCart(${index})">X</button>`;
        cartItems.appendChild(div);
    });
    totalEl.textContent = "R" + total;
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    let total = 0;
    let totalItems = 0;
    
    // Clear cart items
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M9 19C9 19.6 8.6 20 8 20C7.4 20 7 19.6 7 19C7 18.4 7.4 18 8 18C8.6 18 9 18.4 9 19ZM17 19C17 19.6 16.6 20 16 20C15.4 20 15 19.6 15 19C15 18.4 15.4 18 16 18C16.6 18 17 18.4 17 19Z" 
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Your cart is empty</p>
                <p style="font-size: 14px; margin-top: 10px; color: #999;">Add some products to get started!</p>
            </div>
        `;
    } else {
        // Show cart items with images
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            totalItems += item.qty;
            
            // Get product image - use multiple fallback methods
            const productImage = getCartItemImage(item);
            
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
                <div class="cart-item-image">
                    <img src="${productImage}" alt="${item.name}" onerror="handleCartImageError(this)">
                    ${item.qty > 1 ? `<div class="quantity-badge">${item.qty}</div>` : ''}
                    ${item.customizations ? `<div class="color-indicator" style="background: ${getColorCode(item.customizations.color)}"></div>` : ''}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">
                        ${item.name}
                        ${item.customizations ? `<span class="customization-badge">CUSTOM</span>` : ''}
                    </div>
                    <div class="cart-item-meta">
                        Size: ${item.size}
                        ${item.customizations && item.customizations.colorName ? `• Color: ${item.customizations.colorName}` : ''}
                    </div>
                    <div class="cart-item-price">R${item.price * item.qty}</div>
                    <div class="cart-item-unit-price">R${item.price} each</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" onclick="decreaseQuantity(${index})" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.qty}</span>
                    <button class="quantity-btn increase" onclick="increaseQuantity(${index})">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>`;
            cartItems.appendChild(div);
        });
    }
    
    totalEl.textContent = "R" + total;
    updateCartCount();
    saveCartToStorage(); // Save to localStorage
}

// Enhanced image lookup for cart items
function getCartItemImage(item) {
    console.log("Looking up image for:", item);
    
    // 1. First try: Use directly stored image
    if (item.image) {
        console.log("Using stored image:", item.image);
        return item.image;
    }
    
    // 2. Second try: Use product ID to find image
    if (item.productId) {
        const product = findProductById(item.productId);
        if (product && product.img) {
            console.log("Found image by product ID:", product.img);
            return product.img;
        }
    }
    
    // 3. Third try: Search by product name (clean name first)
    const cleanName = item.name.replace(/\s*\([^)]*\)/g, '').trim(); // Remove anything in parentheses
    const productByName = findProductByName(cleanName);
    if (productByName && productByName.img) {
        console.log("Found image by cleaned name:", productByName.img);
        return productByName.img;
    }
    
    // 4. Fourth try: Search by original name
    const productByOriginalName = findProductByName(item.name);
    if (productByOriginalName && productByOriginalName.img) {
        console.log("Found image by original name:", productByOriginalName.img);
        return productByOriginalName.img;
    }
    
    // 5. Final fallback
    console.log("Using fallback image");
    return "acidic 1.jpg";
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    cartItems.innerHTML = "";
    let total = 0;
    let totalItems = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        totalItems += item.qty;
        
        // Find the product image
        const productImage = findProductImage(item.name);
        
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <div class="cart-item-image">
                <img src="${productImage}" alt="${item.name}" onerror="handleCartImageError(this)">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">Size: ${item.size} • Qty: ${item.qty}</div>
                <div class="cart-item-price">R${item.price * item.qty}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>`;
        cartItems.appendChild(div);
    });
    
    totalEl.textContent = "R" + total;
    updateCartCount();
}

// Function to find product image by name
function findProductImage(productName) {
    // Search through all product categories
    for (const category in products) {
        const product = products[category].find(p => p.name === productName);
        if (product) {
            return product.img;
        }
    }
    // Fallback image if not found
    return "acidic 1.jpg";
}

// Handle image errors in cart
function handleCartImageError(img) {
    console.log("Cart image failed to load:", img.src);
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCart();
        updateCartCount();
    }
}

function toggleCart(show) {
    document.getElementById("cart-sidebar").classList.toggle("active", show);
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    toggleCart(false);
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const finalTotal = applyRewardsBenefits(subtotal + DELIVERY_FEE);
    document.getElementById("final-total").textContent = "R" + finalTotal;
    document.getElementById("checkout-modal").classList.add("active");
}

function closeCheckout() {
    document.getElementById("checkout-modal").classList.remove("active");
}

// Enhanced validation for checkout form
function validateCheckoutForm() {
    const fields = [
        {
            id: "country",
            errorId: "country-error",
            validator: (value) => value.trim().length > 0,
        },
        {
            id: "fname",
            errorId: "fname-error",
            validator: (value) => value.trim().length > 0,
        },
        {
            id: "lname",
            errorId: "lname-error",
            validator: (value) => value.trim().length > 0,
        },
        {
            id: "address",
            errorId: "address-error",
            validator: (value) => value.trim().length > 5,
        },
        {
            id: "city",
            errorId: "city-error",
            validator: (value) => value.trim().length > 0,
        },
        {
            id: "province",
            errorId: "province-error",
            validator: (value) => value.trim().length > 0,
        },
        {
            id: "postal",
            errorId: "postal-error",
            validator: (value) => /^[0-9]{4,10}$/.test(value),
        },
        {
            id: "phone",
            errorId: "phone-error",
            validator: (value) => /^[0-9+\-\s]{10,15}$/.test(value),
        },
        {
            id: "email",
            errorId: "email-error",
            validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        },
    ];

    let isValid = true;

    // Reset all error states
    fields.forEach((field) => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        input.classList.remove("error");
        error.style.display = "none";
    });

    // Validate each field
    fields.forEach((field) => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);
        const value = input.value.trim();

        if (!field.validator(value)) {
            input.classList.add("error");
            error.style.display = "block";
            isValid = false;

            // Focus on first invalid field
            if (isValid === false) {
                input.focus();
                isValid = null; // Prevent multiple focus calls
            }
        }
    });

    if (isValid) {
        proceedToPayment();
    } else {
        alert("Please correct the errors in the form before proceeding.");
    }
}

function proceedToPayment() {
    // Calculate total for payment
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    currentPaymentTotal = applyRewardsBenefits(subtotal + DELIVERY_FEE);

    // Update payment modal with order details
    document.getElementById("payment-amount").textContent = "R" + currentPaymentTotal;
    document.getElementById("payment-total").textContent = "R" + currentPaymentTotal;

    const paymentOrderItems = document.getElementById("payment-order-items");
    paymentOrderItems.innerHTML = "";

    cart.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("order-item");
        itemDiv.innerHTML = `
            <span>${item.name} (${item.size}) x${item.qty}</span>
            <span>R${item.price * item.qty}</span>`;
        paymentOrderItems.appendChild(itemDiv);
    });

    // Add delivery fee if applicable
    if (DELIVERY_FEE > 0 && !currentUser?.benefits?.freeDelivery) {
        const deliveryDiv = document.createElement("div");
        deliveryDiv.classList.add("order-item");
        deliveryDiv.innerHTML = `
            <span>Delivery Fee</span>
            <span>R${DELIVERY_FEE}</span>`;
        paymentOrderItems.appendChild(deliveryDiv);
    }

    // Close checkout and open payment modal
    closeCheckout();
    document.getElementById("payment-modal").classList.add("active");
}

function closePayment() {
    document.getElementById("payment-modal").classList.remove("active");
}

function processPayment() {
    // Validate payment form
const result = updateUserRewards(currentPaymentTotal);
const pointsEarned = result.pointsEarned;
    const cardholderName = document.getElementById("cardholder_name").value;
    const cardNumber = document.getElementById("card_number").value;
    const expiryDate = document.getElementById("expiry_date").value;
    const cvv = document.getElementById("cvv").value;

    if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
        alert("Please fill out all payment details.");
        return;
    }

    // Validate card number length
    if (cardNumber.length < 16) {
        alert("Please enter a valid 16-digit card number.");
        return;
    }

    // Validate CVV length
    if (cvv.length < 3) {
        alert("Please enter a valid CVV (3 digits).");
        return;
    }

    // Get shipping address for confirmation
    const address = getShippingAddress();

    // Process payment (simulated)
    showProcessingAnimation();

    // Simulate payment processing delay
    setTimeout(() => {
        // Update user rewards
        const pointsEarned = updateUserRewards(currentPaymentTotal);

        // Show confirmation modal
        showConfirmation(currentPaymentTotal, pointsEarned, address);

        // Reset payment form
        document.getElementById("cardholder_name").value = "";
        document.getElementById("card_number").value = "";
        document.getElementById("expiry_date").value = "";
        document.getElementById("cvv").value = "";

        // Update rewards display
        displayUserRewards();
    }, 2000); // 2 second processing delay
       // Simulate payment processing
    showProcessingAnimation();

    setTimeout(() => {
        // For demo purposes, randomly succeed or fail
        const isSuccess = Math.random() > 0.3; // 70% success rate for demo
        
        if (isSuccess) {
            // Successful payment
            const pointsEarned = updateUserRewards(currentPaymentTotal);
            
            // Clear cart
            cart.length = 0;
            updateCart();
            localStorage.removeItem('acidicCart');
            
            // Redirect to success page
            window.location.href = 'success.html';
        } else {
            // Failed payment - redirect to cancel page
            window.location.href = 'cancel.html';
        }
    }, 2000);
}

// Add function to handle successful payments
function handleSuccessfulPayment(orderTotal, pointsEarned) {
    // Update user rewards
    updateUserRewards(orderTotal);
    
    // Clear cart
    cart.length = 0;
    updateCart();
    localStorage.removeItem('acidicCart');
    
    // Redirect to success page
    window.location.href = 'success.html';
}

// Get formatted shipping address
function getShippingAddress() {
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const province = document.getElementById("province").value;
    const postal = document.getElementById("postal").value;

    return `${address}, ${city}, ${province} ${postal}`;
}

// Show processing animation
function showProcessingAnimation() {
    // In a real implementation, you'd show a loading spinner
    // For now, we'll just disable the payment button
    const payButton = document.querySelector(".purchase--btn");
    const originalText = payButton.innerHTML;

    payButton.innerHTML = "Processing...";
    payButton.disabled = true;

    // Re-enable after processing (in case of error)
    setTimeout(() => {
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    }, 3000);
}

// Payment confirmation functions
function showConfirmation(orderTotal, pointsEarned, address) {
    // Populate order items
    const confirmationItems = document.getElementById("confirmation-order-items");
    confirmationItems.innerHTML = "";

    cart.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "confirmation-order-item";
        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 12px; color: #666;">Size: ${item.size} × ${item.qty}</div>
            </div>
            <div>R${item.price * item.qty}</div>
        `;
        confirmationItems.appendChild(itemDiv);
    });

    // Add delivery fee if applicable
    if (DELIVERY_FEE > 0 && !currentUser?.benefits?.freeDelivery) {
        const deliveryDiv = document.createElement("div");
        deliveryDiv.className = "confirmation-order-item";
        deliveryDiv.innerHTML = `
            <div>Delivery Fee</div>
            <div>R${DELIVERY_FEE}</div>
        `;
        confirmationItems.appendChild(deliveryDiv);
    }

    // Set totals and details
    document.getElementById("confirmation-total").textContent = `R${orderTotal}`;
    document.getElementById("confirmation-address").textContent = address;

    // Show rewards if earned
    if (pointsEarned > 0 && currentUser) {
        document.getElementById("rewards-earned-section").style.display = "block";
        document.getElementById("points-earned").textContent = pointsEarned;
        document.getElementById("total-points").textContent = currentUser.points;

        // Show tier progress
        const nextTier = currentUser.rewardTier === "Bronze" ? "Silver" : currentUser.rewardTier === "Silver" ? "Gold" : null;

        if (nextTier) {
            const nextThreshold = rewardTiers[nextTier].threshold;
            const pointsNeeded = nextThreshold - currentUser.points;
            document.getElementById("tier-progress").textContent = `${pointsNeeded} points to reach ${nextTier} Tier`;
        } else {
            document.getElementById("tier-progress").textContent = "You've reached the highest tier!";
        }
    } else {
        document.getElementById("rewards-earned-section").style.display = "none";
    }

    // Show confirmation modal
    closePayment();
    document.getElementById("confirmation-modal").classList.add("active");
    
// Update confirmation modal to show points
document.getElementById("points-earned").textContent = pointsEarned;
document.getElementById("total-points").textContent = currentUser.points;

    // Generate order confirmation email (simulated)
    generateOrderConfirmationEmail(orderTotal);
}

function closeConfirmation() {
    document.getElementById("confirmation-modal").classList.remove("active");
    // Clear cart and return to shopping
    cart.length = 0;
    updateCart();
    showMainContent();
}

function trackOrder() {
    const trackingNumber = document.getElementById("tracking-number").textContent;
    alert(
        `Tracking your order: ${trackingNumber}\n\nYour order is being processed and will ship within 24 hours. You'll receive an email with tracking updates.`
    );
}

function contactSupport() {
    alert(
        "Contact our support team:\n📧 support@acidic.com\n📞 0665-ACIDIC (066-532-8795)\n\nWe're here to help with any questions about your order!"
    );
}

function generateOrderConfirmationEmail(orderTotal) {
    if (!currentUser) return;

    const orderDetails = {
        orderNumber: `CAT-YYMMDD-XXX`,
        customer: currentUser.name,
        email: currentUser.email,
        total: orderTotal,
        items: cart.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: item.qty,
            price: item.price,
        })),
        timestamp: new Date().toLocaleString(),
    };

    // In a real implementation, this would send an actual email
    console.log("Order confirmation email generated:", orderDetails);

    // Simulate email sending
    setTimeout(() => {
        if (Math.random() > 0.1) {
            // 90% success rate for demo
            console.log("📧 Order confirmation email sent to:", currentUser.email);
        } else {
            console.log("⚠️ Email service temporarily unavailable");
        }
    }, 2000);
}

function redirectToSuccess(orderTotal, pointsEarned) {
    const orderNumber = generateOrderNumber();
    const params = new URLSearchParams({
        order: orderNumber,
        total: orderTotal,
        points: pointsEarned
    });
    window.location.href = `success.html?${params.toString()}`;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((total, item) => total + item.qty, 0);
    cartCount.textContent = totalItems;
    
    // Add animation when count changes
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
        cartCount.classList.add('bounce');
        setTimeout(() => cartCount.classList.remove('bounce'), 500);
    } else {
        cartCount.style.display = 'flex'; // Always show, even when 0
    }
    // Enhanced cart count update with animation
    
    // Update count with animation
    if (parseInt(cartCount.textContent) !== totalItems) {
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.classList.add('pulse');
            setTimeout(() => cartCount.classList.remove('pulse'), 600);
        }
    }
    
    // Show/hide based on item count
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

// Update both cart display and cart count
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    cartItems.innerHTML = "";
    let total = 0;
    let totalItems = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        totalItems += item.qty;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <span>${item.name} (${item.size}) x${item.qty}</span>
            <span>R${item.price * item.qty}</span>
            <button onclick="removeFromCart(${index})">X</button>`;
        cartItems.appendChild(div);
    });
    
    totalEl.textContent = "R" + total;
    updateCartCount(); // Update the cart icon count
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    let total = 0;
    let totalItems = 0;
    
    // Clear cart items
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M9 19C9 19.6 8.6 20 8 20C7.4 20 7 19.6 7 19C7 18.4 7.4 18 8 18C8.6 18 9 18.4 9 19ZM17 19C17 19.6 16.6 20 16 20C15.4 20 15 19.6 15 19C15 18.4 15.4 18 16 18C16.6 18 17 18.4 17 19Z" 
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Your cart is empty</p>
                <p style="font-size: 14px; margin-top: 10px; color: #999;">Add some products to get started!</p>
            </div>
        `;
    } else {
        // Show cart items with images
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            totalItems += item.qty;
            
            // Get product image - use multiple fallback methods
            const productImage = getCartItemImage(item);
            
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
                <div class="cart-item-image">
                    <img src="${productImage}" alt="${item.name}" onerror="handleCartImageError(this)">
                    ${item.qty > 1 ? `<div class="quantity-badge">${item.qty}</div>` : ''}
                    ${item.customizations ? `<div class="color-indicator" style="background: ${getColorCode(item.customizations.color)}"></div>` : ''}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">
                        ${item.name}
                        ${item.customizations ? `<span class="customization-badge">CUSTOM</span>` : ''}
                    </div>
                    <div class="cart-item-meta">
                        Size: ${item.size}
                        ${item.customizations && item.customizations.colorName ? `• Color: ${item.customizations.colorName}` : ''}
                    </div>
                    <div class="cart-item-price">R${item.price * item.qty}</div>
                    <div class="cart-item-unit-price">R${item.price} each</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" onclick="decreaseQuantity(${index})" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.qty}</span>
                    <button class="quantity-btn increase" onclick="increaseQuantity(${index})">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>`;
            cartItems.appendChild(div);
        });
    }
    
    totalEl.textContent = "R" + total;
    updateCartCount();
    saveCartToStorage(); // Save to localStorage
}

// Enhanced image lookup for cart items
function getCartItemImage(item) {
    console.log("Looking up image for:", item);
    
    // 1. First try: Use directly stored image
    if (item.image) {
        console.log("Using stored image:", item.image);
        return item.image;
    }
    
    // 2. Second try: Use product ID to find image
    if (item.productId) {
        const product = findProductById(item.productId);
        if (product && product.img) {
            console.log("Found image by product ID:", product.img);
            return product.img;
        }
    }
    
    // 3. Third try: Search by product name (clean name first)
    const cleanName = item.name.replace(/\s*\([^)]*\)/g, '').trim(); // Remove anything in parentheses
    const productByName = findProductByName(cleanName);
    if (productByName && productByName.img) {
        console.log("Found image by cleaned name:", productByName.img);
        return productByName.img;
    }
    
    // 4. Fourth try: Search by original name
    const productByOriginalName = findProductByName(item.name);
    if (productByOriginalName && productByOriginalName.img) {
        console.log("Found image by original name:", productByOriginalName.img);
        return productByOriginalName.img;
    }
    
    // 5. Final fallback
    console.log("Using fallback image");
    return "acidic 1.jpg";
}

// Initialize cart count on page load
function initializeCartIcon() {
    updateCartCount();
}

// Make sure to call initializeCartIcon when the page loads

// Debug function to check cart contents
function debugCart() {
    console.log("Current cart contents:");
    cart.forEach((item, index) => {
        console.log(`Item ${index}:`, {
            name: item.name,
            productId: item.productId,
            image: item.image,
            storedImage: item.image,
            foundImage: findProductImage(item)
        });
    });
}

// Call this in your add to cart functions temporarily to verify
function addSelectedToCart() {
    const size = document.getElementById("size").value;
    
    // Check if item already exists in cart
    const existingIndex = cart.findIndex(
        item => item.name === currentItem.name && item.size === size
    );
    
    if (existingIndex !== -1) {
        // Update quantity if item exists
        cart[existingIndex].qty++;
    } else {
        // Add new item to cart with proper image reference
        const cartItem = {
            name: currentItem.name,
            price: currentItem.price,
            size: size,
            qty: 1,
            productId: currentItem.id,
            image: currentItem.img // Store the image directly
        };
        
        console.log("Adding to cart:", cartItem);
        cart.push(cartItem);
    }
    
    updateCart();
    toggleCart(true);
    closeModal();
}

function addCustomizationToCart() {
    const size = document.getElementById("size").value;
    
    const customItem = {
        name: `${currentItem.name} (${selectedColorName})`,
        price: currentItem.price,
        size: size,
        qty: 1,
        productId: currentItem.id,
        image: currentItem.img, // Store original product image
        customizations: {
            color: selectedColor,
            colorName: selectedColorName
        }
    };

    console.log("Adding customized item to cart:", customItem);
    cart.push(customItem);
    updateCart();
    toggleCart(true);
    closeCustomize();
    alert(`Custom ${selectedColorName} item added to cart!`);
    
    // Reset color selection for next time
    resetColorSelection();
}

function handleCartImageError(img) {
    console.warn("Cart image failed to load:", img.src);
    
    // Try multiple fallback strategies
    const cartItem = img.closest('.cart-item');
    if (cartItem) {
        const itemName = cartItem.querySelector('.cart-item-name').textContent;
        console.log("Attempting to find alternative image for:", itemName);
        
        // Try to find the product
        const product = findProductByName(itemName);
        if (product && product.img) {
            img.src = product.img;
            console.log("Loaded alternative image:", product.img);
            return;
        }
    }
    
    // Ultimate fallback
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
    console.log("Using ultimate fallback image");
    }
    
    // Ultimate fallback
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
    console.log("Using fallback image");

// In the updateCart function, update the cart item HTML:
const div = document.createElement("div");
div.classList.add("cart-item");
div.innerHTML = `
    <div class="cart-item-image">
        <img src="${productImage}" alt="${item.name}" onerror="handleCartImageError(this)">
        ${item.qty > 1 ? `<div class="quantity-badge">${item.qty}</div>` : ''}
        ${item.customizations ? `<div class="color-indicator" style="background: ${getColorCode(item.customizations.color)}"></div>` : ''}
    </div>
    <div class="cart-item-details">
        <div class="cart-item-name">
            ${item.name}
            ${item.customizations ? `<span class="customization-badge">CUSTOM</span>` : ''}
        </div>
        <div class="cart-item-meta">
            Size: ${item.size}
            ${item.customizations ? `• Color: ${item.customizations.colorName || item.customizations.color}` : ''}
        </div>
        <div class="cart-item-price">R${item.price * item.qty}</div>
        <div class="cart-item-unit-price">R${item.price} each</div>
    </div>
    <div class="cart-item-actions">
        <button class="quantity-btn decrease" onclick="decreaseQuantity(${index})" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
        <span class="quantity-display">${item.qty}</span>
        <button class="quantity-btn increase" onclick="increaseQuantity(${index})">+</button>
        <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>`;

    // Helper function to get color code from color name
function getColorCode(colorName) {
    const colorMap = {
        'black': '#000000',
        'white': '#ffffff', 
        'gold': '#f4b400',
        'red': '#ff0000',
        'blue': '#0000ff'
    };
    return colorMap[colorName] || colorName;
}

// Helper function to get color name from color code
function getColorName(colorCode) {
    const colorMap = {
        '#000000': 'Black',
        '#000': 'Black',
        '#ffffff': 'White', 
        '#fff': 'White',
        '#f4b400': 'Gold',
        '#ff0000': 'Red',
        '#0000ff': 'Royal Blue'
    };
    return colorMap[colorCode] || colorCode;
}

// Enhanced product lookup functions
function findProductById(productId) {
    if (!productId) return null;
    
    // Search through all categories
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) {
            return product;
        }
    }
    return null;
}

function findProductByName(productName) {
    if (!productName) return null;
    
    // Clean the product name for better matching
    const cleanName = productName
        .replace(/\s*\([^)]*\)/g, '') // Remove anything in parentheses
        .replace(/\s*\-[^-]*$/g, '')  // Remove anything after last hyphen
        .trim();
    
    console.log("Searching for product:", cleanName);
    
    // Search through all categories
    for (const category in products) {
        const product = products[category].find(p => {
            const productCleanName = p.name
                .replace(/\s*\([^)]*\)/g, '')
                .replace(/\s*\-[^-]*$/g, '')
                .trim();
                
            return productCleanName === cleanName || p.name === productName;
        });
        
        if (product) {
            console.log("Found product:", product);
            return product;
        }
    }
    return null;
}

// Debug function to check cart state
function debugCart() {
    console.log("=== CART DEBUG ===");
    console.log("Cart items:", cart);
    console.log("Products data:", products);
    
    cart.forEach((item, index) => {
        console.log(`Item ${index}:`, {
            name: item.name,
            productId: item.productId,
            storedImage: item.image,
            foundImage: getCartItemImage(item)
        });
    });
    console.log("=== END DEBUG ===");
}

// Call this in your add to cart functions temporarily
// debugCart();

function addToCartSystem(product, quantity = 1, size = 'Medium') {
    // Your existing cart logic here
    let cart = JSON.parse(localStorage.getItem('acidic-cart')) || [];
    
    const existingItem = cart.find(item => item.id === product.id && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }
    
    localStorage.setItem('acidic-cart', JSON.stringify(cart));
    updateCartDisplay();
}