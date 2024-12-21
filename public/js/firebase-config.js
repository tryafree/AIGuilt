// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    addDoc,
    query,
    orderBy,
    getDocs,
    increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCP5qMVpN2nssmNtJPQblpg_t4T7txMVjk",
  authDomain: "ai-guilt.firebaseapp.com",
  projectId: "ai-guilt",
  storageBucket: "ai-guilt.appspot.com",
  messagingSenderId: "394652562837",
  appId: "1:394652562837:web:1e2cec78d41eca9c89329c",
  measurementId: "G-47R7D3KQ7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Firestore functions
export {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    orderBy,
    getDocs,
    increment
};

// Signup function
export async function signUp(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return {
            success: true,
            user: userCredential.user
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            success: true,
            user: userCredential.user
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Auth state observer
export function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}
