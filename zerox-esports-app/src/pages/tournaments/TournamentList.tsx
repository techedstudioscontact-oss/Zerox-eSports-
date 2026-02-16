import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Tournament } from '../../types';
import { Users, Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TournamentList = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            // Fetch all tournaments, ideally filter by active status or date
            const q = query(
                collection(db, 'tournaments'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const list: Tournament[] = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Tournament);
            });
            setTournaments(list);
        } catch (error) {
            console.error("Error fetching tournaments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-400 py-12">Loading tournaments...</div>;
    }

    if (tournaments.length === 0) {
        return (
            <div className="bg-dark-gray border border-border-gold rounded-xl p-12 text-center">
                <Trophy className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">No active tournaments</p>
                <p className="text-gray-500 text-sm mt-2">Stay tuned for upcoming leagues!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
                <Link to={`/tournament/${tournament.id}`} key={tournament.id} className="bg-dark-gray border border-gray-800 rounded-xl overflow-hidden hover:border-metallic-gold transition-all group shadow-lg block">
                    {/* Cover Image */}
                    <div className="h-48 overflow-hidden relative">
                        <img
                            src={tournament.coverUrl || 'https://via.placeholder.com/400x200'}
                            alt={tournament.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white border border-gray-700">
                            {tournament.game} • {tournament.mode}
                        </div>
                        <div className="absolute bottom-2 left-2 flex gap-2">
                            <div className="bg-metallic-gold text-black px-2 py-1 rounded font-bold text-xs uppercase">
                                {tournament.status}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-1">{tournament.name}</h3>

                        <div className="flex justify-between items-center text-gray-400 text-sm mb-4">
                            <div className="flex items-center gap-1">
                                <Users size={14} className="text-metallic-gold" />
                                {tournament.currentTeams}/{tournament.maxTeams} Teams
                            </div>
                            <div className="flex items-center gap-1">
                                <Trophy size={14} className="text-metallic-gold" />
                                ₹{tournament.prizePool}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                            <div className="text-sm">
                                <span className="text-gray-500 block">Entry Fee</span>
                                <span className="font-bold text-metallic-gold">
                                    {tournament.entryFee === 0 ? 'FREE' : `${tournament.entryFee} 🪙`}
                                </span>
                            </div>
                            <button className="bg-royal-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold border border-gray-700 transition-colors flex items-center gap-1">
                                View Details <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};
