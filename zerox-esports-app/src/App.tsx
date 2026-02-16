import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { UserManagement } from './pages/admin/UserManagement';
import { SystemSettings } from './pages/admin/SystemSettings';
import { CreateTournament } from './pages/admin/CreateTournament';
import { TournamentDetail } from './pages/tournaments/TournamentDetail';
import { TeamRegistration } from './pages/tournaments/TeamRegistration';
import { UserProfile } from './pages/profile/UserProfile';
import { MyTeams } from './pages/profile/MyTeams';
import { MatchScheduler } from './pages/admin/MatchScheduler';
import { LiveScoreboard } from './pages/tournaments/LiveScoreboard';
import { Home } from './pages/Home';
import { subscribeToAuthChanges } from './services/authService';
import { initializeApp } from './services/initService';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize app on first load
  // DISABLED: Requires Firestore rules deployment first
  // Initialize app on first load
  useEffect(() => {
    initializeApp();
  }, []);

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-royal-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-metallic-gold border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-2xl font-display font-bold text-metallic-gold text-gold-glow">
          ZEROX eSPORTS
        </div>
        <div className="text-sm text-gray-500 mt-2">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-royal-black text-white">
        <Toaster position="top-center" theme="dark" richColors closeButton />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Login onSuccess={() => { }} />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              user ? <Home user={user} /> : <Navigate to="/login" />
            }
          />
          {/* New UserManagement Route */}
          <Route
            path="/admin/users"
            element={
              user ? <UserManagement /> : <Navigate to="/login" />
            }
          />
          {/* System Settings Route */}
          <Route
            path="/admin/settings"
            element={
              user ? <SystemSettings /> : <Navigate to="/login" />
            }
          />
          {/* Create Tournament Route */}
          <Route
            path="/admin/create-tournament"
            element={
              user ? <CreateTournament /> : <Navigate to="/login" />
            }
          />

          {/* Tournament Routes */}
          <Route
            path="/tournament/:id"
            element={
              user ? <TournamentDetail /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/tournament/:id/register"
            element={
              user ? <TeamRegistration /> : <Navigate to="/login" />
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              user ? <UserProfile user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/my-teams"
            element={
              user ? <MyTeams user={user} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/my-teams"
            element={
              user ? <MyTeams user={user} /> : <Navigate to="/login" />
            }
          />

          {/* Operational Routes */}
          <Route
            path="/admin/matches"
            element={
              user ? <MatchScheduler /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/tournament/:id/live"
            element={
              user ? <LiveScoreboard user={user} isAdminView={user.role === 'superadmin' || user.role === 'admin'} /> : <Navigate to="/login" />
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
