import React, { useState } from 'react';
import { LogIn, UserPlus, Lock } from 'lucide-react';
import { signupUser, loginUser, signInWithGoogle } from '../services/authService';
import { toast } from 'sonner';

interface LoginProps {
    onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            toast.success('Signed in with Google!');
            onSuccess();
        } catch (error: any) {
            toast.error('Google Sign-In failed', {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signupUser(email, password, displayName);
            toast.success('Account created successfully! Welcome to Zerox eSports', {
                description: '+100 coins bonus!',
                duration: 4000
            });
            onSuccess();
        } catch (error: any) {
            toast.error('Signup failed', {
                description: error.message || 'Please try again'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isAdminEmail = email.endsWith('@zeroxesports.com') || email === 'ope@zeroxesports.com' || email === 'open@zeroxesports.com';
            await loginUser(email, password, isAdminEmail ? secretKey : undefined);
            toast.success('Login successful!');
            onSuccess();
        } catch (error: any) {
            toast.error('Login failed', {
                description: error.message || 'Invalid credentials'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-royal-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-display font-bold text-metallic-gold text-gold-glow mb-2">
                        ZEROX eSPORTS
                    </h1>
                    <p className="text-gray-400">WHERE CHAMPIONS RISE</p>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 bg-dark-gray rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-3 rounded-md font-medium transition-all ${activeTab === 'login'
                            ? 'bg-metallic-gold text-royal-black'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <LogIn className="inline mr-2" size={18} />
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 rounded-md font-medium transition-all ${activeTab === 'signup'
                            ? 'bg-metallic-gold text-royal-black'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <UserPlus className="inline mr-2" size={18} />
                        Sign Up
                    </button>
                </div>

                {/* Form Container */}
                <div className="bg-dark-gray border border-border-gold rounded-xl p-8">
                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full mb-6 flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-gray text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {activeTab === 'signup' ? (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-royal-black border border-gray-700 rounded-lg focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold outline-none text-white"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-royal-black border border-gray-700 rounded-lg focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold outline-none text-white"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-royal-black border border-gray-700 rounded-lg focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold outline-none text-white"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-metallic-gold text-royal-black py-3 rounded-lg font-bold hover:bg-bright-gold hover:shadow-gold-glow transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-royal-black border border-gray-700 rounded-lg focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold outline-none text-white"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-royal-black border border-gray-700 rounded-lg focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold outline-none text-white"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {/* Secret Key Field - Auto-shows for Zerox Admin Emails */}
                            {(email.endsWith('@zeroxesports.com') || email === 'ope@zeroxesports.com' || email === 'open@zeroxesports.com') && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium mb-2 text-metallic-gold">Master Admin Secret Key</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={secretKey}
                                            onChange={(e) => setSecretKey(e.target.value)}
                                            className="w-full px-4 py-3 pl-10 bg-royal-black border border-metallic-gold rounded-lg focus:ring-2 focus:ring-metallic-gold outline-none text-white transition-all shadow-gold-glow"
                                            placeholder="Enter secret key"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-gold" size={18} />
                                    </div>
                                    <p className="text-xs text-metallic-gold mt-1 ml-1">Admin access detected</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-metallic-gold text-royal-black py-3 rounded-lg font-bold hover:bg-bright-gold hover:shadow-gold-glow transition-all disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
