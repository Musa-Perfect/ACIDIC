/* ========================================
   SIMPLE FIX: EXPERIENCE CARDS NAVIGATION
   Makes experience cards navigate like Quick Links
   ======================================== */

console.log('🔗 Loading Experience Cards Direct Navigation...');

// Override openExperienceModal to use direct navigation
window.openExperienceModal = function(type) {
  console.log('Experience card clicked:', type);
  
  // Map experience types to navigation functions
  const navigationMap = {
    'ai-stylist': showAIStylist,
    'virtual-tryon': showVirtualTryOn,
    'sustainability': showSustainability,
    'rewards': showLoyaltyProgram,
    'outfit-builder': showOutfitBuilder,
    'community': showCommunity,
    'size-finder': openSizeRecommender
  };
  
  // Get the navigation function for this type
  const navFunction = navigationMap[type];
  
  if (navFunction && typeof navFunction === 'function') {
    // Call the direct navigation function (same as Quick Links)
    console.log('✅ Navigating to:', type);
    navFunction();
  } else {
    // Fallback: try the function name directly
    console.warn('Navigation function not found for:', type);
    
    // Try alternate function names
    if (type === 'virtual-tryon' && typeof showVirtualTryOn === 'function') {
      showVirtualTryOn();
    } else if (type === 'rewards' && typeof showLoyaltyProgram === 'function') {
      showLoyaltyProgram();
    } else if (type === 'outfit-builder' && typeof showOutfitBuilder === 'function') {
      showOutfitBuilder();
    } else if (type === 'ai-stylist' && typeof showAIStylist === 'function') {
      showAIStylist();
    } else {
      console.error('Could not navigate to:', type);
      alert('This feature is coming soon!');
    }
  }
};

// Ensure functions exist
if (typeof showCommunity !== 'function') {
  window.showCommunity = function() {
    console.log('Opening Community section');
    if (typeof hideAllSections === 'function') hideAllSections();
    const section = document.getElementById('community');
    if (section) {
      section.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Community feature coming soon!');
    }
  };
}

if (typeof openSizeRecommender !== 'function') {
  window.openSizeRecommender = function() {
    console.log('Opening Size Recommender');
    const modal = document.getElementById('size-recommender-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } else {
      alert('Size Finder feature coming soon!');
    }
  };
}

console.log('✅ Experience Cards now navigate directly to their pages!');
console.log('📍 Navigation works exactly like Quick Links');