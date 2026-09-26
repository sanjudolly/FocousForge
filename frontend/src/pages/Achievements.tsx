import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { achievementsAPI } from '../services/api';
import { Achievement } from '../types';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const RARITY_GRAD: Record<string,string> = {
  common:    'from-slate-400 to-slate-500',
  rare:      'from-sky-400 to-blue-500',
  epic:      'from-violet-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};
const RARITY_LABEL: Record<string,string> = {
  common:'Common', rare:'Rare', epic:'Epic', legendary:'Legendary'
};
const RARITY_ORDER: Record<string,number> = { legendary:0, epic:1, rare:2, common:3 };

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(0);

  useEffect(() => {
    achievementsAPI.getAchievements()
      .then(res => { setAchievements(res.data.achievements); setUnlocked(res.data.unlocked); })
      .catch(() => toast.error('Could not load achievements'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked)  return 1;
    return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
  });

  const pct = achievements.length ? Math.round((unlocked / achievements.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#fffbeb 0%,#fef3c7 30%,#f5f3ff 70%,#ede9fe 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-35 animate-float"
          style={{ background:'rgba(245,158,11,0.25)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-64 rounded-full blur-3xl opacity-30 animate-float-slow"
          style={{ background:'rgba(139,92,246,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900">Achievements 🏆</h1>
            <p className="text-indigo-400 text-sm mt-1">Every badge is a milestone earned</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-indigo-900">
              <AnimatedCounter value={unlocked} /> / {achievements.length}
            </div>
            <p className="text-indigo-400 text-xs">Badges Unlocked</p>
          </div>
        </div>

        {/* Progress */}
        <div className="ff-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-indigo-700 text-sm font-bold">Badge Collection</span>
            </div>
            <span className="text-violet-500 text-sm font-bold">{pct}% complete</span>
          </div>
          <div className="ff-progress-track">
            <motion.div className="ff-progress-fill"
              style={{ background:'linear-gradient(90deg,#f59e0b,#f97316,#8b5cf6)' }}
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ duration:1.5, ease:'easeOut' }} />
          </div>
          <div className="flex gap-4 mt-4 flex-wrap">
            {Object.entries(RARITY_GRAD).map(([r, grad]) => {
              const count = sorted.filter(a => a.rarity === r && a.unlocked).length;
              return (
                <div key={r} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${grad}`} />
                  <span className="text-indigo-500 text-xs">{RARITY_LABEL[r]}: {count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sorted.map((badge, i) => (
              <motion.div key={badge.badgeId}
                initial={{ opacity:0, y:20, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
                transition={{ delay: i * 0.05 }}
                className={`achievement-card relative overflow-hidden group ${!badge.unlocked ? 'locked' : ''}`}>
                {/* Rarity top strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${RARITY_GRAD[badge.rarity]} rounded-t-[18px]`} />

                {/* Hover glow */}
                {badge.unlocked && (
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-8 bg-gradient-to-br ${RARITY_GRAD[badge.rarity]} transition-opacity rounded-[18px]`} />
                )}

                <div className="relative z-10 pt-3">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${RARITY_GRAD[badge.rarity]} shadow-lg`
                      : 'bg-indigo-50'
                  }`}>
                    {badge.unlocked ? (
                      <span>{badge.icon}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-indigo-200" />
                    )}
                  </div>

                  {/* Rarity badge */}
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={badge.unlocked
                        ? { background:'rgba(139,92,246,0.12)', color:'#6d28d9' }
                        : { background:'rgba(100,116,139,0.1)', color:'#94a3b8' }}>
                      {RARITY_LABEL[badge.rarity]}
                    </span>
                  </div>

                  <h3 className={`text-center font-bold text-sm mb-1 ${badge.unlocked ? 'text-indigo-900' : 'text-indigo-300'}`}>
                    {badge.name}
                  </h3>
                  <p className={`text-center text-xs leading-relaxed mb-3 ${badge.unlocked ? 'text-indigo-500' : 'text-indigo-200'}`}>
                    {badge.description}
                  </p>

                  {/* XP */}
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-xs font-bold ${badge.unlocked ? 'text-violet-500' : 'text-indigo-200'}`}>
                      ⚡ +{badge.xpReward} XP
                    </span>
                  </div>

                  {/* Unlocked date */}
                  {badge.unlocked && badge.unlockedAt && (
                    <p className="text-center text-indigo-300 text-[10px] mt-2">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
