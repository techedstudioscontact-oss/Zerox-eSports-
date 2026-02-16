import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import type { User, SystemSettings } from '../types';

/**
 * Initialize Master Admin Account
 * This runs on first app launch to create the default master admin
 */
export const initializeMasterAdmin = async () => {
    const masterAdminEmail = 'ope@zeroxesports.com';
    const masterAdminPassword = 'ZeroxMaster@2026'; // Change this!
    const masterAdminUid = 'master-admin-zerox';

    try {
        // Check if master admin already exists
        const masterDoc = await getDoc(doc(db, 'users', masterAdminUid));

        if (!masterDoc.exists()) {
            console.log('Creating master admin account...');

            // Create auth account
            const userCred = await createUserWithEmailAndPassword(
                auth,
                masterAdminEmail,
                masterAdminPassword
            );

            // Create Firestore user document
            const masterAdminData: User = {
                uid: userCred.user.uid,
                email: masterAdminEmail,
                displayName: 'Master Admin (OPE)',
                role: 'superadmin',
                isVerified: true,
                coins: 999999,
                totalMatches: 0,
                totalWins: 0,
                favoriteTeams: [],
                walletBalance: 0,
                createdAt: Date.now(),
                lastLogin: Date.now()
            };

            await setDoc(doc(db, 'users', userCred.user.uid), masterAdminData);

            console.log('✅ Master admin account created successfully!');
            console.log(`Email: ${masterAdminEmail}`);
            console.log(`Password: ${masterAdminPassword}`);
            console.log('⚠️ CHANGE THIS PASSWORD IMMEDIATELY!');

            return masterAdminData;
        } else {
            console.log('Master admin already exists');
            return null;
        }
    } catch (error: any) {
        // If account already exists in Auth, just create Firestore doc
        if (error.code === 'auth/email-already-in-use') {
            console.log('Master admin email already in use, skipping...');
            return null;
        }
        console.error('Error creating master admin:', error);
        throw error;
    }
};

/**
 * Initialize Default System Settings
 */
export const initializeSystemSettings = async () => {
    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'system'));

        if (!settingsDoc.exists()) {
            console.log('Initializing system settings...');

            const defaultSettings: SystemSettings = {
                isLocked: false,
                broadcastMessage: '',
                commissionRate: 10,
                registrationsEnabled: true,
                minAppVersion: '1.0.0',
                forceUpdate: false,
                updatedBy: 'system',
                updatedAt: Date.now()
            };

            await setDoc(doc(db, 'settings', 'system'), defaultSettings);
            console.log('✅ System settings initialized');
            return defaultSettings;
        } else {
            console.log('System settings already exist');
            return null;
        }
    } catch (error) {
        console.error('Error initializing system settings:', error);
        throw error;
    }
};

/**
 * Run all initialization tasks
 * Call this on app startup (once)
 */
export const initializeApp = async () => {
    console.log('🚀 Initializing Zerox eSports App...');

    try {
        await initializeSystemSettings();
        await initializeMasterAdmin();
        // Note: Master admin creation can fail if called while not authenticated
        // You may need to call this separately or via Firebase Functions

        console.log('✅ App initialization complete');
    } catch (error) {
        console.error('❌ App initialization failed:', error);
    }
};
