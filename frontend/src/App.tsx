import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';

/* ── Pages (lazy loaded) ─────────────────────── */
const Landing      = lazy(() => import('./pages/Landing'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Onboarding   = lazy(() => import('./pages/Onboarding'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Goals        = lazy(() => import('./pages/Goals'));
const CreateGoal   = lazy(() => import('./pages/CreateGoal'));
const GoalDetail   = lazy(() => import('./pages/GoalDetail'));
const ProofCenter  = lazy(() => import('./pages/ProofCenter'));
const Analytics    = lazy(() => import('./pages/Analytics'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings     = lazy(() => import('./pages/Settings'));
const Commitments       = lazy(() => import('./pages/Commitments'));
const CreateCommitment  = lazy(() => import('./pages/CreateCommitment'));
const CommitmentDetail  = lazy(() => import('./pages/CommitmentDetail'));
const CommitmentHistory = lazy(() => import('./pages/CommitmentHistory'));

/* ── Vibrant theme-based body backgrounds ────── */
const THEME_BG: Record<string, string> = {
  feminine:  'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fff7ed 100%)',
  masculine: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #ecfdf5 100%)',
  neutral:   'linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 40%, #fef9c3 100%)',
};

/* ── Page loader ─────────────────────────────── */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg,#e0f2fe,#f5f3ff,#fef3c7)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-pink-200 border-b-pink-400 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-violet-500 text-sm font-semibold tracking-wide">Loading...</p>
      <div className="flex gap-1">
        {['🎯', '⚡', '🏆'].map((e, i) => (
          <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ── Route guards ────────────────────────────── */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.isOnboarded) return <Navigate to="/dashboard" replace />;
  if (isAuthenticated && !user?.isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/* ── 404 Page ────────────────────────────────── */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6"
      style={{ background: 'linear-gradient(135deg,#f0f9ff,#f5f3ff,#fef3c7)' }}>
      <div className="animate-pop-in">
        {/* Bouncing emojis */}
        <div className="flex justify-center gap-3 mb-6">
          {['😵', '🔍', '🗺️'].map((e, i) => (
            <span key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
          ))}
        </div>
        <p className="font-black text-8xl mb-4 ff-text-gradient-rainbow">404</p>
        <h2 className="text-2xl font-bold text-indigo-900 mb-3">Looks like this path lost focus.</h2>
        <p className="text-indigo-400 mb-8 text-sm">The page you're looking for doesn't exist — but your goals do!</p>
        <a href="/" className="ff-btn ff-btn-primary px-8 py-3 text-base">
          🏠 Return to Forge
        </a>
      </div>
    </div>
  );
}

/* ── App ─────────────────────────────────────── */
export default function App() {
  const { user } = useAuthStore();
  const bg = THEME_BG[user?.theme || 'neutral'];

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.6s ease' }}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/"          element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected app routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/goals"         element={<Goals />} />
              <Route path="/goals/new"     element={<CreateGoal />} />
              <Route path="/goals/:id"     element={<GoalDetail />} />
              <Route path="/proof"         element={<ProofCenter />} />
              <Route path="/analytics"     element={<Analytics />} />
              <Route path="/achievements"  element={<Achievements />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings"      element={<Settings />} />
              <Route path="/commitments"         element={<Commitments />} />
              <Route path="/commitments/new"     element={<CreateCommitment />} />
              <Route path="/commitments/:id"     element={<CommitmentDetail />} />
              <Route path="/commitments/history" element={<CommitmentHistory />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Toast notifications — vibrant style */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.95)',
            color: '#1e1b4b',
            border: '1.5px solid rgba(139,92,246,0.25)',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(139,92,246,0.15)',
            backdropFilter: 'blur(20px)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
    </div>
  );
}
