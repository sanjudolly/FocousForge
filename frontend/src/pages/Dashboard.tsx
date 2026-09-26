import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Plus, Flame, Trophy, Zap, TrendingUp, AlertCircle, Star, CheckCircle2, Clock, IndianRupee, Heart, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { goalsAPI } from '../services/api';
import { DashboardData, Goal, Commitment } from '../types';
import GoalCard from '../components/ui/GoalCard';
import CommitmentCard from '../components/ui/CommitmentCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ProgressRing from '../components/ui/ProgressRing';
import { SkeletonCard, SkeletonStat } from '../components/ui/LoadingSkeleton';
import { DashboardCompanion, PageFloaters } from '../components/ui/FloatingElements';

/* ── Stat card ───────────────────────────────── */
function StatCard({ label, value, icon: Icon, grad, suffix = '', delay = 0 }: {
  label: string; value: number; icon: React.ElementType;
  grad: string; suffix?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="dash-stat-card">
      <div className="dash-stat-header">
        <span className="dash-stat-label">{label}</span>
        <div className={`dash-stat-icon-wrap bg-gradient-to-br ${grad}`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <div className="dash-stat-value ff-text-gradient-royal" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="dash-stat-bar">
        <motion.div className={`dash-stat-bar-fill bg-gradient-to-r ${grad}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value * 2)}%` }}
          transition={{ delay: delay + 0.4, duration: 1 }} />
      </div>
    </motion.div>
  );
}

/* ── Quick action ───────────────────────────── */
function QuickLink({ emoji, label, to, grad }: { emoji: string; label: string; to: string; grad: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
      style={{ background: 'rgba(139,92,246,0.05)', border: '1.5px solid rgba(139,92,246,0.1)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; }}>
      <div className={`w-8 h-8 rounded-lg text-base flex items-center justify-center bg-gradient-to-br ${grad}`}>
        {emoji}
      </div>
      <span className="text-indigo-700 text-sm font-medium flex-1">{label}</span>
      <span className="text-indigo-300 text-xs">→</span>
    </Link>
  );
}

/* ════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
  const sublines = ['Your commitments are waiting.','Every promise kept builds identity.','One goal at a time.','Progress over perfection.','Today is a new chance to forge.'];
  const subline = sublines[hour % sublines.length];

  useEffect(() => {
    goalsAPI.getDashboard()
      .then(res => {
        setData(res.data.dashboard);
        updateUser({ xp: res.data.dashboard.user.xp, level: res.data.dashboard.user.level, streak: res.data.dashboard.user.streak, focusScore: res.data.dashboard.user.focusScore });
      })
      .catch(() => toast.error('Could not load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await goalsAPI.completeGoal(id);
      toast.success('🏆 Commitment Forged!');
      const res = await goalsAPI.getDashboard();
      setData(res.data.dashboard);
    } catch { toast.error('Could not complete goal'); }
  };

  const xpInLevel = (user?.xp ?? 0) % 500;
  const xpPct = (xpInLevel / 500) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 45%,#fef9c3 100%)' }}>
      <PageFloaters variant="default" />

      <div className="relative z-10 dash-inner">
        {/* HEADER */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting-sub">{timeGreet} · {subline}</p>
            <h1 className="dash-greeting-main">
              Hey, <span className="ff-text-gradient-candy">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-violet-600 font-semibold">
                <Zap size={12} fill="currentColor" /> Level {user?.level}
              </span>
              <span className="w-px h-3 bg-indigo-200" />
              <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
                <Flame size={12} /> {user?.streak ?? 0}-day streak
              </span>
              <span className="w-px h-3 bg-indigo-200" />
              <span className="text-indigo-400 text-xs">{(user?.xp ?? 0).toLocaleString()} XP</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/commitments/new" className="dash-new-btn"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              💰 Commit Money
            </Link>
            <Link to="/goals/new" className="dash-new-btn"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Plus size={16} /> New Goal
            </Link>
          </div>
        </div>

        {/* ── Charity Impact mini banner ── */}
        {!loading && ((data?.stats.commitMoneyCommitted ?? 0) > 0 || (data?.stats.activeCommitmentsCount ?? 0) > 0) && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="ff-card p-4" style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(139,92,246,0.06))', border:'1.5px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <p className="font-bold text-indigo-900 text-sm">Pocket Money Commitments</p>
                  <p className="text-indigo-400 text-xs">₹{(data?.stats.commitMoneyCommitted ?? 0).toLocaleString('en-IN')} committed · {data?.stats.activeCommitmentsCount ?? 0} active</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {(data?.stats.commitMoneyClaimed ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-2.5 py-1 rounded-xl" style={{ background:'rgba(16,185,129,0.1)' }}>
                    <Trophy size={11}/> ₹{(data?.stats.commitMoneyClaimed ?? 0).toLocaleString('en-IN')} claimed
                  </span>
                )}
                {(data?.stats.commitCharityImpact ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-pink-600 px-2.5 py-1 rounded-xl" style={{ background:'rgba(236,72,153,0.1)' }}>
                    <Heart size={11}/> ₹{(data?.stats.commitCharityImpact ?? 0).toLocaleString('en-IN')} → charity (TEST)
                  </span>
                )}
                <Link to="/commitments" className="ff-btn text-xs py-1.5 px-3" style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                  <Coins size={12}/> View All
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* TWO-COLUMN GRID */}
        <div className="dash-grid">

          {/* LEFT */}
          <div className="flex flex-col gap-5">

            {/* Stats */}
            <div className="dash-stats-row">
              {loading ? Array(4).fill(0).map((_,i) => <SkeletonStat key={i} />) : [
                { label:'Focus Score', value: data?.user.focusScore ?? 0, icon:TrendingUp, grad:'from-violet-400 to-purple-600' },
                { label:'Streak',      value: data?.user.streak ?? 0,     icon:Flame,      grad:'from-orange-400 to-red-500', suffix:'d' },
                { label:'Active',      value: data?.stats.activeGoals ?? 0,  icon:Target,  grad:'from-emerald-400 to-teal-500' },
                { label:'Completed',   value: data?.stats.completedGoals ?? 0, icon:Trophy, grad:'from-amber-400 to-yellow-500' },
              ].map((s,i) => <StatCard key={s.label} {...s} delay={i*0.08} />)}
            </div>

            {/* XP Bar */}
            <motion.div className="dash-xp-bar" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  <span className="text-indigo-700 text-sm font-bold">Level {user?.level} · XP Progress</span>
                </div>
                <span className="text-indigo-400 text-xs">{xpInLevel} / 500 XP</span>
              </div>
              <div className="ff-progress-track">
                <motion.div className="ff-progress-fill"
                  style={{ background:'linear-gradient(90deg,#8b5cf6,#ec4899,#f97316)' }}
                  initial={{ width:0 }}
                  animate={{ width:`${xpPct}%` }}
                  transition={{ duration:1.5, ease:'easeOut', delay:0.5 }} />
              </div>
              <p className="text-indigo-300 text-xs mt-1">{500 - xpInLevel} XP to Level {(user?.level ?? 1) + 1}</p>
            </motion.div>

            {/* Goals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-xl text-indigo-900">Active Commitments 🎯</h2>
                <Link to="/goals" className="text-violet-500 text-sm font-semibold hover:text-violet-700 transition-colors">View all →</Link>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)}
                </div>
              ) : (data?.goals ?? []).length === 0 ? (
                <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} className="dash-empty">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">Your focus journey starts with one promise.</h3>
                  <p className="text-indigo-400 text-sm mb-5">Create your first commitment and watch discipline become identity.</p>
                  <Link to="/goals/new" className="ff-btn inline-flex"
                    style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 14px rgba(139,92,246,0.35)' }}>
                    <Plus size={16} /> Create First Goal
                  </Link>
                </motion.div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {(data!.goals as Goal[]).map((goal, i) => (
                    <motion.div key={goal._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                      <GoalCard goal={goal} onComplete={handleComplete} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Test mode notice */}
            {(data?.stats.totalCommitmentValue ?? 0) > 0 && (
              <div className="flex gap-3 p-4 rounded-2xl"
                style={{ background:'rgba(245,158,11,0.1)', border:'1.5px solid rgba(245,158,11,0.25)' }}>
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-700 font-bold text-sm">TEST MODE — Simulated Commitments</p>
                  <p className="text-amber-500/70 text-xs mt-0.5">Total: ${(data?.stats.totalCommitmentValue ?? 0).toFixed(2)} · No real money.</p>
                </div>
              </div>
            )}

            {/* ── Recent Pocket Money Commitments ── */}
            {(data?.recentCommitments ?? []).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-xl text-indigo-900">Pocket Money Commitments 💰</h2>
                  <Link to="/commitments" className="text-violet-500 text-sm font-semibold hover:text-violet-700 transition-colors">View all →</Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(data!.recentCommitments as Commitment[]).slice(0,4).map((c, i) => (
                    <motion.div key={c._id} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}>
                      <CommitmentCard commitment={c} compact />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Commitment CTA */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              className="ff-card p-4 flex items-center gap-4"
              style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(139,92,246,0.06))', border:'1.5px solid rgba(139,92,246,0.15)' }}>
              <div className="text-2xl flex-shrink-0">💰</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo-900 text-sm">Commit pocket money to your studies</p>
                <p className="text-indigo-400 text-xs mt-0.5">Complete tasks + proof → claim back. Miss? Goes to charity (TEST MODE).</p>
              </div>
              <Link to="/commitments/new" className="ff-btn text-xs flex-shrink-0 py-2 px-3"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                <Plus size={12}/> Create
              </Link>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">

            {/* Focus ring */}
            <div className="dash-widget">
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-4 text-center">Focus Score</p>
              <div className="flex justify-center">
                <ProgressRing value={data?.user.focusScore ?? 0} size={130} strokeWidth={9}
                  color="#8b5cf6" label={`${data?.user.focusScore ?? 0}`} sublabel="/ 100" />
              </div>
              <p className="text-indigo-300 text-xs text-center mt-3">Completion · Streak · XP</p>
            </div>

            {/* Companion widget — floating animation */}
            <div className="dash-env-widget">
              <DashboardCompanion name={`${user?.name?.split(' ')[0]}'s Space`} level={user?.level ?? 1} xp={user?.xp ?? 0} />
            </div>

            {/* Quick links */}
            <div className="dash-widget">
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-3">Quick Actions</p>
              <div className="flex flex-col gap-2">
                <QuickLink emoji="🎯" label="Create Goal"    to="/goals/new"    grad="from-violet-400 to-purple-500" />
                <QuickLink emoji="📸" label="Submit Proof"   to="/proof"        grad="from-pink-400 to-rose-500" />
                <QuickLink emoji="📊" label="Analytics"      to="/analytics"    grad="from-blue-400 to-indigo-500" />
                <QuickLink emoji="🏆" label="Achievements"   to="/achievements" grad="from-amber-400 to-yellow-500" />
                <QuickLink emoji="🔔" label="Notifications"  to="/notifications" grad="from-emerald-400 to-teal-500" />
              </div>
            </div>

            {/* Recent badges */}
            {(data?.recentAchievements ?? []).length > 0 && (
              <div className="dash-widget">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide">Recent Badges</p>
                  <Link to="/achievements" className="text-violet-500 text-xs font-semibold">All →</Link>
                </div>
                {data!.recentAchievements.map((a, i) => (
                  <motion.div key={a.badgeId} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
                    className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.15))', border:'1px solid rgba(139,92,246,0.2)' }}>
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-indigo-900 text-xs font-bold">{a.name}</p>
                      <p className="text-violet-400 text-xs">+{a.xpReward} XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
