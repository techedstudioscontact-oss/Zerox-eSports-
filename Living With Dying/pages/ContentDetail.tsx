import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimeContent, User, AdCampaign } from '../types';
import { Button } from '../components/Button';
import { Play, Share2, Info, ShieldAlert, Plus, Check, List, Download, Lock } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { CommentSection } from '../components/CommentSection';
import { addToHistory, updateUserInDb } from '../services/authService';
import { InAppPlayer } from '../components/InAppPlayer';
import { toast } from 'sonner';
import { getActiveAds } from '../services/adService';
import { AdPlayer } from '../components/AdPlayer';

interface ContentDetailProps {
    user: User | null;
    contentList: AnimeContent[];
}

export const ContentDetail: React.FC<ContentDetailProps> = ({ user, contentList }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<AnimeContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [updatingList, setUpdatingList] = useState(false);

    // Player State
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentEpIndex, setCurrentEpIndex] = useState<number | null>(null);

    // Ad System State
    const [showingAd, setShowingAd] = useState(false);
    const [currentAd, setCurrentAd] = useState<AdCampaign | null>(null);
    const [prefetchedAds, setPrefetchedAds] = useState<AdCampaign[]>([]);
    const [pendingEpIndex, setPendingEpIndex] = useState<number | null>(null);

    useEffect(() => {
        // Prefetch ads on mount to avoid delay when clicking play
        const fetchAds = async () => {
            try {
                const ads = await getActiveAds();
                setPrefetchedAds(ads);
            } catch (e) {
                console.error("Failed to prefetch ads", e);
            }
        };
        fetchAds();
    }, []);

    useEffect(() => {
        const found = contentList.find(c => c.id === id);
        if (found) {
            setContent(found);
            if (user) {
                addToHistory(user, found.id).catch(err => console.error("Error updating history:", err));
            }
            setIsFavorite(user?.favorites?.includes(found.id) || false);
            setLoading(false);
        } else {
            // Wait for list to load or redirect if truly not found
            if (contentList.length > 0) navigate('/');
        }
    }, [id, contentList, navigate, user]);

    const handleToggleFavorite = async () => {
        if (!user || !content) return;
        setUpdatingList(true);
        try {
            let newFavorites = [...(user.favorites || [])];
            if (isFavorite) {
                newFavorites = newFavorites.filter(id => id !== content.id);
            } else {
                newFavorites.push(content.id);
            }
            await updateUserInDb({ ...user, favorites: newFavorites });
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Failed to update favorites", error);
        } finally {
            setUpdatingList(false);
        }
    };

    // Watch Progress Logic
    const [initialTime, setInitialTime] = useState(0);

    const handleProgressUpdate = async (time: number, duration: number) => {
        if (user && content) {
            import('../services/authService').then(({ updateWatchProgress }) => {
                updateWatchProgress(user, content.id, {
                    episodeIndex: currentEpIndex || 0,
                    timestamp: time,
                    duration: duration
                });
            });
        }
    };

    useEffect(() => {
        if (user && content && user.continueWatching && user.continueWatching[content.id]) {
            const progress = user.continueWatching[content.id];
            // If it's the same episode (or movie), set initial time
            if (progress.episodeIndex === (currentEpIndex || 0)) {
                setInitialTime(progress.timestamp);
            }
        }
    }, [user, content, currentEpIndex]);

    const handleShare = async () => {
        // Updated URL as requested
        const storeUrl = `https://techedstudioscontact-oss.github.io/aniryx/?watch=${id}`;
        try {
            await Share.share({
                title: content?.title || 'Aniryx',
                // Updated text format
                text: `Watch ${content?.title} on Aniryx!`,
                url: storeUrl,
                dialogTitle: 'Share with friends',
            });
        } catch (error) {
            console.error('Error sharing:', error);
            navigator.clipboard.writeText(storeUrl).then(() => toast.success("Link copied to clipboard!"));
        }
    };

    // Main Play Logic with Ad Interception
    const handlePlay = async (episodeIndex?: number) => {
        if (!content) return;

        // Security check
        const isUnlocked = user?.paidUser || user?.role === 'superadmin' || !content.isPremium;
        if (!isUnlocked) {
            navigate('/profile'); // Redirect to pay
            return;
        }

        // Logic to determine if we should show an ad
        let shouldPlayAd = true;

        if (user?.paidUser || user?.role === 'admin' || user?.role === 'superadmin') {
            console.log("Skipping ads: User is premium/admin");
            shouldPlayAd = false;
        } else {
            const lastAdTime = localStorage.getItem('lastAdSeen');
            if (lastAdTime) {
                const diff = Date.now() - parseInt(lastAdTime);
                // 15 Minutes Cap (Restored)
                if (diff < 15 * 60 * 1000) {
                    console.log("Skipping ads: Frequency cap active");
                    shouldPlayAd = false;
                }
            }
        }

        if (shouldPlayAd) {
            let adsToPlay = prefetchedAds;

            // Fallback: If prefetch hasn't finished yet, fetch now
            if (adsToPlay.length === 0) {
                try {
                    console.log("Ad Prefetch miss, fetching live...");
                    adsToPlay = await getActiveAds();
                } catch (e) {
                    console.error("Ad fetch failed", e);
                }
            }

            if (adsToPlay.length > 0) {
                const ad = adsToPlay[0];
                setCurrentAd(ad);
                setShowingAd(true);

                // Store intended destination to resume after ad
                if (episodeIndex !== undefined) {
                    setPendingEpIndex(episodeIndex);
                } else if (content.episodes?.length) {
                    setPendingEpIndex(0);
                }
                return; // Stop here, wait for ad to finish
            }
        }

        // No ad or skipped -> Start Content
        console.log("Starting Content directly (No ads found or skipped)");
        if (episodeIndex !== undefined) {
            setCurrentEpIndex(episodeIndex);
        } else if (content.episodes?.length) {
            setCurrentEpIndex(0);
        }
        setShowPlayer(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onAdComplete = () => {
        setShowingAd(false);
        setCurrentAd(null);
        localStorage.setItem('lastAdSeen', Date.now().toString());

        // Commit the pending index
        if (pendingEpIndex !== null) {
            setCurrentEpIndex(pendingEpIndex);
            setPendingEpIndex(null);
        }

        setShowPlayer(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    // Check for content existence and status
    if (!content) {
        return <div className="text-white text-center mt-20">Content not found</div>;
    }

    // Access Control: Allow Admins/Managers to preview regardless of status
    const isPrivileged = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'superadmin';
    if (!content.published && content.status !== 'published' && !isPrivileged) {
        return <div className="text-white text-center mt-20">Content is pending approval.</div>;
    }

    // Paywall Check (Privileged users bypass)
    if (content.isPremium && !user?.paidUser && !isPrivileged) {
        // Redirect or show paywall
        // (Logic handled in Home usually, but good safeguard here)
    }

    // Smart Recommendations: Sort by similar tags
    const safeTags = content.tags || [];
    const recommendations = contentList
        .filter(c => c.id !== content.id)
        .map(c => ({
            ...c,
            score: (c.tags || []).filter(t => safeTags.includes(t)).length
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const isUnlocked = user?.paidUser || user?.role === 'superadmin' || !content.isPremium;

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* AD PLAYER OVERLAY */}
            {showingAd && currentAd && (
                <AdPlayer ad={currentAd} onComplete={onAdComplete} />
            )}

            {/* Main Video Player */}
            {showPlayer && (
                <InAppPlayer
                    videoUrl={content.episodes && content.episodes.length > 0
                        ? content.episodes[currentEpIndex || 0].videoUrl
                        : content.videoUrl || ''}
                    poster={content.coverUrl || content.thumbnailUrl}
                    title={content.episodes && content.episodes.length > 0
                        ? `${content.title} - ${content.episodes[currentEpIndex || 0].title}`
                        : content.title}
                    onClose={() => setShowPlayer(false)}
                    /* removed unknown props */
                    episodes={content.episodes}
                    currentEpisodeIndex={currentEpIndex}
                    onEpisodeChange={(idx) => handlePlay(idx)}
                    startTime={initialTime}
                    onProgress={handleProgressUpdate}
                    introStart={Number(content.introStart) || 0}
                    introEnd={Number(content.introEnd) || 0}
                    outroStart={Number(content.outroStart) || 0}
                    outroEnd={Number(content.outroEnd) || 0}
                />
            )}

            {/* Hero Section */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={content.coverUrl || content.thumbnailUrl}
                        className="w-full h-full object-cover opacity-60"
                        alt="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 z-10">
                    <div className="container mx-auto">
                        <div className="flex gap-2 mb-4">
                            {(content.tags || []).map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-white border border-white/10 uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-none drop-shadow-2xl">
                            {content.title}
                        </h1>

                        <div className="flex items-center gap-4 text-gray-300 text-sm font-semibold mb-8">
                            <span className="text-green-400">98% Match</span>
                            <span>{new Date(content.createdAt).getFullYear()}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-white">HD</span>
                            {content.episodes && <span>{content.episodes.length} Episodes</span>}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => handlePlay()}
                                className="bg-white text-black hover:bg-gray-200 border-none"
                            >
                                {isUnlocked ? <Play className="mr-2 h-6 w-6 fill-black" /> : <Lock className="mr-2 h-5 w-5" />}
                                {isUnlocked ? 'Play Now' : 'Unlock Premium'}
                            </Button>

                            {user && (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleToggleFavorite}
                                    isLoading={updatingList}
                                    className={isFavorite ? "border-green-500/50 text-green-400 bg-green-500/10" : ""}
                                >
                                    {isFavorite ? <Check className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                                    {isFavorite ? 'In My List' : 'My List'}
                                </Button>
                            )}

                            {isUnlocked && (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={async () => {
                                        const url = content.downloadUrl ||
                                            (content.episodes?.length ? content.episodes[currentEpIndex || 0].videoUrl : content.videoUrl);

                                        if (url) {
                                            toast.info("Opening in External Browser...");
                                            await Browser.open({ url: url });
                                        } else {
                                            toast.error("No download link available");
                                        }
                                    }}
                                >
                                    <Download className="mr-2 h-5 w-5" /> Download
                                </Button>
                            )}

                            <Button variant="glass" size="lg" onClick={handleShare}>
                                <Share2 className="mr-2 h-5 w-5" /> Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-200">
                            <Info className="h-6 w-6 text-gray-500" />
                            Synopsis
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {content.description}
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-600">Released</span>
                                    <span className="text-gray-300">{new Date(content.createdAt).getFullYear()}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-600">Status</span>
                                    <span className="text-gray-300">{content.published ? 'Completed' : 'Ongoing'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-600">Uploaded By</span>
                                    <span className="text-gray-300">Admin #{content.uploadedBy.substring(0, 5)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episodes List (For Series) */}
                    {content.episodes && content.episodes.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <List className="text-primary" size={20} /> Season 1
                            </h3>
                            <div className="space-y-3">
                                {content.episodes.map((ep, idx) => (
                                    <div
                                        key={ep.id}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                handlePlay(idx);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border flex items-center gap-4 transition-all group cursor-pointer
                                                ${isUnlocked
                                                ? 'bg-surfaceHighlight hover:bg-white/10 border-white/5 hover:border-primary/50'
                                                : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-400 group-hover:text-primary transition-colors">
                                            {ep.number}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-gray-200 group-hover:text-white transition-colors">{ep.title}</h5>
                                            <div className="text-xs text-gray-500">Episode {ep.number}</div>
                                        </div>
                                        <div className="text-gray-500 group-hover:text-primary">
                                            {isUnlocked ? <Play size={20} className="fill-current" /> : <ShieldAlert size={16} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <CommentSection contentId={content.id} user={user} />
                </div>


                {/* Sidebar (Recommendations) */}
                <div className="hidden lg:block">
                    <div className="rounded-2xl bg-surfaceHighlight p-6 border border-white/5">
                        <h4 className="font-bold text-white mb-4">You might also like</h4>
                        <div className="space-y-4">
                            {recommendations.map(rec => (
                                <div key={rec.id} className="flex gap-4 group cursor-pointer" onClick={() => navigate(`/watch/${rec.id}`)}>
                                    <div className="w-20 h-28 shrink-0 overflow-hidden rounded-md">
                                        <img src={rec.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-sm group-hover:text-primary transition-colors">{rec.title}</h5>
                                        <span className="text-xs text-gray-500 mt-1 block">{rec.tags[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
