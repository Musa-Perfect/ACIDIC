class FirebaseRewardsSystem {
    constructor() {
        this.userData = null;
    }
    
    async loadUserRewards() {
        if (!firebaseAuth.isAuthenticated()) return;
        
        const user = firebaseAuth.getCurrentUser();
        this.userData = await firebaseDB.getUserProfile(user.uid);
        
        if (this.userData) {
            this.updateDisplay();
        }
    }
    
    async addPoints(points) {
        if (!firebaseAuth.isAuthenticated()) return points;
        
        const user = firebaseAuth.getCurrentUser();
        const currentPoints = this.userData?.points || 0;
        const newPoints = currentPoints + points;
        
        await firebaseDB.updateUserProfile(user.uid, {
            points: newPoints,
            tier: this.calculateTier(newPoints)
        });
        
        this.userData.points = newPoints;
        this.userData.tier = this.calculateTier(newPoints);
        
        return points;
    }
}

// ===== REWARDS SYSTEM =====
class RewardsSystem {
    constructor() {
        this.userPoints = 0;
        this.userTier = 'Bronze';
        this.orderHistory = [];
        this.loadUserData();
    }

    // Load user data from localStorage
    loadUserData() {
        // Load points
        const savedPoints = localStorage.getItem('acidicUserPoints');
        this.userPoints = savedPoints ? parseInt(savedPoints) : 0;
        
        // Load tier
        const savedTier = localStorage.getItem('acidicUserTier');
        this.userTier = savedTier || 'Bronze';
        
        // Load order history
        const savedOrders = localStorage.getItem('acidicOrderHistory');
        this.orderHistory = savedOrders ? JSON.parse(savedOrders) : [];
        
        this.updateTier();
        this.updateDisplay();
        this.updateOrderHistoryDisplay();
    }

    // Save user data to localStorage
    saveUserData() {
        localStorage.setItem('acidicUserPoints', this.userPoints.toString());
        localStorage.setItem('acidicUserTier', this.userTier);
        localStorage.setItem('acidicOrderHistory', JSON.stringify(this.orderHistory));
    }

    // Add points from purchase
    addPointsFromPurchase(totalAmount) {
        // 1 point per R10 spent
        const pointsEarned = Math.floor(totalAmount / 10);
        this.userPoints += pointsEarned;
        this.updateTier();
        this.saveUserData();
        this.updateDisplay();
        
        return pointsEarned;
    }

    // Update tier based on points
    updateTier() {
        if (this.userPoints >= 500) {
            this.userTier = 'Gold';
        } else if (this.userPoints >= 200) {
            this.userTier = 'Silver';
        } else {
            this.userTier = 'Bronze';
        }
    }

    // Get tier benefits
    getTierBenefits() {
        const benefits = {
            'Bronze': [
                '10% off your next purchase',
                'Exclusive email updates'
            ],
            'Silver': [
                '10% off all purchases',
                'Free delivery on all orders',
                'Early access to sales'
            ],
            'Gold': [
                '10% off all purchases + free delivery',
                'Exclusive access to new collections',
                'Free express shipping',
                'Birthday gift',
                'Priority customer support'
            ]
        };
        
        return benefits[this.userTier] || benefits['Bronze'];
    }

    // Get next tier requirements
    getNextTierInfo() {
        const tierRequirements = {
            'Bronze': { next: 'Silver', pointsNeeded: 200, currentPoints: this.userPoints },
            'Silver': { next: 'Gold', pointsNeeded: 500, currentPoints: this.userPoints },
            'Gold': { next: null, pointsNeeded: 0, currentPoints: this.userPoints }
        };
        
        return tierRequirements[this.userTier];
    }

    // Calculate progress percentage
    getProgressPercentage() {
        const tierInfo = this.getNextTierInfo();
        if (!tierInfo.next) return 100; // Gold tier maxed
        
        const pointsInCurrentTier = this.userPoints;
        let lowerBound, upperBound;
        
        switch(this.userTier) {
            case 'Bronze':
                lowerBound = 0;
                upperBound = 200;
                break;
            case 'Silver':
                lowerBound = 200;
                upperBound = 500;
                break;
            default:
                return 100;
        }
        
        const pointsInRange = pointsInCurrentTier - lowerBound;
        const totalRange = upperBound - lowerBound;
        
        return Math.min(Math.round((pointsInRange / totalRange) * 100), 100);
    }

    // Add order to history
    addOrderToHistory(order) {
        const orderData = {
            id: order.id || 'ORD-' + Date.now().toString().slice(-8),
            date: new Date().toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            items: order.items || [],
            total: order.total || 0,
            status: 'Processing',
            pointsEarned: Math.floor((order.total || 0) / 10)
        };
        
        this.orderHistory.unshift(orderData);
        if (this.orderHistory.length > 10) {
            this.orderHistory = this.orderHistory.slice(0, 10); // Keep only last 10 orders
        }
        
        this.saveUserData();
        this.updateOrderHistoryDisplay();
    }

    // Update display elements
    updateDisplay() {
        // Update points display
        const userPointsElement = document.getElementById('user-points');
        if (userPointsElement) {
            userPointsElement.textContent = `${this.userPoints} Points`;
        }

        // Update tier display
        const tierInfoElement = document.getElementById('tier-info');
        if (tierInfoElement) {
            tierInfoElement.textContent = `Current Tier: ${this.userTier}`;
        }

        // Update progress bar
        const progressElement = document.getElementById('points-progress');
        if (progressElement) {
            const progress = this.getProgressPercentage();
            progressElement.style.width = `${progress}%`;
        }

        // Update current benefits
        const benefitsElement = document.getElementById('current-benefits');
        if (benefitsElement) {
            const benefits = this.getTierBenefits();
            benefitsElement.innerHTML = `<strong>Current Benefits:</strong><br>` + 
                benefits.map(benefit => `• ${benefit}`).join('<br>');
        }

        // Update tier highlights
        this.updateTierHighlights();
        
        // Update confirmation modal if open
        this.updateConfirmationModal();
    }

    // Update tier highlights
    updateTierHighlights() {
        const tiers = ['bronze-tier', 'silver-tier', 'gold-tier'];
        
        tiers.forEach(tierId => {
            const tierElement = document.getElementById(tierId);
            if (tierElement) {
                // Remove all highlights first
                tierElement.style.opacity = '0.7';
                tierElement.style.border = 'none';
                tierElement.style.transform = 'scale(1)';
                
                // Highlight current tier
                if (tierId === `${this.userTier.toLowerCase()}-tier`) {
                    tierElement.style.opacity = '1';
                    tierElement.style.border = '2px solid #f4b400';
                    tierElement.style.transform = 'scale(1.02)';
                    tierElement.style.boxShadow = '0 4px 15px rgba(244, 180, 0, 0.3)';
                }
            }
        });
    }

    // Update order history display
    updateOrderHistoryDisplay() {
        const orderHistoryList = document.getElementById('order-history-list');
        if (!orderHistoryList) return;
        
        if (this.orderHistory.length === 0) {
            orderHistoryList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No orders yet</p>';
            return;
        }
        
        orderHistoryList.innerHTML = this.orderHistory.map(order => `
            <div class="order-history-item" style="padding: 15px; border-bottom: 1px solid #eee; background: #f9f9f9; margin-bottom: 10px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="display: block; margin-bottom: 5px;">${order.id}</strong>
                        <small style="color: #666;">${order.date}</small>
                    </div>
                    <span style="background: ${order.status === 'Processing' ? '#ff9800' : '#4CAF50'}; 
                           color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                        ${order.status}
                    </span>
                </div>
                <div style="margin-top: 10px; display: flex; justify-content: space-between;">
                    <span>R${order.total}</span>
                    <span style="color: #f4b400; font-weight: bold;">+${order.pointsEarned} pts</span>
                </div>
            </div>
        `).join('');
    }

    // Update confirmation modal with rewards info
    updateConfirmationModal() {
        const pointsEarnedElement = document.getElementById('points-earned');
        const totalPointsElement = document.getElementById('total-points');
        const tierProgressElement = document.getElementById('tier-progress');
        
        if (pointsEarnedElement) {
            // This will be updated when processing payment
            // Just ensure element exists
        }
        
        if (totalPointsElement) {
            totalPointsElement.textContent = this.userPoints;
        }
        
        if (tierProgressElement) {
            const nextTier = this.getNextTierInfo();
            if (nextTier.next) {
                const pointsNeeded = nextTier.pointsNeeded - this.userPoints;
                tierProgressElement.textContent = 
                    `${pointsNeeded} points needed for ${nextTier.next} tier`;
            } else {
                tierProgressElement.textContent = 'You have reached the highest tier! 🎉';
            }
        }
    }

    // Show loyalty program
    showLoyaltyProgram() {
        this.updateDisplay();
        
        // Show the loyalty program section
        hideAllSections();
        const loyaltySection = document.getElementById('loyalty-program');
        if (loyaltySection) {
            loyaltySection.style.display = 'block';
        }
    }

    // Get user points for external use
    getUserPoints() {
        return this.userPoints;
    }

    // Update user rewards (called from payment processing)
    updateUserRewards(pointsEarned) {
        this.userPoints += pointsEarned;
        this.updateTier();
        this.saveUserData();
        this.updateDisplay();
    }

    // Redeem points for discount
    redeemPointsForDiscount(pointsToRedeem) {
        if (pointsToRedeem > this.userPoints) {
            return { success: false, message: 'Insufficient points' };
        }
        
        // Calculate discount (10 points = R1)
        const discountAmount = Math.floor(pointsToRedeem / 10);
        this.userPoints -= pointsToRedeem;
        this.saveUserData();
        this.updateDisplay();
        
        return { 
            success: true, 
            message: `R${discountAmount} discount applied!`,
            discount: discountAmount 
        };
    }
}

// ===== GLOBAL REWARDS INSTANCE =====
const rewardsSystem = new RewardsSystem();

// ===== REWARDS UI FUNCTIONS =====
function showLoyaltyProgram() {
    rewardsSystem.showLoyaltyProgram();
}

function updateUserRewards(pointsEarned) {
    rewardsSystem.updateUserRewards(pointsEarned);
}

function getUserPoints() {
    return rewardsSystem.getUserPoints();
}

function saveOrderToHistory(totalAmount, transactionId) {
    const order = {
        id: transactionId,
        total: totalAmount,
        items: [...cart]
    };
    rewardsSystem.addOrderToHistory(order);
    
    // Also add points from this purchase
    const pointsEarned = rewardsSystem.addPointsFromPurchase(totalAmount);
    return pointsEarned;
}

function updateTierProgress() {
    rewardsSystem.updateDisplay();
}

function showRedeemPointsModal() {
    // Create modal for points redemption
    const modalHTML = `
        <div id="redeem-modal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 400px;">
                <span class="close-modal" onclick="closeRedeemModal()">×</span>
                <h3>Redeem Your Points</h3>
                <p>You have <strong>${rewardsSystem.userPoints} points</strong> available.</p>
                <p>Exchange rate: <strong>10 points = R1 discount</strong></p>
                
                <div style="margin: 20px 0;">
                    <label for="redeem-points">Points to redeem:</label>
                    <input type="number" id="redeem-points" min="10" max="${rewardsSystem.userPoints}" 
                           step="10" value="100" style="width: 100%; padding: 10px; margin-top: 5px;">
                    <small style="color: #666;">Minimum: 10 points</small>
                </div>
                
                <div id="redeem-result" style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; display: none;"></div>
                
                <button onclick="redeemPoints()" style="width: 100%; padding: 12px; background: #f4b400; color: #000; 
                        border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Redeem Points
                </button>
                
                <button onclick="closeRedeemModal()" style="width: 100%; padding: 12px; background: #666; color: white; 
                        border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('redeem-modal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
}

function closeRedeemModal() {
    const modal = document.getElementById('redeem-modal');
    if (modal) modal.remove();
}

function redeemPoints() {
    const pointsInput = document.getElementById('redeem-points');
    const pointsToRedeem = parseInt(pointsInput.value);
    const resultElement = document.getElementById('redeem-result');
    
    if (!pointsToRedeem || pointsToRedeem < 10) {
        resultElement.innerHTML = '<span style="color: #ff4444;">Minimum 10 points required</span>';
        resultElement.style.display = 'block';
        return;
    }
    
    const result = rewardsSystem.redeemPointsForDiscount(pointsToRedeem);
    
    resultElement.innerHTML = result.success ? 
        `<span style="color: #4CAF50;">✓ ${result.message}</span>` :
        `<span style="color: #ff4444;">✗ ${result.message}</span>`;
    
    resultElement.style.display = 'block';
    
    if (result.success) {
        // Update cart total with discount
        updateCartWithDiscount(result.discount);
        setTimeout(() => {
            closeRedeemModal();
            // Show success message
            showToastMessage(`R${result.discount} discount applied! ${pointsToRedeem} points redeemed.`);
        }, 1500);
    }
}

function updateCartWithDiscount(discountAmount) {
    // This function should update the cart total in the UI
    // You'll need to implement this based on your cart system
    console.log(`Discount of R${discountAmount} applied to cart`);
    // Example: Update cart total display
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        const currentTotal = parseFloat(cartTotalElement.textContent.replace('R', ''));
        const newTotal = Math.max(0, currentTotal - discountAmount);
        cartTotalElement.textContent = `R${newTotal}`;
    }
}

function showToastMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize rewards system
    console.log('Rewards system initialized');
    
    // Add redeem button to loyalty program if it doesn't exist
    setTimeout(() => {
        const loyaltyContainer = document.querySelector('.loyalty-container');
        if (loyaltyContainer && !document.getElementById('redeem-points-btn')) {
            const redeemButton = document.createElement('button');
            redeemButton.id = 'redeem-points-btn';
            redeemButton.textContent = 'Redeem Points for Discount';
            redeemButton.style.cssText = `
                background: #f4b400;
                color: #000;
                border: none;
                padding: 12px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
                width: 100%;
            `;
            redeemButton.onclick = showRedeemPointsModal;
            
            const pointsDisplay = document.querySelector('.points-display');
            if (pointsDisplay) {
                pointsDisplay.appendChild(redeemButton);
            }
        }
    }, 1000);
});

// ===== GLOBAL EXPORTS =====
window.showLoyaltyProgram = showLoyaltyProgram;
window.updateUserRewards = updateUserRewards;
window.getUserPoints = getUserPoints;
window.saveOrderToHistory = saveOrderToHistory;
window.updateTierProgress = updateTierProgress;