import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, CircleDot, AlertCircle, Trophy, ArrowRight, IndianRupee, Heart, Loader2 } from 'lucide-react';
import { Commitment } from '../../types';
import { differenceInHours, differenceInDays } from 'date-fns';

const STATUS_CFG = {
  active:          { label:'Active',              bg:'rgba(99,102,241,0.1)',  color:'#4338ca',  border:'rgba(99,102,241,0.25)',  icon:'🎯' },
  eligible_claim:  { label:'Eligible to Claim!',  bg:'rgba(16,185,129,0.12)', color:'#047857',  border:'rgba(16,185,129,0.3)',   icon:'🎉' },
  claimed:         { label:'Claimed ✓',           bg:'rgba(245,158,11,0.12)', color:'#b45309',  border:'rgba(245,158,11,0.3)',   icon:'🏆' },
  missed:          { label:'Missed',              bg:'rgba(239,68,68,0.1)',   color:'#b91c1c',  border:'rgba(239,68,68,0.25)',   icon:'😔' },
  charity_outcome: { label:'Charity Outcome',     bg:'rgba(236,72,153,0.1)', color:'#be185d',  border:'rgba(236,72,153,0.25)',  icon:'💝' },
};

const CAT_CFG: Record<string, { emoji:string; grad:string }> = {
  study:    { emoji:'📚', grad:'from-amber-400 to-yellow-500'   },
  coding:   { emoji:'💻', grad:'from-cyan-400 to-blue-500'      },
  fitness:  { emoji:'💪', grad:'from-emerald-400 to-teal-500'   },
  career:   { emoji:'🚀', grad:'from-violet-400 to-purple-500'  },
  personal: { emoji:'✨', grad:'from-pink-400 to-rose-500'      },
  other:    { emoji:'🎯', grad:'from-slate-400 to-slate-600'    },
};

function countdown(deadline: string) {
  const d   = new Date(deadline);
  const now = new Date();
  const days = differenceInDays(d, now);
  if (days > 1)  return { text:`${days}d left`, urgent:false };
  const hrs = differenceInHours(d, now);
  if (hrs > 0)   return { text:`${hrs}h left`, urgent:true };
  return           { text:'Overdue', urgent:true, overdue:true };
}

interface Props {
  commitment: Commitment;
  onTaskComplete?: (commitmentId: string, taskId: string) => Promise<void>;
  onClaim?: (id: string) => Promise<void>;
  compact?: boolean;
}

export default function CommitmentCard({ commitment: c, onTaskComplete, onClaim, compact = false }: Props) {
  const st     = STATUS_CFG[c.status] ?? STATUS_CFG.active;
  const cat    = CAT_CFG[c.category] ?? CAT_CFG.other;
  const timer  = countdown(c.deadline);
  const done   = c.tasks.filter(t => t.completed).length;
  const total  = c.tasks.length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

  const proofLabel: Record<string, string> = {
    not_submitted: 'Proof Required',
    submitted:     'Proof Submitted',
    under_review:  'Under Review',
    verified:      'Proof Verified ✓',
    rejected:      'Proof Rejected',
  };
  const proofColor: Record<string, string> = {
    not_submitted: '#94a3b8',
    submitted:     '#818cf8',
    under_review:  '#f59e0b',
    verified:      '#10b981',
    rejected:      '#ef4444',
  };

  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type:'spring', stiffness:300, damping:22 }}
      className="goal-card flex flex-col gap-3">

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1"
            style={{ background:`${cat.grad.includes('amber') ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.1)'}`, color:'#4c1d95' }}>
            <div className={`w-4 h-4 rounded bg-gradient-to-br ${cat.grad} flex items-center justify-center text-[9px]`}>
              {cat.emoji}
            </div>
            {c.category}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: st.bg, color: st.color, border:`1px solid ${st.border}` }}>
            {st.icon} {st.label}
          </span>
        </div>
        {/* Amount badge */}
        <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-xl flex-shrink-0"
          style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)' }}>
          <IndianRupee size={11} className="text-emerald-600" />
          <span className="text-emerald-700 font-black text-sm">{c.amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-bold text-indigo-900 text-base leading-snug line-clamp-2">{c.title}</h3>
        {!compact && <p className="text-indigo-400 text-xs mt-1 line-clamp-1">{c.description}</p>}
      </div>

      {/* Task progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-indigo-400 text-xs">Tasks {done}/{total}</span>
          <span className="text-indigo-700 text-xs font-bold">{pct}%</span>
        </div>
        <div className="ff-progress-track">
          <motion.div className="ff-progress-fill"
            initial={{ width:0 }} animate={{ width:`${pct}%` }}
            transition={{ duration:0.8, ease:'easeOut' }}
            style={{ background: pct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
        </div>
      </div>

      {/* Tasks list (compact shows only 2) */}
      {!compact && c.tasks.length > 0 && (
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {c.tasks.slice(0, compact ? 2 : 4).map(task => (
            <div key={task._id} className="flex items-center gap-2">
              <button
                onClick={() => onTaskComplete?.(c._id, task._id)}
                disabled={c.status !== 'active'}
                className="flex-shrink-0 transition-transform hover:scale-110 disabled:cursor-default">
                {task.completed
                  ? <CheckCircle2 size={14} className="text-emerald-500" />
                  : <CircleDot    size={14} className="text-indigo-200" />}
              </button>
              <span className={`text-xs ${task.completed ? 'line-through text-indigo-300' : 'text-indigo-600'}`}>
                {task.title}
              </span>
            </div>
          ))}
          {c.tasks.length > 4 && (
            <p className="text-indigo-300 text-xs pl-5">+{c.tasks.length - 4} more tasks</p>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs flex-wrap">
        <span className={`flex items-center gap-1 font-medium ${(timer as {overdue?:boolean}).overdue ? 'text-red-500' : timer.urgent ? 'text-orange-500' : 'text-indigo-400'}`}>
          <Clock size={11} />{timer.text}
        </span>
        <span className="text-xs font-medium" style={{ color: proofColor[c.proofStatus] }}>
          {proofLabel[c.proofStatus]}
        </span>
        <span className="text-indigo-300 text-xs ml-auto">For: {c.charityName.split(' ').slice(0,2).join(' ')}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        {c.status === 'eligible_claim' && onClaim && (
          <button onClick={() => onClaim(c._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white animate-pulse-slow"
            style={{ background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
            <Trophy size={13} /> Claim ₹{c.amount.toLocaleString('en-IN')}
          </button>
        )}
        {c.status === 'active' && (
          <Link to={`/commitments/${c._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow:'0 2px 10px rgba(139,92,246,0.3)' }}>
            View & Manage
          </Link>
        )}
        {(c.status === 'missed' || c.status === 'charity_outcome') && (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ background:'rgba(236,72,153,0.1)', color:'#be185d', border:'1px solid rgba(236,72,153,0.2)' }}>
            <Heart size={12} /> Charity: {c.charityName.split(' ').slice(0,2).join(' ')}
          </div>
        )}
        {c.status === 'claimed' && (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
            style={{ background:'rgba(245,158,11,0.1)', color:'#b45309', border:'1px solid rgba(245,158,11,0.2)' }}>
            <Trophy size={12} /> Claimed ₹{c.amount.toLocaleString('en-IN')} ✓
          </div>
        )}
        <Link to={`/commitments/${c._id}`}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
          style={{ background:'rgba(139,92,246,0.08)', color:'#6d28d9', border:'1px solid rgba(139,92,246,0.15)' }}>
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
