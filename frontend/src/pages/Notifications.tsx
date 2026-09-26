import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Trash2, CheckCheck, Target, Trophy, Shield, TrendingUp, Zap, Flame, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';
import { Notification } from '../types';

const TYPE_CFG: Record<string, { icon: typeof Bell; grad: string; bg: string; color: string }> = {
  goal_created:        { icon: Target,      grad:'from-blue-400 to-indigo-500',   bg:'rgba(99,102,241,0.12)',   color:'#4338ca' },
  goal_completed:      { icon: Trophy,      grad:'from-emerald-400 to-teal-500',  bg:'rgba(16,185,129,0.12)',   color:'#047857' },
  goal_failed:         { icon: AlertCircle, grad:'from-red-400 to-rose-500',      bg:'rgba(239,68,68,0.12)',    color:'#b91c1c' },
  proof_submitted:     { icon: Shield,      grad:'from-violet-400 to-purple-500', bg:'rgba(139,92,246,0.12)',   color:'#6d28d9' },
  proof_verified:      { icon: CheckCheck,  grad:'from-emerald-400 to-teal-500',  bg:'rgba(16,185,129,0.12)',   color:'#047857' },
  proof_rejected:      { icon: AlertCircle, grad:'from-red-400 to-rose-500',      bg:'rgba(239,68,68,0.12)',    color:'#b91c1c' },
  achievement_unlocked:{ icon: Trophy,      grad:'from-amber-400 to-yellow-500',  bg:'rgba(245,158,11,0.12)',   color:'#b45309' },
  streak_milestone:    { icon: Flame,       grad:'from-orange-400 to-red-500',    bg:'rgba(249,115,22,0.12)',   color:'#c2410c' },
  level_up:            { icon: Zap,         grad:'from-yellow-400 to-amber-500',  bg:'rgba(234,179,8,0.12)',    color:'#b45309' },
  deadline_approaching:{ icon: AlertCircle, grad:'from-amber-400 to-orange-500',  bg:'rgba(245,158,11,0.12)',   color:'#b45309' },
};
const DEFAULT_CFG = { icon: Bell, grad:'from-slate-400 to-slate-500', bg:'rgba(100,116,139,0.12)', color:'#475569' };

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch { toast.error('Could not load notifications'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await notificationsAPI.markRead(id);
    setNotifications(p => p.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(p => Math.max(0, p - 1));
  };

  const markAll = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnread(0);
    toast.success('All caught up! ✓');
  };

  const del = async (id: string) => {
    await notificationsAPI.deleteNotification(id);
    setNotifications(p => p.filter(n => n._id !== id));
    toast.success('Removed');
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#f0f9ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30 animate-float"
          style={{ background:'rgba(139,92,246,0.25)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-25 animate-float-slow"
          style={{ background:'rgba(236,72,153,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 flex items-center gap-3">
              Notifications 🔔
              {unread > 0 && (
                <span className="text-sm font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-indigo-400 text-sm mt-1">{unread > 0 ? `${unread} unread` : 'All caught up! 🎉'}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="ff-btn ff-btn-outline text-sm py-2 px-4">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="ff-card text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <BellOff className="w-10 h-10 text-indigo-200 mx-auto mb-3" />
            <h3 className="text-indigo-500 font-semibold">No notifications yet</h3>
            <p className="text-indigo-300 text-sm mt-1">Activity updates will appear here</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {notifications.map((n, i) => {
                const cfg = TYPE_CFG[n.type] ?? DEFAULT_CFG;
                const Icon = cfg.icon;
                return (
                  <motion.div key={n._id}
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => !n.read && markRead(n._id)}
                    className={`notif-item ${!n.read ? 'unread' : ''} group`}>
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${cfg.grad}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${n.read ? 'text-indigo-500' : 'text-indigo-900'}`}>{n.title}</p>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }} />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${n.read ? 'text-indigo-300' : 'text-indigo-500'}`}>{n.message}</p>
                      <p className="text-indigo-200 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    {/* Delete */}
                    <button onClick={e => { e.stopPropagation(); del(n._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-indigo-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
