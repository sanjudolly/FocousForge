import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from './Navbar';

/* Vibrant per-theme page backgrounds */
const THEME_BG: Record<string, string> = {
  feminine:  'linear-gradient(135deg,#fdf2f8 0%,#f5f3ff 50%,#fff7ed 100%)',
  masculine: 'linear-gradient(135deg,#e0f2fe 0%,#ede9fe 50%,#ecfdf5 100%)',
  neutral:   'linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 40%,#fef9c3 100%)',
};

export default function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const bg = THEME_BG[user?.theme ?? 'neutral'];
    document.body.style.background = bg;
    document.body.style.transition  = 'background 0.5s ease';
    return () => { document.body.style.background = ''; };
  }, [user?.theme]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAuthenticated && !user?.isOnboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen relative" style={{ background: THEME_BG[user?.theme ?? 'neutral'] }}>
      <Navbar />
      <main className="pt-20 pb-12 px-0">
        <Outlet />
      </main>
    </div>
  );
}
