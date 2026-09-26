import { Suspense, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { FloatingCartoonSceneContent } from '../components/3d/FloatingCartoonScene';
import { DoraemonCartoon, SpidermanCartoon, SupermanCartoon, DoraCartoon, ShinChanCartoon, JackieChanCartoon } from '../components/3d/CartoonCharacters';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type F = z.infer<typeof schema>;

const CHARS = [
  { C: DoraemonCartoon,  label:'Doraemon 🤖', color:'#1a8fe3' },
  { C: SpidermanCartoon, label:'Spiderman 🕷️', color:'#ef4444' },
  { C: SupermanCartoon,  label:'Superman 🦸', color:'#1d4ed8' },
  { C: DoraCartoon,      label:'Dora 🎒',     color:'#f472b6' },
  { C: ShinChanCartoon,  label:'Shin Chan 😄', color:'#ef4444' },
  { C: JackieChanCartoon,label:'Jackie 🥋',   color:'#fbbf24' },
];

function CharCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % CHARS.length), 3500);
    return () => clearInterval(id);
  }, []);
  const { C, color } = CHARS[idx];
  return (
    <Canvas camera={{ position:[0,0.5,8], fov:55 }} gl={{ antialias:true, alpha:true }} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <FloatingCartoonSceneContent variant="compact" />
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
          <C position={[0,-0.6,0]} />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5}
          minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
      </Suspense>
    </Canvas>
  );
}

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{ errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email: data.email as string, password: data.password as string });
      setAuth(res.data.user as User, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! ✨`);
      navigate(res.data.user.isOnboarded ? '/dashboard' : '/onboarding');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2"
      style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>

      {/* LEFT — 3D panel */}
      <div className="relative hidden lg:flex flex-col overflow-hidden rounded-r-[40px]"
        style={{ background:'linear-gradient(135deg,#6d28d9,#4f46e5,#be185d)', minHeight:'100vh' }}>
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            { w:300, h:300, top:'10%', left:'15%',  bg:'rgba(255,255,255,0.08)' },
            { w:200, h:200, bottom:'20%', right:'10%', bg:'rgba(255,255,255,0.06)' },
          ].map((b,i) => (
            <div key={i} className="absolute rounded-full blur-3xl animate-float"
              style={{ width:b.w, height:b.h, ...b, background:b.bg, animationDelay:`${i}s` }} />
          ))}
        </div>
        {/* 3D Canvas */}
        <div className="flex-1 relative z-10">
          <CharCarousel />
        </div>
        {/* Bottom text */}
        <div className="relative z-10 p-10 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-lg">Study Forge</span>
          </div>
          <p className="text-white/90 text-xl font-bold mb-2">Your cartoon companions are waiting.</p>
          <p className="text-white/60 text-sm">Doraemon, Spiderman, Shin Chan, Dora and more — cheering you on every step.</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {CHARS.map(c => (
              <span key={c.label} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.9)' }}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Zap className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-indigo-900">Welcome back 👋</h1>
            <p className="text-indigo-400 text-sm mt-2">Log in to continue forging your focus</p>
          </div>

          {/* Form */}
          <div className="ff-card p-8 space-y-5">
            <div>
              <label className="ff-form-label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="ff-input" />
              {errors.email && <p className="ff-form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="ff-form-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Your password" className="ff-input pr-11" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="ff-form-error">{errors.password.message}</p>}
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={loading}
              className="ff-btn w-full justify-center text-base py-3"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 16px rgba(139,92,246,0.35)' }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={17} fill="currentColor" /> Log In</>}
            </button>
          </div>

          <p className="text-center text-indigo-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-violet-600 hover:text-violet-800 transition-colors">
              Start Forging →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
