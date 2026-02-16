import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { User } from '../../types';
import { User as UserIcon, Trophy, Target, Coins, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileProps {
    user: User;
}

export const UserProfile = ({ user }: UserProfileProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user.displayName,
        gameName: user.gameName || '',
        gameId: user.gameId || '',
        phone: user.phone || '',
        upiId: user.upiId || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                gameName: formData.gameName,
                gameId: formData.gameId,
                phone: formData.phone,
                upiId: formData.upiId
            });
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            // In a real app, we might need to update the local user state here or trigger a refetch
            window.location.reload(); // Simple reload to refresh state for now
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-royal-black p-6 pb-24">
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow flex items-center gap-3">
                        <UserIcon className="w-8 h-8" /> MY PROFILE
                    </h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-dark-gray border border-metallic-gold text-metallic-gold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-bold"
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-bold"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-metallic-gold text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 font-bold"
                            >
                                {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Avatar & Quick Stats */}
                    <div className="space-y-6">
                        <div className="bg-dark-gray border border-gray-800 rounded-xl p-8 text-center shadow-lg relative overflow-hidden group">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-metallic-gold shadow-gold-glow mb-4 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-500">
                                    {user.displayName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.displayName}</h2>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <div className="mt-4 inline-block bg-black/50 px-3 py-1 rounded text-xs font-mono text-metallic-gold border border-gray-700">
                                UID: {user.uid.slice(0, 8)}...
                            </div>
                        </div>

                        <div className="bg-gradient-gold p-6 rounded-xl shadow-gold-glow text-center text-black">
                            <div className="text-sm font-bold uppercase tracking-wider mb-1">Wallet Balance</div>
                            <div className="text-4xl font-black flex items-center justify-center gap-1">
                                {user.coins} <Coins size={28} />
                            </div>
                            <button className="mt-4 w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-900 transition-colors">
                                Add Funds
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details & Stats */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-dark-gray border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                                <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{user.totalWins}</div>
                                    <div className="text-xs text-gray-400 uppercase font-bold">Total Wins</div>
                                </div>
                            </div>
                            <div className="bg-dark-gray border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                                <div className="bg-green-500/10 p-3 rounded-lg text-green-500">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{user.totalMatches}</div>
                                    <div className="text-xs text-gray-400 uppercase font-bold">Matches Played</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="bg-dark-gray border border-gray-800 rounded-xl p-8">
                            <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Personal Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-metallic-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-metallic-gold focus:outline-none"
                                        placeholder="+91..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">In-Game Name (IGN)</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.gameName}
                                        onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-metallic-gold focus:outline-none"
                                        placeholder="e.g. Mortal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Character ID</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.gameId}
                                        onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-metallic-gold focus:outline-none"
                                        placeholder="e.g. 5123456789"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">UPI ID (For Withdrawals)</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.upiId}
                                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-metallic-gold focus:outline-none"
                                        placeholder="username@okhdfcbank"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
