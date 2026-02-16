import React, { useState, useEffect } from 'react';
import { User, AnimeContent } from '../types';
import { Button } from '../components/Button';
import { ADMIN_FEE_PRICE, CURRENCY_SYMBOL, CATEGORIES } from '../constants';
import { PaymentModal } from './PaymentModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
    Upload, DollarSign, Settings, Wallet, CheckCircle2, FileText, Plus,
    BarChart3, Activity, Users, Shield, ShieldAlert, Lock, Unlock, Film, PlusCircle, ChevronRight, LayoutDashboard, Trash2, Camera, Image as ImageIcon, Pin, List, Zap, Mail, PenSquare, X, Download, AlertTriangle
} from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { requestPayout } from '../services/payoutService';
import { updateUserInDb } from '../services/authService';
import { toast } from 'sonner';
import { subscribeToRequests, ContentRequest } from '../services/requestService';
import { getAdminActivity } from '../services/commissionService';
import { AdminActivity } from '../types';

// ... (existing imports)

type Tab = 'content' | 'settings' | 'stats' | 'wallet' | 'requests';

interface AdminDashboardProps {
    user: User;
    userContent: AnimeContent[];
    onBecomeAdmin: () => Promise<void>;
    onUpload: (content: Omit<AnimeContent, 'id' | 'createdAt' | 'uploadedBy'>) => Promise<void>;
    onUpdate: (id: string, content: Partial<AnimeContent>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, userContent, onBecomeAdmin, onUpload, onUpdate, onDelete }) => {
    // ... (existing state)
    // ... (existing state)
    const [requests, setRequests] = useState<ContentRequest[]>([]);
    const [myActivity, setMyActivity] = useState<AdminActivity | null>(null);

    useEffect(() => {
        const loadActivity = async () => {
            const data = await getAdminActivity(user.uid);
            setMyActivity(data);
        };
        loadActivity();
    }, [user.uid]);



    const [newEpTitle, setNewEpTitle] = useState('');
    const [newEpUrl, setNewEpUrl] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('content');

    useEffect(() => {
        let unsubscribe: () => void;
        if (activeTab === 'requests') {
            unsubscribe = subscribeToRequests(setRequests);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeTab]);

    const handleAddEpisode = () => {
        if (newEpTitle && newEpUrl) {
            const newEp = {
                id: Date.now().toString(),
                title: newEpTitle,
                videoUrl: newEpUrl,
                number: uploadForm.episodes.length + 1
            };
            setUploadForm({
                ...uploadForm,
                episodes: [...uploadForm.episodes, newEp]
            });
            setNewEpTitle('');
            setNewEpUrl('');
        }
    };
    const [showPayment, setShowPayment] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Content Form State
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        thumbnailUrl: '',
        coverUrl: '', // New Field
        videoUrl: '',
        downloadUrl: '', // Ensure initialized
        tags: [] as string[],
        isPinned: false,
        contentType: 'movie' as 'movie' | 'series',
        episodes: [] as { id: string; title: string; videoUrl: string; number: number }[], // Always initialized
        introStart: '' as string | number,
        introEnd: '' as string | number,
        outroStart: '' as string | number,
        outroEnd: '' as string | number
    });

    const [uploadProgress, setUploadProgress] = useState(0);

    // Helper for picking images
    const pickImage = async (field: 'thumbnailUrl' | 'coverUrl') => {
        try {
            const image = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Photos // Prompt user to pick from photos
            });

            if (image.webPath) {
                // Convert blob to file for Cloudinary
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                const file = new File([blob], 'image_' + Date.now() + '.jpg', { type: blob.type });

                // Upload
                setIsSubmitting(true); // Reuse submitting state for spinner
                const url = await uploadToCloudinary(file);

                setUploadForm(prev => ({ ...prev, [field]: url }));
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Image pick failed", error);
            setIsSubmitting(false);
        }
    };

    // Settings Form State
    const [contactSettings, setContactSettings] = useState({
        publicEmail: user.email,
        displayName: user.displayName || 'Admin',
        acceptMessages: true
    });

    // If user is not yet a paid admin
    if (!user.paidAdmin || user.role !== 'admin') {
        return (
            <div className="min-h-screen pt-32 px-4 container mx-auto flex flex-col items-center text-center pb-20">
                <div className="glass-panel max-w-2xl w-full rounded-3xl p-10 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

                    <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <ShieldAlert className="w-10 h-10 text-purple-400" />
                    </div>

                    <h1 className="text-4xl font-display font-bold text-white mb-2 text-glow">Admin Access Required</h1>
                    <p className="text-purple-300 font-mono text-sm tracking-widest mb-8">SYSTEM AUTHORIZATION LEVEL: LOW</p>

                    <p className="text-gray-300 mb-8 leading-relaxed max-w-lg mx-auto">
                        Initialize admin protocol to begin content curation.
                        Access the mainframe, upload cognitive data streams (anime), and earn commissions.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                        <div className="bg-black/40 p-4 rounded border border-white/5 flex flex-col items-center">
                            <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                            <div className="text-[10px] font-bold text-white uppercase tracking-wider">Upload Rights</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded border border-white/5 flex flex-col items-center">
                            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
                            <div className="text-[10px] font-bold text-white uppercase tracking-wider">15% Commission</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto">
                        {/* Payment Button - Distinct Card Style */}
                        <div className="w-full p-[1px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/40">
                            <button
                                onClick={() => setShowPayment(true)}
                                className="w-full bg-[#0a0a0a] hover:bg-black/80 text-white p-4 rounded-[11px] flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">
                                        <Zap size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg leading-none mb-1">Become Admin</div>
                                        <div className="text-xs text-gray-400 font-mono group-hover:text-gray-300">One-time fee: {CURRENCY_SYMBOL}{ADMIN_FEE_PRICE}</div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </button>
                        </div>

                        {/* Terms Button - Separate Secondary Action */}
                        <Button
                            variant="outline"
                            onClick={() => setShowTerms(true)}
                            className="w-full border-white/10 hover:bg-white/5 text-gray-400 hover:text-white py-3"
                        >
                            <FileText size={16} className="mr-2" />
                            View Commission Protocol & Terms
                        </Button>
                    </div>
                </div>

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={ADMIN_FEE_PRICE}
                    title="Admin Clearance Fee"
                    description="One-time transaction for Level-2 System Access."
                    benefits={[
                        "Unlimited Upload Bandwidth",
                        "Revenue Stream Connection",
                        "Creator ID Assignment",
                        "Dashboard Visualization"
                    ]}
                    onConfirm={onBecomeAdmin}
                />

                {/* Terms & Conditions Modal */}
                {showTerms && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                        <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary h-6 w-6" />
                                    <h2 className="text-xl font-display font-bold text-white">Commission Flow & Protocols</h2>
                                </div>
                                <button onClick={() => setShowTerms(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar text-gray-300 space-y-8 font-sans leading-relaxed">

                                <section>
                                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="text-primary text-xs border border-primary/30 px-2 py-0.5 rounded">01</span>
                                        Authorization Fee
                                    </h3>
                                    <p className="text-sm border-l-2 border-white/10 pl-4">
                                        To activate your Admin privileges, a <b>one-time non-refundable fee of ₹{ADMIN_FEE_PRICE}</b> is required.
                                        This fee covers server allocation, dashboard access, and security clearance verification.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="text-accent text-xs border border-accent/30 px-2 py-0.5 rounded">02</span>
                                        Commission Structure
                                    </h3>
                                    <div className="text-sm border-l-2 border-white/10 pl-4 space-y-3">
                                        <p>As a Normal Admin, you are eligible to earn commissions on platform unlocks driven by your content.</p>
                                        <ul className="space-y-2 mt-2">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                <span><b>Base Rate:</b> 15% of the user unlock fee.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                <span><b>Attribution:</b> Commissions are credited if a user registers/unlocks specifically via your content link.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                <span><b>Adjustments:</b> Commission rates are subject to change by the Master Admin based on platform performance metrics.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="text-purple-400 text-xs border border-purple-400/30 px-2 py-0.5 rounded">03</span>
                                        Payout Protocol
                                    </h3>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Minimum Threshold</p>
                                                <p className="text-white font-mono">₹1,000.00</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Processing Time</p>
                                                <p className="text-white font-mono">7-14 Business Days</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs text-gray-400 italic">
                                            Payouts are processed manually via UPI or Bank Transfer upon request.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="text-red-400 text-xs border border-red-400/30 px-2 py-0.5 rounded">04</span>
                                        Code of Conduct
                                    </h3>
                                    <p className="text-sm border-l-2 border-white/10 pl-4">
                                        Admins must own or have rights to the content they upload. Uploading pirated, offensive, or malicious content results in
                                        <span className="text-red-400 font-bold"> immediate termination without refund</span>.
                                    </p>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/40 rounded-b-2xl flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowTerms(false)}>Close</Button>
                                <Button
                                    variant="primary"
                                    onClick={() => { setShowTerms(false); setShowPayment(true); }}
                                    className="shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                                >
                                    Accept & Initialize
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Active Admin Dashboard
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingId) {
                await onUpdate(editingId, {
                    title: uploadForm.title,
                    description: uploadForm.description,
                    thumbnailUrl: uploadForm.thumbnailUrl,
                    coverUrl: uploadForm.coverUrl,
                    videoUrl: uploadForm.videoUrl,
                    downloadUrl: uploadForm.downloadUrl, // Added
                    tags: uploadForm.tags,
                    isPinned: uploadForm.isPinned,
                    episodes: uploadForm.contentType === 'series' ? uploadForm.episodes : [],
                    introStart: Number(uploadForm.introStart) || 0,
                    introEnd: Number(uploadForm.introEnd) || 0,
                    outroStart: Number(uploadForm.outroStart) || 0,
                    outroEnd: Number(uploadForm.outroEnd) || 0
                });
                setEditingId(null);
            } else {
                toast.info("Initiating Upload...");
                await onUpload({
                    title: uploadForm.title,
                    description: uploadForm.description,
                    thumbnailUrl: uploadForm.thumbnailUrl || 'https://picsum.photos/400/600',
                    coverUrl: uploadForm.coverUrl,
                    videoUrl: uploadForm.videoUrl,
                    downloadUrl: uploadForm.downloadUrl || '',
                    tags: uploadForm.tags || [],
                    status: 'pending', // Admins need approval
                    published: false, // Legacy support
                    isPremium: true,
                    isPinned: uploadForm.isPinned,
                    episodes: uploadForm.contentType === 'series' ? uploadForm.episodes : [],
                    introStart: Number(uploadForm.introStart) || 0,
                    introEnd: Number(uploadForm.introEnd) || 0,
                    outroStart: Number(uploadForm.outroStart) || 0,
                    outroEnd: Number(uploadForm.outroEnd) || 0
                });
            }
            // Reset form with ALL fields to prevent crash
            setUploadForm({
                title: '',
                description: '',
                thumbnailUrl: '',
                coverUrl: '',
                videoUrl: '',
                downloadUrl: '',
                tags: [],
                isPinned: false,
                contentType: 'movie',
                episodes: [],
                introStart: '',
                introEnd: '',
                outroStart: '',
                outroEnd: ''
            });
        } catch (error) {
            console.error("Operation failed", error);
            alert("Failed to save content. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (item: AnimeContent) => {
        setEditingId(item.id);
        setUploadForm({
            title: item.title || '',
            description: item.description || '',
            thumbnailUrl: item.thumbnailUrl || '',
            coverUrl: item.coverUrl || '',
            videoUrl: item.videoUrl || '',
            downloadUrl: item.downloadUrl || '', // Ensure safely initialized
            tags: item.tags || [], // CRITICAL: Prevent crash if tags is undefined
            isPinned: item.isPinned || false,
            contentType: (item.episodes && item.episodes.length > 0) ? 'series' : 'movie',
            episodes: item.episodes || [],
            introStart: item.introStart || '',
            introEnd: item.introEnd || '',
            outroStart: item.outroStart || '',
            outroEnd: item.outroEnd || ''
        });
        setActiveTab('content'); // Switch to content tab
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editing: ${item.title}`);
    };

    const addTag = (tag: string) => {
        if (!uploadForm.tags.includes(tag)) {
            setUploadForm({ ...uploadForm, tags: [...uploadForm.tags, tag] });
        }
    };

    const removeTag = (tagToRemove: string) => {
        setUploadForm({ ...uploadForm, tags: uploadForm.tags.filter(t => t !== tagToRemove) });
    };

    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Settings Saved Successfully!");
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await onDelete(deleteId);
            setDeleteId(null);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items - center gap - 2 px - 6 py - 3 rounded - lg text - sm font - bold uppercase tracking - wide transition - all
            ${activeTab === id
                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transform -translate-y-0.5'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                } `}
        >
            <Icon size={16} /> {label}
        </button>
    );

    // ... (existing helper functions)

    return (
        <div className="min-h-screen pt-24 px-4 pb-12">

            {/* ... (Header) */}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/5">
                <TabButton id="content" label="Content Manager" icon={Upload} />
                <TabButton id="requests" label="User Requests" icon={Mail} />
                <TabButton id="settings" label="Settings" icon={Settings} />
                <TabButton id="wallet" label="Wallet" icon={Wallet} />
                <TabButton id="wallet" label="Wallet" icon={Wallet} />
                <TabButton id="stats" label="My Performance" icon={Activity} />
            </div>

            <div className="animate-fade-in">
                {/* REQUESTS TAB */}
                {activeTab === 'requests' && (
                    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col animate-fade-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                                <Mail size={18} className="text-primary" /> User Content Requests
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/40 text-[10px] uppercase text-gray-500 font-mono">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Request Details</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs">
                                                {(req.createdAt as any)?.seconds ? new Date((req.createdAt as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-xs font-bold text-white">{req.userName || 'Anonymous'}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-white mb-1">{req.title}</div>
                                                <div className="text-xs text-gray-400 italic">"{req.note}"</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border 
                                                        ${req.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {req.status || 'PENDING'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500 font-mono border-t border-white/5">
                                                NO REQUESTS FOUND.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STATS / PERFORMANCE TAB */}
                {activeTab === 'stats' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Performance Card */}
                            <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Activity className="text-accent" /> Monthly Performance
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Uploads This Month</span>
                                            <span className="text-white font-mono font-bold">{myActivity?.uploadCount || 0} / 2</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${(myActivity?.uploadCount || 0) >= 2 ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                style={{ width: `${Math.min(((myActivity?.uploadCount || 0) / 2) * 100, 100)}%` }}
                                            />
                                        </div>
                                        {(myActivity?.uploadCount || 0) < 2 ? (
                                            <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                                                <AlertTriangle size={12} /> Upload {2 - (myActivity?.uploadCount || 0)} more to qualify.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> You are eligible for this month's pool!
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Total Views (Engagement)</span>
                                            <span className="text-white font-mono font-bold">{myActivity?.totalViews || 0}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-full opacity-20" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">More views = Higher share of the pool.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    // ... existing content tab

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Form */}
                        <div className="lg:col-span-1">
                            <div className="glass-panel rounded-2xl p-1 border border-white/10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="p-6 relative z-10">
                                    <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                                        <Upload size={20} className="text-primary" />
                                        <span className="tracking-wider">{editingId ? 'EDIT ENTRY' : 'UPLOAD STREAM'}</span>
                                    </h2>
                                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-focus-within:text-white transition-colors">Series Title</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none focus:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all font-mono"
                                                value={uploadForm.title}
                                                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Synopsis Data</label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none transition-all font-mono"
                                                value={uploadForm.description}
                                                onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Visual Assets</label>

                                            <div className="flex gap-4">
                                                {/* Thumbnail Picker */}
                                                <div className="flex-1">
                                                    <div
                                                        onClick={() => pickImage('thumbnailUrl')}
                                                        className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-black/40 h-32"
                                                    >
                                                        {uploadForm.thumbnailUrl ? (
                                                            <img src={uploadForm.thumbnailUrl} className="h-full object-contain" alt="Thumbnail" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="text-gray-400 mb-2" />
                                                                <span className="text-xs text-gray-500">Upload Thumbnail</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cover Picker */}
                                                <div className="flex-1">
                                                    <div
                                                        onClick={() => pickImage('coverUrl')}
                                                        className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-black/40 h-32"
                                                    >
                                                        {uploadForm.coverUrl ? (
                                                            <img src={uploadForm.coverUrl} className="h-full object-contain" alt="Cover" />
                                                        ) : (
                                                            <>
                                                                <Camera className="text-gray-400 mb-2" />
                                                                <span className="text-xs text-gray-500">Upload Cover Page</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Content Format</label>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadForm({ ...uploadForm, contentType: 'movie' })}
                                                    className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden
                                                            ${uploadForm.contentType === 'movie'
                                                            ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                                                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                                                >
                                                    <Film className={`w-8 h-8 mb-2 transition-colors ${uploadForm.contentType === 'movie' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${uploadForm.contentType === 'movie' ? 'text-white' : 'text-gray-500'}`}>Movie</span>
                                                    {uploadForm.contentType === 'movie' && (
                                                        <div className="absolute inset-0 border-2 border-primary rounded-xl animate-pulse opacity-50"></div>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setUploadForm({ ...uploadForm, contentType: 'series' })}
                                                    className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden
                                                            ${uploadForm.contentType === 'series'
                                                            ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                                                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                                                >
                                                    <List className={`w-8 h-8 mb-2 transition-colors ${uploadForm.contentType === 'series' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${uploadForm.contentType === 'series' ? 'text-white' : 'text-gray-500'}`}>TV Series</span>
                                                    {uploadForm.contentType === 'series' && (
                                                        <div className="absolute inset-0 border-2 border-primary rounded-xl animate-pulse opacity-50"></div>
                                                    )}
                                                </button>
                                            </div>

                                            {uploadForm.contentType === 'movie' ? (
                                                <div className="space-y-4 animate-fade-in">
                                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Film size={12} className="text-primary" /> Stream Source Link
                                                        </label>
                                                        <input
                                                            type="url"
                                                            required={uploadForm.contentType === 'movie'}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none transition-all font-mono placeholder:text-gray-700"
                                                            placeholder="https://example.com/movie.mp4"
                                                            value={uploadForm.videoUrl}
                                                            onChange={e => setUploadForm({ ...uploadForm, videoUrl: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Download size={12} className="text-green-500" /> Download / Backup Link (Optional)
                                                        </label>
                                                        <input
                                                            type="url"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none transition-all font-mono placeholder:text-gray-700"
                                                            placeholder="https://drive.google.com/..."
                                                            value={uploadForm.downloadUrl || ''}
                                                            onChange={e => setUploadForm({ ...uploadForm, downloadUrl: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 animate-fade-in">
                                                    {/* Global Series Download Link */}
                                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Download size={12} className="text-green-500" /> Series Download / Backup Link (Optional)
                                                        </label>
                                                        <input
                                                            type="url"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none transition-all font-mono placeholder:text-gray-700"
                                                            placeholder="https://drive.google.com/folder/..."
                                                            value={uploadForm.downloadUrl || ''}
                                                            onChange={e => setUploadForm({ ...uploadForm, downloadUrl: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-2xl border border-white/10 shadow-inner">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                                                <List size={14} /> Episode Manager
                                                            </label>
                                                            <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-mono">
                                                                {uploadForm.episodes.length} Episodes
                                                            </span>
                                                        </div>

                                                        {/* Add Episode Inputs - Improved Layout */}
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                                                            <div className="md:col-span-4">
                                                                <input
                                                                    value={newEpTitle}
                                                                    onChange={(e) => setNewEpTitle(e.target.value)}
                                                                    placeholder="Ep Title (e.g. Pilot)"
                                                                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-8">
                                                                <input
                                                                    value={newEpUrl}
                                                                    onChange={(e) => setNewEpUrl(e.target.value)}
                                                                    placeholder="Video URL (https://...)"
                                                                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-primary focus:outline-none font-mono placeholder:text-gray-600"
                                                                />
                                                            </div>
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            className="w-full justify-center mb-6 py-3 bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/30 group"
                                                            onClick={handleAddEpisode}
                                                        >
                                                            <Plus size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Add Episode to List
                                                        </Button>

                                                        {/* Episode List */}
                                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 flex flex-col gap-2">
                                                            {uploadForm.episodes.length === 0 && (
                                                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl bg-black/20">
                                                                    <List className="mx-auto text-gray-600 w-8 h-8 mb-2" />
                                                                    <p className="text-gray-500 text-xs italic">No episodes added yet.</p>
                                                                    <p className="text-gray-700 text-[10px]">Fill details above and click 'Add'</p>
                                                                </div>
                                                            )}
                                                            {uploadForm.episodes.map((ep, idx) => (
                                                                <div key={ep.id} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all group backdrop-blur-sm">
                                                                    <span className="w-8 h-8 flex items-center justify-center bg-white/5 text-gray-300 text-[10px] font-bold rounded-lg border border-white/5 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                                                        {ep.number}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{ep.title}</div>
                                                                        <div className="text-[10px] text-gray-500 truncate font-mono">{ep.videoUrl}</div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setUploadForm({
                                                                                ...uploadForm,
                                                                                episodes: uploadForm.episodes.filter(e => e.id !== ep.id)
                                                                            });
                                                                        }}
                                                                        className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4 mb-4">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <List size={12} className="text-blue-500" /> Intro / Outro Timestamps (Seconds)
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] text-gray-400 uppercase">Intro Start</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-primary focus:outline-none"
                                                        placeholder="0"
                                                        value={uploadForm.introStart}
                                                        onChange={e => setUploadForm({ ...uploadForm, introStart: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-400 uppercase">Intro End</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-primary focus:outline-none"
                                                        placeholder="0"
                                                        value={uploadForm.introEnd}
                                                        onChange={e => setUploadForm({ ...uploadForm, introEnd: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-400 uppercase">Outro Start</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-primary focus:outline-none"
                                                        placeholder="0"
                                                        value={uploadForm.outroStart}
                                                        onChange={e => setUploadForm({ ...uploadForm, outroStart: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-400 uppercase">Outro End</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-primary focus:outline-none"
                                                        placeholder="0"
                                                        value={uploadForm.outroEnd}
                                                        onChange={e => setUploadForm({ ...uploadForm, outroEnd: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tags</label>

                                            {/* Selected Tags Chips */}
                                            <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                                                {uploadForm.tags.length === 0 && <span className="text-gray-600 text-xs italic py-1">No tags selected</span>}
                                                {uploadForm.tags.map(tag => (
                                                    <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={10} /></button>
                                                    </span>
                                                ))}
                                            </div>

                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm focus:border-primary focus:bg-black/60 focus:outline-none transition-all font-mono cursor-pointer appearance-none"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        addTag(e.target.value);
                                                        e.target.value = "";
                                                    }
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>+ Add Category Tag</option>
                                                {CATEGORIES.filter(c => c !== 'Recent' && !uploadForm.tags.includes(c)).map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>


                                            {/* Master Admin Pin Control */}
                                            {user.role === 'superadmin' && (
                                                <div className="mt-4 flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        id="isPinned"
                                                        checked={uploadForm.isPinned}
                                                        onChange={(e) => setUploadForm({ ...uploadForm, isPinned: e.target.checked })}
                                                        className="w-4 h-4 accent-primary"
                                                    />
                                                    <label htmlFor="isPinned" className="text-white text-sm font-bold flex items-center gap-2">
                                                        <Pin size={14} className="fill-primary text-primary" /> Pin to Home Carousel
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {editingId && (
                                                <Button type="button" onClick={() => { setEditingId(null); setUploadForm({ title: '', description: '', thumbnailUrl: '', coverUrl: '', videoUrl: '', tags: [] }) }} variant="secondary" className="w-1/3">CANCEL</Button>
                                            )}
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="flex-1 font-display font-bold tracking-wider"
                                                isLoading={isSubmitting}
                                            >
                                                {editingId ? 'UPDATE' : 'INITIATE UPLOAD'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Content List */}
                        <div className="lg:col-span-2">
                            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full flex flex-col">
                                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                                    <List size={20} className="text-primary" />
                                    <span className="tracking-wider">ACTIVE DEPLOYMENTS</span>
                                </h2>

                                {userContent.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl p-8">
                                        <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No active streams found.</p>
                                        <p className="text-xs">Upload content to populate grid.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                                        {userContent.map(item => (
                                            <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-black/40 border border-white/5 hover:border-primary/50 transition-all group">
                                                <div className="w-20 h-28 shrink-0 overflow-hidden rounded relative">
                                                    <img src={item.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-white font-display text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => startEdit(item)}
                                                                className="p-1 hover:text-primary text-gray-400 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <PenSquare size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteId(item.id)}
                                                                className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border 
                                                                    ${item.status === 'published' || item.published
                                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                                    : item.status === 'rejected'
                                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                {item.status === 'published' || item.published ? 'LIVE' : item.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-400 line-clamp-2 mt-1 font-sans">{item.description}</p>
                                                    <div className="flex gap-3 mt-3">
                                                        <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">
                                                            ID: {item.id}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                        {item.tags?.length > 0 && (
                                                            <span className="text-[10px] text-gray-400 font-mono px-1 py-1">
                                                                [{item.tags?.join(', ')}]
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.status === 'rejected' && item.rejectionReason && (
                                                        <div className="mt-2 bg-red-500/10 border border-red-500/20 p-2 rounded text-xs text-red-400 flex items-start gap-2">
                                                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="font-bold uppercase tracking-wider block text-[10px] mb-0.5">Rejected</span>
                                                                "{item.rejectionReason}"
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
                }

                {
                    activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                                <Mail size={24} className="text-primary" /> Contact & Profile Settings
                            </h2>
                            <form onSubmit={handleSettingsSave} className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                        value={contactSettings.displayName}
                                        onChange={(e) => setContactSettings({ ...contactSettings, displayName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Public Contact Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none"
                                        value={contactSettings.publicEmail}
                                        onChange={(e) => setContactSettings({ ...contactSettings, publicEmail: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This email will be visible if you enable public messaging.</p>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="acceptMessages"
                                        className="w-4 h-4 accent-primary"
                                        checked={contactSettings.acceptMessages}
                                        onChange={(e) => setContactSettings({ ...contactSettings, acceptMessages: e.target.checked })}
                                    />
                                    <label htmlFor="acceptMessages" className="text-sm text-gray-300">Accept direct messages from users regarding your content.</label>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <Button type="submit" variant="primary">Save Settings</Button>
                                </div>
                            </form>
                        </div>
                    )
                }

                {
                    activeTab === 'wallet' && (
                        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                                <Wallet size={24} className="text-primary" /> Wallet & Payouts
                            </h2>

                            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-white/10 mb-8">
                                <p className="text-gray-400 text-sm font-mono uppercase tracking-widest mb-1">Current Balance</p>
                                <h3 className="text-4xl font-bold text-white mb-2">{CURRENCY_SYMBOL}{(user.walletBalance || 0).toFixed(2)}</h3>
                                <p className="text-xs text-gray-500">Minimum withdrawal amount: {CURRENCY_SYMBOL}1000</p>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const upiId = (form.elements.namedItem('upiId') as HTMLInputElement).value;
                                const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);

                                if (!upiId) return alert("Please enter a valid UPI ID");
                                if (amount < 1000) return alert("Minimum withdrawal is 1000");
                                if (amount > (user.walletBalance || 0)) return alert("Insufficient balance");

                                try {
                                    setIsSubmitting(true);
                                    // 1. Save UPI to profile if changed
                                    if (upiId !== user.upiId) {
                                        await updateUserInDb({ ...user, upiId });
                                    }

                                    // 2. Create Payout Request
                                    await requestPayout(user.uid, user.email, upiId, amount);

                                    alert('Payout request submitted successfully!');
                                    form.reset();
                                } catch (err: any) {
                                    alert(err.message);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }} className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Payout UPI ID</label>
                                    <input
                                        name="upiId"
                                        type="text"
                                        placeholder="username@okaxis"
                                        defaultValue={user.upiId || ''}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Withdrawal Amount</label>
                                    <input
                                        name="amount"
                                        type="number"
                                        min="1000"
                                        placeholder="1000"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-primary focus:outline-none font-mono"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={!user.walletBalance || user.walletBalance < 1000}
                                    isLoading={isSubmitting}
                                >
                                    Request Payout
                                </Button>
                            </form>
                        </div>
                    )
                }

                {
                    activeTab === 'stats' && (
                        <div className="max-w-4xl mx-auto text-center py-20">
                            <div className="inline-block p-6 rounded-full bg-white/5 mb-6">
                                <BarChart3 className="w-16 h-16 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-400">Detailed Analytics Coming Soon</h2>
                            <p className="text-gray-500 mt-2">The engineering team is calibrating the data visualizers.</p>
                        </div>
                    )
                }
            </div >


            {/* Delete Confirmation Modal */}
            < ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Content?"
                message="Are you sure you want to permanently delete this content stream? This action cannot be undone and will remove it from all user grids immediately."
                confirmLabel="Delete Permanently"
                isDangerous
            />
        </div >
    );
};