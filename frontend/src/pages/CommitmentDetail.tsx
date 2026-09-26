import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, CircleDot, Camera, Upload, Loader2,
  IndianRupee, Heart, Trophy, Clock, RefreshCw, Zap, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { commitmentAPI } from '../services/api';
import { Commitment, TimelineEntry } from '../types';
import CommitmentVault from '../components/3d/CommitmentVault';
import { differenceInHours, differenceInDays } from 'date-fns';

type VaultState = 'locked' | 'progress' | 'unlocked' | 'claimed' | 'missed';

function getVaultState(c: Commitment): VaultState {
  if (c.status === 'claimed')  return 'claimed';
  if (c.status === 'missed' || c.status === 'charity_outcome') return 'missed';
  if (c.status === 'eligible_claim') return 'unlocked';
  const done  = c.tasks.filter(t=>t.completed).length;
  if (done > 0) return 'progress';
  return 'locked';
}

function getProgress(c: Commitment) {
  const done = c.tasks.filter(t=>t.completed).length;
  return c.tasks.length > 0 ? Math.round((done/c.tasks.length)*100) : 0;
}

const PROOF_LABEL: Record<string,string> = {
  not_submitted:'Not Submitted', submitted:'Submitted', under_review:'Under Review',
  verified:'Verified ✓', rejected:'Rejected ✗',
};
const PROOF_COLOR: Record<string,string> = {
  not_submitted:'#94a3b8', submitted:'#818cf8', under_review:'#f59e0b',
  verified:'#10b981', rejected:'#ef4444',
};

export default function CommitmentDetail() {
  const { id }   = useParams<{ id:string }>();
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [c,         setC]         = useState<Commitment | null>(null);
  const [timeline,  setTimeline]  = useState<TimelineEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [actionLoading, setAL]    = useState('');
  const [showProof, setShowProof] = useState(false);
  const [proofDesc, setProofDesc] = useState('');
  const [proofFile, setProofFile] = useState<File|null>(null);
  const [proofPreview, setPreview]= useState('');
  const [ghUser,    setGhUser]    = useState('');
  const [ghRepo,    setGhRepo]    = useState('');
  const [ghBranch,  setGhBranch]  = useState('main');
  const [claimStep, setClaimStep] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cr, tr] = await Promise.all([
        commitmentAPI.getCommitment(id),
        commitmentAPI.getTimeline(id),
      ]);
      setC(cr.data.commitment);
      setTimeline(tr.data.timeline);
    } catch { toast.error('Could not load commitment'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const toggleTask = async (taskId: string) => {
    if (!id || !c || c.status !== 'active') return;
    setAL(taskId);
    try {
      const r = await commitmentAPI.completeTask(id, taskId);
      setC(r.data.commitment);
      toast.success(r.data.commitment.tasks.find((t: {_id:string}) => t._id === taskId)?.completed ? 'Task completed! ✅' : 'Task unchecked');
    } catch { toast.error('Failed'); }
    finally { setAL(''); }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const submitProof = async () => {
    if (!id || !c) return;
    if (c.verificationType === 'manual' && proofDesc.length < 20) { toast.error('Write at least 20 characters'); return; }
    if ((c.verificationType === 'photo' || c.verificationType === 'document') && !proofFile) { toast.error('Please select a file'); return; }
    if (c.verificationType === 'github' && (!ghUser || !ghRepo)) { toast.error('Enter GitHub username and repo'); return; }
    setAL('proof');
    try {
      const fd = new FormData();
      if (proofDesc) fd.append('description', proofDesc);
      if (c.verificationType === 'github') { fd.append('githubUsername', ghUser); fd.append('githubRepo', ghRepo); fd.append('githubBranch', ghBranch); }
      if ((c.verificationType === 'photo' || c.verificationType === 'document') && proofFile) fd.append('file', proofFile);
      const r = await commitmentAPI.submitProof(id, fd);
      setC(r.data.commitment);
      setShowProof(false);
      setProofDesc(''); setProofFile(null); setPreview('');
      toast.success('Proof submitted! 📸');
      await load();
    } catch (e: unknown) {
      toast.error((e as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Submission failed');
    } finally { setAL(''); }
  };

  const selfVerify = async () => {
    if (!id) return;
    setAL('verify');
    try {
      await commitmentAPI.verifyProof(id, { status:'verified' });
      toast.success('Proof marked as verified ✓');
      await load();
    } catch { toast.error('Failed'); }
    finally { setAL(''); }
  };

  const claim = async () => {
    if (!id) return;
    setAL('claim');
    try {
      const r = await commitmentAPI.claim(id);
      setC(r.data.commitment);
      setClaimStep(false);
      toast.success('🎉 Commitment Claimed! +' + r.data.xpEarned + ' XP');
      await load();
    } catch (e: unknown) {
      toast.error((e as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Claim failed');
    } finally { setAL(''); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe,#ecfdf5)' }}>
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  if (!c) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
      <div className="ff-card text-center p-10 max-w-md">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-black text-indigo-900 mb-3">Commitment not found</h2>
        <Link to="/commitments" className="ff-btn ff-btn-primary">← Back to Commitments</Link>
      </div>
    </div>
  );

  const done    = c.tasks.filter(t=>t.completed).length;
  const total   = c.tasks.length;
  const pct     = total > 0 ? Math.round((done/total)*100) : 0;
  const vState  = getVaultState(c);
  const daysLeft = differenceInDays(new Date(c.deadline), new Date());
  const hrsLeft  = differenceInHours(new Date(c.deadline), new Date());

  return (
    <div className="min-h-screen pb-16" style={{ background:'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#ecfdf5 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-72 h-64 rounded-full blur-3xl opacity-25 animate-float" style={{ background:'rgba(139,92,246,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-60 rounded-full blur-3xl opacity-20 animate-float-slow" style={{ background:'rgba(16,185,129,0.18)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <Link to="/commitments" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-700 transition-colors text-sm mb-5">
          <ArrowLeft size={15}/> Back to Commitments
        </Link>

        {/* Claimed celebration */}
        {c.status === 'claimed' && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="ff-card p-6 mb-6 text-center"
            style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(16,185,129,0.1))', border:'2px solid rgba(245,158,11,0.3)' }}>
            <div className="text-4xl mb-2">🎉🏆🎉</div>
            <h2 className="text-2xl font-black text-indigo-900 mb-1">You completed your commitment!</h2>
            <p className="text-emerald-700 font-semibold">Your focus paid off. ₹{c.amount.toLocaleString('en-IN')} commitment claimed. +{c.xpReward} XP earned.</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Goal header */}
            <div className="ff-card p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="ff-badge-purple capitalize">{c.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ background: c.status === 'eligible_claim' ? 'rgba(16,185,129,0.12)' : c.status === 'claimed' ? 'rgba(245,158,11,0.12)' : c.status === 'missed' || c.status === 'charity_outcome' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                    color: c.status === 'eligible_claim' ? '#047857' : c.status === 'claimed' ? '#b45309' : c.status === 'missed' || c.status === 'charity_outcome' ? '#b91c1c' : '#4338ca' }}>
                  {{ active:'🎯 Active', eligible_claim:'🎉 Eligible to Claim!', claimed:'🏆 Claimed', missed:'😔 Missed', charity_outcome:'💝 Charity Outcome' }[c.status]}
                </span>
              </div>
              <h1 className="text-2xl font-black text-indigo-900 mb-2">{c.title}</h1>
              <p className="text-indigo-500 text-sm">{c.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
                <span className={`flex items-center gap-1 font-semibold ${hrsLeft < 0 ? 'text-red-500' : hrsLeft < 24 ? 'text-orange-500' : 'text-indigo-500'}`}>
                  <Clock size={14}/>
                  {hrsLeft < 0 ? 'Overdue' : daysLeft > 1 ? `${daysLeft}d left` : `${hrsLeft}h left`}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <IndianRupee size={14}/> {c.amount.toLocaleString('en-IN')} committed
                </span>
                <span className="flex items-center gap-1 text-pink-500 text-xs">
                  <Heart size={12}/> {c.charityName}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="ff-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-indigo-900 text-lg">Tasks ({done}/{total})</h2>
                <span className="text-violet-600 font-black text-lg">{pct}%</span>
              </div>
              <div className="ff-progress-track mb-5">
                <motion.div className="ff-progress-fill" initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}}
                  style={{ background: pct===100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
              </div>
              <div className="space-y-2">
                {c.tasks.map(task => (
                  <button key={task._id} onClick={() => toggleTask(task._id)}
                    disabled={c.status !== 'active' || actionLoading === task._id}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all disabled:cursor-default group"
                    style={{ background: task.completed ? 'rgba(16,185,129,0.08)' : 'rgba(139,92,246,0.05)', border: task.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(139,92,246,0.1)' }}>
                    {actionLoading === task._id
                      ? <Loader2 size={16} className="text-violet-400 animate-spin flex-shrink-0" />
                      : task.completed
                        ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        : <CircleDot    size={16} className="text-indigo-200 flex-shrink-0 group-hover:text-violet-400 transition-colors" />}
                    <span className={`text-sm ${task.completed ? 'line-through text-indigo-300' : 'text-indigo-700'}`}>{task.title}</span>
                  </button>
                ))}
              </div>
              {c.status === 'active' && <p className="text-indigo-300 text-xs mt-3">Tap any task to mark it complete / incomplete.</p>}
            </div>

            {/* Proof section */}
            <div className="ff-card p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-indigo-900 text-lg">Proof of Completion</h2>
                  <p className="text-sm mt-0.5" style={{ color: PROOF_COLOR[c.proofStatus] }}>{PROOF_LABEL[c.proofStatus]}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {c.status === 'active' && c.proofStatus === 'not_submitted' && (
                    <button onClick={() => setShowProof(true)} className="ff-btn ff-btn-candy text-sm py-2 px-4">
                      <Upload size={14}/> Submit Proof
                    </button>
                  )}
                  {c.status === 'active' && c.proofStatus === 'rejected' && (
                    <button onClick={() => setShowProof(true)} className="ff-btn text-sm py-2 px-4" style={{ background:'rgba(239,68,68,0.1)', color:'#b91c1c', border:'1px solid rgba(239,68,68,0.25)' }}>
                      <RefreshCw size={14}/> Resubmit Proof
                    </button>
                  )}
                  {c.proofStatus === 'submitted' && (
                    <button onClick={selfVerify} disabled={actionLoading==='verify'} className="ff-btn ff-btn-mint text-sm py-2 px-4 disabled:opacity-50">
                      {actionLoading === 'verify' ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>} Mark Verified (Demo)
                    </button>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {c.proofStatus === 'rejected' && c.proofRejectionReason && (
                <div className="mb-4 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-red-600 text-xs font-semibold flex items-center gap-2"><AlertCircle size={12}/> Rejected: {c.proofRejectionReason}</p>
                </div>
              )}

              {c.proofImageUrl && <img src={c.proofImageUrl} alt="Proof" className="w-full max-h-48 object-cover rounded-xl mb-3" />}
              {c.proofDescription && <p className="text-indigo-600 text-sm p-3 rounded-xl" style={{ background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.1)' }}>{c.proofDescription}</p>}
              {c.proofGithubData && (
                <a href={c.proofGithubData.commitUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm mt-2 transition-colors">
                  {c.proofGithubData.username}/{c.proofGithubData.repo} — {c.proofGithubData.commitCount} commits →
                </a>
              )}

              {/* Proof form */}
              {showProof && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="mt-4 space-y-4 pt-4 border-t border-violet-100">
                  <h3 className="font-semibold text-indigo-800 text-sm">Submit Proof</h3>
                  {(c.verificationType === 'photo' || c.verificationType === 'document') && (
                    <div>
                      <label className="block cursor-pointer">
                        {proofPreview ? (
                          <div className="relative rounded-xl overflow-hidden">
                            <img src={proofPreview} alt="Preview" className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-semibold">Change file</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                            style={{ border:'2px dashed rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.04)' }}>
                            <Camera size={24} className="text-violet-300"/>
                            <span className="text-violet-400 text-xs font-medium">Click to upload {c.verificationType}</span>
                          </div>
                        )}
                        <input type="file" ref={fileRef} accept={c.verificationType==='document' ? '.pdf,.doc,.docx,image/*' : 'image/*'}
                          onChange={onFileChange} className="hidden" />
                      </label>
                    </div>
                  )}
                  {c.verificationType === 'github' && (
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div><label className="ff-form-label">Username</label><input value={ghUser} onChange={e=>setGhUser(e.target.value)} placeholder="octocat" className="ff-input"/></div>
                      <div><label className="ff-form-label">Repo</label><input value={ghRepo} onChange={e=>setGhRepo(e.target.value)} placeholder="my-project" className="ff-input"/></div>
                      <div><label className="ff-form-label">Branch</label><input value={ghBranch} onChange={e=>setGhBranch(e.target.value)} placeholder="main" className="ff-input"/></div>
                    </div>
                  )}
                  {(c.verificationType === 'manual' || c.verificationType === 'photo' || c.verificationType === 'document') && (
                    <div>
                      <label className="ff-form-label">{c.verificationType==='manual' ? 'What did you accomplish? (min 20 chars) *' : 'Notes (optional)'}</label>
                      <textarea value={proofDesc} onChange={e=>setProofDesc(e.target.value)} rows={3}
                        placeholder="Describe what you completed..." className="ff-input resize-none"/>
                      {c.verificationType==='manual' && <p className="text-violet-300 text-xs mt-1">{proofDesc.length}/20 min</p>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={submitProof} disabled={actionLoading==='proof'} className="ff-btn ff-btn-candy disabled:opacity-50">
                      {actionLoading==='proof' ? <Loader2 size={14} className="animate-spin"/> : <><Upload size={14}/> Submit</>}
                    </button>
                    <button onClick={() => setShowProof(false)} className="ff-btn ff-btn-outline">Cancel</button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Claim section */}
            {c.status === 'eligible_claim' && (
              <div className="ff-card p-6" style={{ border:'2px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.04)' }}>
                <h2 className="font-black text-xl text-emerald-800 mb-2">🎉 You're eligible to claim!</h2>
                <p className="text-emerald-600 text-sm mb-4">All tasks completed and proof verified. Claim your ₹{c.amount.toLocaleString('en-IN')} commitment.</p>
                {!claimStep ? (
                  <button onClick={() => setClaimStep(true)} className="ff-btn"
                    style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
                    <Trophy size={16}/> Claim ₹{c.amount.toLocaleString('en-IN')}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-emerald-700 text-sm font-semibold">Confirm: this is a TEST MODE simulated claim. No real money moves.</p>
                    <div className="flex gap-3">
                      <button onClick={claim} disabled={actionLoading==='claim'} className="ff-btn"
                        style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff' }}>
                        {actionLoading==='claim' ? <Loader2 size={14} className="animate-spin"/> : <>✓ Confirm Claim</>}
                      </button>
                      <button onClick={() => setClaimStep(false)} className="ff-btn ff-btn-outline">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — vault + timeline */}
          <div className="space-y-5">
            {/* Vault */}
            <div className="ff-card p-4">
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide mb-2 text-center">Your Commitment Crystal</p>
              <CommitmentVault state={vState} progress={pct} amount={c.amount} height={200}/>
              <p className="text-center text-xs text-indigo-300 mt-2">
                {{ locked:'🔒 Locked — complete tasks + proof', progress:`⚡ ${pct}% tasks done`, unlocked:'✅ Unlocked — ready to claim!', claimed:'🏆 Claimed!', missed:'😔 Missed' }[vState]}
              </p>
            </div>

            {/* Stats */}
            <div className="ff-card p-5 space-y-3">
              {[
                { label:'Amount', value:`₹${c.amount.toLocaleString('en-IN')}`, color:'#10b981' },
                { label:'XP Reward', value:`+${c.xpReward} XP`, color:'#8b5cf6' },
                { label:'Charity', value: c.charityName.split(' ').slice(0,3).join(' '), color:'#ec4899' },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-indigo-400 text-xs">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="ff-card p-5">
              <h3 className="font-bold text-indigo-900 text-sm mb-4">Progress Timeline</h3>
              <div className="space-y-3">
                {timeline.map((entry, i) => (
                  <div key={entry.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${entry.done ? 'text-white' : 'text-indigo-200'}`}
                      style={entry.done ? { background:'linear-gradient(135deg,#8b5cf6,#10b981)' } : { background:'rgba(139,92,246,0.1)' }}>
                      {entry.done ? <CheckCircle2 size={13}/> : <span>{entry.emoji}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${entry.done ? 'text-indigo-800' : 'text-indigo-300'}`}>{entry.label}</p>
                      {entry.date && <p className="text-indigo-200 text-[10px]">{new Date(entry.date).toLocaleDateString('en-IN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>}
                    </div>
                    {i < timeline.length-1 && (
                      <div className="absolute left-[21px] w-px h-3 bg-violet-100 mt-7" style={{ position:'relative', width:'1px', height:'12px', background:'rgba(139,92,246,0.15)', margin:'2px auto 0', gridColumn:'1' }} />
                    )}
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
