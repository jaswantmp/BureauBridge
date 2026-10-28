import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Building2, CheckCircle2, CircleDot, Flag, Handshake, ShieldQuestion, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import {
  BureauBadge, ConfidenceMeter, ConflictStatusBadge, EvidenceList, PageHeader, PriorityBadge,
  StatusBadge, EmptyState,
} from '@/components/shared';
import { fmtDate, tokenSimilarity } from '@/lib/helpers';

function ActionModal({ mode, onClose, onSubmit, otherBureau }) {
  const [justification, setJustification] = useState('');
  const [reason, setReason] = useState('Different subject matter — no shared requests or complainants');
  const meta = {
    proceed: {
      title: 'Proceed with justification', icon: ShieldQuestion,
      body: 'Recorded on both case timelines. Use only when you can justify handling the matter separately from the other bureau.',
      cta: 'Proceed anyway', accent: '#FBBF24', needText: true,
    },
    dismissed: {
      title: 'Dismiss as false positive', icon: X,
      body: 'The conflict will be closed as a false positive. The matching engine learns from dismissals in the full system.',
      cta: 'Dismiss conflict', accent: '#94A3B8', needText: false,
    },
  }[mode];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div data-testid={`conflict-action-modal-${mode}`} className="relative w-[min(520px,100%)] panel rounded-2xl p-6 animate-scale-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border p-2" style={{ borderColor: `${meta.accent}55`, background: `${meta.accent}14`, color: meta.accent }}>
              <meta.icon size={16} />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-100">{meta.title}</h3>
          </div>
          <button data-testid="conflict-action-cancel" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"><X size={16} /></button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{meta.body}</p>
        {meta.needText ? (
          <div className="mt-4">
            <label className="text-[11px] font-mono2 uppercase tracking-[0.16em] text-slate-500">Justification (required)</label>
            <textarea data-testid="proceed-justification" value={justification} onChange={(e) => setJustification(e.target.value)}
              rows={3} placeholder="e.g. PGRC matter is strictly about withheld originals; approval discrepancy is RB’s remit. Documents will not be re-requested."
              className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-400/60" />
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-[11px] font-mono2 uppercase tracking-[0.16em] text-slate-500">Dismissal reason</label>
            <select data-testid="dismiss-reason" value={reason} onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-slate-400/60">
              <option>Different subject matter — no shared requests or complainants</option>
              <option>Different academic years / cohorts</option>
              <option>Location mismatch — different institutions despite similar names</option>
            </select>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <button data-testid="conflict-action-modal-cancel" onClick={onClose}
            className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
          <button data-testid="conflict-action-confirm"
            onClick={() => {
              if (meta.needText && justification.trim().length < 10) { toast.error('Please enter a justification of at least 10 characters.'); return; }
              onSubmit(meta.needText ? justification : reason);
            }}
            className="rounded-lg px-4 py-2 text-[12.5px] font-semibold"
            style={{ background: `${meta.accent}22`, border: `1px solid ${meta.accent}66`, color: meta.accent }}>
            {meta.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConflictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, runWithProgress, currentUser } = useApp();
  const [modal, setModal] = useState(null);

  const cf = state.conflicts.find((x) => x.id === id);
  const caseA = state.complaints.find((c) => c.caseId === cf?.caseA);
  const caseB = state.complaints.find((c) => c.caseId === cf?.caseB);
  const inst = state.institutions.find((i) => i.id === cf?.institutionId);

  const docOverlap = useMemo(() => {
    if (!caseA || !caseB) return [];
    return (caseA.docs || []).flatMap((da) =>
      (caseB.docs || []).filter((db) => tokenSimilarity(da.name, db.name) >= 0.35).map((db) => ({ a: da.name, b: db.name }))
    );
  }, [caseA, caseB]);

  if (!cf) {
    return <EmptyState title="Conflict not found" sub={`No conflict record matches ${id}.`} action={<Link to="/app/conflicts" className="text-cyan-300 text-sm font-medium">← Back to Conflict Intelligence</Link>} />;
  }

  const isOpen = ['detected', 'flagged', 'under-review'].includes(cf.status);
  const otherCase = caseA?.bureau === currentUser.bureau ? caseB : caseA;
  const otherBureau = caseA?.bureau === currentUser.bureau ? caseB?.bureau : caseA?.bureau;

  const handleAction = (act) => {
    if (act === 'coordinate') {
      navigate(`/app/coordination/compose?conflict=${cf.id}&cases=${encodeURIComponent(`${cf.caseA},${cf.caseB}`)}&to=${otherBureau}`);
      return;
    }
    if (act === 'under_review') {
      runWithProgress('Opening review panel…', ['Loading both case files in read-only mode', 'Cross-checking bureau actions', 'Marking conflict under review'], { minStepMs: 620, jitterMs: 120 });
      dispatch({ type: 'RESOLVE_CONFLICT', conflictId: cf.id, action: 'under_review', actor: `${currentUser.name} · ${currentUser.bureau}` });
      toast.info(`Conflict ${cf.id} marked for further review.`);
      setModal(null);
      return;
    }
    setModal(act);
  };

  const submitModal = (text) => {
    const act = modal === 'proceed' ? 'proceeded' : 'dismissed';
    runWithProgress(modal === 'proceed' ? 'Recording justified decision…' : 'Updating conflict record…', [
      'Writing decision to both case timelines',
      'Notifying the other bureau’s dashboard',
      'Closing the investigation view',
    ], { minStepMs: 640, jitterMs: 130 });
    dispatch({ type: 'RESOLVE_CONFLICT', conflictId: cf.id, action: act, justification: text, actor: `${currentUser.name} · ${currentUser.bureau}` });
    toast[act === 'proceeded' ? 'warning' : 'success'](act === 'proceeded'
      ? `Proceeded on ${cf.id} — justification recorded on both cases.`
      : `${cf.id} dismissed as a false positive.`);
    setModal(null);
  };

  const CasePanel = ({ c, label }) => (
    <div data-testid={`conflict-case-${c.caseId}`} className="panel rounded-xl p-5 flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <BureauBadge code={c.bureau} size="sm" />
      </div>
      <button data-testid={`conflict-case-link-${c.caseId}`} onClick={() => navigate(`/app/complaints/${c.caseId}`)}
        className="mt-2.5 block font-mono2 text-[15px] font-semibold text-cyan-300 hover:text-cyan-200">{c.caseId}</button>
      <p className="mt-2 text-[13.5px] font-medium text-slate-200 leading-snug">{c.subject}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
          <p className="text-slate-500">Category</p>
          <p className="mt-0.5 text-slate-300">{c.category}</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
          <p className="text-slate-500">Officer</p>
          <p className="mt-0.5 text-slate-300">{state.officers.find((o) => o.id === c.officerId)?.name || '—'}</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
          <p className="text-slate-500">Complainant</p>
          <p className="mt-0.5 text-slate-300">{c.complainant?.name}</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
          <p className="text-slate-500">Status</p>
          <p className="mt-1"><StatusBadge status={c.status} /></p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-mono2 uppercase tracking-[0.16em] text-slate-500 mb-1.5">Documents requested</p>
        {(c.docs || []).length === 0 ? (
          <p className="text-[12px] text-slate-600">No documents requested yet.</p>
        ) : (
          <div className="space-y-1.5">
            {(c.docs || []).map((d, i) => {
              const overlapping = (caseB || caseA) && docOverlap.some((o) => o.a === d.name || o.b === d.name);
              return (
                <div key={i} data-testid={`conflict-doc-${i}`}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px] ${overlapping ? 'border-rose-400/40 bg-rose-400/10' : 'border-slate-700/50 bg-slate-800/40'}`}>
                  <span className={overlapping ? 'text-rose-200' : 'text-slate-300'}>{d.name}</span>
                  <span className={`shrink-0 font-mono2 text-[10px] ${d.status === 'Awaited' ? 'text-amber-300' : 'text-emerald-300'}`}>{d.status} · {fmtDate(d.requestedOn)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="conflict-detail-page">
      <button data-testid="conflict-back" onClick={() => navigate('/app/conflicts')} className="text-[12.5px] text-slate-400 hover:text-cyan-300">← Back to Conflict Intelligence</button>

      <PageHeader
        testid="conflict-detail-header"
        eyebrow={`${cf.type} · detected ${fmtDate(cf.detected)}`}
        title={<span className="font-mono2">{cf.id}</span>}
        sub={cf.summary}
        actions={<ConflictStatusBadge status={cf.status} />}
      />

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch relative">
            {caseA && <CasePanel c={caseA} label="Case A" />}
            <div className="hidden md:flex flex-col items-center justify-center gap-1.5 px-1">
              <div className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 font-mono2 text-[10px] font-bold tracking-[0.14em] text-rose-300 animate-pulse-soft">MATCHED</div>
              <div className="h-16 w-px bg-gradient-to-b from-rose-400/50 to-transparent" />
            </div>
            {caseB && <CasePanel c={caseB} label="Case B" />}
          </div>

          {docOverlap.length > 0 && (
            <div data-testid="doc-overlap-banner" className="flex items-start gap-3 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-300" />
              <div>
                <p className="text-[13px] font-semibold text-rose-200">Overlapping document requests detected</p>
                <p className="mt-1 text-[12px] leading-relaxed text-rose-200/75">
                  {docOverlap.map((o, i) => <span key={i}>{i > 0 && '; '}“{o.a}” ↔ “{o.b}”</span>)}. Requesting the same records twice
                  from the institution creates duplicate work — coordinate instead.
                </p>
              </div>
            </div>
          )}

          <div className="panel rounded-xl p-5">
            <h3 className="font-display text-[15px] font-semibold text-slate-200">Matching evidence</h3>
            <p className="text-xs text-slate-500 mt-0.5">Weighted signals produced by the demo matching engine — every value is explainable and reviewable.</p>
            <div className="mt-4"><EvidenceList evidence={cf.evidence} /></div>
            <p className="mt-3 font-mono2 text-[10px] uppercase tracking-[0.18em] text-slate-600">Frontend demonstration engine · fixed demo weights · no live model connected</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel rounded-xl p-5">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Match confidence</p>
            <div className="mt-3 flex justify-center"><ConfidenceMeter value={cf.confidence} size="lg" /></div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
              {cf.confidence >= 0.8
                ? 'High confidence — the engine recommends coordination before any further document requests.'
                : cf.confidence >= 0.65
                  ? 'Medium confidence — a human officer should review the evidence before acting.'
                  : 'Low confidence — likely a weak signal. Dismiss or flag after a quick look.'}
            </p>
          </div>

          {inst && (
            <Link data-testid="conflict-shared-institution" to={`/app/registry/${inst.id}`}
              className="panel panel-hover rounded-xl p-5 block group">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Shared institution</p>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-2 text-cyan-300"><Building2 size={16} /></div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 leading-snug truncate">{inst.name}</p>
                  <p className="font-mono2 text-[10.5px] text-slate-500">{inst.id} · {inst.city}, {inst.state}</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-slate-500 group-hover:text-cyan-300 transition-colors" />
              </div>
            </Link>
          )}

          <div className="panel rounded-xl p-5">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3">Officer decision</p>
            {isOpen ? (
              <div className="space-y-2.5">
                <button data-testid="conflict-action-coordinate" onClick={() => handleAction('coordinate')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300 transition-colors">
                  <Handshake size={15} /> Coordinate with {otherBureau || 'the other bureau'}
                </button>
                <button data-testid="conflict-action-proceed" onClick={() => handleAction('proceed')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-[13px] font-medium text-amber-300 hover:bg-amber-400/20 transition-colors">
                  <ShieldQuestion size={15} /> Proceed with justification
                </button>
                <button data-testid="conflict-action-flag" onClick={() => handleAction('under_review')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/40 bg-sky-400/10 px-4 py-2.5 text-[13px] font-medium text-sky-300 hover:bg-sky-400/20 transition-colors">
                  <Flag size={15} /> Flag for further review
                </button>
                <button data-testid="conflict-action-dismiss" onClick={() => setModal('dismissed')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/60 px-4 py-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors">
                  <X size={15} /> Dismiss as false positive
                </button>
                <p className="pt-1 text-[10.5px] leading-relaxed text-slate-600">
                  Coordinating opens the Bureau Coordination portal with both case IDs pre-linked. Cases never merge — each keeps its own ID, history and bureau ownership.
                </p>
              </div>
            ) : (
              <div data-testid="conflict-outcome" className="space-y-3">
                <div className={`rounded-lg border px-3.5 py-3 text-[12.5px] leading-relaxed ${cf.status === 'coordinated' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : cf.status === 'dismissed' ? 'border-slate-500/40 bg-slate-500/10 text-slate-300' : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'}`}>
                  <p className="font-semibold flex items-center gap-2"><CheckCircle2 size={13} /> Outcome: {cf.status === 'coordinated' ? 'Coordinated' : cf.status === 'dismissed' ? 'Dismissed' : 'Proceeded with justification'}</p>
                  {cf.resolutionNote && <p className="mt-1.5 opacity-80">“{cf.resolutionNote}”</p>}
                  {cf.coordinationId && (
                    <button data-testid="conflict-view-coordination" onClick={() => navigate(`/app/coordination/${cf.coordinationId}`)}
                      className="mt-2 font-mono2 text-[11px] underline underline-offset-2 hover:opacity-80">
                      View coordination thread {cf.coordinationId} →
                    </button>
                  )}
                </div>
                {(cf.actions || []).length > 0 && (
                  <div className="space-y-2">
                    {cf.actions.map((a, i) => (
                      <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5">
                        <p className="text-[12px] text-slate-300 leading-snug">{a.detail}</p>
                        <p className="mt-1 font-mono2 text-[10px] text-slate-600">{a.actor} · {fmtDate(a.ts)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button data-testid="conflict-reopen" onClick={() => handleAction('under_review')}
                  className="w-full rounded-lg border border-slate-600/60 px-4 py-2 text-[12px] text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors">
                  Re-open for review
                </button>
              </div>
            )}
          </div>

          {(cf.actions || []).length > 0 && isOpen && (
            <div className="panel rounded-xl p-5">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3">Decision history</p>
              <div className="space-y-2">
                {cf.actions.map((a, i) => (
                  <div key={i} className="flex gap-2.5 text-[12px] text-slate-400"><CircleDot size={12} className="mt-0.5 shrink-0 text-slate-600" />
                    <span>{a.detail} <span className="font-mono2 text-[10px] text-slate-600 block">{fmtDate(a.ts)}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && <ActionModal mode={modal} otherBureau={otherBureau} onClose={() => setModal(null)} onSubmit={submitModal} />}
    </div>
  );
}
