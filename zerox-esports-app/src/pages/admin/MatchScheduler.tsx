import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Tournament } from '../../types';
import { Calendar, Clock, MapPin, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

export const MatchScheduler = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        round: 1,
        matchNumber: 1,
        mapName: 'Erangel',
        lobbyId: '',
        lobbyPassword: '',
        scheduledTime: '',
        liveStreamUrl: ''
    });

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                // Fetch active tournaments
                const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const list: Tournament[] = [];
                snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Tournament));
                setTournaments(list);
            } catch (error) {
                console.error("Error fetching tournaments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTournament) {
            toast.error("Please select a tournament");
            return;
        }

        try {
            setCreating(true);
            const matchData = {
                tournamentId: selectedTournament,
                round: Number(formData.round),
                matchNumber: Number(formData.matchNumber),
                mapName: formData.mapName,
                lobbyId: formData.lobbyId,
                lobbyPassword: formData.lobbyPassword,
                scheduledTime: new Date(formData.scheduledTime).getTime(),
                status: 'scheduled',
                teams: [], // Will be populated when teams join or admin assigns them
                results: [],
                createdBy: 'admin',
                liveStreamUrl: formData.liveStreamUrl,
                createdAt: Date.now()
            };

            await addDoc(collection(db, 'matches'), matchData);
            toast.success("Match scheduled successfully!");

            // Reset form (keep tournament selected)
            setFormData(prev => ({
                ...prev,
                matchNumber: prev.matchNumber + 1, // Auto-increment match number
                lobbyId: '',
                lobbyPassword: ''
            }));

        } catch (error) {
            console.error("Error creating match:", error);
            toast.error("Failed to schedule match");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading tournaments...</div>;

    return (
        <div className="min-h-screen bg-royal-black p-6">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow mb-8 flex items-center gap-3">
                    <Calendar className="w-8 h-8" /> MATCH SCHEDULER
                </h1>

                <div className="bg-dark-gray border border-gray-800 rounded-xl p-8 shadow-xl">

                    {/* Tournament Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Select Tournament</label>
                        <select
                            value={selectedTournament}
                            onChange={(e) => setSelectedTournament(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                        >
                            <option value="">-- Choose a Tournament --</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.game})</option>
                            ))}
                        </select>
                    </div>

                    {selectedTournament && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Round Number</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.round}
                                        onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Match Number</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.matchNumber}
                                        onChange={(e) => setFormData({ ...formData, matchNumber: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Map Name</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <select
                                            value={formData.mapName}
                                            onChange={(e) => setFormData({ ...formData, mapName: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-metallic-gold focus:outline-none"
                                        >
                                            <option value="Erangel">Erangel</option>
                                            <option value="Miramar">Miramar</option>
                                            <option value="Sanhok">Sanhok</option>
                                            <option value="Vikendi">Vikendi</option>
                                            <option value="Livik">Livik</option>
                                            <option value="Bermuda">Bermuda (FF)</option>
                                            <option value="Purgatory">Purgatory (FF)</option>
                                            <option value="Kalahari">Kalahari (FF)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Scheduled Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.scheduledTime}
                                            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-metallic-gold focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-800 pt-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Shield className="text-metallic-gold" size={20} /> Room Details (Private)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Room ID</label>
                                        <input
                                            type="text"
                                            value={formData.lobbyId}
                                            onChange={(e) => setFormData({ ...formData, lobbyId: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none font-mono"
                                            placeholder="123456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
                                        <input
                                            type="text"
                                            value={formData.lobbyPassword}
                                            onChange={(e) => setFormData({ ...formData, lobbyPassword: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none font-mono"
                                            placeholder="pass123"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                                <Bell className="text-blue-400" />
                                <div className="text-sm text-blue-200">
                                    Room details will be hidden from players until 15 minutes before the match start time.
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-metallic-gold text-black font-bold py-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-lg shadow-gold-glow disabled:opacity-50"
                            >
                                {creating ? 'Scheduling...' : (
                                    <>
                                        <Save size={24} /> SCHEDULE MATCH
                                    </>
                                )}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
