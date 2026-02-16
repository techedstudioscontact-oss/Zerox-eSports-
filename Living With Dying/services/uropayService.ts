import { APP_NAME, UROPAY_API_URL, UROPAY_KEY_ID, UROPAY_SECRET_KEY } from '../constants';
import CryptoJS from 'crypto-js';

// Helper to generate the authorization header
const getAuthHeader = () => {
    // SHA512 hash of the secret
    const hashedSecret = CryptoJS.SHA512(UROPAY_SECRET_KEY).toString(CryptoJS.enc.Hex);
    return `Bearer ${hashedSecret}`;
};

interface CreateOrderResponse {
    code: number;
    status: string;
    message: string;
    data: {
        uroPayOrderId: string;
        orderStatus: string;
        upiString: string;
        qrCode: string; // Base64 image
        amountInRupees: string;
    };
}

interface CheckStatusResponse {
    code: number;
    status: string;
    message: string;
    data: {
        uroPayOrderId: string;
        orderStatus: "PENDING" | "COMPLETED" | "FAILED" | "CREATED";
    };
}

export const createUropayOrder = async (
    amount: number,
    userEmail: string,
    userName: string
): Promise<CreateOrderResponse['data']> => {

    // Random Merchant Order ID
    const merchantOrderId = `LWD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payload = {
        vpa: "pay@uropay", // Default VPA if not specific, typically ignored if system uses dynamic
        vpaName: APP_NAME,
        amount: amount * 100, // Amount in Paise
        merchantOrderId: merchantOrderId,
        customerName: userName || "User",
        customerEmail: userEmail || "user@example.com",
        transactionNote: `Premium Unlock for ${userEmail}`
    };

    console.log("Generating Uropay Order...", payload);

    try {
        const response = await fetch(`${UROPAY_API_URL}/order/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': UROPAY_KEY_ID,
                'Authorization': getAuthHeader()
            },
            body: JSON.stringify(payload)
        });

        const result: CreateOrderResponse = await response.json();

        if (result.status !== 'success' || !result.data) {
            throw new Error(result.message || "Failed to generate order");
        }

        return result.data;
    } catch (error) {
        console.error("Uropay Create Order Error:", error);
        throw error;
    }
};

export const checkUropayStatus = async (uroPayOrderId: string): Promise<string> => {
    try {
        // No auth required for status check per docs
        const response = await fetch(`${UROPAY_API_URL}/order/status/${uroPayOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': UROPAY_KEY_ID
            }
        });

        const result: CheckStatusResponse = await response.json();

        if (result.status === 'success' && result.data) {
            return result.data.orderStatus;
        }
        return "PENDING";
    } catch (error) {
        console.error("Status Check Error:", error);
        return "UNKNOWN";
    }
};
