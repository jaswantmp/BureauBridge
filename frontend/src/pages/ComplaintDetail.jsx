import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Building2, CheckCircle2, FileText, Gavel, Handshake, ListPlus,
  MessageSquarePlus, ArrowUpCircle, Send, ShieldQuestion, Upload, UserCheck, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import {
  BureauBadge, EmptyState, PriorityBadge, SectionCard, StatusBadge, Timeline, EvidenceList,
} from '@/components/shared';
import { checkDocumentConflict, daysOverdue, fmtDate, fmtDateTime, initials } from '@/lib/helpers';

function Modal({ title, icon: Icon, tone = '#22D3EE', onClose, children, testid, wide }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div data-testid={testid} className={`relative w-[min(${wide ? '680px' : '520px'},100%)] max-h-[90vh] overflow-auto panel rounded-2xl p-6 animate-scale-in`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && <div className="rounded-lg border p-2" style={{ borderColor: `${tone}55`, background: `${tone}14`, color: tone }}><Icon size={16} /></div>}
            <h3 className="font-display text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <button data-testid="modal-close" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"><X size={16} /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60';
const labelCls = 'text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500';

export default function ComplaintDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, runWithProgress, currentUser, statuses, officers } = useApp();
  const complaint = state.complaints.find((c) => c.caseId === caseId);
  const inst = complaint ? state.institutions.find((i) => i.id === complaint.institutionId) : null;
  const conflict = complaint?.conflictId ? state.conflicts.find((cf) => cf.id === complaint.conflictId) : null;
  const coordinationRefs = state.coordinations.filter((cr) => (complaint?.coordinationIds || []).includes(cr.id));

  const [modal, setModal] = useState(null); // 'status' | 'assign' | 'escalate' | 'transfer' | 'note' | 'resolve' | 'docs'
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [assignId, setAssignId] = useState('');
  const [transferBureau, setTransferBureau] = useState('');
  const [noteText, setNoteText] = useState('');
  const [docName, setDocName] = useState('');
  const [docNote, setDocNote] = useState('');
  const [docWarning, setDocWarning] = useState(null); // {result, docName, note}
  const [proceedJustification, setProceedJustification] = useState('');

  const actor = `${currentUser.name} · ${currentUser.bureau}`;
  const over = complaint && complaint.status !== 'Disposed' && daysOverdue(complaint.slaDue) > 0;

  const otherActiveComplaints = useMemo(() => {
    if (!complaint) return [];
    return state.complaints.filter((c) => c.institutionId === complaint.institutionId && c.caseId !== complaint.caseId && c.status !== 'Disposed');
  }, [state.complaints, complaint]);

  if (!complaint) {
    return <EmptyState title="Case not found" sub={`No complaint matches ${caseId}.`} action={<Link to="/app/complaints" className="text-cyan-300 text-sm font-medium">← Back to Complaint Management</Link>} />;
  }

  const closeAndClear = () => { setModal(null); setStatus(''); setRemark(''); setAssignId(''); setTransferBureau(''); setNoteText(''); setDocName(''); setDocNote(''); setProceedJustification(''); };

  const updateStatus = () => {
    if (!status) { toast.error('Choose a status first.'); return; }
    runWithProgress('Updating case status…', ['Validating status transition', 'Writing to case timeline', 'Syncing dashboards'], { minStepMs: 480, jitterMs: 90 });
    dispatch({ type: 'SET_COMPLAINT_STATUS', caseId, status, remark: remark || undefined, actor, eventType: status === 'Disposed' ? 'resolve' : 'status' });
    toast.success(`${caseId} moved to ${status}.`);
    closeAndClear();
  };

  const escalate = () => {
    runWithProgress('Escalating case…', ['Attaching escalation grounds', 'Notifying Joint Secretary queue', 'Flagging on command dashboard'], { minStepMs: 560, jitterMs: 110 });
    const bump = { Low: 'Medium', Medium: 'High', High: 'Critical', Critical: 'Critical' };
    dispatch({ type: 'SET_COMPLAINT_STATUS', caseId, status: 'Escalated', eventType: 'escalate', priority: bump[complaint.priority], actor, remark: `Case escalated.${remark ? ` Grounds: ${remark}` : ''}` });
    toast.warning(`${caseId} escalated — priority raised to ${bump[complaint.priority]}.`);
    closeAndClear();
  };

  const transfer = () => {
    if (!transferBureau) { toast.error('Choose the receiving bureau.'); return; }
    runWithProgress('Transferring case…', ['Verifying bureau mandate', 'Re-routing case to receiving bureau', 'Preserving original case ID and history'], { minStepMs: 560, jitterMs: 110 });
    dispatch({ type: 'SET_COMPLAINT_STATUS', caseId, status: 'Transferred', bureau: transferBureau, eventType: 'transfer', actor, remark: `Case transferred to ${transferBureau}.${remark ? ` ${remark}` : ' Original case ID and history retained.'}` });
    toast.info(`${caseId} transferred to ${transferBureau} — history preserved.`);
    closeAndClear();
  };

  const saveNote = () => {
    if (noteText.trim().length < 3) { toast.error('Note is too short.'); return; }
    dispatch({ type: 'ADD_COMPLAINT_NOTE', caseId, author: currentUser.name, text: noteText.trim() });
    toast.success('Internal note added to the case file.');
    closeAndClear();
  };

  const resolve = () => {
    if (remark.trim().length < 8) { toast.error('Add a short resolution summary (min 8 characters).'); return; }
    runWithProgress('Disposing case…', ['Recording resolution summary', 'Closing SLA tracker', 'Updating dashboards and registers'], { minStepMs: 560, jitterMs: 110 });
    dispatch({ type: 'SET_COMPLAINT_STATUS', caseId, status: 'Disposed', eventType: 'resolve', actor, remark: `Case disposed. ${remark}` });
    toast.success(`${caseId} disposed — resolution recorded.`);
    closeAndClear();
  };

  const assign = () => {
    if (!assignId) { toast.error('Choose an officer.'); return; }
    runWithProgress('Assigning officer…', ['Checking officer workload', 'Transferring case ownership', 'Notifying assignee'], { minStepMs: 480, jitterMs: 90 });
    dispatch({ type: 'ASSIGN_OFFICER', caseId, officerId: assignId, actor });
    toast.success(`Case assigned to ${officers.find((o) => o.id === assignId)?.name}.`);
    closeAndClear();
  };

  const submitDocRequest = async () => {
    if (docName.trim().length < 4) { toast.error('Describe the document set to request.'); return; }
    const conflictHit = checkDocumentConflict(state, caseId, docName.trim());
    if (conflictHit) {
      await runWithProgress('Checking related cases across bureaus…', [
        'Reading open cases of this institution in all bureaus',
        'Comparing document requests and complainant records',
        'Scoring overlap signals',
      ], { minStepMs: 620, jitterMs: 140 });
      setDocWarning(conflictHit);
      setModal(null);
      return;
    }
    await runWithProgress('Issuing document request…', ['Validating document set', 'Recording request on the case timeline', 'Notifying the institution portal'], { minStepMs: 560, jitterMs: 100 });
    dispatch({ type: 'ADD_DOCUMENT', caseId, docName: docName.trim(), note: docNote.trim() || undefined, mode: 'normal', actor });
    toast.success(`Document request issued on ${caseId}.`);
    closeAndClear();
  };

  const proceedWithDocs = async () => {
    if (proceedJustification.trim().length < 10) { toast.error('Justification must be at least 10 characters.'); return; }
    await runWithProgress('Recording justified decision…', ['Writing justification to both case timelines', 'Notifying the other bureau’s dashboard', 'Issuing the document request'], { minStepMs: 620, jitterMs: 130 });
    dispatch({ type: 'ADD_DOCUMENT', caseId, docName: docWarning.docName, note: docWarning.note || undefined, mode: 'proceeded', justification: proceedJustification.trim(), actor });
    toast.warning('Document request issued — justification recorded on both case timelines.');
    setDocWarning(null);
    setProceedJustification('');
    setDocName(''); setDocNote('');
  };

  const coordinateFromWarning = () => {
    const w = docWarning;
    let conflictId = w.existingConflictId;
    if (!conflictId) {
      conflictId = `CF-2026-${String(state.conflicts.length + 32).padStart(4, '0')}`;
      dispatch({
        type: 'CREATE_CONFLICT',
        conflict: {
          id: conflictId, type: 'Overlapping Document Request',
          caseA: w.origin.caseId, caseB: w.target.caseId, institutionId: w.origin.institutionId,
          confidence: Math.min(0.92, 0.6 + w.similarity * 0.3), status: 'detected',
          detected: new Date().toISOString().slice(0, 10), updated: new Date().toISOString(),
          summary: `PGRC document request on ${w.origin.caseId} would duplicate the request already made by ${w.target.bureau} in ${w.target.caseId}.`,
          evidence: w.evidence.map((e) => ({ label: e.label, weight: 25, strength: e.strength, detail: e.detail })),
          actions: [],
        },
      });
    }
    setDocWarning(null);
    setDocName(''); setDocNote(''); setProceedJustification('');
    navigate(`/app/coordination/compose?conflict=${conflictId}&cases=${encodeURIComponent(`${w.origin.caseId},${w.target.caseId}`)}&to=${w.target.bureau}&doc=${encodeURIComponent(w.docName)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="complaint-detail-page">
      <button data-testid="complaint-back" onClick={() => navigate('/app/complaints')} className="text-[12.5px] text-slate-400 hover:text-cyan-300">← Back to Complaint Management</button>

      {/* Header */}
      <div className="panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span data-testid="complaint-case-id" className="font-mono2 text-[15px] font-semibold text-cyan-300">{complaint.caseId}</span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <BureauBadge code={complaint.bureau} size="sm" />
            <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{complaint.category}</span>
          </div>
          <h1 className="mt-3 font-display text-[22px] font-semibold text-slate-100 leading-snug">{complaint.subject}</h1>
          <p className="mt-1.5 text-[12px] text-slate-500">
            Submitted {fmtDate(complaint.submitted)} · Last updated {fmtDate(complaint.updated)} · SLA due {fmtDate(complaint.slaDue)}
            {over && <span data-testid="sla-overdue-chip" className="ml-2 rounded border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 font-mono2 text-[10px] font-bold text-rose-300">OVERDUE BY {daysOverdue(complaint.slaDue)} DAY{daysOverdue(complaint.slaDue) > 1 ? 'S' : ''}</span>}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button data-testid="action-request-documents" onClick={() => setModal('docs')}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3.5 py-2 text-[12.5px] font-semibold text-[#05222B] shadow-[0_0_20px_-6px_#22D3EE] hover:bg-cyan-300 transition-colors">
              <FileText size={13.5} /> Request Documents
            </button>
            <button data-testid="action-update-status" onClick={() => { setStatus(complaint.status); setModal('status'); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/60 px-3.5 py-2 text-[12.5px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors">
              <ListPlus size={13.5} /> Update Status
            </button>
            <button data-testid="action-assign-officer" onClick={() => { setAssignId(complaint.officerId); setModal('assign'); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/60 px-3.5 py-2 text-[12.5px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors">
              <UserCheck size={13.5} /> Assign Officer
            </button>
            <button data-testid="action-escalate" onClick={() => setModal('escalate')}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-400/10 px-3.5 py-2 text-[12.5px] font-medium text-rose-300 hover:bg-rose-400/20 transition-colors">
              <ArrowUpCircle size={13.5} /> Escalate
            </button>
            <button data-testid="action-transfer" onClick={() => setModal('transfer')}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-400/40 bg-violet-400/10 px-3.5 py-2 text-[12.5px] font-medium text-violet-300 hover:bg-violet-400/20 transition-colors">
              <Send size={13.5} /> Transfer
            </button>
            <button data-testid="action-resolve" onClick={() => setModal('resolve')}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-[12.5px] font-medium text-emerald-300 hover:bg-emerald-400/20 transition-colors">
              <CheckCircle2 size={13.5} /> Resolve & Dispose
            </button>
            <button data-testid="action-add-note" onClick={() => setModal('note')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/60 px-3.5 py-2 text-[12.5px] text-slate-300 hover:border-slate-500 transition-colors">
              <MessageSquarePlus size={13.5} /> Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Conflict banner */}
      {conflict && ['detected', 'flagged', 'under-review'].includes(conflict.status) && (
        <div data-testid="complaint-conflict-banner" className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-rose-400/45 bg-rose-400/10 px-5 py-4">
          <AlertTriangle size={18} className="shrink-0 text-rose-300" />
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-rose-200">Potential Overlapping Cases — Coordination Required ({conflict.id})</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-rose-200/75">{conflict.summary}</p>
          </div>
          <button data-testid="complaint-conflict-view" onClick={() => navigate(`/app/conflicts/${conflict.id}`)}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-rose-400/50 bg-rose-400/15 px-4 py-2 text-[12.5px] font-semibold text-rose-200 hover:bg-rose-400/25">
            Review evidence <ArrowRight size={13} />
          </button>
        </div>
      )}
      {conflict && ['coordinated', 'proceeded', 'dismissed'].includes(conflict.status) && (
        <div data-testid="complaint-conflict-resolved-banner" className="flex items-center gap-3 rounded-xl border border-emerald-400/35 bg-emerald-400/5 px-5 py-3.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
          <p className="text-[12.5px] text-emerald-100/80 flex-1">
            Cross-bureau conflict {conflict.id} was reviewed and closed as <span className="font-semibold">{conflict.status === 'coordinated' ? 'Coordinated' : conflict.status === 'proceeded' ? 'Proceeded with justification' : 'Dismissed'}</span>.
          </p>
          <button data-testid="complaint-conflict-view-closed" onClick={() => navigate(`/app/conflicts/${conflict.id}`)} className="text-[12px] font-medium text-emerald-300 hover:text-emerald-200">View record →</button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <SectionCard title="Case details" testid="case-details">
            <div className="grid sm:grid-cols-2 gap-3 text-[12.5px]">
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-3">
                <p className="text-slate-500 text-[11px]">Complainant</p>
                <p data-testid="complaint-complainant" className="mt-0.5 text-slate-200 font-medium">{complaint.complainant?.name}</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">{complaint.complainant?.type}</p>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-3">
                <p className="text-slate-500 text-[11px]">Assigned officer</p>
                <p data-testid="complaint-officer" className="mt-0.5 text-slate-200 font-medium">{officers.find((o) => o.id === complaint.officerId)?.name || '—'}</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">{complaint.bureau}</p>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">{complaint.description}</p>
          </SectionCard>

          {inst && (
            <Link data-testid="complaint-institution-card" to={`/app/registry/${inst.id}`} className="panel panel-hover rounded-xl p-5 block group">
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-300"><Building2 size={18} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-slate-500">Institution</p>
                  <p className="mt-0.5 text-[14px] font-medium text-slate-200 truncate">{inst.name}</p>
                  <p className="font-mono2 text-[10.5px] text-slate-500">{inst.id} · {inst.city}, {inst.state} · {otherActiveComplaints.length} other open case{otherActiveComplaints.length === 1 ? '' : 's'}</p>
                </div>
                <ArrowRight size={15} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
              </div>
            </Link>
          )}

          <SectionCard title="Documents requested" sub="Avoid requesting records another bureau already has in flight" testid="documents-card">
            {(complaint.docs || []).length === 0 ? (
              <p className="text-[12.5px] text-slate-500">No documents requested yet. Use “Request Documents” — CaseMind AI will check for cross-bureau overlap first.</p>
            ) : (
              <div className="space-y-2">
                {(complaint.docs || []).map((d, i) => (
                  <div key={i} data-testid={`doc-row-${i}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5">
                    <span className="text-[12.5px] text-slate-200">{d.name}</span>
                    <span className={`font-mono2 text-[10.5px] ${d.status === 'Awaited' ? 'text-amber-300' : 'text-emerald-300'}`}>{d.status} · requested {fmtDate(d.requestedOn)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {coordinationRefs.length > 0 && (
            <SectionCard title="Linked coordination threads" testid="coordination-links">
              <div className="space-y-2">
                {coordinationRefs.map((cr) => (
                  <button key={cr.id} data-testid={`coordination-link-${cr.id}`} onClick={() => navigate(`/app/coordination/${cr.id}`)}
                    className="w-full flex items-center gap-3 rounded-lg border border-violet-400/30 bg-violet-400/5 px-3.5 py-3 hover:bg-violet-400/15 transition-colors text-left">
                    <span className="font-mono2 text-[12px] font-semibold text-violet-300">{cr.id}</span>
                    <span className="flex-1 text-[12.5px] text-slate-300 truncate">{cr.subject}</span>
                    <span className="font-mono2 text-[10.5px] text-slate-500">{cr.fromBureau} → {cr.toBureau}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-500">Linked cases keep their own case IDs, histories and bureau ownership — coordination never merges complaints.</p>
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title="Activity timeline" testid="timeline-card">
            <Timeline events={complaint.timeline} />
          </SectionCard>
          <SectionCard title="Internal notes" testid="notes-card">
            <div className="space-y-2.5">
              {(complaint.notes || []).length === 0 && <p className="text-[12px] text-slate-500">No internal notes yet.</p>}
              {(complaint.notes || []).map((n, i) => (
                <div key={i} data-testid={`note-${i}`} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                  <p className="text-[12.5px] text-slate-300 leading-relaxed">{n.text}</p>
                  <p className="mt-1.5 font-mono2 text-[10px] text-slate-600">{n.author} · {fmtDateTime(n.ts)}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      {modal === 'status' && (
        <Modal title="Update case status" icon={ListPlus} onClose={closeAndClear} testid="modal-status">
          <div>
            <label className={labelCls}>New status</label>
            <select data-testid="status-select" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {statuses.filter((s) => s !== complaint.status).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-3">
            <label className={labelCls}>Remark (optional)</label>
            <textarea data-testid="status-remark" value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="Add context for the timeline…" className={inputCls} />
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="status-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="status-confirm" onClick={updateStatus} className="rounded-lg bg-cyan-400 px-4 py-2 text-[12.5px] font-semibold text-[#05222B] hover:bg-cyan-300">Update status</button>
          </div>
        </Modal>
      )}

      {modal === 'assign' && (
        <Modal title="Assign officer" icon={UserCheck} onClose={closeAndClear} testid="modal-assign">
          <div>
            <label className={labelCls}>Officer</label>
            <select data-testid="assign-select" value={assignId} onChange={(e) => setAssignId(e.target.value)} className={inputCls}>
              {officers.map((o) => <option key={o.id} value={o.id}>{o.name} — {o.bureau} · {o.designation}</option>)}
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="assign-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="assign-confirm" onClick={assign} className="rounded-lg bg-cyan-400 px-4 py-2 text-[12.5px] font-semibold text-[#05222B] hover:bg-cyan-300">Assign</button>
          </div>
        </Modal>
      )}

      {modal === 'escalate' && (
        <Modal title="Escalate case" icon={ArrowUpCircle} tone="#FB7185" onClose={closeAndClear} testid="modal-escalate">
          <p className="text-[12.5px] leading-relaxed text-slate-400">Escalation raises priority, notifies the senior queue and flags the case on the command dashboard.</p>
          <div className="mt-3">
            <label className={labelCls}>Escalation grounds</label>
            <textarea data-testid="escalate-remark" value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="e.g. Institution missed the compliance deadline" className={inputCls} />
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="escalate-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="escalate-confirm" onClick={escalate} className="rounded-lg bg-rose-400/90 px-4 py-2 text-[12.5px] font-semibold text-[#3B0A12] hover:bg-rose-400">Escalate case</button>
          </div>
        </Modal>
      )}

      {modal === 'transfer' && (
        <Modal title="Transfer case" icon={Send} tone="#A78BFA" onClose={closeAndClear} testid="modal-transfer">
          <p className="text-[12.5px] leading-relaxed text-slate-400">The case ID, timeline and history remain intact — only bureau ownership moves.</p>
          <div className="mt-3">
            <label className={labelCls}>Receiving bureau</label>
            <select data-testid="transfer-select" value={transferBureau} onChange={(e) => setTransferBureau(e.target.value)} className={inputCls}>
              <option value="">Select bureau…</option>
              {['PGRC', 'RB', 'AB', 'EAB', 'FAB'].filter((b) => b !== complaint.bureau).map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="mt-3">
            <label className={labelCls}>Handover note</label>
            <textarea data-testid="transfer-remark" value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="Context for the receiving bureau…" className={inputCls} />
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="transfer-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="transfer-confirm" onClick={transfer} className="rounded-lg bg-violet-400/90 px-4 py-2 text-[12.5px] font-semibold text-[#2B1065] hover:bg-violet-400">Transfer case</button>
          </div>
        </Modal>
      )}

      {modal === 'note' && (
        <Modal title="Add internal note" icon={MessageSquarePlus} tone="#94A3B8" onClose={closeAndClear} testid="modal-note">
          <textarea data-testid="note-input" value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Visible to bureau officers only — never to complainants…" className={inputCls} />
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="note-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="note-confirm" onClick={saveNote} className="rounded-lg bg-slate-300/90 px-4 py-2 text-[12.5px] font-semibold text-slate-900 hover:bg-slate-200">Add note</button>
          </div>
        </Modal>
      )}

      {modal === 'resolve' && (
        <Modal title="Resolve & dispose case" icon={CheckCircle2} tone="#34D399" onClose={closeAndClear} testid="modal-resolve">
          <p className="text-[12.5px] leading-relaxed text-slate-400">Disposal closes the SLA tracker and records the outcome on every linked view.</p>
          <div className="mt-3">
            <label className={labelCls}>Resolution summary (required)</label>
            <textarea data-testid="resolve-summary" value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} placeholder="e.g. Institution issued certificates after verification; complainant confirmed receipt." className={inputCls} />
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="resolve-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="resolve-confirm" onClick={resolve} className="rounded-lg bg-emerald-400/90 px-4 py-2 text-[12.5px] font-semibold text-[#032B1D] hover:bg-emerald-400">Dispose case</button>
          </div>
        </Modal>
      )}

      {modal === 'docs' && (
        <Modal title="Request documents" icon={FileText} onClose={closeAndClear} testid="modal-docs">
          <div>
            <label className={labelCls}>Document set</label>
            <input data-testid="doc-name" value={docName} onChange={(e) => setDocName(e.target.value)} list="doc-suggestions"
              placeholder="e.g. AICTE approval letters & affiliation records" className={inputCls} />
            <datalist id="doc-suggestions">
              <option value="AICTE approval letters & affiliation records" />
              <option value="Fee receipts & ledger extract" />
              <option value="Attendance records" />
              <option value="Faculty qualification records" />
              <option value="Fire-safety service register" />
            </datalist>
          </div>
          <div className="mt-3">
            <label className={labelCls}>Note to institution (optional)</label>
            <textarea data-testid="doc-note" value={docNote} onChange={(e) => setDocNote(e.target.value)} rows={2} className={inputCls} />
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-3.5 py-3">
            <Gavel size={14} className="mt-0.5 shrink-0 text-cyan-300" />
            <p className="text-[11.5px] leading-relaxed text-slate-400">Before issuing, CaseMind AI checks this institution’s open cases in other bureaus for overlapping document requests.</p>
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <button data-testid="docs-cancel" onClick={closeAndClear} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            <button data-testid="docs-submit" onClick={submitDocRequest} className="rounded-lg bg-cyan-400 px-4 py-2 text-[12.5px] font-semibold text-[#05222B] hover:bg-cyan-300">Check & issue request</button>
          </div>
        </Modal>
      )}

      {/* The money moment: overlap warning */}
      {docWarning && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div data-testid="doc-conflict-warning" className="relative w-[min(720px,100%)] max-h-[92vh] overflow-auto rounded-2xl border border-rose-400/50 bg-[#140A12]/98 p-6 shadow-[0_0_80px_-10px_rgba(251,113,133,0.4)] animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-rose-400/50 bg-rose-400/15 p-3 text-rose-300 shrink-0 animate-pulse-soft"><AlertTriangle size={22} /></div>
              <div className="min-w-0">
                <h3 data-testid="doc-conflict-title" className="font-display text-xl font-bold text-rose-200">Potential Overlapping Cases — Coordination Required</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-rose-100/75">
                  “{docWarning.docName}” was already requested by the <span className="font-semibold">{docWarning.target.bureau}</span> in{' '}
                  <span className="font-mono2 font-semibold">{docWarning.target.caseId}</span> ({fmtDate(docWarning.targetDoc.requestedOn)}, still {docWarning.targetDoc.status.toLowerCase()}).
                  Issuing the same request would duplicate work at {docWarning.institution?.name}.
                </p>
              </div>
            </div>

            <div className="mt-4"><EvidenceList evidence={docWarning.evidence} testid="doc-warning-evidence" /></div>

            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-slate-600/50 bg-slate-800/40 p-3.5">
                <label className={labelCls}>Proceeding anyway? Record a justification</label>
                <textarea data-testid="doc-warning-justification" value={proceedJustification} onChange={(e) => setProceedJustification(e.target.value)} rows={2}
                  placeholder="e.g. PGRC requires only the fee ledger pages; the RB request covers approval records." className={inputCls} />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2.5">
                <button data-testid="doc-warning-cancel" onClick={() => { setDocWarning(null); setProceedJustification(''); }}
                  className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:border-slate-500">Cancel request</button>
                <button data-testid="doc-warning-proceed" onClick={proceedWithDocs}
                  className="rounded-lg border border-amber-400/50 bg-amber-400/15 px-4 py-2.5 text-[12.5px] font-semibold text-amber-200 hover:bg-amber-400/25">
                  Proceed anyway (justified)
                </button>
                <button data-testid="doc-warning-coordinate" onClick={coordinateFromWarning}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-[12.5px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300">
                  <Handshake size={14} /> Coordinate with {docWarning.target.bureau}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
