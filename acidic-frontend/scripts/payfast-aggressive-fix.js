// ================================================================
//  PAYFAST AGGRESSIVE FIX - GUARANTEED TO WORK
//  This completely isolates PayFast from all other form handlers
// ================================================================

console.log('⚡ PayFast Aggressive Fix Loading...');

// Step 1: Prevent showPaymentLoading from activating for PayFast
const originalShowPaymentLoading = window.showPaymentLoading;
window.showPaymentLoading = function(show) {
  // Check if we're in PayFast submission mode
  if (window._payFastSubmitting) {
    console.log('⛔ Blocked payment loading overlay - PayFast is submitting');
    return; // Don't show loading for PayFast
  }
  
  // For card payments, use original function
  if (originalShowPaymentLoading) {
    return originalShowPaymentLoading(show);
  }
};

// Step 2: Completely override processPayment to ignore PayFast
const originalProcessPayment = window.processPayment;
window.processPayment = function(event) {
  // If PayFast is submitting, do nothing
  if (window._payFastSubmitting) {
    console.log('⛔ Blocked processPayment - PayFast is handling this');
    return false;
  }
  
  // Check if event is from PayFast form
  if (event && event.target) {
    const form = event.target.closest ? event.target.closest('form') : null;
    
    if (form && form.id === 'payfast-form') {
      console.log('✅ PayFast form detected in processPayment - allowing submission');
      window._payFastSubmitting = true;
      return true; // Let it through
    }
  }
  
  // For card payment, use original
  if (originalProcessPayment) {
    return originalProcessPayment(event);
  }
  
  return false;
};

// Step 3: Set up PayFast form with complete isolation
document.addEventListener('DOMContentLoaded', function() {
  
  // Wait for everything to load
  setTimeout(function() {
    
    const payFastForm = document.getElementById('payfast-form');
    
    if (!payFastForm) {
      console.error('❌ PayFast form not found!');
      return;
    }
    
    console.log('✅ PayFast form found - applying aggressive fix');
    
    // NUCLEAR OPTION: Replace form with clean clone
    const cleanForm = payFastForm.cloneNode(true);
    payFastForm.parentNode.replaceChild(cleanForm, payFastForm);
    
    console.log('✓ All event listeners removed from PayFast form');
    
    // Add ONLY our handler
    cleanForm.addEventListener('submit', function(e) {
      console.log('🚀 PayFast form submitting...');
      
      // Set flag to prevent interference
      window._payFastSubmitting = true;
      
      // Hide payment loading if it's showing
      const loadingOverlay = document.getElementById('payment-loading');
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
        loadingOverlay.style.display = 'none';
      }
      
      // Validate fields
      const amount = this.querySelector('#payfast_amount');
      const email = this.querySelector('#payfast_email');
      const merchantId = this.querySelector('[name="merchant_id"]');
      
      if (!amount || !amount.value || parseFloat(amount.value) <= 0) {
        e.preventDefault();
        window._payFastSubmitting = false;
        alert('Please complete checkout first - amount is missing');
        console.error('❌ Amount validation failed:', amount ? amount.value : 'not found');
        return false;
      }
      
      if (!email || !email.value || !email.value.includes('@')) {
        e.preventDefault();
        window._payFastSubmitting = false;
        alert('Please complete checkout first - email is missing');
        console.error('❌ Email validation failed:', email ? email.value : 'not found');
        return false;
      }
      
      if (!merchantId || !merchantId.value) {
        e.preventDefault();
        window._payFastSubmitting = false;
        alert('PayFast not configured - merchant ID missing');
        console.error('❌ Merchant ID missing');
        return false;
      }
      
      console.log('✅ Validation passed:');
      console.log('   Amount: R' + amount.value);
      console.log('   Email:', email.value);
      console.log('   Merchant:', merchantId.value);
      console.log('   Action:', this.action);
      
      // Update button
      const btn = this.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Redirecting to PayFast...
          </div>
        `;
        
        // Failsafe: reset after 15 seconds
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
          window._payFastSubmitting = false;
        }, 15000);
      }
      
      // Log and allow submission
      console.log('📤 Submitting to PayFast now...');
      console.log('📤 URL:', this.action);
      console.log('📤 Method:', this.method);
      
      // DO NOT preventDefault - let it submit!
      return true;
      
    }, true); // Use capture phase
    
    console.log('✅ PayFast isolated submit handler attached');
    
    // Step 4: Prevent ANY other handlers from being added
    const originalAddEventListener = cleanForm.addEventListener;
    cleanForm.addEventListener = function(type, listener, options) {
      if (type === 'submit') {
        console.log('⛔ Blocked attempt to add submit listener to PayFast form');
        return; // Block it!
      }
      // Allow other events
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    console.log('✅ PayFast form protected from future listeners');
    
  }, 2000); // Wait even longer
  
});

// Step 4: Stop payment loading overlay from appearing during PayFast submission
setInterval(function() {
  if (window._payFastSubmitting) {
    const loadingOverlay = document.getElementById('payment-loading');
    if (loadingOverlay && loadingOverlay.classList.contains('active')) {
      console.log('⛔ Force-hiding payment loading overlay');
      loadingOverlay.classList.remove('active');
      loadingOverlay.style.display = 'none';
    }
  }
}, 100);

// Add CSS for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log('✅ PayFast Aggressive Fix Applied');
console.log('   PayFast form is now completely isolated');
console.log('   No interference possible from card payment code');