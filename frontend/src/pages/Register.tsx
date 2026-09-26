import { Suspense, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { FloatingCartoonSceneContent } from '../components/3d/FloatingCartoonScene';
import { DoraemonCartoon, SupermanCartoon, SpidermanCartoon, ShinChanCartoon } from '../components/3d/CartoonCharacters';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type F = z.infer<typeof schema>;

const CHARS = [DoraemonCartoon, SupermanCartoon, SpidermanCartoon, ShinChanCartoon];
const PERKS = [
  '🤖 Cartoon companions: Doraemon, Spiderman, Superman',
  '🔥 Streak tracking + XP leveling',
  '📸 GitHub, photo & manual proof verification',
  '🏆 Achievements & focus score',
];

function RegisterScene() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i+1) % CHARS.length), 3000);
    return () => clearInterval(id);
  }, []);
  const C = CHARS[idx];
  return (
    <Canvas camera={{ position:[0,0.5,8], fov:55 }} gl={{ antialias:true, alpha:true }} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <FloatingCartoonSceneContent variant="compact" />
        <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.8}>
          <C position={[0,-0.5,0]} />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6}
          minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
      </Suspense>
    </Canvas>
  );
}

export default function Register() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{ errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      setAuth(res.data.user as User, res.data.token);
      toast.success(`Welcome aboard, ${res.data.user.name}! 🎉`);
      navigate('/onboarding');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2"
      style={{ background:'linear-gradient(135deg,#ecfdf5 0%,#e0f2fe 50%,#f5f3ff 100%)' }}>

      {/* LEFT — form */}
      <div className="flex items-center justify-center p-8 order-2 lg:order-1">
        <div className="w-full max-w-md space-y-7">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{ background:'linear-gradient(135deg,#10b981,#0ea5e9)' }}>
              <Zap className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-indigo-900">Create your account 🚀</h1>
            <p className="text-indigo-400 text-sm mt-2">Join Study Forge — where commitments become identity</p>
          </div>

          <div className="ff-card p-8 space-y-5">
            <div>
              <label className="ff-form-label">Full Name</label>
              <input {...register('name')} placeholder="Your name" className="ff-input" />
              {errors.name && <p className="ff-form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="ff-form-label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="ff-input" />
              {errors.email && <p className="ff-form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="ff-form-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" className="ff-input pr-11" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="ff-form-error">{errors.password.message}</p>}
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={loading}
              className="ff-btn w-full justify-center text-base py-3"
              style={{ background:'linear-gradient(135deg,#10b981,#0ea5e9)', color:'#fff', boxShadow:'0 4px 16px rgba(16,185,129,0.3)' }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={17} fill="currentColor" /> Create Account</>}
            </button>
          </div>

          <p className="text-center text-indigo-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-violet-600 hover:text-violet-800 transition-colors">
              Log In →
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — 3D */}
      <div className="relative hidden lg:flex flex-col overflow-hidden rounded-l-[40px] order-1 lg:order-2"
        style={{ background:'linear-gradient(135deg,#0d9488,#0369a1,#4f46e5)' }}>
        <div className="flex-1 relative z-10">
          <RegisterScene />
        </div>
        <div className="relative z-10 p-10 text-white">
          <p className="text-white/90 text-xl font-bold mb-4">Everything you need to forge focus.</p>
          <div className="space-y-2.5">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-white/80 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
