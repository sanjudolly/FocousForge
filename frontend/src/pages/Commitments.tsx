import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Heart, Trophy, Clock, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { commitmentAPI } from '../services/api';
import { Commitment, CommitmentDashboard } from '../types';
import CommitmentCard from '../components/ui/CommitmentCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { useAuthStore } from '../store/authStore';

export default function Commitments() {
  const { updateUser } = useAuthStore();
  const [dash,   setDash]   = useState<CommitmentDashboard | null>(null);
  const [all,    setAll]    = useState<Commitment[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dr, ar] = await Promise.all([
        commitmentAPI.getDashboard(),
        commitmentAPI.getCommitments(),
      ]);
      setDash(dr.data);
      setAll(ar.data.commitments);
    } catch { toast.error('Could not load commitments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleTaskComplete = async (cid: string, tid: string) => {
    const r = await commitmentAPI.completeTask(cid, tid);
    setAll(prev => prev.map(c => c._id === cid ? r.data.commitment : c));
  };

  const handleClaim = async (id: string) => {
    try {
      const r = await commitmentAPI.claim(id);
      toast.success(`🎉 Claimed ₹${r.data.commitment.amount.toLocaleString('en-IN')}! +${r.data.xpEarned} XP`);
      if (r.data.user) updateUser(r.data.user);
      load();
    } catch (e: unknown) {
      toast.error((e as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Claim failed');
    }
  };

  const filters = ['all','active','eligible_claim','claimed','missed','charity_outcome'];
  const filtered = filter === 'all' ? all : all.filter(c => c.status === filter);

  const FILTER_LABEL: Record<string,string> = {
    all:'All', active:'Active', eligible_claim:'Eligible', claimed:'Claimed', missed:'Missed', charity_outcome:'Charity'
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#ecfdf5 0%,#e0f2fe 40%,#f5f3ff 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float" style={{ background:'rgba(16,185,129,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float-slow" style={{ background:'rgba(139,92,246,0.18)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900">My Commitments 💰</h1>
            <p className="text-indigo-400 text-sm mt-1">Commit pocket money to your study goals</p>
          </div>
          <div className="flex gap-3">
            <Link to="/commitments/history" className="ff-btn ff-btn-outline text-sm py-2 px-4">
              <History size={14}/> History
            </Link>
            <Link to="/commitments/new" className="ff-btn text-sm"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 14px rgba(139,92,246,0.3)' }}>
              <Plus size={15}/> New Commitment
            </Link>
          </div>
        </div>

        {/* ── Charity Impact stats ── */}
        {dash && (
          <div>
            <h2 className="font-bold text-indigo-800 mb-3 text-sm uppercase tracking-wide">Charity Impact Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label:'Money Committed',    val: dash.summary.moneyCommitted,  icon:IndianRupee, grad:'from-violet-400 to-purple-500',  prefix:'₹' },
                { label:'Money Claimed',      val: dash.summary.moneyClaimed,    icon:Trophy,      grad:'from-emerald-400 to-teal-500',    prefix:'₹' },
                { label:'Charity Impact',     val: dash.summary.charityImpact,   icon:Heart,       grad:'from-pink-400 to-rose-500',       prefix:'₹' },
                { label:'Completed',          val: dash.summary.claimed,         icon:Trophy,      grad:'from-amber-400 to-yellow-500',    prefix:''  },
                { label:'Active',             val: dash.summary.active + dash.summary.eligibleToClaim, icon:Clock, grad:'from-blue-400 to-indigo-500', prefix:'' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                  className="ff-card p-4 text-center hover:scale-[1.02] transition-transform">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-black text-lg text-indigo-900">
                    {s.prefix}<AnimatedCounter value={s.val} />
                  </div>
                  <p className="text-indigo-400 text-xs">{s.label}</p>
                  {s.label === 'Money Committed' || s.label === 'Money Claimed' || s.label === 'Charity Impact'
                    ? <p className="text-indigo-200 text-[10px]">TEST MODE</p> : null}
                </motion.div>
              ))}
            </div>
            {/* Eligible to claim highlight */}
            {dash.summary.eligibleToClaim > 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="mt-3 p-4 rounded-2xl flex items-center gap-3"
                style={{ background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.3)' }}>
                <div className="text-2xl animate-bounce-gentle">🎉</div>
                <div>
                  <p className="text-emerald-800 font-black">You have {dash.summary.eligibleToClaim} commitment{dash.summary.eligibleToClaim>1?'s':''} eligible to claim!</p>
                  <p className="text-emerald-600 text-sm">All tasks completed + proof verified. Go claim your money!</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all"
              style={filter === f
                ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }
                : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
              {FILTER_LABEL[f]} {f === 'all' ? `(${all.length})` : f !== 'all' ? `(${all.filter(c=>c.status===f).length})` : ''}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_,i) => (
              <div key={i} className="h-64 rounded-2xl shimmer" style={{ background:'rgba(255,255,255,0.7)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="ff-card text-center py-20">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="font-bold text-xl text-indigo-900 mb-2">No commitments {filter !== 'all' ? `with status "${FILTER_LABEL[filter]}"` : 'yet'}</h3>
            <p className="text-indigo-400 text-sm mb-6">Commit your pocket money to your study goals and stay accountable.</p>
            <Link to="/commitments/new" className="ff-btn inline-flex"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
              <Plus size={15}/> Create First Commitment
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <CommitmentCard commitment={c} onTaskComplete={handleTaskComplete} onClaim={handleClaim} />
              </motion.div>
            ))}
          </div>
        )}

        {/* How it works mini */}
        <div className="ff-card p-6">
          <h3 className="font-bold text-indigo-900 mb-4 text-sm uppercase tracking-wide">How pocket money commitments work</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { emoji:'🎯', title:'Choose a goal', desc:'Pick your study or personal goal' },
              { emoji:'💰', title:'Commit money', desc:'Select an amount from your pocket money' },
              { emoji:'✅', title:'Complete & prove', desc:'Finish tasks and submit your proof' },
              { emoji:'🏆', title:'Claim or donate', desc:'Claim back your money or it goes to charity (TEST MODE)' },
            ].map(s => (
              <div key={s.title} className="text-center p-3 rounded-xl" style={{ background:'rgba(139,92,246,0.05)' }}>
                <div className="text-2xl mb-2">{s.emoji}</div>
                <p className="font-bold text-indigo-900 text-xs mb-1">{s.title}</p>
                <p className="text-indigo-400 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
