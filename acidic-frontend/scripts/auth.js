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

// === AUTHENTICATION WITH FIREBASE ===
async function signUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        await firebaseAuth.signUp(email, password, name);
    } catch (error) {
        // Error is already handled in FirebaseAuth class
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        await firebaseAuth.login(email, password);
    } catch (error) {
        // Error is already handled in FirebaseAuth class
    }
}

function showAuthMessage(message, type = 'info') {
    const authMessage = document.createElement('div');
    authMessage.className = `auth-message ${type}`;
    authMessage.textContent = message;
    authMessage.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
    `;
    
    if (type === 'error') {
        authMessage.style.background = '#ffebee';
        authMessage.style.color = '#c62828';
        authMessage.style.border = '1px solid #ffcdd2';
    } else if (type === 'success') {
        authMessage.style.background = '#e8f5e9';
        authMessage.style.color = '#2e7d32';
        authMessage.style.border = '1px solid #c8e6c9';
    } else {
        authMessage.style.background = '#e3f2fd';
        authMessage.style.color = '#1565c0';
        authMessage.style.border = '1px solid #bbdefb';
    }

    // Remove existing messages
    document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
    
    // Add to signup form
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.prepend(authMessage);
    }
}

// Social login functions
async function loginWithGoogle() {
    try {
        await firebaseAuth.socialLogin('google');
    } catch (error) {
        // Error is already handled
    }
}

async function loginWithFacebook() {
    try {
        await firebaseAuth.socialLogin('facebook');
    } catch (error) {
        // Error is already handled
    }
}

// Update social buttons
document.addEventListener('DOMContentLoaded', function() {
    // Update Google login buttons
    document.querySelectorAll('.social-button.google').forEach(button => {
        button.onclick = loginWithGoogle;
    });
    
    // Update Facebook login buttons
    document.querySelectorAll('.social-button.facebook').forEach(button => {
        button.onclick = loginWithFacebook;
    });
    
    // Forgot password
    const forgotPasswordLink = document.querySelector('.forgot-password a');
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = function(e) {
            e.preventDefault();
            const email = prompt('Enter your email to reset password:');
            if (email) {
                firebaseAuth.resetPassword(email);
            }
        };
    }
});

// Make functions global
window.signUp = signUp;
window.login = login;
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;