// ===== ADMIN MANAGEMENT SYSTEM =====

// Product Management
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        this.categories = ['tshirts', 'sweaters', 'hoodies', 'pants', 'twopieces', 'accessories'];
        this.loadProducts();
    }

    loadProducts() {
        // Load from localStorage
        this.products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        
        // If no products exist, load sample data
        if (this.products.length === 0) {
            this.loadSampleProducts();
        }
    }

    loadSampleProducts() {
        const sampleProducts = [
            {
                id: 1,
                name: 'ACIDIC Logo T-Shirt',
                category: 'tshirts',
                price: 299,
                comparePrice: 399,
                description: 'Premium cotton t-shirt with ACIDIC logo.',
                images: ['acidic 9.jpg'],
                variants: [
                    { name: 'Color', options: ['Black', 'White', 'Grey'] },
                    { name: 'Size', options: ['S', 'M', 'L', 'XL'] }
                ],
                inventory: [
                    { sku: 'ACID-TSH-BLK-S', color: 'Black', size: 'S', stock: 15, lowStock: 5 },
                    { sku: 'ACID-TSH-BLK-M', color: 'Black', size: 'M', stock: 20, lowStock: 5 },
                    { sku: 'ACID-TSH-WHT-M', color: 'White', size: 'M', stock: 10, lowStock: 5 }
                ],
                totalStock: 45,
                lowStockThreshold: 5,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        this.products = sampleProducts;
        this.saveProducts();
    }

    saveProducts() {
        localStorage.setItem('acidicProducts', JSON.stringify(this.products));
        this.updateDashboardStats();
    }

    addProduct(productData) {
        const newProduct = {
            id: Date.now(),
            ...productData,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(p => p.id == id);
        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...productData,
                updatedAt: new Date().toISOString()
            };
            this.saveProducts();
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id == id);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.saveProducts();
            return true;
        }
        return false;
    }

    getProduct(id) {
        return this.products.find(p => p.id == id);
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    searchProducts(query) {
        if (!query) return this.products;
        
        return this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    getLowStockProducts() {
        return this.products.filter(product => 
            product.totalStock <= product.lowStockThreshold
        );
    }

    updateStock(sku, quantity) {
        const product = this.products.find(p => 
            p.inventory?.some(item => item.sku === sku)
        );
        
        if (product && product.inventory) {
            const item = product.inventory.find(i => i.sku === sku);
            if (item) {
                item.stock = quantity;
                product.totalStock = product.inventory.reduce((sum, i) => sum + i.stock, 0);
                product.updatedAt = new Date().toISOString();
                this.saveProducts();
                return true;
            }
        }
        return false;
    }

    updateDashboardStats() {
        // Update dashboard statistics
        const totalProducts = this.products.length;
        const lowStockItems = this.getLowStockProducts().length;
        
        // Calculate total sales (mock data for now)
        const orders = JSON.parse(localStorage.getItem('acidicOrders')) || [];
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        
        // Update UI
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('low-stock').textContent = lowStockItems;
        document.getElementById('total-sales').textContent = `R${totalSales}`;
        
        // Update active promotions count
        const promotions = JSON.parse(localStorage.getItem('acidicPromotions')) || [];
        const activePromotions = promotions.filter(p => p.status === 'active').length;
        document.getElementById('active-promotions').textContent = activePromotions;
    }

    renderProductsTable(filter = '') {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        
        let productsToShow = this.products;
        if (filter) {
            productsToShow = this.searchProducts(filter);
        }
        
        if (productsToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-box-open" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                        <p>No products found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = productsToShow.map(product => {
            const status = product.totalStock <= 0 ? 'out-of-stock' : 
                          product.totalStock <= product.lowStockThreshold ? 'low-stock' : 'in-stock';
            const statusText = status === 'out-of-stock' ? 'Out of Stock' : 
                              status === 'low-stock' ? 'Low Stock' : 'In Stock';
            
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${product.images && product.images.length > 0 ? 
                                `<img src="${product.images[0]}" alt="${product.name}" 
                                      style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 
                                `<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 5px; 
                                      display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-tshirt" style="color: #ccc;"></i>
                                </div>`
                            }
                            <div>
                                <strong>${product.name}</strong><br>
                                <small style="color: #666;">SKU: ${product.id}</small>
                            </div>
                        </div>
                    </td>
                    <td>${this.formatCategory(product.category)}</td>
                    <td>R${product.price}</td>
                    <td>${product.totalStock || 0}</td>
                    <td>
                        <span class="status ${status}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Promotion Management
class PromotionManager {
    constructor() {
        this.promotions = JSON.parse(localStorage.getItem('acidicPromotions')) || [];
        this.loadPromotions();
    }

    loadPromotions() {
        if (this.promotions.length === 0) {
            this.loadSamplePromotions();
        }
    }

    loadSamplePromotions() {
        const samplePromotions = [
            {
                id: 1,
                name: 'Summer Sale',
                type: 'percentage',
                value: 20,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                target: 'all',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        
        this.promotions = samplePromotions;
        this.savePromotions();
    }

    savePromotions() {
        localStorage.setItem('acidicPromotions', JSON.stringify(this.promotions));
    }

    addPromotion(promotionData) {
        const newPromotion = {
            id: Date.now(),
            ...promotionData,
            status: this.getPromotionStatus(promotionData.startDate, promotionData.endDate),
            createdAt: new Date().toISOString()
        };
        
        this.promotions.push(newPromotion);
        this.savePromotions();
        return newPromotion;
    }

    getPromotionStatus(startDate, endDate) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'upcoming';
        if (now > end) return 'expired';
        return 'active';
    }

    updatePromotionStatuses() {
        this.promotions.forEach(promo => {
            promo.status = this.getPromotionStatus(promo.startDate, promo.endDate);
        });
        this.savePromotions();
    }

    renderPromotions() {
        const container = document.getElementById('promotions-list');
        if (!container) return;
        
        this.updatePromotionStatuses();
        
        if (this.promotions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 10px;">
                    <i class="fas fa-percentage" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                    <p>No promotions found</p>
                    <button class="btn-primary" onclick="showAddPromotionModal()" 
                            style="margin-top: 20px;">
                        Create Your First Promotion
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.promotions.map(promo => {
            const badgeClass = `promotion-badge ${promo.status}`;
            const badgeText = promo.status.charAt(0).toUpperCase() + promo.status.slice(1);
            
            let valueText = '';
            if (promo.type === 'percentage') {
                valueText = `${promo.value}% OFF`;
            } else if (promo.type === 'fixed') {
                valueText = `R${promo.value} OFF`;
            } else if (promo.type === 'bogo') {
                valueText = 'Buy One Get One';
            } else if (promo.type === 'free_shipping') {
                valueText = 'Free Shipping';
            }
            
            const startDate = new Date(promo.startDate).toLocaleDateString();
            const endDate = new Date(promo.endDate).toLocaleDateString();
            
            return `
                <div class="promotion-card">
                    <div class="promotion-header">
                        <div>
                            <h3 style="margin: 0;">${promo.name}</h3>
                            <p style="margin: 5px 0 0 0; color: #666;">
                                ${startDate} - ${endDate}
                            </p>
                        </div>
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 24px; font-weight: bold; color: #000; margin: 10px 0;">
                                ${valueText}
                            </p>
                            <p style="color: #666; margin: 5px 0;">
                                Applies to: ${promo.target === 'all' ? 'All Products' : 
                                            promo.target === 'category' ? 'Specific Category' : 
                                            'Specific Products'}
                            </p>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="editPromotion(${promo.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deletePromotion(${promo.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize Managers
const productManager = new ProductManager();
const promotionManager = new PromotionManager();

// NEW: Inventory Manager
class InventoryManager {
    constructor() {
        this.lowStockThreshold = 5;
    }

    getInventorySummary() {
        const products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        
        const summary = {
            totalProducts: products.length,
            totalValue: 0,
            totalStock: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            byCategory: {},
            recentMovements: []
        };

        products.forEach(product => {
            // Calculate product value
            const productValue = (product.price || 0) * (product.totalStock || 0);
            summary.totalValue += productValue;
            summary.totalStock += product.totalStock || 0;

            // Track stock status
            if (product.totalStock === 0) {
                summary.outOfStockItems++;
            } else if (product.totalStock <= (product.lowStockThreshold || this.lowStockThreshold)) {
                summary.lowStockItems++;
            }

            // Group by category
            if (!summary.byCategory[product.category]) {
                summary.byCategory[product.category] = {
                    count: 0,
                    stock: 0,
                    value: 0
                };
            }
            summary.byCategory[product.category].count++;
            summary.byCategory[product.category].stock += product.totalStock || 0;
            summary.byCategory[product.category].value += productValue;
        });

        return summary;
    }

    getLowStockProducts() {
        const products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        return products.filter(product => 
            product.totalStock > 0 && 
            product.totalStock <= (product.lowStockThreshold || this.lowStockThreshold)
        );
    }

    getOutOfStockProducts() {
        const products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        return products.filter(product => product.totalStock === 0);
    }

    updateStock(productId, variantSku, newStock) {
        const products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        const productIndex = products.findIndex(p => p.id == productId);
        
        if (productIndex !== -1) {
            if (variantSku && products[productIndex].inventory) {
                // Update specific variant
                const variantIndex = products[productIndex].inventory.findIndex(v => v.sku === variantSku);
                if (variantIndex !== -1) {
                    products[productIndex].inventory[variantIndex].stock = parseInt(newStock);
                    
                    // Recalculate total stock
                    products[productIndex].totalStock = products[productIndex].inventory.reduce(
                        (sum, variant) => sum + (variant.stock || 0), 0
                    );
                }
            } else {
                // Update overall stock
                products[productIndex].totalStock = parseInt(newStock);
            }
            
            localStorage.setItem('acidicProducts', JSON.stringify(products));
            return true;
        }
        return false;
    }
}

// NEW: Order Manager
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('acidicOrders')) || [];
        this.loadSampleOrders();
    }

    loadSampleOrders() {
        if (this.orders.length === 0) {
            const sampleOrders = [
                {
                    id: 'ORD-' + Date.now().toString().slice(-8),
                    customerName: 'John Doe',
                    email: 'john@example.com',
                    phone: '+27123456789',
                    address: '123 Main St, Johannesburg',
                    total: 898,
                    items: [
                        { name: 'ACIDIC Logo T-Shirt', price: 299, quantity: 2, size: 'M', color: 'Black' },
                        { name: 'ACIDIC Hoodie', price: 599, quantity: 1, size: 'L', color: 'Grey' }
                    ],
                    status: 'processing',
                    date: new Date().toISOString(),
                    trackingNumber: 'TRK' + Date.now().toString().slice(-10)
                },
                {
                    id: 'ORD-' + (Date.now() - 86400000).toString().slice(-8),
                    customerName: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '+27876543210',
                    address: '456 Oak Ave, Cape Town',
                    total: 599,
                    items: [
                        { name: 'ACIDIC Sweater', price: 599, quantity: 1, size: 'S', color: 'White' }
                    ],
                    status: 'shipped',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    trackingNumber: 'TRK' + (Date.now() - 86400000).toString().slice(-10)
                }
            ];
            this.orders = sampleOrders;
            this.saveOrders();
        }
    }

    saveOrders() {
        localStorage.setItem('acidicOrders', JSON.stringify(this.orders));
    }

    getOrders(filter = 'all', searchTerm = '') {
        let filteredOrders = [...this.orders];
        
        // Apply status filter
        if (filter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === filter);
        }
        
        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(term) ||
                order.customerName.toLowerCase().includes(term) ||
                order.email.toLowerCase().includes(term)
            );
        }
        
        return filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    updateOrderStatus(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            this.orders[orderIndex].updatedAt = new Date().toISOString();
            this.saveOrders();
            return true;
        }
        return false;
    }

    getOrderStats() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        
        const statusCounts = {
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };
        
        this.orders.forEach(order => {
            if (statusCounts[order.status] !== undefined) {
                statusCounts[order.status]++;
            }
        });
        
        return {
            totalOrders,
            totalRevenue,
            statusCounts,
            averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
        };
    }
}

// NEW: Category Manager
class CategoryManager {
    constructor() {
        this.categories = [
            { id: 'tshirts', name: 'T-Shirts', description: 'Caswear t-shirts', productCount: 0 },
            { id: 'sweaters', name: 'Sweaters', description: 'Winter sweaters', productCount: 0 },
            { id: 'hoodies', name: 'Hoodies', description: 'Streetwear hoodies', productCount: 0 },
            { id: 'pants', name: 'Pants', description: 'Casual and formal pants', productCount: 0 },
            { id: 'twopieces', name: 'Two Pieces', description: 'Matching sets', productCount: 0 },
            { id: 'accessories', name: 'Accessories', description: 'Fashion accessories', productCount: 0 }
        ];
        this.updateCategoryCounts();
    }

    updateCategoryCounts() {
        const products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
        
        // Reset counts
        this.categories.forEach(cat => cat.productCount = 0);
        
        // Count products in each category
        products.forEach(product => {
            const category = this.categories.find(cat => cat.id === product.category);
            if (category) {
                category.productCount++;
            }
        });
    }

    getCategories() {
        this.updateCategoryCounts();
        return this.categories;
    }

    updateCategory(categoryId, updates) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
            this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates };
            return true;
        }
        return false;
    }
}

// NEW: Analytics Manager
class AnalyticsManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('acidicOrders')) || [];
        this.products = JSON.parse(localStorage.getItem('acidicProducts')) || [];
    }

    getSalesData(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const dailySales = {};
        const categorySales = {};
        let totalSales = 0;
        let totalOrders = 0;
        
        // Initialize date range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dailySales[dateStr] = { sales: 0, orders: 0 };
        }
        
        // Process orders
        this.orders.forEach(order => {
            const orderDate = new Date(order.date);
            if (orderDate >= startDate && orderDate <= endDate) {
                const dateStr = orderDate.toISOString().split('T')[0];
                dailySales[dateStr].sales += order.total;
                dailySales[dateStr].orders += 1;
                totalSales += order.total;
                totalOrders += 1;
                
                // Track category sales
                order.items.forEach(item => {
                    const product = this.products.find(p => p.name === item.name);
                    if (product) {
                        if (!categorySales[product.category]) {
                            categorySales[product.category] = 0;
                        }
                        categorySales[product.category] += item.price * item.quantity;
                    }
                });
            }
        });
        
        return {
            dailySales: Object.entries(dailySales).map(([date, data]) => ({
                date,
                sales: data.sales,
                orders: data.orders
            })),
            categorySales,
            totalSales,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0
        };
    }

    getTopProducts(limit = 5) {
        const productSales = {};
        
        this.orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = {
                        name: item.name,
                        revenue: 0,
                        quantity: 0
                    };
                }
                productSales[item.name].revenue += item.price * item.quantity;
                productSales[item.name].quantity += item.quantity;
            });
        });
        
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    getCustomerMetrics() {
        const customers = {};
        let repeatCustomers = 0;
        
        this.orders.forEach(order => {
            if (!customers[order.email]) {
                customers[order.email] = {
                    email: order.email,
                    name: order.customerName,
                    orders: 0,
                    totalSpent: 0
                };
            }
            customers[order.email].orders += 1;
            customers[order.email].totalSpent += order.total;
        });
        
        // Count repeat customers
        Object.values(customers).forEach(customer => {
            if (customer.orders > 1) repeatCustomers++;
        });
        
        return {
            totalCustomers: Object.keys(customers).length,
            repeatCustomers,
            repeatRate: Object.keys(customers).length > 0 ? 
                (repeatCustomers / Object.keys(customers).length * 100).toFixed(1) : 0,
            topCustomers: Object.values(customers)
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
        };
    }
}

// Initialize Managers
const inventoryManager = new InventoryManager();
const orderManager = new OrderManager();
const categoryManager = new CategoryManager();
const analyticsManager = new AnalyticsManager();

// ===== COMPLETE SECTION RENDERING FUNCTIONS =====

// Show/Hide Sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).style.display = 'block';
    
    // Update active menu item
    document.querySelectorAll('.admin-sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding menu item
    const menuItems = document.querySelectorAll('.admin-sidebar li');
    for (let item of menuItems) {
        const itemText = item.textContent.toLowerCase().replace(/\s+/g, '');
        if (itemText.includes(sectionId.toLowerCase().replace('-', ''))) {
            item.classList.add('active');
            break;
        }
    }
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            productManager.renderProductsTable();
            break;
        case 'add-product':
            // Already has form
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'promotions':
            promotionManager.renderPromotions();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'bulk-upload':
            // Already has upload area
            break;
    }
}

// ===== INVENTORY SECTION =====
function loadInventory() {
    const inventorySection = document.getElementById('inventory-section');
    
    if (!inventorySection) return;
    
    const summary = inventoryManager.getInventorySummary();
    const lowStockProducts = inventoryManager.getLowStockProducts();
    const outOfStockProducts = inventoryManager.getOutOfStockProducts();
    
    inventorySection.innerHTML = `
        <h2>Inventory Management</h2>
        
        <!-- Inventory Summary Cards -->
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Stock Value</h3>
                <div class="value">R${summary.totalValue.toFixed(2)}</div>
                <div class="trend">Inventory worth</div>
            </div>
            
            <div class="stat-card">
                <h3>Total Items in Stock</h3>
                <div class="value">${summary.totalStock}</div>
                <div class="trend">Across all products</div>
            </div>
            
            <div class="stat-card">
                <h3>Low Stock Items</h3>
                <div class="value" style="color: #ff9800;">${summary.lowStockItems}</div>
                <div class="trend down">Needs restocking</div>
            </div>
            
            <div class="stat-card">
                <h3>Out of Stock</h3>
                <div class="value" style="color: #ff4444;">${summary.outOfStockItems}</div>
                <div class="trend down">Urgent attention</div>
            </div>
        </div>
        
        <!-- Category Breakdown -->
        <div class="product-table" style="margin-top: 30px;">
            <div class="table-header">
                <h3>Inventory by Category</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Stock Count</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(summary.byCategory).map(([category, data]) => `
                        <tr>
                            <td>${categoryManager.categories.find(c => c.id === category)?.name || category}</td>
                            <td>${data.count}</td>
                            <td>${data.stock}</td>
                            <td>R${data.value.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Low Stock Alert -->
        ${lowStockProducts.length > 0 ? `
            <div class="product-table" style="margin-top: 30px; border-left: 4px solid #ff9800;">
                <div class="table-header">
                    <h3><i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> Low Stock Items (${lowStockProducts.length})</h3>
                    <button class="btn-primary" onclick="restockAllLowStock()">
                        <i class="fas fa-boxes"></i> Restock All
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Stock</th>
                            <th>Threshold</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lowStockProducts.map(product => `
                            <tr>
                                <td>
                                    <strong>${product.name}</strong><br>
                                    <small>${productManager.formatCategory(product.category)}</small>
                                </td>
                                <td>${product.totalStock}</td>
                                <td>${product.lowStockThreshold || inventoryManager.lowStockThreshold}</td>
                                <td>
                                    <span class="status low-stock">Low Stock</span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="restockProduct(${product.id})">
                                            <i class="fas fa-box"></i> Restock
                                        </button>
                                        <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
        
        <!-- Out of Stock Alert -->
        ${outOfStockProducts.length > 0 ? `
            <div class="product-table" style="margin-top: 30px; border-left: 4px solid #ff4444;">
                <div class="table-header">
                    <h3><i class="fas fa-times-circle" style="color: #ff4444;"></i> Out of Stock Items (${outOfStockProducts.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Last Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${outOfStockProducts.map(product => `
                            <tr>
                                <td>
                                    <strong>${product.name}</strong><br>
                                    <small>${productManager.formatCategory(product.category)}</small>
                                </td>
                                <td>0</td>
                                <td>
                                    <span class="status out-of-stock">Out of Stock</span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="restockProduct(${product.id})">
                                            <i class="fas fa-box"></i> Restock
                                        </button>
                                        <button class="action-btn delete-btn" onclick="toggleProductStatus(${product.id})">
                                            <i class="fas fa-eye-slash"></i> Hide
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
        
        <!-- Stock Adjustment Form -->
        <div class="admin-form" style="margin-top: 30px;">
            <h3>Manual Stock Adjustment</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="adjust-product">Select Product</label>
                    <select id="adjust-product" onchange="loadProductVariants(this.value)">
                        <option value="">Choose product...</option>
                        ${productManager.products.map(product => `
                            <option value="${product.id}">${product.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="adjust-variant">Select Variant (Optional)</label>
                    <select id="adjust-variant">
                        <option value="">All variants</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="adjust-quantity">New Quantity</label>
                    <input type="number" id="adjust-quantity" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="adjust-reason">Reason for Adjustment</label>
                    <select id="adjust-reason">
                        <option value="restock">Restock</option>
                        <option value="damaged">Damaged Items</option>
                        <option value="return">Customer Return</option>
                        <option value="theft">Theft/Loss</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn-primary" onclick="updateStock()">
                    <i class="fas fa-save"></i> Update Stock
                </button>
            </div>
        </div>
    `;
}

// ===== CATEGORIES SECTION =====
function loadCategories() {
    const categoriesSection = document.getElementById('categories-section');
    
    if (!categoriesSection) return;
    
    const categories = categoryManager.getCategories();
    
    categoriesSection.innerHTML = `
        <div class="table-header">
            <h2>Category Management</h2>
            <button class="btn-primary" onclick="showAddCategoryModal()">
                <i class="fas fa-plus"></i> Add Category
            </button>
        </div>
        
        <div class="dashboard-stats">
            ${categories.map(category => `
                <div class="stat-card" style="cursor: pointer;" onclick="editCategory('${category.id}')">
                    <h3>${category.name}</h3>
                    <div class="value">${category.productCount}</div>
                    <div class="trend">products</div>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">${category.description}</p>
                </div>
            `).join('')}
        </div>
        
        <!-- Category Products Table -->
        <div class="product-table" style="margin-top: 30px;">
            <div class="table-header">
                <h3>Products by Category</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Total Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(category => {
                        const products = productManager.getProductsByCategory(category.id);
                        const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
                        
                        return `
                            <tr>
                                <td>
                                    <strong>${category.name}</strong><br>
                                    <small>${category.description}</small>
                                </td>
                                <td>${category.productCount}</td>
                                <td>${totalStock}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="editCategory('${category.id}')">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="action-btn delete-btn" onclick="deleteCategory('${category.id}')" 
                                                ${category.productCount > 0 ? 'disabled' : ''}>
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== ORDERS SECTION =====
function loadOrders(filter = 'all', searchTerm = '') {
    const ordersSection = document.getElementById('orders-section');
    
    if (!ordersSection) return;
    
    const orders = orderManager.getOrders(filter, searchTerm);
    const stats = orderManager.getOrderStats();
    
    ordersSection.innerHTML = `
        <div class="table-header">
            <h2>Order Management</h2>
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="order-search" placeholder="Search orders..." 
                       value="${searchTerm}" onkeyup="searchOrders(this.value)">
            </div>
        </div>
        
        <!-- Order Stats -->
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="value">${stats.totalOrders}</div>
                <div class="trend">All time</div>
            </div>
            
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="value">R${stats.totalRevenue}</div>
                <div class="trend up">+12% from last month</div>
            </div>
            
            <div class="stat-card">
                <h3>Average Order</h3>
                <div class="value">R${stats.averageOrderValue}</div>
                <div class="trend">Per order</div>
            </div>
            
            <div class="stat-card">
                <h3>Processing</h3>
                <div class="value" style="color: #ff9800;">${stats.statusCounts.processing}</div>
                <div class="trend">Orders to fulfill</div>
            </div>
        </div>
        
        <!-- Order Filters -->
        <div style="margin: 20px 0; display: flex; gap: 10px;">
            <button class="${filter === 'all' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="loadOrders('all', '${searchTerm}')">All Orders</button>
            <button class="${filter === 'processing' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="loadOrders('processing', '${searchTerm}')">Processing (${stats.statusCounts.processing})</button>
            <button class="${filter === 'shipped' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="loadOrders('shipped', '${searchTerm}')">Shipped (${stats.statusCounts.shipped})</button>
            <button class="${filter === 'delivered' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="loadOrders('delivered', '${searchTerm}')">Delivered (${stats.statusCounts.delivered || 0})</button>
        </div>
        
        <!-- Orders Table -->
        <div class="product-table">
            ${orders.length === 0 ? `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 48px; color: #ddd;"></i>
                    <p style="margin-top: 10px;">No orders found</p>
                </div>
            ` : `
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>
                                    <strong>${order.id}</strong><br>
                                    <small>${order.trackingNumber || 'No tracking'}</small>
                                </td>
                                <td>
                                    <strong>${order.customerName}</strong><br>
                                    <small>${order.email}</small>
                                </td>
                                <td>${new Date(order.date).toLocaleDateString()}</td>
                                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                                <td>R${order.total}</td>
                                <td>
                                    <select class="status-select" data-order="${order.id}" 
                                            onchange="updateOrderStatus('${order.id}', this.value)"
                                            style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="viewOrderDetails('${order.id}')">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button class="action-btn edit-btn" onclick="printOrder('${order.id}')">
                                            <i class="fas fa-print"></i> Print
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

// ===== ANALYTICS SECTION =====
function loadAnalytics() {
    const analyticsSection = document.getElementById('analytics-section');
    
    if (!analyticsSection) return;
    
    const salesData = analyticsManager.getSalesData(30);
    const topProducts = analyticsManager.getTopProducts(5);
    const customerMetrics = analyticsManager.getCustomerMetrics();
    
    analyticsSection.innerHTML = `
        <h2>Sales Analytics</h2>
        
        <!-- Analytics Summary -->
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>30-Day Revenue</h3>
                <div class="value">R${salesData.totalSales}</div>
                <div class="trend up">+18% from last month</div>
            </div>
            
            <div class="stat-card">
                <h3>30-Day Orders</h3>
                <div class="value">${salesData.totalOrders}</div>
                <div class="trend up">+15% from last month</div>
            </div>
            
            <div class="stat-card">
                <h3>Avg. Order Value</h3>
                <div class="value">R${salesData.averageOrderValue}</div>
                <div class="trend up">+8% from last month</div>
            </div>
            
            <div class="stat-card">
                <h3>Repeat Customers</h3>
                <div class="value">${customerMetrics.repeatCustomers}</div>
                <div class="trend">${customerMetrics.repeatRate}% repeat rate</div>
            </div>
        </div>
        
        <!-- Sales Chart Placeholder -->
        <div class="admin-form" style="margin-top: 30px;">
            <h3>Sales Trend (Last 30 Days)</h3>
            <div style="height: 300px; background: #f9f9f9; border-radius: 8px; padding: 20px; margin-top: 15px;">
                <canvas id="salesChart"></canvas>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px;">
            <!-- Top Products -->
            <div class="product-table">
                <div class="table-header">
                    <h3>Top Selling Products</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Revenue</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProducts.map(product => `
                            <tr>
                                <td>
                                    <strong>${product.name}</strong>
                                </td>
                                <td>R${product.revenue}</td>
                                <td>${product.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Sales by Category -->
            <div class="product-table">
                <div class="table-header">
                    <h3>Sales by Category</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Revenue</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(salesData.categorySales).map(([category, revenue]) => {
                            const percentage = ((revenue / salesData.totalSales) * 100).toFixed(1);
                            return `
                                <tr>
                                    <td>${categoryManager.categories.find(c => c.id === category)?.name || category}</td>
                                    <td>R${revenue}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Customer Analytics -->
        <div class="admin-form" style="margin-top: 30px;">
            <h3>Customer Insights</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                <div>
                    <h4>Top Customers by Spending</h4>
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customerMetrics.topCustomers.map(customer => `
                                <tr>
                                    <td>${customer.name}</td>
                                    <td>${customer.orders}</td>
                                    <td>R${customer.totalSpent}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h4>Customer Metrics</h4>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                        <p><strong>Total Customers:</strong> ${customerMetrics.totalCustomers}</p>
                        <p><strong>Repeat Customers:</strong> ${customerMetrics.repeatCustomers}</p>
                        <p><strong>Repeat Rate:</strong> ${customerMetrics.repeatRate}%</p>
                        <p><strong>Avg. Orders per Customer:</strong> ${customerMetrics.totalCustomers > 0 ? 
                            (salesData.totalOrders / customerMetrics.totalCustomers).toFixed(1) : 0}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Date Range Selector -->
        <div class="admin-form" style="margin-top: 30px;">
            <h3>Custom Date Range</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="start-date-range">Start Date</label>
                    <input type="date" id="start-date-range" value="${new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="end-date-range">End Date</label>
                    <input type="date" id="end-date-range" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <button class="btn-primary" onclick="loadCustomAnalytics()">
                <i class="fas fa-chart-line"></i> Generate Report
            </button>
        </div>
    `;
    
    // Initialize chart
    setTimeout(() => {
        initializeSalesChart(salesData.dailySales);
    }, 100);
}

// ===== SETTINGS SECTION =====
function loadSettings() {
    const settingsSection = document.getElementById('settings-section');
    const session = adminAuth?.getSession?.() || { username: 'admin', role: 'administrator' };
    
    settingsSection.innerHTML = `
        <h2>Admin Settings</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
            <!-- Account Settings -->
            <div class="admin-form">
                <h3><i class="fas fa-user-cog"></i> Account Settings</h3>
                
                <div class="form-group">
                    <label for="admin-username-display">Username</label>
                    <input type="text" id="admin-username-display" value="${session.username}" disabled>
                </div>
                
                <div class="form-group">
                    <label for="admin-role-display">Role</label>
                    <input type="text" id="admin-role-display" value="${session.role}" disabled>
                </div>
                
                <div class="form-group">
                    <label for="session-time">Session Expires In</label>
                    <input type="text" id="session-time" value="30 minutes" disabled>
                </div>
                
                <button class="btn-primary" onclick="changeAdminPassword()">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
            
            <!-- Store Settings -->
            <div class="admin-form">
                <h3><i class="fas fa-store"></i> Store Settings</h3>
                
                <div class="form-group">
                    <label for="store-name">Store Name</label>
                    <input type="text" id="store-name" value="ACIDIC Clothing">
                </div>
                
                <div class="form-group">
                    <label for="store-currency">Currency</label>
                    <select id="store-currency">
                        <option value="ZAR" selected>South African Rand (R)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="tax-rate">Tax Rate (%)</label>
                    <input type="number" id="tax-rate" value="15" step="0.1">
                </div>
                
                <div class="form-group">
                    <label for="shipping-fee">Default Shipping Fee (R)</label>
                    <input type="number" id="shipping-fee" value="150">
                </div>
                
                <button class="btn-primary" onclick="saveStoreSettings()">
                    <i class="fas fa-save"></i> Save Store Settings
                </button>
            </div>
        </div>
        
        <!-- Inventory Settings -->
        <div class="admin-form" style="margin-top: 30px;">
            <h3><i class="fas fa-boxes"></i> Inventory Settings</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="low-stock-threshold-global">Low Stock Threshold</label>
                    <input type="number" id="low-stock-threshold-global" value="${inventoryManager.lowStockThreshold}">
                    <small>Alert when stock falls below this number</small>
                </div>
                
                <div class="form-group">
                    <label for="auto-restock-level">Auto Restock Level</label>
                    <input type="number" id="auto-restock-level" value="20">
                    <small>Suggested restock quantity</small>
                </div>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enable-low-stock-emails" checked>
                    Send email alerts for low stock
                </label>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enable-out-of-stock-hiding" checked>
                    Hide products when out of stock
                </label>
            </div>
            
            <button class="btn-primary" onclick="saveInventorySettings()">
                <i class="fas fa-save"></i> Save Inventory Settings
            </button>
        </div>
        
        <!-- System Information -->
        <div class="admin-form" style="margin-top: 30px; background: #f9f9f9;">
            <h3><i class="fas fa-info-circle"></i> System Information</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Total Products</label>
                    <input type="text" value="${productManager.products.length}" disabled>
                </div>
                
                <div class="form-group">
                    <label>Total Orders</label>
                    <input type="text" value="${orderManager.orders.length}" disabled>
                </div>
                
                <div class="form-group">
                    <label>Storage Used</label>
                    <input type="text" value="${Math.round(JSON.stringify(localStorage).length / 1024)}KB" disabled>
                </div>
            </div>
            
            <div class="form-group">
                <label>Last Backup</label>
                <input type="text" value="${new Date().toLocaleDateString()}" disabled>
            </div>
            
            <div class="form-actions">
                <button class="btn-primary" onclick="backupData()">
                    <i class="fas fa-database"></i> Backup Data
                </button>
                <button class="btn-secondary" onclick="clearCache()">
                    <i class="fas fa-broom"></i> Clear Cache
                </button>
                <button class="btn-secondary" style="background: #ff4444; color: white;" onclick="resetSystem()">
                    <i class="fas fa-redo"></i> Reset System
                </button>
            </div>
        </div>
    `;
}

// ===== HELPER FUNCTIONS =====

// Inventory Functions
function loadProductVariants(productId) {
    const product = productManager.products.find(p => p.id == productId);
    const variantSelect = document.getElementById('adjust-variant');
    
    variantSelect.innerHTML = '<option value="">All variants</option>';
    
    if (product && product.inventory) {
        product.inventory.forEach(variant => {
            const option = document.createElement('option');
            option.value = variant.sku;
            option.textContent = `${variant.color || ''} ${variant.size || ''} (${variant.sku})`;
            variantSelect.appendChild(option);
        });
    }
}

function updateStock() {
    const productId = document.getElementById('adjust-product').value;
    const variantSku = document.getElementById('adjust-variant').value;
    const newQuantity = document.getElementById('adjust-quantity').value;
    const reason = document.getElementById('adjust-reason').value;
    
    if (!productId || newQuantity === '') {
        alert('Please select a product and enter quantity');
        return;
    }
    
    if (inventoryManager.updateStock(productId, variantSku, newQuantity)) {
        alert('Stock updated successfully!');
        loadInventory();
        productManager.renderProductsTable();
    } else {
        alert('Error updating stock');
    }
}

function restockProduct(productId) {
    const newStock = prompt('Enter new stock quantity:', '50');
    if (newStock !== null && !isNaN(newStock)) {
        if (inventoryManager.updateStock(productId, null, newStock)) {
            alert('Product restocked successfully!');
            loadInventory();
        }
    }
}

function restockAllLowStock() {
    const lowStockProducts = inventoryManager.getLowStockProducts();
    const restockAmount = parseInt(prompt('Enter restock quantity for all low stock items:', '20'));
    
    if (!isNaN(restockAmount)) {
        let successCount = 0;
        lowStockProducts.forEach(product => {
            const newStock = product.totalStock + restockAmount;
            if (inventoryManager.updateStock(product.id, null, newStock)) {
                successCount++;
            }
        });
        
        alert(`Restocked ${successCount} products`);
        loadInventory();
    }
}

// Order Functions
function searchOrders(searchTerm) {
    const currentFilter = document.querySelector('.btn-primary')?.textContent?.toLowerCase() || 'all';
    const filter = currentFilter.includes('processing') ? 'processing' :
                   currentFilter.includes('shipped') ? 'shipped' :
                   currentFilter.includes('delivered') ? 'delivered' : 'all';
    
    loadOrders(filter, searchTerm);
}

function updateOrderStatus(orderId, newStatus) {
    if (orderManager.updateOrderStatus(orderId, newStatus)) {
        alert('Order status updated!');
        loadOrders();
    } else {
        alert('Error updating order status');
    }
}

function viewOrderDetails(orderId) {
    const order = orderManager.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalHTML = `
        <div class="modal active" onclick="closeModal()">
            <div class="modal-content" style="max-width: 700px;" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Order Details: ${order.id}</h3>
                    <span class="close-modal" onclick="closeModal()">×</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div>
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                        <p><strong>Address:</strong> ${order.address}</p>
                    </div>
                    
                    <div>
                        <h4>Order Information</h4>
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                        <p><strong>Tracking:</strong> ${order.trackingNumber || 'Not assigned'}</p>
                        <p><strong>Total:</strong> R${order.total}</p>
                    </div>
                </div>
                
                <h4>Order Items</h4>
                <table style="width: 100%; margin: 15px 0;">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name} ${item.size ? `(${item.size})` : ''} ${item.color ? `- ${item.color}` : ''}</td>
                                <td>R${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>R${item.price * item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="form-actions">
                    <button class="btn-primary" onclick="printOrder('${order.id}')">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
}

function printOrder(orderId) {
    alert(`Printing order ${orderId}...\n(In a real system, this would generate a printable invoice)`);
}

// Analytics Functions
function initializeSalesChart(dailySales) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // If Chart.js is available
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailySales.map(d => new Date(d.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Daily Sales (R)',
                    data: dailySales.map(d => d.sales),
                    borderColor: '#f4b400',
                    backgroundColor: 'rgba(244, 180, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } else {
        // Simple HTML chart fallback
        const maxSales = Math.max(...dailySales.map(d => d.sales));
        ctx.innerHTML = `
            <div style="display: flex; align-items: flex-end; height: 100%; gap: 5px;">
                ${dailySales.map(d => `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div style="background: #f4b400; width: 100%; 
                                    height: ${(d.sales / maxSales) * 100}%; 
                                    border-radius: 3px;"></div>
                        <small style="margin-top: 5px; font-size: 10px;">
                            ${new Date(d.date).getDate()}/${new Date(d.date).getMonth() + 1}
                        </small>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function loadCustomAnalytics() {
    alert('Custom analytics feature coming soon!');
}

// Settings Functions
function saveStoreSettings() {
    const settings = {
        storeName: document.getElementById('store-name').value,
        currency: document.getElementById('store-currency').value,
        taxRate: parseFloat(document.getElementById('tax-rate').value),
        shippingFee: parseFloat(document.getElementById('shipping-fee').value)
    };
    
    localStorage.setItem('acidic_store_settings', JSON.stringify(settings));
    alert('Store settings saved!');
}

function saveInventorySettings() {
    inventoryManager.lowStockThreshold = parseInt(document.getElementById('low-stock-threshold-global').value);
    alert('Inventory settings saved!');
}

function backupData() {
    const data = {
        products: localStorage.getItem('acidicProducts'),
        orders: localStorage.getItem('acidicOrders'),
        promotions: localStorage.getItem('acidicPromotions'),
        settings: localStorage.getItem('acidic_store_settings'),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acidic_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    alert('Backup downloaded successfully!');
}

function clearCache() {
    if (confirm('Clear cache? This will not delete your data.')) {
        // In a real app, you'd clear cache
        alert('Cache cleared!');
    }
}

function resetSystem() {
    if (confirm('WARNING: This will reset all data except admin credentials. Are you sure?')) {
        localStorage.removeItem('acidicProducts');
        localStorage.removeItem('acidicOrders');
        localStorage.removeItem('acidicPromotions');
        localStorage.removeItem('acidic_store_settings');
        
        // Reload managers
        productManager.loadProducts();
        orderManager.loadSampleOrders();
        promotionManager.loadPromotions();
        
        alert('System reset complete!');
        loadDashboard();
    }
}

// Modal Functions
function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (if using auth system)
    if (typeof adminAuth !== 'undefined' && adminAuth.getSession()) {
        loadDashboard();
    } else {
        // For demo purposes, load dashboard anyway
        loadDashboard();
    }
});

// ===== UI FUNCTIONS =====

// Show/Hide Sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).style.display = 'block';
    
    // Update active menu item
    document.querySelectorAll('.admin-sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding menu item
    const menuItems = document.querySelectorAll('.admin-sidebar li');
    for (let item of menuItems) {
        if (item.textContent.toLowerCase().includes(sectionId.toLowerCase())) {
            item.classList.add('active');
            break;
        }
    }
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            productManager.renderProductsTable();
            break;
        case 'promotions':
            promotionManager.renderPromotions();
            break;
    }
}

// Dashboard
function loadDashboard() {
    productManager.updateDashboardStats();
    loadRecentOrders();
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('acidicOrders')) || [];
    const recentOrders = orders.slice(-5).reverse(); // Last 5 orders
    
    const container = document.getElementById('recent-orders');
    
    if (recentOrders.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; padding: 40px; color: #666;">
                No recent orders
            </p>
        `;
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => `
                    <tr>
                        <td>${order.id || 'N/A'}</td>
                        <td>${order.customerName || 'Guest'}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>R${order.total || 0}</td>
                        <td>
                            <span class="status ${order.status === 'processing' ? 'low-stock' : 'in-stock'}">
                                ${order.status || 'Processing'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Product Form Handling
let uploadedImages = [];

function triggerImageUpload() {
    document.getElementById('image-upload').click();
}

function handleImageUpload(files) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.push(e.target.result);
            
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                display: inline-block;
                margin: 5px;
                position: relative;
            `;
            
            imgContainer.innerHTML = `
                <img src="${e.target.result}" 
                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
                <button onclick="removeImage(this)" 
                        style="position: absolute; top: 5px; right: 5px; background: #ff4444; 
                               color: white; border: none; border-radius: 50%; width: 20px; 
                               height: 20px; cursor: pointer; font-size: 12px;">×</button>
            `;
            
            preview.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(button) {
    const container = button.parentElement;
    const img = container.querySelector('img');
    const src = img.src;
    
    uploadedImages = uploadedImages.filter(image => image !== src);
    container.remove();
}

// Variant Management
function addVariant() {
    const container = document.getElementById('variant-container');
    const variantItem = document.createElement('div');
    variantItem.className = 'variant-item';
    variantItem.innerHTML = `
        <input type="text" placeholder="Variant Name (e.g., Size, Color)" class="variant-name">
        <input type="text" placeholder="Options (comma-separated)" class="variant-options">
        <button type="button" class="action-btn delete-btn" onclick="removeVariant(this)">Remove</button>
    `;
    container.appendChild(variantItem);
}

function removeVariant(button) {
    const container = document.getElementById('variant-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('At least one variant is required');
    }
}

// Add Product Form Submission
document.getElementById('add-product-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect variant data
    const variants = [];
    document.querySelectorAll('.variant-item').forEach(item => {
        const name = item.querySelector('.variant-name').value;
        const options = item.querySelector('.variant-options').value
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt !== '');
        
        if (name && options.length > 0) {
            variants.push({ name, options });
        }
    });
    
    // Create product object
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        comparePrice: document.getElementById('product-compare-price').value || null,
        description: document.getElementById('product-description').value,
        images: uploadedImages,
        variants: variants,
        sku: document.getElementById('product-sku').value || `ACID-${Date.now()}`,
        initialStock: parseInt(document.getElementById('initial-stock').value),
        lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value),
        totalStock: parseInt(document.getElementById('initial-stock').value)
    };
    
    // Add product
    productManager.addProduct(productData);
    
    // Reset form
    clearProductForm();
    
    // Show success message
    alert('Product added successfully!');
    
    // Switch to products view
    showSection('products');
});

function clearProductForm() {
    document.getElementById('add-product-form').reset();
    document.getElementById('image-preview').innerHTML = '';
    uploadedImages = [];
    
    // Reset variants to single default
    const container = document.getElementById('variant-container');
    container.innerHTML = `
        <div class="variant-item">
            <input type="text" placeholder="Variant Name (e.g., Color)" 
                   class="variant-name" value="Color">
            <input type="text" placeholder="Options (comma-separated, e.g., Black, White, Red)" 
                   class="variant-options" value="Black,White,Red">
            <button type="button" class="action-btn delete-btn" 
                    onclick="removeVariant(this)">Remove</button>
        </div>
    `;
}

// Bulk Upload
function downloadTemplate() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Category,Price,Compare Price,Description,SKU,Initial Stock,Low Stock Threshold\n" +
        "ACIDIC Logo T-Shirt,tshirts,299,399,Premium cotton t-shirt,ACID-TSH-001,50,10\n" +
        "ACIDIC Hoodie,hoodies,599,799,Warm winter hoodie,ACID-HOD-001,30,5";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "acidic_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function triggerCsvUpload() {
    document.getElementById('csv-upload').click();
}

function handleCsvUpload(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        const preview = document.getElementById('upload-preview');
        
        // Parse CSV
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).filter(line => line.trim() !== '');
        
        preview.innerHTML = `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
                <h4>Upload Preview (${data.length} products)</h4>
                <table style="width: 100%; margin-top: 10px; font-size: 12px;">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, 5).map(line => {
                            const cells = line.split(',');
                            return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
                        }).join('')}
                    </tbody>
                </table>
                ${data.length > 5 ? `<p style="margin-top: 10px;">... and ${data.length - 5} more products</p>` : ''}
            </div>
        `;
        
        // Enable process button
        document.getElementById('process-upload-btn').disabled = false;
        
        // Store CSV data for processing
        window.csvData = content;
    };
    
    reader.readAsText(file);
}

function processBulkUpload() {
    if (!window.csvData) return;
    
    const lines = window.csvData.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).filter(line => line.trim() !== '');
    
    let successCount = 0;
    let errorCount = 0;
    
    data.forEach((line, index) => {
        try {
            const cells = line.split(',');
            const productData = {
                name: cells[0] || `Product ${index + 1}`,
                category: cells[1] || 'tshirts',
                price: parseFloat(cells[2]) || 0,
                comparePrice: cells[3] ? parseFloat(cells[3]) : null,
                description: cells[4] || '',
                sku: cells[5] || `ACID-BULK-${Date.now()}-${index}`,
                initialStock: parseInt(cells[6]) || 0,
                lowStockThreshold: parseInt(cells[7]) || 5,
                images: [],
                variants: [],
                totalStock: parseInt(cells[6]) || 0
            };
            
            productManager.addProduct(productData);
            successCount++;
        } catch (error) {
            console.error(`Error processing line ${index + 1}:`, error);
            errorCount++;
        }
    });
    
    alert(`Bulk upload completed!\nSuccess: ${successCount}\nErrors: ${errorCount}`);
    
    // Reset
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('process-upload-btn').disabled = true;
    delete window.csvData;
    
    // Refresh products table
    showSection('products');
}

// Search Products
function searchProducts(query) {
    productManager.renderProductsTable(query);
}

// Product Actions
function editProduct(productId) {
    const product = productManager.getProduct(productId);
    if (!product) return;
    
    // Populate form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-compare-price').value = product.comparePrice || '';
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-sku').value = product.sku || '';
    document.getElementById('initial-stock').value = product.totalStock || 0;
    document.getElementById('low-stock-threshold').value = product.lowStockThreshold || 5;
    
    // Handle images
    uploadedImages = product.images || [];
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    uploadedImages.forEach(image => {
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            display: inline-block;
            margin: 5px;
            position: relative;
        `;
        imgContainer.innerHTML = `
            <img src="${image}" 
                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
            <button onclick="removeImage(this)" 
                    style="position: absolute; top: 5px; right: 5px; background: #ff4444; 
                           color: white; border: none; border-radius: 50%; width: 20px; 
                           height: 20px; cursor: pointer; font-size: 12px;">×</button>
        `;
        preview.appendChild(imgContainer);
    });
    
    // Handle variants
    const container = document.getElementById('variant-container');
    container.innerHTML = '';
    product.variants?.forEach(variant => {
        const variantItem = document.createElement('div');
        variantItem.className = 'variant-item';
        variantItem.innerHTML = `
            <input type="text" class="variant-name" value="${variant.name}">
            <input type="text" class="variant-options" value="${variant.options.join(',')}">
            <button type="button" class="action-btn delete-btn" onclick="removeVariant(this)">Remove</button>
        `;
        container.appendChild(variantItem);
    });
    
    // Change form to update mode
    const form = document.getElementById('add-product-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateProduct(productId);
    };
    
    // Update button text
    const submitBtn = form.querySelector('.btn-primary');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
    
    // Show add product section
    showSection('add-product');
}

function updateProduct(productId) {
    // Collect form data
    const variants = [];
    document.querySelectorAll('.variant-item').forEach(item => {
        const name = item.querySelector('.variant-name').value;
        const options = item.querySelector('.variant-options').value
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt !== '');
        
        if (name && options.length > 0) {
            variants.push({ name, options });
        }
    });
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        comparePrice: document.getElementById('product-compare-price').value || null,
        description: document.getElementById('product-description').value,
        images: uploadedImages,
        variants: variants,
        sku: document.getElementById('product-sku').value,
        totalStock: parseInt(document.getElementById('initial-stock').value),
        lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value),
        updatedAt: new Date().toISOString()
    };
    
    // Update product
    if (productManager.updateProduct(productId, productData)) {
        alert('Product updated successfully!');
        showSection('products');
    } else {
        alert('Error updating product');
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        if (productManager.deleteProduct(productId)) {
            alert('Product deleted successfully!');
            productManager.renderProductsTable();
        } else {
            alert('Error deleting product');
        }
    }
}

// Promotion Modal
function showAddPromotionModal() {
    document.getElementById('add-promotion-modal').classList.add('active');
    
    // Set default dates
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    document.getElementById('start-date').value = now.toISOString().slice(0, 16);
    document.getElementById('end-date').value = tomorrow.toISOString().slice(0, 16);
}

function closePromotionModal() {
    document.getElementById('add-promotion-modal').classList.remove('active');
    document.getElementById('promotion-form').reset();
}

// Handle promotion target change
document.getElementById('promotion-target')?.addEventListener('change', function() {
    const targetCategory = document.getElementById('target-category');
    targetCategory.style.display = this.value === 'category' ? 'block' : 'none';
});

// Add Promotion
document.getElementById('promotion-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const promotionData = {
        name: document.getElementById('promotion-name').value,
        type: document.getElementById('promotion-type').value,
        value: document.getElementById('promotion-type').value === 'percentage' ? 
               parseInt(document.getElementById('promotion-value').value) : 
               document.getElementById('promotion-value').value,
        startDate: new Date(document.getElementById('start-date').value).toISOString(),
        endDate: new Date(document.getElementById('end-date').value).toISOString(),
        target: document.getElementById('promotion-target').value,
        targetCategory: document.getElementById('promotion-target').value === 'category' ? 
                      document.getElementById('selected-category').value : null
    };
    
    promotionManager.addPromotion(promotionData);
    closePromotionModal();
    promotionManager.renderPromotions();
    
    alert('Promotion created successfully!');
});

// Admin Authentication
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real app, you would clear admin session
        // For now, just redirect to main site
        window.location.href = 'index.html';
    }
}

// const productManager = new ProductManager();
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to initialize
    setTimeout(() => {
        // Only initialize if user is logged in
        if (adminAuth.getSession()) {
            const productManager = new ProductManager();
            const promotionManager = new PromotionManager();
            
            // Load dashboard by default
            loadDashboard();
            
            // Make managers available globally
            window.productManager = productManager;
            window.promotionManager = promotionManager;
        }
    }, 100);
});