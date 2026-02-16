import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, runTransaction } from 'firebase/firestore';
import { RevenuePool } from '../types';

export const ADMIN_FEE_PRICE = 500; // Legacy Admin Fee
export const PRO_SUBSCRIPTION_PRICE = 9; // New Pro Subscription
export const PLATFORM_SHARE_PERCENTAGE = 30; // 30% to Platform

// Helper to get current month ID "YYYY-MM"
const getCurrentMonthId = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * processProPayment
 * Called when a user buys the ₹9 Pro Subscription.
 * Adds funds to the "Pending" Pool for the current month.
 */
export const processProPayment = async (userId: string, amount: number) => {
    const monthId = getCurrentMonthId();
    const poolRef = doc(db, 'revenue_cycles', monthId);

    const platformShare = amount * (PLATFORM_SHARE_PERCENTAGE / 100);
    const adminShare = amount - platformShare;

    try {
        await runTransaction(db, async (transaction) => {
            const poolDoc = await transaction.get(poolRef);

            if (!poolDoc.exists()) {
                // Initialize new month pool
                const now = new Date();
                const newPool: RevenuePool = {
                    id: monthId,
                    month: now.getMonth(),
                    year: now.getFullYear(),
                    totalRevenue: amount,
                    platformShare: platformShare,
                    adminPool: adminShare,
                    status: 'open',
                    createdAt: serverTimestamp() // Will be resolved by server
                };
                // Use set without serverTimestamp first to avoid type issues in transaction if needed, 
                // but direct set is usually fine outside transaction if we don't need read.
                // Inside transaction we use set.
                transaction.set(poolRef, newPool);
            } else {
                // Update existing pool
                transaction.update(poolRef, {
                    totalRevenue: increment(amount),
                    platformShare: increment(platformShare),
                    adminPool: increment(adminShare)
                });
            }
        });
        console.log(`Processed ₹${amount} for Pool ${monthId}`);
    } catch (error) {
        console.error("Failed to process pool payment", error);
        throw error;
    }
};

/**
 * getCurrentPoolStatus
 * Returns the current month's pool data for display
 */
export const getCurrentPoolStatus = async (): Promise<RevenuePool | null> => {
    try {
        const monthId = getCurrentMonthId();
        const docRef = doc(db, 'revenue_cycles', monthId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data() as RevenuePool;
        }
        return null; // No pool started yet
    } catch (error) {
        console.error("Error fetching pool", error);
        return null;
    }
};
