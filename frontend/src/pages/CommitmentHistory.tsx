import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, IndianRupee, Heart, CheckCircle2, XCircle, Clock, Trophy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { commitmentAPI } from '../services/api';
import { Commitment } from '../types';

const STATUS_CFG = {
  active:          { label:'Active',             icon:Clock,        color:'#4338ca',  bg:'rgba(99,102,241,0.1)'   },
  eligible_claim:  { label:'Eligible to Claim',  icon:Trophy,       color:'#047857',  bg:'rgba(16,185,129,0.12)'  },
  claimed:         { label:'Completed & Claimed', icon:CheckCircle2, color:'#b45309',  bg:'rgba(245,158,11,0.12)'  },
  missed:          { label:'Missed',             icon:XCircle,      color:'#b91c1c',  bg:'rgba(239,68,68,0.1)'    },
  charity_outcome: { label:'Charity Outcome',    icon:Heart,        color:'#be185d',  bg:'rgba(236,72,153,0.1)'   },
};

export default function CommitmentHistory() {
  const [all,    setAll]    = useState<Commitment[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commitmentAPI.getCommitments()
      .then(r => setAll(r.data.commitments))
      .catch(() => toast.error('Could not load history'))
      .finally(() => setLoading(false));
  }, []);

  const filters = ['all','claimed','missed','charity_outcome','active','eligible_claim'];
  const filtered = filter === 'all' ? all : all.filter(c => c.status === filter);

  const totals = {
    committed: all.reduce((s,c) => s + c.amount, 0),
    claimed:   all.filter(c=>c.status==='claimed').reduce((s,c) => s + c.amount, 0),
    charity:   all.filter(c=>c.status==='missed'||c.status==='charity_outcome').reduce((s,c) => s + c.amount, 0),
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#fffbeb 0%,#fef3c7 30%,#f5f3ff 70%,#ede9fe 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float" style={{ background:'rgba(245,158,11,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float-slow" style={{ background:'rgba(236,72,153,0.15)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/commitments" className="text-indigo-400 hover:text-indigo-700 transition-colors"><ArrowLeft size={18}/></Link>
          <div>
            <h1 className="text-3xl font-black text-indigo-900">Commitment History 📖</h1>
            <p className="text-indigo-400 text-sm mt-1">All your past and current commitments</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Total Committed', val:`₹${totals.committed.toLocaleString('en-IN')}`, grad:'from-violet-400 to-purple-500', note:'TEST MODE' },
            { label:'Total Claimed',   val:`₹${totals.claimed.toLocaleString('en-IN')}`,   grad:'from-emerald-400 to-teal-500',  note:'Simulated' },
            { label:'Charity Impact',  val:`₹${totals.charity.toLocaleString('en-IN')}`,   grad:'from-pink-400 to-rose-500',     note:'TEST MODE' },
          ].map(s => (
            <div key={s.label} className="ff-card p-4 text-center">
              <div className="font-black text-xl ff-text-gradient-royal">{s.val}</div>
              <p className="text-indigo-500 text-xs mt-1">{s.label}</p>
              <p className="text-indigo-200 text-[10px]">{s.note}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all capitalize"
              style={filter === f
                ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }
                : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
              {f === 'eligible_claim' ? 'Eligible' : f === 'charity_outcome' ? 'Charity' : f.charAt(0).toUpperCase()+f.slice(1)} ({f==='all' ? all.length : all.filter(c=>c.status===f).length})
            </button>
          ))}
        </div>

        {/* History list */}
        {loading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="h-20 rounded-2xl shimmer" style={{background:'rgba(255,255,255,0.7)'}} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="ff-card text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-indigo-400">No commitments found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const s   = STATUS_CFG[c.status] ?? STATUS_CFG.active;
              const Icon = s.icon;
              const done  = c.tasks.filter(t=>t.completed).length;
              return (
                <motion.div key={c._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                  <Link to={`/commitments/${c._id}`}
                    className="ff-card p-4 flex items-center gap-4 hover:scale-[1.005] transition-transform block">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: s.bg }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-bold text-indigo-900 text-sm line-clamp-1">{c.title}</p>
                          <p className="text-indigo-400 text-xs capitalize mt-0.5">{c.category} · {done}/{c.tasks.length} tasks</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                          style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <IndianRupee size={11}/>{c.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-indigo-300">
                          {new Date(c.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                        <span className="text-indigo-300">{c.charityName.split(' ').slice(0,2).join(' ')}</span>
                        {c.claimedAt && <span className="text-emerald-500">Claimed {new Date(c.claimedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                        {c.status === 'charity_outcome' && <span className="text-pink-500 flex items-center gap-1"><Heart size={10}/> Charity (TEST)</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
