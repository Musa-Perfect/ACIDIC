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