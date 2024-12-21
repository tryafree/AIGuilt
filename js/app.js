import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCP5qMVpN2nssmNtJPQblpg_t4T7txMVjk",
    authDomain: "ai-guilt.firebaseapp.com",
    projectId: "ai-guilt",
    storageBucket: "ai-guilt.firebasestorage.app",
    messagingSenderId: "394652562837",
    appId: "1:394652562837:web:1e2cec78d41eca9c89329c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const { createApp } = Vue;

createApp({
    // Your Vue app code here
}).mount('#app');
