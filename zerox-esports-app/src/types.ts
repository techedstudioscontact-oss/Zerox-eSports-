export type Role = 'user' | 'admin' | 'superadmin';

export interface User {
    uid: string;
    email: string;
    role: Role;
    displayName: string;

    // Player Info
    gameId?: string;
    gameName?: string;
    phone?: string;

    // Verification
    isVerified: boolean;
    idProofUrl?: string;

    // Stats
    coins: number;
    totalMatches: number;
    totalWins: number;
    favoriteTeams: string[];

    // Moderation
    suspendedUntil?: number;
    banReason?: string;

    // Payments
    upiId?: string;
    walletBalance: number;

    // Push Notifications
    fcmToken?: string;

    createdAt: number;
    lastLogin: number;
}

export interface Tournament {
    id: string;
    name: string;
    game: 'BGMI' | 'Free Fire';
    mode: 'Solo' | 'Duo' | 'Squad';

    // Schedule
    registrationStart: number;
    registrationEnd: number;
    tournamentStart: number;
    tournamentEnd: number;

    // Details
    maxTeams: number;
    currentTeams: number;
    entryFee: number;
    prizePool: number;

    // Rules
    rules: string;
    scoringSystem: 'placement' | 'kills' | 'hybrid';

    // Status
    status: 'upcoming' | 'registration' | 'ongoing' | 'completed';
    published: boolean;
    isPinned: boolean;

    // Meta
    coverUrl: string;
    thumbnailUrl: string;
    createdBy: string;
    createdAt: number;
}

export interface Team {
    id: string;
    name: string;
    tag: string;

    tournamentId: string;

    captainId: string;
    players: string[];
    substitutes?: string[];

    isVerified: boolean;
    verifiedBy?: string;

    paymentStatus: 'pending' | 'partial' | 'paid';
    paymentProofUrl?: string;
    paidAmount: number;

    totalKills: number;
    placementPoints: number;
    totalPoints: number;
    rank?: number;

    logoUrl?: string;
    registeredAt: number;
}

export interface Match {
    id: string;
    tournamentId: string;

    round: number;
    matchNumber: number;
    mapName: string;

    lobbyId: string;
    lobbyPassword: string;

    scheduledTime: number;
    actualStartTime?: number;
    endTime?: number;

    status: 'scheduled' | 'ongoing' | 'completed';

    teams: string[];

    results: Array<{
        teamId: string;
        placement: number;
        kills: number;
        placementPoints: number;
        killPoints: number;
        totalPoints: number;
    }>;

    createdBy: string;
    liveStreamUrl?: string;
    createdAt: number;
}

export interface SystemSettings {
    isLocked: boolean;
    lockReason?: string;
    broadcastMessage: string;
    commissionRate: number;
    registrationsEnabled: boolean;
    minAppVersion: string;
    forceUpdate: boolean;
    updatedBy: string;
    updatedAt: number;
}
