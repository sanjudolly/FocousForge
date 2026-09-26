import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Target, Shield, BarChart3, Trophy, Github, Camera, PenLine,
  ChevronDown, Star, CheckCircle2, ArrowRight, Flame, Clock,
  Users, TrendingUp, Lock, Sparkles,
} from 'lucide-react';
import { HeroFloatVisual, GradientOrb, MorphingBlob, PageFloaters } from '../components/ui/FloatingElements';

/* ── Features ─────────────────────────── */
const FEATURES = [
  { icon: Target,    color: 'from-violet-400 to-purple-500',   bg: 'bg-violet-50',  title: 'Commitment Contracts',  desc: 'Turn vague goals into binding commitments with a stake. When something costs you, you actually do it.' },
  { icon: Shield,    color: 'from-blue-400 to-indigo-500',     bg: 'bg-blue-50',    title: 'Proof Verification',    desc: 'GitHub commit history, photo proof, or manual submission. Real evidence of real work.' },
  { icon: Flame,     color: 'from-orange-400 to-red-500',      bg: 'bg-orange-50',  title: 'Streak System',         desc: 'Build momentum with daily streaks. One day at a time turns into unstoppable habits.' },
  { icon: Trophy,    color: 'from-amber-400 to-yellow-500',    bg: 'bg-amber-50',   title: 'XP & Achievements',     desc: 'Level up as you complete goals. Earn badges and climb through ranks of focus mastery.' },
  { icon: BarChart3, color: 'from-emerald-400 to-teal-500',    bg: 'bg-emerald-50', title: 'Focus Analytics',       desc: 'See your productivity patterns, completion rates, and commitment history at a glance.' },
  { icon: Sparkles,  color: 'from-pink-400 to-rose-500',       bg: 'bg-pink-50',    title: 'Cartoon Companions',    desc: 'Choose Doraemon, Spiderman, Superman and more as your focus companions on every goal.' },
];

const HOW_IT_WORKS = [
  { step: '01', emoji: '✍️', title: 'Define Your Goal',       desc: 'Write a clear, specific commitment. What will you accomplish? By when? How will you prove it?' },
  { step: '02', emoji: '💰', title: 'Set Your Stake',         desc: 'Attach a commitment amount in TEST MODE. Real stakes create real motivation.' },
  { step: '03', emoji: '📸', title: 'Choose Verification',    desc: 'GitHub commits, photo proof, or manual — pick how you prove you did the work.' },
  { step: '04', emoji: '🏆', title: 'Forge Your Future',      desc: 'Submit proof, earn XP, build streaks, unlock achievements. Commitment becomes identity.' },
];

const CHARACTERS = [
  { emoji: '🤖', name: 'Doraemon',   color: 'from-blue-400 to-sky-500',     desc: 'Future gadgets + focus' },
  { emoji: '🎒', name: 'Dora',       color: 'from-pink-400 to-rose-500',    desc: 'Explorer spirit' },
  { emoji: '😄', name: 'Shin Chan',  color: 'from-red-400 to-orange-500',   desc: 'Unstoppable energy' },
  { emoji: '🥋', name: 'Jackie',     color: 'from-yellow-400 to-amber-500', desc: 'Martial arts discipline' },
  { emoji: '🕷️', name: 'Spiderman',  color: 'from-red-500 to-blue-600',     desc: 'With great power...' },
  { emoji: '🦸', name: 'Superman',   color: 'from-blue-500 to-red-500',     desc: 'Man of steel focus' },
];

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', emoji: '🚀' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Augusta F. Kantra', emoji: '🎯' },
  { text: 'You don\'t rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', emoji: '⚡' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius', emoji: '🏔️' },
];

const FAQS = [
  { q: 'Is real money charged?',               a: 'No. This app operates in TEST MODE. All payment amounts are simulated using Stripe\'s test environment. No real transactions occur.' },
  { q: 'How does GitHub verification work?',   a: 'You provide your GitHub username, repository, and branch. This app uses the GitHub API to check for commits made after your goal was created. If commits exist, your proof is auto-verified.' },
  { q: 'What happens if I miss a deadline?',   a: 'The system marks your goal as "Commitment Missed" and simulates a penalty transaction. Your streak resets. We encourage you to create a new commitment and try again.' },
  { q: 'Which cartoon companion can I pick?',  a: 'Choose from Doraemon, Dora the Explorer, Shin Chan, Jackie Chan, Spiderman, Superman, Fairy, Dragon, Unicorn, Wizard, Phoenix, or Robot. They float around your dashboard!' },
  { q: 'What verification methods are available?', a: 'GitHub commit verification (automatic), Photo proof upload (via Cloudinary), and Manual description submission. Each method suits different goal types.' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #e0e7ff 30%, #fce7f3 65%, #fef3c7 100%)' }}>

      {/* ── Floating bubble decorations ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { size: 300, top: '5%',  left: '8%',  color: 'rgba(147,197,253,0.3)',  delay: 0 },
          { size: 200, top: '15%', right: '5%', color: 'rgba(251,207,232,0.35)', delay: 1 },
          { size: 250, top: '60%', left: '2%',  color: 'rgba(196,181,253,0.28)', delay: 2 },
          { size: 180, top: '70%', right: '8%', color: 'rgba(167,243,208,0.3)',  delay: 0.5 },
          { size: 220, top: '40%', left: '45%', color: 'rgba(253,230,138,0.25)', delay: 1.5 },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full blur-3xl animate-float"
            style={{ width: b.size, height: b.size, top: b.top, left: (b as any).left, right: (b as any).right,
              background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${5 + i}s` }} />
        ))}
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(139,92,246,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-xl text-indigo-900 tracking-tight">Study Forge</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Characters', 'How It Works', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-50 transition-all">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-bold rounded-xl text-white shadow-lg hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>
              Start Forging 🚀
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-8">
              <div className="flex items-center gap-2 flex-wrap">
                {['🤖 Doraemon', '🕷️ Spiderman', '🦸 Superman'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#6d28d9', border: '1px solid rgba(139,92,246,0.25)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div>
                <h1 className="text-6xl lg:text-7xl font-black leading-none tracking-tight">
                  <span className="text-indigo-900">Forge Your</span>
                  <br />
                  <span className="ff-text-gradient-rainbow">Focus. ✨</span>
                </h1>
                <p className="text-indigo-700/70 text-lg mt-5 leading-relaxed max-w-xl">
                  Goals become commitments. Commitments become action. Your cartoon companions keep you accountable.
                  <br />
                  <span className="text-indigo-800 font-semibold">Stop setting goals. Start forging them.</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/register"
                  className="ff-btn ff-btn-primary text-base px-8 py-3.5 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow: '0 6px 24px rgba(139,92,246,0.4)' }}>
                  <Zap className="w-5 h-5" fill="currentColor" />
                  Start Forging Free
                </Link>
                <a href="#how-it-works"
                  className="ff-btn ff-btn-outline text-base px-8 py-3.5 rounded-2xl">
                  See How It Works
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center gap-8 pt-2">
                {[['🏆', '500+', 'Goals Forged'], ['⚡', '94%', 'Success Rate'], ['🔥', '12k+', 'XP Earned']].map(([e, val, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-lg mb-0.5">{e}</div>
                    <div className="font-black text-xl text-indigo-900">{val}</div>
                    <div className="text-indigo-500 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3D Hero scene */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="relative h-[500px] lg:h-[620px] rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,rgba(219,234,254,0.6),rgba(237,233,254,0.6),rgba(252,231,243,0.6))',
                border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 20px 80px rgba(139,92,246,0.2)' }}>
              {/* ── Float Visual replaces 3D ── */}
              <HeroFloatVisual />
            </motion.div>
          </div>
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-indigo-400">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── CHARACTERS SECTION ── */}
      <section id="characters" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="ff-section-tag" style={{ background: 'linear-gradient(135deg,#ec4899,#f97316)', color: '#fff' }}>
              🎭 YOUR COMPANIONS
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-indigo-900 mt-2">
              Pick your focus hero.
            </h2>
            <p className="text-indigo-500 mt-3 text-lg max-w-2xl mx-auto">
              Your cartoon companion floats around your dashboard, celebrates your wins, and keeps you accountable.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CHARACTERS.map((c, i) => (
              <motion.div key={c.name} variants={fadeUp}
                className="ff-card ff-card-hover text-center p-5 cursor-pointer group"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {c.emoji}
                </div>
                <p className="font-bold text-indigo-900 text-sm">{c.name}</p>
                <p className="text-indigo-400 text-xs mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating emoji grid replaces 3D lineup */}
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mt-10 rounded-3xl overflow-hidden p-8 relative"
            style={{ background:'linear-gradient(135deg,rgba(219,234,254,0.7),rgba(237,233,254,0.7),rgba(252,231,243,0.7))', border:'2px solid rgba(255,255,255,0.9)', boxShadow:'0 12px 48px rgba(139,92,246,0.15)', minHeight:200 }}>
            <div className="flex flex-wrap justify-center gap-4">
              {CHARACTERS.map((c, i) => (
                <motion.div key={c.name}
                  animate={{ y:[0,-12,5,-8,0], rotate:[-3,3,-2,2,-3], scale:[1,1.06,0.96,1.04,1] }}
                  transition={{ duration:4+i*0.5, delay:i*0.3, repeat:Infinity, ease:'easeInOut' }}>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-4xl shadow-xl`}
                    style={{ boxShadow:`0 12px 32px rgba(0,0,0,0.15)` }}>
                    {c.emoji}
                  </div>
                  <p className="text-center text-xs font-bold text-indigo-700 mt-2">{c.name}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-700"
                style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(10px)' }}>
                🎨 Choose your companion during onboarding
              </span>
            </div>
          </motion.div>
        </div>
      </section>
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="ff-section-tag" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>
              ✨ FEATURES
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-indigo-900 mt-2">
              Built for builders.<br />Designed for discipline.
            </h2>
            <p className="text-indigo-500 mt-3 text-lg max-w-xl mx-auto">
              Every feature closes the gap between intention and execution.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}
                className="ff-card ff-card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-indigo-900 text-lg mb-2">{f.title}</h3>
                <p className="text-indigo-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="ff-section-tag" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: '#fff' }}>
              🗺️ HOW IT WORKS
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-indigo-900 mt-2">
              From goal to achievement<br />in four steps.
            </h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} variants={fadeUp} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 z-10 ml-2"
                    style={{ background: 'linear-gradient(90deg,rgba(139,92,246,0.4),transparent)' }} />
                )}
                <div className="ff-card p-6 h-full">
                  <div className="text-4xl mb-3">{step.emoji}</div>
                  <div className="text-3xl font-black mb-3 ff-text-gradient-candy">{step.step}</div>
                  <h3 className="font-bold text-indigo-900 text-base mb-2">{step.title}</h3>
                  <p className="text-indigo-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VERIFICATION ── */}
      <section id="verify" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="ff-section-tag" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#fff' }}>
              🔍 PROOF METHODS
            </span>
            <h2 className="text-4xl font-black text-indigo-900 mt-2">Real proof of real work.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Github, title: 'GitHub Verification', tag: 'Auto-verified ⚡', desc: 'Connect your repo. Study Forge checks your commit history automatically.', grad: 'from-slate-500 to-slate-700', bg: 'bg-slate-50' },
              { icon: Camera, title: 'Photo Proof',         tag: 'Visual evidence 📸', desc: 'Snap a photo of your work. Great for fitness, studying, and projects.', grad: 'from-violet-500 to-purple-700', bg: 'bg-violet-50' },
              { icon: PenLine,title: 'Manual Submission',   tag: 'Flexible ✍️',        desc: 'Write what you accomplished. Perfect for journaling and personal goals.', grad: 'from-emerald-500 to-teal-700', bg: 'bg-emerald-50' },
            ].map((v, i) => (
              <motion.div key={v.title} variants={fadeUp} className="ff-card ff-card-hover p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.grad} flex items-center justify-center mb-4 shadow-lg`}>
                  <v.icon className="w-7 h-7 text-white" />
                </div>
                <span className="ff-badge-purple text-xs">{v.tag}</span>
                <h3 className="font-bold text-indigo-900 text-lg mt-3 mb-2">{v.title}</h3>
                <p className="text-indigo-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ACCOUNTABILITY BANNER ── */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#4f46e5,#be185d)',
              boxShadow: '0 20px 80px rgba(109,40,217,0.35)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">
                  Why commitment beats<br />motivation every time.
                </h2>
                <p className="text-white/80 text-lg leading-relaxed mb-8">
                  Motivation is a feeling. Commitment is a decision you made when you were clear-headed. Your cartoon companions hold you to that decision — cheerfully.
                </p>
                <div className="space-y-3">
                  {[
                    'Behavioral economics: financial stakes increase follow-through by 3x',
                    'Proof-based accountability removes self-deception',
                    'Cartoon companions make discipline feel fun, not punishing',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users,     label: 'Active Forgers', val: '2,400+' },
                  { icon: Target,    label: 'Goals Created',  val: '18,500+' },
                  { icon: TrendingUp,label: 'Success Rate',   val: '91%' },
                  { icon: Clock,     label: 'Hours Tracked',  val: '120k+' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-5 text-center"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                    <stat.icon className="w-7 h-7 text-white/70 mx-auto mb-2" />
                    <div className="text-white font-black text-2xl">{stat.val}</div>
                    <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTES ── */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUOTES.map((q, i) => (
              <motion.div key={i} variants={fadeUp} className="ff-card p-6">
                <div className="text-3xl mb-3">{q.emoji}</div>
                <p className="text-indigo-700 text-sm leading-relaxed italic mb-4">"{q.text}"</p>
                <p className="text-indigo-400 text-xs font-medium">— {q.author}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEST MODE NOTICE ── */}
      <section className="py-6 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 rounded-2xl p-5"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.25)' }}>
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-amber-700 font-bold text-sm">TEST MODE — No Real Money</p>
              <p className="text-amber-600/70 text-xs mt-0.5">All payment amounts are simulated. Study Forge uses Stripe's test environment exclusively. Portfolio project only.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-4xl font-black text-indigo-900">Frequently Asked</h2>
            <p className="text-indigo-500 mt-3">Everything you need to know.</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="ff-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-indigo-900 font-semibold text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-6 pb-4">
                    <p className="text-indigo-600 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-5xl mb-6">🚀✨🏆</div>
            <h2 className="text-5xl lg:text-6xl font-black text-indigo-900 mb-5">
              Your focus journey<br />starts with one promise.
            </h2>
            <p className="text-indigo-500 text-lg mb-10 max-w-xl mx-auto">
              Stop planning. Stop waiting. Make one commitment today with your cartoon companion by your side.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)',
                boxShadow: '0 8px 40px rgba(139,92,246,0.4)' }}>
              <Zap className="w-6 h-6" fill="currentColor" />
              Start Forging — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 relative z-10"
        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
          borderTop: '1.5px solid rgba(139,92,246,0.15)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-indigo-800">Study Forge</span>
          </div>
          <p className="text-indigo-400 text-xs text-center">
            Forge Your Focus · Build Discipline · Keep Your Commitments<br />
            Built as a B.Tech CSE portfolio project. TEST MODE only — no real transactions.
          </p>
          <div className="flex gap-4 text-indigo-400 text-xs">
            <Link to="/login" className="hover:text-indigo-700 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-indigo-700 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
