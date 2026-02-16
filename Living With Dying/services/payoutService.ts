import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

export interface PayoutRequest {
    userId: string;
    userEmail: string;
    upiId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export const requestPayout = async (userId: string, userEmail: string, upiId: string, amount: number) => {
    if (amount < 1000) {
        throw new Error("Minimum withdrawal amount is ₹1000");
    }

    await addDoc(collection(db, 'payouts'), {
        userId,
        userEmail,
        upiId,
        amount,
        status: 'pending',
        createdAt: serverTimestamp()
    });

};

export const getPayouts = async (): Promise<(PayoutRequest & { id: string })[]> => {
    const q = query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PayoutRequest & { id: string }));
};

export const updatePayoutStatus = async (id: string, status: 'approved' | 'rejected') => {
    const docRef = doc(db, 'payouts', id);
    await updateDoc(docRef, { status });
};
