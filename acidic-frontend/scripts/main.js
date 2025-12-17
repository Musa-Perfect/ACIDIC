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

// Make functions globally available
window.processPayment = processPayment;
window.cancelPayment = cancelPayment;
window.closePayment = closePayment;
window.closeConfirmation = closeConfirmation;