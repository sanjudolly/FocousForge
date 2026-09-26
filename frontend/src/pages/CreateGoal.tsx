import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { CheckCircle2, ChevronRight, ChevronLeft, Zap, Lock, Github, Camera, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { goalsAPI } from '../services/api';
import GoalCrystal from '../components/3d/GoalCrystal';

const schema = z.object({
  title:            z.string().min(3, 'At least 3 characters').max(100),
  description:      z.string().min(10, 'At least 10 characters').max(500),
  category:         z.enum(['coding','study','fitness','career','personal','other']),
  deadline:         z.string().min(1, 'Deadline required'),
  verificationType: z.enum(['github','photo','manual']),
  commitmentAmount: z.number().min(0),
  reminderDays:     z.array(z.number()).optional(),
  githubUsername:   z.string().optional(),
  githubRepo:       z.string().optional(),
  githubBranch:     z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  { id:'coding',   label:'Coding',   emoji:'💻', grad:'from-cyan-400 to-blue-500'     },
  { id:'study',    label:'Study',    emoji:'📚', grad:'from-amber-400 to-yellow-500'  },
  { id:'fitness',  label:'Fitness',  emoji:'💪', grad:'from-emerald-400 to-teal-500'  },
  { id:'career',   label:'Career',   emoji:'🚀', grad:'from-violet-400 to-purple-500' },
  { id:'personal', label:'Personal', emoji:'✨', grad:'from-pink-400 to-rose-500'     },
  { id:'other',    label:'Other',    emoji:'🎯', grad:'from-slate-400 to-slate-600'   },
];

const VERIFY_METHODS = [
  { id:'github', label:'GitHub Commits',     desc:'Auto-verified via commits',    icon:Github,  grad:'from-slate-500 to-slate-700'  },
  { id:'photo',  label:'Photo Proof',        desc:'Upload evidence of your work', icon:Camera,  grad:'from-violet-500 to-purple-700' },
  { id:'manual', label:'Manual Description', desc:'Write what you accomplished',  icon:PenLine, grad:'from-emerald-500 to-teal-700'  },
];

const AMOUNTS = [0, 5, 10, 25, 50, 100];
const STEPS   = ['Define', 'Deadline', 'Verify', 'Commit', 'Forge'];

export default function CreateGoal() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [forged, setForged]   = useState(false);
  const navigate              = useNavigate();

  const {
    register, handleSubmit, watch, setValue, getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commitmentAmount: 0,
      category:         'coding',
      verificationType: 'github',
      githubBranch:     'main',
      reminderDays:     [],
    },
  });

  const vType      = watch('verificationType');
  const selCat     = watch('category');
  const selAmt     = watch('commitmentAmount');
  const selDays    = watch('reminderDays') ?? [];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const toggleReminder = (d: number) => {
    setValue(
      'reminderDays',
      selDays.includes(d) ? selDays.filter(x => x !== d) : [...selDays, d]
    );
  };

  const canProceed = () => {
    const v = getValues();
    if (step === 0) return (v.title?.length ?? 0) >= 3 && (v.description?.length ?? 0) >= 10 && v.category;
    if (step === 1) return !!v.deadline;
    if (step === 2) return !!v.verificationType;
    return true;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await goalsAPI.createGoal({
        ...data,
        deadline: new Date(data.deadline).toISOString(),
        reminderDays: data.reminderDays ?? [],
      });
      setForged(true);
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to create goal'
      );
    } finally { setLoading(false); }
  };

  /* ── Success screen ── */
  if (forged) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>
        <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} className="text-center max-w-md w-full">
          <div style={{ height: 280 }}>
            <Canvas camera={{ position:[0,0,5], fov:60 }} gl={{ alpha:true }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.7} />
                <pointLight position={[3,3,3]} intensity={3} color="#8b5cf6" />
                <Sparkles count={80} scale={8} size={3} speed={1} color="#ec4899" opacity={0.8} />
                <GoalCrystal color="#8b5cf6" scale={1.2} />
              </Suspense>
            </Canvas>
          </div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-black text-indigo-900 mb-2">Goal Created!</h2>
            <p className="text-violet-600 font-semibold mb-1">"{watch('title')}"</p>
            <p className="text-indigo-400 text-sm mb-8">Now prove it. Submit proof when done.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate('/dashboard')} className="ff-btn"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                <Zap size={16} fill="currentColor" /> Go to Dashboard
              </button>
              <button onClick={() => navigate('/goals')} className="ff-btn ff-btn-outline">
                View All Goals
              </button>
              <button onClick={() => { setForged(false); setStep(0); }} className="ff-btn ff-btn-outline">
                Create Another
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-80 h-72 rounded-full blur-3xl opacity-35 animate-float" style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-30 animate-float-slow" style={{ background:'rgba(236,72,153,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all ${
                i < step  ? 'text-white shadow-md' :
                i === step ? 'bg-white text-indigo-900 border-2 border-violet-400 shadow' :
                'text-indigo-300'
              }`} style={i < step ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)' } : i === step ? {} : { background:'rgba(255,255,255,0.5)' }}>
                {i < step ? <CheckCircle2 size={15}/> : i + 1}
              </div>
              <span className={`hidden sm:block ml-2 text-xs font-semibold ${i === step ? 'text-indigo-800' : 'text-indigo-300'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className="w-6 sm:w-10 h-0.5 mx-2 rounded transition-all"
                  style={i < step ? { background:'linear-gradient(90deg,#8b5cf6,#ec4899)' } : { background:'rgba(139,92,246,0.15)' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            transition={{ duration:0.22 }} className="ff-card p-6 sm:p-8">

            {/* ── STEP 0 — Define ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900">Define Your Goal ✍️</h2>
                  <p className="text-indigo-400 text-sm mt-1">Be specific. Vague goals get vague results.</p>
                </div>
                <div>
                  <label className="ff-form-label">Goal Title *</label>
                  <input {...register('title')} placeholder="e.g. Complete 50 LeetCode problems" className="ff-input" />
                  {errors.title && <p className="ff-form-error">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="ff-form-label">Description *</label>
                  <textarea {...register('description')} rows={3}
                    placeholder="What exactly will you accomplish? How will you measure success?"
                    className="ff-input resize-none" />
                  {errors.description && <p className="ff-form-error">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} type="button"
                        onClick={() => setValue('category', cat.id as FormData['category'])}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={selCat === cat.id
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }
                          : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br ${cat.grad}`}>
                          {cat.emoji}
                        </div>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1 — Deadline ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900">Set Your Deadline ⏰</h2>
                  <p className="text-indigo-400 text-sm mt-1">A deadline without a date is just a wish.</p>
                </div>
                <div>
                  <label className="ff-form-label">Deadline Date *</label>
                  <input {...register('deadline')} type="date" min={minDateStr}
                    className="ff-input [color-scheme:light]" />
                  {errors.deadline && <p className="ff-form-error">{errors.deadline.message}</p>}
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Reminders (click to select)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 3, 7].map(d => (
                      <button key={d} type="button" onClick={() => toggleReminder(d)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={selDays.includes(d)
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 2px 8px rgba(139,92,246,0.3)' }
                          : { background:'rgba(139,92,246,0.08)', color:'#6d28d9', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                        {selDays.includes(d) ? '✓ ' : ''}{d}d before
                      </button>
                    ))}
                  </div>
                  {selDays.length > 0 && (
                    <p className="text-violet-500 text-xs mt-2">Reminders set for: {selDays.sort((a,b)=>a-b).join(', ')} day(s) before deadline</p>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2 — Verify ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900">Choose Verification 🔍</h2>
                  <p className="text-indigo-400 text-sm mt-1">How will you prove you did the work?</p>
                </div>
                <div className="space-y-3">
                  {VERIFY_METHODS.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => setValue('verificationType', m.id as FormData['verificationType'])}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                      style={vType === m.id
                        ? { borderColor:'rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.07)' }
                        : { borderColor:'rgba(139,92,246,0.1)', background:'rgba(255,255,255,0.7)' }}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${m.grad}`}>
                        <m.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${vType === m.id ? 'text-violet-700' : 'text-indigo-700'}`}>{m.label}</p>
                        <p className="text-indigo-400 text-xs mt-0.5">{m.desc}</p>
                      </div>
                      {vType === m.id && <CheckCircle2 className="w-5 h-5 text-violet-500" />}
                    </button>
                  ))}
                </div>
                {vType === 'github' && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="space-y-3 pt-1">
                    <input {...register('githubUsername')} placeholder="GitHub Username" className="ff-input" />
                    <input {...register('githubRepo')} placeholder="Repository Name" className="ff-input" />
                    <input {...register('githubBranch')} placeholder="Branch (default: main)" className="ff-input" />
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 3 — Commit ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900">Set Your Stake 💰</h2>
                  <div className="flex items-center gap-3 mt-3 p-3 rounded-xl"
                    style={{ background:'rgba(245,158,11,0.1)', border:'1.5px solid rgba(245,158,11,0.25)' }}>
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-amber-700 text-xs font-semibold">TEST MODE — No real money will be charged. All amounts are simulated.</p>
                  </div>
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Commitment Amount (USD)</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {AMOUNTS.map(amt => (
                      <button key={amt} type="button"
                        onClick={() => setValue('commitmentAmount', amt)}
                        className="py-3 rounded-xl text-sm font-bold transition-all"
                        style={selAmt === amt
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }
                          : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                        {amt === 0 ? 'Free' : `$${amt}`}
                      </button>
                    ))}
                  </div>
                  <input type="number" min={0} max={1000} value={selAmt}
                    onChange={e => setValue('commitmentAmount', Number(e.target.value))}
                    className="ff-input" placeholder="Or enter custom amount" />
                </div>
                <p className="text-indigo-300 text-xs">If you miss your deadline without verified proof, this amount is simulated as "forfeited". TEST MODE only.</p>
              </div>
            )}

            {/* ── STEP 4 — Review ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900">Review & Create 🏆</h2>
                  <p className="text-indigo-400 text-sm mt-1">This is your commitment. Make it count.</p>
                </div>
                <div className="space-y-2 rounded-2xl p-5"
                  style={{ background:'rgba(139,92,246,0.06)', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                  {[
                    { label:'Goal',       value: watch('title') },
                    { label:'Category',   value: watch('category') },
                    { label:'Deadline',   value: watch('deadline') ? new Date(watch('deadline')).toLocaleDateString('en-US',{ year:'numeric', month:'long', day:'numeric' }) : '-' },
                    { label:'Verify',     value: watch('verificationType') },
                    { label:'Stake',      value: watch('commitmentAmount') === 0 ? 'Free (no stake)' : `$${watch('commitmentAmount')} TEST MODE` },
                    { label:'Reminders',  value: selDays.length > 0 ? selDays.sort((a,b)=>a-b).map(d => `${d}d`).join(', ') : 'None' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm py-1.5 border-b border-violet-100 last:border-0">
                      <span className="text-indigo-400 font-medium">{item.label}</span>
                      <span className="text-indigo-900 font-bold capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-indigo-300 text-xs text-center">
                  By creating this goal, you commit to following through. Submit proof before your deadline.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))}
                className={`ff-btn ff-btn-outline ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                <ChevronLeft size={15} /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={() => canProceed() && setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="ff-btn disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
                  className="ff-btn"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 16px rgba(139,92,246,0.35)' }}>
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Zap size={15} fill="currentColor" /> Create Goal</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
