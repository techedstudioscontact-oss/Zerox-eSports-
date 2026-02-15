import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeJiQ8872ib-qWXTTP7MgO2sAnIKcN8VY",
  authDomain: "livingwithdying-8e746.firebaseapp.com",
  databaseURL: "https://livingwithdying-8e746-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "livingwithdying-8e746",
  storageBucket: "livingwithdying-8e746.firebasestorage.app",
  messagingSenderId: "96057384976",
  appId: "1:96057384976:web:df47bbfead869b12a4ea95",
  measurementId: "G-VFPJGD1E3H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
