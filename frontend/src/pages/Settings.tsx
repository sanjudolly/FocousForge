import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, Bell, Lock, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { Theme } from '../types';

const TABS = [
  { id:'profile',       label:'Profile',       icon:User,    emoji:'👤' },
  { id:'theme',         label:'Visual Theme',  icon:Palette, emoji:'🎨' },
  { id:'notifications', label:'Notifications', icon:Bell,    emoji:'🔔' },
  { id:'security',      label:'Security',      icon:Lock,    emoji:'🔐' },
];

const THEMES: { id:Theme; name:string; desc:string; emoji:string; grad:string }[] = [
  { id:'feminine',  name:'Blossom', desc:'Rose · Lavender · Purple',     emoji:'🌸', grad:'from-pink-400 via-purple-400 to-fuchsia-500' },
  { id:'masculine', name:'Apex',    desc:'Sky · Steel · Cyan',           emoji:'⚡', grad:'from-sky-400 via-blue-500 to-indigo-500' },
  { id:'neutral',   name:'Zenith',  desc:'Violet · Lime · Balance',      emoji:'✨', grad:'from-violet-400 via-indigo-500 to-purple-500' },
];

const INTERESTS = [
  { id:'coding',   emoji:'💻', label:'Coding'   },
  { id:'study',    emoji:'📚', label:'Study'    },
  { id:'fitness',  emoji:'💪', label:'Fitness'  },
  { id:'career',   emoji:'🚀', label:'Career'   },
  { id:'personal', emoji:'✨', label:'Personal' },
  { id:'other',    emoji:'🎯', label:'Other'    },
];

const NOTIF_LABELS: Record<string, string> = {
  goalCreated:'Goal created', deadlineApproaching:'Deadline approaching',
  proofSubmitted:'Proof submitted', proofVerified:'Proof verified',
  goalCompleted:'Goal completed', goalMissed:'Goal missed',
  streakMilestone:'Streak milestone', email:'Email notifications',
};

export default function Settings() {
  const { user, updateUser, setTheme } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [selTheme, setSelTheme] = useState<Theme>(user?.theme ?? 'neutral');
  const [notifPrefs, setNotifPrefs] = useState({ ...user?.notificationPrefs });
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name, interests });
      updateUser(res.data.user);
      toast.success('Profile saved! ✓');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const saveTheme = async (t: Theme) => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ theme: t });
      setTheme(t); setSelTheme(t);
      toast.success(`Theme changed to ${THEMES.find(x => x.id === t)?.name}! 🎨`);
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const saveNotifs = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ notificationPrefs: notifPrefs });
      updateUser({ notificationPrefs: notifPrefs as typeof user.notificationPrefs });
      toast.success('Preferences saved! ✓');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const changePwd = async () => {
    if (pwd.next !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    if (pwd.next.length < 8)     { toast.error('Min 8 characters');        return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success('Password updated! 🔐');
      setPwd({ current:'', next:'', confirm:'' });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#fffbeb 0%,#f5f3ff 50%,#ecfdf5 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float"
          style={{ background:'rgba(245,158,11,0.2)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float-slow"
          style={{ background:'rgba(139,92,246,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900">Settings ⚙️</h1>
          <p className="text-indigo-400 text-sm mt-1">Manage your profile, theme, and preferences</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={tab === t.id
                ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }
                : { background:'rgba(255,255,255,0.75)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.15)' }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            transition={{ duration:0.2 }}
            className="ff-card p-6 space-y-6">

            {/* PROFILE */}
            {tab === 'profile' && (
              <>
                <h2 className="font-bold text-xl text-indigo-900">Profile Information</h2>
                <div>
                  <label className="ff-form-label">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="ff-input" />
                </div>
                <div>
                  <label className="ff-form-label mb-3 block">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(item => (
                      <button key={item.id} onClick={() => toggle(item.id)} type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={interests.includes(item.id)
                          ? { background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }
                          : { background:'rgba(255,255,255,0.8)', color:'#4c1d95', border:'1.5px solid rgba(139,92,246,0.2)' }}>
                        {item.emoji} {item.label}
                        {interests.includes(item.id) && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="ff-btn ff-btn-primary">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Save Profile</>}
                </button>
              </>
            )}

            {/* THEME */}
            {tab === 'theme' && (
              <>
                <h2 className="font-bold text-xl text-indigo-900">Visual Theme</h2>
                <p className="text-indigo-400 text-sm">Choose the visual style that fits your energy.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => saveTheme(t.id)}
                      className="relative rounded-2xl p-5 text-center transition-all overflow-hidden hover:scale-[1.03]"
                      style={selTheme === t.id
                        ? { border:'2.5px solid rgba(139,92,246,0.5)', boxShadow:'0 8px 24px rgba(139,92,246,0.2)', background:'rgba(255,255,255,0.9)' }
                        : { border:'1.5px solid rgba(139,92,246,0.15)', background:'rgba(255,255,255,0.7)' }}>
                      {selTheme === t.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.grad} mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg`}>
                        {t.emoji}
                      </div>
                      <p className="font-bold text-indigo-900 text-base">{t.name}</p>
                      <p className="text-indigo-400 text-xs mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {tab === 'notifications' && (
              <>
                <h2 className="font-bold text-xl text-indigo-900">Notification Preferences</h2>
                <div className="space-y-3">
                  {Object.entries(NOTIF_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background:'rgba(139,92,246,0.05)', border:'1.5px solid rgba(139,92,246,0.1)' }}>
                      <span className="text-indigo-800 text-sm font-medium">{label}</span>
                      <button type="button"
                        onClick={() => setNotifPrefs(p => ({ ...p, [key]: !(p as Record<string,boolean>)[key] }))}
                        className="relative w-11 h-6 rounded-full transition-all"
                        style={{ background: (notifPrefs as Record<string,boolean>)[key] ? 'linear-gradient(135deg,#8b5cf6,#ec4899)' : 'rgba(139,92,246,0.15)' }}>
                        <div className="absolute w-4 h-4 bg-white rounded-full top-1 transition-all shadow-sm"
                          style={{ left: (notifPrefs as Record<string,boolean>)[key] ? '26px' : '4px' }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={saveNotifs} disabled={saving} className="ff-btn ff-btn-primary">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Save Preferences</>}
                </button>
              </>
            )}

            {/* SECURITY */}
            {tab === 'security' && (
              <>
                <h2 className="font-bold text-xl text-indigo-900">Change Password</h2>
                <div className="space-y-4">
                  {[
                    { label:'Current Password', key:'current', val:pwd.current },
                    { label:'New Password',      key:'next',    val:pwd.next    },
                    { label:'Confirm Password',  key:'confirm', val:pwd.confirm },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="ff-form-label">{f.label}</label>
                      <input type="password" value={f.val}
                        onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.label} className="ff-input" />
                    </div>
                  ))}
                </div>
                <button onClick={changePwd} disabled={saving} className="ff-btn ff-btn-primary">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={15} /> Update Password</>}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
