// === FIREBASE CONFIGURATION ===
const firebaseConfig = {
  apiKey: "AIzaSyAYLaKO7I6bo1ThutemFtNW8SLM-AhF0lo",
  authDomain: "acidic-cidica21.firebaseapp.com",
  projectId: "acidic-cidica21",
  storageBucket: "acidic-cidica21.firebasestorage.app",
  messagingSenderId: "379641518",
  appId: "1:379641518:web:c690d6d6e6154f7ae6573f",
  measurementId: "G-1QF5S9P0HH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
      console.log("Firebase persistence error:", err.code);
  });

// ===== FIREBASE AUTHENTICATION =====
class FirebaseAuth {
    constructor() {
        this.currentUser = null;
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateAuthUI(user);
            if (user) {
                console.log("User signed in:", user.email);
                this.loadUserData(user.uid);
            } else {
                console.log("User signed out");
                this.clearUserData();
            }
        });
    }

    updateAuthUI(user) {
        const authLink = document.getElementById('auth-link');
        if (authLink) {
            if (user) {
                authLink.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span>👤 ${user.email}</span>
                        <button onclick="firebaseAuth.signOut()" style="background: #666; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                            Logout
                        </button>
                    </div>
                `;
            } else {
                authLink.innerHTML = '<a href="javascript:void(0)" onclick="showSignUp()">Sign Up / Login</a>';
            }
        }
    }

    async signUp(email, password, name) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                name: name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                points: 0,
                tier: 'Bronze',
                orderCount: 0,
                totalSpent: 0
            });
            
            this.showMessage('Account created successfully!', 'success');
            closeSignUp();
            return user;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.showMessage('Login successful!', 'success');
            closeLogin();
            return userCredential.user;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            this.showMessage('Logged out successfully', 'info');
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }

    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            this.showMessage('Password reset email sent!', 'success');
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    async socialLogin(provider) {
        try {
            let authProvider;
            
            switch(provider) {
                case 'google':
                    authProvider = new firebase.auth.GoogleAuthProvider();
                    break;
                case 'facebook':
                    authProvider = new firebase.auth.FacebookAuthProvider();
                    break;
                default:
                    throw new Error('Invalid provider');
            }
            
            const result = await auth.signInWithPopup(authProvider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                // Create new user profile
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    points: 0,
                    tier: 'Bronze',
                    orderCount: 0,
                    totalSpent: 0,
                    photoURL: user.photoURL
                });
            }
            
            this.showMessage('Login successful!', 'success');
            return user;
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    handleAuthError(error) {
        let message = 'An error occurred';
        
        switch(error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already in use';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            case 'auth/user-not-found':
                message = 'User not found';
                break;
            case 'auth/wrong-password':
                message = 'Wrong password';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your connection';
                break;
            default:
                message = error.message;
        }
        
        this.showMessage(message, 'error');
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-${type}`;
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            color: white;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#4CAF50';
        } else if (type === 'error') {
            messageDiv.style.background = '#f44336';
        } else {
            messageDiv.style.background = '#2196F3';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    async loadUserData(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                localStorage.setItem('currentUser', JSON.stringify(userData));
                this.updateUserProfileUI(userData);
                return userData;
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
        return null;
    }

    clearUserData() {
        localStorage.removeItem('currentUser');
        this.updateUserProfileUI(null);
    }

    updateUserProfileUI(userData) {
        // Update profile information in UI if needed
        if (userData && userData.name) {
            const profileElements = document.querySelectorAll('.user-name');
            profileElements.forEach(el => {
                el.textContent = userData.name;
            });
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// ===== FIREBASE DATABASE =====
class FirebaseDB {
    constructor() {
        this.productsRef = db.collection('products');
        this.ordersRef = db.collection('orders');
        this.usersRef = db.collection('users');
    }

    // ===== PRODUCTS =====
    async getProducts(category = null) {
        try {
            let query = this.productsRef.where('active', '==', true);
            
            if (category && category !== 'allproducts') {
                query = query.where('category', '==', category);
            }
            
            const snapshot = await query.get();
            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`Loaded ${products.length} products from Firebase`);
            return products;
        } catch (error) {
            console.error("Error loading products:", error);
            return [];
        }
    }

    async getProduct(productId) {
        try {
            const doc = await this.productsRef.doc(productId).get();
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error("Error getting product:", error);
            return null;
        }
    }

    async searchProducts(searchTerm) {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation
            const snapshot = await this.productsRef
                .where('name', '>=', searchTerm)
                .where('name', '<=', searchTerm + '\uf8ff')
                .get();
            
            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return products;
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    }

    // ===== ORDERS =====
    async createOrder(orderData) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User must be logged in to create order');
            }
            
            const order = {
                ...orderData,
                userId: user.uid,
                userEmail: user.email,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await this.ordersRef.add(order);
            
            // Update user stats
            await this.updateUserStats(user.uid, order.total, order.items.length);
            
            return {
                id: docRef.id,
                ...order
            };
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    }

    async getUserOrders(userId) {
        try {
            const snapshot = await this.ordersRef
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return orders;
        } catch (error) {
            console.error("Error getting user orders:", error);
            return [];
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            await this.ordersRef.doc(orderId).update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating order:", error);
            return false;
        }
    }

    // ===== USERS =====
    async updateUserStats(userId, orderTotal, itemsCount) {
        try {
            const userRef = this.usersRef.doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const currentData = userDoc.data();
                const newPoints = Math.floor(orderTotal / 10); // 1 point per R10
                
                await userRef.update({
                    orderCount: (currentData.orderCount || 0) + 1,
                    totalSpent: (currentData.totalSpent || 0) + orderTotal,
                    points: (currentData.points || 0) + newPoints,
                    tier: this.calculateTier((currentData.points || 0) + newPoints),
                    lastOrder: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                return newPoints;
            }
        } catch (error) {
            console.error("Error updating user stats:", error);
        }
        return 0;
    }

    calculateTier(points) {
        if (points >= 500) return 'Gold';
        if (points >= 200) return 'Silver';
        return 'Bronze';
    }

    async getUserProfile(userId) {
        try {
            const doc = await this.usersRef.doc(userId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error("Error getting user profile:", error);
            return null;
        }
    }

    async updateUserProfile(userId, updates) {
        try {
            await this.usersRef.doc(userId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    }

    // ===== CART =====
    async saveUserCart(userId, cartData) {
        try {
            await db.collection('userCarts').doc(userId).set({
                cart: cartData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error saving cart:", error);
            return false;
        }
    }

    async loadUserCart(userId) {
        try {
            const doc = await db.collection('userCarts').doc(userId).get();
            if (doc.exists) {
                return doc.data().cart || [];
            }
            return [];
        } catch (error) {
            console.error("Error loading cart:", error);
            return [];
        }
    }

    // ===== ANALYTICS =====
    async logEvent(eventType, eventData = {}) {
        try {
            await db.collection('analytics').add({
                type: eventType,
                data: eventData,
                userId: auth.currentUser?.uid || 'anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                page: window.location.pathname
            });
        } catch (error) {
            console.error("Error logging event:", error);
        }
    }
}

// ===== FIREBASE STORAGE =====
class FirebaseStorage {
    constructor() {
        this.storageRef = storage.ref();
    }

    async uploadProductImage(file, productId) {
        try {
            const filePath = `products/${productId}/${Date.now()}_${file.name}`;
            const fileRef = this.storageRef.child(filePath);
            
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    }

    async uploadUserAvatar(file, userId) {
        try {
            const filePath = `avatars/${userId}/${Date.now()}_${file.name}`;
            const fileRef = this.storageRef.child(filePath);
            
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
        } catch (error) {
            console.error("Error uploading avatar:", error);
            throw error;
        }
    }

    async deleteFile(fileURL) {
        try {
            const fileRef = storage.refFromURL(fileURL);
            await fileRef.delete();
            return true;
        } catch (error) {
            console.error("Error deleting file:", error);
            return false;
        }
    }
}

// ===== INITIALIZE FIREBASE SERVICES =====
const firebaseAuth = new FirebaseAuth();
const firebaseDB = new FirebaseDB();
const firebaseStorage = new FirebaseStorage();

// ===== GLOBAL EXPORTS =====
window.firebaseAuth = firebaseAuth;
window.firebaseDB = firebaseDB;
window.firebaseStorage = firebaseStorage;
window.auth = auth;
window.db = db;
window.storage = storage;

console.log("Firebase services initialized");