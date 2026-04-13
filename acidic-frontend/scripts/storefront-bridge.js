/**
 * ACIDIC Storefront Bridge — storefront-bridge.js
 * Include this in index.html AFTER acidic-store.js but BEFORE other scripts.
 *
 * What it does:
 *  1. Overrides window.productData so the shop reads from localStorage
 *  2. Patches the checkout/order flow so completed orders are saved to localStorage
 *  3. Admin can then see all orders in real time
 */

// ─── 1. MAKE SHOP USE LOCALSTORE PRODUCTS ────────────────────────────────────

/**
 * Refresh window.productData from localStorage (called on load and after sync).
 * Your existing index.html code references window.productData, so this keeps it working.
 */
window.refreshProductData = function() {
  const products = AcidicStore.getProducts();

  // Build category maps
  const byCategory = {};
  products.forEach(p => {
    const cat = p.category || "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  });

  window.productData = {
    allproducts: products,
    ...byCategory
  };

  // Also update individual product entries in localStorage (for product.html navigation)
  products.forEach(p => {
    localStorage.setItem(`acidic_product_${p.id}`, JSON.stringify(p));
  });
};

// Run immediately
window.refreshProductData();

// ─── 2. PATCH ORDER SAVING ────────────────────────────────────────────────────
/**
 * Call this function when a customer successfully completes checkout.
 * It saves the order to localStorage so admin.html can see it.
 *
 * @param {Object} orderData  - { customerName, email, phone, address, items, total }
 *   items: Array of { id, name, qty, price, size, color }
 *
 * Returns the saved order object with its generated ID.
 */
window.saveOrderToAdmin = function(orderData) {
  const order = AcidicStore.saveOrder(orderData);
  console.log("✅ Order saved to admin:", order.id);
  return order;
};

// ─── 3. AUTO-PATCH PayFast / existing checkout code ──────────────────────────
/**
 * We watch for PayFast's onsite payment completion callback.
 * If your existing code calls window.payfastCallback or sets a success flag,
 * we intercept it and save the order.
 *
 * Also patches any existing completeOrder / processOrder functions.
 */

// Wait for page to load so existing functions are defined first
window.addEventListener("load", () => {

  // Patch window.completeOrder if it exists
  const _origCompleteOrder = window.completeOrder;
  if (typeof _origCompleteOrder === "function") {
    window.completeOrder = function(orderData) {
      try {
        window.saveOrderToAdmin(buildOrderFromCart(orderData));
      } catch(e) { console.warn("Could not save order:", e); }
      return _origCompleteOrder.apply(this, arguments);
    };
    console.log("✅ Patched window.completeOrder");
  }

  // Patch window.processOrder if it exists
  const _origProcessOrder = window.processOrder;
  if (typeof _origProcessOrder === "function") {
    window.processOrder = function(orderData) {
      try {
        window.saveOrderToAdmin(buildOrderFromCart(orderData));
      } catch(e) { console.warn("Could not save order:", e); }
      return _origProcessOrder.apply(this, arguments);
    };
    console.log("✅ Patched window.processOrder");
  }

  // PayFast onsite completion callback
  window.payfastOnComplete = function(paymentData) {
    try {
      const cartData = getCartForOrder();
      const order = window.saveOrderToAdmin({
        customerName: paymentData.name_first + " " + paymentData.name_last,
        email:        paymentData.email_address,
        phone:        paymentData.cell_number || "",
        address:      "",
        items:        cartData.items,
        total:        paymentData.amount_gross || cartData.total,
        paymentId:    paymentData.pf_payment_id,
        paymentMethod:"PayFast"
      });
      console.log("✅ PayFast order saved:", order.id);
    } catch(e) {
      console.warn("PayFast order save error:", e);
    }
  };

});

// ─── 4. HELPER: Build Order from Cart ────────────────────────────────────────
function getCartForOrder() {
  try {
    const raw = localStorage.getItem("acidic_cart") || localStorage.getItem("cart") || "[]";
    const cart = JSON.parse(raw);
    const items = Array.isArray(cart) ? cart : (cart.items || []);
    const total = items.reduce((sum, i) =>
      sum + (parseFloat(i.price || 0) * parseInt(i.qty || i.quantity || 1)), 0
    );
    return { items, total };
  } catch(e) {
    return { items: [], total: 0 };
  }
}

function buildOrderFromCart(extraData = {}) {
  const { items, total } = getCartForOrder();
  return {
    customerName: extraData.customerName || extraData.name || "Guest",
    email:        extraData.email || "",
    phone:        extraData.phone || "",
    address:      extraData.address || extraData.shippingAddress || "",
    items,
    total:        extraData.total || total,
    ...extraData
  };
}

// ─── 5. MANUAL ORDER SAVE (for your checkout form submit) ────────────────────
/**
 * Call this directly in your checkout form's submit handler.
 * Example usage in your existing code:
 *
 *   // When checkout form is submitted and payment succeeds:
 *   AcidicStorefront.recordOrder({
 *     customerName: "John Doe",
 *     email: "john@example.com",
 *     phone: "0821234567",
 *     address: "123 Main St, Durban",
 *     items: cart,       // your cart array
 *     total: cartTotal
 *   });
 */
window.AcidicStorefront = {
  recordOrder(orderData) {
    return window.saveOrderToAdmin(orderData);
  },
  getProducts() {
    return AcidicStore.getProducts();
  },
  getProductsByCategory(cat) {
    return AcidicStore.getByCategory(cat);
  }
};

// ─── 6. FIND & PATCH EXISTING CHECKOUT SUBMIT ────────────────────────────────
// Look for common checkout form IDs and hook into their submit
document.addEventListener("DOMContentLoaded", () => {
  const checkoutFormIds = [
    "checkout-form", "payment-form", "order-form",
    "checkout", "place-order-form", "billing-form"
  ];

  checkoutFormIds.forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener("submit", () => {
      // Run after a small delay so the original handler fires first
      setTimeout(() => {
        const cartData = getCartForOrder();
        if (cartData.items.length > 0) {
          // Try to get customer info from common field names
          const name  = getFieldValue(["customer-name","full-name","firstname","first-name","billing-name"]);
          const email = getFieldValue(["email","customer-email","billing-email"]);
          const phone = getFieldValue(["phone","mobile","cell","billing-phone"]);
          const addr  = getFieldValue(["address","shipping-address","billing-address"]);

          window.saveOrderToAdmin({
            customerName: name || "Customer",
            email, phone, address: addr,
            items: cartData.items,
            total: cartData.total
          });
        }
      }, 500);
    });

    console.log(`✅ Hooked into checkout form: #${id}`);
  });
});

function getFieldValue(ids) {
  for (const id of ids) {
    const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
    if (el && el.value) return el.value.trim();
  }
  return "";
}

console.log("✅ Storefront bridge loaded. Products available:", AcidicStore.getProducts().length);