import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Theme } from '../types';
import { OnboardingCompanionVisual, PageFloaters } from '../components/ui/FloatingElements';

const COMPANIONS = [
  { id:'doraemon',  name:'Doraemon',    emoji:'🤖', desc:'Future gadgets + infinite focus',         grad:'from-blue-400 to-sky-500',      bg:'rgba(14,165,233,0.1)'   },
  { id:'dora',      name:'Dora',        emoji:'🎒', desc:'Explorer spirit, never gives up',          grad:'from-pink-400 to-rose-500',     bg:'rgba(236,72,153,0.1)'   },
  { id:'shinchan',  name:'Shin Chan',   emoji:'😄', desc:'Unstoppable energy, pure chaos',           grad:'from-red-400 to-orange-500',    bg:'rgba(249,115,22,0.1)'   },
  { id:'jackie',    name:'Jackie Chan', emoji:'🥋', desc:'Martial arts discipline',                  grad:'from-yellow-400 to-amber-500',  bg:'rgba(245,158,11,0.1)'   },
  { id:'spiderman', name:'Spiderman',   emoji:'🕷️', desc:'With great power comes responsibility',   grad:'from-red-500 to-blue-600',      bg:'rgba(239,68,68,0.1)'    },
  { id:'superman',  name:'Superman',    emoji:'🦸', desc:'Man of steel, unstoppable commitment',     grad:'from-blue-500 to-red-500',      bg:'rgba(59,130,246,0.1)'   },
  { id:'fairy',     name:'Fairy',       emoji:'🧚', desc:'Magical, whimsical, full of wonder',      grad:'from-purple-400 to-pink-500',   bg:'rgba(167,139,250,0.1)'  },
  { id:'wizard',    name:'Wizard',      emoji:'🧙', desc:'Ancient wisdom and mystic knowledge',     grad:'from-indigo-500 to-purple-600', bg:'rgba(99,102,241,0.1)'   },
  { id:'phoenix',   name:'Phoenix',     emoji:'🔥', desc:'Rise from the ashes every time',          grad:'from-orange-500 to-red-600',    bg:'rgba(249,115,22,0.1)'   },
  { id:'dragon',    name:'Dragon',      emoji:'🐉', desc:'Fierce, brave, unstoppable will',         grad:'from-teal-500 to-emerald-600',  bg:'rgba(20,184,166,0.1)'   },
  { id:'unicorn',   name:'Unicorn',     emoji:'🦄', desc:'Magical belief in your potential',        grad:'from-pink-400 to-violet-500',   bg:'rgba(236,72,153,0.1)'   },
  { id:'robot',     name:'Robot',       emoji:'🤖', desc:'Logical, systematic, efficient focus',    grad:'from-cyan-500 to-blue-600',     bg:'rgba(6,182,212,0.1)'    },
];

const THEMES: { id:Theme; name:string; emoji:string; desc:string; grad:string; bg:string }[] = [
  { id:'feminine',  name:'Blossom', emoji:'🌸', desc:'Rose · Lavender · Purple',  grad:'from-pink-400 via-purple-400 to-fuchsia-500', bg:'linear-gradient(135deg,#fdf2f8,#f5f3ff,#fff7ed)' },
  { id:'masculine', name:'Apex',    emoji:'⚡', desc:'Sky · Steel · Indigo',      grad:'from-sky-400 via-blue-500 to-indigo-500',     bg:'linear-gradient(135deg,#e0f2fe,#ede9fe,#ecfdf5)' },
  { id:'neutral',   name:'Zenith',  emoji:'✨', desc:'Violet · Balanced Power',   grad:'from-violet-400 via-indigo-500 to-purple-500',bg:'linear-gradient(135deg,#f0f9ff,#f5f3ff,#fef9c3)' },
];

const INTERESTS = [
  { id:'coding',   emoji:'💻', label:'Coding'   },
  { id:'study',    emoji:'📚', label:'Study'    },
  { id:'fitness',  emoji:'💪', label:'Fitness'  },
  { id:'career',   emoji:'🚀', label:'Career'   },
  { id:'personal', emoji:'✨', label:'Personal' },
  { id:'other',    emoji:'🎯', label:'Other'    },
];

const STEPS = ['Companion', 'Theme', 'Interests', 'Ready!'];

export default function Onboarding() {
  const { updateUser } = useAuthStore();
  const navigate        = useNavigate();
  const [step,      setStep]      = useState(0);
  const [companion, setCompanion] = useState('doraemon');
  const [theme,     setTheme]     = useState<Theme>('neutral');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading,   setLoading]   = useState(false);

  const toggleInterest = (id: string) =>
    setInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const finish = async () => {
    setLoading(true);
    try {
      const res = await authAPI.onboarding({ theme, interests, avatar: { companion } });
      updateUser({ ...res.data.user, isOnboarded: true });
      toast.success('Your workspace is ready! 🎉');
      navigate('/dashboard');
    } catch { toast.error('Something went wrong'); }
    finally  { setLoading(false); }
  };

  const selCompanion = COMPANIONS.find(c => c.id === companion) ?? COMPANIONS[0];

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,#dbeafe 0%,#e0e7ff 35%,#fce7f3 65%,#fef3c7 100%)' }}>
      <PageFloaters variant="default" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
          className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-xl"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>⚡</div>
          <span className="font-black text-xl text-indigo-900">Study Forge</span>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'text-white shadow-md' : i === step ? 'bg-white text-indigo-900 border-2 border-violet-400' : 'text-indigo-300'
              }`} style={i < step ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)' } : i === step ? {} : { background:'rgba(255,255,255,0.5)' }}>
                {i < step ? <CheckCircle2 size={14}/> : i+1}
              </div>
              <span className={`hidden sm:block ml-2 text-xs font-semibold mr-3 ${i === step ? 'text-indigo-800' : 'text-indigo-300'}`}>{s}</span>
              {i < STEPS.length-1 && (
                <div className="w-6 h-0.5 mx-1" style={i < step ? { background:'linear-gradient(90deg,#8b5cf6,#ec4899)' } : { background:'rgba(139,92,246,0.2)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}>

              {/* ── STEP 0: Companion ── */}
              {step === 0 && (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">Choose your companion 🎭</h2>
                    <p className="text-indigo-400 text-sm mb-5">They'll float around your dashboard and cheer you on.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                      {COMPANIONS.map(c => (
                        <button key={c.id} onClick={() => setCompanion(c.id)}
                          className="flex flex-col items-center p-3 rounded-2xl transition-all text-center hover:scale-[1.03]"
                          style={companion === c.id
                            ? { background:'rgba(255,255,255,0.95)', border:'2px solid rgba(139,92,246,0.4)', boxShadow:'0 4px 20px rgba(139,92,246,0.2)' }
                            : { background:'rgba(255,255,255,0.65)', border:'1.5px solid rgba(139,92,246,0.1)' }}>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-2xl mb-2 shadow-md`}>
                            {c.emoji}
                          </div>
                          <p className="font-bold text-indigo-900 text-xs">{c.name}</p>
                          {companion === c.id && <CheckCircle2 size={12} className="text-violet-500 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="h-80 lg:h-96 rounded-3xl overflow-hidden ff-card">
                    <OnboardingCompanionVisual companion={companion} name={selCompanion.name} />
                  </div>
                </div>
              )}

              {/* ── STEP 1: Theme ── */}
              {step === 1 && (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">Choose your visual theme 🎨</h2>
                    <p className="text-indigo-400 text-sm">Your entire workspace transforms to match your energy.</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-5">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => setTheme(t.id)}
                        className="relative rounded-3xl overflow-hidden transition-all hover:scale-[1.04]"
                        style={theme === t.id
                          ? { border:'2.5px solid rgba(139,92,246,0.5)', boxShadow:'0 8px 32px rgba(139,92,246,0.25)' }
                          : { border:'1.5px solid rgba(139,92,246,0.12)' }}>
                        {/* Theme preview bg */}
                        <div className="h-24" style={{ background:t.bg }} />
                        <div className="p-5 text-center" style={{ background:'rgba(255,255,255,0.9)' }}>
                          {theme === t.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                              <CheckCircle2 size={13} className="text-white"/>
                            </div>
                          )}
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.grad} mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg`}>
                            {t.emoji}
                          </div>
                          <p className="font-black text-indigo-900 text-lg">{t.name}</p>
                          <p className="text-indigo-400 text-xs mt-1">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Interests ── */}
              {step === 2 && (
                <div className="max-w-lg mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">What are you focused on? 🎯</h2>
                    <p className="text-indigo-400 text-sm">Pick all that apply.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {INTERESTS.map(item => (
                      <button key={item.id} onClick={() => toggleInterest(item.id)}
                        className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all hover:scale-[1.04]"
                        style={interests.includes(item.id)
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', border:'none', boxShadow:'0 6px 20px rgba(139,92,246,0.3)' }
                          : { background:'rgba(255,255,255,0.75)', border:'1.5px solid rgba(139,92,246,0.12)' }}>
                        <span className="text-3xl">{item.emoji}</span>
                        <span className={`text-sm font-bold ${interests.includes(item.id) ? 'text-white' : 'text-indigo-700'}`}>
                          {item.label}
                        </span>
                        {interests.includes(item.id) && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Ready ── */}
              {step === 3 && (
                <div className="max-w-md mx-auto text-center">
                  <motion.div animate={{ scale:[1,1.1,0.95,1.05,1], rotate:[-3,3,-2,2,-3] }}
                    transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                    className="text-7xl mb-5 inline-block">🎉</motion.div>
                  <h2 className="text-3xl font-black text-indigo-900 mb-3">You're all set!</h2>
                  <p className="text-indigo-400 text-base mb-8">
                    <span className="font-bold text-violet-600">{selCompanion.emoji} {selCompanion.name}</span> is ready to cheer you on.
                  </p>
                  <div className="ff-card p-6 mb-8 text-left space-y-3">
                    {[
                      { label:'Companion', val:`${selCompanion.emoji} ${selCompanion.name}` },
                      { label:'Theme',     val:`${THEMES.find(t=>t.id===theme)?.emoji} ${THEMES.find(t=>t.id===theme)?.name}` },
                      { label:'Focus Areas', val: interests.length > 0 ? interests.join(', ') : 'Not selected' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-1 border-b border-violet-50 last:border-0">
                        <span className="text-indigo-400 text-sm">{row.label}</span>
                        <span className="text-indigo-900 font-bold text-sm capitalize">{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={finish} disabled={loading}
                    className="ff-btn text-lg px-10 py-4 justify-center w-full"
                    style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)', color:'#fff', boxShadow:'0 6px 28px rgba(139,92,246,0.45)' }}>
                    {loading
                      ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Zap size={20} fill="currentColor"/> Enter Your Workspace!</>}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10">
            <button onClick={() => setStep(s => Math.max(0, s-1))}
              className={`ff-btn ff-btn-outline ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
              ← Back
            </button>
            {step < STEPS.length-1 && (
              <button onClick={() => setStep(s => s+1)}
                className="ff-btn"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                Continue <ChevronRight size={16}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
