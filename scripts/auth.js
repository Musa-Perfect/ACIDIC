// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("ACIDIC Clothing - Initializing Application");
    
    // Initialize core functionality
    if (typeof showCategory === 'function') {
        showCategory("tshirts");
    }
    
    if (typeof initializeApp === 'function') {
        initializeApp();
    }
    
    // Initialize slideshow
    if (typeof resetSlideInterval === 'function') {
        resetSlideInterval();
    }
    
    console.log("ACIDIC Clothing - Ready!");
});

// === USER AUTHENTICATION ===
let users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Update auth link based on login status
function updateAuthLink() {
    const authLink = document.getElementById("auth-link");
    if (currentUser) {
        authLink.textContent = "Logout";
        authLink.onclick = logout;
    } else {
        authLink.textContent = "Sign Up";
        authLink.onclick = showSignUp;
    }
}

// Sign up function
function signUp() {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check if user already exists
    if (users.find((user) => user.email === email)) {
        alert("An account with this email already exists.");
        return;
    }

    // Create new user with rewards
    const newUser = createUserWithRewards({
        id: Date.now(),
        name,
        email,
        password,
        joined: new Date().toISOString(),
    });

    users.push(newUser);
    localStorage.setItem("acidicUsers", JSON.stringify(users));

    alert("Account created successfully! Welcome to ACIDIC Rewards!");
    showLogin();
}

// Login function
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const user = users.find(
        (u) => u.email === email && u.password === password
    );

    if (user) {
        // Ensure user has rewards structure
        if (!user.points) {
            currentUser = createUserWithRewards(user);
            // Update stored user data
            const users = JSON.parse(localStorage.getItem("acidicUsers")) || [];
            const userIndex = users.findIndex((u) => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem("acidicUsers", JSON.stringify(users));
            }
        } else {
            currentUser = user;
        }

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateAuthLink();
        showMainContent();

        // Display rewards if available
        if (currentUser.points > 0) {
            displayUserRewards();
        }

        alert(`Welcome back, ${user.name}!`);
    } else {
        alert("Invalid email or password.");
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    updateAuthLink();
    showMainContent();
    alert("You have been logged out.");
}

// Show login form
function showLogin() {
    hideAllSections();
    document.getElementById("login-section").style.display = "flex";
}

function showSignUp() {
    hideAllSections();
    document.getElementById("signup-section").style.display = "flex";
}

function showMainContent() {
    hideAllSections();
    document.getElementById("main-content").style.display = "block";
    document.getElementById("product-section").style.display = "grid";
}