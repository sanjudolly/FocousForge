import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Clock, CheckCircle2, Github, Camera, PenLine, Zap, ArrowRight, Trophy, XCircle } from 'lucide-react';
import { Goal } from '../../types';
import { differenceInDays, differenceInHours } from 'date-fns';

const CAT_CONFIG: Record<string, { emoji: string; grad: string; light: string; text: string }> = {
  coding:   { emoji:'💻', grad:'from-cyan-400 to-blue-500',     light:'rgba(14,165,233,0.12)',  text:'#0369a1' },
  study:    { emoji:'📚', grad:'from-amber-400 to-yellow-500',  light:'rgba(245,158,11,0.12)',  text:'#b45309' },
  fitness:  { emoji:'💪', grad:'from-emerald-400 to-teal-500',  light:'rgba(16,185,129,0.12)',  text:'#047857' },
  career:   { emoji:'🚀', grad:'from-violet-400 to-purple-500', light:'rgba(139,92,246,0.12)',  text:'#6d28d9' },
  personal: { emoji:'✨', grad:'from-pink-400 to-rose-500',     light:'rgba(236,72,153,0.12)',  text:'#be185d' },
  other:    { emoji:'🎯', grad:'from-slate-400 to-slate-600',   light:'rgba(100,116,139,0.12)', text:'#475569' },
};

const STATUS_CONFIG = {
  active:    { label:'● Active',    bg:'rgba(16,185,129,0.12)',  color:'#047857',  border:'rgba(16,185,129,0.3)' },
  completed: { label:'✓ Done',      bg:'rgba(14,165,233,0.12)',  color:'#0369a1',  border:'rgba(14,165,233,0.3)' },
  failed:    { label:'✗ Missed',    bg:'rgba(239,68,68,0.12)',   color:'#b91c1c',  border:'rgba(239,68,68,0.3)'  },
  paused:    { label:'⏸ Paused',   bg:'rgba(245,158,11,0.12)',  color:'#b45309',  border:'rgba(245,158,11,0.3)' },
};

const VERIFY_ICON = { github: Github, photo: Camera, manual: PenLine };

function countdown(deadline: string) {
  const d = new Date(deadline);
  const now = new Date();
  const days = differenceInDays(d, now);
  if (days > 1)  return { text: `${days}d left`,    urgent: false };
  const hrs = differenceInHours(d, now);
  if (hrs > 0)   return { text: `${hrs}h left`,     urgent: true };
  return         { text: 'Overdue',                  urgent: true, overdue: true };
}

interface Props { goal: Goal; onComplete?: (id: string) => void; }

export default function GoalCard({ goal, onComplete }: Props) {
  const cat    = CAT_CONFIG[goal.category] ?? CAT_CONFIG.other;
  const status = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.active;
  const timer  = countdown(goal.deadline);
  const VIcon  = VERIFY_ICON[goal.verificationType] ?? PenLine;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="goal-card flex flex-col gap-3"
    >
      {/* Category + status row */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
          style={{ background: cat.light, color: cat.text }}>
          <span className={`w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br ${cat.grad} text-[10px]`}>
            {cat.emoji}
          </span>
          {goal.category}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
          {status.label}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-bold text-indigo-900 text-base leading-snug line-clamp-2">{goal.title}</h3>
        <p className="text-indigo-400 text-xs mt-1 line-clamp-2">{goal.description}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-indigo-400 text-xs">Progress</span>
          <span className="text-indigo-700 text-xs font-bold">{goal.progress}%</span>
        </div>
        <div className="ff-progress-track">
          <motion.div className="ff-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${cat.text}, ${cat.text}88)` }} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs">
        {/* Deadline */}
        <span className={`flex items-center gap-1 font-medium ${timer.overdue ? 'text-red-500' : timer.urgent ? 'text-orange-500' : 'text-indigo-400'}`}>
          <Clock size={11} />{timer.text}
        </span>
        {/* Streak */}
        {goal.streak > 0 && (
          <span className="flex items-center gap-1 text-orange-500 font-medium">
            <Flame size={11} />{goal.streak}d
          </span>
        )}
        {/* XP */}
        <span className="flex items-center gap-1 text-violet-500 font-medium ml-auto">
          <Zap size={11} fill="currentColor" />+{goal.xpReward}
        </span>
        {/* Verification type */}
        <span className="text-indigo-300"><VIcon size={11} /></span>
      </div>

      {/* Commitment amount */}
      {goal.commitmentAmount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background:'rgba(245,158,11,0.1)', color:'#b45309', border:'1px solid rgba(245,158,11,0.2)' }}>
          💰 ${goal.commitmentAmount} staked <span className="text-amber-400 text-[10px]">(TEST)</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        {goal.status === 'active' && (
          <>
            <Link to={`/proof?goalId=${goal._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow:'0 2px 10px rgba(139,92,246,0.3)' }}>
              📸 Submit Proof
            </Link>
            {onComplete && (
              <button onClick={() => onComplete(goal._id)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background:'rgba(16,185,129,0.1)', color:'#047857', border:'1px solid rgba(16,185,129,0.25)' }}
                title="Mark complete">
                <CheckCircle2 size={14} />
              </button>
            )}
          </>
        )}
        {goal.status === 'completed' && (
          <div className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-bold"
            style={{ background:'rgba(14,165,233,0.1)', color:'#0369a1' }}>
            <Trophy size={13} /> Forged! +{goal.xpReward} XP
          </div>
        )}
        {goal.status === 'failed' && (
          <div className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-bold"
            style={{ background:'rgba(239,68,68,0.08)', color:'#b91c1c' }}>
            <XCircle size={13} /> Commitment Missed
          </div>
        )}
        <Link to={`/goals/${goal._id}`}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background:'rgba(139,92,246,0.08)', color:'#6d28d9', border:'1px solid rgba(139,92,246,0.15)' }}>
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
