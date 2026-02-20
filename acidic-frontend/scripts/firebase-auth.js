// ================================================================
//  FIREBASE AUTHENTICATION SERVICE
//  Handles sign up, sign in, password reset, profile updates
// ================================================================

// ── Sign Up with Email/Password ───────────────────────────────────
async function firebaseSignUp(email, password, name, phone = '') {
  try {
    // Create user account
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update display name
    await user.updateProfile({
      displayName: name
    });
    
    // Create user profile in Firestore
    await createUserProfile(user, { name, phone });
    
    // Send email verification
    await user.sendEmailVerification();
    
    showNotification('Account created! Please check your email to verify.', 'success');
    
    // Log analytics
    if (firebaseAnalytics) {
      firebaseAnalytics.logEvent('sign_up', {
        method: 'email'
      });
    }
    
    return { success: true, user };
    
  } catch (error) {
    console.error('Sign up error:', error);
    
    let message = 'Sign up failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    
    showNotification(message, 'error');
    return { success: false, error: message };
  }
}

// ── Sign In with Email/Password ───────────────────────────────────
async function firebaseSignIn(email, password) {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    showNotification('Welcome back!', 'success');
    
    // Log analytics
    if (firebaseAnalytics) {
      firebaseAnalytics.logEvent('login', {
        method: 'email'
      });
    }
    
    // Close login modal
    if (typeof closeLogin === 'function') closeLogin();
    
    return { success: true, user };
    
  } catch (error) {
    console.error('Sign in error:', error);
    
    let message = 'Sign in failed. Please check your credentials.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled. Please contact support.';
    }
    
    showNotification(message, 'error');
    return { success: false, error: message };
  }
}

// ── Sign In with Google ───────────────────────────────────────────
async function firebaseSignInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const userCredential = await firebaseAuth.signInWithPopup(provider);
    const user = userCredential.user;
    
    // Check if user profile exists
    const userDoc = await firebaseDB.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      await createUserProfile(user);
    }
    
    showNotification('Signed in with Google!', 'success');
    
    if (firebaseAnalytics) {
      firebaseAnalytics.logEvent('login', {
        method: 'google'
      });
    }
    
    if (typeof closeLogin === 'function') closeLogin();
    
    return { success: true, user };
    
  } catch (error) {
    console.error('Google sign in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign in cancelled' };
    }
    
    showNotification('Google sign in failed. Please try again.', 'error');
    return { success: false, error: error.message };
  }
}

// ── Sign Out ──────────────────────────────────────────────────────
async function firebaseSignOut() {
  try {
    await firebaseAuth.signOut();
    
    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('acidicCart');
    
    showNotification('Signed out successfully', 'success');
    
    // Redirect to home
    if (typeof openHomePage === 'function') {
      openHomePage();
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Sign out failed. Please try again.', 'error');
    return { success: false, error: error.message };
  }
}

// ── Password Reset ────────────────────────────────────────────────
async function firebasePasswordReset(email) {
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
    
    showNotification('Password reset email sent! Check your inbox.', 'success');
    return { success: true };
    
  } catch (error) {
    console.error('Password reset error:', error);
    
    let message = 'Failed to send reset email. Please try again.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    
    showNotification(message, 'error');
    return { success: false, error: message };
  }
}

// ── Update User Profile ───────────────────────────────────────────
async function updateUserProfile(updates) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }
    
    // Update auth profile if name changed
    if (updates.name) {
      await user.updateProfile({
        displayName: updates.name
      });
    }
    
    // Update Firestore profile
    await firebaseDB.collection('users').doc(user.uid).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    showNotification('Profile updated successfully!', 'success');
    return { success: true };
    
  } catch (error) {
    console.error('Profile update error:', error);
    showNotification('Failed to update profile. Please try again.', 'error');
    return { success: false, error: error.message };
  }
}

// ── Change Password ───────────────────────────────────────────────
async function changePassword(currentPassword, newPassword) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }
    
    // Re-authenticate user first
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await user.reauthenticateWithCredential(credential);
    
    // Update password
    await user.updatePassword(newPassword);
    
    showNotification('Password changed successfully!', 'success');
    return { success: true };
    
  } catch (error) {
    console.error('Password change error:', error);
    
    let message = 'Failed to change password. Please try again.';
    if (error.code === 'auth/wrong-password') {
      message = 'Current password is incorrect.';
    } else if (error.code === 'auth/weak-password') {
      message = 'New password should be at least 6 characters.';
    }
    
    showNotification(message, 'error');
    return { success: false, error: message };
  }
}

// ── Get Current User ──────────────────────────────────────────────
function getCurrentFirebaseUser() {
  return firebaseAuth.currentUser;
}

// ── Check if User is Signed In ────────────────────────────────────
function isUserSignedIn() {
  return firebaseAuth.currentUser !== null;
}

// ── Export functions ──────────────────────────────────────────────
window.firebaseSignUp = firebaseSignUp;
window.firebaseSignIn = firebaseSignIn;
window.firebaseSignInWithGoogle = firebaseSignInWithGoogle;
window.firebaseSignOut = firebaseSignOut;
window.firebasePasswordReset = firebasePasswordReset;
window.updateUserProfile = updateUserProfile;
window.changePassword = changePassword;
window.getCurrentFirebaseUser = getCurrentFirebaseUser;
window.isUserSignedIn = isUserSignedIn;

console.log('✓ Firebase auth service loaded');