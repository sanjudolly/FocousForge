import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutDashboard, Target, BarChart3, Trophy, Bell, Settings, LogOut, Menu, X, Shield, Coins } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { label:'Dashboard',    icon:LayoutDashboard, path:'/dashboard' },
  { label:'Commitments',  icon:Coins,           path:'/commitments' },
  { label:'Goals',        icon:Target,          path:'/goals' },
  { label:'Proof',        icon:Shield,          path:'/proof' },
  { label:'Analytics',    icon:BarChart3,        path:'/analytics' },
  { label:'Achievements', icon:Trophy,           path:'/achievements' },
  { label:'Notifications',icon:Bell,             path:'/notifications' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const xpInLevel = (user?.xp ?? 0) % 500;
  const xpPct     = (xpInLevel / 500) * 100;
  const handleLogout = () => { logout(); navigate('/'); };

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 ff-navbar">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-lg text-indigo-900 tracking-tight">Study Forge</span>
          </Link>
          <div className="hidden md:flex items-center gap-5">
            {['Features','Commitments','How It Works','FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`}
                className="text-indigo-500 hover:text-indigo-900 text-sm font-medium transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 transition-all">Login</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-bold rounded-xl text-white shadow-md"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }}>
              Get Started 🚀
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-5 py-2 ff-navbar">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-indigo-900 hidden sm:block text-base tracking-tight">Study Forge</span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ label, icon:Icon, path }) => {
              const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <Link key={path} to={path}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={active
                    ? { background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))', color:'#4c1d95', border:'1px solid rgba(139,92,246,0.2)' }
                    : { color:'rgba(100,80,180,0.6)', border:'1px solid transparent' }}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.15)' }}>
              <span className="text-xs text-indigo-400 font-semibold">Lv.{user?.level}</span>
              <div className="w-14 h-1.5 rounded-full" style={{ background:'rgba(139,92,246,0.12)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width:`${xpPct}%`, background:'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
              </div>
            </div>
            <Link to="/settings" className="p-2 rounded-xl text-indigo-400 hover:text-indigo-700 hover:bg-violet-50 transition-all">
              <Settings className="w-4 h-4" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-xl text-indigo-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
            <button className="lg:hidden p-2 rounded-xl text-indigo-400 hover:text-indigo-700 hover:bg-violet-50 transition-all"
              onClick={() => setOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:25, stiffness:300 }}
              className="absolute right-0 top-0 bottom-0 w-72 p-6"
              style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(24px)', borderLeft:'1.5px solid rgba(139,92,246,0.15)', boxShadow:'-8px 0 40px rgba(139,92,246,0.15)' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                    <Zap className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                  <span className="font-black text-indigo-900">Study Forge</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-indigo-400 hover:text-indigo-700 p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-5 p-3 rounded-xl" style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.12)' }}>
                <div className="flex justify-between text-xs text-indigo-500 mb-1.5 font-semibold">
                  <span>Level {user?.level}</span><span>{xpInLevel}/500 XP</span>
                </div>
                <div className="h-2 rounded-full" style={{ background:'rgba(139,92,246,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width:`${xpPct}%`, background:'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
                </div>
              </div>
              <div className="space-y-1">
                {NAV_ITEMS.map(({ label, icon:Icon, path }) => {
                  const active = location.pathname === path;
                  return (
                    <Link key={path} to={path} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={active ? { background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))', color:'#4c1d95' } : { color:'rgba(100,80,180,0.7)' }}>
                      <Icon className="w-4 h-4" />{label}
                    </Link>
                  );
                })}
                <Link to="/settings" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-700 hover:bg-violet-50 transition-all">
                  <Settings className="w-4 h-4" />Settings
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 w-full text-left transition-all">
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
