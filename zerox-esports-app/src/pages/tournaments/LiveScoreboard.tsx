import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Match, Team, User } from '../../types';
import { Trophy, Swords, Save, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface LiveScoreboardProps {
    user?: User;
    isAdminView?: boolean;
}

export const LiveScoreboard = ({ isAdminView = false }: LiveScoreboardProps) => {
    const { id } = useParams<{ id: string }>(); // Tournament ID
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);

    // Admin Editing State
    const [editResults, setEditResults] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        // 1. Listen for Matches
        const q = query(collection(db, 'matches'), where('tournamentId', '==', id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Match[] = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Match));
            setMatches(list.sort((a, b) => b.createdAt - a.createdAt)); // Newest first

            // Auto-select ongoing or latest match
            if (!selectedMatch && list.length > 0) {
                const ongoing = list.find(m => m.status === 'ongoing');
                setSelectedMatch(ongoing || list[0]);
            }
        });

        // 2. Fetch Teams (for Admin dropdowns/names)
        const fetchTeams = async () => {
            const qTeams = query(collection(db, 'teams'), where('tournamentId', '==', id));
            const snapshot = await getDocs(qTeams);
            const teamList: Team[] = [];
            snapshot.forEach(doc => teamList.push({ id: doc.id, ...doc.data() } as Team));
            setTeams(teamList);
        };
        fetchTeams();

        return () => unsubscribe();
    }, [id]);

    // Initialize edit state when match changes
    useEffect(() => {
        if (selectedMatch && isAdminView) {
            if (selectedMatch.results && selectedMatch.results.length > 0) {
                setEditResults(selectedMatch.results);
            } else {
                // Initialize with empty results for all teams
                const initialResults = teams.map(team => ({
                    teamId: team.id,
                    teamName: team.name, // Helper for UI
                    placement: 0,
                    kills: 0,
                    placementPoints: 0,
                    killPoints: 0,
                    totalPoints: 0
                }));
                setEditResults(initialResults);
            }
        }
    }, [selectedMatch, teams, isAdminView]);

    const handleScoreUpdate = (index: number, field: string, value: number) => {
        const newResults = [...editResults];
        newResults[index][field] = value;
        // Recalculate totals (Simple logic: 1 kill = 1 pt. Customize as needed)
        // Placement points usually depend on a matrix, letting admin enter manually for now
        newResults[index].killPoints = newResults[index].kills * 1;
        newResults[index].totalPoints = newResults[index].placementPoints + newResults[index].killPoints;
        setEditResults(newResults);
    };

    const saveScores = async () => {
        if (!selectedMatch) return;
        try {
            setIsSaving(true);
            const matchRef = doc(db, 'matches', selectedMatch.id);

            // Clean up results before saving (remove helper fields if any)
            const cleanResults = editResults.map(({ teamName, ...rest }) => rest);

            await updateDoc(matchRef, {
                results: cleanResults,
                status: 'completed' // Or keep ongoing
            });
            toast.success("Scores updated successfully!");
        } catch (error) {
            console.error("Error saving scores:", error);
            toast.error("Failed to update scores");
        } finally {
            setIsSaving(false);
        }
    };

    if (matches.length === 0) {
        return <div className="p-8 text-center text-gray-500">No matches scheduled for this tournament yet.</div>;
    }

    return (
        <div className="min-h-screen bg-royal-black text-white p-6">
            <div className="container mx-auto">

                {/* Header & Match Selector */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-display font-bold text-metallic-gold flex items-center gap-2">
                        <Activity className="animate-pulse" /> LIVE SCOREBOARD
                    </h1>
                    <select
                        className="bg-dark-gray border border-gray-700 rounded-lg p-2 text-white"
                        onChange={(e) => setSelectedMatch(matches.find(m => m.id === e.target.value) || null)}
                        value={selectedMatch?.id}
                    >
                        {matches.map(m => (
                            <option key={m.id} value={m.id}>
                                M{m.matchNumber}: {m.mapName} ({m.status})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Admin Editor */}
                {isAdminView && selectedMatch && (
                    <div className="bg-dark-gray border border-metallic-gold rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Swords className="text-red-500" /> Admin Score Controls
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-700">
                                        <th className="p-2">Team</th>
                                        <th className="p-2">Placement</th>
                                        <th className="p-2">Place Pts</th>
                                        <th className="p-2">Kills</th>
                                        <th className="p-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editResults.map((result, idx) => (
                                        <tr key={idx} className="border-b border-gray-800">
                                            <td className="p-2 font-bold">{teams.find(t => t.id === result.teamId)?.name || 'Unknown Team'}</td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-16 bg-black/40 border border-gray-600 rounded p-1"
                                                    value={result.placement}
                                                    onChange={(e) => handleScoreUpdate(idx, 'placement', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-16 bg-black/40 border border-gray-600 rounded p-1"
                                                    value={result.placementPoints}
                                                    onChange={(e) => handleScoreUpdate(idx, 'placementPoints', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-16 bg-black/40 border border-gray-600 rounded p-1"
                                                    value={result.kills}
                                                    onChange={(e) => handleScoreUpdate(idx, 'kills', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 font-bold text-metallic-gold">{result.totalPoints}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={saveScores}
                            disabled={isSaving}
                            className="mt-4 bg-metallic-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} /> {isSaving ? 'Updating...' : 'Update Leaderboard'}
                        </button>
                    </div>
                )}

                {/* Public View */}
                {selectedMatch ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Match Info */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 text-center">
                                <div className="text-gray-400 uppercase text-xs font-bold mb-1">Match Status</div>
                                <div className="text-2xl font-bold text-white uppercase mb-4">{selectedMatch.status}</div>
                                <div className="flex justify-between text-sm border-t border-gray-800 pt-4">
                                    <span className="text-gray-500">Map</span>
                                    <span className="text-white font-bold">{selectedMatch.mapName}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-500">Round</span>
                                    <span className="text-white font-bold">{selectedMatch.round}</span>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-dark-gray border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                                <table className="w-full">
                                    <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 text-left">#</th>
                                            <th className="p-4 text-left">Team</th>
                                            <th className="p-4 text-center">WWCD</th>
                                            <th className="p-4 text-center">Kills</th>
                                            <th className="p-4 text-center">Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {(selectedMatch.results || [])
                                            .sort((a, b) => b.totalPoints - a.totalPoints)
                                            .map((result, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-gray-500 font-mono">#{idx + 1}</td>
                                                    <td className="p-4 font-bold text-white">
                                                        {teams.find(t => t.id === result.teamId)?.name || 'Unknown Team'}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {result.placement === 1 && <Trophy className="inline text-metallic-gold w-4 h-4" />}
                                                        {result.placement !== 1 && <span className="text-gray-600">-</span>}
                                                    </td>
                                                    <td className="p-4 text-center text-gray-300 font-mono">
                                                        {result.kills}
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-metallic-gold text-lg">
                                                        {result.totalPoints}
                                                    </td>
                                                </tr>
                                            ))}
                                        {(!selectedMatch.results || selectedMatch.results.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                                    Waiting for results...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-12">Select a match to view details</div>
                )}

            </div>
        </div>
    );
};
