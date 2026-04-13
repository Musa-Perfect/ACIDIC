/**
 * ACIDIC STORE — Shared Data Bridge
 * ====================================
 * This script is the single source of truth for products and orders.
 * Include it in BOTH index.html and admin.html BEFORE any other scripts.
 *
 * How it works:
 *  - Products are stored in localStorage under "acidic_products"
 *  - Orders are stored in localStorage under "acidic_orders"
 *  - Both the storefront and admin read from the same keys
 *  - Admin writes products → storefront reads them instantly on reload
 *  - Storefront writes orders → admin reads them instantly on reload
 *  - The "storage" event lets both tabs sync in real-time if open side by side
 */

// ─── DEFAULT PRODUCTS (only used if no products saved yet) ──────────────────
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "ACIDIC Classic Tee",
    category: "tshirts",
    price: 350,
    comparePrice: 450,
    description: "The iconic ACIDIC classic tee. Premium heavyweight cotton streetwear.",
    image: "acidic 9.jpg",
    images: ["acidic 9.jpg"],
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Black","White","Red"],
    stock: 25,
    lowStockThreshold: 5,
    sku: "ACID-TSH-CLK-001",
    featured: true,
    isNew: true,
    badge: "NEW",
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "ACIDIC Street Hoodie",
    category: "hoodies",
    price: 650,
    comparePrice: 850,
    description: "Bold streetwear hoodie for the culture. Fleece-lined comfort.",
    image: "acidic 8.jpg",
    images: ["acidic 8.jpg"],
    sizes: ["S","M","L","XL","XXL"],
    colors: ["Black","Grey","Navy"],
    stock: 15,
    lowStockThreshold: 5,
    sku: "ACID-HOD-STR-002",
    featured: true,
    isNew: false,
    badge: "BESTSELLER",
    rating: 4.9,
    reviews: 87
  },
  {
    id: 3,
    name: "ACIDIC Premium Sweater",
    category: "sweaters",
    price: 550,
    comparePrice: 700,
    description: "Luxury knit sweater for elevated street style.",
    image: "acidic.jpg",
    images: ["acidic.jpg"],
    sizes: ["S","M","L","XL"],
    colors: ["Cream","Black","Forest Green"],
    stock: 8,
    lowStockThreshold: 5,
    sku: "ACID-SWT-PRM-003",
    featured: false,
    isNew: true,
    badge: "NEW",
    rating: 4.7,
    reviews: 43
  },
  {
    id: 4,
    name: "ACIDIC Cargo Pants",
    category: "pants",
    price: 750,
    comparePrice: 950,
    description: "Utility cargo pants built for the streets. Multiple pockets, premium fit.",
    image: "acidic 13.jpg",
    images: ["acidic 13.jpg"],
    sizes: ["28","30","32","34","36"],
    colors: ["Black","Khaki","Olive"],
    stock: 12,
    lowStockThreshold: 5,
    sku: "ACID-PNT-CRG-004",
    featured: true,
    isNew: false,
    badge: "HOT",
    rating: 4.6,
    reviews: 56
  },
  {
    id: 5,
    name: "ACIDIC Two-Piece Set",
    category: "twopieces",
    price: 950,
    comparePrice: 1200,
    description: "Matching two-piece set for a complete ACIDIC look.",
    image: "acidic 10.jpg",
    images: ["acidic 10.jpg"],
    sizes: ["XS","S","M","L","XL"],
    colors: ["Black","White"],
    stock: 6,
    lowStockThreshold: 3,
    sku: "ACID-SET-TWO-005",
    featured: true,
    isNew: true,
    badge: "NEW",
    rating: 4.8,
    reviews: 29
  }
];

// ─── STORAGE KEYS ────────────────────────────────────────────────────────────
const KEYS = {
  PRODUCTS: "acidic_products",
  ORDERS:   "acidic_orders",
  SETTINGS: "acidic_settings"
};

// ─── PRODUCTS API ────────────────────────────────────────────────────────────
const AcidicStore = {

  // --- PRODUCTS ---

  /**
   * Get all products. Seeds defaults if none exist yet.
   */
  getProducts() {
    try {
      const raw = localStorage.getItem(KEYS.PRODUCTS);
      if (!raw) {
        // First time — seed defaults
        this.setProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      return JSON.parse(raw);
    } catch(e) {
      console.error("AcidicStore.getProducts error:", e);
      return DEFAULT_PRODUCTS;
    }
  },

  /**
   * Save the full product array.
   */
  setProducts(products) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  /**
   * Get products by category (or "all").
   */
  getByCategory(category) {
    const products = this.getProducts();
    if (!category || category === "all" || category === "allproducts") return products;
    return products.filter(p => p.category === category);
  },

  /**
   * Get a single product by id.
   */
  getProduct(id) {
    return this.getProducts().find(p => String(p.id) === String(id)) || null;
  },

  /**
   * Add a new product. Returns the saved product with its assigned id.
   */
  addProduct(productData) {
    const products = this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const product = {
      id: newId,
      ...productData,
      stock: parseInt(productData.stock) || 0,
      price: parseFloat(productData.price) || 0,
      comparePrice: parseFloat(productData.comparePrice) || 0,
      featured: productData.featured || false,
      isNew: productData.isNew !== false,
      rating: productData.rating || 0,
      reviews: productData.reviews || 0,
      createdAt: new Date().toISOString()
    };
    products.push(product);
    this.setProducts(products);
    console.log("✅ Product added:", product.name);
    return product;
  },

  /**
   * Update an existing product.
   */
  updateProduct(id, updates) {
    const products = this.getProducts();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) { console.warn("Product not found:", id); return null; }
    products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.setProducts(products);
    console.log("✅ Product updated:", products[idx].name);
    return products[idx];
  },

  /**
   * Delete a product by id.
   */
  deleteProduct(id) {
    let products = this.getProducts();
    const before = products.length;
    products = products.filter(p => String(p.id) !== String(id));
    this.setProducts(products);
    console.log(`✅ Deleted product ${id}. ${before - products.length} removed.`);
  },

  /**
   * Reduce stock when an order is placed.
   */
  reduceStock(id, qty = 1) {
    const products = this.getProducts();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    products[idx].stock = Math.max(0, (products[idx].stock || 0) - qty);
    this.setProducts(products);
  },

  // --- ORDERS ---

  /**
   * Get all orders (newest first).
   */
  getOrders() {
    try {
      const raw = localStorage.getItem(KEYS.ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  },

  /**
   * Save an order from the storefront.
   * Call this when a customer completes checkout.
   */
  saveOrder(orderData) {
    const orders = this.getOrders();
    const orderId = "ACID-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const order = {
      id: orderId,
      ...orderData,
      status: orderData.status || "pending",
      createdAt: new Date().toISOString()
    };
    orders.unshift(order); // newest first
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Reduce stock for each item
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        this.reduceStock(item.id || item.productId, item.qty || item.quantity || 1);
      });
    }

    console.log("✅ Order saved:", orderId);
    return order;
  },

  /**
   * Update an order's status (admin use).
   */
  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return orders[idx];
  },

  // --- STATS (for admin dashboard) ---

  getStats() {
    const products = this.getProducts();
    const orders   = this.getOrders();
    const totalSales = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const lowStock = products.filter(p => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalSales,
      lowStock,
      outOfStock,
      pendingOrders: orders.filter(o => o.status === "pending").length
    };
  },

  // --- SETTINGS ---

  getSettings() {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  },

  saveSettings(settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};

// ─── EXPOSE GLOBALLY ─────────────────────────────────────────────────────────
window.AcidicStore = AcidicStore;

// ─── WIRE UP window.productData (so existing index.html code still works) ────
function refreshProductData() {
  const products = AcidicStore.getProducts();
  const byCategory = {};
  products.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });
  window.productData = {
    allproducts: products,
    ...byCategory
  };
}
refreshProductData();

// ─── REAL-TIME SYNC: if admin and storefront open side-by-side ───────────────
window.addEventListener("storage", (e) => {
  if (e.key === KEYS.PRODUCTS) {
    refreshProductData();
    // If the shop grid is visible, re-render it
    if (typeof renderShopProducts === "function") renderShopProducts();
    if (typeof loadHomeArrivals === "function") loadHomeArrivals();
    console.log("🔄 Products synced from another tab");
  }
  if (e.key === KEYS.ORDERS) {
    // If admin orders section is visible, re-render
    if (typeof renderAdminOrders === "function") renderAdminOrders();
    console.log("🔄 Orders synced from another tab");
  }
});

console.log("✅ AcidicStore loaded. Products:", AcidicStore.getProducts().length, "| Orders:", AcidicStore.getOrders().length);