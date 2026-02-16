import React, { useState, useMemo } from 'react';
import { AnimeCard } from '../components/AnimeCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { User, AnimeContent, WatchProgress } from '../types';
import { CATEGORIES, USER_UNLOCK_PRICE } from '../constants';
import { PaymentModal } from './PaymentModal';
import { CardSkeleton } from '../components/SkeletonLoader';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface HomeProps {
  user: User | null;
  content: AnimeContent[];
  onUnlockContent: () => Promise<void>;
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({ user, content, onUnlockContent, searchQuery }) => {
  const [activeCategory, setActiveCategory] = useState("Recent");
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (item: AnimeContent) => {
    if (!item.isPremium) {
      navigate(`/watch/${item.id}`);
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // Master Admin & Paid Users bypass lock
    if (user.role === 'superadmin' || user.paidUser) {
      navigate(`/watch/${item.id}`);
    } else {
      setShowPaywall(true);
    }
  };

  // Filtering Logic
  // If Search Query exists, ignore active category and filter globally
  // If no search, use active category
  const filteredContent = useMemo(() => {
    let data = content.filter(c => c.status === 'published' || !c.status); // Default to published if undefined (backwards compat)

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    } else {
      if (activeCategory === "Recent") {
        // No additional category filter needed for "Recent"
      } else {
        data = data.filter(c => c.tags.includes(activeCategory));
      }
    }

    return data.sort((a, b) => {
      // Sort by Pinned status (Pinned first)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by creation date (newest first) - assuming ID or another field proxies for date if not explicit
      return 0;
    });
  }, [content, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen pb-20">

      {/* Hero Carousel - Featured Content (Only show if not searching) */}
      {/* Hero Carousel - Featured Content (Pinned First, then Premium) */}
      {!searchQuery && <HeroCarousel content={[...content].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).filter(c => c.isPinned || c.isPremium)} />}

      {/* Categories Strip (Hide when searching to reduce clutter, or keep disabled) */}
      {!searchQuery && (
        <div className="sticky top-16 z-40 mb-8 border-b border-white/5 bg-black/80 backdrop-blur-md">
          <div className="container mx-auto">
            <div className="flex gap-4 overflow-x-auto px-4 py-4 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all
                    ${activeCategory === cat
                      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching Section - Smart */}
      {user && user.continueWatching && Object.keys(user.continueWatching).length > 0 && (
        <div className="container mx-auto px-4 mb-4">
          <h2 className="text-xl font-bold text-white mb-4 px-2 font-display flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Continue Watching
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x touch-pan-x no-scrollbar">
            {console.log("Rendering Watch History:", user.continueWatching)}
            {Object.entries(user.continueWatching)
              .sort(([, a], [, b]) => (b as WatchProgress).lastWatched - (a as WatchProgress).lastWatched) // Sort by most recent
              .slice(0, 10)
              .map(([contentId, progress]) => {
                const p = progress as WatchProgress;
                const histContent = content.find(c => c.id === contentId);
                if (!histContent) return null;

                // Cap percentage at 95 to avoid "completed" look if user just re-opened? 
                // No, let's just show actual percentage.
                const percent = Math.min(100, Math.max(0, p.progress * 100));

                return (
                  <div key={histContent.id} className="min-w-[220px] md:min-w-[260px] snap-start relative group cursor-pointer" onClick={() => handleCardClick(histContent)}>
                    {/* Card Image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                      <img src={histContent.coverUrl || histContent.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 px-1">
                      <h4 className="font-bold text-white truncate text-sm">{histContent.title}</h4>
                      <p className="text-xs text-gray-400">
                        {histContent.episodes ? `S1:E${p.episodeIndex + 1}` :
                          (percent > 90 ? 'Completed' : `${Math.floor(percent)}% Watched`)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`container mx-auto px-4 ${searchQuery ? 'mt-24' : ''}`}>
        <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
          {searchQuery ? (
            <>
              <Search className="h-5 w-5 text-primary" />
              <span>Results for "{searchQuery}"</span>
            </>
          ) : (
            <>
              <span className="h-6 w-1 rounded bg-accent block"></span>
              {activeCategory} Series
            </>
          )}
        </h2>

        {filteredContent.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">No spirits found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredContent.map(item => (
              <AnimeCard
                key={item.id}
                content={item}
                isUnlocked={user?.paidUser || user?.role === 'superadmin' || !item.isPremium}
                onClick={() => handleCardClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        amount={USER_UNLOCK_PRICE}
        title="Unlock All Anime"
        description="Get lifetime access to the entire Aniryx library."
        benefits={[
          "Unlimited streaming",
          "No hidden subscriptions",
          "Access to future releases",
          "High quality playback"
        ]}
        onConfirm={onUnlockContent}
      />
    </div>
  );
};