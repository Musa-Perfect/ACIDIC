// ================================================================
//  FIREBASE CONFIGURATION & INITIALIZATION
//  Complete setup for authentication, database, and storage
// ================================================================

// Your Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCJF2ZVicPDow3qMGwn2Wp4yj0kLDMLyvI",
  authDomain: "acidic-clothing-ad424.firebaseapp.com",
  projectId: "acidic-clothing-ad424",
  storageBucket: "acidic-clothing-ad424.firebasestorage.app",
  messagingSenderId: "183097805950",
  appId: "1:183097805950:web:21ad28d042e682d2451c2f",
  measurementId: "G-E4QL1SWBQM"
};

// Initialize Firebase
let app, auth, db, storage, analytics;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  
  // Initialize Analytics (optional)
  if (firebaseConfig.measurementId) {
    analytics = firebase.analytics();
  }
  
  console.log('✓ Firebase initialized successfully');
  
  // Enable offline persistence
  db.enablePersistence()
    .catch(function(err) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence only enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support offline persistence');
      }
    });
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  showNotification('Unable to connect to database. Please refresh the page.', 'error');
}

// ── Global Firebase references ────────────────────────────────────
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
window.firebaseAnalytics = analytics;

// ── Database Collections ──────────────────────────────────────────
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'carts',
  REVIEWS: 'reviews',
  INVENTORY: 'inventory',
  ANALYTICS: 'analytics'
};

window.FIREBASE_COLLECTIONS = COLLECTIONS;

// ── Auth State Observer ───────────────────────────────────────────
auth.onAuthStateChanged(async function(user) {
  if (user) {
    console.log('User signed in:', user.email);
    
    // Load user data from Firestore
    try {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Merge with auth data
        const currentUser = {
          uid: user.uid,
          email: user.email,
          name: userData.name || user.displayName || 'User',
          phone: userData.phone || '',
          address: userData.address || {},
          points: userData.points || 0,
          tier: userData.tier || 'Bronze',
          orders: userData.orders || [],
          joinedAt: userData.joinedAt || user.metadata.creationTime,
          lastLogin: new Date().toISOString()
        };
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update last login in Firestore
        db.collection(COLLECTIONS.USERS).doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update UI
        if (typeof updateAuthLink === 'function') updateAuthLink();
        if (typeof displayUserRewards === 'function') displayUserRewards();
        
        // Sync cart from Firebase
        await syncCartFromFirebase(user.uid);
        
        // Log analytics event
        if (analytics) {
          analytics.logEvent('user_login', {
            method: 'email',
            user_id: user.uid
          });
        }
        
      } else {
        // First time user - create profile
        await createUserProfile(user);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    
  } else {
    console.log('User signed out');
    localStorage.removeItem('currentUser');
    if (typeof updateAuthLink === 'function') updateAuthLink();
  }
});

// ── Create User Profile ───────────────────────────────────────────
async function createUserProfile(user, additionalData = {}) {
  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      name: additionalData.name || user.displayName || 'User',
      phone: additionalData.phone || '',
      address: additionalData.address || {},
      points: 0,
      tier: 'Bronze',
      orders: [],
      wishlist: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await userRef.set(userData);
    console.log('✓ User profile created');
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify({
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }));
    
    return userData;
    
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// ── Cart Sync ─────────────────────────────────────────────────────
async function syncCartFromFirebase(userId) {
  try {
    const cartDoc = await db.collection(COLLECTIONS.CART).doc(userId).get();
    
    if (cartDoc.exists) {
      const firebaseCart = cartDoc.data().items || [];
      
      // Merge with local cart (local takes priority)
      const localCart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
      
      if (localCart.length > 0) {
        // User has local cart - upload it to Firebase
        await db.collection(COLLECTIONS.CART).doc(userId).set({
          items: localCart,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Use Firebase cart
        localStorage.setItem('acidicCart', JSON.stringify(firebaseCart));
        if (typeof updateCartCount === 'function') updateCartCount();
      }
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
  }
}

async function saveCartToFirebase(userId, cartItems) {
  try {
    await db.collection(COLLECTIONS.CART).doc(userId).set({
      items: cartItems,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
  }
}

// ── Export functions ──────────────────────────────────────────────
window.createUserProfile = createUserProfile;
window.syncCartFromFirebase = syncCartFromFirebase;
window.saveCartToFirebase = saveCartToFirebase;

console.log('✓ Firebase config loaded');