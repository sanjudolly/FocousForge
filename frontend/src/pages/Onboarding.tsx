import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Theme } from '../types';
import { CartoonCharacter, type CharacterType } from '../components/3d/CartoonCharacters';

/* ── Character options ─────────────────────── */
const COMPANIONS: { id: CharacterType; name: string; emoji: string; desc: string; grad: string }[] = [
  { id:'doraemon',  name:'Doraemon',   emoji:'🤖', desc:'Future gadgets + infinite focus power',      grad:'from-blue-400 to-sky-500'     },
  { id:'dora',      name:'Dora',       emoji:'🎒', desc:'Explorer spirit, never gives up',            grad:'from-pink-400 to-rose-500'    },
  { id:'shinchan',  name:'Shin Chan',  emoji:'😄', desc:'Unstoppable energy, pure chaos',             grad:'from-red-400 to-orange-500'   },
  { id:'jackie',    name:'Jackie Chan',emoji:'🥋', desc:'Martial arts discipline, action hero focus', grad:'from-yellow-400 to-amber-500' },
  { id:'spiderman', name:'Spiderman',  emoji:'🕷️', desc:'With great power comes great responsibility',grad:'from-red-500 to-blue-600'     },
  { id:'superman',  name:'Superman',   emoji:'🦸', desc:'Man of steel, unstoppable commitment',       grad:'from-blue-500 to-red-500'     },
  { id:'fairy',     name:'Fairy',      emoji:'🧚', desc:'Magical, whimsical, full of wonder',        grad:'from-purple-400 to-pink-500'  },
  { id:'wizard',    name:'Wizard',     emoji:'🧙', desc:'Ancient wisdom and mystic knowledge',       grad:'from-indigo-500 to-purple-600'},
  { id:'phoenix',   name:'Phoenix',    emoji:'🔥', desc:'Rise from the ashes every single time',     grad:'from-orange-500 to-red-600'   },
  { id:'dragon',    name:'Dragon',     emoji:'🐉', desc:'Fierce, brave, unstoppable will',           grad:'from-teal-500 to-emerald-600' },
  { id:'unicorn',   name:'Unicorn',    emoji:'🦄', desc:'Magical belief in your own potential',      grad:'from-pink-400 to-violet-500'  },
  { id:'robot',     name:'Robot',      emoji:'🤖', desc:'Logical, systematic, efficient focus',      grad:'from-cyan-500 to-blue-600'    },
];

const THEME_OPTIONS: { id:Theme; name:string; emoji:string; desc:string; grad:string }[] = [
  { id:'feminine',  name:'Blossom', emoji:'🌸', desc:'Rose · Lavender · Purple vibes',   grad:'from-pink-400 via-purple-400 to-fuchsia-500' },
  { id:'masculine', name:'Apex',    emoji:'⚡', desc:'Sky · Steel · Indigo energy',      grad:'from-sky-400 via-blue-500 to-indigo-500'     },
  { id:'neutral',   name:'Zenith',  emoji:'✨', desc:'Violet · Lime · Balanced power',   grad:'from-violet-400 via-indigo-500 to-purple-500' },
];

const INTERESTS_LIST = [
  { id:'coding',   emoji:'💻', label:'Coding'   },
  { id:'study',    emoji:'📚', label:'Study'    },
  { id:'fitness',  emoji:'💪', label:'Fitness'  },
  { id:'career',   emoji:'🚀', label:'Career'   },
  { id:'personal', emoji:'✨', label:'Personal' },
  { id:'other',    emoji:'🎯', label:'Other'    },
];

const STEPS = ['Companion', 'Theme', 'Interests', 'Ready!'];

function CompanionPreview({ companion }: { companion: CharacterType }) {
  return (
    <Canvas camera={{ position:[0,0,6], fov:55 }} gl={{ antialias:true, alpha:true }} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.9} color="#fff0f8" />
        <pointLight position={[5, 5, 5]}  intensity={3} color="#f472b6" />
        <pointLight position={[-5,-3, 4]} intensity={2.5} color="#818cf8" />
        <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.8}>
          <CartoonCharacter type={companion} scale={0.95} />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6}
          minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
      </Suspense>
    </Canvas>
  );
}

export default function Onboarding() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [companion, setCompanion] = useState<CharacterType>('doraemon');
  const [theme, setTheme]         = useState<Theme>('neutral');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);

  const toggleInterest = (id: string) =>
    setInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const finish = async () => {
    setLoading(true);
    try {
      const res = await authAPI.onboarding({ theme, interests, avatar: { companion } });
      updateUser({ ...res.data.user, isOnboarded: true });
      toast.success('Your forge is ready! 🎉');
      navigate('/dashboard');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#dbeafe 0%,#e0e7ff 35%,#fce7f3 65%,#fef3c7 100%)' }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-80 rounded-full blur-3xl opacity-40 animate-float"
          style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-35 animate-float-slow"
          style={{ background:'rgba(236,72,153,0.2)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="font-black text-xl text-indigo-900">Study Forge</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'text-white' : i === step ? 'text-indigo-900 border-2 border-violet-400' : 'text-indigo-300'
              }`} style={i < step ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)' } : i === step ? { background:'rgba(255,255,255,0.8)' } : { background:'rgba(255,255,255,0.4)' }}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`hidden sm:block ml-2 text-xs font-semibold mr-3 ${i === step ? 'text-indigo-800' : 'text-indigo-300'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px mx-1" style={i < step ? { background:'linear-gradient(90deg,#8b5cf6,#ec4899)' } : { background:'rgba(139,92,246,0.2)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
              transition={{ duration:0.25 }}>

              {/* STEP 0: Choose companion */}
              {step === 0 && (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">Choose your companion 🎭</h2>
                    <p className="text-indigo-400 text-sm mb-6">They'll float around your dashboard and celebrate your wins.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                      {COMPANIONS.map(c => (
                        <button key={c.id} onClick={() => setCompanion(c.id)}
                          className="flex flex-col items-center p-3 rounded-2xl transition-all text-center"
                          style={companion === c.id
                            ? { background:'rgba(255,255,255,0.95)', border:'2px solid rgba(139,92,246,0.4)', boxShadow:'0 4px 16px rgba(139,92,246,0.2)' }
                            : { background:'rgba(255,255,255,0.6)', border:'1.5px solid rgba(139,92,246,0.1)' }}>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-2xl mb-2 shadow-md`}>
                            {c.emoji}
                          </div>
                          <p className="font-bold text-indigo-900 text-xs">{c.name}</p>
                          {companion === c.id && <CheckCircle2 size={12} className="text-violet-500 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 3D preview */}
                  <div className="h-72 lg:h-96 rounded-3xl overflow-hidden"
                    style={{ background:'linear-gradient(135deg,rgba(219,234,254,0.7),rgba(237,233,254,0.7),rgba(252,231,243,0.7))',
                      border:'2px solid rgba(255,255,255,0.9)', boxShadow:'0 12px 40px rgba(139,92,246,0.15)' }}>
                    <CompanionPreview companion={companion} />
                    <div className="relative -mt-10 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-indigo-700"
                        style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)' }}>
                        {COMPANIONS.find(c => c.id === companion)?.emoji} {COMPANIONS.find(c => c.id === companion)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Choose theme */}
              {step === 1 && (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">Choose your visual theme 🎨</h2>
                    <p className="text-indigo-400 text-sm">Your entire app will transform to match your energy.</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-5">
                    {THEME_OPTIONS.map(t => (
                      <button key={t.id} onClick={() => setTheme(t.id)}
                        className="relative rounded-3xl p-6 text-center transition-all overflow-hidden hover:scale-[1.03]"
                        style={theme === t.id
                          ? { border:'2.5px solid rgba(139,92,246,0.5)', boxShadow:'0 8px 28px rgba(139,92,246,0.2)', background:'rgba(255,255,255,0.92)' }
                          : { border:'1.5px solid rgba(139,92,246,0.12)', background:'rgba(255,255,255,0.7)' }}>
                        {theme === t.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                            <CheckCircle2 size={13} className="text-white" />
                          </div>
                        )}
                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${t.grad} mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg`}>
                          {t.emoji}
                        </div>
                        <p className="font-black text-indigo-900 text-lg">{t.name}</p>
                        <p className="text-indigo-400 text-xs mt-1.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Interests */}
              {step === 2 && (
                <div className="max-w-lg mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-indigo-900 mb-2">What are you focused on? 🎯</h2>
                    <p className="text-indigo-400 text-sm">Pick all that apply — helps us personalize your experience.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {INTERESTS_LIST.map(item => (
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

              {/* STEP 3: Ready! */}
              {step === 3 && (
                <div className="max-w-lg mx-auto text-center">
                  <div className="text-7xl mb-6 animate-bounce-gentle">🎉</div>
                  <h2 className="text-3xl font-black text-indigo-900 mb-3">You're all set!</h2>
                  <p className="text-indigo-400 text-base mb-8">
                    Your companion <strong className="text-violet-600">{COMPANIONS.find(c => c.id === companion)?.name}</strong> is ready to help you forge your focus.
                  </p>
                  <div className="ff-card p-6 mb-8 text-left space-y-3">
                    {[
                      { label:'Companion', val:`${COMPANIONS.find(c => c.id === companion)?.emoji} ${COMPANIONS.find(c => c.id === companion)?.name}` },
                      { label:'Theme',     val:`${THEME_OPTIONS.find(t => t.id === theme)?.emoji} ${THEME_OPTIONS.find(t => t.id === theme)?.name}` },
                      { label:'Interests', val: interests.length > 0 ? interests.join(', ') : 'None selected' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-indigo-400 text-sm">{row.label}</span>
                        <span className="text-indigo-900 font-semibold text-sm capitalize">{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={finish} disabled={loading}
                    className="ff-btn text-lg px-10 py-4 justify-center"
                    style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)', color:'#fff', boxShadow:'0 6px 24px rgba(139,92,246,0.4)' }}>
                    {loading
                      ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Zap size={20} fill="currentColor" /> Enter the Forge!</>}
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
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s+1)}
                className="ff-btn"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
