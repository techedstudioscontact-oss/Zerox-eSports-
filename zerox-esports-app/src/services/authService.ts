import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { User } from '../types';

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Sign Up New User
export const signupUser = async (email: string, password: string, displayName: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    const newUser: User = {
        uid: userCred.user.uid,
        email: email,
        displayName: displayName,
        role: 'user',
        isVerified: false,
        coins: 100, // Welcome bonus
        totalMatches: 0,
        totalWins: 0,
        favoriteTeams: [],
        walletBalance: 0,
        createdAt: Date.now(),
        lastLogin: Date.now()
    };

    await setDoc(doc(db, 'users', userCred.user.uid), newUser);
    return newUser;
};

// Login Existing User
export const loginUser = async (email: string, password: string, secretKey?: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));

    if (!userDoc.exists()) {
        throw new Error('User profile not found');
    }

    const userData = userDoc.data() as User;

    // Master admin secret key verification
    if (userData.role === 'superadmin' && secretKey !== 'ZEROX_MASTER_2026') {
        await signOut(auth);
        throw new Error('Invalid master admin secret key');
    }

    // Update last login
    await updateDoc(doc(db, 'users', userCred.user.uid), {
        lastLogin: Date.now()
    });

    return userData;
};

// Sign In With Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Create new user doc
            const newUser: User = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Player',
                role: 'user',
                isVerified: false,
                coins: 100, // Welcome bonus
                totalMatches: 0,
                totalWins: 0,
                favoriteTeams: [],
                walletBalance: 0,
                createdAt: Date.now(),
                lastLogin: Date.now()
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
            return newUser;
        } else {
            // Update last login
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: Date.now()
            });
            return userDoc.data() as User;
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

// Logout
export const logoutUser = async () => {
    await signOut(auth);
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                callback(userDoc.data() as User);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};
