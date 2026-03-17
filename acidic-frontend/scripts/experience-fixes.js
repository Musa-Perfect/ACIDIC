/* ========================================
   FIX FOR VIRTUAL TRY-ON, LOYALTY REWARDS, OUTFIT BUILDER
   Add this JavaScript to make these 3 cards fully functional
   ======================================== */

console.log('🔧 Loading fixes for Virtual Try-On, Loyalty Rewards, and Outfit Builder...');

// Override the openExperienceModal function to handle these 3 properly
(function() {
  
  // Save the original function if it exists
  const originalOpenExperienceModal = window.openExperienceModal;
  
  // Override with our enhanced version
  window.openExperienceModal = function(type) {
    console.log('Opening experience:', type);
    
    const modal = document.getElementById('experience-modal');
    const body = document.getElementById('experience-modal-body');
    
    if (!modal || !body) {
      console.error('Experience modal elements not found');
      return;
    }
    
    // Handle the three special cases
    if (type === 'virtual-tryon') {
      // Virtual Try-On needs its own section
      body.innerHTML = '<div id="virtual-tryon" style="padding:0;min-height:600px;"></div>';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Initialize Virtual Try-On
      setTimeout(() => {
        if (typeof initVirtualTryOn === 'function') {
          initVirtualTryOn();
        } else {
          console.warn('initVirtualTryOn not found, loading default content');
          loadDefaultVirtualTryOn();
        }
      }, 100);
      
    } else if (type === 'rewards') {
      // Loyalty Rewards Program
      body.innerHTML = '<section id="loyalty-program" style="display:block;padding:0;"><div class="loyalty-container"></div></section>';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Initialize Loyalty
      setTimeout(() => {
        if (typeof renderLoyaltyPage === 'function') {
          renderLoyaltyPage();
        } else {
          console.warn('renderLoyaltyPage not found, loading default content');
          loadDefaultLoyaltyRewards();
        }
      }, 100);
      
    } else if (type === 'outfit-builder') {
      // Outfit Builder
      body.innerHTML = '<section id="outfit-builder" style="padding:0;background:none;box-shadow:none;min-height:600px;"></section>';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Initialize Outfit Builder
      setTimeout(() => {
        if (typeof initOutfitBuilder === 'function') {
          initOutfitBuilder();
        } else {
          console.warn('initOutfitBuilder not found, loading default content');
          loadDefaultOutfitBuilder();
        }
      }, 100);
      
    } else {
      // For all other types, use the original function
      if (originalOpenExperienceModal) {
        originalOpenExperienceModal(type);
      } else {
        // Fallback to basic modal content
        body.innerHTML = getExperienceContent(type);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    }
  };
  
  // Default Virtual Try-On content (if main function not available)
  function loadDefaultVirtualTryOn() {
    const section = document.getElementById('virtual-tryon');
    if (!section) return;
    
    section.innerHTML = `
      <div style="padding: 3rem; text-align: center; max-width: 800px; margin: 0 auto;">
        <div style="width: 100px; height: 100px; margin: 0 auto 2rem; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
          📸
        </div>
        <h2 style="font-size: 2.5rem; font-weight: 900; margin: 0 0 1rem 0;">Virtual Try-On</h2>
        <p style="font-size: 1.2rem; color: #666; margin-bottom: 3rem;">Experience our AR-powered fitting room</p>
        
        <div style="background: #f8f9fa; padding: 2rem; border-radius: 16px; margin-bottom: 2rem;">
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">🎥 How It Works</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 2rem;">
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">1️⃣</div>
              <h4 style="margin: 0 0 0.5rem 0;">Upload Photo</h4>
              <p style="color: #666; margin: 0;">Take or upload your photo</p>
            </div>
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">2️⃣</div>
              <h4 style="margin: 0 0 0.5rem 0;">Select Item</h4>
              <p style="color: #666; margin: 0;">Choose what to try on</p>
            </div>
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">3️⃣</div>
              <h4 style="margin: 0 0 0.5rem 0;">See Result</h4>
              <p style="color: #666; margin: 0;">View instant preview</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; text-align: left;">
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">✨ Features</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 0.8rem 0; border-bottom: 1px solid #e9ecef;">✓ Real-time AR technology</li>
            <li style="padding: 0.8rem 0; border-bottom: 1px solid #e9ecef;">✓ Multiple viewing angles</li>
            <li style="padding: 0.8rem 0; border-bottom: 1px solid #e9ecef;">✓ Save and share your looks</li>
            <li style="padding: 0.8rem 0; border-bottom: 1px solid #e9ecef;">✓ Try before you buy</li>
            <li style="padding: 0.8rem 0;">✓ Accurate size representation</li>
          </ul>
        </div>
        
        <button onclick="alert('Virtual Try-On feature launching soon! We are working on bringing you the best AR experience.')" style="padding: 1.2rem 3rem; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; text-transform: uppercase;">
          Coming Soon - Stay Tuned!
        </button>
      </div>
    `;
  }
  
  // Default Loyalty Rewards content (if main function not available)
  function loadDefaultLoyaltyRewards() {
    const section = document.querySelector('.loyalty-container');
    if (!section) return;
    
    section.innerHTML = `
      <div style="padding: 3rem; max-width: 1000px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="width: 100px; height: 100px; margin: 0 auto 2rem; background: linear-gradient(135deg, #f4b400, #ff6b35); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
            🎁
          </div>
          <h2 style="font-size: 2.5rem; font-weight: 900; margin: 0 0 1rem 0;">ACIDIC Loyalty Rewards</h2>
          <p style="font-size: 1.2rem; color: #666;">Earn points with every purchase and unlock exclusive perks</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 2rem; border-radius: 16px; margin-bottom: 3rem; text-align: center;">
          <h3 style="font-size: 1.5rem; margin-bottom: 2rem;">💰 How It Works</h3>
          <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛍️</div>
              <p style="font-weight: 700; margin: 0 0 0.3rem 0;">Shop</p>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Earn 1 point per R10</p>
            </div>
            <div style="font-size: 2rem; color: #f4b400;">→</div>
            <div style="flex: 1; min-width: 150px;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">⭐</div>
              <p style="font-weight: 700; margin: 0 0 0.3rem 0;">Collect</p>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Stack your points</p>
            </div>
            <div style="font-size: 2rem; color: #f4b400;">→</div>
            <div style="flex: 1; min-width: 150px;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎁</div>
              <p style="font-weight: 700; margin: 0 0 0.3rem 0;">Redeem</p>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Get rewards</p>
            </div>
          </div>
        </div>
        
        <h3 style="font-size: 1.8rem; text-align: center; margin-bottom: 2rem;">🎯 Membership Tiers</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
          
          <div style="background: linear-gradient(135deg, #cd7f32, #b8732d); padding: 2rem; border-radius: 16px; color: white; text-align: center; border: 3px solid #cd7f32;">
            <h4 style="font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 900;">BRONZE</h4>
            <p style="margin: 0 0 1.5rem 0; opacity: 0.9;">R0 - R2,000</p>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="padding: 0.5rem 0;">✓ 5% birthday discount</li>
              <li style="padding: 0.5rem 0;">✓ Early sale access</li>
              <li style="padding: 0.5rem 0;">✓ Free standard shipping</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #c0c0c0, #a8a8a8); padding: 2rem; border-radius: 16px; color: #000; text-align: center; border: 3px solid #c0c0c0;">
            <h4 style="font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 900;">SILVER</h4>
            <p style="margin: 0 0 1.5rem 0;">R2,001 - R5,000</p>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="padding: 0.5rem 0;">✓ 10% birthday discount</li>
              <li style="padding: 0.5rem 0;">✓ Member events</li>
              <li style="padding: 0.5rem 0;">✓ Express shipping</li>
              <li style="padding: 0.5rem 0;">✓ Double points days</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 2rem; border-radius: 16px; color: #000; text-align: center; border: 3px solid #ffd700;">
            <h4 style="font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 900;">GOLD</h4>
            <p style="margin: 0 0 1.5rem 0;">R5,001+</p>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="padding: 0.5rem 0;">✓ 15% birthday discount</li>
              <li style="padding: 0.5rem 0;">✓ VIP experiences</li>
              <li style="padding: 0.5rem 0;">✓ Personal stylist</li>
              <li style="padding: 0.5rem 0;">✓ Triple points</li>
              <li style="padding: 0.5rem 0;">✓ First access to drops</li>
            </ul>
          </div>
          
        </div>
        
        <div style="text-align: center;">
          <button onclick="alert('Join our loyalty program! Sign up or log in to start earning points with every purchase.')" style="padding: 1.2rem 3rem; background: linear-gradient(135deg, #f4b400, #ffcd3c); color: #000; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 800; cursor: pointer; text-transform: uppercase;">
            Join Now - It's Free!
          </button>
        </div>
      </div>
    `;
  }
  
  // Default Outfit Builder content (if main function not available)
  function loadDefaultOutfitBuilder() {
    const section = document.getElementById('outfit-builder');
    if (!section) return;
    
    section.innerHTML = `
      <div style="padding: 3rem; max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="width: 100px; height: 100px; margin: 0 auto 2rem; background: linear-gradient(135deg, #ec4899, #f43f5e); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
            🎨
          </div>
          <h2 style="font-size: 2.5rem; font-weight: 900; margin: 0 0 1rem 0;">Outfit Builder</h2>
          <p style="font-size: 1.2rem; color: #666;">Create your perfect look by mixing and matching our products</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 2rem; border-radius: 16px; margin-bottom: 3rem;">
          <h3 style="font-size: 1.5rem; text-align: center; margin-bottom: 2rem;">✨ Features</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
            <div style="text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">👕</div>
              <h4 style="margin: 0 0 0.5rem 0;">Drag & Drop</h4>
              <p style="color: #666; margin: 0; font-size: 0.95rem;">Easy interface to build looks</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
              <h4 style="margin: 0 0 0.5rem 0;">Smart Suggestions</h4>
              <p style="color: #666; margin: 0; font-size: 0.95rem;">AI recommends matches</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">💾</div>
              <h4 style="margin: 0 0 0.5rem 0;">Save Outfits</h4>
              <p style="color: #666; margin: 0; font-size: 0.95rem;">Create collections</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
              <h4 style="margin: 0 0 0.5rem 0;">Share Looks</h4>
              <p style="color: #666; margin: 0; font-size: 0.95rem;">Post on social media</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 2rem; border-radius: 16px; margin-bottom: 3rem;">
          <h3 style="font-size: 1.5rem; text-align: center; margin-bottom: 2rem;">📱 Perfect For</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
            <div style="background: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💼</div>
              <h5 style="margin: 0 0 0.3rem 0;">Work</h5>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Professional outfits</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
              <h5 style="margin: 0 0 0.3rem 0;">Events</h5>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Party looks</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏃</div>
              <h5 style="margin: 0 0 0.3rem 0;">Casual</h5>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Everyday style</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌴</div>
              <h5 style="margin: 0 0 0.3rem 0;">Vacation</h5>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">Travel ready</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <button onclick="alert('Outfit Builder feature coming soon! Soon you will be able to mix and match our products to create the perfect look.')" style="padding: 1.2rem 3rem; background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 800; cursor: pointer; text-transform: uppercase;">
            Coming Soon - Start Building
          </button>
        </div>
      </div>
    `;
  }
  
})();

console.log('✅ Virtual Try-On, Loyalty Rewards, and Outfit Builder fixes loaded!');