// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA0-ufAd-42SnKDssCa1gyNa1dtdijMIio",
    authDomain: "zerox-esports.firebaseapp.com",
    projectId: "zerox-esports",
    storageBucket: "zerox-esports.firebasestorage.app",
    messagingSenderId: "1030846411815",
    appId: "1:1030846411815:web:e08f4d669893283c3f8a02",
    measurementId: "G-FKPJPSE6SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
