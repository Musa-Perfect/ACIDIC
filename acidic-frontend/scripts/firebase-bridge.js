// ================================================================
//  FIREBASE INTEGRATION BRIDGE
//  Connects your existing code to Firebase services
//  This file makes Firebase work seamlessly with your current code
// ================================================================

// ── Override existing auth.js functions with Firebase versions ───

// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', function() {
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    console.warn('Firebase not loaded - using localStorage fallback');
    return;
  }
  
  console.log('Firebase integration bridge active');
  
  // Override signUp function
  const originalSignUp = window.signUp;
  window.signUp = async function() {
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const phone = document.getElementById('signup-phone')?.value || '';
    
    if (!name || !email || !password) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Use Firebase sign up
    const result = await firebaseSignUp(email, password, name, phone);
    
    if (result.success) {
      closeSignUp();
    }
  };
  
  // Override login function
  const originalLogin = window.login;
  window.login = async function() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (!email || !password) {
      showNotification('Please enter email and password', 'error');
      return;
    }
    
    // Use Firebase sign in
    await firebaseSignIn(email, password);
  };
  
  // Override logout function
  const originalLogout = window.logout;
  window.logout = async function() {
    await firebaseSignOut();
  };
  
  // Add Google Sign In buttons to modals
  setTimeout(addGoogleSignInButtons, 1000);
});

// ── Add Google Sign In Buttons ────────────────────────────────────
function addGoogleSignInButtons() {
  // Add to login modal
  const loginModal = document.getElementById('login-section');
  if (loginModal && !document.getElementById('google-signin-login')) {
    const loginForm = loginModal.querySelector('form') || loginModal.querySelector('.login-form');
    if (loginForm) {
      const googleBtn = document.createElement('button');
      googleBtn.id = 'google-signin-login';
      googleBtn.type = 'button';
      googleBtn.className = 'google-signin-btn';
      googleBtn.innerHTML = `
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      `;
      googleBtn.onclick = firebaseSignInWithGoogle;
      
      // Add styles
      googleBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-top: 15px;
        background: white;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.2s;
      `;
      
      googleBtn.onmouseover = function() {
        this.style.background = '#f8f8f8';
        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      };
      
      googleBtn.onmouseout = function() {
        this.style.background = 'white';
        this.style.boxShadow = 'none';
      };
      
      // Insert after login button or at end of form
      const loginBtn = loginForm.querySelector('button[onclick*="login"]') || 
                       loginForm.querySelector('button[type="submit"]');
      if (loginBtn && loginBtn.parentNode) {
        loginBtn.parentNode.insertBefore(googleBtn, loginBtn.nextSibling);
      } else {
        loginForm.appendChild(googleBtn);
      }
      
      // Add divider
      const divider = document.createElement('div');
      divider.style.cssText = 'margin: 15px 0; text-align: center; color: #999; font-size: 12px;';
      divider.textContent = '─── OR ───';
      if (loginBtn && loginBtn.parentNode) {
        loginBtn.parentNode.insertBefore(divider, loginBtn.nextSibling);
      }
    }
  }
  
  // Add to signup modal
  const signupModal = document.getElementById('signup-section');
  if (signupModal && !document.getElementById('google-signin-signup')) {
    const signupForm = signupModal.querySelector('form') || signupModal.querySelector('.signup-form');
    if (signupForm) {
      const googleBtn = document.createElement('button');
      googleBtn.id = 'google-signin-signup';
      googleBtn.type = 'button';
      googleBtn.className = 'google-signin-btn';
      googleBtn.innerHTML = `
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Sign up with Google
      `;
      googleBtn.onclick = function() {
        firebaseSignInWithGoogle().then(result => {
          if (result.success) {
            closeSignUp();
          }
        });
      };
      
      googleBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-top: 15px;
        background: white;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.2s;
      `;
      
      googleBtn.onmouseover = function() {
        this.style.background = '#f8f8f8';
        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      };
      
      googleBtn.onmouseout = function() {
        this.style.background = 'white';
        this.style.boxShadow = 'none';
      };
      
      const signupBtn = signupForm.querySelector('button[onclick*="signUp"]') || 
                        signupForm.querySelector('button[type="submit"]');
      if (signupBtn && signupBtn.parentNode) {
        signupBtn.parentNode.insertBefore(googleBtn, signupBtn.nextSibling);
      } else {
        signupForm.appendChild(googleBtn);
      }
      
      const divider = document.createElement('div');
      divider.style.cssText = 'margin: 15px 0; text-align: center; color: #999; font-size: 12px;';
      divider.textContent = '─── OR ───';
      if (signupBtn && signupBtn.parentNode) {
        signupBtn.parentNode.insertBefore(divider, signupBtn.nextSibling);
      }
    }
  }
}

// ── Enhance cart functions with Firebase sync ────────────────────
const originalAddToCart = window.addToCart;
window.addToCart = function(product, size, quantity) {
  // Call original function
  if (originalAddToCart) {
    originalAddToCart(product, size, quantity);
  }
  
  // Sync to Firebase if user is signed in
  const user = getCurrentFirebaseUser && getCurrentFirebaseUser();
  if (user) {
    const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
    saveCartToFirebase(user.uid, cart);
  }
  
  // Log analytics
  if (typeof logAddToCart === 'function') {
    logAddToCart(product, quantity || 1);
  }
};

// ── Enhance checkout with Firebase order creation ────────────────
const originalHandleSuccessfulPayment = window.handleSuccessfulPayment;
window.handleSuccessfulPayment = async function(result) {
  const user = getCurrentFirebaseUser && getCurrentFirebaseUser();
  
  if (user && typeof createOrderInFirebase === 'function') {
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order in Firebase
    const orderResult = await createOrderInFirebase({
      items: cart,
      subtotal: subtotal,
      shipping: 150,
      total: subtotal + 150,
      shippingAddress: {}, // Add shipping form data here
      paymentMethod: 'card'
    });
    
    if (orderResult.success) {
      console.log('✓ Order saved to Firebase:', orderResult.orderId);
    }
  }
  
  // Call original function
  if (originalHandleSuccessfulPayment) {
    originalHandleSuccessfulPayment(result);
  }
};

// ── Load products from Firebase on startup ───────────────────────
window.addEventListener('load', function() {
  if (typeof loadProductsFromFirebase === 'function') {
    loadProductsFromFirebase().then(products => {
      if (products) {
        window.productData = products;
        console.log('✓ Products loaded from Firebase');
        
        // Refresh product display if on shop page
        if (typeof showCategory === 'function') {
          const currentCategory = localStorage.getItem('currentCategory') || 'tshirts';
          showCategory(currentCategory);
        }
      }
    }).catch(error => {
      console.warn('Using local product data:', error);
    });
  }
});

console.log('✓ Firebase integration bridge loaded');