import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config
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
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Create Master Admin Account in Firestore
 * Run this script once to initialize the database
 */
async function createMasterAdmin() {
    console.log('🚀 Creating Master Admin Account...');

    const masterAdminData = {
        uid: 'WILL_BE_REPLACED', // Will be replaced with actual UID
        email: 'ope@zeroxesports.com',
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

    try {
        // Create Firebase Auth account
        console.log('Creating Firebase Auth account...');
        const userCred = await createUserWithEmailAndPassword(
            auth,
            'ope@zeroxesports.com',
            'ZeroxMaster@2026' // CHANGE THIS PASSWORD!
        );

        // Update UID in data
        masterAdminData.uid = userCred.user.uid;

        // Create Firestore document
        console.log('Creating Firestore user document...');
        await setDoc(doc(db, 'users', userCred.user.uid), masterAdminData);

        console.log('✅ Master Admin created successfully!');
        console.log('📧 Email: ope@zeroxesports.com');
        console.log('🔑 Password: ZeroxMaster@2026');
        console.log('🔐 Secret Key: ZEROX_MASTER_2026');
        console.log('⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');

        return masterAdminData;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('⚠️  Master admin email already exists');
            console.log('📧 Email: ope@zeroxesports.com');
            console.log(' 🔑 Password: ZeroxMaster@2026 (or changed password)');
            console.log('🔐 Secret Key: ZEROX_MASTER_2026');
        } else {
            console.error('❌ Error creating master admin:', error);
        }
    }
}

/**
 * Create Default System Settings
 */
async function createSystemSettings() {
    console.log('⚙️  Creating system settings...');

    const settingsData = {
        isLocked: false,
        lockReason: '',
        broadcastMessage: '',
        commissionRate: 10,
        registrationsEnabled: true,
        minAppVersion: '1.0.0',
        forceUpdate: false,
        updatedBy: 'system',
        updatedAt: Date.now()
    };

    try {
        const settingsRef = doc(db, 'settings', 'system');
        const settingsDoc = await getDoc(settingsRef);

        if (!settingsDoc.exists()) {
            await setDoc(settingsRef, settingsData);
            console.log('✅ System settings created');
        } else {
            console.log('ℹ️  System settings already exist');
        }
    } catch (error) {
        console.error('❌ Error creating system settings:', error);
    }
}

/**
 * Create Sample Moderator Account
 */
async function createModeratorAccount() {
    console.log('👤 Creating sample moderator account...');

    const moderatorData = {
        uid: 'WILL_BE_REPLACED',
        email: 'open@zeroxesports.com',
        displayName: 'Moderator (OPEN)',
        role: 'admin',
        isVerified: true,
        coins: 10000,
        totalMatches: 0,
        totalWins: 0,
        favoriteTeams: [],
        walletBalance: 0,
        createdAt: Date.now(),
        lastLogin: Date.now()
    };

    try {
        const userCred = await createUserWithEmailAndPassword(
            auth,
            'open@zeroxesports.com',
            'ModeratorOpen@2026' // CHANGE THIS!
        );

        moderatorData.uid = userCred.user.uid;
        await setDoc(doc(db, 'users', userCred.user.uid), moderatorData);

        console.log('✅ Moderator account created!');
        console.log('📧 Email: open@zeroxesports.com');
        console.log('🔑 Password: ModeratorOpen@2026');

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('⚠️  Moderator email already exists');
        } else {
            console.error('❌ Error creating moderator:', error);
        }
    }
}

/**
 * Initialize Database - Run all setup functions
 */
async function initializeDatabase() {
    console.log('\n========================================');
    console.log('ZEROX eSPORTS - DATABASE INITIALIZATION');
    console.log('========================================\n');

    try {
        await createMasterAdmin();
        console.log();
        await createModeratorAccount();
        console.log();
        await createSystemSettings();

        console.log('\n========================================');
        console.log('✅ DATABASE INITIALIZATION COMPLETE!');
        console.log('========================================\n');
        console.log('📋 ACCOUNTS CREATED:');
        console.log('1. Master Admin (ope@zeroxesports.com)');
        console.log('   Password: ZeroxMaster@2026');
        console.log('   Secret Key: ZEROX_MASTER_2026');
        console.log();
        console.log('2. Moderator (open@zeroxesports.com)');
        console.log('   Password: ModeratorOpen@2026');
        console.log();
        console.log('⚠️  SECURITY NOTICE:');
        console.log('   Change these default passwords immediately!');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
}

// Run initialization
initializeDatabase();
