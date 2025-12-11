// ===== ADMIN AUTHENTICATION SYSTEM =====

class AdminAuth {
    constructor() {
        this.adminSessionKey = 'acidic_admin_session';
        this.adminCredentialsKey = 'acidic_admin_credentials';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTimeout = 5 * 60 * 1000; // 5 minutes before timeout
        this.timeoutWarningShown = false;
        
        this.initializeAdminCredentials();
        this.checkAuthStatus();
        this.setupAutoLogout();
    }
    
    // Initialize default admin credentials (change these!)
    initializeAdminCredentials() {
        if (!localStorage.getItem(this.adminCredentialsKey)) {
            const defaultCredentials = {
                username: 'admin',
                // In production, this should be hashed!
                password: 'AcidicAdmin2025!',
                role: 'superadmin',
                lastPasswordChange: new Date().toISOString()
            };
            localStorage.setItem(this.adminCredentialsKey, JSON.stringify(defaultCredentials));
        }
    }
    
    // Check authentication status
    checkAuthStatus() {
        const session = this.getSession();
        
        if (session && this.isSessionValid(session)) {
            this.showAdminDashboard();
        } else {
            this.showLogin();
            // Clear invalid session
            if (session) {
                this.clearSession();
            }
        }
    }
    
    // Get current session
    getSession() {
        return JSON.parse(localStorage.getItem(this.adminSessionKey));
    }
    
    // Check if session is valid
    isSessionValid(session) {
        if (!session || !session.loggedInAt) return false;
        
        const sessionAge = Date.now() - new Date(session.loggedInAt).getTime();
        return sessionAge < this.sessionTimeout;
    }
    
    // Login function
    async login(username, password) {
        const credentials = JSON.parse(localStorage.getItem(this.adminCredentialsKey));
        
        // Basic validation
        if (!username || !password) {
            throw new Error('Please enter both username and password');
        }
        
        // Check credentials
        if (username === credentials.username && password === credentials.password) {
            // Create session
            const session = {
                username: username,
                role: credentials.role,
                loggedInAt: new Date().toISOString(),
                lastActivity: Date.now(),
                ip: await this.getClientIP(),
                userAgent: navigator.userAgent
            };
            
            localStorage.setItem(this.adminSessionKey, JSON.stringify(session));
            
            // Log login activity
            this.logActivity('LOGIN', `Admin ${username} logged in`);
            
            return true;
        } else {
            throw new Error('Invalid username or password');
        }
    }
    
    // Logout function
    logout(manual = true) {
        const session = this.getSession();
        
        if (session) {
            // Log logout activity
            this.logActivity('LOGOUT', 
                `Admin ${session.username} ${manual ? 'manually logged out' : 'auto-logged out due to inactivity'}`
            );
        }
        
        this.clearSession();
        this.showLogin();
        
        if (manual) {
            alert('You have been logged out successfully.');
        }
    }
    
    // Clear session
    clearSession() {
        localStorage.removeItem(this.adminSessionKey);
        this.hideSessionWarning();
    }
    
    // Update last activity
    updateActivity() {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            localStorage.setItem(this.adminSessionKey, JSON.stringify(session));
        }
    }
    
    // Setup auto logout on inactivity
    setupAutoLogout() {
        // Update activity on user interaction
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
                this.hideSessionWarning();
            });
        });
        
        // Check for inactivity every minute
        setInterval(() => {
            this.checkInactivity();
        }, 60 * 1000);
    }
    
    // Check for inactivity
    checkInactivity() {
        const session = this.getSession();
        
        if (!session || !session.loggedInAt) return;
        
        const sessionAge = Date.now() - new Date(session.loggedInAt).getTime();
        const timeLeft = this.sessionTimeout - sessionAge;
        
        // Show warning 5 minutes before timeout
        if (timeLeft <= this.warningTimeout && timeLeft > 0 && !this.timeoutWarningShown) {
            this.showSessionWarning(timeLeft);
        }
        
        // Auto logout if session expired
        if (timeLeft <= 0) {
            this.logout(false);
        }
    }
    
    // Show session timeout warning
    showSessionWarning(timeLeft) {
        this.timeoutWarningShown = true;
        
        const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
        
        // Remove existing warning
        this.hideSessionWarning();
        
        // Create warning element
        const warning = document.createElement('div');
        warning.className = 'session-warning';
        warning.id = 'session-warning';
        warning.innerHTML = `
            <i class="fas fa-clock"></i>
            <div>
                <strong>Session Timeout Warning</strong>
                <p>Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.</p>
            </div>
            <button onclick="adminAuth.extendSession()">Stay Logged In</button>
        `;
        
        document.body.appendChild(warning);
    }
    
    // Hide session warning
    hideSessionWarning() {
        const warning = document.getElementById('session-warning');
        if (warning) {
            warning.remove();
            this.timeoutWarningShown = false;
        }
    }
    
    // Extend session
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.loggedInAt = new Date().toISOString();
            localStorage.setItem(this.adminSessionKey, JSON.stringify(session));
            this.logActivity('SESSION_EXTENDED', 'Session extended by user');
        }
        this.hideSessionWarning();
    }
    
    // Get client IP (simplified)
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    // Log admin activities
    logActivity(type, description) {
        const activities = JSON.parse(localStorage.getItem('acidic_admin_activities')) || [];
        
        const activity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            username: this.getSession()?.username || 'system'
        };
        
        activities.unshift(activity);
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.pop();
        }
        
        localStorage.setItem('acidic_admin_activities', JSON.stringify(activities));
        
        // Also log to console for debugging
        console.log(`[ADMIN ACTIVITY] ${type}: ${description}`);
    }
    
    // Show login screen
    showLogin() {
        document.getElementById('admin-login').style.display = 'flex';
        document.getElementById('admin-header').style.display = 'none';
        document.querySelector('.admin-layout').style.display = 'none';
    }
    
    // Show admin dashboard
    showAdminDashboard() {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-header').style.display = 'flex';
        document.querySelector('.admin-layout').style.display = 'flex';
        
        // Update header with admin info
        this.updateAdminHeader();
    }
    
    // Update admin header with user info
    updateAdminHeader() {
        const session = this.getSession();
        if (!session) return;
        
        const adminInfo = document.querySelector('.admin-header .admin-actions');
        if (adminInfo) {
            adminInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="text-align: right;">
                        <div style="font-weight: bold;">${session.username}</div>
                        <div style="font-size: 12px; color: #ccc;">${session.role}</div>
                    </div>
                    <button class="logout-btn" onclick="adminAuth.logout(true)">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `;
        }
    }
    
    // Change password function
    changePassword(oldPassword, newPassword) {
        const credentials = JSON.parse(localStorage.getItem(this.adminCredentialsKey));
        
        // Verify old password
        if (oldPassword !== credentials.password) {
            throw new Error('Current password is incorrect');
        }
        
        // Validate new password
        if (newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters long');
        }
        
        // Update password
        credentials.password = newPassword;
        credentials.lastPasswordChange = new Date().toISOString();
        
        localStorage.setItem(this.adminCredentialsKey, JSON.stringify(credentials));
        
        // Log password change
        this.logActivity('PASSWORD_CHANGE', 'Password changed successfully');
        
        return true;
    }
    
    // View activity log
    getActivityLog(limit = 50) {
        const activities = JSON.parse(localStorage.getItem('acidic_admin_activities')) || [];
        return activities.slice(0, limit);
    }
}

// Initialize Admin Authentication
const adminAuth = new AdminAuth();

// ===== LOGIN FORM HANDLING =====

document.getElementById('admin-login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');
    
    try {
        // Show loading state
        const loginBtn = this.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;
        
        // Attempt login
        await adminAuth.login(username, password);
        
        // Reset form
        this.reset();
        errorElement.style.display = 'none';
        
        // Show dashboard
        adminAuth.showAdminDashboard();
        
    } catch (error) {
        // Show error
        errorElement.style.display = 'flex';
        document.getElementById('error-message').textContent = error.message;
        
        // Clear password field
        document.getElementById('admin-password').value = '';
        
        // Reset button
        const loginBtn = this.querySelector('.login-btn');
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        
        // Log failed attempt
        adminAuth.logActivity('LOGIN_FAILED', `Failed login attempt for username: ${username}`);
    }
});

// Go back to main site
function goToMainSite() {
    if (confirm('Return to main store?')) {
        window.location.href = 'index.html';
    }
}

// ===== ADMIN SESSION MANAGEMENT =====

// Track active tab
let isTabActive = true;

document.addEventListener('visibilitychange', function() {
    isTabActive = !document.hidden;
    
    if (isTabActive) {
        // Tab became active, update activity
        adminAuth.updateActivity();
    }
});

// Handle page refresh/unload
window.addEventListener('beforeunload', function(e) {
    const session = adminAuth.getSession();
    if (session) {
        // Optional: Save session state
        adminAuth.logActivity('PAGE_UNLOAD', 'Admin left the dashboard');
    }
});

// ===== ADMIN SETTINGS EXTENSION =====

// Add to your admin.js, inside showSection function for 'settings':
function showAdminSettings() {
    const session = adminAuth.getSession();
    if (!session) return;
    
    const settingsHTML = `
        <div class="admin-form">
            <h2>Admin Settings</h2>
            
            <div class="form-group">
                <h3>Change Password</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="current-password">Current Password</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" required>
                    </div>
                </div>
                <button class="btn-primary" onclick="changeAdminPassword()">
                    Change Password
                </button>
            </div>
            
            <div class="form-group">
                <h3>Session Information</h3>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                    <p><strong>Username:</strong> ${session.username}</p>
                    <p><strong>Role:</strong> ${session.role}</p>
                    <p><strong>Logged in:</strong> ${new Date(session.loggedInAt).toLocaleString()}</p>
                    <p><strong>Session expires:</strong> ${new Date(new Date(session.loggedInAt).getTime() + adminAuth.sessionTimeout).toLocaleString()}</p>
                </div>
            </div>
            
            <div class="form-group">
                <h3>Activity Log</h3>
                <button class="btn-secondary" onclick="viewActivityLog()">
                    View Activity Log
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('settings-section').innerHTML = settingsHTML;
}

// Change password function
async function changeAdminPassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    
    try {
        await adminAuth.changePassword(currentPassword, newPassword);
        
        alert('Password changed successfully!');
        
        // Clear form
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// View activity log
function viewActivityLog() {
    const activities = adminAuth.getActivityLog();
    
    const modalHTML = `
        <div class="modal active" onclick="closeModal(event, 'activity-modal')">
            <div class="modal-content" style="max-width: 800px;" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Admin Activity Log</h3>
                    <span class="close-modal" onclick="closeModal(event, 'activity-modal')">×</span>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activities.map(activity => `
                                <tr>
                                    <td>${new Date(activity.timestamp).toLocaleTimeString()}</td>
                                    <td><span class="status ${activity.type === 'LOGIN' ? 'in-stock' : 
                                                              activity.type === 'LOGOUT' ? 'out-of-stock' : 
                                                              'low-stock'}">${activity.type}</span></td>
                                    <td>${activity.description}</td>
                                    <td>${activity.username}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'activity-modal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
}

// Close modal function
function closeModal(e, modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Add to your showSection function in admin.js:
// case 'settings':
//     showAdminSettings();
//     break;