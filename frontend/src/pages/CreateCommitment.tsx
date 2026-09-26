import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2,
  IndianRupee, Heart, Camera, FileText, Github, PenLine, Lock, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { commitmentAPI } from '../services/api';
import { Charity } from '../types';
import CommitmentVault from '../components/3d/CommitmentVault';

const STEPS = ['Goal', 'Tasks', 'Charity', 'Amount', 'Review'];

const CATEGORIES = [
  { id:'study',    label:'Study',    emoji:'📚', grad:'from-amber-400 to-yellow-500'   },
  { id:'coding',   label:'Coding',   emoji:'💻', grad:'from-cyan-400 to-blue-500'      },
  { id:'fitness',  label:'Fitness',  emoji:'💪', grad:'from-emerald-400 to-teal-500'   },
  { id:'career',   label:'Career',   emoji:'🚀', grad:'from-violet-400 to-purple-500'  },
  { id:'personal', label:'Personal', emoji:'✨', grad:'from-pink-400 to-rose-500'      },
  { id:'other',    label:'Other',    emoji:'🎯', grad:'from-slate-400 to-slate-600'    },
];

const VERIFY_METHODS = [
  { id:'photo',    label:'Photo Proof',    desc:'Upload a photo as proof',    icon:Camera   },
  { id:'document', label:'Document Proof', desc:'Upload a document or file',  icon:FileText },
  { id:'github',   label:'GitHub Commits', desc:'Auto-verify via GitHub',     icon:Github   },
  { id:'manual',   label:'Written Proof',  desc:'Write what you accomplished',icon:PenLine  },
];

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const GOAL_SUGGESTIONS = [
  'Complete my exam preparation',
  'Finish 30 LeetCode problems',
  'Study 3 chapters this week',
  'Complete my assignment on time',
  'Finish my project module',
  'Read 50 pages daily',
  'Practice coding for 1 hour daily',
  'Complete online course module',
];

export default function CreateCommitment() {
  const navigate  = useNavigate();
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [created, setCreated]   = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);

  // Form state
  const [title,        setTitle]       = useState('');
  const [description,  setDesc]        = useState('');
  const [category,     setCategory]    = useState('study');
  const [deadline,     setDeadline]    = useState('');
  const [verifyType,   setVerifyType]  = useState('photo');
  const [tasks,        setTasks]       = useState(['']);
  const [charityId,    setCharityId]   = useState('');
  const [charityName,  setCharityName] = useState('');
  const [amount,       setAmount]      = useState(500);
  const [customAmt,    setCustomAmt]   = useState('');

  const minDate = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

  useEffect(() => {
    commitmentAPI.getCharities().then(r => setCharities(r.data.charities)).catch(() => {});
  }, []);

  const addTask = () => setTasks(t => [...t, '']);
  const removeTask = (i: number) => setTasks(t => t.filter((_, idx) => idx !== i));
  const updateTask = (i: number, v: string) => setTasks(t => t.map((x, idx) => idx === i ? v : x));

  const validTasks = tasks.filter(t => t.trim().length > 0);

  const canNext = () => {
    if (step === 0) return title.length >= 3 && description.length >= 10 && deadline && category && verifyType;
    if (step === 1) return validTasks.length >= 1;
    if (step === 2) return charityId !== '';
    if (step === 3) return amount >= 1;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      await commitmentAPI.createCommitment({
        title,
        description,
        category,
        deadline: new Date(deadline).toISOString(),
        amount,
        tasks: validTasks.map(t => ({ title: t })),
        verificationType: verifyType,
        charityId,
        charityName,
      });
      setCreated(true);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create commitment');
    } finally { setLoading(false); }
  };

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#ecfdf5 100%)' }}>
        <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} className="text-center max-w-sm w-full">
          <CommitmentVault state="unlocked" amount={amount} progress={0} height={200} />
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-2xl font-black text-indigo-900 mb-2">Commitment Created!</h2>
            <p className="text-violet-600 font-semibold mb-1">"{title}"</p>
            <p className="text-indigo-400 text-sm mb-2">₹{amount.toLocaleString('en-IN')} committed · {validTasks.length} tasks</p>
            <p className="text-indigo-300 text-xs mb-6">If missed → TEST MODE charity to {charityName}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/commitments')} className="ff-btn"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                <Zap size={15} /> View Commitments
              </button>
              <button onClick={() => { setCreated(false); setStep(0); setTitle(''); setDesc(''); setTasks(['']); setAmount(500); }}
                className="ff-btn ff-btn-outline">New Commitment</button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float" style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float-slow" style={{ background:'rgba(16,185,129,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-indigo-900">Create Commitment 💰</h1>
          <p className="text-indigo-400 text-sm mt-1">Commit your pocket money to your study goal</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'text-white shadow-md' : i === step ? 'bg-white text-indigo-900 border-2 border-violet-400' : 'text-indigo-300'
                }`} style={i < step ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)' } : i === step ? {} : { background:'rgba(255,255,255,0.5)' }}>
                  {i < step ? <CheckCircle2 size={14}/> : i+1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${i === step ? 'text-indigo-800' : 'text-indigo-300'}`}>{s}</span>
              </div>
              {i < STEPS.length-1 && <div className="w-6 sm:w-10 h-0.5 mx-1 mb-4 rounded" style={i < step ? { background:'linear-gradient(90deg,#8b5cf6,#ec4899)' } : { background:'rgba(139,92,246,0.15)' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            transition={{ duration:0.2 }} className="ff-card p-6 sm:p-8">

            {/* ── STEP 0: Goal ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-indigo-900">Define Your Goal ✍️</h2>
                  <p className="text-indigo-400 text-sm mt-1">What will you accomplish? Be specific.</p>
                </div>
                {/* Suggestions */}
                <div>
                  <label className="ff-form-label mb-2 block">Quick suggestions</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_SUGGESTIONS.slice(0,4).map(s => (
                      <button key={s} type="button" onClick={() => setTitle(s)}
                        className="text-xs px-3 py-1.5 rounded-xl transition-all"
                        style={{ background:'rgba(139,92,246,0.08)', color:'#6d28d9', border:'1px solid rgba(139,92,246,0.15)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="ff-form-label">Goal Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} maxLength={150}
                    placeholder="e.g. Complete exam preparation" className="ff-input" />
                </div>
                <div>
                  <label className="ff-form-label">Description *</label>
                  <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3} maxLength={600}
                    placeholder="What exactly will you accomplish? How will you measure success?"
                    className="ff-input resize-none" />
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={category === c.id
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }
                          : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                        <span className="text-base">{c.emoji}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="ff-form-label">Deadline *</label>
                  <input type="date" min={minDate} value={deadline} onChange={e => setDeadline(e.target.value)}
                    className="ff-input [color-scheme:light]" />
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Proof Method *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {VERIFY_METHODS.map(m => (
                      <button key={m.id} type="button" onClick={() => setVerifyType(m.id)}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all text-left border-2"
                        style={verifyType === m.id
                          ? { borderColor:'rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.08)' }
                          : { borderColor:'rgba(139,92,246,0.1)', background:'rgba(255,255,255,0.7)' }}>
                        <m.icon size={16} className={verifyType === m.id ? 'text-violet-600' : 'text-indigo-300'} />
                        <div>
                          <p className={`text-xs font-bold ${verifyType === m.id ? 'text-violet-700' : 'text-indigo-600'}`}>{m.label}</p>
                          <p className="text-indigo-300 text-[10px]">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Tasks ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-indigo-900">Add Tasks / Milestones 📋</h2>
                  <p className="text-indigo-400 text-sm mt-1">Break your goal into specific, trackable tasks. At least one required.</p>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-400"
                        style={{ background:'rgba(139,92,246,0.1)' }}>{i+1}</div>
                      <input value={task} onChange={e => updateTask(i, e.target.value)} maxLength={200}
                        placeholder={`Task ${i+1} — e.g. Study Chapter 3`} className="ff-input flex-1" />
                      {tasks.length > 1 && (
                        <button type="button" onClick={() => removeTask(i)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addTask} disabled={tasks.length >= 20}
                  className="ff-btn ff-btn-outline w-full justify-center text-sm disabled:opacity-40">
                  <Plus size={15} /> Add Task
                </button>
                <p className="text-indigo-300 text-xs">⚠️ Completing tasks alone does NOT make you eligible to claim. You must also submit verified proof.</p>
              </div>
            )}

            {/* ── STEP 2: Charity ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-indigo-900">Choose Charity 💝</h2>
                  <p className="text-indigo-400 text-sm mt-1">If you miss your commitment, the amount goes here in TEST MODE.</p>
                  <div className="mt-2 p-3 rounded-xl" style={{ background:'rgba(245,158,11,0.1)', border:'1.5px solid rgba(245,158,11,0.25)' }}>
                    <p className="text-amber-700 text-xs font-bold flex items-center gap-2"><Lock size={12}/> TEST MODE — No real donation happens. This is a simulation for accountability.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {charities.map(ch => (
                    <button key={ch.id} type="button" onClick={() => { setCharityId(ch.id); setCharityName(ch.name); }}
                      className="flex items-start gap-4 p-4 rounded-2xl transition-all text-left border-2"
                      style={charityId === ch.id
                        ? { borderColor:'rgba(236,72,153,0.4)', background:'rgba(236,72,153,0.07)' }
                        : { borderColor:'rgba(139,92,246,0.1)', background:'rgba(255,255,255,0.7)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background:`rgba(236,72,153,0.12)` }}>
                        <Heart size={18} className="text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-sm ${charityId === ch.id ? 'text-pink-700' : 'text-indigo-800'}`}>{ch.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:'rgba(139,92,246,0.1)', color:'#6d28d9' }}>{ch.category}</span>
                          {ch.id === 'demo_charity' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">TEST</span>}
                        </div>
                        <p className="text-indigo-400 text-xs mt-0.5">{ch.description}</p>
                      </div>
                      {charityId === ch.id && <CheckCircle2 size={16} className="text-pink-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Amount ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-indigo-900">Set Your Commitment 💰</h2>
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-xl" style={{ background:'rgba(245,158,11,0.1)', border:'1.5px solid rgba(245,158,11,0.25)' }}>
                    <Lock size={13} className="text-amber-500 flex-shrink-0" />
                    <p className="text-amber-700 text-xs font-semibold">TEST MODE — No real money is charged. This is simulated for accountability.</p>
                  </div>
                </div>

                {/* 3D vault preview */}
                <div className="rounded-2xl overflow-hidden" style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(236,72,153,0.05))', border:'1.5px solid rgba(139,92,246,0.1)' }}>
                  <CommitmentVault state="locked" amount={amount} progress={0} height={160} />
                  <p className="text-center text-xs text-indigo-400 pb-3">Your commitment crystal — unlocks when you complete tasks + proof</p>
                </div>

                <div>
                  <label className="ff-form-label mb-3 block">Select Amount (₹)</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {PRESET_AMOUNTS.map(a => (
                      <button key={a} type="button" onClick={() => { setAmount(a); setCustomAmt(''); }}
                        className="py-3 rounded-xl text-sm font-bold transition-all"
                        style={amount === a && !customAmt
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }
                          : { background:'rgba(255,255,255,0.7)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="ff-form-label text-xs mb-1 block">Or enter custom amount</label>
                    <div className="relative">
                      <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                      <input type="number" min={1} max={50000} value={customAmt}
                        onChange={e => { setCustomAmt(e.target.value); setAmount(Number(e.target.value)); }}
                        placeholder="Enter amount" className="ff-input pl-9" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-indigo-900">Review & Confirm 🚀</h2>
                  <p className="text-indigo-400 text-sm mt-1">This is your commitment. Make it count.</p>
                </div>
                <div className="space-y-3 rounded-2xl p-5" style={{ background:'rgba(139,92,246,0.06)', border:'1.5px solid rgba(139,92,246,0.15)' }}>
                  {[
                    { label:'Goal',        value: title },
                    { label:'Category',    value: category },
                    { label:'Deadline',    value: deadline ? new Date(deadline).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}) : '-' },
                    { label:'Tasks',       value: `${validTasks.length} task${validTasks.length !== 1 ? 's' : ''}` },
                    { label:'Proof',       value: VERIFY_METHODS.find(m=>m.id===verifyType)?.label ?? verifyType },
                    { label:'Charity',     value: charityName },
                    { label:'Amount',      value: `₹${amount.toLocaleString('en-IN')} (TEST MODE)` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm py-1 border-b border-violet-100 last:border-0">
                      <span className="text-indigo-400 font-medium">{item.label}</span>
                      <span className="text-indigo-900 font-bold capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl" style={{ background:'rgba(236,72,153,0.08)', border:'1px solid rgba(236,72,153,0.2)' }}>
                  <p className="text-pink-700 text-xs font-semibold flex items-center gap-2">
                    <Heart size={12}/> If you miss this commitment → ₹{amount.toLocaleString('en-IN')} TEST MODE charity outcome to {charityName}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-7">
              <button type="button" onClick={() => setStep(s=>Math.max(0,s-1))}
                className={`ff-btn ff-btn-outline ${step===0?'opacity-0 pointer-events-none':''}`}>
                <ChevronLeft size={15}/> Back
              </button>
              {step < STEPS.length-1 ? (
                <button type="button" onClick={() => canNext() && setStep(s=>s+1)} disabled={!canNext()}
                  className="ff-btn disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                  Continue <ChevronRight size={15}/>
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={loading}
                  className="ff-btn"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 16px rgba(139,92,246,0.35)' }}>
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <><Zap size={15} fill="currentColor"/> Create Commitment</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
