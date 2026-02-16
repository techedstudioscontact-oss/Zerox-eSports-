import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Trophy, Upload, Save, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const CreateTournament = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        game: 'BGMI',
        mode: 'Squad',
        registrationStart: '',
        registrationEnd: '',
        tournamentStart: '',
        tournamentEnd: '',
        maxTeams: 100,
        entryFee: 0,
        prizePool: 0,
        rules: '',
        scoringSystem: 'placement',
        coverImage: null as File | null,
        thumbnailImage: null as File | null
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                [type === 'cover' ? 'coverImage' : 'thumbnailImage']: e.target.files![0]
            }));
        }
    };

    const uploadImage = async (file: File, path: string) => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.coverImage || !formData.thumbnailImage) {
            toast.error("Please upload both cover and thumbnail images");
            return;
        }

        try {
            setLoading(true);

            // 1. Upload Images
            const coverUrl = await uploadImage(formData.coverImage, `tournaments/${Date.now()}_cover`);
            const thumbnailUrl = await uploadImage(formData.thumbnailImage, `tournaments/${Date.now()}_thumb`);

            // 2. Create Tournament Object
            const tournamentData = {
                name: formData.name,
                game: formData.game,
                mode: formData.mode,
                registrationStart: new Date(formData.registrationStart).getTime(),
                registrationEnd: new Date(formData.registrationEnd).getTime(),
                tournamentStart: new Date(formData.tournamentStart).getTime(),
                tournamentEnd: new Date(formData.tournamentEnd).getTime(),
                maxTeams: Number(formData.maxTeams),
                currentTeams: 0,
                entryFee: Number(formData.entryFee),
                prizePool: Number(formData.prizePool),
                rules: formData.rules,
                scoringSystem: formData.scoringSystem,
                status: 'upcoming',
                published: true,
                isPinned: false,
                coverUrl,
                thumbnailUrl,
                createdBy: 'admin', // Should be current user ID
                createdAt: Date.now()
            };

            // 3. Save to Firestore
            await addDoc(collection(db, 'tournaments'), tournamentData);

            toast.success("Tournament created successfully!");
            navigate('/');
        } catch (error) {
            console.error("Error creating tournament:", error);
            toast.error("Failed to create tournament");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-royal-black p-6">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow mb-8 flex items-center gap-3">
                    <Trophy className="w-8 h-8" /> CREATE TOURNAMENT
                </h1>

                <form onSubmit={handleSubmit} className="bg-dark-gray border border-gray-800 rounded-xl p-8 space-y-8 shadow-xl">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Tournament Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                placeholder="e.g. Zerox Championship Season 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Game Title</label>
                            <select
                                value={formData.game}
                                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                            >
                                <option value="BGMI">BGMI</option>
                                <option value="Free Fire">Free Fire</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Game Mode</label>
                            <select
                                value={formData.mode}
                                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                            >
                                <option value="Solo">Solo</option>
                                <option value="Duo">Duo</option>
                                <option value="Squad">Squad</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-800"></div>

                    {/* Schedule */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="text-metallic-gold" /> Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Registration Start</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.registrationStart}
                                    onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Registration End</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.registrationEnd}
                                    onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Tournament Start</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.tournamentStart}
                                    onChange={(e) => setFormData({ ...formData, tournamentStart: e.target.value })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Tournament End</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.tournamentEnd}
                                    onChange={(e) => setFormData({ ...formData, tournamentEnd: e.target.value })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800"></div>

                    {/* Economy & Details */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="text-metallic-gold" /> Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Entry Fee (Coins)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.entryFee}
                                    onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Prize Pool (INR)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.prizePool}
                                    onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Max Teams</label>
                                <input
                                    type="number"
                                    required
                                    min="2"
                                    value={formData.maxTeams}
                                    onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-metallic-gold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800"></div>

                    {/* Media */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Upload className="text-metallic-gold" /> Media
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 border border-gray-700 border-dashed rounded-lg p-6 text-center hover:border-metallic-gold transition-colors">
                                <label className="cursor-pointer block">
                                    <div className="text-gray-400 text-sm mb-2">Cover Image (16:9)</div>
                                    <Upload className="mx-auto text-gray-500 mb-2" />
                                    <span className="text-xs text-gray-500">Click to upload</span>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'cover')} className="hidden" accept="image/*" />
                                </label>
                                {formData.coverImage && <div className="text-green-500 text-xs mt-2">{formData.coverImage.name}</div>}
                            </div>

                            <div className="bg-black/40 border border-gray-700 border-dashed rounded-lg p-6 text-center hover:border-metallic-gold transition-colors">
                                <label className="cursor-pointer block">
                                    <div className="text-gray-400 text-sm mb-2">Thumbnail (1:1)</div>
                                    <Upload className="mx-auto text-gray-500 mb-2" />
                                    <span className="text-xs text-gray-500">Click to upload</span>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'thumbnail')} className="hidden" accept="image/*" />
                                </label>
                                {formData.thumbnailImage && <div className="text-green-500 text-xs mt-2">{formData.thumbnailImage.name}</div>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-metallic-gold text-black font-bold py-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-lg shadow-gold-glow disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <Save size={24} /> PUBLISH TOURNAMENT
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};
