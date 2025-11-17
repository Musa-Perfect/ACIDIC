class DataManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.cart = this.loadCart();
    }

    // User management
    loadUsers() {
        return JSON.parse(localStorage.getItem('acidicUsers')) || [];
    }

    loadCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    saveUsers() {
        localStorage.setItem('acidicUsers', JSON.stringify(this.users));
    }

    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Cart management
    loadCart() {
        return JSON.parse(localStorage.getItem('acidicCart')) || [];
    }

    saveCart() {
        localStorage.setItem('acidicCart', JSON.stringify(this.cart));
    }

    // User operations
    createUser(userData) {
        const user = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            joined: new Date().toISOString(),
            points: 0,
            totalSpent: 0,
            orders: [],
            rewardTier: "Bronze",
            benefits: {
                discount: 0,
                freeDelivery: false,
                exclusiveAccess: false
            },
            claimedRewards: {
                bronze: false,
                silver: false,
                gold: false
            },
            rewardHistory: []
        };
        
        this.users.push(user);
        this.saveUsers();
        return user;
    }

    findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    loginUser(email, password) {
        const user = this.findUserByEmail(email);
        if (user && user.password === password) {
            this.currentUser = user;
            this.saveCurrentUser();
            return user;
        }
        return null;
    }

    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Order operations
    createOrder(orderData) {
        if (!this.currentUser) return null;

        const order = {
            id: Date.now(),
            orderNumber: this.generateOrderNumber(),
            date: new Date().toISOString(),
            total: orderData.total,
            pointsEarned: Math.floor(orderData.total / 10),
            items: [...orderData.items]
        };

        // Update user data
        this.currentUser.orders.push(order);
        this.currentUser.points += order.pointsEarned;
        this.currentUser.totalSpent += order.total;

        // Update reward tier
        this.updateRewardTier();

        // Save changes
        this.saveUsers();
        this.saveCurrentUser();

        return order;
    }

    generateOrderNumber() {
        const date = new Date();
        const yyyy = date.getFullYear().toString().slice(-2);
        const mm = (date.getMonth() + 1).toString().padStart(2, "0");
        const dd = date.getDate().toString().padStart(2, "0");
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `ACD${yyyy}${mm}${dd}-${rand}`;
    }

    updateRewardTier() {
        if (!this.currentUser) return;

        let newTier = "Bronze";
        if (this.currentUser.points >= 500) newTier = "Gold";
        else if (this.currentUser.points >= 200) newTier = "Silver";

        if (this.currentUser.rewardTier !== newTier) {
            this.currentUser.rewardTier = newTier;
            this.currentUser.benefits = { ...rewardTiers[newTier] };
        }
    }
}

// Initialize data manager
const dataManager = new DataManager();

// Make available globally
window.dataManager = dataManager;
window.users = dataManager.users;
window.currentUser = dataManager.currentUser;
window.cart = dataManager.cart;