import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Building2, CheckCircle2, FileWarning, Network, Search, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import { PageHeader, PriorityBadge } from '@/components/shared';
import { checkComplaintOverlap } from '@/lib/helpers';

const TYPES = ['Student', 'Parent', 'Staff', 'Association', 'Anonymous'];
const DOC_SUGGESTIONS = ['AICTE approval letters & affiliation records', 'Fee receipts & ledger extract', 'Attendance records'];

export default function ComplaintRegister() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, dispatch, runWithProgress, currentUser, makeCaseId, makeConflictId, categories, priorities } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', type: 'Student', phone: '', category: 'Withheld Certificates',
    subject: '', description: '', priority: 'High',
  });
  const [instSearch, setInstSearch] = useState('');
  const [institutionId, setInstitutionId] = useState(params.get('institution') || '');
  const [overlap, setOverlap] = useState(null);
  const [done, setDone] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inst = state.institutions.find((i) => i.id === institutionId);

  const instList = useMemo(() => {
    const term = instSearch.trim().toLowerCase();
    if (!term) return state.institutions.slice(0, 8);
    return state.institutions.filter((i) => i.name.toLowerCase().includes(term) || i.aliases.some((a) => a.toLowerCase().includes(term)) || i.city.toLowerCase().includes(term)).slice(0, 8);
  }, [state.institutions, instSearch]);

  const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60';
  const labelCls = 'text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500';

  const validateStep1 = () => {
    if (form.name.trim().length < 3) { toast.error('Complainant name is required.'); return false; }
    if (form.subject.trim().length < 8) { toast.error('Subject must be at least 8 characters.'); return false; }
    if (form.description.trim().length < 20) { toast.error('Describe the grievance in at least 20 characters.'); return false; }
    return true;
  };

  const doRegister = async (detected) => {
    const caseId = makeCaseId(currentUser.bureau);
    const nowIso = new Date().toISOString();
    const complaint = {
      id: `C-${Date.now()}`, caseId, institutionId, category: form.category, bureau: currentUser.bureau,
      priority: form.priority, officerId: currentUser.id,
      complainant: { name: form.name, type: form.type, phone: form.phone || undefined },
      subject: form.subject, description: form.description,
      status: 'Received', submitted: nowIso.slice(0, 10), updated: nowIso.slice(0, 10),
      slaDue: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      docs: [], conflictId: detected?.conflictId || null, coordinationIds: [],
      timeline: [
        { ts: nowIso, actor: `${form.name} (complainant)`, type: 'received', text: 'Complaint registered in PGRC through the demo grievance portal.' },
        { ts: nowIso, actor: `${currentUser.name} · ${currentUser.bureau}`, type: 'ack', text: `Complaint acknowledged and assigned to ${currentUser.name}.` },
        ...(detected ? [{ ts: nowIso, actor: 'CaseMind AI', type: 'conflict', text: `Overlap scan at registration flagged ${detected.target.caseId} (${detected.target.bureau}) — officer reviewed the evidence before proceeding.` }] : []),
      ],
      notes: [],
    };

    await runWithProgress('Registering complaint…', [
      'Validating complaint details',
      'Checking related cases across bureaus',
      'Allocating case ID and officer queue',
      'Publishing to registers & dashboards',
    ], { minStepMs: 600, jitterMs: 130 });

    dispatch({ type: 'ADD_COMPLAINT', complaint, conflictId: detected?.conflictId || null });
    setDone({ caseId, overlap: detected });
  };

  const submit = async () => {
    if (!institutionId) { toast.error('Select the institution the complaint is about.'); return; }
    const detected = checkComplaintOverlap(state, { institutionId, category: form.category });
    if (detected) {
      const existing = state.conflicts.find(
        (cf) => [cf.caseA, cf.caseB].includes(detected.target.caseId) && ['detected', 'flagged', 'under-review'].includes(cf.status)
      );
      setOverlap({ ...detected, existingConflictId: existing ? existing.id : null });
      return;
    }
    await doRegister(null);
  };

  const registerWithConflict = async () => {
    let conflictId = overlap.existingConflictId || null;
    if (!conflictId) {
      conflictId = makeConflictId();
      dispatch({
        type: 'CREATE_CONFLICT',
        conflict: {
          id: conflictId, type: 'Possible Duplicate Complaint', caseA: overlap.target.caseId, caseB: '(registering)',
          institutionId, confidence: overlap.confidence, status: 'detected',
          detected: new Date().toISOString().slice(0, 10), updated: new Date().toISOString(),
          summary: `Overlap flagged during PGRC registration — thematic similarity with active ${overlap.target.bureau} case ${overlap.target.caseId}.`,
          evidence: overlap.evidence.map((e) => ({ label: e.label, weight: 30, strength: e.strength, detail: e.detail })),
          actions: [],
        },
      });
    }
    await doRegister({ ...overlap, conflictId });
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-up" data-testid="register-success">
        <div className="panel rounded-2xl p-8 text-center">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={30} />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-slate-100">Complaint registered</h2>
          <p data-testid="success-case-id" className="mt-3 font-mono2 text-lg font-semibold text-cyan-300">{done.caseId}</p>
          <p className="mt-2 text-[13px] text-slate-400">Status <span className="text-sky-300 font-medium">Received</span> · SLA clock started · visible on the command dashboard and institution record.</p>
          {done.overlap && (
            <div data-testid="success-overlap-note" className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/5 px-4 py-3.5 text-left">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-amber-200"><Network size={13} /> Overlap check flagged {done.overlap.target.caseId} ({done.overlap.target.bureau})</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-400">The Conflict Intelligence portal is tracking the possible overlap. Review the evidence and decide whether to coordinate.</p>
            </div>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button data-testid="success-view-case" onClick={() => navigate(`/app/complaints/${done.caseId}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] hover:bg-cyan-300">
              Open case file <ArrowRight size={14} />
            </button>
            {done.overlap?.conflictId && (
              <button data-testid="success-view-conflict" onClick={() => navigate(`/app/conflicts/${done.overlap.conflictId}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-400/10 px-5 py-2.5 text-[13px] font-medium text-rose-300 hover:bg-rose-400/20">
                View detected conflict
              </button>
            )}
            <button data-testid="success-register-another" onClick={() => { setDone(null); setStep(1); setForm({ name: '', type: 'Student', phone: '', category: 'Withheld Certificates', subject: '', description: '', priority: 'High' }); setInstitutionId(''); }}
              className="rounded-lg border border-slate-600/60 px-5 py-2.5 text-[13px] text-slate-300 hover:bg-slate-700/50">Register another</button>
            <button data-testid="success-back" onClick={() => navigate('/app/complaints')}
              className="rounded-lg border border-slate-600/60 px-5 py-2.5 text-[13px] text-slate-300 hover:bg-slate-700/50">Back to register</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl" data-testid="complaint-register-page">
      <button data-testid="register-back" onClick={() => navigate('/app/complaints')} className="text-[12.5px] text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1.5"><ArrowLeft size={13} /> Back to register</button>

      <PageHeader
        testid="register-header"
        eyebrow="Complaint Management"
        title="Register a new complaint"
        sub="Registration runs a live overlap scan against open cases from other bureaus at the same institution — the demo’s connected story in action."
      />

      {/* Stepper */}
      <div className="flex items-center gap-2" data-testid="register-stepper">
        {['Complaint', 'Institution', 'Review & submit'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${step === i + 1 ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : step > i + 1 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-600/50 text-slate-500'}`}>
              <span className={`grid place-items-center h-5 w-5 rounded-full font-mono2 text-[10px] font-bold ${step === i + 1 ? 'bg-cyan-400/25' : step > i + 1 ? 'bg-emerald-400/20' : 'bg-slate-700/60'}`}>{step > i + 1 ? '✓' : i + 1}</span>
              {label}
            </div>
            {i < 2 && <div className={`h-px flex-1 ${step > i + 1 ? 'bg-emerald-400/40' : 'bg-slate-700/60'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="register-step-1">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Complainant name *</label>
              <input data-testid="register-complainant-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ananya Sharma" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Complainant type</label>
                <select data-testid="register-complainant-type" value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input data-testid="register-complainant-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 …" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select data-testid="register-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select data-testid="register-priority" value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputCls}>
                {priorities.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Subject *</label>
              <input data-testid="register-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="e.g. Original certificates withheld pending fee arrears settlement" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea data-testid="register-description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4}
                placeholder="What happened, when, and what outcome does the complainant seek?…" className={inputCls} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button data-testid="register-step1-next" onClick={() => { if (validateStep1()) setStep(2); }}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] hover:bg-cyan-300">
              Choose institution <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="register-step-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 focus-within:border-cyan-400/50">
            <Search size={14} className="text-slate-500" />
            <input data-testid="register-institution-search" value={instSearch} onChange={(e) => setInstSearch(e.target.value)}
              placeholder="Search institutions by name, alias or city…" className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none" />
          </div>
          <div data-testid="register-institution-list" className="mt-4 grid sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-auto pr-1">
            {instList.map((i) => (
              <button key={i.id} data-testid={`register-institution-${i.id}`} onClick={() => setInstitutionId(i.id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${institutionId === i.id ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-500'}`}>
                <div className={`rounded-lg p-2 ${institutionId === i.id ? 'bg-cyan-400/15 text-cyan-300' : 'bg-slate-700/40 text-slate-400'}`}><Building2 size={15} /></div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-slate-200 leading-snug truncate">{i.name}</p>
                  <p className="font-mono2 text-[10px] text-slate-500 mt-0.5">{i.id} · {i.city}, {i.state}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[11.5px] text-slate-500">
              {inst ? <>Selected: <span className="text-cyan-300 font-medium">{inst.name}</span> — {state.complaints.filter((c) => c.institutionId === inst.id && c.status !== 'Disposed').length} open case(s) on file</> : 'Select the institution this complaint is about'}
            </p>
            <div className="flex gap-2.5">
              <button data-testid="register-step2-back" onClick={() => setStep(1)} className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Back</button>
              <button data-testid="register-step2-next" onClick={() => { if (institutionId) setStep(3); else toast.error('Select an institution to continue.'); }}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] hover:bg-cyan-300">Review <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="register-step-3">
          <div className="grid md:grid-cols-2 gap-3 text-[13px]">
            {[
              ['Complainant', `${form.name} (${form.type})`],
              ['Category', form.category],
              ['Subject', form.subject],
              ['Priority', form.priority],
              ['Institution', inst?.name || '—'],
              ['Receiving bureau', `${currentUser.bureau} · ${currentUser.name}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5">
                <p className="text-slate-500 text-[11px]">{k}</p>
                <p className="mt-0.5 text-slate-200 font-medium break-words">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-300">{form.description}</p>
          <p className="mt-3 flex items-center gap-2 text-[11.5px] text-slate-500"><Network size={12} className="text-cyan-300" /> On submit, an overlap scan runs across all other bureaus for this institution (simulated ~2.5s).</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2.5">
            <button data-testid="register-step3-back" onClick={() => setStep(2)} className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Back</button>
            <button data-testid="register-submit" onClick={submit}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300">
              <FileWarning size={14} /> Register complaint
            </button>
          </div>
        </div>
      )}

      {/* Overlap warning at registration */}
      {overlap && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div data-testid="register-overlap-warning" className="relative w-[min(680px,100%)] max-h-[92vh] overflow-auto rounded-2xl border border-rose-400/50 bg-[#140A12]/98 p-6 shadow-[0_0_80px_-10px_rgba(251,113,133,0.4)] animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-rose-400/50 bg-rose-400/15 p-3 text-rose-300 shrink-0 animate-pulse-soft"><AlertTriangle size={22} /></div>
              <div>
                <h3 className="font-display text-xl font-bold text-rose-200">Potential Overlapping Cases — Coordination Required</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-rose-100/75">
                  An active case <span className="font-mono2 font-semibold">{overlap.target.caseId}</span> ({overlap.target.bureau}) at the same institution
                  is thematically related to this registration. Match confidence: <span className="font-semibold">{Math.round(overlap.confidence * 100)}%</span>.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {overlap.evidence.map((ev, i) => (
                <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                  <p className="text-[12.5px] font-semibold text-slate-200">{ev.label} <span className="font-mono2 text-[10.5px] text-slate-400">· {Math.round((ev.strength || 0) * 100)}%</span></p>
                  <p className="mt-1 text-[11.5px] text-slate-400">{ev.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2.5">
              <button data-testid="overlap-cancel" onClick={() => setOverlap(null)} className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:border-slate-500">Let me re-check</button>
              {overlap.existingConflictId && (
                <button data-testid="overlap-view-conflict" onClick={() => navigate(`/app/conflicts/${overlap.existingConflictId}`)}
                  className="rounded-lg border border-rose-400/50 bg-rose-400/15 px-4 py-2.5 text-[12.5px] font-semibold text-rose-200 hover:bg-rose-400/25">
                  View existing conflict
                </button>
              )}
              <button data-testid="overlap-register-anyway" onClick={registerWithConflict}
                className="rounded-lg bg-cyan-400 px-4 py-2.5 text-[12.5px] font-semibold text-[#05222B] hover:bg-cyan-300">
                Register anyway (overlap recorded)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
