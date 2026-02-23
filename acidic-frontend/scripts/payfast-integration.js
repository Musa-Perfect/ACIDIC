// ================================================================
//  PAYFAST INTEGRATION FOR ACIDIC CLOTHING
// ================================================================

// PayFast Configuration
const PAYFAST_CONFIG = {
  // SANDBOX CREDENTIALS (for testing) - Use these to start
  sandbox: {
    merchantId: '10000100',
    merchantKey: '46f0cd694581a',
    url: 'https://sandbox.payfast.co.za/eng/process'
  },
  
  // LIVE CREDENTIALS - Replace with YOUR credentials when going live
  live: {
    merchantId: '19119364',
    merchantKey: 'ucfce5gbzdffz',
    url: 'https://www.payfast.co.za/eng/process'
  },
  
  // CHANGE THIS TO false WHEN GOING LIVE
  useSandbox: false
};

// Initialize PayFast payment form
function initPayFastPayment() {
  console.log('💳 Initializing PayFast payment...');
  
  // Get cart
  const cart = JSON.parse(localStorage.getItem('acidicCart') || '[]');
  if (cart.length === 0) {
    console.error('Cart is empty!');
    return;
  }
  
  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 150;
  const total = subtotal + delivery;
  
  // Get customer info
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');
  
  // Generate order ID
  const orderId = 'ACD' + Date.now();
  
  // Fill form fields
  document.getElementById('payfast_amount').value = total.toFixed(2);
  document.getElementById('payfast_description').value = `Order ${orderId}`;
  document.getElementById('payfast_email').value = checkoutData.email || user.email || 'customer@acidic.co.za';
  document.getElementById('payfast_order_id').value = orderId;
  
  // Split name
  const fullName = checkoutData.name || user.name || 'Customer ACIDIC';
  const names = fullName.split(' ');
  document.getElementById('payfast_name_first').value = names[0] || 'Customer';
  document.getElementById('payfast_name_last').value = names.slice(1).join(' ') || 'ACIDIC';
  
  // Phone
  const phone = (checkoutData.phone || user.phone || '').replace(/[^0-9]/g, '');
  if (phone) document.getElementById('payfast_cell').value = phone;
  
  // Cart items
  document.getElementById('payfast_cart_items').value = JSON.stringify(cart);
  
  // Set merchant details based on mode
  const form = document.getElementById('payfast-form');
  const config = PAYFAST_CONFIG.useSandbox ? PAYFAST_CONFIG.sandbox : PAYFAST_CONFIG.live;
  
  form.action = config.url;
  form.querySelector('[name="merchant_id"]').value = config.merchantId;
  form.querySelector('[name="merchant_key"]').value = config.merchantKey;
  
  console.log('✅ PayFast ready - Amount: R' + total + ' - Mode: ' + (PAYFAST_CONFIG.useSandbox ? 'TEST' : 'LIVE'));
}

// Override payment modal
const originalOpenPayment = window.openPayment;
window.openPayment = function() {
  if (originalOpenPayment) originalOpenPayment();
  setTimeout(initPayFastPayment, 100);
};

// Form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('payfast-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      const button = this.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Redirecting to PayFast...';
      console.log('Submitting to PayFast...');
    });
  }
});

console.log('✅ PayFast loaded -', PAYFAST_CONFIG.useSandbox ? '🧪 SANDBOX MODE' : '🔴 LIVE MODE');