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
    alert("Custom item added to cart!");
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

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCart();
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