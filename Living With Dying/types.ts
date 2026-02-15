export type Role = 'user' | 'admin' | 'manager' | 'superadmin';

export interface WatchProgress {
  episodeIndex: number; // 0 for movies
  timestamp: number;    // saved time in seconds
  lastWatched: number;  // Date.now()
  progress: number;     // 0.0 to 1.0
}

export interface User {
  uid: string;
  email: string;
  role: Role;
  paidUser: boolean; // Has paid ₹9 to unlock content
  paidAdmin: boolean; // Has paid ₹500 to become admin
  displayName?: string;
  favorites: string[]; // Array of AnimeContent IDs
  watchHistory?: string[]; // IDs of watched content
  continueWatching?: { [contentId: string]: WatchProgress }; // New Field
  upiId?: string;
  walletBalance?: number;
  suspendedUntil?: number; // Timestamp until which the user is suspended
  coins?: number; // Gamification currency
  lastDailyReward?: string; // ISO Date string of last reward
  fcmToken?: string; // Firebase Cloud Messaging Token for Push
  oneSignalPlayerId?: string; // OneSignal Player ID for Push
}

export interface AnimeContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  coverUrl?: string; // New field for Home page cover display
  tags: string[];
  videoUrl?: string; // Only visible if unlocked
  downloadUrl?: string; // Optional direct download link
  uploadedBy: string; // admin uid
  published: boolean;
  isPremium: boolean;
  isPinned?: boolean; // Pinned to top of Home Carousel
  createdAt: number;
  contentType: 'movie' | 'series';
  status: 'pending' | 'published' | 'rejected'; // Content Approval Status
  rejectionReason?: string; // Reason validation for rejection
  episodes?: { id: string; title: string; videoUrl: string; number: number }[]; // For Series
  // Intro/Outro Detection
  introStart?: number; // Intro Skip Logic Detection
  introEnd?: number;
  outroStart?: number;
  outroEnd?: number;
}

export interface PaymentIntent {
  amount: number;
  description: string;
  type: 'CONTENT_UNLOCK' | 'ADMIN_FEE';
}

declare global {
  interface Window {
    Uropay: any;
  }
}

export interface AdCampaign {
  id: string;
  title: string;
  videoUrl: string;       // External Link (Drive/Direct)
  linkUrl?: string;       // "Learn More" destination
  active: boolean;
  frequency: number;      // 1-10 priority (10 = highest)

  isSkippable: boolean;
  skipAfter?: number;     // seconds
  type: 'preroll' | 'midroll';

  startDate?: string;     // ISO Date
  endDate?: string;       // ISO Date

  views: number;
  clicks: number;
  dailyStats?: { [date: string]: { views: number; clicks: number } }; // { "2023-10-27": { views: 5, clicks: 1 } }
  createdAt: any;         // Firestore Timestamp
}

export interface AdSettings {
  globalEnabled: boolean;
  frequencyCapMinutes: number; // e.g., 15 mins
}
export interface BugReport {
  id: string;
  userId: string;
  userEmail: string;
  description: string;
  deviceInfo: string;
  createdAt: any; // Firestore Timestamp
  status: 'open' | 'resolved';
}

export interface RevenuePool {
  id: string; // Format: "YYYY-MM" (e.g., "2025-01")
  month: number; // 0-11
  year: number;
  totalRevenue: number;
  platformShare: number; // Deducted amount
  adminPool: number; // Distributable amount
  status: 'open' | 'distributed';
  createdAt?: any; // Start of month timestamp
  distributedAt?: any; // Firestore Timestamp
  processedBy?: string; // Master Admin UID
}

export interface AdminActivity {
  id: string; // Format: "UID_YYYY-MM"
  adminId: string;
  adminName: string; // Snapshot for display
  month: string; // "2025-01"
  uploadCount: number;
  totalViews: number; // Engagement metric
  isEligible: boolean; // uploadCount >= 2
  lastUpdated: any;
}
