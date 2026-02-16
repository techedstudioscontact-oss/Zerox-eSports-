import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Team, User } from '../../types';
import { Users, Shield, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface MyTeamsProps {
    user: User;
}

export const MyTeams = ({ user }: MyTeamsProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Team Form
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamTag, setNewTeamTag] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, [user.uid]);

    const fetchTeams = async () => {
        try {
            // Fetch teams where user is captain OR a player
            // Firestore 'array-contains' only allows one filter per query usually, so let's try searching by players array
            /* const q = query(
                collection(db, 'teams'),
                where('players', 'array-contains', user.uid) 
            ); */
            // Alternatively, if we only store names in 'players' (as per TeamRegistration), we might need to rely on 'captainId' for now
            // Checking TeamRegistration: it stores 'players' as string[] of names. It stores 'captainId' as uid.
            // So for now, let's just fetch teams where user is captain. 
            // TODO: Enhance TeamRegistration to store player UIDs to allow full fetching.

            const qCaptain = query(
                collection(db, 'teams'),
                where('captainId', '==', user.uid)
            );

            const querySnapshot = await getDocs(qCaptain);
            const teamList: Team[] = [];
            querySnapshot.forEach((doc) => {
                teamList.push({ id: doc.id, ...doc.data() } as Team);
            });
            setTeams(teamList);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const teamData = {
                name: newTeamName,
                tag: newTeamTag,
                captainId: user.uid,
                players: [user.displayName || 'Captain'], // Initial roster
                tournamentId: 'global', // 'global' for persistent clan teams, else specific tournament ID
                isVerified: false,
                paymentStatus: 'paid', // Clans don't pay usually? Or maybe we separate Clan from Tournament Team.
                paidAmount: 0,
                registeredAt: Date.now(),
                totalPoints: 0,
                totalKills: 0,
                placementPoints: 0
            };

            await addDoc(collection(db, 'teams'), teamData);
            toast.success("Team created successfully!");
            setShowCreateModal(false);
            setNewTeamName('');
            setNewTeamTag('');
            fetchTeams(); // Refresh list
        } catch (error) {
            console.error("Error creating team:", error);
            toast.error("Failed to create team");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-royal-black p-6 pb-24">
            <div className="container mx-auto max-w-4xl">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow flex items-center gap-3">
                        <Shield className="w-8 h-8" /> MY TEAMS
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-metallic-gold text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 font-bold shadow-gold-glow"
                    >
                        <Plus size={20} /> Create New Team
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-400 text-center">Loading teams...</div>
                ) : teams.length === 0 ? (
                    <div className="bg-dark-gray border border-gray-800 rounded-xl p-12 text-center">
                        <Users className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-bold text-white mb-2">No Teams Found</h3>
                        <p className="text-gray-400 mb-6">You haven't created any teams yet.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-metallic-gold hover:underline font-bold"
                        >
                            Create one now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teams.map(team => (
                            <div key={team.id} className="bg-dark-gray border border-gray-800 rounded-xl p-6 hover:border-metallic-gold transition-colors relative group">
                                <div className="absolute top-4 right-4 text-gray-600">
                                    <Shield size={48} className="opacity-20" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
                                <p className="text-metallic-gold font-mono text-sm mb-4">[{team.tag || 'TAG'}]</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Users size={16} className="text-gray-500" />
                                        <span>{team.players ? team.players.length : 0} Members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Trophy size={16} className="text-gray-500" />
                                        <span>{team.totalPoints || 0} Points</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-800">
                                    <button className="w-full bg-black/40 hover:bg-black/60 text-white py-2 rounded-lg font-bold transition-colors">
                                        Manage Roster
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Team Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-gray border border-metallic-gold rounded-xl p-8 max-w-md w-full shadow-2xl relative">
                            <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>

                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Team Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                        placeholder="e.g. Soul Esports"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Team Tag (3-4 chars)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={5}
                                        value={newTeamTag}
                                        onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none font-mono"
                                        placeholder="SOUL"
                                    />
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 bg-metallic-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                                    >
                                        {creating ? 'Creating...' : 'Create Team'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
