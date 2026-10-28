import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Building2, CheckCircle2, Link2, Network, Save, Send, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import { BureauBadge, EmptyState, PageHeader, PriorityBadge, SectionCard } from '@/components/shared';

export default function CoordinationCompose() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const conflictParam = params.get('conflict');
  const casesParam = params.get('cases');
  const toParam = params.get('to');
  const docParam = params.get('doc');

  const { state, dispatch, runWithProgress, currentUser, priorities, makeCoordinationId } = useApp();

  const [step, setStep] = useState(1);
  const [toBureau, setToBureau] = useState(toParam || '');
  const [linkedCases, setLinkedCases] = useState(casesParam ? casesParam.split(',') : []);
  const [caseSearch, setCaseSearch] = useState('');
  const [subject, setSubject] = useState(() => {
    if (conflictParam && casesParam) {
      const [a, b] = casesParam.split(',');
      return `Cross-bureau coordination — ${conflictParam} (${a} ↔ ${b})`;
    }
    return '';
  });
  const [message, setMessage] = useState(() => {
    if (conflictParam) {
      return `While working case ${casesParam ? casesParam.split(',')[0] : ''} we identified a potential overlap flagged by SAMANVAYA AI (${conflictParam}).${docParam ? ` We were about to request "${docParam}".` : ''} Proposing we align our document requests and next steps so the institution receives a single, coordinated set of instructions. Please acknowledge and advise.`;
    }
    return '';
  });
  const [priority, setPriority] = useState('High');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const conflict = conflictParam ? state.conflicts.find((c) => c.id === conflictParam) : null;

  const caseOptions = useMemo(() => {
    const term = caseSearch.trim().toLowerCase();
    return state.complaints
      .filter((c) => c.status !== 'Disposed')
      .filter((c) => !term || c.caseId.toLowerCase().includes(term) || c.subject.toLowerCase().includes(term))
      .slice(0, 10);
  }, [state.complaints, caseSearch]);

  const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-400/60';
  const labelCls = 'text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500';

  const toggleCase = (caseId) => {
    if (casesParam) return; // pre-linked from a conflict — locked
    setLinkedCases((l) => (l.includes(caseId) ? l.filter((x) => x !== caseId) : [...l, caseId]));
  };

  const send = async () => {
    setSending(true);
    const crId = makeCoordinationId();
    const nowIso = new Date().toISOString();
    await runWithProgress('Sending coordination request…', [
      'Validating recipient bureau desk',
      'Attaching linked case references',
      'Encrypting message for the cross-bureau channel',
      `Transmitting request to ${toBureau}`,
    ], { minStepMs: 600, jitterMs: 140 });

    dispatch({
      type: 'ADD_COORDINATION', conflictId: conflictParam || null,
      coordination: {
        id: crId, fromBureau: currentUser.bureau, toBureau, initiatorName: currentUser.name,
        subject, priority, linkedCases, conflictId: conflictParam || null,
        status: 'Pending Acknowledgement', initiated: nowIso.slice(0, 10), updated: nowIso,
        messages: [{ ts: nowIso, from: `${currentUser.bureau} · ${currentUser.name}`, kind: 'request', text: message.trim() }],
      },
    });
    if (conflictParam) {
      dispatch({ type: 'RESOLVE_CONFLICT', conflictId: conflictParam, action: 'coordinated', coordinationId: crId, actor: `${currentUser.name} · ${currentUser.bureau}` });
    }
    setSending(false);
    setDone({ id: crId });
  };

  const saveDraft = () => {
    const crId = makeCoordinationId();
    const nowIso = new Date().toISOString();
    dispatch({
      type: 'ADD_COORDINATION', conflictId: null,
      coordination: {
        id: crId, fromBureau: currentUser.bureau, toBureau: toBureau || 'RB', initiatorName: currentUser.name,
        subject: subject || 'Untitled coordination draft', priority, linkedCases, conflictId: null,
        status: 'Draft', initiated: nowIso.slice(0, 10), updated: nowIso, draftMessage: message,
        messages: [],
      },
    });
    toast.info(`Draft ${crId} saved — find it under Drafts.`);
    navigate('/app/coordination?tab=drafts');
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-up" data-testid="compose-success">
        <div className="panel rounded-2xl p-8 text-center">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <ShieldCheck size={28} />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-slate-100">Coordination request sent</h2>
          <p data-testid="compose-success-id" className="mt-3 font-mono2 text-lg font-semibold text-violet-300">{done.id}</p>
          <div className="mt-5 space-y-2 text-left">
            {[
              `Request delivered to the ${toBureau} desk — awaiting acknowledgement.`,
              ...linkedCases.map((c) => `${c}: coordination reference added to its timeline (case ID, history and ownership unchanged).`),
              ...(conflictParam ? [`Conflict ${conflictParam} marked as Coordinated on the Conflict Intelligence portal.`] : []),
              'Activity recorded on the Admin Dashboard feed.',
            ].map((t, i) => (
              <p key={i} data-testid={`compose-success-effect-${i}`} className="flex items-start gap-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5 text-[12.5px] text-slate-300">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" /> {t}
              </p>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button data-testid="compose-success-view-thread" onClick={() => navigate(`/app/coordination/${done.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-5 py-2.5 text-[13px] font-semibold text-[#23063B] hover:bg-violet-300">
              Open the thread <ArrowRight size={14} />
            </button>
            {conflictParam && (
              <button data-testid="compose-success-view-conflict" onClick={() => navigate(`/app/conflicts/${conflictParam}`)}
                className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-5 py-2.5 text-[13px] font-medium text-rose-300 hover:bg-rose-400/20">View conflict record</button>
            )}
            <button data-testid="compose-success-inbox" onClick={() => navigate('/app/coordination')}
              className="rounded-lg border border-slate-600/60 px-5 py-2.5 text-[13px] text-slate-300 hover:bg-slate-700/50">Back to inbox</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl" data-testid="coordination-compose-page">
      <button data-testid="compose-back" onClick={() => navigate('/app/coordination')} className="text-[12.5px] text-slate-400 hover:text-violet-300 inline-flex items-center gap-1.5"><ArrowLeft size={13} /> Back to inbox</button>

      <PageHeader
        testid="compose-header"
        eyebrow="Bureau Coordination"
        title="New coordination request"
        sub="Ask another bureau to align on linked cases. Requests are tracked end-to-end: acknowledgement → discussion → resolution."
      />

      {conflict && (
        <div data-testid="compose-conflict-context" className="flex items-start gap-3 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3.5">
          <Network size={16} className="mt-0.5 shrink-0 text-rose-300" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-rose-200">Originating from conflict {conflict.id}</p>
            <p className="mt-0.5 text-[12px] text-rose-100/70">{conflict.summary}</p>
          </div>
          <Link to={`/app/conflicts/${conflict.id}`} data-testid="compose-conflict-link" className="shrink-0 text-[12px] font-medium text-rose-200 underline underline-offset-2">Review evidence</Link>
        </div>
      )}

      <div className="flex items-center gap-2" data-testid="compose-stepper">
        {['Recipients & cases', 'Message', 'Review & send'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${step === i + 1 ? 'border-violet-400/60 bg-violet-400/15 text-violet-200' : step > i + 1 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-600/50 text-slate-500'}`}>
              <span className={`grid place-items-center h-5 w-5 rounded-full font-mono2 text-[10px] font-bold ${step === i + 1 ? 'bg-violet-400/25' : step > i + 1 ? 'bg-emerald-400/20' : 'bg-slate-700/60'}`}>{step > i + 1 ? '✓' : i + 1}</span>
              {label}
            </div>
            {i < 2 && <div className={`h-px flex-1 ${step > i + 1 ? 'bg-emerald-400/40' : 'bg-slate-700/60'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="compose-step-1">
          <div>
            <label className={labelCls}>Requesting bureau (you)</label>
            <div className="mt-1.5 rounded-lg border border-slate-600/60 bg-slate-800/40 px-3 py-2.5">
              <BureauBadge code={currentUser.bureau} size="sm" /> <span className="ml-2 text-[12px] text-slate-400">{currentUser.name}</span>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Send to bureau *</label>
            <select data-testid="compose-to-bureau" value={toBureau} onChange={(e) => setToBureau(e.target.value)} className={inputCls}>
              <option value="">Select the bureau to coordinate with…</option>
              {['PGRC', 'RB', 'AB', 'EAB', 'FAB'].filter((b) => b !== currentUser.bureau).map((b) => <option key={b} value={b}>{b} — {state.bureauMap[b]?.name}</option>)}
            </select>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Link related case IDs *</label>
            {casesParam ? (
              <div className="mt-1.5 space-y-2" data-testid="compose-linked-locked">
                {linkedCases.map((c) => (
                  <div key={c} className="flex items-center justify-between rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2.5">
                    <span className="font-mono2 text-[12.5px] font-semibold text-cyan-300">{c}</span>
                    <span className="font-mono2 text-[10px] text-slate-500">pre-linked from {conflictParam || 'referral'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <input data-testid="compose-case-search" value={caseSearch} onChange={(e) => setCaseSearch(e.target.value)}
                  placeholder="Search open cases by ID or subject…" className={inputCls} />
                <div className="mt-2.5 max-h-64 overflow-auto space-y-2 pr-1">
                  {caseOptions.map((c) => (
                    <button key={c.caseId} data-testid={`compose-case-option-${c.caseId}`} onClick={() => toggleCase(c.caseId)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${linkedCases.includes(c.caseId) ? 'border-violet-400/60 bg-violet-400/10' : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-500'}`}>
                      <div className={`grid place-items-center h-4 w-4 rounded border shrink-0 ${linkedCases.includes(c.caseId) ? 'bg-violet-400 border-violet-400 text-[#23063B]' : 'border-slate-500'}`}>
                        {linkedCases.includes(c.caseId) && <CheckCircle2 size={11} strokeWidth={3} />}
                      </div>
                      <span className="font-mono2 text-[12px] text-cyan-300">{c.caseId}</span>
                      <span className="flex-1 text-[12px] text-slate-300 truncate">{c.subject}</span>
                      <BureauBadge code={c.bureau} size="sm" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-5 flex justify-end">
            <button data-testid="compose-step1-next" onClick={() => {
              if (!toBureau) { toast.error('Choose the bureau to coordinate with.'); return; }
              if (linkedCases.length === 0) { toast.error('Link at least one case ID.'); return; }
              setStep(2);
            }} className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-5 py-2.5 text-[13px] font-semibold text-[#23063B] hover:bg-violet-300">
              Write message <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="compose-step-2">
          <div>
            <label className={labelCls}>Subject *</label>
            <input data-testid="compose-subject" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Overlapping document requests on INST-0001 — alignment needed" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Message *</label>
            <textarea data-testid="compose-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
              placeholder="Explain the overlap, what you propose, and what you need from the other bureau…" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Priority</label>
            <select data-testid="compose-priority" value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
              {priorities.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button data-testid="compose-step2-back" onClick={() => setStep(1)} className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Back</button>
            <div className="flex gap-2.5">
              <button data-testid="compose-save-draft" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:border-slate-500">
                <Save size={13.5} /> Save as draft
              </button>
              <button data-testid="compose-step2-next" onClick={() => {
                if (subject.trim().length < 8) { toast.error('Subject must be at least 8 characters.'); return; }
                if (message.trim().length < 15) { toast.error('Write a message of at least 15 characters.'); return; }
                setStep(3);
              }} className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-5 py-2.5 text-[13px] font-semibold text-[#23063B] hover:bg-violet-300">
                Review request <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel rounded-xl p-6 animate-fade-up" data-testid="compose-step-3">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <BureauBadge code={currentUser.bureau} size="sm" /> <span className="text-slate-500 text-[12px]">→</span> <BureauBadge code={toBureau} size="sm" />
              <PriorityBadge priority={priority} />
              {conflictParam && <span className="rounded-md border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 font-mono2 text-[10px] font-bold text-rose-300">CONFLICT {conflictParam}</span>}
            </div>
            <h3 data-testid="compose-review-subject" className="mt-3 font-display text-lg font-semibold text-slate-100">{subject}</h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-300 whitespace-pre-line">{message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkedCases.map((c) => (
                <span key={c} data-testid={`compose-review-case-${c}`} className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 font-mono2 text-[11px] text-cyan-300">
                  <Link2 size={10} /> {c}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-slate-500">
            On send: the {toBureau} desk receives the request; linked cases gain a coordination reference on their timelines;
            {conflictParam ? ` conflict ${conflictParam} is marked Coordinated;` : ''} nothing is merged. Sending shows a simulated 2.5s transmission.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button data-testid="compose-step3-back" onClick={() => setStep(2)} className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Back</button>
            <button data-testid="compose-send" onClick={send} disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-6 py-2.5 text-[13px] font-semibold text-[#23063B] shadow-[0_0_24px_-6px_#A78BFA] hover:bg-violet-300 disabled:opacity-60">
              <Send size={14} /> Send coordination request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
