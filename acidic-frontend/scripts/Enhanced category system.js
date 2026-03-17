// ===== ENHANCED CATEGORY SYSTEM =====
// Complete modern shopping experience with filters and animations

console.log('🎨 Loading Enhanced Category System...');

(function() {
  'use strict';
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedShop);
  } else {
    initEnhancedShop();
  }
  
  function initEnhancedShop() {
    console.log('Initializing enhanced shop...');
    
    // Initialize the shop system
    setupCategorySystem();
    enhanceCategoryCards();
    updateProductCounts();
    
    console.log('✅ Enhanced shop system ready!');
  }
  
  // Setup the complete category system
  function setupCategorySystem() {
    
    // Enhanced showCategory function - called from category cards
    window.showCategory = function(category) {
      console.log('🎯 showCategory:', category);
      
      // Open shop page
      openShopPage();
      
      // Wait for shop to be visible, then filter
      setTimeout(() => {
        filterCategory(category);
        
        // Scroll to products after short delay
        setTimeout(() => {
          scrollToProducts();
        }, 300);
      }, 500);
    };
    
    // Filter by category function
    window.filterCategory = function(category) {
      console.log('🔍 Filtering by:', category);
      
      // Show loading state
      showLoadingState();
      
      // Simulate loading (gives smooth feel)
      setTimeout(() => {
        performFilter(category);
        hideLoadingState();
      }, 400);
    };
    
  }
  
  // Open shop page
  function openShopPage() {
    console.log('Opening shop page...');
    
    // Use existing goToShop if available
    if (typeof goToShop === 'function') {
      goToShop();
    } else {
      // Manual implementation
      hideAllSections();
      
      const shopPage = document.getElementById('shop-page');
      if (shopPage) {
        shopPage.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
  
  // Hide all page sections
  function hideAllSections() {
    const sections = [
      'home-page', 'shop-page', 'ai-stylist-section', 
      'virtual-tryon', 'sustainability', 'community', 
      'loyalty-program', 'outfit-builder', 'signup-section', 
      'login-section', 'product-section'
    ];
    
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
  
  // Perform the actual filtering
  function performFilter(category) {
    // Get all products
    const allProducts = getAllProducts();
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('No products found');
      showEmptyState();
      return;
    }
    
    // Filter products
    const filtered = category === 'all' || category === 'allproducts'
      ? allProducts
      : allProducts.filter(p => matchesCategory(p, category));
    
    console.log(`Found ${filtered.length} products in category:`, category);
    
    // Update UI
    updateActiveFilter(category);
    updatePageTitle(category);
    displayProducts(filtered);
    
    // Hide empty state if we have products
    if (filtered.length > 0) {
      hideEmptyState();
    } else {
      showEmptyState();
    }
  }
  
  // Get all products from data source
  function getAllProducts() {
    let products = [];
    
    // Try productData global
    if (window.productData && window.productData.allproducts) {
      products = window.productData.allproducts;
      console.log('Loaded from productData:', products.length);
    }
    // Try localStorage
    else if (localStorage.getItem('acidicProducts')) {
      products = JSON.parse(localStorage.getItem('acidicProducts'));
      console.log('Loaded from localStorage:', products.length);
    }
    
    return products;
  }
  
  // Check if product matches category
  function matchesCategory(product, category) {
    const productCat = (product.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchCat = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return productCat === searchCat || 
           productCat.includes(searchCat) || 
           searchCat.includes(productCat);
  }
  
  // Display products in grid
  function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) {
      console.error('Product grid not found');
      return;
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add products with staggered animation
    products.forEach((product, index) => {
      const card = createEnhancedProductCard(product, index);
      grid.appendChild(card);
    });
    
    console.log('✅ Displayed', products.length, 'products');
  }
  
  // Create enhanced product card
  function createEnhancedProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Get image
    const img = product.images?.[0] || product.image || 'acidic 1.jpg';
    const isNew = product.isNew || product.new || false;
    
    // Build card HTML
    card.innerHTML = `
      <div class="product-image-container">
        ${isNew ? '<span class="new-badge">NEW</span>' : ''}
        <img src="${img}" alt="${product.name}" class="product-image" 
             onerror="this.src='acidic 1.jpg'" loading="lazy">
        <button class="quick-add-cart" data-product-id="${product.id}">
          <svg class="cart-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category || 'Clothing'}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">R${parseFloat(product.price).toFixed(2)}</p>
        ${product.description ? `<p class="product-description">${truncate(product.description, 80)}</p>` : ''}
      </div>
    `;
    
    // Add click handlers
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.quick-add-cart')) {
        openProductDetails(product);
      }
    });
    
    const quickAddBtn = card.querySelector('.quick-add-cart');
    quickAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickAddToCart(product, quickAddBtn);
    });
    
    return card;
  }
  
  // Open product details
  function openProductDetails(product) {
    console.log('Opening product:', product.name);
    
    if (typeof viewProduct === 'function') {
      viewProduct(product.id);
    } else if (typeof showProductDetails === 'function') {
      showProductDetails(product);
    } else if (typeof openProductModal === 'function') {
      openProductModal(product);
    } else {
      console.warn('No product detail function found');
    }
  }
  
  // Quick add to cart
  function quickAddToCart(product, button) {
    console.log('Quick add:', product.name);
    
    // Add visual feedback
    button.classList.add('active');
    
    // Try existing functions
    if (typeof processQuickAdd === 'function') {
      processQuickAdd(product.id);
    } else if (typeof addToCart === 'function') {
      addToCart(product, 'Medium');
    } else {
      // Fallback: manual add
      manualAddToCart(product);
    }
    
    // Show success feedback
    setTimeout(() => {
      button.classList.remove('active');
      showQuickNotification(`${product.name} added to cart!`);
    }, 600);
  }
  
  // Manual add to cart fallback
  function manualAddToCart(product) {
    const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
    
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || 'acidic 1.jpg',
      size: 'Medium',
      color: 'Black',
      quantity: 1,
      addedAt: new Date().toISOString()
    });
    
    localStorage.setItem('acidicCart', JSON.stringify(cart));
    window.cart = cart;
    
    if (typeof updateCartCount === 'function') {
      updateCartCount();
    }
  }
  
  // Update active filter button
  function updateActiveFilter(category) {
    // Remove active from all
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.remove('active');
    });
    
    // Add active to selected
    const activePill = document.querySelector(`[data-category="${category}"]`) ||
                       document.querySelector('[data-category="all"]');
    
    if (activePill) {
      activePill.classList.add('active');
    }
  }
  
  // Update page title
  function updatePageTitle(category) {
    const titleEl = document.getElementById('shop-title');
    if (!titleEl) return;
    
    const titles = {
      'all': 'All Products',
      'allproducts': 'All Products',
      'tshirts': 'T-Shirts Collection',
      't-shirts': 'T-Shirts Collection',
      'hoodies': 'Hoodies Collection',
      'sweaters': 'Sweaters Collection',
      'pants': 'Pants Collection',
      'accessories': 'Accessories'
    };
    
    titleEl.textContent = titles[category.toLowerCase()] || 'Products';
  }
  
  // Update product counts in filter pills
  function updateProductCounts() {
    const products = getAllProducts();
    if (!products) return;
    
    // Count by category
    const counts = {
      'all': products.length,
      'tshirts': products.filter(p => matchesCategory(p, 'tshirts')).length,
      'hoodies': products.filter(p => matchesCategory(p, 'hoodies')).length,
      'sweaters': products.filter(p => matchesCategory(p, 'sweaters')).length,
      'pants': products.filter(p => matchesCategory(p, 'pants')).length,
      'accessories': products.filter(p => matchesCategory(p, 'accessories')).length
    };
    
    // Update count badges
    Object.keys(counts).forEach(cat => {
      const badge = document.getElementById(`count-${cat}`);
      if (badge) {
        badge.textContent = counts[cat];
      }
    });
  }
  
  // Enhance category cards on home page
  function enhanceCategoryCards() {
    setTimeout(() => {
      const cards = document.querySelectorAll('.category-card');
      console.log('Enhancing', cards.length, 'category cards');
      
      cards.forEach(card => {
        const onclick = card.getAttribute('onclick');
        if (onclick && onclick.includes('showCategory')) {
          const match = onclick.match(/showCategory\(['"]([^'"]+)['"]\)/);
          if (match) {
            const category = match[1];
            
            // Remove old onclick
            card.removeAttribute('onclick');
            
            // Add new click handler
            card.addEventListener('click', () => showCategory(category));
            
            // Enhance hover effect
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            card.addEventListener('mouseenter', function() {
              this.style.transform = 'translateY(-12px) scale(1.03)';
              this.style.boxShadow = '0 15px 40px rgba(244, 180, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', function() {
              this.style.transform = 'translateY(0) scale(1)';
              this.style.boxShadow = '';
            });
          }
        }
      });
    }, 1000);
  }
  
  // Scroll to products
  function scrollToProducts() {
    const grid = document.getElementById('product-grid');
    if (grid && grid.children.length > 0) {
      const pos = grid.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({
        top: pos,
        behavior: 'smooth'
      });
    }
  }
  
  // Show loading state
  function showLoadingState() {
    const loading = document.getElementById('products-loading');
    const grid = document.getElementById('product-grid');
    
    if (loading) loading.style.display = 'block';
    if (grid) grid.style.opacity = '0.3';
  }
  
  // Hide loading state
  function hideLoadingState() {
    const loading = document.getElementById('products-loading');
    const grid = document.getElementById('product-grid');
    
    if (loading) loading.style.display = 'none';
    if (grid) grid.style.opacity = '1';
  }
  
  // Show empty state
  function showEmptyState() {
    const empty = document.getElementById('empty-state');
    const grid = document.getElementById('product-grid');
    
    if (empty) empty.style.display = 'block';
    if (grid) grid.style.display = 'none';
  }
  
  // Hide empty state
  function hideEmptyState() {
    const empty = document.getElementById('empty-state');
    const grid = document.getElementById('product-grid');
    
    if (empty) empty.style.display = 'none';
    if (grid) grid.style.display = 'grid';
  }
  
  // Quick notification
  function showQuickNotification(message) {
    if (typeof showNotification === 'function') {
      showNotification(message, 'success');
      return;
    }
    
    // Fallback notification
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
      z-index: 100000;
      font-weight: 600;
      animation: slideInRight 0.4s ease;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 2500);
  }
  
  // Utility: Truncate text
  function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
  
  // Add slideInRight animation
  if (!document.getElementById('quick-notif-style')) {
    const style = document.createElement('style');
    style.id = 'quick-notif-style';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('✅ Enhanced category system loaded!');
  
})();

console.log('🎉 Enhanced Shopping Experience Ready!');