import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Tournament } from '../../types';
import { Calendar, Trophy, Users, Shield, ChevronLeft } from 'lucide-react';

export const TournamentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'tournaments', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTournament({ id: docSnap.id, ...docSnap.data() } as Tournament);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching tournament:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, navigate]);

    if (loading) return <div className="min-h-screen bg-royal-black flex items-center justify-center text-metallic-gold">Loading...</div>;
    if (!tournament) return null;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="min-h-screen bg-royal-black pb-12">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
                <img
                    src={tournament.coverUrl}
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-black via-black/50 to-transparent"></div>

                <Link to="/" className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-metallic-gold hover:text-black transition-colors">
                    <ChevronLeft size={24} />
                </Link>

                <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <span className="bg-metallic-gold text-black px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 inline-block">
                                {tournament.game} • {tournament.mode}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white text-shadow-lg mb-2">
                                {tournament.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-300 text-sm">
                                <span className="flex items-center gap-1"><Users size={16} /> {tournament.currentTeams}/{tournament.maxTeams} Teams</span>
                                <span className="flex items-center gap-1"><Trophy size={16} /> ₹{tournament.prizePool} Prize</span>
                            </div>
                        </div>

                        {tournament.status === 'upcoming' || tournament.status === 'registration' ? (
                            <Link
                                to={`/tournament/${tournament.id}/register`}
                                className="bg-metallic-gold text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors shadow-gold-glow animate-pulse"
                            >
                                REGISTER NOW
                            </Link>
                        ) : (
                            <button disabled className="bg-gray-700 text-gray-400 font-bold py-3 px-8 rounded-lg cursor-not-allowed">
                                REGISTRATION CLOSED
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">

                    {/* Schedule */}
                    <div className="bg-dark-gray border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="text-metallic-gold" /> Schedule
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Registration Starts</span>
                                <span className="text-white font-mono">{formatDate(tournament.registrationStart)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Registration Ends</span>
                                <span className="text-white font-mono">{formatDate(tournament.registrationEnd)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Tournament Starts</span>
                                <span className="text-white font-bold text-metallic-gold font-mono">{formatDate(tournament.tournamentStart)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-dark-gray border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="text-metallic-gold" /> Rules & Format
                        </h2>
                        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line">
                            {tournament.rules || "No specific rules provided. Standard fair play rules apply."}
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Prize Pool */}
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-metallic-gold rounded-xl p-6 text-center shadow-lg">
                        <h3 className="text-gray-400 text-sm uppercase mb-1">Total Prize Pool</h3>
                        <div className="text-4xl font-bold text-metallic-gold mb-2">₹{tournament.prizePool}</div>
                        <div className="text-xs text-gray-500">Entry Fee: {tournament.entryFee > 0 ? `${tournament.entryFee} Coins` : 'FREE'}</div>
                    </div>

                    {/* Stats */}
                    <div className="bg-dark-gray border border-gray-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Tournament Info</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className="text-metallic-gold uppercase font-bold text-xs bg-black/50 px-2 py-1 rounded">
                                    {tournament.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Mode</span>
                                <span className="text-white">{tournament.mode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Scoring</span>
                                <span className="text-white capitalize">{tournament.scoringSystem}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
