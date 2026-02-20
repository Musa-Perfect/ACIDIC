// === MAIN APPLICATION LOGIC ===

// Initialize the application
// [Removed duplicate DOMContentLoaded - handled in comprehensive init below]

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

// ── AI STYLIST ───────────────────────────────────────────────────
var stylistAnswers = { style: null, color: null, occasion: null };

function showAIStylist() {
    hideAllSections();
    document.getElementById("ai-stylist-section").style.display = "block";
    resetQuiz();
}

function resetQuiz() {
    stylistAnswers = { style: null, color: null, occasion: null };
    document.getElementById("quiz-step-1").style.display = "block";
    document.getElementById("quiz-step-2").style.display = "none";
    document.getElementById("quiz-step-3").style.display = "none";
    document.getElementById("ai-recommendations").innerHTML = "";
}

function nextQuizStep(step, choice) {
    if (step === 1) {
        stylistAnswers.style = choice;
        document.getElementById("quiz-step-1").style.display = "none";
        document.getElementById("quiz-step-2").style.display = "block";
    } else if (step === 2) {
        stylistAnswers.color = choice;
        document.getElementById("quiz-step-2").style.display = "none";
        document.getElementById("quiz-step-3").style.display = "block";
    }
}

function generateRecommendations(occasion) {
    stylistAnswers.occasion = occasion;
    var style = stylistAnswers.style;
    var color = stylistAnswers.color;
    var occ   = stylistAnswers.occasion;

    var allProducts = (window.productData && window.productData.allproducts) ? window.productData.allproducts : [];
    if (allProducts.length === 0) {
        document.getElementById("ai-recommendations").innerHTML = "<p>No products found. Please try again.</p>";
        return;
    }

    var categoryWeights = {};
    var priceRange = { min: 0, max: 9999 };

    var styleMap = {
        minimalist: { tshirts: 3, sweaters: 2, pants: 2 },
        bold:       { hoodies: 3, tshirts: 2, twopieces: 2 },
        street:     { hoodies: 3, tshirts: 3, pants: 2, accessories: 1 },
        comfort:    { hoodies: 3, sweaters: 3, pants: 2 }
    };
    var colorMap = {
        monochrome: { priceMax: 500 },
        vibrant:    { priceMin: 300 },
        earthy:     { priceMax: 450 },
        mixed:      {}
    };
    var occasionMap = {
        "Everyday Wear":    { tshirts: 3, pants: 2, sweaters: 1 },
        "Night Out":        { hoodies: 3, twopieces: 3, tshirts: 1 },
        "Special Events":   { twopieces: 3, sweaters: 2, hoodies: 1 },
        "All of the Above": { tshirts: 2, hoodies: 2, pants: 2, twopieces: 2, sweaters: 1, accessories: 1 }
    };

    var sw = styleMap[style] || {};
    Object.keys(sw).forEach(function(cat) { categoryWeights[cat] = (categoryWeights[cat] || 0) + sw[cat]; });

    var cw = colorMap[color] || {};
    if (cw.priceMin) priceRange.min = cw.priceMin;
    if (cw.priceMax) priceRange.max = cw.priceMax;

    var ow = occasionMap[occ] || occasionMap["All of the Above"];
    Object.keys(ow).forEach(function(cat) { categoryWeights[cat] = (categoryWeights[cat] || 0) + ow[cat]; });

    var scored = allProducts.map(function(p) {
        var score = categoryWeights[p.category] || 0;
        if (p.price >= priceRange.min && p.price <= priceRange.max) score += 2;
        score += Math.random() * 0.5;
        return { product: p, score: score };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    var picks = scored.slice(0, 6).map(function(s) { return s.product; });

    var container = document.getElementById("ai-recommendations");
    document.getElementById("quiz-step-3").style.display = "none";

    var styleLabel   = { minimalist:"Minimalist", bold:"Bold & Edgy", street:"Streetwear", comfort:"Comfort First" }[style] || style;
    var colorLabel   = { monochrome:"Monochrome", vibrant:"Vibrant", earthy:"Earthy Tones", mixed:"Mixed Palette" }[color] || color;

    container.innerHTML =
        "<h3 style='margin-bottom:6px'>Your Picks</h3>" +
        "<p style='color:#888;font-size:13px;margin-bottom:20px'>" + styleLabel + " · " + colorLabel + " · " + occ + "</p>" +
        "<div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px'></div>";

    var grid = container.querySelector("div");
    picks.forEach(function(product) {
        var img  = (product.images && product.images[0]) || product.image || product.img || "";
        var card = document.createElement("div");
        card.className = "product";
        card.style.cssText = "background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);cursor:pointer;transition:transform 0.2s;";
        card.innerHTML =
            "<img src='" + img + "' alt='" + product.name + "' style='width:100%;height:220px;object-fit:cover;'>" +
            "<div style='padding:14px'>" +
                "<p style='font-weight:700;margin:0 0 4px;font-size:14px'>" + product.name + "</p>" +
                "<p style='color:#f4b400;font-weight:700;margin:0 0 10px;font-size:13px'>R" + product.price + "</p>" +
                "<p style='color:#888;font-size:11px;margin:0 0 12px;text-transform:capitalize'>" + product.category + "</p>" +
                "<button class='add-to-cart' onclick='addToCart(" + JSON.stringify({id:product.id,name:product.name,price:product.price,image:img}).replace(/'/g,"&#39;") + ")'" +
                " style='width:100%;padding:9px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;'>Add to Cart</button>" +
            "</div>";
        card.addEventListener("mouseenter", function() { card.style.transform = "translateY(-4px)"; });
        card.addEventListener("mouseleave", function() { card.style.transform = ""; });
        grid.appendChild(card);
    });

    var reset = document.createElement("button");
    reset.textContent = "Retake Quiz";
    reset.style.cssText = "margin-top:24px;padding:10px 24px;background:#f4b400;color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:14px;";
    reset.onclick = resetQuiz;
    container.appendChild(reset);
}

// Virtual Try-On
// showVirtualTryOn — see consolidated try-on block below

function startWebcam() {
    alert(
        "Virtual try-on would use your camera to show how items look on you. For this demo, we're simulating the experience."
    );
    // In a real implementation, this would access the user's webcam
}

// tryOnProduct handled by selectTryOnProduct()

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
    var section = document.getElementById('loyalty-program');
    if (section) {
        section.style.display = 'block';
        if (typeof renderLoyaltyPage === 'function') renderLoyaltyPage();
    }
}

// Outfit Builder
// ================================================================
//  OUTFIT BUILDER — FIXED & ENHANCED
// ================================================================

let currentOutfit = { top: null, bottom: null, accessory: null };

function showOutfitBuilder() {
    hideAllSections();
    const section = document.getElementById('outfit-builder');
    if (section) {
        section.style.display = 'block';
        initOutfitBuilder();
    }
}

function initOutfitBuilder() {
    const section = document.getElementById('outfit-builder');
    if (!section) return;

    section.innerHTML = `
        <div class="outfit-container">
            <h2>Build Your Look</h2>
            <p style="text-align:center;color:#888;margin-bottom:24px;">Pick a top, bottom and accessory to create your perfect outfit</p>

            <div class="outfit-layout">

                <!-- LEFT: Current outfit canvas -->
                <div class="outfit-canvas-panel">
                    <h3>Your Outfit</h3>

                    <div class="outfit-slot" id="top-slot">
                        <div class="slot-placeholder" id="top-placeholder">
                            <span style="font-size:32px">👕</span>
                            <p>No top selected</p>
                        </div>
                        <div class="slot-item" id="top-item" style="display:none;"></div>
                    </div>

                    <div class="outfit-slot" id="bottom-slot">
                        <div class="slot-placeholder" id="bottom-placeholder">
                            <span style="font-size:32px">👖</span>
                            <p>No bottom selected</p>
                        </div>
                        <div class="slot-item" id="bottom-item" style="display:none;"></div>
                    </div>

                    <div class="outfit-slot" id="accessory-slot">
                        <div class="slot-placeholder" id="accessory-placeholder">
                            <span style="font-size:32px">🧢</span>
                            <p>No accessory selected</p>
                        </div>
                        <div class="slot-item" id="accessory-item" style="display:none;"></div>
                    </div>

                    <div class="outfit-summary" id="outfit-summary" style="display:none;">
                        <div class="summary-line">
                            <span>Outfit Total</span>
                            <span id="outfit-total" style="font-weight:700;color:#f4b400;">R0</span>
                        </div>
                    </div>

                    <button class="add-outfit-btn" id="add-outfit-btn" onclick="addOutfitToCart()" disabled>
                        🛒 Add Outfit to Cart
                    </button>
                    <button class="clear-outfit-btn" onclick="clearOutfit()">
                        ✕ Clear Outfit
                    </button>
                </div>

                <!-- RIGHT: Product picker -->
                <div class="outfit-picker-panel">
                    <div class="outfit-category-tabs">
                        <button class="outfit-tab active" onclick="showOutfitCategory('tshirts', this)">T-Shirts</button>
                        <button class="outfit-tab" onclick="showOutfitCategory('hoodies', this)">Hoodies</button>
                        <button class="outfit-tab" onclick="showOutfitCategory('sweaters', this)">Sweaters</button>
                        <button class="outfit-tab" onclick="showOutfitCategory('pants', this)">Bottoms</button>
                        <button class="outfit-tab" onclick="showOutfitCategory('twopieces', this)">Two Pieces</button>
                        <button class="outfit-tab" onclick="showOutfitCategory('accessories', this)">Accessories</button>
                    </div>
                    <div class="outfit-products-grid" id="outfit-products"></div>
                </div>

            </div>
        </div>`;

    addOutfitBuilderStyles();
    currentOutfit = { top: null, bottom: null, accessory: null };
    showOutfitCategory('tshirts', document.querySelector('.outfit-tab'));
}

// ── Category tab + product grid ───────────────────────────────────
function showOutfitCategory(category, tabEl) {
    // Update active tab
    document.querySelectorAll('.outfit-tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');

    const grid = document.getElementById('outfit-products');
    if (!grid) return;

    const all = window.productData?.allproducts || [];
    const items = all.filter(p => p.category === category);

    if (!items.length) {
        grid.innerHTML = '<p style="color:#888;text-align:center;padding:30px;">No products in this category</p>';
        return;
    }

    grid.innerHTML = items.map(item => {
        const img = item.images?.[0] || item.image || item.img || '';
        return `<div class="outfit-product-card" onclick="addToOutfit('${category}', ${JSON.stringify({
            id: item.id, name: item.name, price: item.price,
            image: img, category: item.category
        }).replace(/"/g, '&quot;')})">
            <div class="outfit-card-img">
                <img src="${img}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+'">
                <div class="outfit-card-overlay">+ Add</div>
            </div>
            <div class="outfit-card-info">
                <p class="outfit-card-name">${item.name}</p>
                <p class="outfit-card-price">R${item.price}</p>
            </div>
        </div>`;
    }).join('');
}

// ── Add item to outfit slot ────────────────────────────────────────
function addToOutfit(category, item) {
    // Parse item if passed as string from onclick
    if (typeof item === 'string') {
        try { item = JSON.parse(item); } catch(e) { return; }
    }

    const isTops       = ['tshirts','hoodies','sweaters','twopieces'].includes(category);
    const isBottoms    = ['pants'].includes(category);
    const isAccessory  = ['accessories'].includes(category);

    if (isTops) {
        currentOutfit.top = item;
        renderOutfitSlot('top', item);
    } else if (isBottoms) {
        currentOutfit.bottom = item;
        renderOutfitSlot('bottom', item);
    } else if (isAccessory) {
        currentOutfit.accessory = item;
        renderOutfitSlot('accessory', item);
    }

    updateOutfitSummary();
    showNotification(item.name + ' added to outfit', 'success');
}

function renderOutfitSlot(slot, item) {
    const placeholder = document.getElementById(slot + '-placeholder');
    const slotEl      = document.getElementById(slot + '-item');
    if (!placeholder || !slotEl) return;

    placeholder.style.display = 'none';
    slotEl.style.display = 'flex';
    slotEl.innerHTML = `
        <img src="${item.image || item.img || ''}" alt="${item.name}"
             style="width:70px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0;"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+'">
        <div style="flex:1;min-width:0;">
            <p style="margin:0 0 3px;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</p>
            <p style="margin:0;color:#f4b400;font-weight:700;font-size:13px">R${item.price}</p>
        </div>
        <button onclick="removeFromOutfit('${slot}')"
                style="background:none;border:none;font-size:18px;cursor:pointer;color:#ccc;padding:0 4px;flex-shrink:0;"
                title="Remove">✕</button>`;
}

function removeFromOutfit(slot) {
    currentOutfit[slot] = null;
    const placeholder = document.getElementById(slot + '-placeholder');
    const slotEl      = document.getElementById(slot + '-item');
    if (placeholder) placeholder.style.display = 'flex';
    if (slotEl)      slotEl.style.display = 'none';
    updateOutfitSummary();
}

function clearOutfit() {
    ['top','bottom','accessory'].forEach(s => removeFromOutfit(s));
    showNotification('Outfit cleared', 'info');
}

function updateOutfitSummary() {
    const hasItems = currentOutfit.top || currentOutfit.bottom || currentOutfit.accessory;
    const summary  = document.getElementById('outfit-summary');
    const totalEl  = document.getElementById('outfit-total');
    const addBtn   = document.getElementById('add-outfit-btn');

    if (summary)  summary.style.display  = hasItems ? 'block' : 'none';
    if (addBtn)   addBtn.disabled        = !hasItems;

    if (totalEl) {
        const total = (currentOutfit.top?.price       || 0) +
                      (currentOutfit.bottom?.price    || 0) +
                      (currentOutfit.accessory?.price || 0);
        totalEl.textContent = 'R' + total;
    }
}

// ── Add whole outfit to cart ──────────────────────────────────────
function addOutfitToCart() {
    const hasItems = currentOutfit.top || currentOutfit.bottom || currentOutfit.accessory;
    if (!hasItems) {
        showNotification('Please add at least one item to your outfit', 'error');
        return;
    }

    ['top','bottom','accessory'].forEach(slot => {
        const item = currentOutfit[slot];
        if (!item) return;
        addToCart({
            id:       item.id,
            name:     item.name + ' (Outfit)',
            price:    item.price,
            image:    item.image || item.img || '',
            quantity: 1,
            size:     slot === 'accessory' ? 'One Size' : 'M',
            category: item.category || slot
        });
    });

    toggleCart(true);
    showNotification('Full outfit added to cart!', 'success');
}

// ── Styles ────────────────────────────────────────────────────────
function addOutfitBuilderStyles() {
    if (document.getElementById('outfit-styles')) return;
    const style = document.createElement('style');
    style.id = 'outfit-styles';
    style.textContent = `
        .outfit-container{max-width:1100px;margin:0 auto;padding:30px;background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.08);}
        .outfit-container h2{text-align:center;margin-bottom:6px;}
        .outfit-layout{display:grid;grid-template-columns:320px 1fr;gap:24px;margin-top:10px;}
        .outfit-canvas-panel{background:#f8f9fa;border-radius:14px;padding:18px;border:1px solid #e0e0e0;display:flex;flex-direction:column;gap:10px;}
        .outfit-canvas-panel h3{margin:0 0 8px;font-size:16px;}
        .outfit-slot{background:#fff;border-radius:10px;border:1px solid #eee;padding:12px;min-height:90px;}
        .slot-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ccc;gap:4px;min-height:66px;font-size:12px;}
        .slot-item{display:flex;align-items:center;gap:12px;}
        .outfit-summary{border-top:1px solid #eee;padding-top:10px;margin-top:4px;}
        .summary-line{display:flex;justify-content:space-between;font-size:15px;}
        .add-outfit-btn{width:100%;padding:13px;background:#000;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;transition:background 0.2s;margin-top:4px;}
        .add-outfit-btn:hover{background:#333;}
        .add-outfit-btn:disabled{opacity:0.4;cursor:not-allowed;background:#666;}
        .clear-outfit-btn{width:100%;padding:9px;background:none;color:#888;border:1px solid #ddd;border-radius:8px;cursor:pointer;font-size:13px;transition:all 0.2s;}
        .clear-outfit-btn:hover{border-color:#f44336;color:#f44336;}
        .outfit-picker-panel{display:flex;flex-direction:column;gap:14px;}
        .outfit-category-tabs{display:flex;gap:8px;flex-wrap:wrap;}
        .outfit-tab{background:#f0f0f0;border:none;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.2s;}
        .outfit-tab:hover{background:#e0e0e0;}
        .outfit-tab.active{background:#000;color:#fff;}
        .outfit-products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;max-height:580px;overflow-y:auto;padding-right:4px;}
        .outfit-product-card{background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee;cursor:pointer;transition:all 0.2s;}
        .outfit-product-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.1);border-color:#f4b400;}
        .outfit-card-img{position:relative;height:160px;overflow:hidden;}
        .outfit-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s;}
        .outfit-product-card:hover .outfit-card-img img{transform:scale(1.06);}
        .outfit-card-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;opacity:0;transition:opacity 0.2s;}
        .outfit-product-card:hover .outfit-card-overlay{opacity:1;}
        .outfit-card-info{padding:8px 10px;}
        .outfit-card-name{margin:0 0 3px;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .outfit-card-price{margin:0;font-size:12px;color:#f4b400;font-weight:700;}
        @media(max-width:768px){.outfit-layout{grid-template-columns:1fr;}.outfit-canvas-panel{order:2;}.outfit-picker-panel{order:1;}}
    `;
    document.head.appendChild(style);
}

// ── Fix openExperienceModal for outfit-builder ────────────────────
const _prevOpenExperienceModal = typeof openExperienceModal === 'function' ? openExperienceModal : null;
openExperienceModal = function(type) {
    const modal = document.getElementById('experience-modal');
    const body  = document.getElementById('experience-modal-body');
    if (!modal || !body) return;

    if (type === 'outfit-builder') {
        body.innerHTML = '<section id="outfit-builder" style="padding:0;background:none;box-shadow:none;"></section>';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => initOutfitBuilder(), 50);
    } else if (_prevOpenExperienceModal) {
        _prevOpenExperienceModal(type);
    } else {
        body.innerHTML = getExperienceContent(type);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};
window.openExperienceModal = openExperienceModal;
window.showOutfitBuilder   = showOutfitBuilder;

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

// ================================================================
//  VIRTUAL TRY-ON — CONSOLIDATED CLEAN IMPLEMENTATION
// ================================================================

// ── State ─────────────────────────────────────────────────────────
let currentTryOnImage    = null;
let selectedTryOnProduct = null;
let webcamStream         = null;
let canvasContext        = null;

// ── Entry point ───────────────────────────────────────────────────
function showVirtualTryOn() {
    hideAllSections();
    const section = document.getElementById('virtual-tryon');
    if (section) {
        section.style.display = 'block';
        addVirtualTryOnStyles();
        initVirtualTryOn();
    }
}

// ── Build the UI ──────────────────────────────────────────────────
function initVirtualTryOn() {
    const tryonSection = document.getElementById('virtual-tryon');
    if (!tryonSection) return;

    tryonSection.innerHTML = `
        <div class="tryon-container">
            <h2>Virtual Try-On Experience</h2>
            <p class="tryon-subtitle">See how our clothing looks on you before buying</p>
            <div class="tryon-interface">

                <!-- LEFT -->
                <div class="tryon-source-panel">
                    <div class="source-selector">
                        <h3>Choose Your Source</h3>
                        <div class="source-options">
                            <button class="source-option active" data-source="webcam" onclick="selectSource('webcam')">📷 Live Camera</button>
                            <button class="source-option" data-source="upload"  onclick="selectSource('upload')">📁 Upload Photo</button>
                            <button class="source-option" data-source="sample"  onclick="selectSource('sample')">🧍 Sample Model</button>
                        </div>

                        <div id="webcam-controls" class="source-controls active">
                            <div class="webcam-preview" id="webcam-preview">
                                <div class="placeholder">Camera feed will appear here</div>
                            </div>
                            <div class="control-buttons">
                                <button class="start-camera-btn" onclick="startWebcam()">▶ Start</button>
                                <button class="capture-btn"      onclick="captureFromWebcam()" disabled>📸 Capture</button>
                                <button class="stop-camera-btn"  onclick="stopWebcam()"        disabled>⏹ Stop</button>
                            </div>
                        </div>

                        <div id="upload-controls" class="source-controls" style="display:none;">
                            <div class="upload-area" id="upload-area">
                                <p style="font-size:30px;margin:0">☁️</p>
                                <p>Drag & drop your photo here</p>
                                <p class="upload-hint">or click to browse</p>
                                <input type="file" id="image-upload" accept="image/*" onchange="handleImageUpload(event)" hidden>
                                <button class="browse-btn" onclick="document.getElementById('image-upload').click()">Browse Files</button>
                            </div>
                            <div class="upload-requirements">
                                <p><strong>💡 Best results:</strong></p>
                                <ul>
                                    <li>Face the camera directly</li>
                                    <li>Good, even lighting</li>
                                    <li>Form-fitting clothes</li>
                                    <li>Clear background</li>
                                </ul>
                            </div>
                        </div>

                        <div id="sample-controls" class="source-controls" style="display:none;">
                            <div class="sample-models">
                                <div class="sample-model" onclick="useSampleModel(1)">
                                    <img src="acidic 2.jpg"  alt="Male Model"><span>Male</span>
                                </div>
                                <div class="sample-model" onclick="useSampleModel(2)">
                                    <img src="acidic 28.jpg" alt="Female Model"><span>Female</span>
                                </div>
                                <div class="sample-model" onclick="useSampleModel(3)">
                                    <img src="acidic 32.jpg" alt="Street"><span>Street</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tryon-instructions">
                        <h4>📋 Tips for best results:</h4>
                        <ol>
                            <li>Choose a well-lit area</li>
                            <li>Stand ~2m from camera</li>
                            <li>Face forward, arms slightly out</li>
                            <li>Full body in frame</li>
                            <li>Click Capture when ready</li>
                        </ol>
                    </div>
                </div>

                <!-- CENTER -->
                <div class="tryon-visualization-panel">
                    <div class="visualization-header">
                        <h3>Try-On Preview</h3>
                        <div class="visualization-controls">
                            <button class="reset-btn"    onclick="resetTryOn()">↺ Reset</button>
                            <button class="download-btn" onclick="downloadTryOnImage()">⬇ Save Look</button>
                        </div>
                    </div>
                    <div class="visualization-area">
                        <div class="base-image-container">
                            <canvas id="tryon-canvas" width="500" height="680"></canvas>
                            <div class="no-image-placeholder" id="no-image-placeholder">
                                <span style="font-size:48px">🧍</span>
                                <p>Upload or capture a photo to start</p>
                            </div>
                        </div>
                        <div class="tryon-controls">
                            <div class="control-group">
                                <label>Position ↔</label>
                                <input type="range" id="position-x"      min="0"  max="100" value="50"  oninput="updateProductPosition()">
                            </div>
                            <div class="control-group">
                                <label>Size ⬡</label>
                                <input type="range" id="product-scale"   min="40" max="160" value="100" oninput="updateProductScale()">
                            </div>
                            <div class="control-group">
                                <label>Opacity ◑</label>
                                <input type="range" id="product-opacity" min="20" max="100" value="80"  oninput="updateProductOpacity()">
                            </div>
                        </div>
                    </div>
                    <div class="visualization-actions">
                        <button class="add-to-cart-btn" onclick="addTryOnToCart()" disabled>🛒 Add to Cart</button>
                        <button class="compare-btn"     onclick="compareTryOn()">⇄ Compare</button>
                    </div>
                </div>

                <!-- RIGHT -->
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
                    <div class="tryon-products-grid" id="tryon-products-grid"></div>
                    <div class="tryon-suggestions">
                        <h4>✨ Style Suggestions</h4>
                        <div id="ai-suggestions"></div>
                    </div>
                </div>

            </div>
        </div>`;

    const canvas = document.getElementById('tryon-canvas');
    if (canvas) {
        canvasContext = canvas.getContext('2d');
        canvasContext.fillStyle = '#f5f5f5';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = '#bbb';
        canvasContext.font = '15px sans-serif';
        canvasContext.textAlign = 'center';
        canvasContext.fillText('Upload or capture a photo to start', canvas.width / 2, canvas.height / 2);
    }

    initDragAndDrop();
    loadTryOnProducts();
    generateAISuggestions();
}

// ── Source selector ───────────────────────────────────────────────
function selectSource(source) {
    document.querySelectorAll('.source-option').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-source="${source}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.source-controls').forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
    const panel = document.getElementById(source + '-controls');
    if (panel) { panel.style.display = 'block'; panel.classList.add('active'); }

    if (source !== 'webcam') stopWebcam();
}

// ── Webcam ────────────────────────────────────────────────────────
async function startWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support camera access. Please use Chrome, Firefox, or Edge.');
        return;
    }
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        const video = document.createElement('video');
        video.srcObject   = webcamStream;
        video.autoplay    = true;
        video.playsInline = true;
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:8px;';

        const preview = document.getElementById('webcam-preview');
        preview.innerHTML = '';
        preview.appendChild(video);

        const captureBtn = document.querySelector('.capture-btn');
        const stopBtn    = document.querySelector('.stop-camera-btn');
        const startBtn   = document.querySelector('.start-camera-btn');
        if (captureBtn) captureBtn.disabled = false;
        if (stopBtn)    stopBtn.disabled    = false;
        if (startBtn)   startBtn.disabled   = true;
    } catch (error) {
        if (error.name === 'NotAllowedError')      alert('Camera access denied. Please allow camera access in your browser settings.');
        else if (error.name === 'NotFoundError')   alert('No camera found. Please connect a camera or use the upload option.');
        else                                       alert('Unable to access camera: ' + error.message);
    }
}

function stopWebcam() {
    if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); webcamStream = null; }
    const preview = document.getElementById('webcam-preview');
    if (preview) preview.innerHTML = '<div class="placeholder">Camera feed will appear here</div>';
    const captureBtn = document.querySelector('.capture-btn');
    const stopBtn    = document.querySelector('.stop-camera-btn');
    const startBtn   = document.querySelector('.start-camera-btn');
    if (captureBtn) captureBtn.disabled = true;
    if (stopBtn)    stopBtn.disabled    = true;
    if (startBtn)   startBtn.disabled   = false;
}

function captureFromWebcam() {
    const video = document.getElementById('webcam-preview')?.querySelector('video');
    if (!video) return;
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    c.getContext('2d').drawImage(video, 0, 0);
    setTryOnImage(c.toDataURL('image/jpeg'));
    showNotification('Photo captured!', 'success');
    stopWebcam();
}

// ── Upload ────────────────────────────────────────────────────────
function initDragAndDrop() {
    const area = document.getElementById('upload-area');
    if (!area) return;
    area.addEventListener('dragover',  e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
        e.preventDefault(); area.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
        else alert('Please drop an image file');
    });
    area.addEventListener('click', () => document.getElementById('image-upload')?.click());
}

function handleImageUpload(event) { const f = event.target.files[0]; if (f) handleImageFile(f); }

function handleImageFile(file) {
    if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload  = e => { setTryOnImage(e.target.result); showNotification('Photo uploaded!', 'success'); };
    reader.onerror = () => alert('Error reading file');
    reader.readAsDataURL(file);
}

// ── Set base image on canvas ──────────────────────────────────────
function setTryOnImage(imageSrc) {
    const canvas      = document.getElementById('tryon-canvas');
    const placeholder = document.getElementById('no-image-placeholder');
    if (!canvas || !canvasContext) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = function() {
        const ca = canvas.width / canvas.height;
        const ia = img.width / img.height;
        let dw, dh, x, y;
        if (ia > ca) { dw = canvas.width;  dh = canvas.width / ia;  x = 0; y = (canvas.height - dh) / 2; }
        else         { dh = canvas.height; dw = canvas.height * ia; y = 0; x = (canvas.width  - dw) / 2; }

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(img, x, y, dw, dh);
        currentTryOnImage = { src: imageSrc, width: dw, height: dh, x, y };
        if (placeholder) placeholder.style.display = 'none';
        if (selectedTryOnProduct) {
            drawTryOnOverlay();
            const addBtn = document.querySelector('.add-to-cart-btn');
            if (addBtn) addBtn.disabled = false;
        }
    };
    img.onerror = () => alert('Error loading image');
}

// ── Product grid ──────────────────────────────────────────────────
function loadTryOnProducts(category) {
    const grid = document.getElementById('tryon-products-grid');
    if (!grid) return;
    const all  = window.productData?.allproducts || [];
    const list = (category && category !== 'all') ? all.filter(p => p.category === category) : all.slice(0, 12);
    if (!list.length) { grid.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No products found</p>'; return; }

    grid.innerHTML = list.map(p => {
        const img = p.images?.[0] || p.image || '';
        return `<div class="tryon-product-item" onclick="selectTryOnProduct(${p.id}, event)">
            <div class="tryon-product-image">
                <img src="${img}" alt="${p.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+'">
                <div class="tryon-overlay"><button class="try-it-btn">👕 Try It</button></div>
            </div>
            <div class="tryon-product-info">
                <p style="font-weight:700;margin:0 0 2px;font-size:13px">${p.name}</p>
                <p style="color:#f4b400;font-weight:700;margin:0;font-size:12px">R${p.price}</p>
            </div>
        </div>`;
    }).join('');
}

function filterTryOnProducts() { loadTryOnProducts(document.getElementById('tryon-category-filter')?.value); }

// ── Select product ────────────────────────────────────────────────
function selectTryOnProduct(productId, event) {
    const all = window.productData?.allproducts || [];
    selectedTryOnProduct = all.find(p => p.id == productId);
    if (!selectedTryOnProduct) return;

    document.querySelectorAll('.tryon-product-item').forEach(el => el.style.outline = '');
    if (event?.currentTarget) event.currentTarget.style.outline = '2px solid #f4b400';

    if (currentTryOnImage) {
        drawTryOnOverlay();
        const addBtn = document.querySelector('.add-to-cart-btn');
        if (addBtn) addBtn.disabled = false;
    }
    showNotification('Selected: ' + selectedTryOnProduct.name, 'success');
}

// ── Canvas overlay ────────────────────────────────────────────────
function drawTryOnOverlay() {
    if (!canvasContext || !currentTryOnImage || !selectedTryOnProduct) return;
    const canvas  = document.getElementById('tryon-canvas');
    const scale   = (parseInt(document.getElementById('product-scale')?.value)   || 100) / 100;
    const opacity = (parseInt(document.getElementById('product-opacity')?.value) || 80)  / 100;
    const posX    = (parseInt(document.getElementById('position-x')?.value)      || 50)  / 100;

    const base = new Image();
    base.crossOrigin = 'anonymous';
    base.src = currentTryOnImage.src;
    base.onload = () => {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(base, currentTryOnImage.x, currentTryOnImage.y, currentTryOnImage.width, currentTryOnImage.height);

        const src = selectedTryOnProduct.images?.[0] || selectedTryOnProduct.image || '';
        if (!src) return;
        const prod = new Image();
        prod.crossOrigin = 'anonymous';
        prod.src = src;
        prod.onload = () => {
            const ow = currentTryOnImage.width  * scale * 0.55;
            const oh = currentTryOnImage.height * scale * 0.45;
            const ox = (canvas.width * posX) - (ow / 2);
            const oy = currentTryOnImage.y + (currentTryOnImage.height * 0.15);

            canvasContext.globalAlpha = opacity;
            canvasContext.drawImage(prod, ox, oy, ow, oh);
            canvasContext.globalAlpha = 1;

            canvasContext.fillStyle = 'rgba(0,0,0,0.55)';
            canvasContext.fillRect(ox, oy + oh + 4, ow, 22);
            canvasContext.fillStyle = '#fff';
            canvasContext.font = 'bold 12px sans-serif';
            canvasContext.textAlign = 'center';
            canvasContext.fillText(selectedTryOnProduct.name, ox + ow / 2, oy + oh + 18);
        };
    };
}

function updateProductPosition() { drawTryOnOverlay(); }
function updateProductScale()    { drawTryOnOverlay(); }
function updateProductOpacity()  { drawTryOnOverlay(); }

// ── Sample models ─────────────────────────────────────────────────
function useSampleModel(num) {
    const map = { 1: 'acidic 2.jpg', 2: 'acidic 28.jpg', 3: 'acidic 32.jpg' };
    document.querySelectorAll('.sample-model img').forEach((img, i) => {
        img.style.border = (i + 1 === num) ? '2px solid #f4b400' : '2px solid transparent';
    });
    setTryOnImage(map[num] || map[1]);
    showNotification('Sample model loaded!', 'success');
}

// ── Reset ─────────────────────────────────────────────────────────
function resetTryOn() {
    currentTryOnImage = null; selectedTryOnProduct = null;
    const canvas = document.getElementById('tryon-canvas');
    if (canvas && canvasContext) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = '#f5f5f5';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = '#bbb';
        canvasContext.font = '15px sans-serif';
        canvasContext.textAlign = 'center';
        canvasContext.fillText('Upload or capture a photo to start', canvas.width / 2, canvas.height / 2);
    }
    const ph = document.getElementById('no-image-placeholder');
    if (ph) ph.style.display = 'flex';
    const addBtn = document.querySelector('.add-to-cart-btn');
    if (addBtn) addBtn.disabled = true;
    [['position-x', 50], ['product-scale', 100], ['product-opacity', 80]].forEach(([id, val]) => {
        const el = document.getElementById(id); if (el) el.value = val;
    });
    showNotification('Reset!', 'info');
}

// ── Download ──────────────────────────────────────────────────────
function downloadTryOnImage() {
    if (!currentTryOnImage) { showNotification('Upload a photo first', 'error'); return; }
    const canvas = document.getElementById('tryon-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'acidic-tryon-' + Date.now() + '.jpg';
    a.href = canvas.toDataURL('image/jpeg', 0.9);
    a.click();
    showNotification('Look saved!', 'success');
}

// ── Compare ───────────────────────────────────────────────────────
function compareTryOn() {
    if (!currentTryOnImage) { showNotification('Upload a photo first', 'error'); return; }
    showNotification('Select another product from the list to compare', 'info');
    const grid = document.getElementById('tryon-products-grid');
    if (grid) { grid.style.outline = '2px solid #f4b400'; setTimeout(() => grid.style.outline = '', 2000); }
}

// ── Add to cart ───────────────────────────────────────────────────
function addTryOnToCart() {
    if (!selectedTryOnProduct) { showNotification('Please select a product first', 'error'); return; }
    addToCart({ id: selectedTryOnProduct.id, name: selectedTryOnProduct.name, price: selectedTryOnProduct.price, image: selectedTryOnProduct.images?.[0] || selectedTryOnProduct.image || '' });
    showNotification(selectedTryOnProduct.name + ' added to cart!', 'success');
}

// ── AI suggestions ────────────────────────────────────────────────
function generateAISuggestions() {
    const container = document.getElementById('ai-suggestions');
    if (!container) return;
    const picks = (window.productData?.allproducts || []).slice().sort(() => Math.random() - 0.5).slice(0, 3);
    container.innerHTML = picks.map(p => {
        const img = p.images?.[0] || p.image || '';
        return `<div onclick="selectTryOnProduct(${p.id}, event)"
            style="display:flex;align-items:center;gap:10px;padding:8px;background:#fff;border-radius:8px;
                   cursor:pointer;margin-bottom:8px;border:1px solid #eee;transition:border-color 0.2s;"
            onmouseover="this.style.borderColor='#f4b400'" onmouseout="this.style.borderColor='#eee'">
            <img src="${img}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;" onerror="this.style.display='none'">
            <div>
                <p style="margin:0;font-size:12px;font-weight:700">${p.name}</p>
                <p style="margin:0;font-size:11px;color:#f4b400">R${p.price}</p>
            </div>
        </div>`;
    }).join('');
}

// ── CSS ───────────────────────────────────────────────────────────
function addVirtualTryOnStyles() {
    if (document.getElementById('tryon-styles')) return;
    const style = document.createElement('style');
    style.id = 'tryon-styles';
    style.textContent = `
        .tryon-container{max-width:1400px;margin:0 auto;padding:30px;background:#fff;border-radius:20px;color:#333;box-shadow:0 10px 30px rgba(0,0,0,0.08);}
        .tryon-container h2{text-align:center;margin-bottom:6px;}
        .tryon-subtitle{text-align:center;color:#666;margin-bottom:24px;font-size:16px;}
        .tryon-interface{display:grid;grid-template-columns:270px 1fr 290px;gap:20px;margin-top:16px;}
        .tryon-source-panel,.tryon-products-panel{background:#f8f9fa;border-radius:14px;padding:16px;border:1px solid #e0e0e0;}
        .source-selector h3{margin:0 0 12px;font-size:15px;}
        .source-options{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
        .source-option{background:#fff;border:2px solid #e0e0e0;color:#333;padding:9px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s;font-size:13px;font-weight:500;}
        .source-option:hover{border-color:#f4b400;background:#fffdf0;}
        .source-option.active{background:#000;border-color:#000;color:#fff;}
        .webcam-preview{width:100%;height:170px;background:#e0e0e0;border-radius:10px;margin-bottom:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:13px;color:#888;text-align:center;}
        .webcam-preview video{width:100%;height:100%;object-fit:cover;}
        .control-buttons{display:flex;gap:6px;flex-wrap:wrap;}
        .control-buttons button{flex:1;min-width:70px;background:#000;color:#fff;border:none;padding:8px 4px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:600;transition:background 0.2s;}
        .control-buttons button:hover{background:#333;}
        .control-buttons button:disabled{opacity:0.4;cursor:not-allowed;}
        .upload-area{border:2px dashed #ccc;border-radius:10px;padding:20px 14px;text-align:center;cursor:pointer;transition:all 0.2s;background:#fff;margin-bottom:10px;}
        .upload-area:hover,.upload-area.dragover{border-color:#f4b400;background:#fffdf0;}
        .upload-hint{font-size:11px;color:#888;margin:3px 0 10px;}
        .browse-btn{background:#000;color:#fff;border:none;padding:7px 16px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;}
        .upload-requirements{background:#f0f4ff;padding:10px;border-radius:8px;font-size:12px;border-left:3px solid #f4b400;}
        .upload-requirements ul{margin:5px 0 0;padding-left:16px;}
        .upload-requirements li{margin-bottom:3px;}
        .sample-models{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
        .sample-model{cursor:pointer;text-align:center;transition:transform 0.2s;}
        .sample-model:hover{transform:scale(1.04);}
        .sample-model img{width:100%;height:70px;object-fit:cover;border-radius:7px;border:2px solid transparent;transition:border-color 0.2s;}
        .sample-model span{font-size:10px;color:#555;display:block;margin-top:3px;}
        .tryon-instructions{margin-top:14px;background:#fff;border-radius:10px;padding:12px;border:1px solid #eee;font-size:12px;}
        .tryon-instructions h4{margin:0 0 7px;font-size:13px;}
        .tryon-instructions ol{margin:0;padding-left:16px;}
        .tryon-instructions li{margin-bottom:4px;color:#555;}
        .tryon-visualization-panel{display:flex;flex-direction:column;gap:14px;}
        .visualization-header{display:flex;justify-content:space-between;align-items:center;}
        .visualization-header h3{margin:0;}
        .visualization-controls{display:flex;gap:8px;}
        .reset-btn,.download-btn{background:#f4b400;color:#000;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:13px;transition:background 0.2s;}
        .reset-btn:hover,.download-btn:hover{background:#e6a800;}
        .base-image-container{background:#f5f5f5;border-radius:12px;overflow:hidden;position:relative;min-height:280px;}
        #tryon-canvas{display:block;width:100%;border-radius:12px;}
        .no-image-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa;font-size:13px;gap:6px;pointer-events:none;}
        .tryon-controls{display:flex;flex-direction:column;gap:9px;padding:10px;background:#f8f9fa;border-radius:10px;border:1px solid #eee;}
        .control-group{display:flex;align-items:center;gap:10px;}
        .control-group label{font-size:12px;font-weight:600;color:#555;min-width:76px;}
        .control-group input[type=range]{flex:1;accent-color:#f4b400;}
        .visualization-actions{display:flex;gap:10px;}
        .add-to-cart-btn,.compare-btn{flex:1;padding:11px;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;transition:all 0.2s;}
        .add-to-cart-btn{background:#000;color:#fff;}
        .add-to-cart-btn:hover{background:#333;}
        .add-to-cart-btn:disabled{opacity:0.4;cursor:not-allowed;background:#666;}
        .compare-btn{background:#f4b400;color:#000;}
        .compare-btn:hover{background:#e6a800;}
        .products-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
        .products-header h3{margin:0;font-size:15px;}
        .category-filter select{background:#fff;border:1px solid #ddd;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;}
        .tryon-products-grid{display:grid;grid-template-columns:1fr;gap:8px;max-height:400px;overflow-y:auto;margin-bottom:14px;}
        .tryon-product-item{background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;cursor:pointer;transition:all 0.2s;}
        .tryon-product-item:hover{transform:translateY(-3px);box-shadow:0 8px 16px rgba(0,0,0,0.1);border-color:#f4b400;}
        .tryon-product-image{position:relative;height:100px;overflow:hidden;}
        .tryon-product-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s;}
        .tryon-product-item:hover .tryon-product-image img{transform:scale(1.08);}
        .tryon-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;}
        .tryon-product-item:hover .tryon-overlay{opacity:1;}
        .try-it-btn{background:#f4b400;color:#000;border:none;padding:6px 12px;border-radius:5px;cursor:pointer;font-weight:700;font-size:12px;}
        .tryon-product-info{padding:8px 10px;}
        .tryon-suggestions h4{margin:0 0 8px;font-size:13px;}
        @media(max-width:900px){.tryon-interface{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);
}

// ── Fix openExperienceModal for visual-tryon ──────────────────────
const _baseOpenExperienceModal = typeof openExperienceModal === 'function' ? openExperienceModal : null;
openExperienceModal = function(type) {
    const modal = document.getElementById('experience-modal');
    const body  = document.getElementById('experience-modal-body');
    if (!modal || !body) return;
    if (type === 'visual-tryon') {
        body.innerHTML = '<div id="virtual-tryon" style="padding:0;"></div>';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => { addVirtualTryOnStyles(); initVirtualTryOn(); }, 50);
    } else if (type === 'rewards') {
        body.innerHTML = '<section id="loyalty-program" style="display:block;padding:0;"><div class="loyalty-container"></div></section>';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => { if (typeof renderLoyaltyPage === 'function') renderLoyaltyPage(); }, 50);
    } else if (_baseOpenExperienceModal) {
        _baseOpenExperienceModal(type);
    } else {
        body.innerHTML = getExperienceContent(type);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.openExperienceModal   = openExperienceModal;
window.showVirtualTryOn      = showVirtualTryOn;
window.addVirtualTryOnStyles = addVirtualTryOnStyles;

document.addEventListener('DOMContentLoaded', () => addVirtualTryOnStyles());

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

// === FIXED: Unified Home Page Navigation ===
function openHomePage() {
    console.log('Opening home page');
    
    // Hide all sections first
    const sections = [
        'home-page',
        'shop-page',
        'ai-stylist-section',
        'virtual-tryon',
        'sustainability',
        'community',
        'loyalty-program',
        'outfit-builder',
        'signup-section',
        'login-section',
        'product-section'
    ];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Show home page
    const homePage = document.getElementById('home-page');
    if (homePage) {
        homePage.style.display = 'block';
        console.log('Home page displayed');
    } else {
        console.error('Home page element not found');
    }
    
    // Update active states
    localStorage.setItem('currentPage', 'home');
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// === FIXED: Unified Shop Page Navigation ===
function goToShop() {
    console.log('Opening shop page');
    
    // Hide all sections first
    const sections = [
        'home-page',
        'shop-page',
        'ai-stylist-section',
        'virtual-tryon',
        'sustainability',
        'community',
        'loyalty-program',
        'outfit-builder',
        'signup-section',
        'login-section',
        'product-section'
    ];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Show shop page
    const shopPage = document.getElementById('shop-page');
    if (shopPage) {
        shopPage.style.display = 'block';
        console.log('Shop page displayed');
        
        // Load products
        if (typeof showCategory === 'function') {
            showCategory('allproducts');
        }
    } else {
        console.error('Shop page element not found');
    }
    
    // Update active states
    localStorage.setItem('currentPage', 'shop');
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// === FIXED: Shop button alias for consistency ===
function openShopPage() {
    goToShop();
}

// === FIXED: Menu trigger functions ===
function triggerHome() {
    console.log('Menu: Home clicked');
    openHomePage();
}

function triggerShop() {
    console.log('Menu: Shop clicked');
    goToShop();
}

function triggerCart() {
    console.log('Menu: Cart clicked');
    if (typeof toggleCart === 'function') {
        toggleCart(true);
    } else {
        console.error('toggleCart function not found');
        // Fallback: create cart sidebar if it doesn't exist
        if (typeof initializeCart === 'function') {
            initializeCart();
            toggleCart(true);
        }
    }
}

function triggerSignUp() {
    console.log('Menu: Sign Up clicked');
    if (typeof showSignUp === 'function') {
        showSignUp();
    } else {
        // Hide all sections and show signup
        const sections = ['home-page', 'shop-page', 'ai-stylist-section', 'virtual-tryon', 
                         'sustainability', 'community', 'loyalty-program', 'outfit-builder', 
                         'login-section'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        const signupSection = document.getElementById('signup-section');
        if (signupSection) {
            signupSection.style.display = 'block';
        }
    }
}

function triggerSearch() {
    console.log('Menu: Search clicked');
    if (typeof openSearch === 'function') {
        openSearch();
    } else {
        createSearchModal();
    }
}

 function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // [Removed duplicate DOMContentLoaded - URL params handled in main init]

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
// === SINGLE DOMContentLoaded LISTENER ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    // Initialize background slideshow
    initBackgroundSlideshow();
    
    // Initialize payment system
    initPaymentSystem();
    
    // Update order history
    updateOrderHistoryDisplay();
    
    // Initialize header scroll effect
    initHeaderScroll();
    
    // Update cart count in menu
    updateMenuCartCount();
    
    // Update auth link
    updateAuthLink();
    
    // Check URL parameters first
    const category = getQueryParam("category");
    const product = getQueryParam("product");

    if (product && typeof openProductModal === "function") {
        openProductModal(product);
    } else if (category && typeof showCategory === "function") {
        showCategory(category);
    } else {
        // Show default category only if no URL params
        showCategory("tshirts");
        // Ensure home page is visible by default
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.style.display = 'block';
        }
    }
    
    // Add payment form listener
    const paymentForm = document.querySelector('.payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }
    
    // Add checkout listener
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', updatePaymentAmount);
    }
    
    console.log('Application initialized');
});

// Make functions globally available
window.processPayment = processPayment;
window.cancelPayment = cancelPayment;
window.closePayment = closePayment;
window.closeConfirmation = closeConfirmation;// ================================================================
//  COMPREHENSIVE FIX FOR ALL FEATURES
//  Add this to the END of main.js OR run in console to debug
// ================================================================

console.log('🔧 ACIDIC COMPREHENSIVE FIX LOADING...\n');

// ── PART 1: Ensure productData is properly loaded ────────────────
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    
    // Check productData
    if (!window.productData) {
      console.error('❌ productData not loaded!');
      console.log('Make sure products.js loads BEFORE main.js');
      return;
    }
    
    console.log('✓ productData exists');
    console.log('  Categories:', Object.keys(window.productData).join(', '));
    
    // Check allproducts
    if (!window.productData.allproducts || window.productData.allproducts.length === 0) {
      console.error('❌ allproducts array is empty!');
      
      // FIX: Rebuild allproducts from categories
      console.log('🔧 Rebuilding allproducts array...');
      const allProducts = [];
      ['tshirts', 'sweaters', 'hoodies', 'pants', 'twopieces', 'accessories'].forEach(cat => {
        if (window.productData[cat] && Array.isArray(window.productData[cat])) {
          allProducts.push(...window.productData[cat]);
        }
      });
      
      window.productData.allproducts = allProducts;
      console.log('✓ Rebuilt allproducts:', allProducts.length, 'products');
    } else {
      console.log('✓ allproducts:', window.productData.allproducts.length, 'products');
    }
    
  }, 500); // Wait for products.js to fully execute
});

// ── PART 2: Fix viewProduct function ──────────────────────────────
const originalViewProduct = window.viewProduct;
window.viewProduct = function(productId, event) {
  if (event) event.stopPropagation();
  
  console.log('👁️ viewProduct called - ID:', productId);
  
  // Check if productData exists
  if (!window.productData || !window.productData.allproducts) {
    console.error('❌ Product data not available');
    if (typeof showNotification === 'function') {
      showNotification('Product data not loaded. Please refresh the page.', 'error');
    } else {
      alert('Product data not loaded. Please refresh the page.');
    }
    return;
  }
  
  const numId = parseInt(productId);
  console.log('Searching for product ID:', productId, '(parsed:', numId + ')');
  
  // Find product
  let product = window.productData.allproducts.find(p => p.id == productId || p.id == numId);
  
  if (!product) {
    console.error('❌ Product not found');
    console.log('Available IDs:', window.productData.allproducts.slice(0, 10).map(p => p.id));
    
    if (typeof showNotification === 'function') {
      showNotification('Product not found', 'error');
    } else {
      alert('Product not found');
    }
    return;
  }
  
  console.log('✓ Product found:', product.name);
  
  // Prepare product data
  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice,
    description: product.description || 'No description available',
    material: product.material || '',
    images: product.images || [product.img || product.image] || [],
    category: product.category,
    variants: product.variants || [],
    inventory: product.inventory || [],
    totalStock: product.totalStock || 0,
    sku: product.sku || ''
  };
  
  // Store in localStorage
  const productKey = `acidic_product_${productId}`;
  localStorage.setItem(productKey, JSON.stringify(productData));
  localStorage.setItem('lastViewedProductId', productId.toString());
  
  console.log('✓ Product data saved to localStorage');
  console.log('✓ Redirecting to product.html...');
  
  // Redirect
  window.location.href = `product.html?id=${productId}&key=${productKey}`;
};

// ── PART 3: Fix AI Stylist ───────────────────────────────────────
window.showAIStylist = function() {
  console.log('🤖 Opening AI Stylist...');
  
  try {
    if (typeof hideAllSections === 'function') hideAllSections();
    
    const section = document.getElementById('ai-stylist-section');
    if (!section) {
      console.error('❌ AI Stylist section not found in HTML');
      alert('AI Stylist section is missing from your HTML');
      return;
    }
    
    section.style.display = 'block';
    
    if (typeof resetQuiz === 'function') {
      resetQuiz();
    }
    
    console.log('✓ AI Stylist opened');
  } catch (error) {
    console.error('❌ AI Stylist error:', error);
    alert('AI Stylist failed to load: ' + error.message);
  }
};

// ── PART 4: Fix Virtual Try-On ────────────────────────────────────
window.showVirtualTryOn = function() {
  console.log('👕 Opening Virtual Try-On...');
  
  try {
    if (typeof hideAllSections === 'function') hideAllSections();
    
    const section = document.getElementById('virtual-tryon');
    if (!section) {
      console.error('❌ Virtual Try-On section not found');
      alert('Virtual Try-On section is missing from your HTML');
      return;
    }
    
    section.style.display = 'block';
    
    // Add styles if function exists
    if (typeof addVirtualTryOnStyles === 'function') {
      addVirtualTryOnStyles();
    }
    
    // Initialize if function exists
    if (typeof initVirtualTryOn === 'function') {
      initVirtualTryOn();
      console.log('✓ Virtual Try-On initialized');
    } else {
      console.warn('⚠ initVirtualTryOn function not found');
      section.innerHTML = '<div style="padding:40px;text-align:center;"><h2>Virtual Try-On</h2><p>Initializing...</p></div>';
    }
    
  } catch (error) {
    console.error('❌ Virtual Try-On error:', error);
    alert('Virtual Try-On failed to load: ' + error.message);
  }
};

// ── PART 5: Fix Outfit Builder ───────────────────────────────────
window.showOutfitBuilder = function() {
  console.log('👔 Opening Outfit Builder...');
  
  try {
    if (typeof hideAllSections === 'function') hideAllSections();
    
    const section = document.getElementById('outfit-builder');
    if (!section) {
      console.error('❌ Outfit Builder section not found');
      alert('Outfit Builder section is missing from your HTML');
      return;
    }
    
    section.style.display = 'block';
    
    // Add styles if function exists
    if (typeof addOutfitBuilderStyles === 'function') {
      addOutfitBuilderStyles();
    }
    
    // Initialize if function exists
    if (typeof initOutfitBuilder === 'function') {
      initOutfitBuilder();
      console.log('✓ Outfit Builder initialized');
    } else {
      console.warn('⚠ initOutfitBuilder function not found');
      section.innerHTML = '<div style="padding:40px;text-align:center;"><h2>Outfit Builder</h2><p>Initializing...</p></div>';
    }
    
  } catch (error) {
    console.error('❌ Outfit Builder error:', error);
    alert('Outfit Builder failed to load: ' + error.message);
  }
};

// ── PART 6: Global product card click handler ────────────────────
document.addEventListener('click', function(e) {
  // Check if click is on product card
  const productCard = e.target.closest('.product');
  
  if (productCard) {
    // Ignore if clicking on button
    if (e.target.closest('button') || e.target.tagName === 'BUTTON') {
      return;
    }
    
    const productId = productCard.dataset.productId;
    if (productId && typeof viewProduct === 'function') {
      e.preventDefault();
      e.stopPropagation();
      viewProduct(productId, e);
    }
  }
});

// ── PART 7: Diagnostic function ──────────────────────────────────
window.runDiagnostics = function() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ACIDIC WEBSITE DIAGNOSTICS');
  console.log('='.repeat(60) + '\n');
  
  // 1. Check productData
  console.log('1️⃣ PRODUCT DATA:');
  if (window.productData) {
    console.log('  ✓ productData exists');
    console.log('  Categories:', Object.keys(window.productData).join(', '));
    
    if (window.productData.allproducts) {
      console.log('  ✓ allproducts:', window.productData.allproducts.length, 'products');
      console.log('  Sample IDs:', window.productData.allproducts.slice(0, 5).map(p => p.id + ' - ' + p.name));
    } else {
      console.log('  ❌ allproducts array missing!');
    }
  } else {
    console.log('  ❌ productData not loaded!');
  }
  
  // 2. Check functions
  console.log('\n2️⃣ FUNCTIONS:');
  const functions = ['viewProduct', 'showAIStylist', 'showVirtualTryOn', 'showOutfitBuilder', 
                     'initVirtualTryOn', 'initOutfitBuilder', 'hideAllSections'];
  functions.forEach(fn => {
    console.log('  ' + (typeof window[fn] === 'function' ? '✓' : '❌') + ' ' + fn);
  });
  
  // 3. Check HTML sections
  console.log('\n3️⃣ HTML SECTIONS:');
  const sections = {
    'AI Stylist': 'ai-stylist-section',
    'Virtual Try-On': 'virtual-tryon',
    'Outfit Builder': 'outfit-builder',
    'Rewards': 'loyalty-program',
    'Products': 'product-section'
  };
  Object.entries(sections).forEach(([name, id]) => {
    const exists = document.getElementById(id);
    console.log('  ' + (exists ? '✓' : '❌') + ' ' + name + ' (' + id + ')');
  });
  
  // 4. Check product cards
  console.log('\n4️⃣ PRODUCT CARDS:');
  const cards = document.querySelectorAll('.product');
  console.log('  Total cards on page:', cards.length);
  if (cards.length > 0) {
    const withId = Array.from(cards).filter(c => c.dataset.productId).length;
    console.log('  Cards with product ID:', withId);
    console.log('  First card ID:', cards[0].dataset.productId || '❌ MISSING');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSTICS COMPLETE');
  console.log('='.repeat(60) + '\n');
};

// ── Auto-run diagnostics on load ─────────────────────────────────
window.addEventListener('load', function() {
  setTimeout(function() {
    console.log('\n🎯 COMPREHENSIVE FIX LOADED\n');
    console.log('Run window.runDiagnostics() to check everything\n');
  }, 1000);
});

console.log('✅ COMPREHENSIVE FIX INSTALLED\n');