import React, { useState } from 'react';
import { AnimeContent } from '../types';
import { Lock, Play, Heart, ShieldAlert } from 'lucide-react';
import { getSessionUser, toggleFavorite } from '../services/authService';
import { Button } from './Button';

interface AnimeCardProps {
  content: AnimeContent;
  isUnlocked: boolean;
  onClick: () => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ content, isUnlocked, onClick }) => {
  const user = getSessionUser();
  const [isFavorite, setIsFavorite] = useState(user?.favorites?.includes(content.id) || false);

  const [showWarning, setShowWarning] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert("Please Login to add to favorites");

    setIsFavorite(!isFavorite);
    await toggleFavorite(user, content.id);
  };

  const handleCardClick = () => {
    if (content.tags.includes('18+')) {
      setShowWarning(true);
    } else {
      onClick();
    }
  };

  const confirmEnter = () => {
    setShowWarning(false);
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surfaceHighlight cursor-pointer shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] ring-1 ring-white/5 hover:ring-primary/50"
    >
      {/* Thumbnail Image with Cinematic Parallax Effect */}
      <img
        src={content.coverUrl || content.thumbnailUrl}
        alt={content.title}
        className={`h-full w-full object-cover transition-transform duration-[2000ms] ease-out will-change-transform group-hover:scale-110 group-hover:translate-y-[-10px] ${!isUnlocked ? 'blur-[2px] grayscale-[50%]' : ''}`}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>

      {/* Locked State Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
          {/* Lock Icon: Breathing animation + Scale up on hover */}
          <div className="rounded-full bg-black/80 p-4 text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 animate-pulse-slow group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] group-hover:border-accent/50">
            <Lock className="h-6 w-6 text-gray-300 group-hover:text-accent transition-colors duration-300" />
          </div>
          <span className="mt-3 text-[10px] font-display font-bold text-white/80 uppercase tracking-[0.2em] border border-white/20 px-2 py-1 rounded group-hover:bg-white/10 transition-colors">Locked Content</span>
        </div>
      )}

      {/* Play Icon on Hover (if unlocked) */}
      {isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm bg-black/20">
          <div className="flex gap-4">
            <div className="rounded-full bg-primary/90 p-4 text-white shadow-[0_0_30px_rgba(217,70,239,0.6)] transform scale-50 group-hover:scale-100 transition-all duration-300 hover:bg-primary">
              <Play className="h-8 w-8 fill-current translate-x-1" />
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="rounded-full bg-black/60 border border-white/20 p-4 text-white hover:bg-white/20 transition-all transform scale-50 group-hover:scale-100"
            >
              <Heart className={`h-8 w-8 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Content Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        {content.tags && content.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {content.tags.slice(0, 2).map(tag => (
              <span key={tag} className="rounded-sm bg-primary/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="line-clamp-2 text-sm sm:text-lg font-display font-bold leading-tight text-white group-hover:text-primary transition-colors text-shadow-sm">
          {content.title}
        </h3>
      </div>

      {/* 18+ Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowWarning(false)}></div>
          <div className="relative max-w-sm w-full bg-[#1a1a1a] border border-yellow-500/30 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] mx-4 animate-fade-in">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
              <ShieldAlert className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">Content Warning</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              This content contains mature themes (<span className="text-yellow-500 font-bold">18+</span>).<br />
              Viewer discretion is advised.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowWarning(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={confirmEnter}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
