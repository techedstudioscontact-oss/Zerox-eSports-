
import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { updateUserInDb } from '../services/authService';
import { User as UserIcon, Settings, Tag, Mail, Edit2, Check, ExternalLink, Zap, Shield, Crown, X, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { submitRequest } from '../services/requestService';
import { RequestContentModal } from '../components/RequestContentModal';
import { MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentModal } from './PaymentModal';
import { processProPayment, PRO_SUBSCRIPTION_PRICE } from '../services/paymentService';

interface ProfileProps {
    user: User;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.displayName);
    const [isLoading, setIsLoading] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Stats (Mocked or derived from real data if available later)
    const stats = [
        { label: 'Favorites', value: user.favorites?.length || 0 },
        { label: 'Coins', value: user.coins || 0 }, // New Coin Stat
        { label: 'Status', value: user.paidUser ? 'Premium' : 'Free' },
        { label: 'Role', value: user.role.toUpperCase() }
    ];

    const handleUpdateProfile = async () => {
        if (!newName.trim() || newName === user.displayName) {
            setIsEditing(false);
            return;
        }

        try {
            setIsLoading(true);
            await updateUserInDb({ ...user, displayName: newName });
            // Note: The parent App component also needs to update its local state, 
            // but since we subscribe to Auth changes, it should propagate automatically 
            // if the listener picks up Firestore changes, or we might need a manual refresh.
            // For now, let's assume optimistic update or listener will handle it.
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Left Column: User Card */}
                <div className="w-full md:w-1/3">
                    <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 sticky top-24">
                        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] relative">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                            {/* Coin Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-[#1a1a1a] flex items-center gap-1 shadow-lg">
                                <Zap size={10} className="fill-current" />
                                {user.coins || 0}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-white/5 border border-white/20 rounded px-2 py-1 text-center text-white w-full"
                                    autoFocus
                                />
                                <button onClick={handleUpdateProfile} disabled={isLoading} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                                    <Check size={16} />
                                </button>
                            </div>
                        ) : (
                            <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center justify-center gap-2 group">
                                {user.displayName}
                                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">
                                    <Edit2 size={14} />
                                </button>
                            </h1>
                        )}

                        <p className="text-gray-400 font-mono text-xs mb-6 flex items-center justify-center gap-1">
                            <Mail size={12} /> {user.email}
                        </p>

                        <div className="flex justify-center gap-2 mb-8">
                            {user.role === 'superadmin' && <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Crown size={10} /> Master</span>}
                            {user.role === 'admin' && <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Admin</span>}
                            {user.role === 'admin' && <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Admin</span>}
                            {user.paidUser && <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Zap size={10} /> Premium</span>}
                        </div>

                        {/* Upgrade Button for Free Users */}
                        {!user.paidUser && (
                            <Button
                                variant="primary"
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full mb-4 bg-gradient-to-r from-yellow-600 to-yellow-800 border-none shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse-slow"
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Get Lifetime Pro (₹{PRO_SUBSCRIPTION_PRICE})
                            </Button>
                        )}

                        <Button variant="outline" onClick={onLogout} className="w-full text-sm">
                            Log Out
                        </Button>
                    </div>
                </div>

                {/* Right Column: Details & Settings */}
                <div className="flex-1 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-surfaceHighlight/50 border border-white/5 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Account Settings */}
                    <div className="bg-surfaceHighlight/30 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Settings className="text-primary" size={20} />
                            Account Settings
                        </h3>

                        <div className="space-y-4">
                            {/* Content Preferences - Simple Tag Toggle for now (Demo) */}
                            <div
                                onClick={() => toast.info("Content Preferences Manager coming in v2.0", { description: "Currently recommendations are based on your watch history." })}
                                className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Content Preferences</div>
                                        <div className="text-xs text-gray-500">Manage tags and categories</div>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-gray-600 group-hover:text-white" />
                            </div>

                            {/* Biometric Security Toggle */}
                            <div
                                onClick={() => {
                                    // Toggle Logic
                                    const currentStatus = localStorage.getItem('biometric_enabled') === 'true';
                                    if (!currentStatus) {
                                        // Enabling: Verify first
                                        import('capacitor-native-biometric').then(async ({ NativeBiometric }) => {
                                            try {
                                                const result = await NativeBiometric.isAvailable();
                                                if (result.isAvailable) {
                                                    await NativeBiometric.verifyIdentity({
                                                        reason: "Enable Biometric Login",
                                                        title: "Setup FaceID/TouchID",
                                                        subtitle: "",
                                                        description: ""
                                                    });

                                                    // If successful (no error thrown)
                                                    localStorage.setItem('biometric_enabled', 'true');
                                                    toast.success("Biometric Security Enabled");
                                                } else {
                                                    toast.error("Biometrics not available on this device");
                                                }
                                            } catch (e) {
                                                toast.error("Biometric setup failed");
                                            }
                                        });
                                    } else {
                                        // Disabling
                                        localStorage.removeItem('biometric_enabled');
                                        toast.info("Biometric Security Disabled");
                                    }
                                }}
                                className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:text-white transition-colors">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Biometric App Lock</div>
                                        <div className="text-xs text-gray-500">Require FaceID/TouchID to open app</div>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${localStorage.getItem('biometric_enabled') === 'true' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600'}`}></div>
                            </div>

                            {/* Privacy & Security - Password Reset */}
                            <div
                                onClick={async () => {
                                    if (confirm(`Send password reset email to ${user.email}?`)) {
                                        try {
                                            await sendPasswordResetEmail(auth, user.email);
                                            toast.success("Password reset email sent!", { description: "Check your inbox." });
                                        } catch (e: any) {
                                            toast.error("Error sending email", { description: e.message });
                                        }
                                    }
                                }}
                                className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Privacy & Security</div>
                                        <div className="text-xs text-gray-500">Reset password regarding your security</div>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-gray-600 group-hover:text-white" />
                            </div>

                            {/* Delete Account (Danger Zone) */}
                            <div
                                onClick={async () => {
                                    if (confirm(`ARE YOU SURE you want to delete your account? This action cannot be undone.`)) {
                                        if (confirm("Final Confirmation: All your data, including coins and favorites, will be permanently lost.")) {
                                            try {
                                                const { deleteAccount } = await import('../services/authService');
                                                await deleteAccount(user);
                                                toast.success("Account deleted successfully.");
                                                onLogout(); // Ensure client side cleanup call
                                            } catch (e: any) {
                                                toast.error("Error deleting account", { description: e.message });
                                            }
                                        }
                                    }
                                }}
                                className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-95 mt-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:text-red-400 transition-colors">
                                        <X size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-red-500">Delete Account</div>
                                        <div className="text-xs text-red-400/70">Permanently remove your data</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Requests */}
                    <div className="bg-surfaceHighlight/30 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MessageSquarePlus className="text-primary" size={20} />
                            Request Content
                        </h3>
                        <div
                            onClick={() => setShowRequestModal(true)}
                            className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-95"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                    <MessageSquarePlus size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">Request New Series</div>
                                    <div className="text-xs text-gray-500">Can't find what you're looking for?</div>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-gray-600 group-hover:text-white" />
                        </div>
                    </div>

                    {/* Support / Help */}
                    <div className="bg-surfaceHighlight/30 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Support</h3>
                        <p className="text-sm text-gray-400 mb-4">Need help with your account or having trouble streaming?</p>
                        <a href="mailto:aniryx.contact@gmail.com?subject=App Support Request" className="inline-block w-full sm:w-auto">
                            <Button variant="secondary" className="w-full">Contact Support</Button>
                        </a>
                    </div>

                </div>
            </div>
            <RequestContentModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                user={user}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={PRO_SUBSCRIPTION_PRICE}
                title="Unlock Lifetime Pro"
                description="Get unlimited access to all premium content forever."
                benefits={[
                    "Unlimited Streaming",
                    "No Ads on Content",
                    "High Quality Downloads",
                    "Support the Creators"
                ]}
                onConfirm={async () => {
                    try {
                        // 1. Process Payment & Pool
                        await processProPayment(user.uid, PRO_SUBSCRIPTION_PRICE);

                        // 2. Update User Status
                        await updateUserInDb({ ...user, paidUser: true });

                        setShowPaymentModal(false);
                        toast.success("Welcome to Pro! Premium Unlocked.");
                    } catch (error) {
                        console.error("Payment failed", error);
                        toast.error("Transaction failed. Please try again.");
                    }
                }}
            />
        </div>
    );
};
