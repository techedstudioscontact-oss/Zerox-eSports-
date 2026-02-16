import { Trophy, Users, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TournamentList } from './tournaments/TournamentList';
import type { User } from '../types';

interface HomeProps {
    user: User;
}

export const Home = ({ user }: HomeProps) => {
    return (
        <div className="min-h-screen bg-royal-black">
            {/* Header */}
            <header className="bg-dark-gray border-b border-border-gold">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-display font-bold text-metallic-gold text-gold-glow">
                        ZEROX eSPORTS
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Welcome back,</p>
                            <Link to="/profile" className="font-bold text-metallic-gold hover:underline">{user.displayName}</Link>
                        </div>
                        <div className="bg-metallic-gold text-royal-black px-4 py-2 rounded-lg font-bold">
                            {user.coins} 🪙
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-dark-gray to-royal-black py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-5xl md:text-7xl font-display font-bold text-metallic-gold text-gold-glow mb-4">
                        WHERE CHAMPIONS RISE
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join India's premier eSports tournaments and compete for glory
                    </p>

                    {/* User Role Badge */}
                    <div className="inline-block">
                        {user.role === 'superadmin' && (
                            <div className="bg-gradient-gold text-royal-black px-6 py-3 rounded-lg font-bold text-lg shadow-gold-glow">
                                🔥 MASTER ADMIN
                            </div>
                        )}
                        {user.role === 'admin' && (
                            <div className="bg-metallic-gold text-royal-black px-6 py-3 rounded-lg font-bold text-lg">
                                ⚡ MODERATOR
                            </div>
                        )}
                        {user.role === 'user' && (
                            <div className="bg-dark-gray border border-metallic-gold text-metallic-gold px-6 py-3 rounded-lg font-bold text-lg">
                                🎮 PLAYER
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Master Admin Dashboard */}
            {
                user.role === 'superadmin' && (
                    <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
                        <div className="bg-royal-black border border-metallic-gold rounded-xl p-6 shadow-gold-glow animate-fade-in">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                                <Award className="text-metallic-gold w-8 h-8" />
                                <h2 className="text-2xl font-display font-bold text-white">MASTER ADMIN CONTROL PANEL</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Link to="/admin/users" className="bg-dark-gray p-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800 hover:border-metallic-gold group">
                                    <Users className="w-8 h-8 text-metallic-gold mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white">Manage Users</h3>
                                    <p className="text-xs text-gray-400 mt-1">View, ban, or promote users</p>
                                </Link>

                                <div className="bg-dark-gray p-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800 hover:border-metallic-gold group">
                                    <Trophy className="w-8 h-8 text-metallic-gold mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white">Create Tournament</h3>
                                    <p className="text-xs text-gray-400 mt-1">Setup new competitions</p>
                                </div>

                                <Link to="/admin/settings" className="bg-dark-gray p-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800 hover:border-metallic-gold group">
                                    <Calendar className="w-8 h-8 text-metallic-gold mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white">System Settings</h3>
                                    <p className="text-xs text-gray-400 mt-1">Global app configuration</p>
                                </Link>

                                <div className="bg-dark-gray p-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800 hover:border-metallic-gold group">
                                    <Award className="w-8 h-8 text-metallic-gold mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white">Analytics</h3>
                                    <p className="text-xs text-gray-400 mt-1">View platform growth</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Stats Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-dark-gray border border-border-gold rounded-xl p-6 text-center hover:border-metallic-gold transition-all">
                        <Trophy className="w-12 h-12 mx-auto mb-3 text-metallic-gold" />
                        <h3 className="text-3xl font-bold text-white mb-1">{user.totalWins}</h3>
                        <p className="text-gray-400">Wins</p>
                    </div>

                    <div className="bg-dark-gray border border-border-gold rounded-xl p-6 text-center hover:border-metallic-gold transition-all">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-metallic-gold" />
                        <h3 className="text-3xl font-bold text-white mb-1">{user.totalMatches}</h3>
                        <p className="text-gray-400">Matches Played</p>
                    </div>

                    <div className="bg-dark-gray border border-border-gold rounded-xl p-6 text-center hover:border-metallic-gold transition-all">
                        <Award className="w-12 h-12 mx-auto mb-3 text-metallic-gold" />
                        <h3 className="text-3xl font-bold text-white mb-1">{user.coins}</h3>
                        <p className="text-gray-400">Coins</p>
                    </div>

                    <Link to="/my-teams" className="bg-dark-gray border border-border-gold rounded-xl p-6 text-center hover:border-metallic-gold transition-all block group">
                        <Users className="w-12 h-12 mx-auto mb-3 text-metallic-gold group-hover:scale-110 transition-transform" />
                        <h3 className="text-3xl font-bold text-white mb-1">{user.favoriteTeams.length}</h3>
                        <p className="text-gray-400">Teams</p>
                    </Link>
                </div>
            </section>

            {/* Upcoming Tournaments Section */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-display font-bold text-metallic-gold mb-6">
                    UPCOMING TOURNAMENTS
                </h2>

                <TournamentList />
            </section>

            {/* Footer */}
            <footer className="bg-dark-gray border-t border-border-gold mt-16 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        © 2026 Zerox eSports. All rights reserved. | Developed by Teched Studios
                    </p>
                </div>
            </footer>
        </div >
    );
};
