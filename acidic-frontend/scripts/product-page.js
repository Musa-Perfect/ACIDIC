// product-page.js - FIXED Product Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page loaded');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('Product ID from URL:', productId);
    
    if (!productId) {
        showError('No product ID in URL');
        return;
    }
    
    // Load product data
    loadProduct(productId);
    
    // Initialize cart count
    updateCartCount();
});

// IMPROVED: Load product data from multiple sources
function loadProduct(productId) {
    console.log('Attempting to load product:', productId);
    
    let product = null;
    
    // METHOD 1: Check localStorage for specific product (saved when clicked)
    const savedProduct = localStorage.getItem(`acidic_product_${productId}`);
    if (savedProduct) {
        try {
            product = JSON.parse(savedProduct);
            console.log('✅ Product found in localStorage (saved product)');
        } catch (e) {
            console.error('Error parsing saved product:', e);
        }
    }
    
    // METHOD 2: Check window.productData (loaded from products.js)
    if (!product && typeof window.productData !== 'undefined') {
        // Try allproducts array first
        if (window.productData.allproducts) {
            product = window.productData.allproducts.find(p => 
                p.id == productId || p.id === parseInt(productId)
            );
            if (product) {
                console.log('✅ Product found in window.productData.allproducts');
            }
        }
        
        // If not found, search through categories
        if (!product) {
            const categories = ['tshirts', 'hoodies', 'sweaters', 'pants', 'twopieces', 'accessories'];
            for (let category of categories) {
                if (window.productData[category]) {
                    product = window.productData[category].find(p => 
                        p.id == productId || p.id === parseInt(productId)
                    );
                    if (product) {
                        console.log(`✅ Product found in window.productData.${category}`);
                        break;
                    }
                }
            }
        }
    }
    
    // METHOD 3: Check localStorage acidicProducts
    if (!product) {
        const allProducts = localStorage.getItem('acidicProducts');
        if (allProducts) {
            try {
                const products = JSON.parse(allProducts);
                product = products.find(p => p.id == productId || p.id === parseInt(productId));
                if (product) {
                    console.log('✅ Product found in localStorage (acidicProducts)');
                }
            } catch (e) {
                console.error('Error parsing acidicProducts:', e);
            }
        }
    }
    
    // Display product or show error
    if (product) {
        console.log('Product loaded successfully:', product.name);
        displayProduct(product);
        loadRelatedProducts(product.category, product.id);
    } else {
        console.error('❌ Product not found anywhere. ID:', productId);
        console.log('Available sources checked:');
        console.log('- localStorage (acidic_product_' + productId + ')');
        console.log('- window.productData:', typeof window.productData !== 'undefined');
        console.log('- localStorage (acidicProducts)');
        showError('Product not found. Please try again from the shop page.');
    }
}

// Display product on page
function displayProduct(product) {
    console.log('Displaying product:', product.name);
    
    // Basic product info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-name-breadcrumb').textContent = product.name;
    document.getElementById('current-price').textContent = `R${product.price}`;
    
    // Compare price (calculate if not provided)
    const comparePrice = product.comparePrice || Math.round(product.price * 1.25);
    document.getElementById('compare-price').textContent = `R${comparePrice}`;
    
    // Description
    const description = product.description || 'Premium quality streetwear designed for everyday comfort and style.';
    document.getElementById('product-description').textContent = description;
    document.getElementById('full-description').textContent = description;
    
    // Category link
    const categoryMap = {
        'tshirts': 'T-Shirts',
        'sweaters': 'Sweaters',
        'hoodies': 'Hoodies',
        'pants': 'Pants',
        'twopieces': 'Two Pieces',
        'accessories': 'Accessories'
    };
    
    const categoryLink = document.getElementById('category-link');
    const categoryName = categoryMap[product.category] || product.category || 'Products';
    categoryLink.textContent = categoryName;
    categoryLink.href = `index.html#${product.category}`;
    
    // Product details
    const detailsContent = document.getElementById('product-details-content');
    detailsContent.innerHTML = `
        <h4>Product Details</h4>
        <ul>
            <li><strong>Material:</strong> ${product.material || '100% Premium Cotton'}</li>
            <li><strong>Fit:</strong> ${product.fit || 'Regular Fit'}</li>
            <li><strong>Care:</strong> Machine wash cold, tumble dry low</li>
            <li><strong>Made in:</strong> ${product.madeIn || 'South Africa'}</li>
            <li><strong>SKU:</strong> ${product.sku || 'ACIDIC-' + product.id}</li>
        </ul>
    `;
    
    // Images
    displayProductImages(product);
    
    // Variants (colors and sizes)
    displayVariants(product);
    
    // Store current product for cart operations
    window.currentProduct = product;
}

// Display product images
function displayProductImages(product) {
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-images');
    
    // Get images array
    let images = [];
    if (product.images && Array.isArray(product.images)) {
        images = product.images;
    } else if (product.image) {
        images = [product.image];
    } else {
        images = ['acidic 1.jpg']; // Fallback image
    }
    
    // Set main image
    mainImage.src = images[0];
    mainImage.alt = product.name;
    
    // Create thumbnails
    thumbnailContainer.innerHTML = '';
    images.forEach((img, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.src = img;
        thumbnail.alt = `${product.name} - View ${index + 1}`;
        thumbnail.onerror = function() {
            this.src = 'acidic 1.jpg'; // Fallback
        };
        thumbnail.onclick = () => {
            // Update main image
            mainImage.src = img;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        };
        thumbnailContainer.appendChild(thumbnail);
    });
}

// Display color and size variants
function displayVariants(product) {
    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');
    
    // Reset containers
    colorContainer.innerHTML = '';
    sizeContainer.innerHTML = '';
    
    // Color map for swatches
    const colorMap = {
        'Black': '#000000',
        'White': '#ffffff',
        'Grey': '#808080',
        'Gray': '#808080',
        'Navy': '#000080',
        'Red': '#ff0000',
        'Blue': '#0000ff',
        'Green': '#008000',
        'Yellow': '#ffff00',
        'Orange': '#ffa500',
        'Purple': '#800080',
        'Pink': '#ffc0cb',
        'Brown': '#8b4513',
        'Beige': '#f5f5dc',
        'Cream': '#fffdd0'
    };
    
    // COLORS: Check multiple sources for color data
    let colors = [];
    
    // Source 1: variants array
    if (product.variants) {
        const colorVariant = product.variants.find(v => 
            v.name && v.name.toLowerCase() === 'color'
        );
        if (colorVariant && colorVariant.options) {
            colors = colorVariant.options;
        }
    }
    
    // Source 2: colors array
    if (colors.length === 0 && product.colors) {
        colors = product.colors;
    }
    
    // Source 3: Default colors
    if (colors.length === 0) {
        colors = ['Black', 'White', 'Grey'];
    }
    
    // Display colors
    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${index === 0 ? 'selected' : ''}`;
        colorOption.dataset.color = color;
        colorOption.onclick = function() { selectColor(color); };
        
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        colorSwatch.style.backgroundColor = colorMap[color] || '#cccccc';
        
        colorOption.appendChild(colorSwatch);
        colorContainer.appendChild(colorOption);
        
        if (index === 0) {
            document.getElementById('selected-color-name').textContent = color;
            window.selectedColor = color;
        }
    });
    
    // SIZES: Check multiple sources for size data
    let sizes = [];
    
    // Source 1: variants array
    if (product.variants) {
        const sizeVariant = product.variants.find(v => 
            v.name && v.name.toLowerCase() === 'size'
        );
        if (sizeVariant && sizeVariant.options) {
            sizes = sizeVariant.options;
        }
    }
    
    // Source 2: sizes array
    if (sizes.length === 0 && product.sizes) {
        sizes = product.sizes;
    }
    
    // Source 3: Default sizes
    if (sizes.length === 0) {
        sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
    
    // Display sizes
    sizes.forEach((size, index) => {
        const sizeOption = document.createElement('div');
        sizeOption.className = `size-option ${index === 2 ? 'selected' : ''}`; // Default to M (index 2)
        sizeOption.textContent = size;
        sizeOption.dataset.size = size;
        sizeOption.onclick = function() { selectSize(size); };
        sizeContainer.appendChild(sizeOption);
        
        if (index === 2) {
            window.selectedSize = size;
        }
    });
    
    // Enable add to cart button
    document.getElementById('add-to-cart').disabled = false;
}

// Load related products
function loadRelatedProducts(category, currentProductId) {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;
    
    let products = [];
    
    // Try to get from window.productData
    if (typeof window.productData !== 'undefined') {
        if (window.productData.allproducts) {
            products = window.productData.allproducts
                .filter(p => p.category === category && p.id != currentProductId)
                .slice(0, 4);
        } else if (window.productData[category]) {
            products = window.productData[category]
                .filter(p => p.id != currentProductId)
                .slice(0, 4);
        }
    }
    
    // Fallback: localStorage
    if (products.length === 0) {
        const allProducts = JSON.parse(localStorage.getItem('acidicProducts') || '[]');
        products = allProducts
            .filter(p => p.category === category && p.id != currentProductId)
            .slice(0, 4);
    }
    
    if (products.length === 0) {
        document.getElementById('related-products').style.display = 'none';
        return;
    }
    
    relatedGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'related-product';
        productCard.onclick = function() {
            goToProduct(product);
        };
        
        const img = product.images ? product.images[0] : (product.image || 'acidic 1.jpg');
        
        productCard.innerHTML = `
            <img src="${img}" alt="${product.name}" onerror="this.src='acidic 1.jpg'">
            <div class="related-product-info">
                <h3 class="related-product-title">${product.name}</h3>
                <p class="related-product-price">R${product.price}</p>
            </div>
        `;
        relatedGrid.appendChild(productCard);
    });
}

// HELPER: Navigate to product page
function goToProduct(product) {
    // Save product to localStorage for the next page
    localStorage.setItem(`acidic_product_${product.id}`, JSON.stringify(product));
    
    // Navigate to product page
    window.location.href = `product.html?id=${product.id}`;
}

// Selection functions
function selectColor(color) {
    // Update selected color UI
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.closest('.color-option').classList.add('selected');
    document.getElementById('selected-color-name').textContent = color;
    
    window.selectedColor = color;
    console.log('Selected color:', color);
}

function selectSize(size) {
    // Update selected size UI
    document.querySelectorAll('.size-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    window.selectedSize = size;
    document.getElementById('size-error').style.display = 'none';
    console.log('Selected size:', size);
}

// Quantity functions
function updateQuantity(change) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value) + change;
    
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    
    input.value = value;
}

// Cart functions
function addToCart() {
    if (!window.currentProduct) {
        showError('Product not loaded');
        return;
    }
    
    if (!window.selectedSize) {
        document.getElementById('size-error').style.display = 'block';
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const color = window.selectedColor || 'Default';
    const size = window.selectedSize;
    
    // Create cart item
    const cartItem = {
        id: window.currentProduct.id,
        name: window.currentProduct.name,
        price: window.currentProduct.price,
        quantity: quantity,
        size: size,
        color: color,
        image: window.currentProduct.images ? window.currentProduct.images[0] : window.currentProduct.image,
        category: window.currentProduct.category,
        addedAt: new Date().toISOString()
    };
    
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    
    // Check if item already exists
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.size === cartItem.size
    );
    
    if (existingIndex >= 0) {
        // Update quantity
        cart[existingIndex].quantity += cartItem.quantity;
    } else {
        // Add new item
        cart.push(cartItem);
    }
    
    // Save cart
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showSuccessMessage();
    
    console.log('Added to cart:', cartItem);
}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Wishlist function
function addToWishlist() {
    const btn = document.getElementById('add-to-wishlist');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        alert('Added to wishlist! ❤️');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        alert('Removed from wishlist');
    }
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Size guide modal
function showSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    modal.classList.add('active');
}

function closeSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    modal.classList.remove('active');
}

// Image zoom
function zoomImage() {
    const image = document.getElementById('main-image');
    if (image.style.transform === 'scale(1.5)') {
        image.style.transform = 'scale(1)';
        image.style.cursor = 'zoom-in';
    } else {
        image.style.transform = 'scale(1.5)';
        image.style.cursor = 'zoom-out';
    }
}

// Error handling
function showError(message) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px 20px; grid-column: 1 / -1;">
                <h2 style="font-size: 32px; margin-bottom: 16px;">Product Not Found</h2>
                <p style="font-size: 18px; color: #666; margin-bottom: 32px;">${message}</p>
                <a href="index.html" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #000, #333); color: white; text-decoration: none; border-radius: 8px; font-weight: 700;">
                    ← Back to Shop
                </a>
            </div>
        `;
    }
}

// Make functions available globally
window.selectColor = selectColor;
window.selectSize = selectSize;
window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.switchTab = switchTab;
window.showSizeGuide = showSizeGuide;
window.closeSizeGuide = closeSizeGuide;
window.zoomImage = zoomImage;
window.goToProduct = goToProduct;

console.log('✅ Product page JavaScript loaded and ready');