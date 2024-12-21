import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// Login form handling
const handleLoginRequest = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store minimal user info in localStorage
        localStorage.setItem('userId', user.uid);
        
        // Redirect to profile page
        window.location.href = 'profile.html';
        
        return { success: true, message: 'Login successful!' };
    } catch (error) {
        let errorMessage = 'Login failed';
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            default:
                errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

// Handle forgot password
const handleForgotPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
        throw new Error('Failed to send reset email: ' + error.message);
    }
};

// Initialize login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await handleLoginRequest(email, password);
                showMessage(result.message, 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            if (!email) {
                showMessage('Please enter your email address first', 'error');
                return;
            }

            try {
                const result = await handleForgotPassword(email);
                showMessage(result.message, 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
});

// Helper function to show messages
const showMessage = (message, type) => {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        messageDiv.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
};
