// ===== SECRET ADMIN ACCESS SYSTEM =====

// Method 1: Secret Key Combination
let secretKeySequence = [];
const adminSecretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; // Konami code

document.addEventListener('keydown', function(e) {
    secretKeySequence.push(e.key);
    
    // Keep only last 10 keys
    if (secretKeySequence.length > 10) {
        secretKeySequence.shift();
    }
    
    // Check if sequence matches
    if (JSON.stringify(secretKeySequence) === JSON.stringify(adminSecretCode)) {
        showAdminAccessPanel();
        secretKeySequence = []; // Reset
    }
});

// Method 2: Hidden Click Pattern
let clickPattern = [];
let lastClickTime = 0;
const clickPatternTimeout = 2000; // 2 seconds
const adminClickPattern = [3, 1, 4]; // Secret pattern

document.addEventListener('click', function(e) {
    const currentTime = Date.now();
    
    // Reset if too much time has passed
    if (currentTime - lastClickTime > clickPatternTimeout) {
        clickPattern = [];
    }
    
    clickPattern.push(1);
    lastClickTime = currentTime;
    
    // Check pattern
    if (JSON.stringify(clickPattern) === JSON.stringify(adminClickPattern)) {
        showAdminAccessPanel();
        clickPattern = [];
    }
});

// Method 3: URL Parameter Access
function checkURLForAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        // Only allow from your domain or specific IP
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            showAdminLoginPrompt();
        }
    }
}

// Method 4: Secret Admin Login Page
function createHiddenAdminAccess() {
    // Add a hidden div that appears with secret code
    const hiddenAccessDiv = document.createElement('div');
    hiddenAccessDiv.id = 'secret-admin-access';
    hiddenAccessDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    hiddenAccessDiv.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 400px;">
            <h2><i class="fas fa-crown"></i> Admin Access</h2>
            <p>Enter admin access code:</p>
            <input type="password" id="admin-secret-code" 
                   style="width: 100%; padding: 12px; margin: 15px 0; 
                          border: 2px solid #ddd; border-radius: 5px;"
                   placeholder="Enter secret code">
            <div style="display: flex; gap: 10px;">
                <button onclick="checkAdminCode()" 
                        style="flex: 1; padding: 12px; background: #000; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    Access Admin
                </button>
                <button onclick="hideAdminAccess()" 
                        style="flex: 1; padding: 12px; background: #666; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    Cancel
                </button>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                <i class="fas fa-shield-alt"></i> Secure Access
            </p>
        </div>
    `;
    
    document.body.appendChild(hiddenAccessDiv);
}

// Show admin access panel
function showAdminAccessPanel() {
    let accessDiv = document.getElementById('secret-admin-access');
    
    if (!accessDiv) {
        createHiddenAdminAccess();
        accessDiv = document.getElementById('secret-admin-access');
    }
    
    accessDiv.style.display = 'flex';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('admin-secret-code').focus();
    }, 100);
}

// Hide admin access panel
function hideAdminAccess() {
    const accessDiv = document.getElementById('secret-admin-access');
    if (accessDiv) {
        accessDiv.style.display = 'none';
        // Clear input
        document.getElementById('admin-secret-code').value = '';
    }
}

// Check admin code
function checkAdminCode() {
    const code = document.getElementById('admin-secret-code').value;
    
    // Change this to your secret code
    const validCodes = [
        'ACIDIC2025',
        'ADMIN123',
        'LETMEIN'
    ];
    
    if (validCodes.includes(code.toUpperCase())) {
        // Redirect to admin page
        window.location.href = 'admin.html';
    } else {
        alert('Invalid access code');
        document.getElementById('admin-secret-code').value = '';
        document.getElementById('admin-secret-code').focus();
    }
}

// Method 5: DevTools Detection (Advanced)
function detectDevTools() {
    const devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (!(heightThreshold && widthThreshold) && 
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || 
         widthThreshold || heightThreshold)) {
        
        if (!devtools.open) {
            devtools.open = true;
            
            // Only show admin access if DevTools is open AND they type "admin"
            document.addEventListener('keydown', function(e) {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                    (e.ctrlKey && e.shiftKey && e.key === 'J') || 
                    (e.ctrlKey && e.key === 'U')) {
                    
                    setTimeout(() => {
                        const adminPrompt = prompt('DevTools detected. Enter admin code:');
                        if (adminPrompt === 'ACIDIC_ADMIN') {
                            window.location.href = 'admin.html';
                        }
                    }, 500);
                }
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check URL for admin access
    checkURLForAdminAccess();
    
    // Create hidden access system
    createHiddenAdminAccess();
    
    // Set up devtools detection
    setInterval(detectDevTools, 1000);
    
    // Add escape key to close admin panel
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAdminAccess();
        }
    });
});

// Add this CSS for the secret access
const secretAccessStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = secretAccessStyles;
document.head.appendChild(styleSheet);