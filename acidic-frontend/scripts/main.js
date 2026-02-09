// === MAIN APPLICATION LOGIC ===

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showCategory("tshirts");
    updateAuthLink();
});

// === HERO SLIDESHOW ===
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".slideshow-dot");
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    if (slides[index]) {
        slides[index].classList.add("active");
    }
    if (dots[index]) {
        dots[index].classList.add("active");
    }
    currentSlide = index;
    resetSlideInterval();
}

function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
}

function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
        showSlide(index);
    }
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000);
}

resetSlideInterval();

// === DARK MODE TOGGLE ===
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode")
    );
}

// Load preference on page load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// === INNOVATIVE FEATURES ===

// AI Stylist
function showAIStylist() {
    hideAllSections();
    document.getElementById("ai-stylist-section").style.display = "block";
    resetQuiz();
}

function resetQuiz() {
    document.getElementById("quiz-step-1").style.display = "block";
    document.getElementById("quiz-step-2").style.display = "none";
    document.getElementById("quiz-step-3").style.display = "none";
    document.getElementById("ai-recommendations").innerHTML = "";
}

function nextQuizStep(step, choice) {
    if (step === 1) {
        document.getElementById("quiz-step-1").style.display = "none";
        document.getElementById("quiz-step-2").style.display = "block";
    } else if (step === 2) {
        document.getElementById("quiz-step-2").style.display = "none";
        document.getElementById("quiz-step-3").style.display = "block";
    }
}

function generateRecommendations() {
    const recommendations = document.getElementById("ai-recommendations");
    recommendations.innerHTML = "<h3>Recommended For You</h3>";

    // Generate some recommendations based on "user preferences"
    const recommendedItems = [
        products.tshirts[0],
        products.hoodies[0],
        products.pants[0],
        products.accessories[0],
    ];

    recommendedItems.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}" onerror="handleImageError(this)">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p>R${item.price}</p>
                <button class="add-to-cart" onclick="openModal(${JSON.stringify(item).replace(/"/g, "&quot;")})">View Details</button>
            </div>`;
        recommendations.appendChild(div);
    });

    document.getElementById("quiz-step-3").style.display = "none";
}

// Virtual Try-On
function showVirtualTryOn() {
    hideAllSections();
    document.getElementById("virtual-tryon").style.display = "block";
}

function startWebcam() {
    alert(
        "Virtual try-on would use your camera to show how items look on you. For this demo, we're simulating the experience."
    );
    // In a real implementation, this would access the user's webcam
}

function tryOnProduct(type) {
    alert(
        `Trying on ${type}. In a full implementation, this would use AR to show the item on you.`
    );
}

// Sustainability
function showSustainability() {
    hideAllSections();
    document.getElementById("sustainability").style.display = "block";

    // Animate the stats
    animateValue("water-saved", 0, 12450, 2000);
    animateValue("co2-saved", 0, 2840, 2000);
    animateValue("items-upcycled", 0, 1250, 2000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML =
            value.toLocaleString() +
            (id === "water-saved" ? "L" : id === "co2-saved" ? "kg" : "");
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Community
function showCommunity() {
    hideAllSections();
    document.getElementById("community").style.display = "block";
}

function uploadStyle() {
    alert(
        "In a full implementation, this would allow you to upload photos of yourself wearing ACIDIC clothing to share with the community."
    );
}

// Loyalty Program
function showLoyaltyProgram() {
    hideAllSections();
    document.getElementById("loyalty-program").style.display = "block";
    if (currentUser) {
        displayUserRewards();
    }
}

// Outfit Builder
let currentOutfit = { top: null, bottom: null, accessory: null };

function showOutfitBuilder() {
    hideAllSections();
    document.getElementById("outfit-builder").style.display = "block";
    showOutfitCategory("tshirts");
}

function showOutfitCategory(category) {
    const outfitProducts = document.getElementById("outfit-products");
    outfitProducts.innerHTML = "";

    if (products[category]) {
        products[category].forEach((item) => {
            const div = document.createElement("div");
            div.classList.add("outfit-product");
            div.innerHTML = `
                <img src="${item.img}" alt="${item.name}" onerror="handleImageError(this)">
                <div>
                    <h4>${item.name}</h4>
                    <p>R${item.price}</p>
                </div>`;
            div.onclick = () => addToOutfit(category, item);
            outfitProducts.appendChild(div);
        });
    }
}

function addToOutfit(category, item) {
    if (category === "tshirts" || category === "sweaters" || category === "hoodies") {
        currentOutfit.top = item;
        document.getElementById("top-layer").innerHTML = `
            <img src="${item.img}" alt="${item.name}" style="max-width: 200px;" onerror="handleImageError(this)">
            <h4>${item.name}</h4><p>R${item.price}</p>`;
        document.getElementById("bottom-layer").style.display = "block";
    } else if (category === "pants") {
        currentOutfit.bottom = item;
        document.getElementById("bottom-layer").innerHTML = `
            <img src="${item.img}" alt="${item.name}" style="max-width: 200px;" onerror="handleImageError(this)">
            <h4>${item.name}</h4><p>R${item.price}</p>`;
        document.getElementById("accessory-layer").style.display = "block";
    } else if (category === "accessories") {
        currentOutfit.accessory = item;
        document.getElementById("accessory-layer").innerHTML = `
            <img src="${item.img}" alt="${item.name}" style="max-width: 100px;" onerror="handleImageError(this)">
            <h4>${item.name}</h4><p>R${item.price}</p>`;
    }
}

function addOutfitToCart() {
    if (currentOutfit.top) {
        const size = "Medium"; // Default size for outfit items
        cart.push({
            name: currentOutfit.top.name + " (Outfit)",
            price: currentOutfit.top.price,
            size,
            qty: 1,
        });
    }
    if (currentOutfit.bottom) {
        const size = "Medium"; // Default size for outfit items
        cart.push({
            name: currentOutfit.bottom.name + " (Outfit)",
            price: currentOutfit.bottom.price,
            size,
            qty: 1,
        });
    }
    if (currentOutfit.accessory) {
        cart.push({
            name: currentOutfit.accessory.name + " (Outfit)",
            price: currentOutfit.accessory.price,
            size: "One Size",
            qty: 1,
        });
    }

    if (currentOutfit.top || currentOutfit.bottom || currentOutfit.accessory) {
        updateCart();
        toggleCart(true);
        alert("Outfit added to cart!");
    } else {
        alert("Please add at least one item to your outfit.");
    }
}

// Utility function to hide all sections
function hideAllSections() {
    document.getElementById("main-content").style.display = "none";
    document.getElementById("product-section").style.display = "none";
    document.getElementById("ai-stylist-section").style.display = "none";
    document.getElementById("virtual-tryon").style.display = "none";
    document.getElementById("sustainability").style.display = "none";
    document.getElementById("community").style.display = "none";
    document.getElementById("loyalty-program").style.display = "none";
    document.getElementById("outfit-builder").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "none";
}

// Fullscreen Background Slideshow Functionality
let currentBackgroundSlide = 0;
let backgroundSlideInterval;
const backgroundSlides = document.querySelectorAll('.background-slide');
const totalBackgroundSlides = backgroundSlides.length;

// Initialize background slideshow
function initBackgroundSlideshow() {
    if (backgroundSlides.length === 0) return;
    
    startBackgroundSlideshow();
    updateBackgroundSlideshowDots();
    goToBackgroundSlide(0);
}

// Start automatic background slideshow
function startBackgroundSlideshow() {
    clearInterval(backgroundSlideInterval);
    backgroundSlideInterval = setInterval(() => {
        nextBackgroundSlide();
    }, 4000); // Change slide every 4 seconds
}

// Go to specific background slide
function goToBackgroundSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= totalBackgroundSlides) return;
    
    // Remove active class from all slides
    backgroundSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Add active class to current slide
    backgroundSlides[slideIndex].classList.add('active');
    currentBackgroundSlide = slideIndex;
    
    // Update slideshow dots
    updateBackgroundSlideshowDots();
    
    // Restart slideshow timer
    startBackgroundSlideshow();
}

// Next background slide
function nextBackgroundSlide() {
    let nextSlideIndex = currentBackgroundSlide + 1;
    if (nextSlideIndex >= totalBackgroundSlides) {
        nextSlideIndex = 0;
    }
    goToBackgroundSlide(nextSlideIndex);
}

// Previous background slide
function prevBackgroundSlide() {
    let prevSlideIndex = currentBackgroundSlide - 1;
    if (prevSlideIndex < 0) {
        prevSlideIndex = totalBackgroundSlides - 1;
    }
    goToBackgroundSlide(prevSlideIndex);
}

// Update background slideshow dots
function updateBackgroundSlideshowDots() {
    const dots = document.querySelectorAll('.slideshow-dot');
    dots.forEach((dot, index) => {
        if (index === currentBackgroundSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initBackgroundSlideshow();
});

// Payment Processing System
let paymentAttempts = 0;
const MAX_PAYMENT_ATTEMPTS = 3;
let currentPaymentAmount = 0;

// Initialize payment system
function initPaymentSystem() {
    console.log('Payment system initialized');
    
    // Add test card data for easier testing
    if (!localStorage.getItem('testCards')) {
        localStorage.setItem('testCards', JSON.stringify([
            { number: '4111111111111111', type: 'visa', success: true },
            { number: '4242424242424242', type: 'visa', success: true },
            { number: '5555555555554444', type: 'mastercard', success: true },
            { number: '378282246310005', type: 'amex', success: true },
            { number: '6011111111111117', type: 'discover', success: true },
            { number: '4000000000000002', type: 'visa', success: false, error: 'Card declined' },
            { number: '4000000000009995', type: 'visa', success: false, error: 'Insufficient funds' }
        ]));
    }
    
    // Load saved payment attempts
    const savedAttempts = localStorage.getItem('paymentAttempts');
    if (savedAttempts) {
        paymentAttempts = parseInt(savedAttempts);
    }
}

// Process payment when form is submitted
function processPayment(event) {
    if (event) event.preventDefault();
    
    console.log('Processing payment...');
    
    // Get form data
    const cardholderName = document.getElementById('cardholder_name').value;
    const cardNumber = document.getElementById('card_number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry_date').value;
    const cvv = document.getElementById('cvv').value;
    
    // Validate form
    if (!validatePaymentForm(cardholderName, cardNumber, expiryDate, cvv)) {
        console.log('Payment form validation failed');
        return false;
    }
    
    // Show loading overlay
    showPaymentLoading(true);
    
    // Get cart total
    const subtotal = calculateCartSubtotal();
    currentPaymentAmount = subtotal + 150; // Add delivery fee
    
    console.log('Processing payment of R' + currentPaymentAmount);
    
    // Simulate API call with 2-second delay
    setTimeout(() => {
        const paymentResult = processPaymentTransaction(cardNumber, expiryDate, cvv, currentPaymentAmount);
        
        // Hide loading
        showPaymentLoading(false);
        
        if (paymentResult.success) {
            handleSuccessfulPayment(paymentResult);
        } else {
            handleFailedPayment(paymentResult);
        }
    }, 2000);
    
    return false;
}

// Validate payment form
function validatePaymentForm(name, cardNumber, expiry, cvv) {
    console.log('Validating payment form...');
    
    // Reset all errors
    document.querySelectorAll('.payment-error').forEach(el => {
        el.classList.remove('show');
    });
    document.querySelectorAll('.input_field').forEach(el => {
        el.classList.remove('error');
    });
    
    let isValid = true;
    
    // Validate cardholder name
    if (!name || name.trim().length < 3) {
        showFieldError('cardholder_name', 'Please enter your full name');
        isValid = false;
    }
    
    // Validate card number (basic Luhn check)
    if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        showFieldError('card_number', 'Please enter a valid 16-digit card number');
        isValid = false;
    } else if (!luhnCheck(cardNumber)) {
        showFieldError('card_number', 'Invalid card number');
        isValid = false;
    }
    
    // Validate expiry date
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        showFieldError('expiry_date', 'Please enter expiry date as MM/YY');
        isValid = false;
    } else {
        const [month, year] = expiry.split('/').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (month < 1 || month > 12) {
            showFieldError('expiry_date', 'Invalid month (01-12)');
            isValid = false;
        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showFieldError('expiry_date', 'Card has expired');
            isValid = false;
        }
    }
    
    // Validate CVV
    if (!cvv || !/^\d+$/.test(cvv) || (cvv.length !== 3 && cvv.length !== 4)) {
        showFieldError('cvv', 'Please enter a valid CVV (3-4 digits)');
        isValid = false;
    }
    
    return isValid;
}

// Luhn algorithm for card validation
function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('error');
    
    // Find or create error element
    let errorElement = field.parentNode.querySelector('.payment-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'payment-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Process payment transaction
function processPaymentTransaction(cardNumber, expiryDate, cvv, amount) {
    paymentAttempts++;
    localStorage.setItem('paymentAttempts', paymentAttempts);
    
    console.log(`Payment attempt ${paymentAttempts} of ${MAX_PAYMENT_ATTEMPTS}`);
    
    // Check for test cards
    const testCards = JSON.parse(localStorage.getItem('testCards') || '[]');
    const testCard = testCards.find(card => card.number === cardNumber);
    
    if (testCard) {
        console.log('Test card detected:', testCard.type);
        return {
            success: testCard.success,
            message: testCard.success ? 'Payment successful' : (testCard.error || 'Payment failed'),
            transactionId: testCard.success ? 'TXN-' + Date.now().toString().slice(-8) : null,
            amount: amount
        };
    }
    
    // Normal payment simulation - 85% success rate
    const isSuccess = Math.random() < 0.85;
    
    if (isSuccess) {
        return {
            success: true,
            message: 'Payment successful',
            transactionId: 'ACD-' + Date.now().toString().slice(-8),
            amount: amount
        };
    } else {
        // Random failure reasons
        const failureReasons = [
            'Insufficient funds',
            'Card declined by bank',
            'Transaction timeout',
            'Security check failed',
            'Daily limit exceeded'
        ];
        
        return {
            success: false,
            message: failureReasons[Math.floor(Math.random() * failureReasons.length)],
            transactionId: null,
            amount: amount
        };
    }
}

// Handle successful payment
function handleSuccessfulPayment(result) {
    console.log('Payment successful!', result);
    
    // Close payment modal
    closePayment();
    
    // Calculate rewards points
    const subtotal = calculateCartSubtotal();
    const pointsEarned = Math.floor(subtotal / 10); // 1 point per R10
    
    // Update user rewards if function exists
    if (typeof updateUserRewards === 'function') {
        updateUserRewards(pointsEarned);
    }
    
    // Save order to history
    saveOrderToHistory(subtotal + 150, result.transactionId);
    
    // Show confirmation modal
    showConfirmationModal(result, pointsEarned);
    
    // Clear cart
    clearCart();
    
    // Reset payment attempts
    paymentAttempts = 0;
    localStorage.setItem('paymentAttempts', '0');
    
    // Show success message
    showPaymentMessage('Payment successful! Your order has been confirmed.', 'success');
}

// Handle failed payment
function handleFailedPayment(result) {
    console.log('Payment failed:', result.message);
    
    if (paymentAttempts >= MAX_PAYMENT_ATTEMPTS) {
        // Too many attempts
        showPaymentMessage('Too many failed attempts. Please try again later or use a different payment method.', 'error');
        
        // Disable payment form
        const paymentForm = document.querySelector('.payment-form');
        if (paymentForm) {
            paymentForm.querySelectorAll('input, button, select').forEach(el => {
                el.disabled = true;
            });
        }
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            closePayment();
            showPaymentMessage('Payment session expired. Please try again.', 'error');
        }, 5000);
    } else {
        // Show error message
        showPaymentMessage(`Payment failed: ${result.message} (Attempt ${paymentAttempts} of ${MAX_PAYMENT_ATTEMPTS})`, 'error');
        
        // Shake form for emphasis
        const paymentForm = document.querySelector('.payment-form');
        if (paymentForm) {
            paymentForm.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                paymentForm.style.animation = '';
            }, 500);
        }
    }
}

// Show payment loading overlay
function showPaymentLoading(show) {
    const loadingOverlay = document.getElementById('payment-loading');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
}

// Show payment message
function showPaymentMessage(message, type = 'info') {
    // Remove existing messages
    document.querySelectorAll('.payment-message').forEach(el => el.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `payment-${type}-message payment-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 8px;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Show confirmation modal after successful payment
function showConfirmationModal(paymentResult, pointsEarned) {
    const subtotal = calculateCartSubtotal();
    const total = subtotal + 150;
    
    // Update confirmation modal
    const confirmationTotal = document.getElementById('confirmation-total');
    const pointsEarnedElement = document.getElementById('points-earned');
    const totalPointsElement = document.getElementById('total-points');
    
    if (confirmationTotal) confirmationTotal.textContent = `R${total}`;
    if (pointsEarnedElement) pointsEarnedElement.textContent = pointsEarned;
    
    // Update order items
    const confirmationItems = document.getElementById('confirmation-order-items');
    if (confirmationItems && cart) {
        confirmationItems.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px; background: #f9f9f9; border-radius: 4px;">
                <span>${item.name} (${item.size})</span>
                <span>R${item.price}</span>
            </div>
        `).join('');
    }
    
    // Update tracking number
    const trackingElement = document.getElementById('tracking-number');
    if (trackingElement && paymentResult.transactionId) {
        trackingElement.textContent = paymentResult.transactionId;
    }
    
    // Show rewards section if points earned
    const rewardsSection = document.getElementById('rewards-earned-section');
    if (rewardsSection) {
        if (pointsEarned > 0) {
            rewardsSection.style.display = 'block';
        } else {
            rewardsSection.style.display = 'none';
        }
    }
    
    // Show confirmation modal
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        confirmationModal.style.display = 'block';
        console.log('Confirmation modal shown');
    }
}

// Save order to history
function saveOrderToHistory(totalAmount, transactionId) {
    const order = {
        id: transactionId || 'ORD-' + Date.now().toString().slice(-8),
        date: new Date().toISOString(),
        items: [...cart],
        total: totalAmount,
        status: 'Processing'
    };
    
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    orders.unshift(order); // Add to beginning
    
    // Save back to localStorage
    localStorage.setItem('userOrders', JSON.stringify(orders));
    
    // Update order history display if exists
    updateOrderHistoryDisplay();
}

// Update order history display
function updateOrderHistoryDisplay() {
    const orderHistoryList = document.getElementById('order-history-list');
    if (!orderHistoryList) return;
    
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    
    if (orders.length === 0) {
        orderHistoryList.innerHTML = '<p style="text-align: center; color: #666">No orders yet</p>';
        return;
    }
    
    orderHistoryList.innerHTML = orders.map(order => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>Order #${order.id}</strong><br>
            <small>${new Date(order.date).toLocaleDateString()}</small><br>
            <span>R${order.total} • ${order.status}</span>
        </div>
    `).join('');
}

// Cancel payment
function cancelPayment() {
    closePayment();
    paymentAttempts = 0;
    localStorage.setItem('paymentAttempts', '0');
    
    showPaymentMessage('Payment cancelled. You can try again anytime.', 'info');
}

// Close payment modal
function closePayment() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.style.display = 'none';
    }
    
    // Reset form
    const paymentForm = document.querySelector('.payment-form');
    if (paymentForm) {
        paymentForm.reset();
        paymentForm.querySelectorAll('.payment-error').forEach(el => {
            el.classList.remove('show');
        });
        paymentForm.querySelectorAll('.input_field').forEach(el => {
            el.classList.remove('error');
        });
    }
}

// Close confirmation modal
function closeConfirmation() {
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
}

// Update payment amount in modal
function updatePaymentAmount() {
    const subtotal = calculateCartSubtotal();
    const total = subtotal + 150;
    
    const paymentAmount = document.getElementById('payment-amount');
    const paymentTotal = document.getElementById('payment-total');
    
    if (paymentAmount) paymentAmount.textContent = `R${total}`;
    if (paymentTotal) paymentTotal.textContent = `R${total}`;
    
    // Update order items in payment modal
    const paymentItems = document.getElementById('payment-order-items');
    if (paymentItems && cart) {
        paymentItems.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px; background: #f9f9f9; border-radius: 4px;">
                <span>${item.name} (${item.size})</span>
                <span>R${item.price}</span>
            </div>
        `).join('');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initPaymentSystem();
    updateOrderHistoryDisplay();
    
    // Add event listener to payment form
    const paymentForm = document.querySelector('.payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }
    
    // Update payment amount when checkout is clicked
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', updatePaymentAmount);
    }
    
    console.log('Payment system ready');
});

// ===== PRODUCT INTEGRATION =====

// Load products from Product Manager
function loadProductsFromManager() {
    const productManager = {
        products: JSON.parse(localStorage.getItem('acidicProducts')) || []
    };
    
    return productManager.products;
}

// Update product display in main site
function updateProductDisplay() {
    const products = loadProductsFromManager();
    
    // Update your existing product display logic
    // This will use the products managed by the admin system
    
    console.log('Products loaded from Product Manager:', products.length);
}

// Apply promotions to products
function applyPromotions() {
    const promotions = JSON.parse(localStorage.getItem('acidicPromotions')) || [];
    const now = new Date();
    
    const activePromotions = promotions.filter(promo => {
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return now >= start && now <= end && promo.status === 'active';
    });
    
    return activePromotions;
}

// === UNIFIED PRODUCT VIEW FUNCTION ===
function viewProduct(productId, event) {
    if (event) event.stopPropagation();
    
    console.log('Opening product page for ID:', productId);
    
    // First check if product exists in productData
    let product = window.productData.allproducts.find(p => p.id == productId);
    
    // If not found, check localStorage
    if (!product) {
        const storedProducts = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        product = storedProducts.find(p => p.id == productId);
    }
    
    if (!product) {
        console.error('Product not found with ID:', productId);
        showNotification('Product not found', 'error');
        return;
    }
    
    // Create a simplified version for the product page
    const simplifiedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        description: product.description,
        material: product.material,
        images: product.images,
        category: product.category,
        variants: product.variants || [],
        inventory: product.inventory || [],
        totalStock: product.totalStock,
        sku: product.sku
    };
    
    // Store product data in localStorage with a unique key
    const productKey = `acidic_product_${productId}`;
    localStorage.setItem(productKey, JSON.stringify(simplifiedProduct));
    localStorage.setItem('lastViewedProductId', productId.toString());
    
    console.log('Product data saved:', simplifiedProduct.name);
    console.log('Redirecting to product page...');
    
    // Open product page in SAME TAB (not new tab)
    window.location.href = `product.html?id=${productId}&key=${productKey}`;
}

// === FIXED VIRTUAL TRY-ON SYSTEM ===

// Virtual Try-On Variables
let currentTryOnImage = null;
let selectedTryOnProduct = null;
let webcamStream = null;
let canvasContext = null;

// Initialize Virtual Try-On with FIXED display
function initVirtualTryOn() {
    const tryonSection = document.getElementById('virtual-tryon');
    if (!tryonSection) return;
    
    // Clear existing content
    tryonSection.innerHTML = '';
    
    // Enhanced HTML for Virtual Try-On
    tryonSection.innerHTML = `
        <div class="tryon-container">
            <h2>Virtual Try-On Experience</h2>
            <p class="tryon-subtitle">See how our clothing looks on you before buying</p>
            
            <div class="tryon-interface">
                <!-- Left Panel: Image Source Selection -->
                <div class="tryon-source-panel">
                    <div class="source-selector">
                        <h3>Choose Your Source</h3>
                        <div class="source-options">
                            <button class="source-option active" data-source="webcam" onclick="selectSource('webcam')">
                                <i class="fas fa-camera"></i>
                                <span>Live Camera</span>
                            </button>
                            <button class="source-option" data-source="upload" onclick="selectSource('upload')">
                                <i class="fas fa-upload"></i>
                                <span>Upload Photo</span>
                            </button>
                            <button class="source-option" data-source="sample" onclick="selectSource('sample')">
                                <i class="fas fa-user"></i>
                                <span>Use Sample Model</span>
                            </button>
                        </div>
                        
                        <!-- Webcam Controls - VISIBLE by default -->
                        <div id="webcam-controls" class="source-controls active">
                            <div class="webcam-preview" id="webcam-preview">
                                <div class="placeholder">Camera feed will appear here</div>
                            </div>
                            <div class="control-buttons">
                                <button class="start-camera-btn" onclick="startWebcam()">
                                    <i class="fas fa-play"></i> Start Camera
                                </button>
                                <button class="capture-btn" onclick="captureFromWebcam()" disabled>
                                    <i class="fas fa-camera"></i> Capture Photo
                                </button>
                                <button class="stop-camera-btn" onclick="stopWebcam()" disabled>
                                    <i class="fas fa-stop"></i> Stop Camera
                                </button>
                            </div>
                        </div>
                        
                        <!-- Upload Controls - HIDDEN initially -->
                        <div id="upload-controls" class="source-controls" style="display: none;">
                            <div class="upload-area" id="upload-area">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Drag & drop your photo here</p>
                                <p class="upload-hint">or click to browse</p>
                                <input type="file" id="image-upload" accept="image/*" 
                                       onchange="handleImageUpload(event)" hidden>
                                <button class="browse-btn" onclick="document.getElementById('image-upload').click()">
                                    Browse Files
                                </button>
                            </div>
                            <div class="upload-requirements">
                                <p><i class="fas fa-info-circle"></i> For best results:</p>
                                <ul>
                                    <li>Stand facing the camera</li>
                                    <li>Good lighting is important</li>
                                    <li>Wear form-fitting clothing</li>
                                    <li>Clear background works best</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Sample Controls - HIDDEN initially -->
                        <div id="sample-controls" class="source-controls" style="display: none;">
                            <div class="sample-models">
                                <div class="sample-model" onclick="useSampleModel(1)">
                                    <img src="acidic 2.jpg" alt="Sample Model 1">
                                    <span>Male Model</span>
                                </div>
                                <div class="sample-model" onclick="useSampleModel(2)">
                                    <img src="acidic 28.jpg" alt="Sample Model 2">
                                    <span>Female Model</span>
                                </div>
                                <div class="sample-model" onclick="useSampleModel(3)">
                                    <img src="acidic 32.jpg" alt="Sample Model 3">
                                    <span>Street Style</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tryon-instructions">
                        <h4><i class="fas fa-lightbulb"></i> How to get the best results:</h4>
                        <ol>
                            <li>Choose a well-lit area</li>
                            <li>Stand about 2 meters from camera</li>
                            <li>Face forward with arms slightly away from body</li>
                            <li>Make sure your full body is in frame</li>
                            <li>Click "Capture Photo" when ready</li>
                        </ol>
                    </div>
                </div>
                
                <!-- Center Panel: Try-On Visualization -->
                <div class="tryon-visualization-panel">
                    <div class="visualization-header">
                        <h3>Try-On Preview</h3>
                        <div class="visualization-controls">
                            <button class="reset-btn" onclick="resetTryOn()">
                                <i class="fas fa-redo"></i> Reset
                            </button>
                            <button class="download-btn" onclick="downloadTryOnImage()">
                                <i class="fas fa-download"></i> Save
                            </button>
                        </div>
                    </div>
                    
                    <div class="visualization-area">
                        <div class="base-image-container">
                            <img id="base-image" src="" alt="Your photo" style="display: none;">
                            <canvas id="tryon-canvas" width="500" height="700"></canvas>
                            <div class="no-image-placeholder" id="no-image-placeholder">
                                <i class="fas fa-user-circle"></i>
                                <p>Upload or capture a photo to start</p>
                            </div>
                        </div>
                        
                        <div class="tryon-controls">
                            <div class="control-group">
                                <label>Product Position:</label>
                                <div class="slider-control">
                                    <span>Left</span>
                                    <input type="range" id="position-x" min="0" max="100" value="50" 
                                           oninput="updateProductPosition()">
                                    <span>Right</span>
                                </div>
                            </div>
                            <div class="control-group">
                                <label>Product Size:</label>
                                <div class="slider-control">
                                    <span>Small</span>
                                    <input type="range" id="product-scale" min="50" max="150" value="100" 
                                           oninput="updateProductScale()">
                                    <span>Large</span>
                                </div>
                            </div>
                            <div class="control-group">
                                <label>Product Opacity:</label>
                                <div class="slider-control">
                                    <span>Faded</span>
                                    <input type="range" id="product-opacity" min="30" max="100" value="80" 
                                           oninput="updateProductOpacity()">
                                    <span>Solid</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="visualization-actions">
                        <button class="add-to-cart-btn" onclick="addTryOnToCart()" disabled>
                            <i class="fas fa-shopping-cart"></i> Add Selected Item to Cart
                        </button>
                        <button class="compare-btn" onclick="compareTryOn()">
                            <i class="fas fa-exchange-alt"></i> Compare with Another Product
                        </button>
                    </div>
                </div>
                
                <!-- Right Panel: Product Selection -->
                <div class="tryon-products-panel">
                    <div class="products-header">
                        <h3>Try These Products</h3>
                        <div class="category-filter">
                            <select id="tryon-category-filter" onchange="filterTryOnProducts()">
                                <option value="all">All Categories</option>
                                <option value="tshirts">T-Shirts</option>
                                <option value="hoodies">Hoodies</option>
                                <option value="sweaters">Sweaters</option>
                                <option value="pants">Pants</option>
                                <option value="twopieces">Two Pieces</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="tryon-products-grid" id="tryon-products-grid">
                        <!-- Products will be loaded here -->
                    </div>
                    
                    <div class="tryon-suggestions">
                        <h4><i class="fas fa-magic"></i> AI Style Suggestions</h4>
                        <div class="suggestions-container" id="ai-suggestions">
                            <!-- AI suggestions will appear here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize canvas
    const canvas = document.getElementById('tryon-canvas');
    if (canvas) {
        canvasContext = canvas.getContext('2d');
        // Set canvas background
        canvasContext.fillStyle = '#f5f5f5';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add "Upload your photo" text on canvas
        canvasContext.fillStyle = '#999';
        canvasContext.font = '16px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.fillText('Upload or capture a photo to start', canvas.width/2, canvas.height/2);
    }
    
    // Initialize drag and drop for upload
    initDragAndDrop();
    
    // Load try-on products
    loadTryOnProducts();
    
    // Load AI suggestions
    generateAISuggestions();
}

// FIXED: Source selection function
function selectSource(source) {
    console.log('Selected source:', source);
    
    // Update active source button
    document.querySelectorAll('.source-option').forEach(btn => {
        btn.classList.remove('active');
    });
    const button = document.querySelector(`[data-source="${source}"]`);
    if (button) {
        button.classList.add('active');
    }
    
    // Hide all controls first
    document.querySelectorAll('.source-controls').forEach(control => {
        control.style.display = 'none';
    });
    
    // Show selected control
    const selectedControl = document.getElementById(`${source}-controls`);
    if (selectedControl) {
        selectedControl.style.display = 'block';
        selectedControl.classList.add('active');
    }
    
    // Stop webcam if switching away from it
    if (source !== 'webcam') {
        stopWebcam();
    }
}

// FIXED: Webcam functions
async function startWebcam() {
    try {
        // Check if browser supports mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support camera access. Please use Chrome, Firefox, or Edge.');
            return;
        }
        
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        };
        
        webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.createElement('video');
        video.srcObject = webcamStream;
        video.autoplay = true;
        video.playsInline = true;
        
        const preview = document.getElementById('webcam-preview');
        preview.innerHTML = '';
        preview.appendChild(video);
        
        // Enable capture button
        const captureBtn = document.querySelector('.capture-btn');
        const stopBtn = document.querySelector('.stop-camera-btn');
        const startBtn = document.querySelector('.start-camera-btn');
        
        if (captureBtn) captureBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
        if (startBtn) startBtn.disabled = true;
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        if (error.name === 'NotAllowedError') {
            alert('Camera access denied. Please allow camera access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
            alert('No camera found. Please connect a camera or use upload option.');
        } else {
            alert('Unable to access camera. Please check permissions.');
        }
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    
    const preview = document.getElementById('webcam-preview');
    if (preview) {
        preview.innerHTML = '<div class="placeholder">Camera feed will appear here</div>';
    }
    
    const captureBtn = document.querySelector('.capture-btn');
    const stopBtn = document.querySelector('.stop-camera-btn');
    const startBtn = document.querySelector('.start-camera-btn');
    
    if (captureBtn) captureBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (startBtn) startBtn.disabled = false;
}

function captureFromWebcam() {
    const preview = document.getElementById('webcam-preview');
    const video = preview.querySelector('video');
    
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg');
    setTryOnImage(imageData);
    
    // Show success message
    showNotification('Photo captured successfully!', 'success');
    
    // Stop webcam after capture
    stopWebcam();
}

// FIXED: Image upload functions
function initDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            alert('Please drop an image file (JPEG, PNG, etc.)');
        }
    });
    
    uploadArea.addEventListener('click', () => {
        const fileInput = document.getElementById('image-upload');
        if (fileInput) {
            fileInput.click();
        }
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        setTryOnImage(e.target.result);
        showNotification('Photo uploaded successfully!', 'success');
    };
    
    reader.onerror = function() {
        alert('Error reading image file. Please try another image.');
    };
    
    reader.readAsDataURL(file);
}

// FIXED: Set try-on image
function setTryOnImage(imageSrc) {
    const baseImage = document.getElementById('base-image');
    const canvas = document.getElementById('tryon-canvas');
    const placeholder = document.getElementById('no-image-placeholder');
    
    if (!baseImage || !canvas || !placeholder) return;
    
    baseImage.src = imageSrc;
    baseImage.style.display = 'block';
    
    // Hide placeholder
    placeholder.style.display = 'none';
    
    // Create a new image object for loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    
    img.onload = function() {
        // Clear canvas
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling to fit canvas
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = img.width / img.height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imageAspect > canvasAspect) {
            // Image is wider than canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imageAspect;
            x = 0;
            y = (canvas.height - drawHeight) / 2;
        } else {
            // Image is taller than canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imageAspect;
            x = (canvas.width - drawWidth) / 2;
            y = 0;
        }
        
        // Draw base image
        canvasContext.drawImage(img, x, y, drawWidth, drawHeight);
        
        currentTryOnImage = {
            src: imageSrc,
            width: drawWidth,
            height: drawHeight,
            x: x,
            y: y,
            originalWidth: img.width,
            originalHeight: img.height
        };
        
        // Enable add to cart button if product selected
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn && selectedTryOnProduct) {
            addToCartBtn.disabled = false;
        }
    };
    
    img.onerror = function() {
        alert('Error loading image. Please try another image.');
    };
}

// Rest of the functions remain the same as before...

// FIXED: Show virtual try-on section
function showVirtualTryOn() {
    hideAllSections();
    const tryonSection = document.getElementById('virtual-tryon');
    if (tryonSection) {
        tryonSection.style.display = 'block';
        
        // Initialize the try-on system
        initVirtualTryOn();
    }
}

// Update the navigation to call the fixed function
document.addEventListener('DOMContentLoaded', function() {
    // Update all virtual try-on links
    document.querySelectorAll('[onclick*="VirtualTryOn"], [onclick*="virtualtryon"], [onclick*="tryon"]').forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes('showVirtualTryOn') || onclick.includes('showTryOn')) {
            link.setAttribute('onclick', 'showVirtualTryOn()');
        }
    });
    
    // Also update footer links
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        if (link.textContent.includes('Virtual Try-On') || link.textContent.includes('Try-On')) {
            link.onclick = function(e) {
                e.preventDefault();
                showVirtualTryOn();
            };
        }
    });
});

// FIXED CSS for Virtual Try-On
function addVirtualTryOnStyles() {
    const styles = `
        /* Virtual Try-On Styles */
        .tryon-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            border-radius: 20px;
            color: #333;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .tryon-subtitle {
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            color: #666;
        }
        
        .tryon-interface {
            display: grid;
            grid-template-columns: 300px 1fr 350px;
            gap: 20px;
            margin-top: 30px;
        }
        
        /* Source Panel */
        .tryon-source-panel {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            border: 1px solid #e0e0e0;
        }
        
        .source-selector h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #333;
        }
        
        .source-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .source-option {
            background: white;
            border: 2px solid #e0e0e0;
            color: #333;
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .source-option:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
            border-color: #764ba2;
        }
        
        .source-option.active {
            background: #764ba2;
            border-color: #764ba2;
            color: white;
            box-shadow: 0 5px 15px rgba(118, 75, 162, 0.2);
        }
        
        .source-option i {
            font-size: 18px;
        }
        
        .source-controls {
            display: block;
            margin-bottom: 20px;
            opacity: 1;
            transition: opacity 0.3s;
        }
        
        .source-controls:not(.active) {
            display: none !important;
            opacity: 0;
        }
        
        .webcam-preview {
            width: 100%;
            height: 200px;
            background: #e0e0e0;
            border-radius: 10px;
            margin-bottom: 15px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .webcam-preview video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .control-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .control-buttons button {
            flex: 1;
            min-width: 100px;
            background: #764ba2;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .control-buttons button:hover {
            background: #5a3780;
            transform: translateY(-2px);
        }
        
        .control-buttons button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .upload-area {
            border: 2px dashed #764ba2;
            border-radius: 10px;
            padding: 30px 20px;
            text-align: center;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s;
            background: white;
        }
        
        .upload-area:hover, .upload-area.dragover {
            border-color: #5a3780;
            background: #f9f5ff;
        }
        
        .upload-area i {
            font-size: 48px;
            margin-bottom: 10px;
            color: #764ba2;
        }
        
        .upload-hint {
            font-size: 12px;
            color: #666;
            margin: 5px 0 15px 0;
        }
        
        .browse-btn {
            background: #764ba2;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .upload-requirements {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            border-left: 4px solid #2196F3;
        }
        
        .upload-requirements ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
        }
        
        .upload-requirements li {
            margin-bottom: 5px;
        }
        
        .sample-models {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        
        .sample-model {
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }
        
        .sample-model:hover {
            transform: scale(1.05);
        }
        
        .sample-model img {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 5px;
            border: 2px solid transparent;
        }
        
        .sample-model:hover img {
            border-color: #764ba2;
        }
        
        .sample-model span {
            font-size: 12px;
            color: #333;
        }
        
        .tryon-instructions {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #2196F3;
        }
        
        .tryon-instructions h4 {
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #333;
        }
        
        .tryon-instructions ol {
            margin: 10px 0 0 0;
            padding-left: 20px;
        }
        
        .tryon-instructions li {
            margin-bottom: 5px;
            font-size: 14px;
            color: #333;
        }
        
        /* Visualization Panel */
        .tryon-visualization-panel {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .visualization-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .visualization-header h3 {
            margin: 0;
            color: #333;
        }
        
        .visualization-controls {
            display: flex;
            gap: 10px;
        }
        
        .visualization-controls button {
            background: #f5f5f5;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s;
            color: #333;
        }
        
        .visualization-controls button:hover {
            background: #e0e0e0;
        }
        
        .visualization-area {
            margin-bottom: 20px;
        }
        
        .base-image-container {
            width: 100%;
            height: 400px;
            background: #f5f5f5;
            border-radius: 10px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }
        
        #tryon-canvas {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            display: block;
        }
        
        .no-image-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #999;
            background: #f5f5f5;
        }
        
        .no-image-placeholder i {
            font-size: 80px;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        
        .tryon-controls {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        .control-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        .slider-control {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .slider-control span {
            font-size: 12px;
            color: #666;
            min-width: 40px;
        }
        
        .slider-control input[type="range"] {
            flex: 1;
            height: 6px;
            -webkit-appearance: none;
            background: #ddd;
            border-radius: 3px;
            outline: none;
        }
        
        .slider-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: #764ba2;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .visualization-actions {
            display: flex;
            gap: 15px;
        }
        
        .visualization-actions button {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
        }
        
        .add-to-cart-btn {
            background: #000;
            color: white;
        }
        
        .add-to-cart-btn:hover {
            background: #333;
        }
        
        .add-to-cart-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #666;
        }
        
        .compare-btn {
            background: #764ba2;
            color: white;
        }
        
        .compare-btn:hover {
            background: #5a3780;
        }
        
        /* Products Panel */
        .tryon-products-panel {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
        }
        
        .products-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .products-header h3 {
            margin: 0;
            color: #333;
        }
        
        .category-filter select {
            background: white;
            border: 1px solid #ddd;
            color: #333;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .tryon-products-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .tryon-product-item {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s;
            border: 1px solid #e0e0e0;
        }
        
        .tryon-product-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border-color: #764ba2;
        }
        
        .tryon-product-image {
            position: relative;
            height: 120px;
            overflow: hidden;
        }
        
        .tryon-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        
        .tryon-product-item:hover .tryon-product-image img {
            transform: scale(1.1);
        }
        
        .tryon-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .tryon-product-item:hover .tryon-overlay {
            opacity: 1;
        }
        
        .try-it-btn {
            background: #f4b400;
            color: black;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .tryon-product-info {
            padding: 15px;
        }
        
        .tryon-product-info h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #333;
        }
        
        .tryon-price {
            color: #f4b400;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        
        .tryon-colors {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .tryon-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #ddd;
        }
        
        .quick-view-btn {
            width: 100%;
            background: #f5f5f5;
            border: 1px solid #ddd;
            color: #333;
            padding: 8px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            transition: all 0.3s;
        }
        
        .quick-view-btn:hover {
            background: #e0e0e0;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
            .tryon-interface {
                grid-template-columns: 1fr;
            }
            
            .tryon-source-panel, .tryon-visualization-panel, .tryon-products-panel {
                max-width: 800px;
                margin: 0 auto;
            }
        }
        
        @media (max-width: 768px) {
            .tryon-container {
                padding: 15px;
            }
            
            .tryon-interface {
                gap: 15px;
            }
            
            .visualization-actions {
                flex-direction: column;
            }
            
            .control-buttons {
                flex-direction: column;
            }
            
            .sample-models {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .tryon-products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 480px) {
            .tryon-interface {
                grid-template-columns: 1fr;
            }
            
            .sample-models {
                grid-template-columns: 1fr;
            }
            
            .tryon-products-grid {
                grid-template-columns: 1fr;
            }
            
            .visualization-controls {
                flex-direction: column;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Add styles when page loads
if (typeof addVirtualTryOnStyles !== 'undefined') {
    addVirtualTryOnStyles();
}

function loadHomeNewArrivals() {
  const container = document.getElementById("home-new-arrivals");
  if (!container || !window.productData) return;

  container.innerHTML = Object.values(productData)
    .slice(0, 4)
    .map(
      (p) => `
      <div class="product-card" onclick="openProductModal('${p.id}')">
        <img src="${p.images[0]}" />
        <h4>${p.name}</h4>
        <p>R${p.price}</p>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadHomeNewArrivals);

function openShopPage() {
  document.getElementById("home-page").style.display = "none";
  document.getElementById("shop-page").style.display = "block";

  // Default load all products
  if (typeof showCategory === "function") {
    showCategory("allproducts");
  }
}

function openHomePage() {
  document.getElementById("shop-page").style.display = "none";
  document.getElementById("home-page").style.display = "block";
}

 function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const category = getQueryParam("category");
    const product = getQueryParam("product");

    if (product && typeof openProductModal === "function") {
      openProductModal(product);
    } else if (category && typeof showCategory === "function") {
      showCategory(category);
    } else {
      showCategory("allproducts");
    }
  });

  function toggleExperience(card) {
  const grid = document.querySelector(".experience-grid");
  const isActive = card.classList.contains("active");

  // Close all
  document.querySelectorAll(".experience-card").forEach(c => {
    c.classList.remove("active");
  });
  grid.classList.remove("has-active");

  // Open selected if it wasn't active
  if (!isActive) {
    card.classList.add("active");
    grid.classList.add("has-active");
  }
}

function openExperienceModal(type) {
  const modal = document.getElementById("experience-modal");
  const body = document.getElementById("experience-modal-body");

  body.innerHTML = getExperienceContent(type);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeExperienceModal() {
  document.getElementById("experience-modal").style.display = "none";
  document.body.style.overflow = "";
}

function getExperienceContent(type) {
  switch (type) {
    case "ai-stylist":
      return document.querySelector(".ai-stylist-section").innerHTML;

    case "visual-tryon":
      return document.querySelector(".virtual-tryon").innerHTML;

    case "sustainability":
      return document.querySelector(".sustainability").innerHTML;

    case "community":
      return document.querySelector(".community").innerHTML;

    case "rewards":
      return document.querySelector(".loyalty-program").innerHTML;

    case "outfit-builder":
      return document.querySelector(".outfit-builder").innerHTML;

    case "size-finder":
      return document.getElementById("size-recommender-modal").innerHTML;
  }
}

function goToShop() {
  // If using separate pages
  if (window.location.pathname.includes("home.html")) {
    window.location.href = "shop.html";
  } else {
    // If already on shop page
    showCategory("allproducts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function openSearch() {
  alert("Search coming soon 🔍");
}

const header = document.querySelector(".main-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
    header.classList.remove("transparent");
  } else {
    header.classList.add("transparent");
    header.classList.remove("scrolled");
  }
});

function openHomePage() {
  const home = document.getElementById("home-section");
  const shop = document.getElementById("shop-section");

  home.style.display = "block";
  shop.style.display = "none";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function goToShop() {
  const home = document.getElementById("home-section");
  const shop = document.getElementById("shop-section");

  home.style.display = "none";
  shop.style.display = "block";

  showCategory("allproducts");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// === MENU TRIGGER FUNCTIONS ===

function triggerHome() {
  console.log('Menu: Home clicked');
  if (typeof openHomePage === 'function') {
    openHomePage();
  } else if (typeof showHomePage === 'function') {
    showHomePage();
  } else {
    // Fallback: scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Show home content
    const homeSection = document.getElementById('home-section') || document.getElementById('main-content');
    if (homeSection) {
      hideAllSections();
      homeSection.style.display = 'block';
    }
  }
}

function triggerShop() {
  console.log('Menu: Shop clicked');
  if (typeof goToShop === 'function') {
    goToShop();
  } else if (typeof showCategory === 'function') {
    hideAllSections();
    showCategory('allproducts');
  } else {
    // Fallback: show all products
    const shopSection = document.getElementById('shop-section') || document.getElementById('product-section');
    if (shopSection) {
      hideAllSections();
      shopSection.style.display = 'block';
      if (typeof showCategory === 'function') {
        showCategory('allproducts');
      }
    }
  }
}

function triggerCart() {
  console.log('Menu: Cart clicked');
  if (typeof toggleCart === 'function') {
    toggleCart(true);
  } else if (typeof openCart === 'function') {
    openCart();
  } else {
    // Fallback: alert or show cart modal
    alert('Cart functionality');
    // Try to load cart items
    if (typeof loadCartItems === 'function') {
      loadCartItems();
    }
  }
}

function triggerSignUp() {
  console.log('Menu: Sign Up clicked');
  if (typeof showSignUp === 'function') {
    showSignUp();
  } else if (typeof showSignUpModal === 'function') {
    showSignUpModal();
  } else {
    // Fallback: scroll to sign up section or show modal
    const signUpSection = document.getElementById('signup-section');
    if (signUpSection) {
      hideAllSections();
      signUpSection.style.display = 'block';
    } else {
      alert('Sign Up/Login');
    }
  }
}

function triggerSearch() {
  console.log('Menu: Search clicked');
  if (typeof openSearch === 'function') {
    openSearch();
  } else {
    // Create search modal if function doesn't exist
    createSearchModal();
  }
}

// === SEARCH MODAL (if openSearch doesn't exist) ===
function createSearchModal() {
  // Remove existing modal
  const existing = document.getElementById('search-modal');
  if (existing) existing.remove();
  
  const modalHTML = `
    <div id="search-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      z-index: 2000;
      padding-top: 100px;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">Search Products</h3>
          <button onclick="closeSearchModal()" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        <input type="text" id="search-input" placeholder="Search for products..." style="
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          margin-bottom: 15px;
        ">
        <button onclick="performSearch()" style="
          width: 100%;
          padding: 12px;
          background: #000;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
        ">
          Search
        </button>
        <div id="search-results" style="margin-top: 20px; max-height: 300px; overflow-y: auto;"></div>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.innerHTML = modalHTML;
  document.body.appendChild(modal.firstElementChild);
  
  // Focus on input
  setTimeout(() => {
    document.getElementById('search-input').focus();
  }, 100);
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.remove();
}

function performSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const resultsContainer = document.getElementById('search-results');
  
  if (!query.trim()) {
    resultsContainer.innerHTML = '<p style="color: #666; text-align: center;">Enter a search term</p>';
    return;
  }
  
  // Search in productData
  const results = window.productData?.allproducts?.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    (product.description && product.description.toLowerCase().includes(query))
  ) || [];
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p style="color: #666; text-align: center;">No products found</p>';
    return;
  }
  
  resultsContainer.innerHTML = results.map(product => `
    <div style="
      padding: 10px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
    " onclick="viewProduct(${product.id})">
      <img src="${product.images[0]}" alt="${product.name}" style="
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 5px;
      ">
      <div>
        <div style="font-weight: bold;">${product.name}</div>
        <div style="color: #666; font-size: 14px;">R${product.price}</div>
      </div>
    </div>
  `).join('');
}

// === ENHANCED SCROLL EFFECT FOR HEADER ===
function initHeaderScroll() {
  const header = document.querySelector('.main-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  });
}

// === UPDATE CART COUNT IN MENU ===
function updateMenuCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;
  
  const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// === INITIALIZE MENU ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing menu system...');
  
  // Initialize header scroll effect
  initHeaderScroll();
  
  // Update cart count in menu
  updateMenuCartCount();
  
  // Listen for cart updates
  setInterval(updateMenuCartCount, 1000);
  
  // Make sure cart updates trigger menu update
  const originalSaveCart = window.saveCart;
  if (typeof originalSaveCart === 'function') {
    window.saveCart = function() {
      originalSaveCart.apply(this, arguments);
      updateMenuCartCount();
    };
  }
  
  console.log('Menu system initialized');
});

// Make functions globally available
window.processPayment = processPayment;
window.cancelPayment = cancelPayment;
window.closePayment = closePayment;
window.closeConfirmation = closeConfirmation;