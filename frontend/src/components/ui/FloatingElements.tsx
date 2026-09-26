/**
 * FloatingElements — Pure CSS/Framer Motion floating UI elements.
 * Replaces Three.js cartoons with premium animated orbs, cards,
 * emoji bubbles, gradient blobs, sparkle trails and morphing shapes.
 * Lightweight, fast, beautiful.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

/* ─── Gradient Orb ───────────────────────────────────────── */
interface OrbProps {
  size?: number;
  color1?: string;
  color2?: string;
  x?: string;
  y?: string;
  duration?: number;
  delay?: number;
  blur?: number;
  opacity?: number;
}
export function GradientOrb({
  size = 300, color1 = '#8b5cf6', color2 = '#ec4899',
  x = '10%', y = '10%', duration = 8, delay = 0, blur = 80, opacity = 0.3,
}: OrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color1}88 0%, ${color2}44 50%, transparent 75%)`,
        filter: `blur(${blur}px)`,
        opacity,
      }}
      animate={{
        scale:   [1, 1.15, 0.95, 1.1, 1],
        x:       [0, 30, -20, 15, 0],
        y:       [0, -20, 25, -10, 0],
        opacity: [opacity, opacity * 1.3, opacity * 0.8, opacity * 1.1, opacity],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Floating Emoji Bubble ──────────────────────────────── */
interface BubbleProps {
  emoji: string;
  x?: string;
  y?: string;
  size?: number;
  duration?: number;
  delay?: number;
  rotateRange?: number;
}
export function FloatingBubble({
  emoji, x = '50%', y = '50%', size = 56,
  duration = 6, delay = 0, rotateRange = 20,
}: BubbleProps) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none z-10"
      style={{ left: x, top: y, fontSize: size * 0.55, width: size, height: size }}
      animate={{
        y: [0, -18, 6, -12, 0],
        x: [0, 8, -6, 4, 0],
        rotate: [0, rotateRange / 2, -rotateRange / 3, rotateRange / 4, 0],
        scale:  [1, 1.08, 0.97, 1.04, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="w-full h-full rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
        style={{
          background: 'rgba(255,255,255,0.75)',
          border: '1.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}>
        {emoji}
      </div>
    </motion.div>
  );
}

/* ─── Morphing Blob ──────────────────────────────────────── */
export function MorphingBlob({
  color = '#8b5cf6', size = 200, x = '50%', y = '50%',
  duration = 10, delay = 0, opacity = 0.15,
}: {
  color?: string; size?: number; x?: string; y?: string;
  duration?: number; delay?: number; opacity?: number;
}) {
  const borderRadii = [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '30% 60% 70% 40% / 50% 60% 30% 60%',
    '50% 60% 30% 70% / 30% 50% 70% 40%',
    '70% 30% 50% 60% / 40% 70% 40% 60%',
    '60% 40% 30% 70% / 60% 30% 70% 40%',
  ];
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, opacity, background: color, filter: 'blur(40px)' }}
      animate={{ borderRadius: borderRadii, scale: [1, 1.1, 0.95, 1.05, 1], rotate: [0, 15, -10, 8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Sparkle Trail ──────────────────────────────────────── */
function Sparkle({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{
        scale:   [0, 1.2, 0],
        opacity: [0, 0.9, 0],
        y:       [0, -30],
      }}
      transition={{ duration: 1.8, delay, repeat: Infinity, repeatDelay: Math.random() * 3 + 1, ease: 'easeOut' }}
    />
  );
}

export function SparkleField({ count = 15, colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'] }: { count?: number; colors?: string[] }) {
  const sparks = Array.from({ length: count }, (_, i) => ({
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    size:  Math.random() * 6 + 3,
    color: colors[i % colors.length],
    delay: Math.random() * 3,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparks.map((s, i) => (
        <Sparkle key={i} x={s.x * window.innerWidth / 100} y={s.y * window.innerHeight / 100}
          size={s.size} color={s.color} delay={s.delay} />
      ))}
    </div>
  );
}

/* ─── Floating Stat Card ─────────────────────────────────── */
export function FloatingStatCard({
  value, label, emoji, grad,
  x = '0%', y = '0%', delay = 0,
}: {
  value: string; label: string; emoji: string; grad: string;
  x?: string; y?: string; delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, zIndex: 20 }}
      animate={{ y: [0, -10, 4, -6, 0], rotate: [-2, 2, -1, 2, -2] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 16px 40px rgba(139,92,246,0.2)',
          minWidth: 140,
        }}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-sm shadow-sm`}>{emoji}</div>
          <div>
            <p className="font-black text-indigo-900 text-base leading-none">{value}</p>
            <p className="text-indigo-400 text-[10px] mt-0.5 font-medium">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Animated Ring ──────────────────────────────────────── */
export function AnimatedRing({
  size = 200, color = '#8b5cf6', x = '50%', y = '50%',
  duration = 4, delay = 0,
}: {
  size?: number; color?: string; x?: string; y?: string; duration?: number; delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        border: `2px solid ${color}44`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/* ─── Floating Icon Card ─────────────────────────────────── */
export function FloatingIconCard({
  icon, label, color, x, y, delay = 0,
}: {
  icon: React.ReactNode; label: string; color: string; x: string; y: string; delay?: number;
}) {
  return (
    <motion.div className="absolute pointer-events-none z-10" style={{ left: x, top: y }}
      animate={{ y: [0, -12, 5, -8, 0], scale: [1, 1.05, 0.98, 1.03, 1] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: color, boxShadow: `0 8px 24px ${color}66` }}>
          {icon}
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm">{label}</span>
      </div>
    </motion.div>
  );
}

/* ─── Full Hero Visual (replaces 3D scene on Landing) ─────── */
const HERO_FLOATERS = [
  { emoji:'🎯', label:'Set Goals',    x:'8%',   y:'20%', dur:6,   delay:0,   size:64 },
  { emoji:'💰', label:'Commit',       x:'80%',  y:'15%', dur:7,   delay:1,   size:60 },
  { emoji:'📸', label:'Submit Proof', x:'5%',   y:'65%', dur:5.5, delay:2,   size:56 },
  { emoji:'🏆', label:'Claim Reward', x:'78%',  y:'70%', dur:6.5, delay:0.5, size:64 },
  { emoji:'⚡', label:'+150 XP',      x:'50%',  y:'8%',  dur:5,   delay:1.5, size:52 },
  { emoji:'🔥', label:'14-day Streak',x:'88%',  y:'42%', dur:7.5, delay:3,   size:56 },
  { emoji:'💎', label:'Achievement',  x:'12%',  y:'42%', dur:6,   delay:2.5, size:52 },
  { emoji:'📊', label:'Analytics',    x:'60%',  y:'88%', dur:5.5, delay:0,   size:48 },
];

export function HeroFloatVisual() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 520 }}>
      {/* Background orbs */}
      <GradientOrb size={350} color1="#8b5cf6" color2="#ec4899" x="20%" y="15%" duration={9} opacity={0.2} />
      <GradientOrb size={280} color1="#0ea5e9" color2="#6366f1" x="55%" y="40%" duration={11} delay={2} opacity={0.18} />
      <GradientOrb size={220} color1="#10b981" color2="#06b6d4" x="10%" y="60%" duration={8} delay={1} opacity={0.18} />

      {/* Morphing blobs */}
      <MorphingBlob color="#ec4899" size={180} x="65%" y="20%" duration={12} opacity={0.12} />
      <MorphingBlob color="#8b5cf6" size={140} x="15%" y="50%" duration={10} delay={3} opacity={0.1} />

      {/* Floating emoji bubbles */}
      {HERO_FLOATERS.map((f, i) => (
        <FloatingBubble key={i} emoji={f.emoji} x={f.x} y={f.y} size={f.size} duration={f.dur} delay={f.delay} />
      ))}

      {/* Center glassmorphism card */}
      <motion.div className="absolute" style={{ left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:30 }}
        initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5, duration:0.8 }}>
        <div className="rounded-3xl p-6 text-center"
          style={{
            background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)',
            border:'2px solid rgba(255,255,255,0.9)',
            boxShadow:'0 32px 80px rgba(139,92,246,0.25), 0 8px 24px rgba(0,0,0,0.06)',
            width:220,
          }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg text-3xl"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
            🎯
          </div>
          <p className="font-black text-indigo-900 text-base">Complete Commitment</p>
          <p className="text-indigo-400 text-xs mt-1">Exam Prep · 14 days</p>
          <div className="mt-3 h-2 rounded-full overflow-hidden bg-indigo-100">
            <motion.div className="h-full rounded-full"
              style={{ background:'linear-gradient(90deg,#8b5cf6,#ec4899)' }}
              initial={{ width:'0%' }} animate={{ width:'78%' }}
              transition={{ delay:1, duration:1.5, ease:'easeOut' }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-indigo-400 text-xs">78%</span>
            <span className="text-emerald-600 text-xs font-bold">₹500 staked</span>
          </div>
          <motion.div className="mt-3 flex items-center justify-center gap-1"
            animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }}>
            <span className="text-amber-500 text-xs font-bold">⚡ +120 XP on completion</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Pulsing rings */}
      <div className="absolute" style={{ left:'50%', top:'50%' }}>
        <AnimatedRing size={260} color="#8b5cf6" duration={3.5} delay={0} />
        <AnimatedRing size={260} color="#ec4899" duration={3.5} delay={1.2} />
        <AnimatedRing size={260} color="#0ea5e9" duration={3.5} delay={2.4} />
      </div>
    </div>
  );
}

/* ─── Dashboard Companion Widget (replaces 3D canvas) ─────── */
const DASH_FLOATERS = [
  { emoji:'🎯', x:'10%',  y:'15%', dur:5,   delay:0   },
  { emoji:'⚡', x:'75%',  y:'10%', dur:6,   delay:1   },
  { emoji:'🔥', x:'85%',  y:'65%', dur:5.5, delay:2   },
  { emoji:'🏆', x:'5%',   y:'70%', dur:6.5, delay:0.5 },
  { emoji:'💎', x:'45%',  y:'85%', dur:4.5, delay:1.5 },
  { emoji:'📈', x:'20%',  y:'50%', dur:7,   delay:3   },
];

export function DashboardCompanion({ name = 'Your Focus Space', level = 1, xp = 0 }: {
  name?: string; level?: number; xp?: number;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ minHeight: 260 }}>
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe,#fce7f3)' }} />

      {/* Orbs */}
      <GradientOrb size={200} color1="#8b5cf6" color2="#ec4899" x="30%" y="20%" duration={8} opacity={0.25} />
      <GradientOrb size={150} color1="#0ea5e9" color2="#6366f1" x="60%" y="50%" duration={10} delay={2} opacity={0.2} />

      {/* Floating emojis */}
      {DASH_FLOATERS.map((f, i) => (
        <motion.div key={i} className="absolute pointer-events-none text-2xl"
          style={{ left: f.x, top: f.y }}
          animate={{ y:[0,-12,5,-8,0], rotate:[-5,5,-3,4,-5] }}
          transition={{ duration:f.dur, delay:f.delay, repeat:Infinity, ease:'easeInOut' }}>
          {f.emoji}
        </motion.div>
      ))}

      {/* Center focus card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.6 }}
          className="text-center px-4">
          <motion.div
            animate={{ scale:[1,1.08,1], rotate:[-2,2,-1,2,-2] }}
            transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
            className="text-6xl mb-3 inline-block">
            🎯
          </motion.div>
          <p className="font-black text-indigo-900 text-sm">{name}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="ff-badge-purple text-[10px]">Lv.{level}</span>
            <span className="text-indigo-400 text-[10px]">{xp.toLocaleString()} XP</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Login Page Side Panel (replaces 3D canvas) ────────────── */
const LOGIN_ITEMS = [
  { emoji:'💰', title:'Commit pocket money',    sub:'₹100 – ₹5,000',      x:'8%',  y:'18%', delay:0,   size:68, grad:'from-emerald-400 to-teal-500'   },
  { emoji:'✅', title:'Complete tasks',          sub:'Check off milestones', x:'62%', y:'12%', delay:1,   size:60, grad:'from-violet-400 to-purple-500'  },
  { emoji:'📸', title:'Submit proof',            sub:'Photo / GitHub',       x:'72%', y:'58%', delay:2,   size:64, grad:'from-pink-400 to-rose-500'      },
  { emoji:'🏆', title:'Claim your money back',   sub:'Or donate to charity', x:'5%',  y:'62%', delay:0.5, size:64, grad:'from-amber-400 to-yellow-500'   },
  { emoji:'🔥', title:'14-day streak',           sub:'Keep the momentum',    x:'38%', y:'82%', delay:1.5, size:56, grad:'from-orange-400 to-red-500'     },
];

export function LoginSidePanel() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ minHeight: 600 }}>
      {/* Rich gradient bg */}
      <div className="absolute inset-0"
        style={{ background:'linear-gradient(145deg,#6d28d9 0%,#4f46e5 35%,#be185d 70%,#9d174d 100%)' }} />

      {/* Layered orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { s:300, c1:'rgba(255,255,255,0.12)', x:'60%', y:'-10%', d:9 },
          { s:200, c1:'rgba(255,255,255,0.08)', x:'-5%', y:'60%',  d:11, delay:2 },
          { s:150, c1:'rgba(255,255,255,0.1)',  x:'70%', y:'75%',  d:8,  delay:1 },
        ].map((o,i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width:o.s, height:o.s, left:o.x, top:o.y, background:`radial-gradient(circle, ${o.c1}, transparent 70%)`, filter:'blur(60px)' }}
            animate={{ scale:[1,1.2,0.9,1.1,1], x:[0,20,-15,10,0], y:[0,-15,20,-8,0] }}
            transition={{ duration:o.d, delay:(o as {delay?:number}).delay ?? 0, repeat:Infinity, ease:'easeInOut' }} />
        ))}
      </div>

      {/* Floating item cards */}
      {LOGIN_ITEMS.map((item, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          style={{ left:item.x, top:item.y, zIndex:10 }}
          animate={{ y:[0,-14,6,-9,0], rotate:[-3,3,-2,3,-3], scale:[1,1.04,0.97,1.02,1] }}
          transition={{ duration:5.5+i*0.5, delay:item.delay, repeat:Infinity, ease:'easeInOut' }}>
          <div className="rounded-2xl px-3 py-2.5 shadow-2xl backdrop-blur-xl"
            style={{
              background:'rgba(255,255,255,0.18)',
              border:'1.5px solid rgba(255,255,255,0.35)',
              boxShadow:'0 16px 40px rgba(0,0,0,0.2)',
              minWidth:150,
            }}>
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                {item.emoji}
              </div>
              <div>
                <p className="text-white font-bold text-xs leading-tight">{item.title}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{item.sub}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Central branding */}
      <div className="absolute inset-0 flex items-end justify-start p-8 z-20">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.7 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-xl">⚡</span>
            </div>
            <span className="font-black text-xl text-white">Study Forge</span>
          </div>
          <p className="text-white/80 text-sm font-medium max-w-xs">
            Commit your pocket money to your study goals. Complete, prove, and claim it back.
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {['🎯 Goals','💰 Pocket Money','📸 Proof','🏆 Claim'].map(tag => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full font-semibold text-white"
                style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)' }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Onboarding Visual ─────────────────────────────────── */
const COMPANION_EMOJIS: Record<string, string> = {
  doraemon:'🤖', dora:'🎒', shinchan:'😄', jackie:'🥋',
  spiderman:'🕷️', superman:'🦸', fairy:'🧚', wizard:'🧙',
  phoenix:'🔥', dragon:'🐉', unicorn:'🦄', robot:'🤖',
};

export function OnboardingCompanionVisual({ companion, name }: { companion: string; name: string }) {
  const emoji = COMPANION_EMOJIS[companion] ?? '⚡';
  const colors = [
    ['#8b5cf6','#ec4899'], ['#0ea5e9','#6366f1'], ['#10b981','#06b6d4'],
    ['#f59e0b','#f97316'], ['#ec4899','#f97316'],
  ];
  const [ci] = useState(() => Math.floor(Math.random() * colors.length));
  const [c1, c2] = colors[ci];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ minHeight:320 }}>
      <GradientOrb size={280} color1={c1} color2={c2} x="20%" y="15%" duration={8} opacity={0.25} />
      <GradientOrb size={200} color1={c2} color2={c1} x="55%" y="45%" duration={10} delay={2} opacity={0.2} />

      {/* Pulsing rings */}
      {[1,1.5,2].map((s, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width:160, height:160, border:`2px solid ${c1}33` }}
          animate={{ scale:[s, s*1.3], opacity:[0.5,0] }}
          transition={{ duration:3, delay:i*1, repeat:Infinity, ease:'easeOut' }} />
      ))}

      {/* Main emoji */}
      <motion.div className="relative z-10 text-center"
        animate={{ y:[0,-10,4,-7,0], rotate:[-5,5,-3,4,-5] }}
        transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}>
        <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-3"
          style={{ background:`linear-gradient(135deg,${c1},${c2})`, fontSize:56, boxShadow:`0 16px 48px ${c1}55` }}>
          {emoji}
        </div>
        <div className="px-4 py-2 rounded-2xl mx-auto inline-block"
          style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', border:'1.5px solid rgba(255,255,255,0.9)' }}>
          <p className="font-black text-indigo-900 text-base">{name}</p>
          <p className="text-indigo-400 text-xs">Your study companion</p>
        </div>
      </motion.div>

      {/* Surrounding mini emojis */}
      {['⚡','🎯','🏆','📚','✨'].map((e, i) => {
        const a = (i / 5) * Math.PI * 2;
        const r = 110;
        return (
          <motion.div key={i} className="absolute text-xl pointer-events-none"
            style={{ left:`calc(50% + ${Math.cos(a)*r}px - 16px)`, top:`calc(50% + ${Math.sin(a)*r}px - 16px)` }}
            animate={{ scale:[1,1.3,0.9,1.2,1], opacity:[0.6,1,0.7,0.9,0.6] }}
            transition={{ duration:3+i*0.4, delay:i*0.3, repeat:Infinity, ease:'easeInOut' }}>
            {e}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Page Background Floaters (ambient) ─────────────────── */
export function PageFloaters({ variant = 'default' }: { variant?: 'default' | 'mint' | 'candy' | 'sky' | 'sun' }) {
  const palettes = {
    default: { c1:'#8b5cf6', c2:'#ec4899', c3:'rgba(139,92,246,0.2)' },
    mint:    { c1:'#10b981', c2:'#06b6d4', c3:'rgba(16,185,129,0.2)'  },
    candy:   { c1:'#ec4899', c2:'#f97316', c3:'rgba(236,72,153,0.2)'  },
    sky:     { c1:'#0ea5e9', c2:'#6366f1', c3:'rgba(14,165,233,0.2)'  },
    sun:     { c1:'#f59e0b', c2:'#f97316', c3:'rgba(245,158,11,0.2)'  },
  };
  const p = palettes[variant];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <GradientOrb size={500} color1={p.c1} color2={p.c2} x="-5%" y="-10%" duration={12} opacity={0.15} />
      <GradientOrb size={400} color1={p.c2} color2={p.c1} x="70%"  y="60%"  duration={14} delay={3} opacity={0.12} />
      <GradientOrb size={300} color1={p.c1} color2={p.c2} x="30%"  y="70%"  duration={10} delay={6} opacity={0.1} />
      <MorphingBlob color={p.c1} size={200} x="80%" y="10%" duration={12} delay={2} opacity={0.08} />
      <MorphingBlob color={p.c2} size={160} x="5%"  y="50%" duration={9}  delay={4} opacity={0.08} />
    </div>
  );
}
