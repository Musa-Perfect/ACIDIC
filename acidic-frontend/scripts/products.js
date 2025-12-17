// === PRODUCT DATA WITH VARIANTS & REAL IMAGES ===

// Generate unique IDs for products
function generateProductId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Define colors with hex values
const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Grey', hex: '#808080' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Red', hex: '#ff0000' },
    { name: 'Blue', hex: '#0000ff' },
    { name: 'Green', hex: '#008000' }
];

// Define size options
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Generate inventory for a product
function generateInventory(productName, category, baseStock = 20) {
    const inventory = [];
    
    // Determine available colors based on product
    let availableColors = ['Black', 'White'];
    if (category === 'tshirts') {
        availableColors = ['Black', 'White', 'Grey', 'Navy'];
    } else if (category === 'hoodies') {
        availableColors = ['Black', 'Grey', 'Navy'];
    }
    
    // Determine available sizes
    const availableSizes = category === 'accessories' ? ['One Size'] : sizeOptions;
    
    // Generate SKUs and stock
    availableColors.forEach(color => {
        availableSizes.forEach(size => {
            const sku = `ACID-${category.slice(0, 3).toUpperCase()}-${color.slice(0, 3).toUpperCase()}-${size}`;
            const stock = Math.floor(Math.random() * 10) + 5; // Random stock between 5-15
            
            inventory.push({
                sku,
                color,
                size,
                stock,
                lowStock: 5
            });
        });
    });
    
    return inventory;
}

// Calculate total stock from inventory
function calculateTotalStock(inventory) {
    return inventory.reduce((total, item) => total + item.stock, 0);
}

// Create product objects from your data
const productData = {
    allproducts: [],
    tshirts: [],
    sweaters: [],
    hoodies: [],
    pants: [],
    twopieces: [],
    accessories: []
};

// Convert your existing products to the new format
function createProductObject(name, price, img, category, id = null) {
    const productId = id || generateProductId();
    const inventory = generateInventory(name, category);
    const totalStock = calculateTotalStock(inventory);
    
    const colors = Array.from(new Set(inventory.map(item => item.color)));
    const sizes = Array.from(new Set(inventory.map(item => item.size)));
    
    return {
        id: productId,
        name: name,
        category: category,
        price: price,
        comparePrice: Math.round(price * 1.3), // Add 30% for compare price
        description: `Premium ${category} from ACIDIC Clothing. ${name} features unique design and high-quality materials.`,
        material: '100% Cotton',
        images: [img],
        variants: [
            { name: 'Color', options: colors },
            { name: 'Size', options: sizes }
        ],
        inventory: inventory,
        totalStock: totalStock,
        lowStockThreshold: 5,
        status: 'active',
        sku: `ACID-${category.slice(0, 3).toUpperCase()}-${productId.toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// Populate the products with your existing data
const tshirtData = [
    { name: "Infinite", price: 250, img: "acidic 3.jpg" },
    { name: "Infinite II", price: 350, img: "acidic 33.jpg" },
    { name: "Acidic Effect", price: 350, img: "acidic 4.jpg" },
    { name: "Lightning", price: 300, img: "acidic 19.jpg" },
    { name: "Naruto", price: 400, img: "acidic 14.jpg" },
    { name: "Hand Signature", price: 300, img: "acidic 16.jpg" },
    { name: "Hand Signature II", price: 300, img: "acidic 15.jpg" },
    { name: "Feather rainbow", price: 300, img: "acidic 26.jpg" },
    { name: "Angelic", price: 300, img: "acidic 1.jpg" },
    { name: "Rainbow", price: 350, img: "acidic 6.jpg" },
    { name: "Butterfly effect", price: 300, img: "acidic 9.jpg" }
];

const sweaterData = [
    { name: "Infinite", price: 350, img: "acidic 2.jpg" },
    { name: "Infinite II", price: 400, img: "acidic 7.jpg" },
    { name: "Acidic Effect", price: 450, img: "acidic m.jpg" },
    { name: "Angelic", price: 400, img: "acidic 1.jpg" },
    { name: "Rainbow", price: 400, img: "acidic 34.jpg" },
    { name: "Butterfly effect", price: 400, img: "acidic.jpg" }
];

const hoodieData = [
    { name: "Infinite II", price: 500, img: "acidic 8.jpg" },
    { name: "Feather rainbow", price: 450, img: "acidic 5.jpg" },
    { name: "Hand Signature", price: 450, img: "acidic 24.jpg" },
    { name: "Hand Signature II", price: 450, img: "acidic 23.jpg" },
    { name: "Naruto", price: 550, img: "acidic 22.jpg" },
    { name: "Angelic", price: 450, img: "acidic 25.jpg" },
    { name: "Rainbow", price: 450, img: "acidic 27.jpg" },
    { name: "Lightning", price: 450, img: "acidic 21.jpg" },
    { name: "Infinite", price: 400, img: "acidic 32.jpg" }
];

const pantsData = [
    { name: "Slim Fit Cargo", price: 499, img: "acidic 12.jpg" },
    { name: "Street Joggers", price: 459, img: "acidic 13.jpg" }
];

const twopiecesData = [
    { name: "Ladies Set", price: 500, img: "acidic 28.jpg" },
    { name: "Infinite Set", price: 500, img: "acidic 29.jpg" }
];

const accessoriesData = [
    { name: "Infinite Cap", price: 300, img: "acidic 31.jpg" },
    { name: "Rainbow Cap", price: 250, img: "acidic 30.jpg" }
];

// Create products for each category
tshirtData.forEach(item => {
    const product = createProductObject(item.name, item.price, item.img, 'tshirts');
    productData.tshirts.push(product);
    productData.allproducts.push(product);
});

sweaterData.forEach(item => {
    const product = createProductObject(item.name, item.price, item.img, 'sweaters');
    productData.sweaters.push(product);
    productData.allproducts.push(product);
});

hoodieData.forEach(item => {
    const product = createProductObject(item.name, item.price, item.img, 'hoodies');
    productData.hoodies.push(product);
    productData.allproducts.push(product);
});

pantsData.forEach(item => {
    const product = createProductObject(item.name, item.price, item.img, 'pants');
    productData.pants.push(product);
    productData.allproducts.push(product);
});

twopiecesData.forEach(item => {
    const product = createProductObject(item.name, item.price, item.img, 'twopieces');
    productData.twopieces.push(product);
    productData.allproducts.push(product);
});

accessoriesData.forEach(item => {
    // Accessories have different inventory (no sizes)
    const productId = generateProductId();
    const product = {
        id: productId,
        name: item.name,
        category: 'accessories',
        price: item.price,
        comparePrice: Math.round(item.price * 1.3),
        description: `${item.name} from ACIDIC. Premium accessory to complete your look.`,
        material: 'Cotton/Polyester',
        images: [item.img],
        variants: [
            { name: 'Color', options: ['Black', 'White'] }
        ],
        inventory: [
            { sku: `ACID-ACC-BLK-OS`, color: 'Black', size: 'One Size', stock: 15, lowStock: 5 },
            { sku: `ACID-ACC-WHT-OS`, color: 'White', size: 'One Size', stock: 10, lowStock: 5 }
        ],
        totalStock: 25,
        lowStockThreshold: 5,
        status: 'active',
        sku: `ACID-ACC-${productId.toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    productData.accessories.push(product);
    productData.allproducts.push(product);
});

// Save products to localStorage for admin system
function saveProductsToLocalStorage() {
    if (localStorage.getItem('acidicProducts')) {
        console.log('Products already exist in localStorage');
        return;
    }
    
    localStorage.setItem('acidicProducts', JSON.stringify(productData.allproducts));
    console.log('Products saved to localStorage:', productData.allproducts.length);
}

// === IMAGE ERROR HANDLING ===
function handleImageError(img) {
    console.log("Image failed to load:", img.src);
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
}

// === PRODUCT DISPLAY FUNCTIONS ===
// === PRODUCT DISPLAY FUNCTIONS ===
function showCategory(category) {
    // Hide all sections first
    const sections = document.querySelectorAll('.product-section, #product-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const section = document.getElementById("product-section");
    const mainContent = document.getElementById("main-content");
    if (!section) return;
    
    section.style.display = "grid";
    if (mainContent) mainContent.style.display = "block";
    section.classList.remove("active");
    section.innerHTML = "";

    if (productData[category]) {
        setTimeout(() => {
            productData[category].forEach((product) => {
                const div = document.createElement("div");
                div.classList.add("product");
                div.dataset.productId = product.id;
                div.innerHTML = `
                    <img src="${product.images[0]}" alt="${product.name}" onerror="handleImageError(this)">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">R${product.price}</p>
                        ${product.comparePrice ? `<p class="compare-price">R${product.comparePrice}</p>` : ''}
                        <p class="stock-status">${getStockStatus(product.totalStock, product.lowStockThreshold)}</p>
                        <div class="product-actions">
                            <button class="view-details" onclick="viewProduct(${product.id}, event)">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="quick-add" onclick="quickAddToCart(${product.id}, event)">
                                <i class="fas fa-cart-plus"></i> Quick Add
                            </button>
                        </div>
                    </div>`;
                
                // Make the whole product card clickable except buttons
                div.addEventListener('click', function(e) {
                    if (!e.target.closest('.product-actions') && !e.target.closest('button')) {
                        viewProduct(product.id, e);
                    }
                });
                
                section.appendChild(div);
            });
            
            if (section.classList) {
                requestAnimationFrame(() => section.classList.add("active"));
            }
        }, 150);
    }
}

function getStockStatus(stock, threshold) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
}

// === PRODUCT NAVIGATION ===
function viewProduct(productId) {
    // Open product page
    window.location.href = `product.html?id=${productId}`;
}

function quickAddToCart(productId, event) {
    if (event) event.stopPropagation();
    event.preventDefault();
    
    console.log('Quick add clicked for product:', productId);
    
    // Get product
    const product = productData.allproducts.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Check if out of stock
    if (product.totalStock <= 0) {
        showNotification(`${product.name} is out of stock!`, 'error');
        return;
    }
    
    console.log('Product found:', product.name);
    
    // Create modal for variant selection
    createQuickAddModal(product);
}
function addToCartSimple(product) {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    // Check if already in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: 'One Size',
            color: 'Default',
            image: product.images[0],
            category: product.category,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function addToCartWithVariants(product, color, size) {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    // Check if already in cart with same variants
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.color === color && 
        item.size === size
    );
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: size || 'One Size',
            color: color || 'Default',
            image: product.images[0],
            category: product.category,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} (${color || ''} ${size || ''}) added to cart!`);
}

// === CART FUNCTIONS ===
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #000;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    // Save products to localStorage
    saveProductsToLocalStorage();
    
    // Update cart count
    updateCartCount();
    
    // Show all products by default
    showCategory('allproducts');
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .product {
            transition: transform 0.3s ease;
        }
        
        .product:hover {
            transform: translateY(-5px);
        }
        
        .price {
            font-weight: bold;
            color: #000;
            font-size: 18px;
            margin: 5px 0;
        }
        
        .compare-price {
            text-decoration: line-through;
            color: #999;
            font-size: 14px;
            margin: 0;
        }
        
        .stock-status {
            font-size: 12px;
            margin: 5px 0;
        }
        
        .stock-status:before {
            content: '• ';
        }
        
        .view-details, .quick-add {
            padding: 8px 15px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
        }
        
        .view-details {
            background: #000;
            color: white;
        }
        
        .view-details:hover {
            background: #333;
        }
        
        .quick-add {
            background: #f4b400;
            color: #000;
        }
        
        .quick-add:hover {
            background: #ffcc33;
        }
        
        .product-info {
            padding: 15px;
            text-align: center;
        }
        
        .product-info h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
});

// === LEGACY FUNCTIONS (keep for compatibility) ===
function openProductPage(item) {
    // Find the product by name
    const product = productData.allproducts.find(p => p.name === item.name);
    if (product) {
        window.location.href = `product.html?id=${product.id}`;
    } else {
        // Fallback to old system
        const id = encodeURIComponent(item.name);  
        window.location.href = `product.html?id=${id}`;
    }
}

function closeModal() {
    document.getElementById("product-modal").classList.remove("active");
}

function showCustomizeModal() {
    closeModal();
    document.getElementById("customize-modal").classList.add("active");
}

function closeCustomize() {
    document.getElementById("customize-modal").classList.remove("active");
}

function selectColor(element, color) {
    selectedColor = color;
    document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("active");
    });
    element.classList.add("active");
}

// Size recommender
function showSizeRecommender() {
    const modal = document.getElementById("size-recommender-modal");
    modal.classList.add("active");
}

function closeSizeRecommender() {
    document.getElementById("size-recommender-modal").classList.remove("active");
}

function calculateSize() {
    const height = parseInt(document.getElementById("user-height").value);
    const weight = parseInt(document.getElementById("user-weight").value);
    const fit = document.getElementById("preferred-fit").value;

    if (!height || !weight) {
        alert("Please enter your height and weight.");
        return;
    }

    let size = "Medium"; // Default

    // Simple size calculation logic
    if (height < 165) {
        size = fit === "oversized" ? "Medium" : "Small";
    } else if (height >= 165 && height < 180) {
        if (weight < 70) {
            size = fit === "slim" ? "Small" : fit === "oversized" ? "Large" : "Medium";
        } else {
            size = fit === "slim" ? "Medium" : fit === "oversized" ? "Extra Large" : "Large";
        }
    } else {
        size = fit === "slim" ? "Large" : "Extra Large";
    }

    document.getElementById("size-result").textContent = `Recommended Size: ${size}`;
}

// Make products available globally
window.productData = productData;

// === PRODUCT DISPLAY FUNCTIONS ===
function showCategory(category) {
    hideAllSections();
    const section = document.getElementById("product-section");
    const mainContent = document.getElementById("main-content");
    section.style.display = "grid";
    mainContent.style.display = "block";
    section.classList.remove("active");
    section.innerHTML = "";

    if (productData[category]) {
        setTimeout(() => {
            productData[category].forEach((product) => {
                const div = document.createElement("div");
                div.classList.add("product");
                div.dataset.productId = product.id; // Add product ID to dataset
                div.innerHTML = `
                    <img src="${product.images[0]}" alt="${product.name}" onerror="handleImageError(this)">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">R${product.price}</p>
                        ${product.comparePrice ? `<p class="compare-price">R${product.comparePrice}</p>` : ''}
                        <p class="stock-status ${getStockStatusClass(product.totalStock, product.lowStockThreshold)}">
                            ${getStockStatus(product.totalStock, product.lowStockThreshold)}
                        </p>
                        <div class="product-actions">
                            <button class="view-details" onclick="viewProductDetails(${product.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="quick-add" onclick="quickAddToCart(${product.id}, event)">
                                <i class="fas fa-cart-plus"></i> Quick Add
                            </button>
                        </div>
                    </div>`;
                section.appendChild(div);
            });
            requestAnimationFrame(() => section.classList.add("active"));
        }, 150);
    }
}

function getStockStatusClass(stock, threshold) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= threshold) return 'low-stock';
    return 'in-stock';
}

// === VIEW PRODUCT DETAILS FUNCTION ===
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

// === FIX FOR LEGACY FUNCTION ===
function openProductPage(item) {
    if (item.id) {
        viewProduct(item.id);
    } else if (item.name) {
        const product = window.productData.allproducts.find(p => p.name === item.name);
        if (product) {
            viewProduct(product.id);
        } else {
            showNotification('Product not found', 'error');
        }
    }
}

// === QUICK ADD TO CART FUNCTION ===
function quickAddToCart(productId, event) {
    if (event) event.stopPropagation();
    
    // Get product
    const product = productData.allproducts.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Check if out of stock
    if (product.totalStock <= 0) {
        showNotification(`${product.name} is out of stock!`, 'error');
        return;
    }
    
    // Create modal for variant selection
    createQuickAddModal(product);
}

// === CREATE QUICK ADD MODAL ===
function createQuickAddModal(product) {
    // Remove existing modal
    const existingModal = document.getElementById('quick-add-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal HTML
    const modalHTML = `
        <div id="quick-add-modal" class="quick-add-modal">
            <div class="quick-add-content">
                <div class="modal-header">
                    <h3>Add ${product.name} to Cart</h3>
                    <span class="close-modal" onclick="closeQuickAddModal()">×</span>
                </div>
                
                <div class="modal-body">
                    <div class="product-preview">
                        <img src="${product.images[0]}" alt="${product.name}">
                        <div class="preview-info">
                            <h4>${product.name}</h4>
                            <p class="price">R${product.price}</p>
                            <p class="category">${formatCategory(product.category)}</p>
                        </div>
                    </div>
                    
                    <div class="variant-selection">
                        ${getVariantHTML(product)}
                    </div>
                    
                    <div class="quantity-selection">
                        <label>Quantity:</label>
                        <div class="quantity-control">
                            <button class="qty-btn" onclick="updateQuickAddQty(-1)">-</button>
                            <input type="number" id="quick-add-qty" value="1" min="1" max="10">
                            <button class="qty-btn" onclick="updateQuickAddQty(1)">+</button>
                        </div>
                    </div>
                    
                    <div class="stock-info" id="quick-add-stock-info">
                        <i class="fas fa-box"></i>
                        <span>${product.totalStock} in stock</span>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="closeQuickAddModal()">Cancel</button>
                    <button class="add-btn" onclick="processQuickAdd(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add event listeners for variant selection
    setupVariantSelection(product);
}

// === GET VARIANT HTML ===
function getVariantHTML(product) {
    let html = '';
    
    // Color selection
    const colorVariant = product.variants?.find(v => v.name === 'Color');
    if (colorVariant) {
        html += `
            <div class="variant-group">
                <label>Color:</label>
                <div class="variant-options" id="color-options">
                    ${colorVariant.options.map((color, index) => `
                        <div class="variant-option ${index === 0 ? 'selected' : ''}" 
                             data-type="color" 
                             data-value="${color}"
                             onclick="selectVariantOption(this, 'color')">
                            ${color === 'Black' ? '<div class="color-swatch" style="background: #000"></div>' : ''}
                            ${color === 'White' ? '<div class="color-swatch" style="background: #fff; border: 1px solid #ddd"></div>' : ''}
                            ${color === 'Grey' ? '<div class="color-swatch" style="background: #808080"></div>' : ''}
                            ${color === 'Navy' ? '<div class="color-swatch" style="background: #000080"></div>' : ''}
                            ${color === 'Red' ? '<div class="color-swatch" style="background: #ff0000"></div>' : ''}
                            ${color === 'Blue' ? '<div class="color-swatch" style="background: #0000ff"></div>' : ''}
                            ${color === 'Green' ? '<div class="color-swatch" style="background: #008000"></div>' : ''}
                            ${!['Black','White','Grey','Navy','Red','Blue','Green'].includes(color) ? 
                              `<span class="variant-label">${color}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Size selection
    const sizeVariant = product.variants?.find(v => v.name === 'Size');
    if (sizeVariant) {
        html += `
            <div class="variant-group">
                <label>Size:</label>
                <div class="variant-options" id="size-options">
                    ${sizeVariant.options.map((size, index) => {
                        // Check if size is available for selected color
                        const isAvailable = checkSizeAvailability(product, size);
                        return `
                            <div class="variant-option ${index === 0 && isAvailable ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}" 
                                 data-type="size" 
                                 data-value="${size}"
                                 ${isAvailable ? 'onclick="selectVariantOption(this, \'size\')"' : ''}
                                 title="${!isAvailable ? 'Out of stock' : ''}">
                                <span class="variant-label">${size}</span>
                                ${!isAvailable ? '<span class="unavailable-badge">Out</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

// === VARIANT SELECTION FUNCTIONS ===
function setupVariantSelection(product) {
    // Store selected variants
    window.selectedVariant = {
        color: product.variants?.find(v => v.name === 'Color')?.options[0] || null,
        size: product.variants?.find(v => v.name === 'Size')?.options[0] || null
    };
}

function selectVariantOption(element, type) {
    if (element.classList.contains('unavailable')) return;
    
    // Remove selected class from all options of this type
    const options = document.querySelectorAll(`[data-type="${type}"]`);
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    element.classList.add('selected');
    
    // Update selected variant
    window.selectedVariant[type] = element.dataset.value;
    
    // Update stock info if both variants selected
    updateStockInfo();
}

function updateStockInfo() {
    const productId = parseInt(document.querySelector('.add-btn').onclick.toString().match(/\d+/)[0]);
    const product = productData.allproducts.find(p => p.id === productId);
    
    if (!product || !product.inventory) return;
    
    // Find inventory item for selected variants
    const inventoryItem = product.inventory.find(item => 
        (!window.selectedVariant.color || item.color === window.selectedVariant.color) &&
        (!window.selectedVariant.size || item.size === window.selectedVariant.size)
    );
    
    const stockInfo = document.getElementById('quick-add-stock-info');
    if (inventoryItem) {
        stockInfo.innerHTML = `
            <i class="fas fa-box"></i>
            <span>${inventoryItem.stock} in stock</span>
        `;
        stockInfo.style.color = inventoryItem.stock > 0 ? '#4CAF50' : '#ff4444';
    } else {
        stockInfo.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Check availability</span>
        `;
        stockInfo.style.color = '#ff9800';
    }
}

function checkSizeAvailability(product, size) {
    if (!product.inventory) return true;
    
    const color = window.selectedVariant?.color || product.variants?.find(v => v.name === 'Color')?.options[0];
    
    const item = product.inventory.find(i => 
        i.size === size && 
        (!color || i.color === color)
    );
    
    return item ? item.stock > 0 : false;
}

// === QUANTITY FUNCTIONS ===
function updateQuickAddQty(change) {
    const input = document.getElementById('quick-add-qty');
    let value = parseInt(input.value) + change;
    
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    
    input.value = value;
}

// === PROCESS QUICK ADD ===
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
                         'Default';
    const selectedSize = window.selectedVariant?.size || 
                        product.variants?.find(v => v.name === 'Size')?.options[0] || 
                        'One Size';
    
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
    
    // Create cart item
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        image: product.images?.[0] || 'acidic 1.jpg',
        category: product.category,
        addedAt: new Date().toISOString(),
        sku: product.sku || `ACID-${product.id}`
    };
    
    console.log('Adding to cart:', cartItem);
    
    // Add to cart
    addItemToCart(cartItem);
    
    // Close modal
    closeQuickAddModal();
    
    // Show success message
    showNotification(`${quantity} x ${product.name} added to cart!`, 'success');
    
    // Update inventory
    updateProductInventory(cartItem);
}

// === ADD ITEM TO CART (Fixed) ===
// === ADD ITEM TO CART (Fixed) ===
function addItemToCart(cartItem) {
    console.log('Adding item to cart:', cartItem);
    
    // Get current cart - USE SAME KEY as cart.js
    let cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    console.log('Current cart items:', cart.length);
    
    // Check if item already exists with same variants
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id &&
        item.size === cartItem.size &&
        item.color === cartItem.color
    );
    
    if (existingIndex !== -1) {
        // Update quantity
        cart[existingIndex].quantity += cartItem.quantity;
        console.log('Updated existing item:', cart[existingIndex]);
    } else {
        // Add new item
        cart.push(cartItem);
        console.log('Added new item to cart');
    }
    
    // Save to localStorage - USE SAME KEY
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    console.log('Saved cart to localStorage, total items:', cart.length);
    
    // Update cart count display
    updateCartCount();
    
    // Show cart feedback
    showCartFeedback(cartItem);
    
    // Also trigger cart.js update if available
    if (typeof window.loadCartItems === 'function') {
        window.loadCartItems();
    }
}

// === SHOW CART FEEDBACK ===
function showCartFeedback(item) {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #000;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    feedback.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${item.image}" alt="${item.name}" 
                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">Added to Cart</div>
                <div style="font-size: 14px;">${item.name}</div>
                <div style="font-size: 12px; color: #ccc;">
                    ${item.quantity} × R${item.price} • ${item.color} • ${item.size}
                </div>
            </div>
        </div>
        <div>
            <button onclick="viewCart()" 
                    style="background: #f4b400; color: #000; border: none; padding: 8px 15px; 
                           border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">
                View Cart
            </button>
        </div>
    `;
    
    document.body.appendChild(feedback);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (feedback.parentNode) feedback.remove();
        }, 300);
    }, 5000);
}

// === VIEW CART ===
function viewCart() {
    // Close any modals
    closeQuickAddModal();
    
    // Toggle cart sidebar (if exists)
    if (typeof toggleCart === 'function') {
        toggleCart(true);
    } else {
        // Fallback: Show cart items
        showCartItems();
    }
}

// === SHOW CART ITEMS (Fallback) ===
function showCartItems() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    let message = 'Your Cart:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${item.quantity}x ${item.name} (${item.color}, ${item.size}) - R${itemTotal}\n`;
    });
    
    message += `\nTotal: R${total}`;
    message += `\n\nProceed to checkout?`;
    
    if (confirm(message)) {
        // Redirect to checkout
        if (typeof checkout === 'function') {
            checkout();
        } else {
            alert('Proceeding to checkout...');
        }
    }
}

// === UPDATE CART COUNT (Fixed) ===
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update cart count in multiple places
        const cartCountElements = [
            document.getElementById('cart-count'),
            document.querySelector('.cart-count'),
            document.querySelector('[id*="cart-count"]')
        ];
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = totalItems;
                element.style.display = totalItems > 0 ? 'block' : 'none';
            }
        });
        
        console.log('Cart count updated:', totalItems, 'items');
        
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// === UPDATE PRODUCT INVENTORY (Fixed) ===
function updateProductInventory(cartItem) {
    try {
        // Get products from localStorage or productData
        let products = JSON.parse(localStorage.getItem('acidicProducts')) || productData.allproducts;
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        
        if (productIndex === -1) {
            console.log('Product not found in inventory:', cartItem.id);
            return;
        }
        
        const product = products[productIndex];
        
        // Update inventory if it exists
        if (product.inventory && product.inventory.length > 0) {
            // Find the specific variant
            const variantIndex = product.inventory.findIndex(v => 
                v.size === cartItem.size && 
                v.color === cartItem.color
            );
            
            if (variantIndex !== -1) {
                // Reduce stock
                const oldStock = product.inventory[variantIndex].stock;
                product.inventory[variantIndex].stock = Math.max(0, oldStock - cartItem.quantity);
                
                console.log(`Inventory updated: ${cartItem.color} ${cartItem.size} from ${oldStock} to ${product.inventory[variantIndex].stock}`);
                
                // Update total stock
                product.totalStock = product.inventory.reduce((sum, v) => sum + (v.stock || 0), 0);
                
                // Save back to localStorage
                localStorage.setItem('acidicProducts', JSON.stringify(products));
                
                // Update productData for current session
                const productDataIndex = productData.allproducts.findIndex(p => p.id === cartItem.id);
                if (productDataIndex !== -1) {
                    productData.allproducts[productDataIndex] = product;
                }
            }
        }
        
    } catch (error) {
        console.error('Error updating product inventory:', error);
    }
}

// === FIX PRODUCT PAGE REDIRECTION ===

// Update your main.js to handle product clicks
if (typeof openProductPage !== 'undefined') {
    // Override the old function
    openProductPage = function(item) {
        // If item is a product object with ID
        if (item.id) {
            viewProductDetails(item.id);
        } 
        // If item is from old system (just name, price, img)
        else if (item.name) {
            // Find product by name
            const product = productData.allproducts.find(p => p.name === item.name);
            if (product) {
                viewProductDetails(product.id);
            } else {
                // Fallback: create a temporary product
                const tempProduct = {
                    id: Date.now(),
                    name: item.name,
                    price: item.price,
                    images: [item.img],
                    category: 'allproducts',
                    description: `${item.name} from ACIDIC Clothing.`,
                    variants: [
                        { name: 'Color', options: ['Black', 'White'] },
                        { name: 'Size', options: ['S', 'M', 'L', 'XL'] }
                    ],
                    totalStock: 10
                };
                
                // Store temporarily
                sessionStorage.setItem('currentProduct', JSON.stringify(tempProduct));
                window.location.href = `product.html?id=${tempProduct.id}`;
            }
        }
    };
}

// === ADDITIONAL CSS FOR FEEDBACK ===
function addCartFeedbackStyles() {
    const styles = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .cart-feedback {
            animation: slideIn 0.3s ease;
        }
        
        .cart-feedback button:hover {
            background: #ffcc33 !important;
        }
        
        /* Update existing cart styles */
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #f4b400;
            color: #000;
            font-size: 11px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        /* Make sure cart icon shows count */
        .cart-icon {
            position: relative;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === INITIALIZE WITH FIXES ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing product system...');
    
    // Add styles
    addModalStyles();
    addCartFeedbackStyles();
    
    // Save products to localStorage
    saveProductsToLocalStorage();
    
    // Update cart count
    updateCartCount();
    
    // Show all products by default
    showCategory('allproducts');
    
    // Add global event listener for product clicks
    document.addEventListener('click', function(e) {
        // Handle product card clicks (except buttons)
        if (e.target.closest('.product') && !e.target.closest('button')) {
            const productElement = e.target.closest('.product');
            const productId = productElement.dataset.productId;
            
            if (productId) {
                viewProductDetails(parseInt(productId));
            }
        }
    });
});

// === DEBUG FUNCTION ===
function debugCart() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    console.log('Cart contents:', cart);
    console.log('Cart total items:', cart.reduce((sum, item) => sum + item.quantity, 0));
    alert(`Cart has ${cart.length} unique items, ${cart.reduce((sum, item) => sum + item.quantity, 0)} total items`);
}

// === SHOW CART FEEDBACK ===
function showCartFeedback(item) {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #000;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    feedback.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${item.image}" alt="${item.name}" 
                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">Added to Cart</div>
                <div style="font-size: 14px;">${item.name}</div>
                <div style="font-size: 12px; color: #ccc;">
                    ${item.quantity} × R${item.price} • ${item.color} • ${item.size}
                </div>
            </div>
        </div>
        <div>
            <button onclick="viewCart()" 
                    style="background: #f4b400; color: #000; border: none; padding: 8px 15px; 
                           border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">
                View Cart
            </button>
        </div>
    `;
    
    document.body.appendChild(feedback);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (feedback.parentNode) feedback.remove();
        }, 300);
    }, 5000);
}

// === VIEW CART ===
function viewCart() {
    // Close any modals
    closeQuickAddModal();
    
    // Toggle cart sidebar (if exists)
    if (typeof toggleCart === 'function') {
        toggleCart(true);
    } else {
        // Fallback: Show cart items
        showCartItems();
    }
}

// === SHOW CART ITEMS (Fallback) ===
function showCartItems() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    let message = 'Your Cart:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${item.quantity}x ${item.name} (${item.color}, ${item.size}) - R${itemTotal}\n`;
    });
    
    message += `\nTotal: R${total}`;
    message += `\n\nProceed to checkout?`;
    
    if (confirm(message)) {
        // Redirect to checkout
        if (typeof checkout === 'function') {
            checkout();
        } else {
            alert('Proceeding to checkout...');
        }
    }
}

// === UPDATE CART COUNT (Fixed) ===
function updateCartCount() {
    try {
        // Use the same cart key
        const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        console.log('Updating cart count:', totalItems, 'items');
        
        // Update cart count in multiple places
        const cartCountElements = [
            document.getElementById('cart-count'),
            document.querySelector('.cart-count'),
            document.querySelector('[id*="cart-count"]'),
            document.querySelectorAll('.cart-count')
        ];
        
        // Flatten and deduplicate elements
        const allElements = [];
        cartCountElements.forEach(element => {
            if (Array.isArray(element)) {
                element.forEach(el => {
                    if (el && !allElements.includes(el)) allElements.push(el);
                });
            } else if (element && !allElements.includes(element)) {
                allElements.push(element);
            }
        });
        
        // Also find by class name
        document.querySelectorAll('.cart-count').forEach(el => {
            if (!allElements.includes(el)) allElements.push(el);
        });
        
        // Update all found elements
        allElements.forEach(element => {
            if (element) {
                element.textContent = totalItems;
                if (totalItems > 0) {
                    element.style.display = 'flex';
                    element.style.opacity = '1';
                } else {
                    element.style.display = 'none';
                    element.style.opacity = '0';
                }
            }
        });
        
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// === UPDATE PRODUCT INVENTORY (Fixed) ===
function updateProductInventory(cartItem) {
    try {
        // Get products from localStorage or productData
        let products = JSON.parse(localStorage.getItem('acidicProducts')) || productData.allproducts;
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        
        if (productIndex === -1) {
            console.log('Product not found in inventory:', cartItem.id);
            return;
        }
        
        const product = products[productIndex];
        
        // Update inventory if it exists
        if (product.inventory && product.inventory.length > 0) {
            // Find the specific variant
            const variantIndex = product.inventory.findIndex(v => 
                v.size === cartItem.size && 
                v.color === cartItem.color
            );
            
            if (variantIndex !== -1) {
                // Reduce stock
                const oldStock = product.inventory[variantIndex].stock;
                product.inventory[variantIndex].stock = Math.max(0, oldStock - cartItem.quantity);
                
                console.log(`Inventory updated: ${cartItem.color} ${cartItem.size} from ${oldStock} to ${product.inventory[variantIndex].stock}`);
                
                // Update total stock
                product.totalStock = product.inventory.reduce((sum, v) => sum + (v.stock || 0), 0);
                
                // Save back to localStorage
                localStorage.setItem('acidicProducts', JSON.stringify(products));
                
                // Update productData for current session
                const productDataIndex = productData.allproducts.findIndex(p => p.id === cartItem.id);
                if (productDataIndex !== -1) {
                    productData.allproducts[productDataIndex] = product;
                }
            }
        }
        
    } catch (error) {
        console.error('Error updating product inventory:', error);
    }
}

// === FIX PRODUCT PAGE REDIRECTION ===

// Update your main.js to handle product clicks
if (typeof openProductPage !== 'undefined') {
    // Override the old function
    openProductPage = function(item) {
        // If item is a product object with ID
        if (item.id) {
            viewProductDetails(item.id);
        } 
        // If item is from old system (just name, price, img)
        else if (item.name) {
            // Find product by name
            const product = productData.allproducts.find(p => p.name === item.name);
            if (product) {
                viewProductDetails(product.id);
            } else {
                // Fallback: create a temporary product
                const tempProduct = {
                    id: Date.now(),
                    name: item.name,
                    price: item.price,
                    images: [item.img],
                    category: 'allproducts',
                    description: `${item.name} from ACIDIC Clothing.`,
                    variants: [
                        { name: 'Color', options: ['Black', 'White'] },
                        { name: 'Size', options: ['S', 'M', 'L', 'XL'] }
                    ],
                    totalStock: 10
                };
                
                // Store temporarily
                sessionStorage.setItem('currentProduct', JSON.stringify(tempProduct));
                window.location.href = `product.html?id=${tempProduct.id}`;
            }
        }
    };
}

// === ADDITIONAL CSS FOR FEEDBACK ===
function addCartFeedbackStyles() {
    const styles = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .cart-feedback {
            animation: slideIn 0.3s ease;
        }
        
        .cart-feedback button:hover {
            background: #ffcc33 !important;
        }
        
        /* Update existing cart styles */
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #f4b400;
            color: #000;
            font-size: 11px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        /* Make sure cart icon shows count */
        .cart-icon {
            position: relative;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing ACIDIC Clothing store...');
    
    // Add modal styles
    addModalStyles();
    addCartFeedbackStyles();
    
    // Save products to localStorage
    saveProductsToLocalStorage();
    
    // Update cart count
    updateCartCount();
    
    // Make sure productData is globally available
    window.productData = productData;
    
    // Show all products by default
    if (document.getElementById("product-section")) {
        showCategory('allproducts');
    }
    
    // Add global event listener for product clicks
    document.addEventListener('click', function(e) {
        // Handle product card clicks (except buttons)
        if (e.target.closest('.product') && !e.target.closest('button')) {
            const productElement = e.target.closest('.product');
            const productId = productElement.dataset.productId;
            
            if (productId) {
                viewProduct(parseInt(productId), e);
            }
        }
    });
    
    console.log('Product system initialized successfully');
});

// === DEBUG FUNCTION ===
function debugCart() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    console.log('Cart contents:', cart);
    console.log('Cart total items:', cart.reduce((sum, item) => sum + item.quantity, 0));
    alert(`Cart has ${cart.length} unique items, ${cart.reduce((sum, item) => sum + item.quantity, 0)} total items`);
}

// === ADD ITEM TO CART ===
function addItemToCart(cartItem) {
    let cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    // Check if item already exists with same variants
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id &&
        item.size === cartItem.size &&
        item.color === cartItem.color
    );
    
    if (existingIndex !== -1) {
        // Update quantity
        cart[existingIndex].quantity += cartItem.quantity;
    } else {
        // Add new item
        cart.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    
    // Update cart count display
    updateCartCount();
    
    // Update inventory (reduce stock)
    updateProductInventory(cartItem);
}

// === UPDATE PRODUCT INVENTORY ===
function updateProductInventory(cartItem) {
    const products = JSON.parse(localStorage.getItem('acidicProducts')) || productData.allproducts;
    const productIndex = products.findIndex(p => p.id === cartItem.id);
    
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    
    if (product.inventory) {
        // Find the specific variant
        const variantIndex = product.inventory.findIndex(v => 
            v.size === cartItem.size && 
            v.color === cartItem.color
        );
        
        if (variantIndex !== -1) {
            // Reduce stock
            product.inventory[variantIndex].stock = Math.max(0, product.inventory[variantIndex].stock - cartItem.quantity);
            
            // Update total stock
            product.totalStock = product.inventory.reduce((sum, v) => sum + v.stock, 0);
            
            // Update product data
            products[productIndex] = product;
            
            // Save back to localStorage
            localStorage.setItem('acidicProducts', JSON.stringify(products));
            
            // Update productData for current session
            const productDataIndex = productData.allproducts.findIndex(p => p.id === cartItem.id);
            if (productDataIndex !== -1) {
                productData.allproducts[productDataIndex] = product;
            }
        }
    }
}

// === CLOSE QUICK ADD MODAL ===
function closeQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) modal.remove();
}

// === NOTIFICATION SYSTEM ===
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.getElementById('notification');
    if (existing) existing.remove();
    
    const colors = {
        success: '#4CAF50',
        error: '#ff4444',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 3000);
}

// === HELPER FUNCTIONS ===
function formatCategory(category) {
    const categoryMap = {
        'tshirts': 'T-Shirts',
        'sweaters': 'Sweaters',
        'hoodies': 'Hoodies',
        'pants': 'Pants',
        'twopieces': 'Two Pieces',
        'accessories': 'Accessories'
    };
    return categoryMap[category] || category;
}

// === ADD CSS FOR MODAL AND NOTIFICATIONS ===
function addModalStyles() {
    const styles = `
        /* Quick Add Modal */
        .quick-add-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        
        .quick-add-content {
            background: white;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .close-modal {
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .close-modal:hover {
            color: #000;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .product-preview {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .product-preview img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .preview-info h4 {
            margin: 0 0 5px 0;
        }
        
        .preview-info .price {
            font-weight: bold;
            color: #000;
            margin: 5px 0;
        }
        
        .preview-info .category {
            color: #666;
            font-size: 14px;
        }
        
        .variant-group {
            margin-bottom: 20px;
        }
        
        .variant-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .variant-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .variant-option {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s;
        }
        
        .variant-option:hover {
            border-color: #999;
        }
        
        .variant-option.selected {
            border-color: #000;
            background: #000;
            color: white;
        }
        
        .variant-option.unavailable {
            opacity: 0.5;
            cursor: not-allowed;
            position: relative;
        }
        
        .unavailable-badge {
            font-size: 10px;
            background: #ff4444;
            color: white;
            padding: 2px 5px;
            border-radius: 10px;
            margin-left: 5px;
        }
        
        .color-swatch {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1px solid #eee;
        }
        
        .quantity-selection {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .quantity-control {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .qty-btn {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .qty-btn:hover {
            background: #f5f5f5;
        }
        
        #quick-add-qty {
            width: 50px;
            height: 30px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .stock-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #4CAF50;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .modal-footer {
            display: flex;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid #eee;
        }
        
        .cancel-btn, .add-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .cancel-btn {
            background: #f5f5f5;
            color: #666;
        }
        
        .cancel-btn:hover {
            background: #e0e0e0;
        }
        
        .add-btn {
            background: #000;
            color: white;
        }
        
        .add-btn:hover {
            background: #333;
        }
        
        .add-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        /* Product Actions */
        .product-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .product-actions button {
            flex: 1;
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
        }
        
        .view-details {
            background: #000;
            color: white;
        }
        
        .view-details:hover {
            background: #333;
        }
        
        .quick-add {
            background: #f4b400;
            color: #000;
        }
        
        .quick-add:hover {
            background: #ffcc33;
        }
        
        /* Product Card Hover */
        .product:hover .product-actions {
            opacity: 1;
            transform: translateY(0);
        }
        
        .product-actions {
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', function() {
    // Add modal styles
    addModalStyles();
    
    // Save products to localStorage
    saveProductsToLocalStorage();
    
    // Update cart count
    updateCartCount();
    
    // Show all products by default
    showCategory('allproducts');
});

// Debug function to check cart status
function debugCartStatus() {
    const acidicCart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    const oldCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    console.log('=== CART DEBUG ===');
    console.log('acidicCart items:', acidicCart.length);
    console.log('acidicCart contents:', acidicCart);
    console.log('oldCart items:', oldCart.length);
    console.log('oldCart contents:', oldCart);
    
    alert(`Cart Debug:\n\nacidicCart: ${acidicCart.length} items\noldCart: ${oldCart.length} items\n\nCheck console for details.`);
    
    // Fix: If old cart has items but acidicCart doesn't, migrate them
    if (oldCart.length > 0 && acidicCart.length === 0) {
        localStorage.setItem('acidicCart', JSON.stringify(oldCart));
        console.log('Migrated old cart to acidicCart');
        updateCartCount();
    }
}

// === MISSING HELPER FUNCTIONS ===
function hideAllSections() {
    const sections = document.querySelectorAll('.product-section, #product-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const colors = {
        success: '#4CAF50',
        error: '#ff4444',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white;">×</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${colors[type]};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}