import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { goalsAPI } from '../services/api';
import { Goal } from '../types';
import GoalCard from '../components/ui/GoalCard';
import { SkeletonCard } from '../components/ui/LoadingSkeleton';

const CATEGORIES = ['all','coding','study','fitness','career','personal','other'];
const STATUSES   = ['all','active','completed','failed'];
const CAT_EMOJI: Record<string,string> = { all:'🌟', coding:'💻', study:'📚', fitness:'💪', career:'🚀', personal:'✨', other:'🎯' };

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (category !== 'all') params.category = category;
      if (status   !== 'all') params.status   = status;
      const res = await goalsAPI.getGoals(params);
      setGoals(res.data.goals);
    } catch { toast.error('Could not load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, status]);

  const handleComplete = async (id: string) => {
    try {
      await goalsAPI.completeGoal(id);
      toast.success('🏆 Commitment Forged!');
      load();
    } catch { toast.error('Could not complete goal'); }
  };

  const filtered = goals.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#fce7f3 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-80 rounded-full blur-3xl opacity-40 animate-float"
          style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-35 animate-float-slow"
          style={{ background:'rgba(236,72,153,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900">My Commitments 🎯</h1>
            <p className="text-indigo-400 text-sm mt-1">{goals.length} total commitments</p>
          </div>
          <Link to="/goals/new" className="ff-btn self-start"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 14px rgba(139,92,246,0.35)' }}>
            <Plus className="w-4 h-4" /> New Commitment
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={category === cat
                ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }
                : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
              {CAT_EMOJI[cat]} {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search commitments..."
              className="ff-input pl-10" />
          </div>
          <div className="flex gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={status === s
                  ? { background:'rgba(139,92,246,0.15)', color:'#6d28d9', border:'1.5px solid rgba(139,92,246,0.35)' }
                  : { background:'rgba(255,255,255,0.7)', color:'#7c3aed', border:'1.5px solid rgba(139,92,246,0.12)' }}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="text-center py-20 ff-card">
            <div className="text-6xl mb-4">{search ? '🔍' : '🎯'}</div>
            <h3 className="text-indigo-900 font-bold text-xl mb-2">
              {search ? 'No commitments match.' : 'Your focus journey starts here.'}
            </h3>
            <p className="text-indigo-400 text-sm mb-6">
              {search ? 'Try different keywords.' : 'Create your first commitment and start forging your future.'}
            </p>
            {!search && (
              <Link to="/goals/new" className="ff-btn inline-flex"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                <Plus className="w-4 h-4" /> Create Your First Goal
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((goal, i) => (
              <motion.div key={goal._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <GoalCard goal={goal} onComplete={handleComplete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
