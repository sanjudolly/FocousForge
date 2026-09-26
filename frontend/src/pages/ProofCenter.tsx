import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Camera, PenLine, Upload, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { proofAPI, goalsAPI } from '../services/api';
import { Goal, Proof } from '../types';

const METHODS = [
  { id:'github', label:'GitHub Commits', icon:Github,  desc:'Auto-verified via commit history', grad:'from-slate-500 to-slate-700' },
  { id:'photo',  label:'Photo Proof',    icon:Camera,  desc:'Upload visual evidence',           grad:'from-violet-500 to-purple-700' },
  { id:'manual', label:'Manual Check-in',icon:PenLine, desc:'Write what you accomplished',      grad:'from-emerald-500 to-teal-700' },
];

const STATUS_CFG = {
  pending:  { icon:Clock,         bg:'rgba(245,158,11,0.12)',  color:'#b45309',  border:'rgba(245,158,11,0.25)',  label:'Pending'  },
  verified: { icon:CheckCircle,   bg:'rgba(16,185,129,0.12)',  color:'#047857',  border:'rgba(16,185,129,0.25)',  label:'Verified' },
  rejected: { icon:XCircle,       bg:'rgba(239,68,68,0.12)',   color:'#b91c1c',  border:'rgba(239,68,68,0.25)',   label:'Rejected' },
};

export default function ProofCenter() {
  const [searchParams] = useSearchParams();
  const [proofs, setProofs]     = useState<Proof[]>([]);
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [selGoal, setSelGoal]   = useState(searchParams.get('goalId') ?? '');
  const [method, setMethod]     = useState<'github'|'photo'|'manual'>('github');
  const [desc, setDesc]         = useState('');
  const [gh, setGh]             = useState({ username:'', repo:'', branch:'main' });
  const [file, setFile]         = useState<File|null>(null);
  const [preview, setPreview]   = useState('');
  const [showForm, setShowForm] = useState(!!searchParams.get('goalId'));
  const [loading, setLoading]   = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [pr, gr] = await Promise.all([proofAPI.getProofs(), goalsAPI.getGoals({ status:'active' })]);
      setProofs(pr.data.proofs);
      setGoals(gr.data.goals);
    } catch { toast.error('Could not load proof data'); }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    if (!selGoal)                                  { toast.error('Select a goal first'); return; }
    if (method === 'manual' && desc.length < 20)   { toast.error('Description needs 20+ chars'); return; }
    if (method === 'photo'  && !file)              { toast.error('Select an image'); return; }
    if (method === 'github' && (!gh.username || !gh.repo)) { toast.error('Fill GitHub username + repo'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('goalId', selGoal);
      fd.append('type', method);
      if (desc) fd.append('description', desc);
      if (method === 'github') {
        fd.append('githubUsername', gh.username);
        fd.append('githubRepo', gh.repo);
        fd.append('githubBranch', gh.branch);
      }
      if (method === 'photo' && file) fd.append('image', file);
      await proofAPI.submitProof(fd);
      toast.success('Proof submitted! 📸');
      setShowForm(false); setDesc(''); setFile(null); setPreview('');
      loadAll();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#fdf2f8 0%,#f5f3ff 45%,#ecfdf5 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-80 h-72 rounded-full blur-3xl opacity-30 animate-float"
          style={{ background:'rgba(236,72,153,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float-slow"
          style={{ background:'rgba(16,185,129,0.2)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900">Proof Center 📸</h1>
            <p className="text-indigo-400 text-sm mt-1">Submit and track your commitment proofs</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="ff-btn"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', boxShadow:'0 4px 14px rgba(139,92,246,0.3)' }}>
            <Upload className="w-4 h-4" /> Submit Proof
          </button>
        </div>

        {/* FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }} className="overflow-hidden">
              <div className="ff-card p-6 space-y-5">
                <h2 className="font-bold text-xl text-indigo-900">Submit New Proof ✍️</h2>

                {/* Goal select */}
                <div>
                  <label className="ff-form-label">Select Goal *</label>
                  <div className="relative">
                    <select value={selGoal} onChange={e => setSelGoal(e.target.value)}
                      className="ff-input appearance-none pr-10">
                      <option value="">Choose a goal...</option>
                      {goals.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 pointer-events-none" />
                  </div>
                </div>

                {/* Method tabs */}
                <div>
                  <label className="ff-form-label mb-3 block">Verification Method *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {METHODS.map(m => (
                      <button key={m.id} type="button" onClick={() => setMethod(m.id as typeof method)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 text-center"
                        style={method === m.id
                          ? { borderColor:'rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.08)' }
                          : { borderColor:'rgba(139,92,246,0.1)', background:'rgba(255,255,255,0.7)' }}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center`}>
                          <m.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className={`text-xs font-bold ${method === m.id ? 'text-violet-700' : 'text-indigo-500'}`}>{m.label}</p>
                        <p className="text-indigo-300 text-[10px]">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GitHub fields */}
                {method === 'github' && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><label className="ff-form-label">GitHub Username</label>
                      <input value={gh.username} onChange={e => setGh(p => ({...p,username:e.target.value}))} placeholder="octocat" className="ff-input" /></div>
                    <div><label className="ff-form-label">Repository</label>
                      <input value={gh.repo} onChange={e => setGh(p => ({...p,repo:e.target.value}))} placeholder="my-project" className="ff-input" /></div>
                    <div><label className="ff-form-label">Branch</label>
                      <input value={gh.branch} onChange={e => setGh(p => ({...p,branch:e.target.value}))} placeholder="main" className="ff-input" /></div>
                  </div>
                )}

                {/* Photo upload */}
                {method === 'photo' && (
                  <div>
                    <label className="ff-form-label mb-2 block">Upload Image *</label>
                    <label className="block cursor-pointer">
                      {preview ? (
                        <div className="relative rounded-2xl overflow-hidden">
                          <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-semibold">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all"
                          style={{ border:'2px dashed rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.04)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'; }}>
                          <Camera className="w-10 h-10 text-violet-300" />
                          <span className="text-violet-400 text-sm font-medium">Click to upload image</span>
                          <span className="text-violet-200 text-xs">JPG, PNG, WebP · max 5MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>
                  </div>
                )}

                {/* Description */}
                {(method === 'manual' || method === 'photo') && (
                  <div>
                    <label className="ff-form-label">
                      {method === 'manual' ? 'What did you accomplish? (min 20 chars) *' : 'Additional notes (optional)'}
                    </label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                      placeholder="Describe what you completed..."
                      className="ff-input resize-none" />
                    {method === 'manual' && (
                      <p className="text-violet-300 text-xs mt-1">{desc.length} / 20 minimum</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={submit} disabled={loading} className="ff-btn"
                    style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Upload className="w-4 h-4" /> Submit Proof</>}
                  </button>
                  <button onClick={() => setShowForm(false)} className="ff-btn ff-btn-outline">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <div>
          <h2 className="font-bold text-xl text-indigo-900 mb-4">Proof History 📋</h2>
          {proofs.length === 0 ? (
            <div className="ff-card text-center py-16">
              <div className="text-5xl mb-3">📸</div>
              <p className="text-indigo-400 text-sm">No proofs submitted yet. Start working toward your goals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proofs.map((proof, i) => {
                const cfg = STATUS_CFG[proof.status] ?? STATUS_CFG.pending;
                const Icon = cfg.icon;
                const goal = typeof proof.goalId === 'object' ? proof.goalId : null;
                return (
                  <motion.div key={proof._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                    className="ff-card p-4 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg, border:`1px solid ${cfg.border}` }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-indigo-900 font-semibold text-sm">{goal?.title ?? 'Goal'}</p>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-indigo-400 text-xs mt-0.5 capitalize">{proof.type} verification</p>
                      {proof.description && <p className="text-indigo-500 text-xs mt-1 line-clamp-2">{proof.description}</p>}
                      {proof.githubData && (
                        <a href={proof.githubData.commitUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 mt-1 transition-colors">
                          <Github className="w-3 h-3" />
                          {proof.githubData.username}/{proof.githubData.repo} — {proof.githubData.commitCount} commits
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proof.imageUrl && (
                        <img src={proof.imageUrl} alt="Proof" className="mt-2 h-20 rounded-xl object-cover" />
                      )}
                      <p className="text-indigo-300 text-xs mt-2">
                        {new Date(proof.submittedAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
