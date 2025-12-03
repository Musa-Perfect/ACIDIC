// === ADMIN FUNCTIONS ===
class AdminPanel {
    constructor() {
        this.isAdmin = false;
        this.checkAdminStatus();
    }

    async checkAdminStatus() {
        const user = firebaseAuth.getCurrentUser();
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'admin') {
                this.isAdmin = true;
                this.showAdminPanel();
            }
        }
    }

    showAdminPanel() {
        // Add admin button to header
        const nav = document.querySelector('nav ul');
        if (nav && !document.getElementById('admin-link')) {
            const adminLi = document.createElement('li');
            adminLi.id = 'admin-link';
            adminLi.innerHTML = '<a href="javascript:void(0)" onclick="adminPanel.showAdminInterface()">Admin</a>';
            nav.appendChild(adminLi);
        }
    }

    async showAdminInterface() {
        hideAllSections();
        
        const adminHTML = `
            <div class="admin-panel" style="padding: 40px; max-width: 1200px; margin: 0 auto;">
                <h2>Admin Dashboard</h2>
                
                <div class="admin-tabs" style="display: flex; gap: 10px; margin: 20px 0;">
                    <button onclick="adminPanel.showProductsManagement()" class="admin-tab active">Products</button>
                    <button onclick="adminPanel.showOrdersManagement()" class="admin-tab">Orders</button>
                    <button onclick="adminPanel.showUsersManagement()" class="admin-tab">Users</button>
                    <button onclick="adminPanel.showAnalytics()" class="admin-tab">Analytics</button>
                </div>
                
                <div id="admin-content"></div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.id = 'admin-section';
        container.innerHTML = adminHTML;
        document.body.appendChild(container);
        
        this.showProductsManagement();
    }

    async showProductsManagement() {
        const products = await firebaseDB.getProducts();
        
        const content = `
            <div class="admin-section">
                <h3>Manage Products</h3>
                <button onclick="adminPanel.showAddProductForm()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
                    + Add New Product
                </button>
                
                <div class="products-list" style="display: grid; gap: 15px;">
                    ${products.map(product => `
                        <div class="product-item" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <img src="${product.imageUrl || product.img}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover;">
                                <div>
                                    <strong>${product.name}</strong><br>
                                    <small>R${product.price} • ${product.category} • Stock: ${product.stock || 0}</small>
                                </div>
                            </div>
                            <div>
                                <button onclick="adminPanel.editProduct('${product.id}')" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                                <button onclick="adminPanel.deleteProduct('${product.id}')" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('admin-content').innerHTML = content;
    }

    async showAddProductForm() {
        const formHTML = `
            <div class="add-product-form" style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h4>Add New Product</h4>
                <form onsubmit="event.preventDefault(); adminPanel.saveProduct();">
                    <div style="display: grid; gap: 15px;">
                        <input type="text" id="product-name" placeholder="Product Name" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <textarea id="product-description" placeholder="Description" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; height: 100px;"></textarea>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <input type="number" id="product-price" placeholder="Price" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <input type="number" id="product-stock" placeholder="Stock" value="50" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        
                        <select id="product-category" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="tshirts">T-Shirts</option>
                            <option value="sweaters">Sweaters</option>
                            <option value="hoodies">Hoodies</option>
                            <option value="pants">Pants</option>
                            <option value="twopieces">Two Pieces</option>
                            <option value="accessories">Accessories</option>
                        </select>
                        
                        <div>
                            <label>Product Images:</label>
                            <input type="file" id="product-images" multiple accept="image/*" style="margin-top: 5px;">
                            <div id="image-preview" style="display: flex; gap: 10px; margin-top: 10px;"></div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button type="submit" style="background: #4CAF50; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; flex: 1;">Save Product</button>
                            <button type="button" onclick="adminPanel.showProductsManagement()" style="background: #666; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('admin-content').innerHTML = formHTML;
        
        // Add image preview
        document.getElementById('product-images').addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';
            
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '80px';
                    img.style.height = '80px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '5px';
                    preview.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        });
    }

    async saveProduct() {
        try {
            const productData = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                category: document.getElementById('product-category').value,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Generate product ID
            const productId = productData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);
            
            // Upload images if any
            const imageFiles = document.getElementById('product-images').files;
            if (imageFiles.length > 0) {
                const imageUrl = await imageManager.uploadProductImage(imageFiles[0], productId);
                productData.imageUrl = imageUrl;
            }

            // Save to Firestore
            await db.collection('products').doc(productId).set(productData);
            
            alert('Product saved successfully!');
            this.showProductsManagement();
            
            // Refresh products in frontend
            loadProductsFromFirebase();
            
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + error.message);
        }
    }
}

// Initialize Admin Panel
const adminPanel = new AdminPanel();
window.adminPanel = adminPanel;