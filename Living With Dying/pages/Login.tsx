import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { MASTER_ADMIN_EMAIL, registerUser } from '../services/authService';

interface LoginProps {
  onLogin: (email: string, password?: string, secretKey?: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const isMasterEmail = email.toLowerCase() === MASTER_ADMIN_EMAIL && !isSignUp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await registerUser(email, password);
        // UX: Immediate navigation + Informational Toast
        toast.success("Account Created! Welcome to Aniryx.", {
          description: "A verification link has been sent to your email. Please check your Inbox and Spam folder.",
          duration: 8000,
          icon: "📧"
        });
        navigate('/');
      } else {
        // Pass the actual password entered by the user
        await onLogin(email, password, isMasterEmail ? secretKey : undefined);
        navigate(isMasterEmail ? '/master-admin' : '/');
      }
    } catch (err: any) {
      // Remove "Firebase: " prefix if present for cleaner UI
      const cleanError = err.message.replace('Firebase: ', '').replace('Error: ', '');
      setError(cleanError || (isSignUp ? 'Registration failed.' : 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    try {
      setLoading(true);
      const { resetPassword } = await import('../services/authService');
      await resetPassword(email);
      alert('Password reset email sent! Check your inbox.');
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-2xl bg-surface/50 border border-white/10 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isSignUp ? 'Join Aniryx' : 'Enter Aniryx'}
          </p>
          <p className="text-sm text-primary font-display tracking-widest uppercase mt-2">
            Stream the extraordinary
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-900/30 border border-red-800 p-3 text-sm text-red-200 text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-zinc-700 p-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="user@example.com"
            />
          </div>

          {/* Password field is now always visible, even for Master Admin */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-zinc-700 p-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* Master Admin Secret Key Field - Only shows if email matches master and not signing up */}
          {isMasterEmail && (
            <div className="animate-fade-in-down">
              <label className="mb-2 block text-sm font-medium text-accent">Master Secret Key</label>
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full rounded-lg bg-black/50 border border-accent/50 p-3 text-white placeholder-gray-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-[0_0_10px_rgba(225,29,72,0.2)]"
                placeholder="Enter secret key..."
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            {isSignUp ? 'Sign Up' : (isMasterEmail ? 'Access Control' : 'Sign In')}
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-primary hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="block mx-auto mt-2 text-xs text-gray-500 hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-2">
            By continuing, you agree to our Terms of Service.
          </p>
        </form>
      </div>
    </div>
  );
};
