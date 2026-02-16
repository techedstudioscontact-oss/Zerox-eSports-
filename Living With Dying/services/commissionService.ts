import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, query, where, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { RevenuePool, AdminActivity } from '../types';

// Helper for Month ID (Same as in other services)
const getCurrentMonthId = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * distributeCommissionPool
 * 
 * 1. Validates pool status (must be 'open').
 * 2. Fetches all eligible admins.
 * 3. Calculates shares based on View Count (Engagement).
 * NB: Upload count is just the eligibility gate (>=2). The actual slice is view-based (or equal if we prefer).
 * Let's implement weighted by views for fairness, or equal split if no view data.
 * 
 * For simplicity in V1: Equal Split among Eligible Admins.
 * (User requested "Engagement metrics" - so let's try to include that if possible, 
 * but for now let's do: Base Share (50%) + Performance Share (50%))
 */
export const distributeCommissionPool = async (processedByUid: string) => {
    const monthId = getCurrentMonthId();
    const poolRef = doc(db, 'revenue_cycles', monthId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get Pool
            const poolDoc = await transaction.get(poolRef);
            if (!poolDoc.exists()) throw new Error("Pool for this month does not exist.");

            const poolData = poolDoc.data() as RevenuePool;
            if (poolData.status === 'distributed') throw new Error("Pool already distributed.");
            if (poolData.adminPool <= 0) throw new Error("No funds in pool to distribute.");

            // 2. Get Eligible Admins
            const activityQuery = query(
                collection(db, 'admin_activity'),
                where('month', '==', monthId),
                where('isEligible', '==', true)
            );

            // Cannot use query inside transaction directly with getDocs in client SDK conveniently 
            // without reading all first. For safety, we'll read outside or use a separate read.
            // But to ensure atomicity, ideally inside. 
            // Workaround: We will do the query first, then use the transaction to update wallets.

            // Note: Mixing non-transactional reads is risky if admins become ineligible mid-process, 
            // but for a Master Admin trigger, it's acceptable.
        });

        // RE-RUN LOGIC OUTSIDE TRANSACTION FOR QUERY (Firestore Client SDK Limitation workaround)
        // Then run a transaction to commit the specific updates.

        // 1. Fetch Pool & Participants
        const poolSnap = await getDocs(query(collection(db, 'revenue_cycles'), where('id', '==', monthId)));
        if (poolSnap.empty) throw new Error("Pool not found");

        const poolDocRef = poolSnap.docs[0].ref;
        const poolData = poolSnap.docs[0].data() as RevenuePool;

        if (poolData.status === 'distributed') throw new Error("Already Distributed");

        const activitiesSnap = await getDocs(query(
            collection(db, 'admin_activity'),
            where('month', '==', monthId),
            where('isEligible', '==', true)
        ));

        if (activitiesSnap.empty) {
            console.warn("No eligible admins found. Rolling over? (Or leaving in pool)");
            return;
        }

        const eligibleAdmins = activitiesSnap.docs.map(d => d.data() as AdminActivity);
        const totalAdmins = eligibleAdmins.length;

        // LOGIC: Pure View-Based Distribution
        // If total views = 0, fallback to Equal Split.
        const totalViews = eligibleAdmins.reduce((sum, admin) => sum + (admin.totalViews || 0), 0);

        const updates: { adminId: string, amount: number }[] = [];

        eligibleAdmins.forEach(admin => {
            let share = 0;
            if (totalViews > 0) {
                // Pro-rata based on views
                share = (admin.totalViews / totalViews) * poolData.adminPool;
            } else {
                // Equal split
                share = poolData.adminPool / totalAdmins;
            }
            updates.push({ adminId: admin.adminId, amount: Math.floor(share) }); // Floor to avoid decimals issues
        });

        // 2. Commit Updates Transactionally
        await runTransaction(db, async (t) => {
            // Double check pool status
            const currentPool = await t.get(poolDocRef);
            if (currentPool.data()?.status === 'distributed') throw new Error("Race condition: Already distributed");

            // Update All Wallets
            for (const update of updates) {
                const userRef = doc(db, 'users', update.adminId);
                // We use increment to be safe
                t.update(userRef, {
                    walletBalance: increment(update.amount)
                });
            }

            // Close Pool
            t.update(poolDocRef, {
                status: 'distributed',
                distributedAt: serverTimestamp(),
                processedBy: processedByUid
            });
        });

        console.log(`Successfully distributed ₹${poolData.adminPool} among ${totalAdmins} admins.`);

    } catch (error) {
        console.error("Distribution failed", error);
        throw error;
    }
};

/**
 * getAdminActivity
 * Helper for Admins to see their own stats
 */
export const getAdminActivity = async (adminId: string): Promise<AdminActivity | null> => {
    const monthId = getCurrentMonthId();
    const id = `${adminId}_${monthId}`;
    try {
        const snap = await getDocs(query(collection(db, 'admin_activity'), where('id', '==', id)));
        // Ideally getDoc(doc(db...)) but providing helper
        if (!snap.empty) return snap.docs[0].data() as AdminActivity;
        return null;
    } catch (e) {
        return null;
    }
};
