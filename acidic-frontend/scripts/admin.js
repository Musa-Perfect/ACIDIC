/**
 * ACIDIC Admin Dashboard — admin.js
 * Reads & writes products and orders via window.AcidicStore (acidic-store.js)
 */

// ─── SECTION NAVIGATION ──────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
  document.querySelectorAll(".admin-sidebar li").forEach(li => li.classList.remove("active"));

  const section = document.getElementById(name + "-section");
  if (section) section.style.display = "block";

  const navItem = [...document.querySelectorAll(".admin-sidebar li")]
    .find(li => li.getAttribute("onclick") && li.getAttribute("onclick").includes(`'${name}'`));
  if (navItem) navItem.classList.add("active");

  // Load data for the section
  if (name === "dashboard")   loadDashboard();
  if (name === "products")    renderProductsTable();
  if (name === "inventory")   renderInventory();
  if (name === "orders")      renderAdminOrders();
  if (name === "analytics")   renderAnalytics();
  if (name === "promotions")  renderPromotions();
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function loadDashboard() {
  const stats = AcidicStore.getStats();
  setEl("total-products", stats.totalProducts);
  setEl("total-sales", "R" + stats.totalSales.toFixed(2));
  setEl("low-stock", stats.lowStock);

  // Recent orders preview (last 5)
  const orders = AcidicStore.getOrders().slice(0, 5);
  const container = document.getElementById("recent-orders");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:#666">No orders yet. Orders placed on your website will appear here.</p>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName || o.email || "Guest"}</td>
            <td>${(o.items || []).length} item(s)</td>
            <td>R${parseFloat(o.total || 0).toFixed(2)}</td>
            <td><span class="status ${statusClass(o.status)}">${capitalize(o.status || "pending")}</span></td>
            <td>${formatDate(o.createdAt)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
}

// ─── PRODUCTS TABLE ───────────────────────────────────────────────────────────
function renderProductsTable(filter = "") {
  let products = AcidicStore.getProducts();
  if (filter) {
    const q = filter.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q)
    );
  }

  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#666">No products found. Add your first product!</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const stockStatus = p.stock === 0 ? "out-of-stock" : p.stock <= (p.lowStockThreshold || 5) ? "low-stock" : "in-stock";
    const stockLabel  = p.stock === 0 ? "Out of Stock" : p.stock <= (p.lowStockThreshold || 5) ? "Low Stock" : "In Stock";
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <img src="${p.image || p.images?.[0] || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;background:#eee" onerror="this.style.background='#ddd'" />
            <div>
              <strong>${p.name}</strong>
              <div style="font-size:12px;color:#666">${p.sku || ""}</div>
            </div>
          </div>
        </td>
        <td>${capitalize(p.category)}</td>
        <td>R${parseFloat(p.price).toFixed(2)}</td>
        <td>${p.stock}</td>
        <td><span class="status ${stockStatus}">${stockLabel}</span></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn edit-btn" onclick="editProduct(${p.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="confirmDeleteProduct(${p.id}, '${escHtml(p.name)}')">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function searchProducts(value) {
  renderProductsTable(value);
}

// ─── ADD / EDIT PRODUCT ───────────────────────────────────────────────────────
let editingProductId = null;

function clearProductForm() {
  editingProductId = null;
  document.getElementById("add-product-form")?.reset();
  const heading = document.querySelector("#add-product-section h2");
  if (heading) heading.textContent = "Add New Product";
  const btn = document.querySelector("#add-product-section .btn-primary[type='submit']");
  if (btn) btn.textContent = "💾 Save Product";
}

function editProduct(id) {
  const p = AcidicStore.getProduct(id);
  if (!p) return alert("Product not found.");

  editingProductId = id;
  showSection("add-product");

  setInputVal("product-name", p.name);
  setInputVal("product-category", p.category);
  setInputVal("product-price", p.price);
  setInputVal("product-compare-price", p.comparePrice || "");
  setInputVal("product-description", p.description || "");
  setInputVal("product-sku", p.sku || "");
  setInputVal("initial-stock", p.stock);
  setInputVal("low-stock-threshold", p.lowStockThreshold || 5);

  const heading = document.querySelector("#add-product-section h2");
  if (heading) heading.textContent = `Edit Product: ${p.name}`;
  const btn = document.querySelector("#add-product-section .btn-primary[type='submit']");
  if (btn) btn.textContent = "💾 Update Product";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Hook up the form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveProductForm();
    });
  }
  loadDashboard();
});

function saveProductForm() {
  const name     = getInputVal("product-name");
  const category = getInputVal("product-category");
  const price    = getInputVal("product-price");
  const stock    = getInputVal("initial-stock");

  if (!name || !category || !price || !stock) {
    return alert("Please fill in all required fields (Name, Category, Price, Stock).");
  }

  const productData = {
    name,
    category,
    price:              parseFloat(price),
    comparePrice:       parseFloat(getInputVal("product-compare-price")) || 0,
    description:        getInputVal("product-description"),
    sku:                getInputVal("product-sku"),
    stock:              parseInt(stock),
    lowStockThreshold:  parseInt(getInputVal("low-stock-threshold")) || 5,
    image:              window._uploadedImageUrl || "",
    images:             window._uploadedImages || [],
    isNew:              true
  };

  if (editingProductId) {
    AcidicStore.updateProduct(editingProductId, productData);
    showToast(`✅ "${name}" updated successfully! Changes are live on your website.`);
  } else {
    AcidicStore.addProduct(productData);
    showToast(`✅ "${name}" added! It's now visible in your store.`);
  }

  clearProductForm();
  showSection("products");
}

function confirmDeleteProduct(id, name) {
  if (confirm(`Delete "${name}"? This will remove it from your website immediately.`)) {
    AcidicStore.deleteProduct(id);
    renderProductsTable();
    showToast(`🗑️ "${name}" deleted from your store.`);
  }
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function renderInventory() {
  const container = document.getElementById("inventory-section");
  if (!container) return;

  const products = AcidicStore.getProducts();
  container.innerHTML = `
    <h2>Inventory Management</h2>
    <div class="product-table" style="margin-top:20px">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Current Stock</th>
            <th>Low Stock Threshold</th>
            <th>Status</th>
            <th>Update Stock</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const ss = p.stock === 0 ? "out-of-stock" : p.stock <= (p.lowStockThreshold || 5) ? "low-stock" : "in-stock";
            const sl = p.stock === 0 ? "Out of Stock" : p.stock <= (p.lowStockThreshold || 5) ? "Low Stock" : "In Stock";
            return `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.sku || "-"}</td>
                <td><strong id="stock-display-${p.id}">${p.stock}</strong></td>
                <td>${p.lowStockThreshold || 5}</td>
                <td><span class="status ${ss}">${sl}</span></td>
                <td>
                  <div style="display:flex;gap:8px;align-items:center">
                    <input type="number" id="stock-input-${p.id}" value="${p.stock}" min="0" style="width:80px;padding:6px;border:1px solid #ddd;border-radius:4px" />
                    <button class="action-btn edit-btn" onclick="updateStock(${p.id})">Update</button>
                  </div>
                </td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

function updateStock(id) {
  const input = document.getElementById("stock-input-" + id);
  if (!input) return;
  const newStock = parseInt(input.value);
  if (isNaN(newStock) || newStock < 0) return alert("Please enter a valid stock number.");
  AcidicStore.updateProduct(id, { stock: newStock });
  const display = document.getElementById("stock-display-" + id);
  if (display) display.textContent = newStock;
  showToast("✅ Stock updated. Changes are live on your website.");
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
window.renderAdminOrders = function() {
  const container = document.getElementById("orders-section");
  if (!container) return;

  const orders = AcidicStore.getOrders();
  if (orders.length === 0) {
    container.innerHTML = `
      <h2>Orders</h2>
      <div class="product-table" style="margin-top:20px;padding:40px;text-align:center;color:#666">
        <p style="font-size:18px">📦 No orders yet</p>
        <p style="margin-top:10px">When customers place orders on your website, they will appear here automatically.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <h2>Orders <span style="font-size:14px;color:#666;font-weight:normal">(${orders.length} total)</span></h2>
    <div class="product-table" style="margin-top:20px">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr id="order-row-${o.id}">
              <td><strong>${o.id}</strong></td>
              <td>
                <div>${o.customerName || "Guest"}</div>
                <div style="font-size:12px;color:#666">${o.email || ""}</div>
              </td>
              <td>
                ${(o.items || []).map(i => `<div style="font-size:12px">${i.name || i.productName} × ${i.qty || i.quantity || 1}</div>`).join("") || "—"}
              </td>
              <td><strong>R${parseFloat(o.total || 0).toFixed(2)}</strong></td>
              <td>
                <select onchange="changeOrderStatus('${o.id}', this.value)" style="padding:5px;border-radius:4px;border:1px solid #ddd">
                  ${["pending","processing","shipped","delivered","cancelled"].map(s =>
                    `<option value="${s}" ${o.status === s ? "selected" : ""}>${capitalize(s)}</option>`
                  ).join("")}
                </select>
              </td>
              <td>${formatDate(o.createdAt)}</td>
              <td>
                <button class="action-btn edit-btn" onclick="viewOrderDetail('${o.id}')">View</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
};

function changeOrderStatus(orderId, newStatus) {
  AcidicStore.updateOrderStatus(orderId, newStatus);
  showToast(`✅ Order ${orderId} marked as ${capitalize(newStatus)}`);
}

function viewOrderDetail(orderId) {
  const order = AcidicStore.getOrders().find(o => o.id === orderId);
  if (!order) return;
  const items = (order.items || []).map(i =>
    `• ${i.name || i.productName} (${i.size || ""} ${i.color || ""}) × ${i.qty || i.quantity || 1} = R${((i.price || 0) * (i.qty || i.quantity || 1)).toFixed(2)}`
  ).join("\n");
  alert(`ORDER: ${order.id}
Customer: ${order.customerName || "Guest"}
Email: ${order.email || "—"}
Phone: ${order.phone || "—"}
Address: ${order.address || "—"}

ITEMS:
${items || "No items recorded"}

Total: R${parseFloat(order.total || 0).toFixed(2)}
Status: ${capitalize(order.status || "pending")}
Date: ${formatDate(order.createdAt)}`);
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
function renderAnalytics() {
  const container = document.getElementById("analytics-section");
  if (!container) return;

  const stats   = AcidicStore.getStats();
  const orders  = AcidicStore.getOrders();
  const products = AcidicStore.getProducts();

  // Category breakdown
  const catCount = {};
  products.forEach(p => { catCount[p.category] = (catCount[p.category] || 0) + 1; });

  // Order status breakdown
  const statusCount = {};
  orders.forEach(o => { statusCount[o.status || "pending"] = (statusCount[o.status || "pending"] || 0) + 1; });

  container.innerHTML = `
    <h2>Analytics Overview</h2>
    <div class="dashboard-stats" style="margin-top:20px">
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <div class="value">R${stats.totalSales.toFixed(2)}</div>
        <div class="trend up">From ${stats.totalOrders} orders</div>
      </div>
      <div class="stat-card">
        <h3>Total Products</h3>
        <div class="value">${stats.totalProducts}</div>
        <div class="trend">${stats.outOfStock} out of stock</div>
      </div>
      <div class="stat-card">
        <h3>Total Orders</h3>
        <div class="value">${stats.totalOrders}</div>
        <div class="trend up">${stats.pendingOrders} pending</div>
      </div>
      <div class="stat-card">
        <h3>Avg Order Value</h3>
        <div class="value">R${stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : "0.00"}</div>
        <div class="trend">Per completed order</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
      <div class="product-table" style="padding:20px">
        <h3>Products by Category</h3>
        <table style="margin-top:15px">
          <thead><tr><th>Category</th><th>Products</th></tr></thead>
          <tbody>
            ${Object.entries(catCount).map(([cat, count]) =>
              `<tr><td>${capitalize(cat)}</td><td>${count}</td></tr>`
            ).join("") || "<tr><td colspan='2' style='color:#666'>No products</td></tr>"}
          </tbody>
        </table>
      </div>

      <div class="product-table" style="padding:20px">
        <h3>Orders by Status</h3>
        <table style="margin-top:15px">
          <thead><tr><th>Status</th><th>Count</th></tr></thead>
          <tbody>
            ${Object.entries(statusCount).map(([status, count]) =>
              `<tr><td><span class="status ${statusClass(status)}">${capitalize(status)}</span></td><td>${count}</td></tr>`
            ).join("") || "<tr><td colspan='2' style='color:#666'>No orders yet</td></tr>"}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ─── PROMOTIONS ───────────────────────────────────────────────────────────────
function renderPromotions() {
  const promos = AcidicStore.getSettings().promotions || [];
  const list = document.getElementById("promotions-list");
  if (!list) return;
  if (promos.length === 0) {
    list.innerHTML = `<div class="promotion-card"><p style="color:#666;text-align:center">No promotions yet. Create your first one!</p></div>`;
    return;
  }
  list.innerHTML = promos.map((p, i) => `
    <div class="promotion-card">
      <div class="promotion-header">
        <h3>${p.name}</h3>
        <span class="promotion-badge ${promoStatus(p)}">${capitalize(promoStatus(p))}</span>
      </div>
      <p>${p.type === "percentage" ? p.value + "% off" : "R" + p.value + " off"} — ${capitalize(p.target || "all products")}</p>
      <p style="font-size:12px;color:#666;margin-top:8px">
        ${formatDate(p.startDate)} → ${formatDate(p.endDate)}
      </p>
      <div style="margin-top:10px">
        <button class="action-btn delete-btn" onclick="deletePromotion(${i})">Remove</button>
      </div>
    </div>`).join("");
}

function showAddPromotionModal() {
  const m = document.getElementById("add-promotion-modal");
  if (m) m.classList.add("active");
}
function closePromotionModal() {
  const m = document.getElementById("add-promotion-modal");
  if (m) m.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const pf = document.getElementById("promotion-form");
  if (pf) {
    pf.addEventListener("submit", (e) => {
      e.preventDefault();
      const promo = {
        name:      getInputVal("promotion-name"),
        type:      getInputVal("promotion-type"),
        value:     getInputVal("promotion-value"),
        target:    getInputVal("promotion-target"),
        startDate: getInputVal("start-date"),
        endDate:   getInputVal("end-date")
      };
      const settings = AcidicStore.getSettings();
      settings.promotions = settings.promotions || [];
      settings.promotions.push(promo);
      AcidicStore.saveSettings(settings);
      closePromotionModal();
      renderPromotions();
      showToast("✅ Promotion created!");
    });
  }

  // Promotion target toggle
  const target = document.getElementById("promotion-target");
  if (target) {
    target.addEventListener("change", () => {
      const catDiv = document.getElementById("target-category");
      if (catDiv) catDiv.style.display = target.value === "category" ? "block" : "none";
    });
  }
});

function deletePromotion(index) {
  if (!confirm("Remove this promotion?")) return;
  const settings = AcidicStore.getSettings();
  settings.promotions = settings.promotions || [];
  settings.promotions.splice(index, 1);
  AcidicStore.saveSettings(settings);
  renderPromotions();
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
window._uploadedImageUrl = "";
window._uploadedImages   = [];

function triggerImageUpload() {
  document.getElementById("image-upload")?.click();
}

function handleImageUpload(files) {
  if (!files || files.length === 0) return;
  window._uploadedImages = [];
  const preview = document.getElementById("image-preview");
  if (preview) preview.innerHTML = "";

  Array.from(files).forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      window._uploadedImages.push(url);
      if (i === 0) window._uploadedImageUrl = url;
      if (preview) {
        const img = document.createElement("img");
        img.src = url;
        img.style.cssText = "width:80px;height:80px;object-fit:cover;border-radius:4px;margin:4px;border:2px solid #ddd";
        preview.appendChild(img);
      }
    };
    reader.readAsDataURL(file);
  });
}

// ─── CSV BULK UPLOAD ──────────────────────────────────────────────────────────
function triggerCsvUpload() {
  document.getElementById("csv-upload")?.click();
}

let _csvData = null;
function handleCsvUpload(files) {
  if (!files || files.length === 0) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split("\n").filter(l => l.trim());
    if (lines.length < 2) return alert("CSV file appears empty.");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    _csvData = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const obj = {};
      headers.forEach((h, i) => obj[h] = vals[i] || "");
      return obj;
    });
    const preview = document.getElementById("upload-preview");
    if (preview) {
      preview.innerHTML = `<p style="color:#4caf50;font-weight:bold">✅ ${_csvData.length} products ready to import.</p>
        <p style="color:#666;font-size:13px">Columns found: ${headers.join(", ")}</p>`;
    }
    const btn = document.getElementById("process-upload-btn");
    if (btn) btn.disabled = false;
  };
  reader.readAsText(files[0]);
}

function processBulkUpload() {
  if (!_csvData || _csvData.length === 0) return alert("No data to import.");
  let count = 0;
  _csvData.forEach(row => {
    if (row.name && row.category && row.price) {
      AcidicStore.addProduct({
        name:        row.name,
        category:    row.category,
        price:       parseFloat(row.price) || 0,
        comparePrice:parseFloat(row.comparePrice || row.compare_price) || 0,
        description: row.description || "",
        sku:         row.sku || "",
        stock:       parseInt(row.stock) || 0,
        image:       row.image || "",
        images:      row.image ? [row.image] : []
      });
      count++;
    }
  });
  _csvData = null;
  const btn = document.getElementById("process-upload-btn");
  if (btn) btn.disabled = true;
  showToast(`✅ ${count} products imported successfully! They're now live on your store.`);
}

function downloadTemplate() {
  const csv = "name,category,price,comparePrice,description,sku,stock,image\nACIDIC Example Tee,tshirts,350,450,A great product,ACID-001,10,";
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "acidic-products-template.csv";
  a.click();
}

// ─── VARIANTS ─────────────────────────────────────────────────────────────────
function addVariant() {
  const container = document.getElementById("variant-container");
  if (!container) return;
  const div = document.createElement("div");
  div.className = "variant-item";
  div.innerHTML = `
    <input type="text" placeholder="Variant Name (e.g., Size)" class="variant-name" />
    <input type="text" placeholder="Options (comma-separated)" class="variant-options" />
    <button type="button" class="action-btn delete-btn" onclick="removeVariant(this)">Remove</button>`;
  container.appendChild(div);
}

function removeVariant(btn) {
  btn.closest(".variant-item")?.remove();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function logoutAdmin() {
  if (confirm("Log out of admin?")) {
    localStorage.removeItem("acidic_admin_token");
    window.location.href = "index.html";
  }
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.cssText = `
      position:fixed;bottom:30px;right:30px;background:#000;color:#fff;
      padding:14px 22px;border-radius:8px;font-size:14px;
      box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:9999;
      opacity:0;transition:opacity 0.3s;max-width:350px;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.style.opacity = "0", 3500);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function setEl(id, val)     { const el = document.getElementById(id); if (el) el.textContent = val; }
function getInputVal(id)    { return (document.getElementById(id)?.value || "").trim(); }
function setInputVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
function capitalize(s)      { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function escHtml(s)         { return (s || "").replace(/'/g, "\\'").replace(/"/g, "&quot;"); }
function formatDate(iso)    {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-ZA", { day:"2-digit", month:"short", year:"numeric" }); }
  catch(e) { return iso; }
}
function statusClass(s) {
  switch((s || "").toLowerCase()) {
    case "delivered":   return "in-stock";
    case "processing":
    case "shipped":     return "low-stock";
    case "cancelled":   return "out-of-stock";
    default:            return "low-stock";
  }
}
function promoStatus(p) {
  const now = Date.now();
  const start = new Date(p.startDate).getTime();
  const end   = new Date(p.endDate).getTime();
  if (now < start) return "upcoming";
  if (now > end)   return "expired";
  return "active";
}