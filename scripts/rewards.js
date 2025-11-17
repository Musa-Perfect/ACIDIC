// === ENHANCED USER REWARDS SYSTEM ===
// Enhanced user structure with rewards tracking
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
    };
};

// Reward tiers configuration
const rewardTiers = {
    Bronze: {
        threshold: 100,
        discount: 0.1,
        freeDelivery: false,
        exclusiveAccess: false,
    },
    Silver: {
        threshold: 200,
        discount: 0.1,
        freeDelivery: true,
        exclusiveAccess: false,
    },
    Gold: {
        threshold: 500,
        discount: 0.1,
        freeDelivery: true,
        exclusiveAccess: true,
    },
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

    if (progressBar && tierInfo) {
        const nextTier = currentUser.rewardTier === "Bronze" ? "Silver" : currentUser.rewardTier === "Silver" ? "Gold" : null;

        if (nextTier) {
            const nextThreshold = rewardTiers[nextTier].threshold;
            const progressPercentage = Math.min((currentUser.points / nextThreshold) * 100, 100);
            progressBar.style.width = `${progressPercentage}%`;
            tierInfo.textContent = `${nextThreshold - currentUser.points} points to ${nextTier} Tier`;
        } else {
            progressBar.style.width = "100%";
            tierInfo.textContent = "Maximum tier reached!";
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

    // Update tier display
    const tiers = ["bronze", "silver", "gold"];
    tiers.forEach((tier) => {
        const tierElement = document.getElementById(`${tier}-tier`);
        if (tierElement) {
            tierElement.classList.remove("active-tier");
            if (tier.toLowerCase() === currentUser.rewardTier.toLowerCase()) {
                tierElement.classList.add("active-tier");
            }
        }
    });

    // Display order history
    displayOrderHistory();
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