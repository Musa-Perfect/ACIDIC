// ================================================================
//  PAYFAST INTEGRATION FOR ACIDIC CLOTHING
//  Fixed version with proper URL handling
// ================================================================

// PayFast Configuration
const PAYFAST_CONFIG = {
  // SANDBOX CREDENTIALS (for testing) - Use these to start
  sandbox: {
    merchantId: '10046120',
    merchantKey: 'm3himwm18fojr',
    url: 'https://sandbox.payfast.co.za/eng/process'
  },
  
  // LIVE CREDENTIALS - Replace with YOUR credentials when going live
  live: {
    merchantId: '19119364',  // Replace with your actual merchant ID
    merchantKey: 'ucfce5gbzdffz',  // Replace with your actual merchant key
    url: 'https://www.payfast.co.za/eng/process'
  },
  
  // CHANGE THIS TO false WHEN GOING LIVE
  useSandbox: true,
  
  // Return URLs - these will be set automatically based on current domain
  getReturnUrl() {
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    return {
      success: baseUrl + 'success.html',
      cancel: baseUrl + 'cancel.html',
      notify: baseUrl + 'notify'  // You'll need to set up a server endpoint for this
    };
  }
};

// Initialize PayFast payment form
function initPayFastPayment() {
  console.log('💳 Initializing PayFast payment...');
  
  // Get cart
  const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
  if (cart.length === 0) {
    console.error('Cart is empty!');
    if (typeof showNotification === 'function') {
      showNotification('Your cart is empty', 'error');
    }
    return;
  }
  
  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 150;
  const total = subtotal + delivery;
  
  // Get customer info
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');
  
  // Validate customer info
  if (!checkoutData.email && !user.email) {
    console.error('Customer email missing');
    if (typeof showNotification === 'function') {
      showNotification('Please complete checkout form first', 'error');
    }
    return;
  }
  
  // Generate order ID
  const orderId = 'ACD' + Date.now();
  
  // Store order details for success page
  sessionStorage.setItem('pendingOrder', JSON.stringify({
    orderId: orderId,
    items: cart,
    subtotal: subtotal,
    delivery: delivery,
    total: total,
    timestamp: new Date().toISOString()
  }));
  
  // Fill form fields
  const form = document.getElementById('payfast-form');
  if (!form) {
    console.error('PayFast form not found!');
    return;
  }
  
  // Set amount
  const amountField = document.getElementById('payfast_amount');
  if (amountField) amountField.value = total.toFixed(2);
  
  // Set description
  const descField = document.getElementById('payfast_description');
  if (descField) descField.value = `Order ${orderId} - ${cart.length} item(s)`;
  
  // Set email
  const emailField = document.getElementById('payfast_email');
  if (emailField) emailField.value = checkoutData.email || user.email || 'customer@acidic.co.za';
  
  // Split name
  const fullName = checkoutData.name || user.name || 'Customer ACIDIC';
  const names = fullName.split(' ');
  const firstNameField = document.getElementById('payfast_name_first');
  const lastNameField = document.getElementById('payfast_name_last');
  if (firstNameField) firstNameField.value = names[0] || 'Customer';
  if (lastNameField) lastNameField.value = names.slice(1).join(' ') || 'ACIDIC';
  
  // Phone
  const phone = (checkoutData.phone || user.phone || '').replace(/[^0-9]/g, '');
  const phoneField = document.getElementById('payfast_cell');
  if (phoneField && phone) phoneField.value = phone;
  
  // Order ID
  const orderIdField = document.getElementById('payfast_order_id');
  if (orderIdField) orderIdField.value = orderId;
  
  // Cart items stored in sessionStorage only (not sent to PayFast - exceeds 255 char limit)
  // const cartField = document.getElementById('payfast_cart_items');
  // if (cartField) cartField.value = JSON.stringify(cart);
  
  // Update return URLs dynamically
  const urls = PAYFAST_CONFIG.getReturnUrl();
  const returnUrlField = form.querySelector('[name="return_url"]');
  const cancelUrlField = form.querySelector('[name="cancel_url"]');
  const notifyUrlField = form.querySelector('[name="notify_url"]');
  
  if (returnUrlField) returnUrlField.value = urls.success;
  if (cancelUrlField) cancelUrlField.value = urls.cancel;
  if (notifyUrlField) notifyUrlField.value = urls.notify;
  
  // Set merchant details based on mode
  const config = PAYFAST_CONFIG.useSandbox ? PAYFAST_CONFIG.sandbox : PAYFAST_CONFIG.live;
  
  form.action = config.url;
  
  const merchantIdField = form.querySelector('[name="merchant_id"]');
  const merchantKeyField = form.querySelector('[name="merchant_key"]');
  
  if (merchantIdField) merchantIdField.value = config.merchantId;
  if (merchantKeyField) merchantKeyField.value = config.merchantKey;
  
  console.log('✅ PayFast form initialized');
  console.log('   Mode:', PAYFAST_CONFIG.useSandbox ? '🧪 TEST (Sandbox)' : '🔴 LIVE');
  console.log('   Amount: R' + total.toFixed(2));
  console.log('   Order ID:', orderId);
  console.log('   Return URL:', urls.success);
  console.log('   Cancel URL:', urls.cancel);
}

// Override payment modal opening
const originalOpenPayment = window.openPayment;
window.openPayment = function() {
  if (originalOpenPayment) {
    originalOpenPayment();
  }
  
  // Initialize PayFast after modal opens
  setTimeout(() => {
    initPayFastPayment();
  }, 100);
};

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('payfast-form');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      const button = this.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span style="display: flex; align-items: center; justify-content: center; gap: 12px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"/></svg>Redirecting to PayFast...</span>';
      }
      
      console.log('✅ Form submitted - Redirecting to PayFast...');
    });
  }
});

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log('✅ PayFast Integration Loaded');
console.log('   Mode:', PAYFAST_CONFIG.useSandbox ? '🧪 SANDBOX (Test Mode)' : '🔴 LIVE MODE');
console.log('   To switch to LIVE: Set PAYFAST_CONFIG.useSandbox = false');