import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShieldCheck,
  Github,
  Camera,
  PenTool,
  Upload,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Save,
  X,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Bell,
  Star,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { goalsAPI } from '../services/api';
import { Goal } from '../types';
import { getTheme, CATEGORY_COLORS } from '../themes/themeConfig';
import CelebrationScene from '../components/3d/CelebrationScene';
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const theme = getTheme(user?.theme || 'neutral');

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchGoal = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await goalsAPI.getGoal(id);
      const data = res.data.goal || res.data.data || res.data;
      setGoal(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
    } catch {
      setError('Failed to load goal. It may have been deleted or you do not have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const countdown = useMemo(() => {
    if (!goal) return null;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const isOverdue = diff < 0;
    const days = Math.abs(differenceInDays(deadline, now));
    const hours = Math.abs(differenceInHours(deadline, now)) % 24;
    const minutes = Math.abs(differenceInMinutes(deadline, now)) % 60;
    return { days, hours, minutes, isOverdue, totalMs: diff };
  }, [goal]);

  const handleComplete = async () => {
    if (!goal) return;
    setActionLoading('complete');
    try {
      await goalsAPI.completeGoal(goal._id);
      toast.success('Goal marked as complete! 🎉 Commitment forged.');
      fetchGoal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to complete goal';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!goal) return;
    if (editTitle.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (editDescription.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    setActionLoading('edit');
    try {
      const res = await goalsAPI.updateGoal(goal._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setGoal((prev) => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() } : prev);
      setEditing(false);
      toast.success('Goal updated successfully!');
      void res;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update goal';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    setActionLoading('delete');
    try {
      await goalsAPI.deleteGoal(goal._id);
      toast.success('Goal deleted');
      navigate('/goals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete goal';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const cat = goal ? CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.other : CATEGORY_COLORS.other;

  const statusConfig = {
    active: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', label: '● Active' },
    completed: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', label: '✓ Completed' },
    failed: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', label: '✗ Failed' },
    paused: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: '⏸ Paused' },
  };

  const verificationIcon = goal?.verificationType === 'github' ? Github : goal?.verificationType === 'photo' ? Camera : PenTool;
  const verificationLabel = goal?.verificationType === 'github' ? 'GitHub' : goal?.verificationType === 'photo' ? 'Photo Proof' : 'Manual Check-in';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe,#ecfdf5)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-violet-500 text-sm font-semibold">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="ff-card text-center p-10 max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-indigo-900 mb-3">Goal Not Found</h2>
          <p className="text-indigo-400 mb-8">{error || 'This goal could not be loaded.'}</p>
          <Link to="/goals" className="ff-btn ff-btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Goals
          </Link>
        </motion.div>
      </div>
    );
  }

  const status = statusConfig[goal.status];

  return (
    <div className="relative min-h-screen px-4 md:px-8 lg:px-12 max-w-6xl mx-auto pt-6 pb-20"
      style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#ecfdf5 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float" style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-60 rounded-full blur-3xl opacity-20 animate-float-slow" style={{ background:'rgba(16,185,129,0.18)' }} />
      </div>

      {/* Back Nav */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 relative z-10">
        <Link to="/goals" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-700 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Goals
        </Link>
      </motion.div>

      {/* Hero Section with 3D Crystal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ff-card mb-8 overflow-hidden relative"
      >
        {/* Glow */}
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${cat.bg} rounded-3xl blur-2xl`} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: theme.crystalColor }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left: 3D Celebration Scene */}
          <div className="lg:col-span-2 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-violet-100 min-h-[280px] flex items-center justify-center">
            {goal.status === 'completed' ? (
              <CelebrationScene color={theme.crystalColor} />
            ) : (
              <div className="w-full h-full" style={{ minHeight: 280 }}>
                <CelebrationScene color={cat.text.includes('blue') ? '#60a5fa' : cat.text.includes('amber') ? '#fbbf24' : cat.text.includes('green') ? '#4ade80' : cat.text.includes('purple') ? '#c084fc' : cat.text.includes('pink') ? '#f472b6' : theme.crystalColor} />
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full animate-float"
                  style={{
                    backgroundColor: theme.primary,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Goal Info */}
          <div className="lg:col-span-3 p-6 md:p-8">
            {/* Category + Status */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`${cat.bg} ${cat.text} text-xs font-medium px-3 py-1 rounded-full border border-violet-100`}>
                {cat.icon} {goal.category}
              </span>
              <span className={`${status.bg} ${status.color} text-xs font-medium px-3 py-1 rounded-full border ${status.border}`}>
                {status.label}
              </span>
              {goal.streak > 0 && (
                <span className="bg-orange-500/15 text-orange-400 text-xs font-medium px-3 py-1 rounded-full border border-orange-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {goal.streak}-day streak
                </span>
              )}
            </div>

            {/* Title & Description (Editable) */}
            <div className="mb-6">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-white text-xl md:text-2xl font-bold focus:outline-none focus:border-white/30"
                    placeholder="Goal title"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-white/30 resize-none"
                    placeholder="Describe your goal..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading === 'edit'}
                      className={`${theme.primaryBtn} ${theme.primaryBtnHover} px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50`}
                    >
                      {actionLoading === 'edit' ? (
                        <div className="w-4 h-4 border-2 border-violet-200 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditTitle(goal.title);
                        setEditDescription(goal.description);
                      }}
                      disabled={actionLoading === 'edit'}
                      className="px-4 py-2 rounded-xl text-sm font-medium border border-white/15 text-indigo-500 hover:bg-violet-100/50 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {goal.title}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 rounded-xl text-indigo-400 hover:text-white hover:bg-violet-100/50 transition-all flex-shrink-0"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white/55 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {goal.description}
                  </p>
                </>
              )}
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap gap-2">
              {goal.status === 'active' && (
                <>
                  <Link
                    to={`/proof?goalId=${goal._id}`}
                    className={`${theme.primaryBtn} ${theme.primaryBtnHover} px-5 py-2.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 shadow-lg`}
                    style={{ boxShadow: `0 6px 20px ${theme.primary}30` }}
                  >
                    <Upload className="w-4 h-4" />
                    Submit Proof
                  </Link>
                  <button
                    onClick={handleComplete}
                    disabled={actionLoading === 'complete'}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {actionLoading === 'complete' ? (
                      <div className="w-4 h-4 border-2 border-emerald-300/20 border-t-emerald-300 rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Mark Complete
                  </button>
                </>
              )}
              {goal.status === 'completed' && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                  <Trophy className="w-4 h-4" />
                  Commitment Forged · +{goal.xpReward} XP
                </div>
              )}
              {goal.status === 'failed' && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold">
                  <XCircle className="w-4 h-4" />
                  Commitment Missed
                </div>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionLoading === 'delete'}
                className="ml-auto p-2.5 rounded-xl text-indigo-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                title="Delete goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {/* Commitment Amount */}
        <div className="relative bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 animate-float"
            style={{ backgroundColor: theme.primary }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              Commitment
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              ${goal.commitmentAmount}
            </div>
            <div className="text-[10px] text-indigo-300 mt-1">TEST MODE</div>
          </div>
        </div>

        {/* Progress */}
        <div className="relative bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 animate-float-delay-1"
            style={{ backgroundColor: theme.accent }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Progress
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">{goal.progress}%</div>
            <div className="h-1.5 bg-violet-100/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* XP Reward */}
        <div className="relative bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 animate-float-delay-2"
            style={{ backgroundColor: theme.crystalColor }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-2">
              <Award className="w-3.5 h-3.5" />
              XP Reward
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">+{goal.xpReward}</div>
            <div className="text-[10px] text-indigo-300 mt-1">
              {goal.status === 'completed' ? 'Earned' : 'On completion'}
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="relative bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 animate-float-delay-3"
            style={{ backgroundColor: '#f97316' }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-2">
              <Flame className="w-3.5 h-3.5" />
              Streak
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">{goal.streak}</div>
            <div className="text-[10px] text-indigo-300 mt-1">
              {goal.streak === 1 ? 'day' : 'days'} consistent
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deadline Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="ff-card p-6 md:p-8 overflow-hidden relative"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 animate-float"
              style={{ backgroundColor: countdown?.isOverdue ? '#ef4444' : theme.primary }} />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Deadline Countdown
                  </h3>
                  <p className="text-indigo-400 text-sm mt-1">
                    {new Date(goal.deadline).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${countdown?.isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : status.bg + ' ' + status.color + ' border ' + status.border}`}>
                  {countdown?.isOverdue ? 'Overdue' : goal.status === 'completed' ? 'Completed' : formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })}
                </span>
              </div>

              {countdown && goal.status === 'active' && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Days', value: countdown.days, icon: Calendar },
                    { label: 'Hours', value: countdown.hours, icon: Clock },
                    { label: 'Minutes', value: countdown.minutes, icon: Target },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className={`relative text-center p-5 rounded-2xl border overflow-hidden ${
                          countdown.isOverdue
                            ? 'bg-red-500/10 border-red-500/20'
                            : 'bg-violet-50/50 border-violet-100'
                        }`}
                      >
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                          style={{
                            background: countdown.isOverdue
                              ? 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.15), transparent 70%)'
                              : `radial-gradient(circle at 50% 0%, ${theme.primary}20, transparent 70%)`,
                          }} />
                        <div className="relative">
                          <Icon className={`w-4 h-4 mx-auto mb-2 ${countdown.isOverdue ? 'text-red-400' : 'text-indigo-400'}`} />
                          <div className={`text-3xl md:text-4xl font-bold ${countdown.isOverdue ? 'text-red-400' : 'text-white'}`}>
                            {item.value}
                          </div>
                          <div className={`text-[10px] mt-1 ${countdown.isOverdue ? 'text-red-400/60' : 'text-indigo-300'}`}>
                            {item.label}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {goal.status === 'completed' && (
                <div className="flex items-center justify-center gap-3 py-8 text-emerald-400">
                  <Trophy className="w-6 h-6" />
                  <span className="font-semibold">You beat the clock! Goal completed {goal.completedAt ? formatDistanceToNow(new Date(goal.completedAt), { addSuffix: true }) : ''}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ff-card p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progress Tracking
              </h3>
              <span className="text-2xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
                {goal.progress}%
              </span>
            </div>

            <div className="mb-6">
              <div className="h-3 bg-violet-100/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                </motion.div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-indigo-300">
                <span>Started: {new Date(goal.createdAt).toLocaleDateString()}</span>
                <span>{goal.progress < 100 ? `${100 - goal.progress}% to go` : '🎉 Complete!'}</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-5 gap-2">
              {[0, 25, 50, 75, 100].map((milestone) => {
                const reached = goal.progress >= milestone;
                return (
                  <div key={milestone} className="text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl mx-auto flex items-center justify-center mb-2 border transition-all ${
                      reached
                        ? 'border-transparent'
                        : 'border-violet-100 bg-violet-50/50'
                    }`}
                    style={reached ? {
                      backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 4px 12px ${theme.primary}40`,
                    } : {}}
                    >
                      {reached ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      ) : (
                        <span className="text-indigo-300 text-xs font-medium">{milestone}%</span>
                      )}
                    </div>
                    <div className={`text-[10px] ${reached ? 'text-white/70' : 'text-indigo-300'}`}>
                      {milestone}%
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Activity / Streak Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="ff-card p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Activity & Streak
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 text-center">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{goal.streak}</div>
                <div className="text-xs text-indigo-400">Current Streak</div>
              </div>
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 text-center">
                <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {goal.status === 'completed' ? goal.streak : Math.max(0, goal.streak - 1)}
                </div>
                <div className="text-xs text-indigo-400">Best Streak</div>
              </div>
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2"
                  style={{ color: theme.crystalColor }} />
                <div className="text-2xl font-bold text-white">+{goal.xpReward}</div>
                <div className="text-xs text-indigo-400">XP on Complete</div>
              </div>
            </div>

            {/* Simplified streak bar - 14 days */}
            <div>
              <p className="text-xs text-indigo-400 mb-3">Last 14 Days Activity</p>
              <div className="flex gap-1.5 justify-between">
                {Array.from({ length: 14 }, (_, i) => {
                  const dayOffset = 13 - i;
                  const dayIntensity = i < goal.streak
                    ? Math.min(1, (goal.streak - i) / 7)
                    : 0;
                  const baseOpacity = 0.05 + dayIntensity * 0.7;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: 0.3 + (13 - dayOffset) * 0.02 }}
                      className="flex-1 h-8 rounded-md"
                      style={{
                        backgroundColor: dayIntensity > 0
                          ? theme.primary
                          : 'rgba(255,255,255,0.05)',
                        opacity: dayIntensity > 0 ? baseOpacity : 1,
                        boxShadow: dayIntensity > 0.5 ? `0 0 8px ${theme.primary}50` : 'none',
                      }}
                      title={`${dayOffset} day${dayOffset === 1 ? '' : 's'} ago`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-white/25">
                <span>14d ago</span>
                <span>Today</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Verification Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <ShieldCheck className="w-5 h-5" />
              Verification
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.primaryBtn}`}
                    style={{ boxShadow: `0 4px 12px ${theme.primary}30` }}
                  >
                    {verificationIcon && (() => {
                      const Icon = verificationIcon;
                      return <Icon className="w-4 h-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{verificationLabel}</div>
                    <div className="text-xs text-indigo-400">
                      {goal.verificationType === 'github'
                        ? 'Automated commit tracking'
                        : goal.verificationType === 'photo'
                        ? 'Upload photo evidence'
                        : 'Self-attested check-in'}
                    </div>
                  </div>
                </div>
              </div>

              {goal.verificationType === 'github' && (
                <div className="space-y-2 p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                  <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2">
                    <Github className="w-3.5 h-3.5" />
                    Repository Details
                  </div>
                  {goal.githubUsername && (
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-400">Username</span>
                      <span className="text-white/80 font-medium">{goal.githubUsername}</span>
                    </div>
                  )}
                  {goal.githubRepo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-400">Repository</span>
                      <span className="text-white/80 font-medium">{goal.githubRepo}</span>
                    </div>
                  )}
                  {goal.githubBranch && (
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-400">Branch</span>
                      <span className="text-white/80 font-medium">{goal.githubBranch}</span>
                    </div>
                  )}
                  {goal.githubUsername && goal.githubRepo && (
                    <a
                      href={`https://github.com/${goal.githubUsername}/${goal.githubRepo}${goal.githubBranch ? `/tree/${goal.githubBranch}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-2 border-t border-violet-100"
                    >
                      View on GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5" />
              Reminders
            </h3>

            {goal.reminderDays && goal.reminderDays.length > 0 ? (
              <div className="space-y-2">
                {goal.reminderDays.sort((a, b) => b - a).map((day) => (
                  <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-3.5 h-3.5" style={{ color: theme.crystalColor }} />
                      <span className="text-sm text-white/70">
                        {day === 7 ? '1 week before' : day === 3 ? '3 days before' : day === 1 ? '1 day before' : day === 0 ? 'On deadline day' : `${day} days before`}
                      </span>
                    </div>
                    <span className={`badge-base ${theme.badge}`}>ON</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-indigo-400 text-sm">No reminders set</p>
                <p className="text-white/25 text-xs mt-1">You can enable reminders when creating a goal</p>
              </div>
            )}
          </motion.div>

          {/* Goal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-violet-50/50 backdrop-blur-xl border border-violet-100 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Target className="w-5 h-5" />
              Goal Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-indigo-400">Created</span>
                <span className="text-white/70">{new Date(goal.createdAt).toLocaleDateString()}</span>
              </div>
              {goal.completedAt && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-indigo-400">Completed</span>
                  <span className="text-emerald-400">{new Date(goal.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-indigo-400">Deadline</span>
                <span className="text-white/70">{new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-indigo-400">Penalty Destination</span>
                <span className="text-white/70 capitalize">{goal.penaltyDestination || 'Charity'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-400">Goal ID</span>
                <span className="text-indigo-300 font-mono text-xs">{goal._id.slice(0, 8)}...</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setShowDeleteConfirm(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-violet-50/50 backdrop-blur-2xl border border-violet-100 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Delete this goal?</h3>
                    <p className="text-indigo-400 text-sm leading-relaxed">
                      This action cannot be undone. Your commitment amount will be forfeited and all progress will be lost.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => !actionLoading && setShowDeleteConfirm(false)}
                    disabled={actionLoading === 'delete'}
                    className="flex-1 py-3 rounded-2xl font-medium border border-white/15 text-white/70 hover:bg-violet-100/50 hover:text-white transition-all disabled:opacity-30"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === 'delete'}
                    className="flex-1 py-3 rounded-2xl font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {actionLoading === 'delete' ? (
                      <div className="w-4 h-4 border-2 border-red-300/20 border-t-red-300 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
