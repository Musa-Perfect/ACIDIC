// === PRODUCT DATA WITH VARIANTS & REAL IMAGES ===

// Generate unique IDs for products
function generateProductId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/* ===============================
   COLOR SYSTEM – SINGLE SOURCE
================================ */

const COLOR_MAP = {
  Black: "#000000",
  White: "#ffffff",
  Red: "#ff0000",
  Blue: "#0000ff",
  Lime: "#00ff00",
  Cyan: "#00ffff",
  Cream: "#fffdd0",
  Green: "#008000",
  Brown: "#964b00",
  Pink: "#ffc0cb"
};

const COLOR_LIST = Object.keys(COLOR_MAP);
const colorOptions = COLOR_LIST.map(colorName => ({ name: colorName }));

// Define size options
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function getColorSwatchHTML(colorName, selected = false) {
  const hex = COLOR_MAP[colorName];

  return `
    <button
      class="color-swatch-btn ${selected ? "selected" : ""}"
      data-color="${colorName}"
      onclick="selectColorSwatch(this)"
      aria-label="${colorName}"
      type="button"
    >
      <span 
        class="color-swatch-circle"
        style="
          background-color: ${hex};
          ${colorName === "White" || colorName === "Cream"
            ? "border: 1px solid #ccc;"
            : ""}
        ">
      </span>
    </button>
  `;
}

let selectedColor = COLOR_LIST[0];

function selectColorSwatch(btn) {
  const parent = btn.closest(".color-swatch-group");

  parent.querySelectorAll(".color-swatch-btn").forEach(b => {
    b.classList.remove("selected");
  });

  btn.classList.add("selected");
  selectedColor = btn.dataset.color;

  // Optional live label update
  const label = parent.querySelector(".selected-color-label");
  if (label) label.textContent = selectedColor;
}

function renderColorOptions(product) {
  return `
    <div class="variant-group">
      <label>Color</label>
      <div class="color-swatch-group">
        ${COLOR_LIST.map((color, i) =>
          getColorSwatchHTML(color, i === 0)
        ).join("")}
      </div>
      <div class="selected-color-label">${COLOR_LIST[0]}</div>
    </div>
  `;
}

function renderMiniColors() {
  return `
    <div class="mini-colors">
      ${COLOR_LIST.map(color => `
        <span 
          class="mini-color"
          style="
            background:${COLOR_MAP[color]};
            ${color === "White" || color === "Cream"
              ? "border:1px solid #ccc"
              : ""}
          "
          title="${color}">
        </span>
      `).join("")}
    </div>
  `;
}

variants: [
  { name: "Color", options: COLOR_LIST },
  { name: "Size", options: sizeOptions }
]


// Generate inventory for a product
function generateInventory(productName, category, baseStock = 20) {
    const inventory = [];
    
    // Use ALL colors for ALL products
    const availableColors = colorOptions.map(color => color.name);
    
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
    
    const colors = colorOptions.map(c => c.name); // ALL COLORS
    const sizes = Array.from(new Set(inventory.map(item => item.size)));
    
    return {
        id: productId,
        name: name,
        category: category,
        price: price,
        comparePrice: Math.round(price * 1.3), // Add 30% for compare price
        description: `Premium ${category} from ACIDIC Clothing. ${name} features unique design and high-quality materials. Available in ${colors.length} colors.`,
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
    const inventory = colorOptions.map(color => ({
        sku: `ACID-ACC-${color.name.slice(0, 3).toUpperCase()}-OS`,
        color: color.name,
        size: 'One Size',
        stock: Math.floor(Math.random() * 10) + 5,
        lowStock: 5
    }));
    
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
            { name: 'Color', options: colorOptions.map(c => c.name) }
        ],
        inventory: inventory,
        totalStock: inventory.reduce((sum, item) => sum + item.stock, 0),
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

// === COLOR SWATCH HELPER ===
function getColorSwatchHTML(colorName) {
    // Color hex mapping for all colors
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
    
    const hex = colorHexMap[colorName] || '#cccccc';
    const needsBorder = colorName === 'White' || colorName === 'Cream';
    
    return `
        <div class="color-swatch" style="background: ${hex} !important; ${needsBorder ? 'border: 2px solid #ccc !important' : 'border: 1px solid #eee'}"></div>
        <span class="variant-label">${colorName}</span>
    `;
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
                            ${getColorSwatchHTML(color)}
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

// === ADD CSS FOR COLOR SWATCHES ===
function addColorSwatchStyles() {
    const styles = `
        /* Color Swatch Styles */
        .color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-block !important;
            vertical-align: middle;
            margin-right: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }
        
        .variant-option.selected .color-swatch {
            border-color: #000 !important;
            transform: scale(1.1);
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        }
        
        .variant-option:hover .color-swatch {
            transform: scale(1.05);
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }
        
        /* Ensure ALL colors display correctly */
        [data-value="Black"] .color-swatch { background: #000000 !important; }
        [data-value="White"] .color-swatch { background: #ffffff !important; border: 2px solid #ccc !important; }
        [data-value="Red"] .color-swatch { background: #ff0000 !important; }
        [data-value="Blue"] .color-swatch { background: #0000ff !important; }
        [data-value="Lime"] .color-swatch { background: #00ff00 !important; }
        [data-value="Cyan"] .color-swatch { background: #00ffff !important; }
        [data-value="Cream"] .color-swatch { background: #fffdd0 !important; border: 2px solid #ccc !important; }
        [data-value="Green"] .color-swatch { background: #008000 !important; }
        [data-value="Brown"] .color-swatch { background: #964b00 !important; }
        [data-value="Pink"] .color-swatch { background: #ffc0cb !important; }
        
        .variant-label {
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            font-weight: 500;
        }
        
        /* Color display in product cards */
        .product-colors {
            display: flex;
            gap: 5px;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        
        .mini-color-swatch {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-block;
            border: 1px solid #eee;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .mini-color-swatch:hover {
            transform: scale(1.2);
        }
        
        /* Color tags in product info */
        .color-tag {
            display: inline-block;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #333;
            background: #f5f5f5;
        }
        
        .color-tag[data-color="Black"] { background: #000; color: white; }
        .color-tag[data-color="White"] { background: #fff; color: #000; border: 1px solid #ddd; }
        .color-tag[data-color="Red"] { background: #ff0000; color: white; }
        .color-tag[data-color="Blue"] { background: #0000ff; color: white; }
        .color-tag[data-color="Lime"] { background: #00ff00; color: #000; }
        .color-tag[data-color="Cyan"] { background: #00ffff; color: #000; }
        .color-tag[data-color="Cream"] { background: #fffdd0; color: #000; border: 1px solid #ddd; }
        .color-tag[data-color="Green"] { background: #008000; color: white; }
        .color-tag[data-color="Brown"] { background: #964b00; color: white; }
        .color-tag[data-color="Pink"] { background: #ffc0cb; color: #000; }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === UPDATE PRODUCT DISPLAY TO SHOW COLORS ===
// [showCategory #1 removed to fix duplicates]

// === FORCE UPDATE EXISTING PRODUCTS WITH ALL COLORS ===
function forceColorUpdateOnAllProducts() {
    console.log('Updating all products with complete color range...');
    
    // Update each product in productData
    Object.keys(productData).forEach(category => {
        if (Array.isArray(productData[category])) {
            productData[category].forEach(product => {
                if (!product || typeof product !== 'object') return;
                
                // Regenerate inventory with all colors
                const inventory = [];
                const sizes = product.category === 'accessories' ? ['One Size'] : sizeOptions;
                
                colorOptions.forEach(color => {
                    sizes.forEach(size => {
                        const sku = `ACID-${product.category?.slice(0, 3).toUpperCase() || 'PRO'}-${color.name.slice(0, 3).toUpperCase()}-${size}`;
                        const stock = Math.floor(Math.random() * 10) + 5;
                        
                        inventory.push({
                            sku,
                            color: color.name,
                            size,
                            stock,
                            lowStock: 5
                        });
                    });
                });
                
                // Update product
                product.inventory = inventory;
                product.totalStock = calculateTotalStock(inventory);
                product.variants = [
                    { name: 'Color', options: colorOptions.map(c => c.name) },
                    { name: 'Size', options: sizes }
                ];
            });
        }
    });
    
    // Save to localStorage
    localStorage.setItem('acidicProducts', JSON.stringify(productData.allproducts));
    
    console.log(`Updated ${productData.allproducts.length} products with all colors`);
}

// === INITIALIZATION ===
// [DOMContentLoaded #1 removed to fix duplicates]

// === IMAGE ERROR HANDLING ===
function handleImageError(img) {
    console.log("Image failed to load:", img.src);
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
}

// === PRODUCT DISPLAY FUNCTIONS ===
// [showCategory #2 removed to fix duplicates]

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
// [DOMContentLoaded #2 removed to fix duplicates]

// === PAGINATION SYSTEM ===
let currentPage = {};
let productsPerPage = 8;

// Initialize pagination for all categories
function initPagination() {
    const categories = ['allproducts', 'tshirts', 'sweaters', 'hoodies', 'pants', 'twopieces', 'accessories'];
    categories.forEach(category => {
        currentPage[category] = 1;
    });
}

// Calculate total pages for a category
function getTotalPages(category) {
    if (!productData[category]) return 1;
    return Math.ceil(productData[category].length / productsPerPage);
}

// Get products for current page
function getProductsForPage(category, page) {
    if (!productData[category]) return [];
    
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    
    return productData[category].slice(startIndex, endIndex);
}

// Create pagination controls
function createPaginationControls(category) {
    const totalPages = getTotalPages(category);
    if (totalPages <= 1) return '';
    
    let html = '<div class="pagination-controls">';
    
    // Previous button
    html += `<button class="pagination-btn ${currentPage[category] === 1 ? 'disabled' : ''}" 
                      onclick="changePage('${category}', ${currentPage[category] - 1})"
                      ${currentPage[category] === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
             </button>`;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage[category] - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage('${category}', 1)">1</button>`;
        if (startPage > 2) html += '<span class="pagination-dots">...</span>';
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${currentPage[category] === i ? 'active' : ''}" 
                         onclick="changePage('${category}', ${i})">
                    ${i}
                 </button>`;
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span class="pagination-dots">...</span>';
        html += `<button class="pagination-btn" onclick="changePage('${category}', ${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button class="pagination-btn ${currentPage[category] === totalPages ? 'disabled' : ''}" 
                      onclick="changePage('${category}', ${currentPage[category] + 1})"
                      ${currentPage[category] === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
             </button>`;
    
    html += '</div>';
    
    return html;
}

// Change page
function changePage(category, page) {
    const totalPages = getTotalPages(category);
    if (page < 1 || page > totalPages) return;
    
    currentPage[category] = page;
    showCategory(category);
}

// === UPDATED SHOWCATEGORY FUNCTION WITH PAGINATION ===
// [showCategory #3 removed to fix duplicates]

// === ADD PAGINATION STYLES ===
function addPaginationStyles() {
    const styles = `
        /* Pagination Styles */
        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .pagination-controls {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .pagination-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
            min-height: 36px;
        }
        
        .pagination-btn:hover:not(.disabled) {
            border-color: #000;
            color: #000;
            background: #f8f8f8;
        }
        
        .pagination-btn.active {
            background: #000;
            color: white;
            border-color: #000;
        }
        
        .pagination-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination-btn i {
            font-size: 12px;
        }
        
        .pagination-dots {
            padding: 0 10px;
            color: #999;
        }
        
        .page-info {
            text-align: center;
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
        }
        
        /* Products per page selector */
        .products-per-page {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
            justify-content: flex-end;
        }
        
        .products-per-page label {
            font-size: 14px;
            color: #666;
        }
        
        .products-per-page select {
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            font-size: 14px;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .pagination-btn {
                padding: 6px 12px;
                font-size: 13px;
                min-height: 32px;
            }
            
            .pagination-controls {
                gap: 4px;
            }
            
            .pagination-dots {
                padding: 0 5px;
            }
        }
        
        @media (max-width: 480px) {
            .pagination-btn {
                padding: 5px 8px;
                font-size: 12px;
                min-height: 30px;
            }
            
            .pagination-btn span {
                display: none;
            }
            
            .pagination-btn i {
                margin: 0;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === PRODUCTS PER PAGE SELECTOR ===
function createProductsPerPageSelector() {
    const selector = document.createElement('div');
    selector.className = 'products-per-page';
    selector.innerHTML = `
        <label for="products-per-page-select">Products per page:</label>
        <select id="products-per-page-select" onchange="updateProductsPerPage(this.value)">
            <option value="4" ${productsPerPage === 4 ? 'selected' : ''}>4</option>
            <option value="8" ${productsPerPage === 8 ? 'selected' : ''}>8</option>
            <option value="12" ${productsPerPage === 12 ? 'selected' : ''}>12</option>
            <option value="16" ${productsPerPage === 16 ? 'selected' : ''}>16</option>
            <option value="20" ${productsPerPage === 20 ? 'selected' : ''}>20</option>
        </select>
    `;
    return selector;
}

// Update products per page
function updateProductsPerPage(value) {
    productsPerPage = parseInt(value);
    
    // Reset all categories to page 1
    Object.keys(currentPage).forEach(category => {
        currentPage[category] = 1;
    });
    
    // Refresh current view
    const activeCategory = getActiveCategory();
    if (activeCategory) {
        showCategory(activeCategory);
    }
}

// Get active category from navigation
function getActiveCategory() {
    // Check which nav item is active
    const navItems = document.querySelectorAll('nav ul li');
    for (const item of navItems) {
        if (item.classList.contains('active')) {
            const onclick = item.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/showCategory\('(.+?)'\)/);
                if (match) return match[1];
            }
        }
    }
    
    // Fallback to current URL or default
    return 'allproducts';
}

// Update navigation click handlers to reset pagination
function updateNavHandlers() {
    document.querySelectorAll('nav ul li').forEach(item => {
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes('showCategory')) {
            const match = onclick.match(/showCategory\('(.+?)'\)/);
            if (match) {
                const category = match[1];
                item.setAttribute('onclick', `showCategoryWithPagination('${category}')`);
            }
        }
    });
}

// New showCategory function that resets pagination
function showCategoryWithPagination(category) {
    // Reset to page 1 when switching categories
    currentPage[category] = 1;
    
    // Update active nav item
    document.querySelectorAll('nav ul li').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('li').classList.add('active');
    
    // Show the category
    showCategory(category);
}

// === UPDATED INITIALIZATION ===
// [DOMContentLoaded #3 removed to fix duplicates]

// === UPDATE THE HTML NAVIGATION ===
// You need to update your HTML navigation to use showCategoryWithPagination
// Replace all onclick="showCategory('category')" with onclick="showCategoryWithPagination('category')"

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

function getStockStatusClass(stock, threshold) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= threshold) return 'low-stock';
    return 'in-stock';
}

// === UPDATED SHOWCATEGORY FUNCTION WITHOUT COMPARE PRICES ===
function showCategory(category) {
    hideAllSections();
    const section = document.getElementById("product-section");
    const mainContent = document.getElementById("main-content");
    section.style.display = "block";
    mainContent.style.display = "block";
    section.classList.remove("active");
    section.innerHTML = "";

    if (productData[category]) {
        setTimeout(() => {
            // Get products for current page
            const products = getProductsForPage(category, currentPage[category]);
            
            // Create products container
            const productsContainer = document.createElement('div');
            productsContainer.className = 'products-container';
            productsContainer.style.display = 'grid';
            productsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            productsContainer.style.gap = '20px';
            productsContainer.style.padding = '20px';
            
            products.forEach((product) => {
                const div = document.createElement("div");
                div.classList.add("product");
                div.dataset.productId = product.id;
                
                // Get available colors
                const colors = product.variants?.find(v => v.name === 'Color')?.options || [];
                
                // REMOVED comparePrice from product display
                div.innerHTML = `
                    <img src="${product.images[0]}" alt="${product.name}" onerror="handleImageError(this)">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">R${product.price}</p>
                        
                        <!-- COLOR SWATCHES DISPLAY -->
                        ${colors.length > 0 ? `
                            <div class="product-colors">
                                <span style="font-size: 12px; color: #666; margin-right: 5px;">Colors:</span>
                                ${colors.slice(0, 5).map(color => {
                                    const colorMap = {
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
                                    const hex = colorMap[color] || '#ccc';
                                    const needsBorder = color === 'White' || color === 'Cream';
                                    return `
                                        <div class="mini-color-swatch" 
                                             title="${color}"
                                             style="background: ${hex}; ${needsBorder ? 'border: 1px solid #ccc' : ''}"></div>
                                    `;
                                }).join('')}
                                ${colors.length > 5 ? `<span style="font-size: 11px; color: #999;">+${colors.length - 5} more</span>` : ''}
                            </div>
                        ` : ''}
                        
                        <p class="stock-status ${getStockStatusClass(product.totalStock, product.lowStockThreshold)}">
                            ${getStockStatus(product.totalStock, product.lowStockThreshold)}
                        </p>
                        <div class="product-actions">
                            <button class="view-details" onclick="viewProduct(${product.id}, event)">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="quick-add" onclick="quickAddToCart(${product.id}, event)">
                                <i class="fas fa-cart-plus"></i> Quick Add
                            </button>
                        </div>
                    </div>`;
                productsContainer.appendChild(div);
            });
            
            section.appendChild(productsContainer);
            
            // Add pagination controls
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            paginationContainer.innerHTML = createPaginationControls(category);
            section.appendChild(paginationContainer);
            
            // Add page info
            const totalProducts = productData[category].length;
            const startProduct = ((currentPage[category] - 1) * productsPerPage) + 1;
            const endProduct = Math.min(currentPage[category] * productsPerPage, totalProducts);
            
            const pageInfo = document.createElement('div');
            pageInfo.className = 'page-info';
            pageInfo.innerHTML = `
                <div style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
                    Showing ${startProduct}-${endProduct} of ${totalProducts} products
                    <span style="margin: 0 10px;">•</span>
                    Page ${currentPage[category]} of ${getTotalPages(category)}
                </div>
            `;
            section.appendChild(pageInfo);
            
            requestAnimationFrame(() => section.classList.add("active"));
        }, 150);
    }
}

// === UPDATE CREATE PRODUCT OBJECT FUNCTION ===
function createProductObject(name, price, img, category, id = null) {
    const productId = id || generateProductId();
    const inventory = generateInventory(name, category);
    const totalStock = calculateTotalStock(inventory);
    
    const colors = colorOptions.map(c => c.name); // ALL COLORS
    const sizes = Array.from(new Set(inventory.map(item => item.size)));
    
    return {
        id: productId,
        name: name,
        category: category,
        price: price,
        // REMOVED comparePrice completely
        description: `Premium ${category} from ACIDIC Clothing. ${name} features unique design and high-quality materials. Available in ${colors.length} colors.`,
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

// === UPDATE ACCESSORY PRODUCT CREATION ===
accessoriesData.forEach(item => {
    // Accessories have different inventory (no sizes)
    const productId = generateProductId();
    const inventory = colorOptions.map(color => ({
        sku: `ACID-ACC-${color.name.slice(0, 3).toUpperCase()}-OS`,
        color: color.name,
        size: 'One Size',
        stock: Math.floor(Math.random() * 10) + 5,
        lowStock: 5
    }));
    
    const product = {
        id: productId,
        name: item.name,
        category: 'accessories',
        price: item.price,
        // REMOVED comparePrice
        description: `${item.name} from ACIDIC. Premium accessory to complete your look.`,
        material: 'Cotton/Polyester',
        images: [item.img],
        variants: [
            { name: 'Color', options: colorOptions.map(c => c.name) }
        ],
        inventory: inventory,
        totalStock: inventory.reduce((sum, item) => sum + item.stock, 0),
        lowStockThreshold: 5,
        status: 'active',
        sku: `ACID-ACC-${productId.toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    productData.accessories.push(product);
    productData.allproducts.push(product);
});

// === UPDATE THE OLDER SHOWCATEGORY FUNCTION (for compatibility) ===
// This is the legacy function that might still be called
function showCategory_legacy(category) {
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
                        <!-- REMOVED comparePrice line -->
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

// === UPDATE QUICK ADD MODAL TO REMOVE COMPARE PRICE ===
function createQuickAddModal(product) {
    // Remove existing modal
    const existingModal = document.getElementById('quick-add-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal HTML WITHOUT compare price
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
                            <!-- REMOVED compare price from modal -->
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
                        <i class="fas fa-shopping-cart"></i> Add to Cart - R${product.price}
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

// === UPDATE PRODUCT PAGE DISPLAY (if you have product.html) ===
// If you have a separate product detail page, you should also update it there
// Add this function to handle product page display
function displayProductDetails(product) {
    // This function would be used in product.html
    const productDetailHTML = `
        <div class="product-detail">
            <div class="product-images">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="product-price">R${product.price}</p>
                <!-- NO compare price here -->
                <p class="product-description">${product.description}</p>
                <p class="product-material"><strong>Material:</strong> ${product.material}</p>
                <p class="product-sku"><strong>SKU:</strong> ${product.sku}</p>
                
                ${product.variants ? `
                    <div class="product-variants">
                        ${getVariantHTML(product)}
                    </div>
                ` : ''}
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCartFromDetail(${product.id})">
                        Add to Cart - R${product.price}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return productDetailHTML;
}

// === ADD CSS TO REMOVE COMPARE PRICE STYLES ===
function addCleanPriceStyles() {
    const styles = `
        /* Remove compare price styles */
        .compare-price {
            display: none !important;
        }
        
        /* Clean up price display */
        .price {
            font-size: 18px;
            font-weight: 700;
            color: #000;
            margin: 10px 0;
        }
        
        .product-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 5px 0;
            color: #333;
        }
        
        /* Quick add modal price */
        .preview-info .price {
            font-size: 20px;
            font-weight: 700;
            color: #000;
            margin: 5px 0;
        }
        
        /* Add to cart button price */
        .add-btn {
            font-weight: 600;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// === UPDATE INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing ACIDIC Clothing store...');
    
    // Initialize pagination
    initPagination();
    
    // Add styles
    addPaginationStyles();
    addColorSwatchStyles();
    addModalStyles();
    addCartFeedbackStyles();
    addCleanPriceStyles(); // Add this new style function
    
    // Force update products with all colors
    forceColorUpdateOnAllProducts();
    
    // Save products to localStorage
    saveProductsToLocalStorage();
    
    // Update cart count
    updateCartCount();
    
    // === SINGLE SOURCE OF TRUTH FOR VIEW PRODUCT ===
// This ensures only ONE viewProduct function exists

window.viewProduct = function(productId, event) {
    // Prevent any event issues
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('🔍 Opening product:', productId);
    
    // Find product from the source
    let product = null;
    
    // Search in allproducts first (fastest)
    if (window.productData && window.productData.allproducts) {
        product = window.productData.allproducts.find(p => p.id == productId);
    }
    
    // If not found, search in categories
    if (!product && window.productData) {
        const categories = ['tshirts', 'sweaters', 'hoodies', 'pants', 'twopieces', 'accessories'];
        for (const category of categories) {
            if (window.productData[category]) {
                product = window.productData[category].find(p => p.id == productId);
                if (product) break;
            }
        }
    }
    
    // Final fallback - check localStorage
    if (!product) {
        try {
            const stored = JSON.parse(localStorage.getItem('acidicProducts') || '[]');
            product = stored.find(p => p.id == productId);
        } catch (e) {
            console.warn('Could not load from localStorage');
        }
    }
    
    if (!product) {
        console.error('❌ Product not found:', productId);
        if (typeof showNotification === 'function') {
            showNotification('Product not found', 'error');
        } else {
            alert('Product not found');
        }
        return;
    }
    
    console.log('✅ Found product:', product.name);
    
    // Prepare product data for the detail page
    try {
        // Complete product data with all variants
        const productDetail = {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description || `Premium ${product.category} from ACIDIC Clothing`,
            material: product.material || '100% Cotton',
            images: product.images && product.images.length ? product.images : ['acidic 1.jpg'],
            category: product.category,
            // Ensure variants exist
            variants: product.variants || [
                { 
                    name: 'Color', 
                    options: ['Black', 'White', 'Red', 'Blue', 'Lime', 'Cyan', 'Cream', 'Green', 'Brown', 'Pink'] 
                },
                { 
                    name: 'Size', 
                    options: product.category === 'accessories' ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'] 
                }
            ],
            // Ensure inventory exists
            inventory: product.inventory || generateInventoryForProduct(product),
            totalStock: product.totalStock || 10,
            sku: product.sku || `ACID-${(product.category || 'GEN').toUpperCase()}-${productId.toString().slice(-4)}`,
            lowStockThreshold: 5,
            status: 'active'
        };
        
        // Store with timestamp to avoid caching issues
        const storageKey = `product_${productId}_${Date.now()}`;
        const productData = {
            ...productDetail,
            _stored: new Date().toISOString(),
            _version: '1.0'
        };
        
        // Store in multiple places for redundancy
        localStorage.setItem('currentProduct', JSON.stringify(productData));
        localStorage.setItem(`product_${productId}`, JSON.stringify(productData));
        sessionStorage.setItem(`viewing_product_${productId}`, JSON.stringify(productData));
        
        // Clean up old product data (keep last 10)
        try {
            const keys = Object.keys(localStorage);
            const productKeys = keys.filter(k => k.startsWith('product_') && !k.includes('_20'));
            if (productKeys.length > 10) {
                productKeys.sort().slice(0, -10).forEach(key => localStorage.removeItem(key));
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        
        console.log('💾 Product stored, redirecting to product.html');
        
        // Navigate to product page
        const productUrl = `product.html?id=${productId}&t=${Date.now()}`;
        
        // Use different navigation based on environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Development - simple redirect
            window.location.href = productUrl;
        } else {
            // Production - use replace to avoid history issues
            window.location.replace(productUrl);
        }
        
    } catch (error) {
        console.error('❌ Error preparing product:', error);
        // Fallback navigation
        window.location.href = `product.html?id=${productId}`;
    }
};

// Helper function to generate inventory if missing
function generateInventoryForProduct(product) {
    const colors = ['Black', 'White', 'Red', 'Blue', 'Lime', 'Cyan', 'Cream', 'Green', 'Brown', 'Pink'];
    const sizes = product.category === 'accessories' ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const inventory = [];
    
    colors.forEach(color => {
        sizes.forEach(size => {
            inventory.push({
                sku: `ACID-${(product.category || 'GEN').slice(0,3).toUpperCase()}-${color.slice(0,3).toUpperCase()}-${size}`,
                color: color,
                size: size,
                stock: Math.floor(Math.random() * 15) + 5,
                lowStock: 5
            });
        });
    });
    
    return inventory;
}

// Override any existing viewProduct functions
window.originalViewProduct = window.viewProduct;
window.viewProduct = window.viewProduct; // This ensures our version is used

// Fix all product card click handlers on page load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is ready
    setTimeout(function() {
        console.log('🔧 Setting up product click handlers...');
        
        // Remove all existing click handlers by cloning
        document.querySelectorAll('.product').forEach(card => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
        
        // Add fresh click handlers
        document.querySelectorAll('.product').forEach(card => {
            card.addEventListener('click', function(e) {
                // Ignore clicks on buttons
                if (e.target.closest('button') || 
                    e.target.closest('.quick-add') || 
                    e.target.closest('.view-details') ||
                    e.target.closest('.add-to-cart')) {
                    return;
                }
                
                const productId = this.dataset.productId;
                if (productId) {
                    window.viewProduct(productId, e);
                }
            });
        });
        
        // Fix view details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const card = this.closest('.product');
                if (card && card.dataset.productId) {
                    window.viewProduct(card.dataset.productId, e);
                }
            });
        });
        
        console.log('✅ Product click handlers fixed permanently');
    }, 100);
});

// Also add a global click handler as backup
document.addEventListener('click', function(e) {
    // If a product card was clicked but not handled
    const productCard = e.target.closest('.product');
    if (productCard && !e.target.closest('button')) {
        const productId = productCard.dataset.productId;
        if (productId && !e.defaultPrevented) {
            window.viewProduct(productId, e);
        }
    }
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { viewProduct: window.viewProduct };
}

    // Make sure productData is globally available
    window.productData = productData;
    
    // Update navigation handlers
    updateNavHandlers();
    
    // Don't auto-show products here - main.js handles initial category display
    // (Removed: showCategory('allproducts') to fix duplicate rendering)
    
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
    
    console.log('Product system with clean pricing initialized successfully');
});

// === VIEW PRODUCT DETAILS FUNCTION ===
function viewProduct(productId, event) {
    if (event) event.stopPropagation();
    
    console.log('Opening product page for ID:', productId);
    
    // Check if productData exists
    if (!window.productData || !window.productData.allproducts) {
        console.error('Product data not loaded!');
        if (typeof showNotification === 'function') {
            showNotification('Product catalog not loaded. Please refresh.', 'error');
        }
        return;
    }
    
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
// [DOMContentLoaded #4 removed to fix duplicates]

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
// [DOMContentLoaded #5 removed to fix duplicates]

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

        .color-swatch {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #f0f0f0;
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
    }
    
    .variant-option.selected .color-swatch {
        border-color: #000;
        transform: scale(1.1);
    }
    
    .variant-option:hover .color-swatch {
        transform: scale(1.05);
        box-shadow: 0 3px 6px rgba(0,0,0,0.15);
    }
    
    /* Force specific colors to show correctly */
    .variant-option[data-value="Lime"] .color-swatch {
        background: #00ff00 !important;
    }
    
    .variant-option[data-value="Cyan"] .color-swatch {
        background: #00ffff !important;
    }
    
    .variant-option[data-value="Cream"] .color-swatch {
        background: #fffdd0 !important;
        border: 2px solid #ccc !important;
    }
    
    .variant-option[data-value="Brown"] .color-swatch {
        background: #964b00 !important;
    }
    
    .variant-option[data-value="Pink"] .color-swatch {
        background: #ffc0cb !important;
    }
    
    .variant-option[data-value="White"] .color-swatch {
        background: #ffffff !important;
        border: 2px solid #ccc !important;
    }
    
    .variant-option[data-value="Red"] .color-swatch {
        background: #ff0000 !important;
    }
    
    .variant-option[data-value="Blue"] .color-swatch {
        background: #0000ff !important;
    }
    
    .variant-option[data-value="Green"] .color-swatch {
        background: #008000 !important;
    }
    
    .variant-option[data-value="Black"] .color-swatch {
        background: #000000 !important;
    }
    
    .variant-label {
        display: inline-block;
        vertical-align: middle;
        font-size: 14px;
        font-weight: 500;
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
// [DOMContentLoaded #6 removed to fix duplicates]

// Add CSS for enhanced cart and variant display
function addEnhancedCartStyles() {
    const styles = `
        /* Enhanced cart styles */
        .cart-item-variants {
            display: flex;
            gap: 15px;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        
        .cart-item-color, .cart-item-size {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .color-display {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .color-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-block;
            border: 1px solid #eee;
        }
        
        .color-name {
            font-size: 12px;
            color: #666;
        }
        
        .size-value {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        .cart-item-meta {
            display: flex;
            gap: 10px;
            margin-top: 5px;
        }
        
        .cart-item-sku, .cart-item-category {
            font-size: 11px;
            color: #888;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .custom-badge {
            background: #f4b400;
            color: #000;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
            margin-left: 5px;
        }
        
        /* Confirmation order items */
        .confirmation-order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .item-variants {
            display: flex;
            gap: 10px;
            margin-top: 5px;
        }
        
        .item-variants span {
            font-size: 12px;
            color: #666;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .custom-tag {
            background: #f4b400 !important;
            color: #000 !important;
            font-weight: bold;
        }
        
        .item-quantity-price {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        /* Admin report styling */
        .admin-report {
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Initialize enhanced system
// [DOMContentLoaded #7 removed to fix duplicates]

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