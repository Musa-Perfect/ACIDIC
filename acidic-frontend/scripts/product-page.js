// product-page.js - Product Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page loaded');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const productKey = urlParams.get('key') || `acidic_product_${productId}`;
    
    console.log('Loading product:', productId, 'with key:', productKey);
    
    if (!productId) {
        showError('No product specified');
        return;
    }
    
    // Load product data
    loadProduct(productId, productKey);
    
    // Initialize cart count
    updateCartCount();
});

// Load product data
function loadProduct(productId, productKey) {
    // Try to get from localStorage first
    let productData = localStorage.getItem(productKey);
    
    if (productData) {
        // Parse and display product
        const product = JSON.parse(productData);
        console.log('Product loaded from localStorage:', product.name);
        displayProduct(product);
        loadRelatedProducts(product.category, productId);
        return;
    }
    
    // If not in localStorage, try from main productData
    if (window.productData && window.productData.allproducts) {
        const product = window.productData.allproducts.find(p => p.id === productId);
        if (product) {
            console.log('Product loaded from window.productData:', product.name);
            displayProduct(product);
            loadRelatedProducts(product.category, productId);
            return;
        }
    }
    
    // If still not found, try localStorage 'acidicProducts'
    const allProducts = JSON.parse(localStorage.getItem('acidicProducts')) || [];
    const product = allProducts.find(p => p.id === productId);
    
    if (product) {
        console.log('Product loaded from acidicProducts:', product.name);
        displayProduct(product);
        loadRelatedProducts(product.category, productId);
    } else {
        showError('Product not found');
    }
}

// Display product on page
function displayProduct(product) {
    // Basic product info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-name-breadcrumb').textContent = product.name;
    document.getElementById('current-price').textContent = `R${product.price}`;
    
    if (product.comparePrice) {
        document.getElementById('compare-price').textContent = `R${product.comparePrice}`;
    }
    
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('full-description').textContent = product.description;
    
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
    categoryLink.textContent = categoryMap[product.category] || product.category;
    categoryLink.href = `index.html#${product.category}`;
    
    // Product details
    const detailsContent = document.getElementById('product-details-content');
    detailsContent.innerHTML = `
        <p><strong>Material:</strong> ${product.material || '100% Cotton'}</p>
        <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
        <p><strong>Status:</strong> In Stock</p>
    `;
    
    // Images
    displayProductImages(product.images);
    
    // Variants (colors and sizes)
    displayVariants(product);
    
    // Store current product for cart operations
    window.currentProduct = product;
}

// Display product images
function displayProductImages(images) {
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-images');
    
    if (images && images.length > 0) {
        mainImage.src = images[0];
        mainImage.alt = document.getElementById('product-title').textContent;
        
        thumbnailContainer.innerHTML = '';
        images.forEach((img, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.src = img;
            thumbnail.alt = `Thumbnail ${index + 1}`;
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
}

// Display color and size variants
function displayVariants(product) {
    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');
    
    // Reset containers
    colorContainer.innerHTML = '';
    sizeContainer.innerHTML = '';
    
    // Find color variant
    const colorVariant = product.variants?.find(v => v.name === 'Color');
    if (colorVariant && colorVariant.options.length > 0) {
        colorVariant.options.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = `color-option ${index === 0 ? 'selected' : ''}`;
            colorOption.dataset.color = color;
            colorOption.onclick = () => selectColor(color);
            
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            
            // Set color based on color name
            const colorMap = {
                'Black': '#000000',
                'White': '#ffffff',
                'Grey': '#808080',
                'Navy': '#000080',
                'Red': '#ff0000',
                'Blue': '#0000ff',
                'Green': '#008000'
            };
            
            colorSwatch.style.backgroundColor = colorMap[color] || '#cccccc';
            
            const colorName = document.createElement('span');
            colorName.className = 'color-name';
            colorName.textContent = color;
            
            colorOption.appendChild(colorSwatch);
            colorOption.appendChild(colorName);
            colorContainer.appendChild(colorOption);
            
            if (index === 0) {
                document.getElementById('selected-color-name').textContent = color;
            }
        });
    }
    
    // Find size variant
    const sizeVariant = product.variants?.find(v => v.name === 'Size');
    if (sizeVariant && sizeVariant.options.length > 0) {
        sizeVariant.options.forEach((size, index) => {
            const sizeOption = document.createElement('div');
            sizeOption.className = `size-option ${index === 0 ? 'selected' : ''}`;
            sizeOption.textContent = size;
            sizeOption.dataset.size = size;
            sizeOption.onclick = () => selectSize(size);
            sizeContainer.appendChild(sizeOption);
            
            if (index === 0) {
                window.selectedSize = size;
            }
        });
    }
    
    // Enable add to cart button
    document.getElementById('add-to-cart').disabled = false;
}

// Load related products
function loadRelatedProducts(category, currentProductId) {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;
    
    // Get products from same category (excluding current product)
    let products = [];
    
    if (window.productData && window.productData[category]) {
        products = window.productData[category]
            .filter(p => p.id !== currentProductId)
            .slice(0, 4); // Show max 4 related products
    } else {
        // Fallback: get from localStorage
        const allProducts = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        products = allProducts
            .filter(p => p.category === category && p.id !== currentProductId)
            .slice(0, 4);
    }
    
    if (products.length === 0) {
        document.getElementById('related-products').style.display = 'none';
        return;
    }
    
    relatedGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('a');
        productCard.className = 'related-product';
        productCard.href = `product.html?id=${product.id}`;
        productCard.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="related-image" onerror="this.src='acidic 1.jpg'">
            <h3 class="related-name">${product.name}</h3>
            <p class="related-price">R${product.price}</p>
        `;
        relatedGrid.appendChild(productCard);
    });
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
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const color = window.selectedColor || window.currentProduct.variants?.find(v => v.name === 'Color')?.options[0] || 'Default';
    const size = window.selectedSize || window.currentProduct.variants?.find(v => v.name === 'Size')?.options[0] || 'One Size';
    
    // Create cart item
    const cartItem = {
        id: window.currentProduct.id,
        name: window.currentProduct.name,
        price: window.currentProduct.price,
        quantity: quantity,
        size: size,
        color: color,
        image: window.currentProduct.images[0],
        category: window.currentProduct.category,
        addedAt: new Date().toISOString()
    };
    
    // Add to cart using the function from main.js
    if (typeof addItemToCart === 'function') {
        addItemToCart(cartItem);
    } else {
        // Fallback if function not available
        let cart = JSON.parse(localStorage.getItem('acidicCart')) || [];
        cart.push(cartItem);
        localStorage.setItem('acidicCart', JSON.stringify(cart));
        updateCartCount();
    }
    
    // Show success message
    showSuccessMessage();
}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.style.display = 'flex';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// Wishlist function
function addToWishlist() {
    const btn = document.getElementById('add-to-wishlist');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('Added to wishlist', 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Removed from wishlist', 'info');
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
    document.getElementById('size-guide-modal').style.display = 'flex';
}

function closeSizeGuide() {
    document.getElementById('size-guide-modal').style.display = 'none';
}

// Image zoom
function zoomImage() {
    const image = document.getElementById('main-image');
    if (image.style.transform === 'scale(1.5)') {
        image.style.transform = 'scale(1)';
    } else {
        image.style.transform = 'scale(1.5)';
    }
}

// Error handling
function showError(message) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h2>Product Not Found</h2>
                <p>${message}</p>
                <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #000; color: white; text-decoration: none;">Back to Shop</a>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Simple notification - you can enhance this
    console.log(`${type.toUpperCase()}: ${message}`);
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