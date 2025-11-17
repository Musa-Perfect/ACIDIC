// === ENHANCED USER REWARDS SYSTEM ===
// Enhanced user structure with rewards tracking
// Enhanced user structure with reward claiming
const createUserWithRewards = (userData) => {
    return {
        ...userData,
        points: 0,
        totalSpent: 0,
        orders: [],
        rewardTier: "Bronze",
        benefits: {
            discount: 0,
            freeDelivery: false,
            exclusiveAccess: false,
        },
        claimedRewards: {
            bronze: false,
            silver: false,
            gold: false
        },
        rewardHistory: []
    };
};

// Reward tiers configuration
// Enhanced reward tiers with claiming system
const rewardTiers = {
    Bronze: {
        threshold: 100,
        discount: 0.1,
        freeDelivery: false,
        exclusiveAccess: false,
        claimed: false,
        reward: "10% Off Next Purchase"
    },
    Silver: {
        threshold: 200,
        discount: 0.1,
        freeDelivery: true,
        exclusiveAccess: false,
        claimed: false,
        reward: "10% Off + Free Delivery"
    },
    Gold: {
        threshold: 500,
        discount: 0.1,
        freeDelivery: true,
        exclusiveAccess: true,
        claimed: false,
        reward: "10% Off + Free Delivery + Exclusive Drops"
    }
};

// === ORDER NUMBER GENERATOR ===
function generateOrderNumber() {
    const prefix = "ACD"; // your brand prefix
    const date = new Date();
    const yyyy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000); // random 4 digits
    return `${prefix}${yyyy}${mm}${dd}-${rand}`;
}

// Update user rewards after purchase
function updateUserRewards(orderTotal) {
    if (!currentUser) return;

    // Calculate points earned (1 point per R10 spent)
    const pointsEarned = Math.floor(orderTotal / 10);

    // Update user data
    currentUser.points += pointsEarned;
    currentUser.totalSpent += orderTotal;

    const orderNumber = generateOrderNumber();
    currentUser.orders.push({
        id: Date.now(),
        orderNumber: orderNumber,
        date: new Date().toISOString(),
        total: orderTotal,
        pointsEarned: pointsEarned,
        items: [...cart],
    });

    // Check and update reward tier
    updateRewardTier();

    // Save updated user data
    const users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem("acidicUsers", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    return pointsEarned;
}
// Enhanced updateUserRewards function with points display
function updateUserRewards(orderTotal) {
    if (!currentUser) return { pointsEarned: 0, orderNumber: '' };

    // Calculate points earned (1 point per R10 spent)
    const pointsEarned = Math.floor(orderTotal / 10);

    // Update user data
    currentUser.points += pointsEarned;
    currentUser.totalSpent += orderTotal;

    const orderNumber = generateOrderNumber();
    currentUser.orders.push({
        id: Date.now(),
        orderNumber: orderNumber,
        date: new Date().toISOString(),
        total: orderTotal,
        pointsEarned: pointsEarned,
        items: [...cart]
    });

    // Check and update reward tier
    updateRewardTier();

    // Save updated user data
    const users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem("acidicUsers", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    // Show points earned notification
    showPointsEarnedNotification(pointsEarned, currentUser.points);

    return { pointsEarned, orderNumber };
}

// Function to show points earned after purchase
function showPointsEarnedNotification(pointsEarned, totalPoints) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
        <div class="points-notification-content">
            <div class="points-icon">🎉</div>
            <div class="points-details">
                <h4>Points Earned!</h4>
                <p>You earned <strong>+${pointsEarned} points</strong> from your purchase</p>
                <p class="total-points">Total: ${totalPoints} points</p>
            </div>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Update user's reward tier based on points
function updateRewardTier() {
    if (!currentUser) return;

    let newTier = "Bronze";

    if (currentUser.points >= rewardTiers.Gold.threshold) {
        newTier = "Gold";
    } else if (currentUser.points >= rewardTiers.Silver.threshold) {
        newTier = "Silver";
    }

    if (currentUser.rewardTier !== newTier) {
        currentUser.rewardTier = newTier;
        currentUser.benefits = { ...rewardTiers[newTier] };

        // Show tier upgrade notification
        if (newTier !== "Bronze") {
            showTierUpgradeNotification(newTier);
        }
    }
}

// Show tier upgrade notification
function showTierUpgradeNotification(newTier) {
    const benefits = rewardTiers[newTier];
    let benefitsText = `🎉 Congratulations! You've reached ${newTier} Tier! Benefits:`;

    if (benefits.discount > 0) {
        benefitsText += `\n• ${benefits.discount * 100}% discount on all purchases`;
    }
    if (benefits.freeDelivery) {
        benefitsText += `\n• Free delivery on all orders`;
    }
    if (benefits.exclusiveAccess) {
        benefitsText += `\n• Exclusive access to limited edition drops`;
    }

    alert(benefitsText);
}

// Apply rewards benefits to order
function applyRewardsBenefits(orderTotal) {
    if (!currentUser) return orderTotal;

    const benefits = currentUser.benefits;
    let finalTotal = orderTotal;

    // Apply discount
    if (benefits.discount > 0) {
        const discountAmount = orderTotal * benefits.discount;
        finalTotal -= discountAmount;
    }

    // Apply free delivery
    if (benefits.freeDelivery && DELIVERY_FEE > 0) {
        finalTotal -= DELIVERY_FEE;
    }

    return Math.max(0, finalTotal); // Ensure total doesn't go negative
}

// === ENHANCED LOYALTY DISPLAY ===
function displayUserRewards() {
    if (!currentUser) return;

    const pointsDisplay = document.getElementById("user-points");
    const progressBar = document.getElementById("points-progress");
    const tierInfo = document.getElementById("tier-info");
    const benefitsDisplay = document.getElementById("current-benefits");

    if (pointsDisplay) {
        pointsDisplay.textContent = `${currentUser.points} Points`;
        pointsDisplay.classList.add("points-animation");
        setTimeout(() => pointsDisplay.classList.remove("points-animation"), 500);
    }

    // Update progress bar based on current tier
    if (progressBar && tierInfo) {
        const nextTier = getNextTier();
        
        if (nextTier) {
            const nextThreshold = rewardTiers[nextTier].threshold;
            const progressPercentage = Math.min((currentUser.points / nextThreshold) * 100, 100);
            progressBar.style.width = `${progressPercentage}%`;
            
            // Check if user can claim the next reward
            const canClaim = canClaimReward(nextTier);
            if (canClaim) {
                tierInfo.innerHTML = `🎁 <strong>Claim your ${nextTier} Reward!</strong>`;
                tierInfo.style.color = "#f4b400";
                tierInfo.style.fontWeight = "bold";
            } else {
                const pointsNeeded = nextThreshold - currentUser.points;
                tierInfo.textContent = `${pointsNeeded} points to ${nextTier} Tier`;
                tierInfo.style.color = "";
                tierInfo.style.fontWeight = "";
            }
        } else {
            // User has reached the highest tier
            progressBar.style.width = "100%";
            tierInfo.textContent = "Maximum tier reached! 🎉";
            tierInfo.style.color = "#2ecc71";
            tierInfo.style.fontWeight = "bold";
        }
    }

    if (benefitsDisplay) {
        const benefits = currentUser.benefits;
        let benefitsHTML = "";

        if (benefits.discount > 0) {
            benefitsHTML += `<span class="benefits-badge">${benefits.discount * 100}% OFF</span>`;
        }
        if (benefits.freeDelivery) {
            benefitsHTML += `<span class="benefits-badge">FREE DELIVERY</span>`;
        }
        if (benefits.exclusiveAccess) {
            benefitsHTML += `<span class="benefits-badge">EXCLUSIVE</span>`;
        }

        benefitsDisplay.innerHTML = benefitsHTML || "No active benefits";
    }

    // Update tier display with original glow functionality
    updateTierDisplay();
    
    // Display order history and reward history
    displayOrderHistory();
    displayRewardHistory();
}

// Helper function to get next tier
function getNextTier() {
    if (!currentUser) return null;
    
    const tiers = ["Bronze", "Silver", "Gold"];
    const currentTierIndex = tiers.indexOf(currentUser.rewardTier);
    
    if (currentTierIndex < tiers.length - 1) {
        return tiers[currentTierIndex + 1];
    }
    
    return null; // Already at highest tier
}

// Update tier display with claim functionality
function updateTierDisplay() {
    const tiers = ["bronze", "silver", "gold"];
    
    tiers.forEach((tier) => {
        const tierElement = document.getElementById(`${tier}-tier`);
        if (tierElement) {
            tierElement.classList.remove("active-tier", "claimable-tier", "claimed-tier");
            
            const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
            const tierData = rewardTiers[tierName];
            const isClaimed = currentUser.claimedRewards[tier];
            const canClaim = canClaimReward(tierName);
            
            let tierHTML = `
                <h4>${tierName} (${tierData.threshold} pts)</h4>
                <p>${tierData.reward}</p>
            `;
            
            if (isClaimed) {
                tierElement.classList.add("claimed-tier");
                tierHTML += `<div class="reward-status claimed">✅ Claimed</div>`;
            } else if (canClaim) {
                tierElement.classList.add("claimable-tier");
                tierHTML += `
                    <button class="claim-reward-btn" onclick="claimReward('${tierName}')">
                        🎁 Claim Reward
                    </button>
                `;
            } else {
                tierHTML += `<div class="reward-status locked">🔒 ${currentUser.points >= tierData.threshold ? 'Reached' : 'Locked'}</div>`;
            }
            
            tierElement.innerHTML = tierHTML;
            
            // ORIGINAL GLOW FUNCTIONALITY - Add active-tier class based on points
            if (currentUser.points >= tierData.threshold) {
                tierElement.classList.add("active-tier");
            }
        }
    });
}

// === ORDER HISTORY DISPLAY ===
function displayOrderHistory() {
    if (!currentUser) return;

    const orderHistoryList = document.getElementById("order-history-list");
    if (!orderHistoryList) return;

    if (currentUser.orders && currentUser.orders.length > 0) {
        orderHistoryList.innerHTML = "";

        // Show last 5 orders
        const recentOrders = currentUser.orders.slice(-5).reverse();

        recentOrders.forEach((order) => {
            const orderDate = new Date(order.date).toLocaleDateString();
            const orderElement = document.createElement("div");
            orderElement.className = "order-item";
            orderElement.style.cssText = "display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;";
            orderElement.innerHTML = `
                <div>
                    <strong>Order #${order.id.toString().slice(-6)}</strong>
                    <div style="font-size: 12px; color: #666;">${orderDate}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #999;">${order.orderNumber || "N/A"}</div>
                    <div>R${order.total}</div>
                    <div style="font-size: 12px; color: #f4b400;">+${order.pointsEarned} pts</div>
                </div>
            `;
            orderHistoryList.appendChild(orderElement);
        });
    } else {
        orderHistoryList.innerHTML = '<p style="text-align: center; color: #666;">No orders yet</p>';
    }
}

// Check if user can claim a reward
function canClaimReward(tier) {
    if (!currentUser) return false;
    
    // Check if user has enough points and hasn't claimed this reward yet
    const hasPoints = currentUser.points >= rewardTiers[tier].threshold;
    const notClaimed = !currentUser.claimedRewards[tier.toLowerCase()];
    
    return hasPoints && notClaimed;
}

// Claim a reward
function claimReward(tier) {
    if (!currentUser || !canClaimReward(tier)) {
        alert(`You cannot claim the ${tier} reward yet. Keep earning points!`);
        return false;
    }
    
    // Mark reward as claimed
    currentUser.claimedRewards[tier.toLowerCase()] = true;
    
    // Add to reward history
    currentUser.rewardHistory.push({
        tier: tier,
        reward: rewardTiers[tier].reward,
        pointsUsed: rewardTiers[tier].threshold,
        claimedAt: new Date().toISOString(),
        claimId: `RW-${Date.now()}`
    });
    
    // Apply tier benefits immediately
    updateRewardTier();
    
    // Save user data
    const users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem("acidicUsers", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    
    // Show success message
    const rewardMessage = getRewardMessage(tier);
    alert(`🎉 Congratulations! You've claimed your ${tier} Reward!\n\n${rewardMessage}`);
    
    // Update display
    displayUserRewards();
    
    // Check if all rewards are claimed for reset
    checkForReset();
    
    return true;
}

// Get reward message for each tier
function getRewardMessage(tier) {
    const messages = {
        Bronze: "✅ 10% discount applied to your next purchase!",
        Silver: "✅ 10% discount + Free delivery unlocked!",
        Gold: "✅ 10% discount + Free delivery + Exclusive drops access!"
    };
    return messages[tier] || "Reward claimed successfully!";
}

// Check if all rewards are claimed and reset if needed
function checkForReset() {
    if (!currentUser) return;
    
    const allClaimed = 
        currentUser.claimedRewards.bronze &&
        currentUser.claimedRewards.silver &&
        currentUser.claimedRewards.gold;
    
    if (allClaimed) {
        // Reset claimed rewards but keep benefits until next purchase
        currentUser.claimedRewards = {
            bronze: false,
            silver: false,
            gold: false
        };
        
        // Add reset notification to history
        currentUser.rewardHistory.push({
            type: "reset",
            message: "All rewards claimed! Progress reset for new rewards.",
            resetAt: new Date().toISOString()
        });
        
        // Save changes
        const users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
        const userIndex = users.findIndex((u) => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem("acidicUsers", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
        
        // Show reset message
        setTimeout(() => {
            alert("🌟 Amazing! You've claimed all available rewards!\n\nYour progress has been reset. Continue shopping to earn new rewards!");
        }, 1000);
    }
}

// Get next reward progress
function getNextRewardProgress() {
    if (!currentUser) return null;
    
    const tiers = ["Bronze", "Silver", "Gold"];
    
    for (let tier of tiers) {
        if (!currentUser.claimedRewards[tier.toLowerCase()]) {
            return {
                tier: tier,
                threshold: rewardTiers[tier].threshold,
                currentPoints: currentUser.points,
                needed: Math.max(0, rewardTiers[tier].threshold - currentUser.points),
                canClaim: canClaimReward(tier)
            };
        }
    }
    
    return null; // All rewards claimed
}

// Display reward history
function displayRewardHistory() {
    if (!currentUser) return;

    const rewardHistoryList = document.getElementById("reward-history-list");
    if (!rewardHistoryList) return;

    if (currentUser.rewardHistory && currentUser.rewardHistory.length > 0) {
        rewardHistoryList.innerHTML = "";

        // Show recent rewards (newest first)
        const recentRewards = [...currentUser.rewardHistory].reverse();

        recentRewards.forEach((reward, index) => {
            const rewardElement = document.createElement("div");
            rewardElement.className = "reward-history-item";
            
            if (reward.type === "reset") {
                rewardElement.innerHTML = `
                    <div style="text-align: center; width: 100%; color: #f4b400; font-weight: bold;">
                        🔄 ${reward.message}
                    </div>
                `;
            } else {
                const claimDate = new Date(reward.claimedAt).toLocaleDateString();
                rewardElement.innerHTML = `
                    <div class="reward-history-tier">${reward.tier}</div>
                    <div class="reward-history-details">
                        <div class="reward-history-reward">${reward.reward}</div>
                        <div class="reward-history-date">Claimed: ${claimDate}</div>
                    </div>
                    <div class="reward-history-points">-${reward.pointsUsed} pts</div>
                `;
            }
            
            rewardHistoryList.appendChild(rewardElement);
        });
    } else {
        rewardHistoryList.innerHTML = '<p style="text-align: center; color: #666">No rewards claimed yet</p>';
    }
}

// Make reward functions globally available
window.claimReward = claimReward;
window.canClaimReward = canClaimReward;
window.displayRewardHistory = displayRewardHistory;

// Make notification function available globally
window.showPointsEarnedNotification = showPointsEarnedNotification;