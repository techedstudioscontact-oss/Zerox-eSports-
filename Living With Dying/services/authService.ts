import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { User, Role } from '../types';

export const MASTER_ADMIN_EMAIL = 'master@lwd.com';
// In a real production app, never hardcode secrets. This should be validated via Cloud Functions.
export const MASTER_SECRET = 'master123';

const mapFirebaseUserToAppUser = async (fbUser: FirebaseUser): Promise<User> => {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as User;

    // Auto-Fix: Ensure Master Admin always has superadmin role
    if (fbUser.email === MASTER_ADMIN_EMAIL && userData.role !== 'superadmin') {
      const updatedMaster: User = { ...userData, role: 'superadmin', paidAdmin: true, paidUser: true };
      await updateDoc(userDocRef, { role: 'superadmin', paidAdmin: true, paidUser: true });
      return updatedMaster;
    }

    return userData;
  } else {
    // Initial user creation in Firestore if not exists (fallback)
    const isMaster = fbUser.email === MASTER_ADMIN_EMAIL;
    const newUser: User = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      role: isMaster ? 'superadmin' : 'user',
      paidUser: isMaster,
      paidAdmin: false,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0],
      favorites: [],
      coins: 0,
      lastDailyReward: ''
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }
};

export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Explicitly create the user doc here to ensure consistency
    const isMaster = email === MASTER_ADMIN_EMAIL;
    const newUser: User = {
      uid: userCredential.user.uid,
      email: email,
      role: isMaster ? 'superadmin' : 'user',
      paidUser: isMaster,
      paidAdmin: false,
      displayName: email.split('@')[0],
      favorites: [],
      coins: 100, // Sign up bonus
      lastDailyReward: ''
    };

    // HARDENED: Wait for Auth Token to Propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send Email Verification (Non-blocking)
    sendEmailVerification(userCredential.user).catch(err => console.warn("Email verification failed", err));

    await setDoc(doc(db, 'users', newUser.uid), newUser);
    return newUser;
  } catch (error: any) {
    // Return formatted error
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email is already registered. Please sign in.');
    }
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password?: string, secretKey?: string): Promise<User> => {
  try {
    // Master Admin Secret Check (Client-side simulation for this demo)
    if (email === MASTER_ADMIN_EMAIL && secretKey !== MASTER_SECRET) {
      throw new Error("Invalid Master Secret Key");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // HARDENED: Verify user object exists before mapping
      if (!userCredential || !userCredential.user) {
        throw new Error("Auth provider returned empty credentials");
      }
      return await mapFirebaseUserToAppUser(userCredential.user);
    } catch (error: any) {
      // DEMO FEATURE: Auto-register Master Admin if account missing
      // Handles 'auth/user-not-found' (legacy) and 'auth/invalid-credential' (new)
      if (email === MASTER_ADMIN_EMAIL &&
        (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          // Attempt to create the master account on the fly with provided password
          return await registerUser(email, password);
        } catch (regError: any) {
          // If creation failed because email exists, it means password was wrong
          if (regError.message.includes('already registered')) {
            throw new Error("Invalid Password for Master Admin.");
          }
          throw regError;
        }
      }

      // Friendly Error Messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password.");
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error("Account not found. Please Sign Up.");
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed attempts. Please try again later.");
      }

      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
  localStorage.removeItem('lwd_user');
};

export const getSessionUser = (): User | null => {
  const data = localStorage.getItem('lwd_user');
  return data ? JSON.parse(data) : null;
};

export const deleteAccount = async (user: User): Promise<void> => {
  try {
    // 1. Delete Firestore Data
    const userDocRef = doc(db, 'users', user.uid);
    await deleteDoc(userDocRef);

    // 2. Delete Auth User
    const currentUser = auth.currentUser;
    if (currentUser) {
      await deleteUser(currentUser);
    }

    // 3. Clear Local Storage
    localStorage.removeItem('lwd_user');
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Please log out and log in again to delete your account.");
    }
    throw new Error("Failed to delete account " + error.message);
  }
};

// Sync Firestore Helper
export const updateUserInDb = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);
  await updateDoc(userDocRef, { ...user });
  localStorage.setItem('lwd_user', JSON.stringify(user));
};

export const updateUserRoleInDb = async (uid: string, newRole: Role) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role: newRole });
};

// Master Admin: Fetch All Users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Listener for Auth State
// Listener for Auth State with Real-time Firestore Updates
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  let unsubscribeSnapshot: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
    // Unsubscribe from previous user's snapshot if exists
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    if (fbUser) {
      // Set up real-time listener for the user document
      const userDocRef = doc(db, 'users', fbUser.uid);

      // Initial check/create if not exists (handling the edge case of new users)
      // We can't do async inside onSnapshot easily for creation, so we ensure existence first potentially
      // But standard practice: assume it exists or create on login. 
      // mapFirebaseUserToAppUser logic was doing creation. Let's keep a quick check.
      try {
        // We might need to run the mapping once to ensure creation, 
        // but mapped user return value is stale the moment snapshot fires.
        await mapFirebaseUserToAppUser(fbUser);
      } catch (e) {
        console.error("Error ensuring user exists", e);
      }


      unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const appUser = docSnap.data() as User;

          // Check Suspension
          if (appUser.suspendedUntil && appUser.suspendedUntil > Date.now()) {
            unsubscribeAuth(); // Stop auth listener? No, just sign out.
            signOut(auth);
            localStorage.removeItem('lwd_user');
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            alert(`Access Denied. Your account has been suspended.`);
            callback(null);
            return;
          }

          localStorage.setItem('lwd_user', JSON.stringify(appUser));
          callback(appUser);
        } else {
          // Document deleted?
          callback(null);
        }
      }, (error) => {
        console.error("Firestore user sync error:", error);
      });

    } else {
      localStorage.removeItem('lwd_user');
      callback(null);
    }
  });

  // Return a function to unsubscribe from BOTH
  return () => {
    unsubscribeAuth();
    if (unsubscribeSnapshot) unsubscribeSnapshot();
  };
};

// Toggle Favorite
export const toggleFavorite = async (user: User, contentId: string): Promise<string[]> => {
  const userDocRef = doc(db, 'users', user.uid);
  let newFavorites = [...(user.favorites || [])];

  if (newFavorites.includes(contentId)) {
    newFavorites = newFavorites.filter(id => id !== contentId);
  } else {
    newFavorites.push(contentId);
  }

  await updateDoc(userDocRef, { favorites: newFavorites });

  // Update local storage
  const updatedUser = { ...user, favorites: newFavorites };
  localStorage.setItem('lwd_user', JSON.stringify(updatedUser));

  return newFavorites;
};
// Add to Watch History
export const addToHistory = async (user: User, contentId: string): Promise<string[]> => {
  const userDocRef = doc(db, 'users', user.uid);
  let newHistory = [contentId, ...(user.watchHistory || [])].filter((value, index, self) => self.indexOf(value) === index).slice(0, 20); // Keep last 20 unique items

  await updateDoc(userDocRef, { watchHistory: newHistory });

  // Update local storage
  const updatedUser = { ...user, watchHistory: newHistory };
  localStorage.setItem('lwd_user', JSON.stringify(updatedUser));

  return newHistory;
};

// --- Gamification Logic ---

export const addCoins = async (user: User, amount: number): Promise<number> => {
  const newBalance = (user.coins || 0) + amount;
  const updatedUser = { ...user, coins: newBalance };
  await updateUserInDb(updatedUser);
  return newBalance;
};

export const checkDailyReward = async (user: User): Promise<{ rewarded: boolean; coins: number }> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (user.lastDailyReward !== today) {
    const rewardAmount = 50;
    const newBalance = (user.coins || 0) + rewardAmount;
    const updatedUser = {
      ...user,
      coins: newBalance,
      lastDailyReward: today
    };
    // Update DB
    await updateUserInDb(updatedUser);
    return { rewarded: true, coins: rewardAmount };
  }
  return { rewarded: false, coins: 0 };
};

// Update Watch Progress
export const updateWatchProgress = async (user: User, contentId: string, progress: { episodeIndex: number, timestamp: number, duration: number }) => {
  const userDocRef = doc(db, 'users', user.uid);
  const percentage = progress.duration > 0 ? progress.timestamp / progress.duration : 0;

  const progressData: any = { // Using any to match WatchProgress structure broadly
    episodeIndex: progress.episodeIndex,
    timestamp: progress.timestamp,
    lastWatched: Date.now(),
    progress: percentage
  };

  // We need to use dot notation for updating a nested map field in Firestore
  // Key: continueWatching.{contentId}
  await updateDoc(userDocRef, {
    [`continueWatching.${contentId}`]: progressData
  });
};
