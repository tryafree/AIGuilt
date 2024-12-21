// Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authService = {
    async signup(formData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            await sendEmailVerification(userCredential.user);
            return {
                success: true,
                user: userCredential.user,
                message: 'Verification email sent! Please check your inbox.'
            };
        } catch (error) {
            return {
                success: false,
                error: this._getErrorMessage(error)
            };
        }
    },
async login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        // Store user data in localStorage for profile access
        localStorage.setItem('userEmail', userCredential.user.email);
        
        // Direct navigation to profile
        window.location.href = '/profile.html';
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}    },    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    isAuthenticated() {
        return auth.currentUser !== null;
    },

    getUser() {
        return auth.currentUser;
    },

    _getErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'This email is already registered.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    }
};

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        if (window.location.pathname.endsWith('index.html')) {
            window.location.href = 'profile.html';
        }
    } else {
        // User is signed out
        console.log('User is signed out');
    }
});

export default authService;
