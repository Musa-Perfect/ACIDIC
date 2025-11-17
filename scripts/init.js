// Initialize cart from localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('acidicCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log("Loaded cart from storage:", cart);
            updateCart();
        } catch (error) {
            console.error("Error loading cart from storage:", error);
            cart = [];
        }
    } else {
        cart = [];
    }
}

// Update your main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCart(); // Add this line
    showCategory("tshirts");
    updateAuthLink();
    updateCartCount();
});