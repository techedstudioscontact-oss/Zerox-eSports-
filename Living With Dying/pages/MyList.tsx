import React, { useEffect, useState } from 'react';
import { AnimeContent, User } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Heart } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { PaymentModal } from './PaymentModal';
import { USER_UNLOCK_PRICE } from '../constants';

interface MyListProps {
    user: User | null;
    content: AnimeContent[];
}

export const MyList: React.FC<MyListProps> = ({ user, content }) => {
    const [favorites, setFavorites] = useState<AnimeContent[]>([]);
    const [showPaywall, setShowPaywall] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (item: AnimeContent) => {
        if (!item.isPremium) {
            navigate(`/watch/${item.id}`);
            return;
        }

        if (user && (user.role === 'superadmin' || user.paidUser)) {
            navigate(`/watch/${item.id}`);
        } else {
            setShowPaywall(true);
        }
    };

    useEffect(() => {
        if (user && user.favorites) {
            const userFavs = content.filter(c => user.favorites.includes(c.id));
            setFavorites(userFavs);
        }
    }, [user, content]);

    if (!user) {
        return (
            <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center text-center">
                <Heart className="w-16 h-16 text-gray-700 mb-4" />
                <h2 className="text-2xl font-bold text-gray-500">Sign in to view your list</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="container mx-auto px-4 pt-8">
                <h1 className="text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                    <Heart className="text-primary fill-primary" /> My List
                </h1>

                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-white/5">
                        <Heart className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg">Your list is empty.</p>
                        <p className="text-sm mt-1">Add shows/movies to track what you want to watch.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {favorites.map((item) => {
                            const isUnlocked = !item.isPremium || (user?.paidUser || user?.role === 'superadmin');

                            return (
                                <AnimeCard
                                    key={item.id}
                                    content={item}
                                    isUnlocked={isUnlocked}
                                    onClick={() => handleCardClick(item)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Paywall Modal */}
            {showPaywall && user && (
                <PaymentModal
                    user={user}
                    onClose={() => setShowPaywall(false)}
                    price={USER_UNLOCK_PRICE}
                    onSuccess={async () => {
                        setShowPaywall(false);
                        // Ideally we refresh user here or rely on App.tsx to update user state
                        // For now we just close, assuming global state updates
                    }}
                />
            )}
        </div>
    );
};
