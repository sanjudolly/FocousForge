import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Shield, TrendingUp, Trophy, Zap, CheckCircle2, Users, DollarSign, Sparkles, ArrowRight, Star, Gem, Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import HeroScene from '../components/3d/HeroScene';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-hidden relative">
      <Navbar />

      {/* Background orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Floating decorative shapes */}
      <motion.div
        className="absolute top-32 left-[8%] w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 opacity-60 animate-float z-10 pointer-events-none"
        style={{ boxShadow: '0 0 30px rgba(244, 114, 182, 0.5)' }}
      />
      <motion.div
        className="absolute top-48 right-[12%] w-10 h-10 rotate-45 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 opacity-60 animate-float-delay-1 z-10 pointer-events-none"
        style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}
      />
      <motion.div
        className="absolute top-[28%] left-[15%] text-3xl animate-float-delay-2 z-10 pointer-events-none select-none"
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-[20%] right-[20%] text-2xl animate-float-delay-3 z-10 pointer-events-none select-none"
      >
        🦋
      </motion.div>
      <motion.div
        className="absolute bottom-[45%] left-[5%] text-2xl animate-float z-10 pointer-events-none select-none"
        style={{ animationDelay: '1.5s' }}
      >
        💎
      </motion.div>
      <motion.div
        className="absolute bottom-[55%] right-[8%] w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-70 animate-float-delay-2 z-10 pointer-events-none"
        style={{ boxShadow: '0 0 25px rgba(251, 191, 36, 0.6)' }}
      />
      <motion.div
        className="absolute top-[60%] left-[10%] text-xl animate-float-delay-1 z-10 pointer-events-none select-none"
      >
        🌟
      </motion.div>
      <motion.div
        className="absolute top-[72%] right-[15%] text-2xl animate-float-delay-3 z-10 pointer-events-none select-none"
      >
        🦄
      </motion.div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left: CTA Text + Buttons */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="relative z-10"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white/70">Stake. Commit. Achieve.</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                Turn Your Goals Into{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Skin in the Game
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed"
              >
                This platform helps you crush your goals by putting real money on the line.
                Commit financially, prove your progress, and earn rewards when you deliver.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]"
                >
                  Start Forging
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium border border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-xl"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['from-pink-400 to-rose-500', 'from-cyan-400 to-blue-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500'].map((g, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-slate-950 flex items-center justify-center text-xs font-bold`}
                      >
                        {['A', 'S', 'M', 'J'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-white/50">10k+ achievers</span>
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                  <span className="text-sm text-white/50 ml-1">4.9/5</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: 3D HeroScene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 rounded-3xl blur-2xl" />
              <div className="relative glass-card p-2 rounded-3xl border-white/10 overflow-hidden">
                <HeroScene theme="neutral" className="h-[500px] sm:h-[550px]" />
              </div>

              {/* Floating cards around hero scene */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-4 sm:-left-8 top-16 glass-card p-3 sm:p-4 rounded-2xl shadow-xl max-w-[160px] sm:max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">Goal Completed</span>
                </div>
                <p className="text-lg font-bold text-white">+$50</p>
                <p className="text-[10px] text-white/40">Fitness Goal · 30 days</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-2 sm:-right-6 bottom-20 glass-card p-3 sm:p-4 rounded-2xl shadow-xl max-w-[160px] sm:max-w-[190px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">XP Earned</span>
                </div>
                <p className="text-lg font-bold text-white">+2,450 XP</p>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide uppercase mb-4">
              Why Commit With Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Built for Those Who{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                Actually Deliver
              </span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              No more empty New Year resolutions. Combine financial incentives with
              gamified accountability to build real momentum.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Target,
                title: 'Smart Goal Staking',
                desc: 'Put money on the line for every goal you set. Higher stakes = higher motivation.',
                gradient: 'from-indigo-500 to-blue-600',
                glow: 'shadow-indigo-500/20',
              },
              {
                icon: Shield,
                title: 'Proof Verification',
                desc: 'Submit photo & video proof. Community + AI verification keeps everyone honest.',
                gradient: 'from-emerald-500 to-teal-600',
                glow: 'shadow-emerald-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Progress Analytics',
                desc: 'Track streaks, win rates, and compounding habits with beautiful dashboards.',
                gradient: 'from-amber-500 to-orange-600',
                glow: 'shadow-amber-500/20',
              },
              {
                icon: Trophy,
                title: 'Rewards & XP',
                desc: 'Earn XP, unlock achievements, and collect rare badges for every victory.',
                gradient: 'from-fuchsia-500 to-pink-600',
                glow: 'shadow-fuchsia-500/20',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`group glass-card glass-card-hover p-6 sm:p-8 relative overflow-hidden ${feature.glow}`}
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
                />
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2.5 text-white">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Three Simple Steps to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Unstoppable Progress
              </span>
            </h2>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {[
                {
                  step: '01',
                  title: 'Set Your Goal',
                  desc: 'Define a specific goal with a clear deadline. Choose how much you want to stake — it\'s your skin in the game.',
                  icon: Target,
                  gradient: 'from-violet-500 to-indigo-600',
                },
                {
                  step: '02',
                  title: 'Prove Your Progress',
                  desc: 'Upload photo or video proof of your daily/weekly check-ins. Verification keeps you accountable.',
                  icon: Shield,
                  gradient: 'from-cyan-500 to-blue-600',
                },
                {
                  step: '03',
                  title: 'Win & Earn Rewards',
                  desc: 'Crush your goal to get your stake back plus bonus rewards. Fail, and your stake funds the community pool.',
                  icon: Gem,
                  gradient: 'from-pink-500 to-rose-600',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="relative"
                >
                  <div className="glass-card p-8 rounded-3xl h-full relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-500">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="text-6xl font-black text-white/5 mb-6 select-none">
                      {item.step}
                    </div>
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats / Testimonials Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-8 sm:p-12 mb-20 relative overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: '$2.4M+', label: 'Staked & Returned', icon: DollarSign, gradient: 'from-emerald-400 to-teal-500' },
                { value: '12,500+', label: 'Goals Completed', icon: Target, gradient: 'from-violet-400 to-indigo-500' },
                { value: '89%', label: 'Success Rate', icon: TrendingUp, gradient: 'from-amber-400 to-orange-500' },
                { value: '10K+', label: 'Active Forgers', icon: Users, gradient: 'from-pink-400 to-rose-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Committed{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Goal Crushers
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                name: 'Alex Morgan',
                role: 'Software Engineer',
                avatar: 'AM',
                avatarGradient: 'from-blue-400 to-indigo-600',
                text: 'I tried 5 productivity apps before this app. The financial stake changed everything — I hit my coding streak of 90 days and earned back double!',
                rating: 5,
                highlight: '90-day streak',
              },
              {
                name: 'Sarah Chen',
                role: 'Fitness Coach',
                avatar: 'SC',
                avatarGradient: 'from-pink-400 to-rose-600',
                text: 'Staking $200 on my fitness goal was the best decision. I actually looked forward to workouts. Proof verification kept me honest even on bad days.',
                rating: 5,
                highlight: 'Lost 18 lbs',
              },
              {
                name: 'Marcus Rivera',
                role: 'Startup Founder',
                avatar: 'MR',
                avatarGradient: 'from-amber-400 to-orange-600',
                text: 'This platform helped me launch 3 side projects this year. The XP system and achievements tap into my competitive side perfectly. Highly recommend!',
                rating: 5,
                highlight: '3 projects shipped',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card glass-card-hover p-7 rounded-3xl h-full flex flex-col"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/70 leading-relaxed mb-6 flex-1">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center font-bold text-sm shadow-lg`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-violet-300 font-medium whitespace-nowrap">
                    {t.highlight}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 opacity-90" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-black/20 blur-3xl" />
            <div className="absolute top-10 left-10 text-4xl animate-float select-none">✨</div>
            <div className="absolute top-20 right-16 text-3xl animate-float-delay-1 select-none">🚀</div>
            <div className="absolute bottom-12 left-20 text-3xl animate-float-delay-2 select-none">💫</div>
            <div className="absolute bottom-16 right-24 text-2xl animate-float-delay-3 select-none">🎯</div>

            <div className="relative px-8 sm:px-12 lg:px-20 py-16 sm:py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Heart className="w-4 h-4 text-pink-200" fill="currentColor" />
                <span className="text-sm font-semibold text-white/90">Join 10,000+ committed achievers</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight"
              >
                Ready to Forge Your Best Self?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Your future self is waiting. Create your first goal today — stake as little as $10,
                and start building the momentum you deserve.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-lg bg-white text-indigo-700 hover:bg-white/95 shadow-2xl shadow-black/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-black/30"
                >
                  <Zap className="w-5 h-5" fill="currentColor" />
                  Start Forging Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white/90 hover:text-white border border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Already have an account? Login
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                No credit card required to start · Cancel anytime
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Study Forge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <span>© 2025 Study Forge. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-white/40">
              <span className="text-sm hover:text-white/60 cursor-pointer transition-colors">Terms</span>
              <span className="text-sm hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
              <span className="text-sm hover:text-white/60 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
