import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { GradientOrb, FloatingBubble, MorphingBlob, FloatingStatCard } from '../components/ui/FloatingElements';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type F = z.infer<typeof schema>;

const PERKS = [
  '💰 Commit pocket money to your study goals',
  '📸 Submit GitHub, photo or written proof',
  '🏆 Complete goals → Claim your money back',
  '💝 Miss a goal → Simulated charity donation',
];

const FLOATERS = [
  { emoji:'💰', x:'6%',   y:'18%', dur:6,   delay:0   },
  { emoji:'🎯', x:'76%',  y:'12%', dur:7,   delay:1   },
  { emoji:'📚', x:'82%',  y:'55%', dur:5.5, delay:2   },
  { emoji:'🏆', x:'4%',   y:'65%', dur:6.5, delay:0.5 },
  { emoji:'⚡', x:'45%',  y:'82%', dur:5,   delay:1.5 },
];

export default function Register() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const { register, handleSubmit, formState:{ errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      setAuth(res.data.user as User, res.data.token);
      toast.success(`Welcome aboard, ${res.data.user.name}! 🎉`);
      navigate('/onboarding');
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Registration failed.'
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2"
      style={{ background:'linear-gradient(135deg,#ecfdf5 0%,#e0f2fe 50%,#f5f3ff 100%)' }}>

      {/* LEFT — form */}
      <div className="flex items-center justify-center p-8 order-2 lg:order-1 relative">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5 }} className="w-full max-w-md relative z-10 space-y-7">

          <div className="text-center">
            <motion.div
              animate={{ scale:[1,1.1,0.95,1.05,1], rotate:[0,8,-6,4,-4,0] }}
              transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl text-3xl"
              style={{ background:'linear-gradient(135deg,#10b981,#0ea5e9)' }}>
              🚀
            </motion.div>
            <h1 className="text-3xl font-black text-indigo-900">Create your account</h1>
            <p className="text-indigo-400 text-sm mt-2">Join and start committing to your goals</p>
          </div>

          <div className="ff-card p-8 space-y-5">
            <div>
              <label className="ff-form-label">Full Name</label>
              <input {...register('name')} placeholder="Your name" className="ff-input" autoComplete="name" />
              {errors.name && <p className="ff-form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="ff-form-label">Email address</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className="ff-input" autoComplete="email" />
              {errors.email && <p className="ff-form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="ff-form-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'}
                  placeholder="Minimum 8 characters" className="ff-input pr-11" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors p-1">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="ff-form-error">{errors.password.message}</p>}
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={loading}
              className="ff-btn w-full justify-center text-base py-3.5 disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#10b981,#0ea5e9)', color:'#fff', boxShadow:'0 4px 20px rgba(16,185,129,0.35)' }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={17} fill="currentColor" /> Create Free Account <ArrowRight size={16}/></>}
            </button>
          </div>

          <p className="text-center text-indigo-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-violet-600 hover:text-violet-800 transition-colors">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT — animated visual */}
      <div className="relative hidden lg:flex flex-col overflow-hidden rounded-l-[48px] order-1 lg:order-2"
        style={{ background:'linear-gradient(145deg,#0d9488,#0369a1,#4f46e5)' }}>
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <GradientOrb size={300} color1="rgba(255,255,255,0.15)" color2="transparent" x="50%" y="5%"  duration={9}  opacity={1} blur={80}/>
          <GradientOrb size={200} color1="rgba(255,255,255,0.1)"  color2="transparent" x="-5%" y="55%" duration={11} delay={2} opacity={1} blur={60}/>
        </div>

        {/* Floating bubbles */}
        {FLOATERS.map((f, i) => (
          <motion.div key={i} className="absolute pointer-events-none"
            style={{ left:f.x, top:f.y, zIndex:10 }}
            animate={{ y:[0,-14,6,-9,0], rotate:[-3,3,-2,3,-3] }}
            transition={{ duration:f.dur, delay:f.delay, repeat:Infinity, ease:'easeInOut' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl"
              style={{ background:'rgba(255,255,255,0.2)', border:'1.5px solid rgba(255,255,255,0.35)', backdropFilter:'blur(12px)' }}>
              {f.emoji}
            </div>
          </motion.div>
        ))}

        {/* Floating stat cards */}
        <FloatingStatCard value="₹2.4L" label="Committed (TEST)" emoji="💰" grad="from-emerald-400 to-teal-500" x="55%" y="20%" delay={0.5} />
        <FloatingStatCard value="91%"   label="Success Rate"       emoji="🎯" grad="from-violet-400 to-purple-500" x="10%" y="35%" delay={1.5} />
        <FloatingStatCard value="+120"  label="XP per goal"        emoji="⚡" grad="from-amber-400 to-yellow-500"  x="58%" y="65%" delay={2.5} />

        {/* Bottom perks */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
            <p className="text-white/90 font-black text-lg mb-4">Everything you need to stay accountable.</p>
            <div className="space-y-2">
              {PERKS.map(perk => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-300 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{perk}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
