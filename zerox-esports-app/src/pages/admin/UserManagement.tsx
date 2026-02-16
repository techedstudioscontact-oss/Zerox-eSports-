import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { User } from '../../types';
import { Shield, ShieldAlert, ShieldCheck, Search, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const userList: User[] = [];
            querySnapshot.forEach((doc) => {
                userList.push(doc.data() as User);
            });
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (uid: string, newRole: 'user' | 'admin' | 'superadmin') => {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole });

            // Update local state
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update user role");
        }
    };

    // Filter users
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="min-h-screen bg-royal-black flex items-center justify-center text-metallic-gold">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-royal-black p-6">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow">USER MANAGEMENT</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-dark-gray border border-border-gold rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-metallic-gold"
                        />
                    </div>
                </div>

                <div className="bg-dark-gray border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/50 text-metallic-gold uppercase text-sm">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Coins</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.uid} className="hover:bg-royal-black/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-white">{user.displayName}</div>
                                                <div className="text-sm text-gray-400">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'superadmin' && (
                                                <span className="inline-flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs border border-red-900">
                                                    <ShieldAlert size={12} /> Master Admin
                                                </span>
                                            )}
                                            {user.role === 'admin' && (
                                                <span className="inline-flex items-center gap-1 bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-900">
                                                    <ShieldCheck size={12} /> Moderator
                                                </span>
                                            )}
                                            {user.role === 'user' && (
                                                <span className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-900">
                                                    <Shield size={12} /> Player
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {user.coins} 🪙
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-500 text-sm flex items-center gap-1">
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'superadmin' && (
                                                <div className="flex justify-end gap-2">
                                                    {user.role === 'user' ? (
                                                        <button
                                                            onClick={() => handleRoleChange(user.uid, 'admin')}
                                                            className="text-xs bg-metallic-gold text-black px-3 py-1 rounded hover:bg-yellow-400 font-bold"
                                                            title="Promote to Moderator"
                                                        >
                                                            Promote
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRoleChange(user.uid, 'user')}
                                                            className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                                                            title="Demote to Player"
                                                        >
                                                            Demote
                                                        </button>
                                                    )}
                                                    <button className="text-red-500 hover:text-red-400 p-1" title="Ban User">
                                                        <Ban size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
