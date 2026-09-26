import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { LoginSidePanel } from '../components/ui/FloatingElements';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type F = z.infer<typeof schema>;

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth }  = useAuthStore();
  const navigate     = useNavigate();
  const { register, handleSubmit, formState:{ errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email: data.email as string, password: data.password as string });
      setAuth(res.data.user as User, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! ✨`);
      navigate(res.data.user.isOnboarded ? '/dashboard' : '/onboarding');
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Login failed — check your credentials.'
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2"
      style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#fce7f3 100%)' }}>

      {/* LEFT — animated floating panel */}
      <div className="hidden lg:block relative overflow-hidden rounded-r-[48px]">
        <LoginSidePanel />
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8 relative">
        {/* Subtle background for mobile */}
        <div className="absolute inset-0 lg:hidden"
          style={{ background:'linear-gradient(145deg,#6d28d9,#4f46e5,#be185d)', opacity:0.06 }} />

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5 }} className="w-full max-w-md relative z-10 space-y-8">

          {/* Logo */}
          <div className="text-center">
            <motion.div
              animate={{ rotate:[0,5,-5,3,-3,0], scale:[1,1.05,0.98,1.03,1] }}
              transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl text-3xl"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              ⚡
            </motion.div>
            <h1 className="text-3xl font-black text-indigo-900">Welcome back 👋</h1>
            <p className="text-indigo-400 text-sm mt-2">Log in to continue your commitment journey</p>
          </div>

          {/* Form card */}
          <div className="ff-card p-8 space-y-5">
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
                  placeholder="Your password" className="ff-input pr-11" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700 transition-colors p-1">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="ff-form-error">{errors.password.message}</p>}
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={loading}
              className="ff-btn w-full justify-center text-base py-3.5 disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 20px rgba(139,92,246,0.4)' }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={17} fill="currentColor" /> Sign In <ArrowRight size={16}/></>}
            </button>
          </div>

          <p className="text-center text-indigo-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-violet-600 hover:text-violet-800 transition-colors">
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
