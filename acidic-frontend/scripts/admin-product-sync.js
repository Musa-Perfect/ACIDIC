
(function () {
  const PRODUCTS_KEY = 'acidic_admin_products';
  const ORDERS_KEY   = 'acidic_orders';

  // ── 1. Load products from localStorage and patch window.productData ──────
  function loadAdminProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (!raw) return false; // no admin products yet, use defaults from products.js

      const products = JSON.parse(raw);
      if (!Array.isArray(products) || products.length === 0) return false;

      // Build window.productData that the rest of the site expects
      const byCategory = {};
      products.forEach(p => {
        const cat = (p.category || 'other').toLowerCase();
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      });

      window.productData = {
        allproducts: products,
        ...byCategory,
        // Aliases
        tshirts:     byCategory['tshirts']    || [],
        hoodies:     byCategory['hoodies']    || [],
        sweaters:    byCategory['sweaters']   || [],
        pants:       byCategory['pants']      || [],
        twopieces:   byCategory['twopieces']  || [],
        accessories: byCategory['accessories']|| [],
      };

      // Also cache each product individually (for product.html nav)
      products.forEach(p => {
        localStorage.setItem('acidic_product_' + p.id, JSON.stringify(p));
      });

      console.log('✅ [admin-products-sync] Loaded', products.length, 'products from admin localStorage');
      return true;

    } catch (e) {
      console.warn('[admin-products-sync] Error loading products:', e);
      return false;
    }
  }

  // ── 2. Save order to localStorage so admin can see it ────────────────────
  window.saveOrderForAdmin = function (orderData) {
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      const order = {
        id: 'ACID-' + Date.now(),
        ...orderData,
        status: orderData.status || 'pending',
        createdAt: new Date().toISOString()
      };
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      console.log('✅ Order saved for admin:', order.id);
      return order;
    } catch (e) {
      console.warn('[admin-products-sync] Error saving order:', e);
    }
  };

  // ── 3. Intercept existing checkout to capture orders ─────────────────────
  window.addEventListener('load', function () {
    // Patch validateCheckoutForm if it exists (used in your checkout modal)
    const origValidate = window.validateCheckoutForm;
    if (typeof origValidate === 'function') {
      window.validateCheckoutForm = function () {
        // Let original run first
        const result = origValidate.apply(this, arguments);
        return result;
      };
    }

    // Patch processPayment if it exists
    const origProcess = window.processPayment;
    if (typeof origProcess === 'function') {
      window.processPayment = function () {
        // Capture the order before processing
        try {
          const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
          if (cart.length > 0) {
            const total = cart.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
            window.saveOrderForAdmin({
              customerName: (document.getElementById('fname')?.value || '') + ' ' + (document.getElementById('lname')?.value || ''),
              email:   document.getElementById('email')?.value || '',
              phone:   document.getElementById('phone')?.value || '',
              address: [
                document.getElementById('address')?.value,
                document.getElementById('city')?.value,
                document.getElementById('province')?.value,
                document.getElementById('postal')?.value,
                document.getElementById('country')?.value
              ].filter(Boolean).join(', '),
              items: cart,
              total: total + 150, // +R150 delivery
              paymentMethod: document.getElementById('payment-method')?.value || 'Card'
            });
          }
        } catch (e) {}
        return origProcess.apply(this, arguments);
      };
      console.log('✅ [admin-products-sync] Patched processPayment');
    }
  });

  // ── 4. Real-time sync: if admin tab saves new products, update this tab ───
  window.addEventListener('storage', function (e) {
    if (e.key === PRODUCTS_KEY && e.newValue) {
      console.log('🔄 Products updated by admin — refreshing shop...');
      loadAdminProducts();
      // Re-render shop if it's currently visible
      if (typeof window.filterCategory === 'function') {
        window.filterCategory('all');
      }
    }
  });

  // ── 5. Run immediately ───────────────────────────────────────────────────
  const loaded = loadAdminProducts();
  if (!loaded) {
    console.log('ℹ️ [admin-products-sync] No admin products in localStorage yet — using products.js defaults');
  }

})();