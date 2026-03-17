/* ================================================
   PRODUCT MODAL FUNCTIONALITY
   Complete JavaScript for the modern product modal
   ================================================ */

// Global variables for product modal
let currentProduct = null;
let currentImageIndex = 0;
let selectedColor = 'Black';
let selectedSize = 'M';
let productQuantity = 1;

// Open Product Modal
function openProductModal(productId) {
  console.log('Opening product modal for:', productId);
  
  // Find product in productData
  const product = findProduct(productId);
  
  if (!product) {
    console.error('Product not found:', productId);
    alert('Product not found. Please try again.');
    return;
  }
  
  currentProduct = product;
  currentImageIndex = 0;
  selectedColor = 'Black';
  selectedSize = 'M';
  productQuantity = 1;
  
  // Populate modal with product data
  populateProductModal(product);
  
  // Show modal
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close Product Modal
function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentProduct = null;
}

// Find Product by ID
function findProduct(productId) {
  // Try to find in productData
  if (window.productData && window.productData.allproducts) {
    const product = window.productData.allproducts.find(p => p.id == productId);
    if (product) return product;
  }
  
  // Try other product data structures
  if (window.productData) {
    for (let category in window.productData) {
      if (Array.isArray(window.productData[category])) {
        const product = window.productData[category].find(p => p.id == productId);
        if (product) return product;
      }
    }
  }
  
  return null;
}

// Populate Modal with Product Data
function populateProductModal(product) {
  // Category
  const categoryEl = document.getElementById('product-category');
  if (categoryEl) {
    categoryEl.textContent = (product.category || 'ACIDIC').toUpperCase();
  }
  
  // Name
  const nameEl = document.getElementById('product-name');
  if (nameEl) {
    nameEl.textContent = product.name || 'Product';
  }
  
  // Price
  const priceEl = document.getElementById('product-price');
  if (priceEl) {
    priceEl.textContent = `R${product.price || 0}`;
  }
  
  // Original price (calculate 25% higher for discount display)
  const originalPriceEl = document.getElementById('product-original-price');
  if (originalPriceEl && product.price) {
    const originalPrice = Math.round(product.price * 1.25);
    originalPriceEl.textContent = `R${originalPrice}`;
  }
  
  // Description
  const descEl = document.getElementById('product-description');
  if (descEl) {
    descEl.textContent = product.description || 'Premium quality streetwear designed for everyday comfort and style.';
  }
  
  // Badge
  const badgeEl = document.getElementById('product-badge');
  if (badgeEl) {
    // Randomly assign badges for visual variety
    const badges = ['NEW', 'HOT', 'LIMITED', 'EXCLUSIVE'];
    badgeEl.textContent = badges[Math.floor(Math.random() * badges.length)];
  }
  
  // Images
  loadProductImages(product);
  
  // Reset selections
  document.getElementById('product-quantity').value = 1;
  document.getElementById('selected-color-display').textContent = 'Black';
  
  // Reset active states
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.remove('active');
    if (swatch.dataset.color === 'Black') {
      swatch.classList.add('active');
    }
  });
  
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.size === 'M') {
      btn.classList.add('active');
    }
  });
}

// Load Product Images
function loadProductImages(product) {
  const mainImage = document.getElementById('product-main-image');
  const thumbnailGallery = document.getElementById('thumbnail-gallery');
  
  if (!product.images || product.images.length === 0) {
    // Fallback to a single image
    if (mainImage) {
      mainImage.src = product.image || 'placeholder.jpg';
    }
    if (thumbnailGallery) {
      thumbnailGallery.innerHTML = '';
    }
    return;
  }
  
  // Set main image
  if (mainImage) {
    mainImage.src = product.images[0];
  }
  
  // Create thumbnails
  if (thumbnailGallery) {
    thumbnailGallery.innerHTML = product.images.map((img, index) => `
      <div class="thumbnail-item ${index === 0 ? 'active' : ''}" onclick="selectProductImage(${index})">
        <img src="${img}" alt="Product ${index + 1}">
      </div>
    `).join('');
  }
}

// Select Product Image
function selectProductImage(index) {
  if (!currentProduct || !currentProduct.images) return;
  
  currentImageIndex = index;
  const mainImage = document.getElementById('product-main-image');
  
  if (mainImage) {
    mainImage.style.opacity = '0';
    setTimeout(() => {
      mainImage.src = currentProduct.images[index];
      mainImage.style.opacity = '1';
    }, 200);
  }
  
  // Update thumbnail active state
  document.querySelectorAll('.thumbnail-item').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Change Product Image (Arrow Navigation)
function changeProductImage(direction) {
  if (!currentProduct || !currentProduct.images || currentProduct.images.length === 0) return;
  
  currentImageIndex += direction;
  
  // Loop around
  if (currentImageIndex < 0) {
    currentImageIndex = currentProduct.images.length - 1;
  } else if (currentImageIndex >= currentProduct.images.length) {
    currentImageIndex = 0;
  }
  
  selectProductImage(currentImageIndex);
}

// Select Product Color
function selectProductColor(element, colorName) {
  selectedColor = colorName;
  
  // Update active state
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.remove('active');
  });
  element.classList.add('active');
  
  // Update display
  const displayEl = document.getElementById('selected-color-display');
  if (displayEl) {
    displayEl.textContent = colorName;
  }
}

// Select Product Size
function selectProductSize(element, size) {
  selectedSize = size;
  
  // Update active state
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  element.classList.add('active');
}

// Change Product Quantity
function changeProductQuantity(delta) {
  const input = document.getElementById('product-quantity');
  if (!input) return;
  
  let value = parseInt(input.value) || 1;
  value += delta;
  
  // Clamp between 1 and 10
  value = Math.max(1, Math.min(10, value));
  
  input.value = value;
  productQuantity = value;
}

// Add Product to Cart
function addProductToCart() {
  if (!currentProduct) {
    alert('No product selected');
    return;
  }
  
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    image: currentProduct.images ? currentProduct.images[0] : currentProduct.image,
    color: selectedColor,
    size: selectedSize,
    quantity: productQuantity,
    addedAt: new Date().toISOString()
  };
  
  // Get existing cart
  let cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
  
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
  
  // Save to localStorage
  localStorage.setItem('acidicCart', JSON.stringify(cart));
  
  // Update cart UI
  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }
  
  // Show success message
  showAddToCartSuccess();
  
  // Close modal after delay
  setTimeout(() => {
    closeProductModal();
  }, 1500);
}

// Show Add to Cart Success
function showAddToCartSuccess() {
  const btn = document.querySelector('.btn-add-to-cart');
  if (!btn) return;
  
  const originalHTML = btn.innerHTML;
  
  btn.innerHTML = `
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    <span>Added to Cart!</span>
  `;
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.background = '';
  }, 2000);
}

// Toggle Wishlist
function toggleWishlist() {
  const btn = document.querySelector('.btn-wishlist');
  if (!btn) return;
  
  const svg = btn.querySelector('svg');
  const isInWishlist = svg.getAttribute('fill') !== 'none';
  
  if (isInWishlist) {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
  } else {
    svg.setAttribute('fill', '#ff4444');
    svg.setAttribute('stroke', '#ff4444');
  }
  
  // Animate
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 200);
}

// Toggle Accordion
function toggleAccordion(button) {
  const item = button.closest('.accordion-item');
  const isActive = item.classList.contains('active');
  
  // Close all accordions
  document.querySelectorAll('.accordion-item').forEach(accordionItem => {
    accordionItem.classList.remove('active');
  });
  
  // Toggle current
  if (!isActive) {
    item.classList.add('active');
  }
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('product-modal-overlay')) {
    closeProductModal();
  }
});

console.log('✅ Product Modal Functionality Loaded');