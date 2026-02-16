import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, Lock, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
    maintenanceMode: boolean;
    registrationsOpen: boolean;
    welcomeBonus: number;
    platformFee: number;
}

export const SystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        maintenanceMode: false,
        registrationsOpen: true,
        welcomeBonus: 100,
        platformFee: 10
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data() as SystemSettings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await setDoc(doc(db, 'settings', 'global'), settings);
            toast.success('System settings saved successfully');
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error('Failed to save settings');
        }
    };

    if (loading) return <div className="text-white p-8">Loading settings...</div>;

    return (
        <div className="min-h-screen bg-royal-black p-6">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow mb-8">
                    SYSTEM SETTINGS
                </h1>

                <div className="bg-dark-gray border border-gray-800 rounded-xl p-6 space-y-6">

                    {/* Access Control */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock className="text-metallic-gold" /> Access Control
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800">
                            <div>
                                <div className="font-bold text-white">Maintenance Mode</div>
                                <div className="text-sm text-gray-400">Lock app for all non-admin users</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800">
                            <div>
                                <div className="font-bold text-white">Registrations Open</div>
                                <div className="text-sm text-gray-400">Allow new users to sign up</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.registrationsOpen}
                                    onChange={(e) => setSettings({ ...settings, registrationsOpen: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-700" />

                    {/* Economy Settings */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="text-metallic-gold" /> Economy
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Welcome Bonus (Coins)</label>
                                <input
                                    type="number"
                                    value={settings.welcomeBonus}
                                    onChange={(e) => setSettings({ ...settings, welcomeBonus: parseInt(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Platform Fee (%)</label>
                                <input
                                    type="number"
                                    value={settings.platformFee}
                                    onChange={(e) => setSettings({ ...settings, platformFee: parseInt(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded p-2 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-metallic-gold text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Save Changes
                    </button>

                </div>
            </div>
        </div>
    );
};
