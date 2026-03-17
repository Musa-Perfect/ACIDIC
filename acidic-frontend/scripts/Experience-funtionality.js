/* ========================================
   EXPERIENCE CARDS - COMPLETE FUNCTIONALITY
   Add this JavaScript to make all cards work
   ======================================== */

// Global function to open experience modals
window.openExperienceModal = function(type) {
  const modal = document.getElementById('experience-modal');
  const body = document.getElementById('experience-modal-body');
  
  if (!modal || !body) {
    console.error('Experience modal not found');
    return;
  }
  
  // Get content based on type
  body.innerHTML = getExperienceContent(type);
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Initialize specific functionality if needed
  if (type === 'virtual-tryon' && typeof initVirtualTryOn === 'function') {
    setTimeout(() => initVirtualTryOn(), 100);
  } else if (type === 'rewards' && typeof renderLoyaltyPage === 'function') {
    setTimeout(() => renderLoyaltyPage(), 100);
  } else if (type === 'outfit-builder' && typeof initOutfitBuilder === 'function') {
    setTimeout(() => initOutfitBuilder(), 100);
  } else if (type === 'ai-stylist' && typeof initAIStylist === 'function') {
    setTimeout(() => initAIStylist(), 100);
  }
};

// Close experience modal
window.closeExperienceModal = function() {
  const modal = document.getElementById('experience-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Get content for each experience type
function getExperienceContent(type) {
  const content = {
    'ai-stylist': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon purple">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2>AI Stylist</h2>
          <p class="modal-subtitle">Your Personal Fashion Intelligence</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>🎨 Style Quiz</h3>
            <p>Take our comprehensive style quiz to discover your unique fashion personality. We analyze your preferences, lifestyle, and body type to create a personalized style profile.</p>
            <div class="feature-stats">
              <div class="stat">
                <span class="stat-number">4</span>
                <span class="stat-label">Personality Types</span>
              </div>
              <div class="stat">
                <span class="stat-number">50+</span>
                <span class="stat-label">Style Questions</span>
              </div>
              <div class="stat">
                <span class="stat-number">98%</span>
                <span class="stat-label">Accuracy</span>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>🌈 Color Analysis</h3>
            <p>Discover your perfect color palette based on your skin tone, hair color, and personal preferences. Get recommendations for colors that make you look and feel amazing.</p>
            <ul class="feature-list">
              <li>Seasonal color analysis</li>
              <li>Complementary color combinations</li>
              <li>Wardrobe color coordination</li>
              <li>Occasion-based palettes</li>
            </ul>
          </div>

          <div class="feature-section">
            <h3>📈 Trend Predictions</h3>
            <p>Stay ahead of the curve with AI-powered trend forecasting. We analyze global fashion trends, runway shows, and influencer styles to bring you tomorrow's trends today.</p>
            <div class="trend-tags">
              <span class="trend-tag">Oversized Blazers</span>
              <span class="trend-tag">90s Revival</span>
              <span class="trend-tag">Sustainable Materials</span>
              <span class="trend-tag">Bold Colors</span>
            </div>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('AI Stylist feature coming soon!')">
              Start Your Style Journey
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'virtual-tryon': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon blue">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 20h3c1.11 0 2-.89 2-2v-6.7c0-.66-.32-1.27-.86-1.64L17 7.54V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3.54L3.86 9.66C3.32 10.03 3 10.64 3 11.3V18c0 1.11.89 2 2 2h3v-7h8v7zM9 4h6v3L12 5 9 7V4z"/>
            </svg>
          </div>
          <h2>Virtual Try-On</h2>
          <p class="modal-subtitle">See It Before You Buy It</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>📸 How It Works</h3>
            <div class="steps-grid">
              <div class="step-item">
                <div class="step-number">1</div>
                <h4>Upload Photo</h4>
                <p>Take a photo or upload an existing one</p>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <h4>Select Item</h4>
                <p>Choose the clothing you want to try</p>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <h4>See the Magic</h4>
                <p>View yourself wearing the item instantly</p>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>✨ Features</h3>
            <ul class="feature-list">
              <li><strong>Real-time AR:</strong> See clothes on you in real-time using your camera</li>
              <li><strong>Multiple Angles:</strong> View from front, side, and back perspectives</li>
              <li><strong>Share & Save:</strong> Save try-on photos and share with friends</li>
              <li><strong>Mix & Match:</strong> Try different combinations of tops, bottoms, and accessories</li>
              <li><strong>Size Accuracy:</strong> AI ensures accurate fit representation</li>
            </ul>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Virtual Try-On launching soon!')">
              Try It Now
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'sustainability': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon green">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.25-.87C6.5 20.5 7 19 7 19c.5 1 1 2 1 2 1-1 1.5-2 1.5-2 .5 1 1 2 1 2 1-1 1.5-2 1.5-2 .5 1 1 2 1 2s1.5-1 2-2c.5 1 1 2 1 2 1-1 1.5-2 1.5-2 .5 1 1 2 1 2 1-1 1.5-2 1.5-2s1 1.5 1.5 2.5c0 0 .5-1.5 1-2.5l.42-1.4C21.2 12.5 19 10 17 8z"/>
            </svg>
          </div>
          <h2>Sustainability</h2>
          <p class="modal-subtitle">Fashion That Cares</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>🌍 Our Commitment</h3>
            <p>At ACIDIC, we believe fashion should never come at the cost of our planet. Every piece we create is designed with sustainability in mind.</p>
            
            <div class="impact-stats">
              <div class="impact-card">
                <h4>♻️ 70%</h4>
                <p>Recycled Materials</p>
              </div>
              <div class="impact-card">
                <h4>🌱 100%</h4>
                <p>Carbon Neutral</p>
              </div>
              <div class="impact-card">
                <h4>💧 30%</h4>
                <p>Less Water Usage</p>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>♻️ Sustainable Practices</h3>
            <ul class="feature-list">
              <li><strong>Recycled Materials:</strong> We use recycled polyester, organic cotton, and innovative eco-fabrics</li>
              <li><strong>Ethical Production:</strong> Fair wages and safe working conditions for all workers</li>
              <li><strong>Carbon Neutral Shipping:</strong> We offset 100% of our shipping emissions</li>
              <li><strong>Minimal Packaging:</strong> Biodegradable and recyclable packaging materials</li>
              <li><strong>Circular Fashion:</strong> Recycling program for old ACIDIC items</li>
            </ul>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Learn more about our sustainability initiatives')">
              Learn More
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'rewards': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon gold">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
            </svg>
          </div>
          <h2>Loyalty Rewards</h2>
          <p class="modal-subtitle">Earn While You Shop</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>💰 How It Works</h3>
            <div class="rewards-flow">
              <div class="flow-step">
                <span class="flow-icon">🛍️</span>
                <p><strong>Shop</strong><br>Earn 1 point per R10 spent</p>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <span class="flow-icon">⭐</span>
                <p><strong>Collect</strong><br>Stack up your points</p>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <span class="flow-icon">🎁</span>
                <p><strong>Redeem</strong><br>Get rewards & discounts</p>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>🎯 Membership Tiers</h3>
            <div class="tier-cards">
              <div class="tier-card bronze">
                <h4>Bronze</h4>
                <p class="tier-requirement">R0 - R2,000</p>
                <ul>
                  <li>5% birthday discount</li>
                  <li>Early sale access</li>
                  <li>Free standard shipping</li>
                </ul>
              </div>
              <div class="tier-card silver">
                <h4>Silver</h4>
                <p class="tier-requirement">R2,001 - R5,000</p>
                <ul>
                  <li>10% birthday discount</li>
                  <li>Exclusive member events</li>
                  <li>Free express shipping</li>
                  <li>Double points days</li>
                </ul>
              </div>
              <div class="tier-card gold-tier">
                <h4>Gold</h4>
                <p class="tier-requirement">R5,001+</p>
                <ul>
                  <li>15% birthday discount</li>
                  <li>VIP shopping experiences</li>
                  <li>Personal stylist access</li>
                  <li>Triple points</li>
                  <li>First access to new drops</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Join our loyalty program!')">
              Join Now - It's Free!
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'outfit-builder': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon pink">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>
            </svg>
          </div>
          <h2>Outfit Builder</h2>
          <p class="modal-subtitle">Create Your Perfect Look</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>🎨 Build Your Wardrobe</h3>
            <p>Mix and match pieces from our collection to create complete outfits. Save your favorites, get inspired by others, and share your style with the community.</p>
          </div>

          <div class="feature-section">
            <h3>✨ Features</h3>
            <ul class="feature-list">
              <li><strong>Drag & Drop Interface:</strong> Easily combine tops, bottoms, shoes, and accessories</li>
              <li><strong>Smart Suggestions:</strong> AI recommends matching pieces based on color and style</li>
              <li><strong>Save Outfits:</strong> Create unlimited outfit collections</li>
              <li><strong>Share & Inspire:</strong> Share your looks on social media</li>
              <li><strong>Shop the Look:</strong> Buy all pieces in an outfit with one click</li>
              <li><strong>Seasonal Collections:</strong> Curated outfit ideas for every occasion</li>
            </ul>
          </div>

          <div class="feature-section">
            <h3>📱 Use Cases</h3>
            <div class="usecase-grid">
              <div class="usecase-item">
                <span class="usecase-emoji">💼</span>
                <h4>Work</h4>
                <p>Professional outfits</p>
              </div>
              <div class="usecase-item">
                <span class="usecase-emoji">🎉</span>
                <h4>Events</h4>
                <p>Party & special occasions</p>
              </div>
              <div class="usecase-item">
                <span class="usecase-emoji">🏃</span>
                <h4>Casual</h4>
                <p>Everyday comfort</p>
              </div>
              <div class="usecase-item">
                <span class="usecase-emoji">🌴</span>
                <h4>Vacation</h4>
                <p>Travel-ready looks</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Outfit Builder coming soon!')">
              Start Building
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'community': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon orange">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h2>ACIDIC Community</h2>
          <p class="modal-subtitle">Join the Movement</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>👥 Connect & Share</h3>
            <p>Join thousands of fashion enthusiasts in our vibrant community. Share your style, get inspired, and connect with like-minded individuals.</p>
            
            <div class="community-stats">
              <div class="stat-box">
                <h4>10K+</h4>
                <p>Active Members</p>
              </div>
              <div class="stat-box">
                <h4>50K+</h4>
                <p>Outfit Posts</p>
              </div>
              <div class="stat-box">
                <h4>500+</h4>
                <p>Daily Conversations</p>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>🎯 What You Get</h3>
            <ul class="feature-list">
              <li><strong>Style Feed:</strong> Browse and like outfits from other members</li>
              <li><strong>Influencer Tips:</strong> Learn from fashion experts and brand ambassadors</li>
              <li><strong>Exclusive Events:</strong> Virtual styling sessions and product launches</li>
              <li><strong>Challenges:</strong> Participate in weekly style challenges</li>
              <li><strong>Discussions:</strong> Forums for fashion talk and advice</li>
              <li><strong>Early Access:</strong> Be first to know about new drops</li>
            </ul>
          </div>

          <div class="feature-section">
            <h3>🌟 Member Benefits</h3>
            <div class="benefits-grid">
              <div class="benefit-card">
                <span>🏆</span>
                <p>Badges & Recognition</p>
              </div>
              <div class="benefit-card">
                <span>💝</span>
                <p>Member-Only Discounts</p>
              </div>
              <div class="benefit-card">
                <span>📸</span>
                <p>Featured Posts</p>
              </div>
              <div class="benefit-card">
                <span>🎁</span>
                <p>Monthly Giveaways</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Join the ACIDIC Community!')">
              Join the Community
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,

    'size-finder': `
      <div class="experience-modal-content-inner">
        <div class="modal-hero">
          <div class="modal-icon blue">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z"/>
            </svg>
          </div>
          <h2>Size Finder</h2>
          <p class="modal-subtitle">Find Your Perfect Fit</p>
        </div>

        <div class="modal-body-content">
          <div class="feature-section">
            <h3>📏 Smart Sizing</h3>
            <p>Never worry about sizing again. Our AI-powered size recommender analyzes your measurements and fit preferences to suggest the perfect size for every item.</p>
          </div>

          <div class="feature-section">
            <h3>✨ How It Works</h3>
            <div class="steps-grid">
              <div class="step-item">
                <div class="step-number">1</div>
                <h4>Enter Measurements</h4>
                <p>Input your body measurements once</p>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <h4>Set Preferences</h4>
                <p>Tell us how you like your clothes to fit</p>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <h4>Get Recommendations</h4>
                <p>See your perfect size for every product</p>
              </div>
            </div>
          </div>

          <div class="feature-section">
            <h3>🎯 Benefits</h3>
            <ul class="feature-list">
              <li><strong>Accurate Sizing:</strong> 95% accuracy in size recommendations</li>
              <li><strong>Fit Preferences:</strong> Choose from slim, regular, or relaxed fits</li>
              <li><strong>Size Charts:</strong> Detailed measurements for every item</li>
              <li><strong>Comparison Tool:</strong> Compare sizes across different brands</li>
              <li><strong>Return Reduction:</strong> Fewer returns due to sizing issues</li>
            </ul>
          </div>

          <div class="cta-section">
            <button class="primary-cta-btn" onclick="alert('Size Finder feature coming soon!')">
              Find My Size
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
  };

  return content[type] || '<p>Content not available</p>';
}

console.log('✅ Experience Cards Functionality Loaded');