import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import type { Tournament } from '../../types';
import { getAuth } from 'firebase/auth';
import { Upload, Users, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export const TeamRegistration = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const auth = getAuth();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState(['', '', '', '']); // 4 players max for squad
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

    useEffect(() => {
        const fetchTournament = async () => {
            if (!id) return;
            const docRef = doc(db, 'tournaments', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTournament({ id: docSnap.id, ...docSnap.data() } as Tournament);
            }
            setLoading(false);
        };
        fetchTournament();
    }, [id]);

    const handlePlayerChange = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !tournament || !id) return;

        // Validation
        if (!teamName.trim()) {
            toast.error("Team name is required");
            return;
        }
        if (players.some(p => !p.trim())) {
            toast.error("All player names are required");
            return;
        }
        if (tournament.entryFee > 0 && !paymentScreenshot) {
            toast.error("Payment screenshot is required for paid tournaments");
            return;
        }

        try {
            setSubmitting(true);
            let paymentProofUrl = '';

            // Upload Screenshot if needed
            if (paymentScreenshot) {
                const storageRef = ref(storage, `payments/${tournament.id}_${auth.currentUser.uid}_${Date.now()}`);
                await uploadBytes(storageRef, paymentScreenshot);
                paymentProofUrl = await getDownloadURL(storageRef);
            }

            // Create Team
            const teamData = {
                name: teamName,
                tournamentId: tournament.id,
                captainId: auth.currentUser.uid,
                players: players,
                isVerified: false,
                paymentStatus: tournament.entryFee > 0 ? 'pending' : 'paid',
                paymentProofUrl,
                paidAmount: 0,
                registeredAt: Date.now(),
                totalPoints: 0
            };

            await addDoc(collection(db, 'teams'), teamData);

            // Increment current teams count in tournament
            const tournamentRef = doc(db, 'tournaments', id);
            await updateDoc(tournamentRef, {
                currentTeams: increment(1)
            });

            toast.success("Team registered successfully!");
            navigate(`/tournament/${id}`);

        } catch (error) {
            console.error("Error registering team:", error);
            toast.error("Failed to register team");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-royal-black text-white p-8">Loading...</div>;
    if (!tournament) return <div className="min-h-screen bg-royal-black text-white p-8">Tournament not found</div>;

    return (
        <div className="min-h-screen bg-royal-black p-6">
            <div className="container mx-auto max-w-2xl">

                <h1 className="text-3xl font-display font-bold text-metallic-gold mb-2">TEAM REGISTRATION</h1>
                <p className="text-gray-400 mb-8">Registering for: <span className="text-white font-bold">{tournament.name}</span></p>

                <form onSubmit={handleSubmit} className="bg-dark-gray border border-gray-800 rounded-xl p-8 space-y-6 shadow-xl">

                    {/* Team Info */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Team Name</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                            placeholder="Enter your team name"
                        />
                    </div>

                    {/* Players */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                            <Users size={16} /> Player IGNs (In-Game Names)
                        </label>
                        <div className="space-y-3">
                            {players.map((player, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={player}
                                    onChange={(e) => handlePlayerChange(idx, e.target.value)}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                    placeholder={idx === 0 ? "Player 1 (Captain)" : `Player ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Payment (Conditional) */}
                    {tournament.entryFee > 0 && (
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <CreditCard className="text-metallic-gold" /> Payment Required
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Please pay <span className="text-metallic-gold font-bold">{tournament.entryFee} INR</span> to UPI ID: <span className="text-white font-mono select-all">zeroxesports@upi</span>
                            </p>

                            <label className="block w-full cursor-pointer bg-dark-gray border border-gray-600 border-dashed rounded-lg p-4 text-center hover:border-metallic-gold transition-colors">
                                <Upload className="mx-auto text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400">Upload Payment Screenshot</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPaymentScreenshot(e.target.files ? e.target.files[0] : null)}
                                    className="hidden"
                                />
                            </label>
                            {paymentScreenshot && <div className="text-green-500 text-xs mt-2 text-center">{paymentScreenshot.name}</div>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-metallic-gold text-black font-bold py-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-lg shadow-gold-glow disabled:opacity-50"
                    >
                        {submitting ? 'Registering...' : (
                            <>
                                <ShieldCheck size={24} /> CONFIRM REGISTRATION
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};
