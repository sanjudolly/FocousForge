import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Trophy, Flame, CheckCircle, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../services/api';
import ProgressRing from '../components/ui/ProgressRing';
import AnimatedCounter from '../components/ui/AnimatedCounter';

interface AnalyticsData {
  weeklyData: { day:string; date:string; completed:number; proofs:number }[];
  stats: { totalGoals:number; completedGoals:number; failedGoals:number; activeGoals:number; successRate:number; streak:number; longestStreak:number; focusScore:number; totalXp:number; level:number; totalCommitmentValue:number };
  categoryBreakdown: Record<string,number>;
  completionTimes: { title:string; days:number; category:string }[];
  achievements: { badgeId:string; name:string; icon:string; rarity:string; xpReward:number }[];
  journeyTimeline: { type:string; title:string; date:string; category?:string; xp?:number; icon?:string }[];
}

const CAT_COLORS: Record<string,string> = {
  coding:'#6366f1', study:'#f59e0b', fitness:'#10b981',
  career:'#8b5cf6', personal:'#ec4899', other:'#94a3b8',
};
const GRAD_COLORS = ['#8b5cf6','#ec4899','#f97316','#10b981','#0ea5e9','#f59e0b'];

const TT_STYLE = {
  backgroundColor:'rgba(255,255,255,0.95)', border:'1.5px solid rgba(139,92,246,0.2)',
  borderRadius:12, color:'#1e1b4b', fontSize:12, boxShadow:'0 4px 16px rgba(139,92,246,0.15)',
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAnalytics()
      .then(res => setData(res.data.analytics))
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#ecfdf5 0%,#e0f2fe 50%,#f5f3ff 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-emerald-600 text-sm font-semibold">Loading analytics...</p>
      </div>
    </div>
  );

  const s = data?.stats;
  const catData = Object.entries(data?.categoryBreakdown ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#ecfdf5 0%,#e0f2fe 40%,#f5f3ff 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-80 rounded-full blur-3xl opacity-35 animate-float"
          style={{ background:'rgba(16,185,129,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float-slow"
          style={{ background:'rgba(14,165,233,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-indigo-900">Focus Analytics 📊</h1>
          <p className="text-indigo-400 text-sm mt-1">Your productivity at a glance</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label:'Focus Score',  val: s?.focusScore ?? 0,  icon:TrendingUp, grad:'from-violet-400 to-purple-500', suffix:'' },
            { label:'Success Rate', val: s?.successRate ?? 0, icon:Target,     grad:'from-emerald-400 to-teal-500',  suffix:'%' },
            { label:'Total Goals',  val: s?.totalGoals ?? 0,  icon:Target,     grad:'from-blue-400 to-indigo-500',   suffix:'' },
            { label:'Completed',    val: s?.completedGoals ?? 0, icon:CheckCircle, grad:'from-emerald-400 to-green-500', suffix:'' },
            { label:'Streak',       val: s?.streak ?? 0,      icon:Flame,      grad:'from-orange-400 to-red-500',    suffix:'d' },
            { label:'Level',        val: s?.level ?? 1,       icon:Zap,        grad:'from-amber-400 to-yellow-500',  suffix:'' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="ff-card p-4 text-center hover:scale-[1.03] transition-transform">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${k.grad} flex items-center justify-center mx-auto mb-2`}>
                <k.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-black text-indigo-900">
                <AnimatedCounter value={k.val} suffix={k.suffix} />
              </div>
              <div className="text-indigo-400 text-xs mt-1">{k.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Focus Score + Weekly Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ring */}
          <div className="analytics-section flex flex-col items-center">
            <p className="text-indigo-600 text-sm font-bold mb-4">Focus Score</p>
            <ProgressRing value={s?.focusScore ?? 0} size={140} strokeWidth={10} color="#8b5cf6"
              label={`${s?.focusScore ?? 0}`} sublabel="/ 100" />
            <div className="mt-5 space-y-2 w-full">
              {[
                { label:'Longest Streak', val:`${s?.longestStreak ?? 0} days` },
                { label:'Total XP',       val:(s?.totalXp ?? 0).toLocaleString() },
                { label:'Commitment $',   val:`$${(s?.totalCommitmentValue ?? 0).toFixed(2)}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-xs py-1 border-b border-indigo-50">
                  <span className="text-indigo-400">{row.label}</span>
                  <span className="text-indigo-800 font-bold">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly bar chart */}
          <div className="analytics-section lg:col-span-2">
            <h3 className="text-indigo-800 font-bold mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.weeklyData} margin={{ top:5, right:5, left:-25, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                <XAxis dataKey="day" tick={{ fill:'#a78bfa', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#a78bfa', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="completed" fill="#8b5cf6" name="Goals" radius={[6,6,0,0]} />
                <Bar dataKey="proofs"    fill="#ec4899" name="Proofs" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown + Journey */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="analytics-section">
            <h3 className="text-indigo-800 font-bold mb-4">Goal Categories</h3>
            {catData.length > 0 ? (
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={4}>
                      {catData.map((entry, i) => (
                        <Cell key={i} fill={CAT_COLORS[entry.name] ?? GRAD_COLORS[i % GRAD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TT_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {catData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: CAT_COLORS[item.name] ?? GRAD_COLORS[i % GRAD_COLORS.length] }} />
                      <span className="text-indigo-600 text-xs capitalize flex-1">{item.name}</span>
                      <span className="text-indigo-900 text-xs font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-indigo-300">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>

          {/* Journey timeline */}
          <div className="analytics-section">
            <h3 className="text-indigo-800 font-bold mb-4">Journey Timeline</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(data?.journeyTimeline ?? []).length === 0 ? (
                <div className="text-center py-8 text-indigo-300">
                  <div className="text-3xl mb-2">🗺️</div>
                  <p className="text-sm">Your journey starts now</p>
                </div>
              ) : data!.journeyTimeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-indigo-50 last:border-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.15))' }}>
                    {item.icon ?? (item.type === 'goal' ? '🎯' : '🏅')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-indigo-800 text-xs font-semibold line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.xp && <span className="text-violet-500 text-[10px] font-bold">+{item.xp} XP</span>}
                      <span className="text-indigo-300 text-[10px]">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label:'Goals Created',  val: s?.totalGoals ?? 0,  icon:'🎯', grad:'from-blue-400 to-indigo-500'   },
            { label:'Goals Completed',val: s?.completedGoals ?? 0, icon:'✅', grad:'from-emerald-400 to-teal-500'  },
            { label:'Goals Failed',   val: s?.failedGoals ?? 0, icon:'❌', grad:'from-red-400 to-rose-500'     },
          ].map((item) => (
            <div key={item.label} className="ff-card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-2xl shadow-md`}>
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-900">{item.val}</p>
                <p className="text-indigo-400 text-xs">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
