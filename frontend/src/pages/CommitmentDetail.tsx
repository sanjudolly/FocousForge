import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, CircleDot, Camera, Upload, Loader2,
  IndianRupee, Heart, Trophy, Clock, RefreshCw, Zap, AlertCircle,
  FileText, Github, PenLine, Sparkles as SparkIcon, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { commitmentAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Commitment, TimelineEntry } from '../types';
import CommitmentVault from '../components/3d/CommitmentVault';
import { differenceInHours, differenceInDays } from 'date-fns';

type VaultState = 'locked' | 'progress' | 'unlocked' | 'claimed' | 'missed';

function getVaultState(c: Commitment): VaultState {
  if (c.status === 'claimed') return 'claimed';
  if (c.status === 'missed' || c.status === 'charity_outcome') return 'missed';
  if (c.status === 'eligible_claim') return 'unlocked';
  const done = c.tasks.filter(t => t.completed).length;
  if (done > 0) return 'progress';
  return 'locked';
}

const PROOF_LABEL: Record<string, string> = {
  not_submitted: 'Not Submitted',
  submitted:     'Submitted — awaiting review',
  under_review:  'Under Review',
  verified:      'Verified ✓',
  rejected:      'Rejected ✗',
};
const PROOF_COLOR: Record<string, string> = {
  not_submitted: '#94a3b8',
  submitted:     '#818cf8',
  under_review:  '#f59e0b',
  verified:      '#10b981',
  rejected:      '#ef4444',
};

const VERIFY_ICON: Record<string, typeof Camera> = {
  photo: Camera, document: FileText, github: Github, manual: PenLine,
};

export default function CommitmentDetail() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { updateUser } = useAuthStore();
  const fileRef    = useRef<HTMLInputElement>(null);

  const [c,         setC]         = useState<Commitment | null>(null);
  const [timeline,  setTimeline]  = useState<TimelineEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [actionLoading, setAL]    = useState('');
  const [showProof, setShowProof] = useState(false);
  const [proofDesc, setProofDesc] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPrev, setProofPrev] = useState('');
  const [ghUser,    setGhUser]    = useState('');
  const [ghRepo,    setGhRepo]    = useState('');
  const [ghBranch,  setGhBranch]  = useState('main');
  const [claimConfirm, setCC]     = useState(false);
  const [celebrated,   setCeleb]  = useState(false);

  /* ── Load commitment + timeline ── */
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cr, tr] = await Promise.all([
        commitmentAPI.getCommitment(id),
        commitmentAPI.getTimeline(id),
      ]);
      setC(cr.data.commitment);
      setTimeline(tr.data.timeline);
    } catch {
      toast.error('Could not load commitment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ── Toggle task ── */
  const toggleTask = async (taskId: string) => {
    if (!id || !c || c.status !== 'active') return;
    setAL(taskId);
    try {
      const r = await commitmentAPI.completeTask(id, taskId);
      setC(r.data.commitment);
      const isDone = r.data.commitment.tasks.find((t: { _id: string }) => t._id === taskId)?.completed;
      toast.success(isDone ? '✅ Task completed!' : 'Task unchecked');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setAL('');
    }
  };

  /* ── File change for proof upload ── */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    const reader = new FileReader();
    reader.onload = ev => setProofPrev(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  /* ── Submit proof ── */
  const submitProof = async () => {
    if (!id || !c) return;
    if (c.verificationType === 'manual' && proofDesc.length < 20) {
      toast.error('Please write at least 20 characters describing your work');
      return;
    }
    if ((c.verificationType === 'photo' || c.verificationType === 'document') && !proofFile) {
      toast.error(`Please select a ${c.verificationType} file to upload`);
      return;
    }
    if (c.verificationType === 'github' && (!ghUser || !ghRepo)) {
      toast.error('Please enter your GitHub username and repository name');
      return;
    }

    setAL('proof');
    try {
      const fd = new FormData();
      if (proofDesc) fd.append('description', proofDesc);
      if (c.verificationType === 'github') {
        fd.append('githubUsername', ghUser);
        fd.append('githubRepo',     ghRepo);
        fd.append('githubBranch',   ghBranch);
      }
      if ((c.verificationType === 'photo' || c.verificationType === 'document') && proofFile) {
        fd.append('file', proofFile);
      }
      const r = await commitmentAPI.submitProof(id, fd);
      setC(r.data.commitment);
      setShowProof(false);
      setProofDesc(''); setProofFile(null); setProofPrev('');
      await load();

      if (r.data.commitment.proofStatus === 'verified') {
        toast.success('🎉 Proof auto-verified! Check eligibility below.');
      } else {
        toast.success('📸 Proof submitted successfully!');
      }
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Proof submission failed'
      );
    } finally {
      setAL('');
    }
  };

  /* ── Self-verify (demo mode) ── */
  const selfVerify = async () => {
    if (!id) return;
    setAL('verify');
    try {
      await commitmentAPI.verifyProof(id, { status: 'verified' });
      toast.success('✅ Proof verified! Check eligibility below.');
      await load();
    } catch {
      toast.error('Verification failed');
    } finally {
      setAL('');
    }
  };

  /* ── CLAIM ── */
  const claim = async () => {
    if (!id) return;
    setAL('claim');
    try {
      const r = await commitmentAPI.claim(id);
      setC(r.data.commitment);
      setCC(false);
      setCeleb(true);
      if (r.data.user) updateUser(r.data.user);
      toast.success(`🎉 Claimed ₹${r.data.commitment.amount.toLocaleString('en-IN')}! +${r.data.xpEarned} XP`);
      await load();
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Claim failed — please check eligibility'
      );
    } finally {
      setAL('');
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#ecfdf5)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-violet-500 text-sm font-semibold">Loading commitment...</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!c) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
        <div className="ff-card text-center p-10 max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-black text-indigo-900 mb-3">Commitment not found</h2>
          <Link to="/commitments" className="ff-btn ff-btn-primary">← Back to Commitments</Link>
        </div>
      </div>
    );
  }

  const done     = c.tasks.filter(t => t.completed).length;
  const total    = c.tasks.length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const vState   = getVaultState(c);
  const daysLeft = differenceInDays(new Date(c.deadline), new Date());
  const hrsLeft  = differenceInHours(new Date(c.deadline), new Date());
  const isEligible = c.status === 'eligible_claim';
  const allTasksDone = total > 0 && done === total;
  const proofOk    = c.proofStatus === 'verified';
  const VIcon      = VERIFY_ICON[c.verificationType] ?? PenLine;

  return (
    <div className="min-h-screen pb-16"
      style={{ background: 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#ecfdf5 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float"
          style={{ background: 'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-60 rounded-full blur-3xl opacity-20 animate-float-slow"
          style={{ background: 'rgba(16,185,129,0.18)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Back link */}
        <Link to="/commitments"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-700 transition-colors text-sm mb-5 font-medium">
          <ArrowLeft size={15} /> Back to Commitments
        </Link>

        {/* ── CELEBRATION BANNER ── */}
        <AnimatePresence>
          {(c.status === 'claimed' || celebrated) && (
            <motion.div initial={{ opacity:0, scale:0.9, y:-10 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0 }}
              className="ff-card p-6 mb-6 text-center"
              style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(16,185,129,0.12))', border:'2px solid rgba(16,185,129,0.35)' }}>
              <div className="text-5xl mb-3 animate-bounce-gentle">🎉🏆🎉</div>
              <h2 className="text-2xl font-black text-indigo-900 mb-1">You completed your commitment!</h2>
              <p className="text-emerald-700 font-semibold">
                Your focus paid off. ₹{c.amount.toLocaleString('en-IN')} commitment claimed successfully. +{c.xpReward} XP earned.
              </p>
              <Link to="/commitments" className="ff-btn ff-btn-mint inline-flex mt-4">
                View All Commitments →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CLAIM ELIGIBLE BANNER (prominent) ── */}
        {isEligible && !celebrated && (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="ff-card p-6 mb-6"
            style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(52,211,153,0.08))', border:'2.5px solid rgba(16,185,129,0.4)', boxShadow:'0 8px 32px rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-4xl animate-bounce-gentle flex-shrink-0">🎉</div>
              <div className="flex-1">
                <p className="font-black text-xl text-emerald-900">You're eligible to claim your money!</p>
                <p className="text-emerald-600 text-sm mt-1">All tasks completed ✓ and proof verified ✓. Your ₹{c.amount.toLocaleString('en-IN')} is ready to claim.</p>
              </div>
              {!claimConfirm ? (
                <button onClick={() => setCC(true)}
                  className="ff-btn text-base px-6 py-3 flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', boxShadow:'0 4px 20px rgba(16,185,129,0.5)' }}>
                  <Trophy size={18} /> Claim ₹{c.amount.toLocaleString('en-IN')}
                </button>
              ) : (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <p className="text-emerald-700 text-xs font-semibold">TEST MODE — confirm to proceed:</p>
                  <div className="flex gap-2">
                    <button onClick={claim} disabled={actionLoading === 'claim'}
                      className="ff-btn px-5 py-2.5"
                      style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff' }}>
                      {actionLoading === 'claim'
                        ? <Loader2 size={15} className="animate-spin" />
                        : <><CheckCircle2 size={15} /> Confirm Claim</>}
                    </button>
                    <button onClick={() => setCC(false)} className="ff-btn ff-btn-outline px-4 py-2.5">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── WHAT TO DO NEXT banner (active, not eligible yet) ── */}
        {c.status === 'active' && !isEligible && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="ff-card p-4 mb-5 flex items-center gap-3 flex-wrap"
            style={{ background:'rgba(139,92,246,0.05)', border:'1.5px solid rgba(139,92,246,0.15)' }}>
            <div className="text-xl">💡</div>
            <div className="flex-1">
              <p className="font-bold text-indigo-800 text-sm">How to claim your ₹{c.amount.toLocaleString('en-IN')}</p>
              <p className="text-indigo-500 text-xs mt-0.5">
                {!allTasksDone && !proofOk && 'Complete all tasks below AND submit verified proof'}
                {!allTasksDone && proofOk  && 'Complete remaining tasks to become eligible'}
                {allTasksDone  && !proofOk && 'Submit your proof to become eligible to claim'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${allTasksDone ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-400 bg-indigo-50'}`}>
                {allTasksDone ? <CheckCircle2 size={12}/> : <CircleDot size={12}/>} Tasks {done}/{total}
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${proofOk ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-400 bg-indigo-50'}`}>
                {proofOk ? <CheckCircle2 size={12}/> : <CircleDot size={12}/>} Proof
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT: main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Goal header card */}
            <div className="ff-card p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="ff-badge-purple capitalize">{c.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{
                    background: {
                      active: 'rgba(99,102,241,0.1)', eligible_claim: 'rgba(16,185,129,0.12)',
                      claimed: 'rgba(245,158,11,0.12)', missed: 'rgba(239,68,68,0.1)', charity_outcome: 'rgba(236,72,153,0.1)'
                    }[c.status],
                    color: {
                      active: '#4338ca', eligible_claim: '#047857', claimed: '#b45309',
                      missed: '#b91c1c', charity_outcome: '#be185d'
                    }[c.status],
                  }}>
                  {{ active:'🎯 Active', eligible_claim:'🎉 Ready to Claim!', claimed:'🏆 Claimed', missed:'😔 Missed', charity_outcome:'💝 Charity Outcome' }[c.status]}
                </span>
              </div>
              <h1 className="text-2xl font-black text-indigo-900 mb-2">{c.title}</h1>
              <p className="text-indigo-500 text-sm leading-relaxed">{c.description}</p>
              <div className="flex items-center gap-4 mt-4 flex-wrap text-sm">
                <span className={`flex items-center gap-1 font-semibold ${hrsLeft < 0 ? 'text-red-500' : hrsLeft < 24 ? 'text-orange-500' : 'text-indigo-500'}`}>
                  <Clock size={14} />
                  {hrsLeft < 0 ? 'Deadline passed' : daysLeft > 1 ? `${daysLeft} days left` : `${hrsLeft} hours left`}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-black">
                  <IndianRupee size={14} /> {c.amount.toLocaleString('en-IN')} committed
                </span>
                <span className="flex items-center gap-1 text-pink-500 text-xs font-medium">
                  <Heart size={12} /> Charity: {c.charityName}
                </span>
              </div>
            </div>

            {/* Tasks card */}
            <div className="ff-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-indigo-900 text-lg">
                  Tasks &nbsp;
                  <span className="text-sm font-semibold text-indigo-400">({done}/{total} done)</span>
                </h2>
                <span className="font-black text-lg" style={{ color: pct === 100 ? '#10b981' : '#8b5cf6' }}>{pct}%</span>
              </div>

              <div className="ff-progress-track mb-5">
                <motion.div className="ff-progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9 }}
                  style={{ background: pct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
              </div>

              <div className="space-y-2">
                {c.tasks.map(task => (
                  <button key={task._id}
                    onClick={() => toggleTask(task._id)}
                    disabled={c.status !== 'active' || actionLoading === task._id}
                    className="flex items-center gap-3 p-3.5 rounded-xl w-full text-left transition-all group"
                    style={{
                      background: task.completed ? 'rgba(16,185,129,0.08)' : 'rgba(139,92,246,0.04)',
                      border:     task.completed ? '1.5px solid rgba(16,185,129,0.25)' : '1.5px solid rgba(139,92,246,0.1)',
                      cursor:     c.status !== 'active' ? 'default' : 'pointer',
                    }}>
                    {actionLoading === task._id
                      ? <Loader2 size={17} className="text-violet-400 animate-spin flex-shrink-0" />
                      : task.completed
                        ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
                        : <CircleDot    size={17} className="text-indigo-200 flex-shrink-0 group-hover:text-violet-400 transition-colors" />}
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-indigo-300' : 'text-indigo-700'}`}>
                      {task.title}
                    </span>
                    {c.status === 'active' && !task.completed && (
                      <span className="ml-auto text-[10px] text-indigo-300 group-hover:text-violet-400 transition-colors">click to complete</span>
                    )}
                  </button>
                ))}
              </div>

              {c.status === 'active' && (
                <p className="text-indigo-300 text-xs mt-3 text-center">
                  Click any task to toggle it. Complete all {total} tasks to progress towards claiming.
                </p>
              )}
            </div>

            {/* Proof card */}
            <div className="ff-card p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                    <VIcon size={18} className="text-violet-500" />
                    Proof of Completion
                  </h2>
                  <p className="text-sm mt-1 font-semibold" style={{ color: PROOF_COLOR[c.proofStatus] }}>
                    {PROOF_LABEL[c.proofStatus]}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Submit proof button — show when active + not submitted/verified */}
                  {c.status === 'active' && ['not_submitted', 'rejected'].includes(c.proofStatus) && (
                    <button onClick={() => { setShowProof(true); }}
                      className="ff-btn text-sm py-2 px-4"
                      style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                      <Upload size={14} /> {c.proofStatus === 'rejected' ? 'Resubmit Proof' : 'Submit Proof'}
                    </button>
                  )}
                  {/* Demo verify button — for submitted/under_review */}
                  {c.status === 'active' && ['submitted', 'under_review'].includes(c.proofStatus) && (
                    <button onClick={selfVerify} disabled={actionLoading === 'verify'}
                      className="ff-btn ff-btn-mint text-sm py-2 px-4 disabled:opacity-50">
                      {actionLoading === 'verify'
                        ? <Loader2 size={14} className="animate-spin" />
                        : <><CheckCircle2 size={14} /> Mark Verified (Demo)</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {c.proofStatus === 'rejected' && c.proofRejectionReason && (
                <div className="mb-4 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-red-600 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle size={14} /> Rejected: {c.proofRejectionReason}
                  </p>
                  <p className="text-red-400 text-xs mt-1">Please resubmit with better proof.</p>
                </div>
              )}

              {/* Existing proof display */}
              {c.proofImageUrl && (
                <img src={c.proofImageUrl} alt="Proof" className="w-full max-h-52 object-cover rounded-xl mb-3 border border-violet-100" />
              )}
              {c.proofDescription && (
                <div className="p-4 rounded-xl mb-3" style={{ background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.12)' }}>
                  <p className="text-indigo-700 text-sm leading-relaxed">{c.proofDescription}</p>
                </div>
              )}
              {c.proofGithubData && (
                <a href={c.proofGithubData.commitUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm font-medium transition-colors mb-3">
                  <Github size={14} />
                  {c.proofGithubData.username}/{c.proofGithubData.repo} — {c.proofGithubData.commitCount} commit(s) →
                </a>
              )}

              {/* Proof submission form */}
              <AnimatePresence>
                {showProof && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                    exit={{ opacity:0, height:0 }}
                    className="space-y-4 pt-4 mt-2 border-t-2 border-violet-100 overflow-hidden">
                    <h3 className="font-bold text-indigo-800">
                      {c.proofStatus === 'rejected' ? '🔄 Resubmit Proof' : '📸 Submit Your Proof'}
                    </h3>

                    {/* Photo / Document upload */}
                    {(c.verificationType === 'photo' || c.verificationType === 'document') && (
                      <label className="block cursor-pointer">
                        {proofPrev ? (
                          <div className="relative rounded-xl overflow-hidden">
                            <img src={proofPrev} alt="Preview" className="w-full h-44 object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-lg">Change file</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-36 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
                            style={{ border:'2.5px dashed rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.03)' }}>
                            <Camera size={28} className="text-violet-300" />
                            <span className="text-violet-400 text-sm font-medium">Click to upload {c.verificationType}</span>
                            <span className="text-indigo-300 text-xs">JPG, PNG, PDF · max 5MB</span>
                          </div>
                        )}
                        <input type="file" ref={fileRef}
                          accept={c.verificationType === 'document' ? '.pdf,.doc,.docx,image/*' : 'image/*'}
                          onChange={onFileChange} className="hidden" />
                      </label>
                    )}

                    {/* GitHub fields */}
                    {c.verificationType === 'github' && (
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="ff-form-label">GitHub Username *</label>
                          <input value={ghUser} onChange={e => setGhUser(e.target.value)}
                            placeholder="octocat" className="ff-input" />
                        </div>
                        <div>
                          <label className="ff-form-label">Repository *</label>
                          <input value={ghRepo} onChange={e => setGhRepo(e.target.value)}
                            placeholder="my-project" className="ff-input" />
                        </div>
                        <div>
                          <label className="ff-form-label">Branch</label>
                          <input value={ghBranch} onChange={e => setGhBranch(e.target.value)}
                            placeholder="main" className="ff-input" />
                        </div>
                      </div>
                    )}

                    {/* Description field */}
                    {(c.verificationType === 'manual' || c.verificationType === 'photo' || c.verificationType === 'document') && (
                      <div>
                        <label className="ff-form-label">
                          {c.verificationType === 'manual'
                            ? 'What did you accomplish? (minimum 20 characters) *'
                            : 'Additional notes (optional)'}
                        </label>
                        <textarea value={proofDesc} onChange={e => setProofDesc(e.target.value)} rows={4}
                          placeholder="Describe what you completed and how it relates to your goal..."
                          className="ff-input resize-none" />
                        {c.verificationType === 'manual' && (
                          <p className={`text-xs mt-1 font-medium ${proofDesc.length >= 20 ? 'text-emerald-500' : 'text-violet-400'}`}>
                            {proofDesc.length}/20 minimum characters {proofDesc.length >= 20 ? '✓' : ''}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={submitProof} disabled={actionLoading === 'proof'}
                        className="ff-btn disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff' }}>
                        {actionLoading === 'proof'
                          ? <Loader2 size={14} className="animate-spin" />
                          : <><Upload size={14} /> Submit Proof</>}
                      </button>
                      <button onClick={() => { setShowProof(false); setProofDesc(''); setProofFile(null); setProofPrev(''); }}
                        className="ff-btn ff-btn-outline">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proof verified — no action needed */}
              {c.proofStatus === 'verified' && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                  style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-700 text-sm font-semibold">
                    Proof verified! {isEligible ? 'You can now claim your commitment above.' : 'Complete all tasks to become eligible.'}
                  </p>
                </div>
              )}
            </div>

            {/* Missed / Charity outcome */}
            {(c.status === 'missed' || c.status === 'charity_outcome') && (
              <div className="ff-card p-6"
                style={{ background:'rgba(236,72,153,0.05)', border:'1.5px solid rgba(236,72,153,0.2)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">😔</div>
                  <div>
                    <h3 className="font-black text-indigo-900">Commitment Missed</h3>
                    <p className="text-pink-600 text-sm">Deadline passed without completing all requirements.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ background:'rgba(236,72,153,0.08)', border:'1px solid rgba(236,72,153,0.15)' }}>
                  <p className="text-pink-700 font-semibold text-sm flex items-center gap-2">
                    <Heart size={14} /> TEST MODE Charity Outcome Recorded
                  </p>
                  <p className="text-pink-500 text-xs mt-1">
                    ₹{c.amount.toLocaleString('en-IN')} simulated charity outcome for {c.charityName}. No real money was donated.
                  </p>
                </div>
                <p className="text-indigo-400 text-xs mt-3">
                  Every commitment missed is a lesson. Create a new one and try again!
                </p>
                <Link to="/commitments/new"
                  className="ff-btn ff-btn-candy inline-flex mt-4 text-sm">
                  + Create New Commitment
                </Link>
              </div>
            )}
          </div>

          {/* ── RIGHT: vault + stats + timeline ── */}
          <div className="space-y-5">

            {/* Vault visual */}
            <div className="ff-card p-4 text-center">
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-2">Commitment Crystal</p>
              <CommitmentVault state={vState} progress={pct} amount={c.amount} height={200} />
              <p className="text-xs text-indigo-400 mt-2 font-medium">
                {{
                  locked:   '🔒 Complete tasks + submit proof to unlock',
                  progress: `⚡ ${done}/${total} tasks done — keep going!`,
                  unlocked: '✅ Unlocked — ready to claim above!',
                  claimed:  '🏆 Claimed! Well done.',
                  missed:   '😔 Deadline passed without completion.',
                }[vState]}
              </p>
            </div>

            {/* Stats */}
            <div className="ff-card p-5">
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-3">Details</p>
              <div className="space-y-3">
                {[
                  { label:'Amount',     value:`₹${c.amount.toLocaleString('en-IN')}`, color:'#10b981' },
                  { label:'XP Reward',  value:`+${c.xpReward} XP`,                    color:'#8b5cf6' },
                  { label:'Method',     value: c.verificationType,                    color:'#6366f1' },
                  { label:'Charity',    value: c.charityName.split(' ').slice(0,3).join(' '), color:'#ec4899' },
                  { label:'Deadline',   value: new Date(c.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}), color:'#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-1 border-b border-indigo-50 last:border-0">
                    <span className="text-indigo-400 text-xs font-medium">{s.label}</span>
                    <span className="text-xs font-bold capitalize" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="ff-card p-5">
              <h3 className="font-bold text-indigo-900 text-sm mb-4">Progress Timeline</h3>
              <div className="space-y-4">
                {timeline.map(entry => (
                  <div key={entry.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-all ${entry.done ? 'text-white shadow-sm' : 'text-indigo-200'}`}
                      style={entry.done
                        ? { background:'linear-gradient(135deg,#8b5cf6,#10b981)' }
                        : { background:'rgba(139,92,246,0.1)' }}>
                      {entry.done ? <CheckCircle2 size={13} /> : entry.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${entry.done ? 'text-indigo-800' : 'text-indigo-300'}`}>
                        {entry.label}
                      </p>
                      {entry.date && (
                        <p className="text-indigo-200 text-[10px] mt-0.5">
                          {new Date(entry.date).toLocaleDateString('en-IN', {
                            day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
