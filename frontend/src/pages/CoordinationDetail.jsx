import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCheck, CheckCircle2, Link2, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import {
  BureauBadge, CoordStatusBadge, EmptyState, PageHeader, PriorityBadge, SectionCard, Timeline,
} from '@/components/shared';
import { fmtDateTime } from '@/lib/helpers';

const KIND_STYLES = {
  request: { ring: 'border-indigo-400/40 bg-indigo-400/10', label: 'Coordination request' },
  ack: { ring: 'border-sky-400/40 bg-sky-400/10', label: 'Acknowledgement' },
  reply: { ring: 'border-slate-600/50 bg-slate-800/60', label: 'Reply' },
  resolve: { ring: 'border-emerald-400/40 bg-emerald-400/10', label: 'Resolved' },
  system: { ring: 'border-slate-600/50 bg-slate-800/40', label: 'System' },
};

export default function CoordinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, runWithProgress, currentUser, officers } = useApp();
  const [reply, setReply] = useState('');
  const [confirmResolve, setConfirmResolve] = useState(false);

  const cr = state.coordinations.find((x) => x.id === id);
  if (!cr) {
    return <EmptyState title="Coordination thread not found" sub={`No request matches ${id}.`} action={<Link to="/app/coordination" className="text-violet-300 text-sm font-medium">← Back to coordination inbox</Link>} />;
  }

  const linkedComplaints = (cr.linkedCases || []).map((caseId) => state.complaints.find((c) => c.caseId === caseId)).filter(Boolean);
  const receivingOfficer = officers.find((o) => o.bureau === cr.toBureau);
  const isDraft = cr.status === 'Draft';
  const canAck = cr.status === 'Pending Acknowledgement';
  const canReply = !isDraft && cr.status !== 'Resolved';
  const canResolve = ['Acknowledged', 'In Discussion'].includes(cr.status);

  const acknowledge = async () => {
    await runWithProgress('Recording acknowledgement…', [
      'Verifying receiving bureau desk',
      'Logging acknowledgement on the shared timeline',
      'Notifying the requesting bureau',
    ], { minStepMs: 560, jitterMs: 110 });
    dispatch({
      type: 'UPDATE_COORDINATION', id, status: 'Acknowledged',
      actor: `${receivingOfficer?.name || cr.toBureau} · ${cr.toBureau}`,
      message: { from: `${cr.toBureau} · ${receivingOfficer?.name || 'Desk'}`, kind: 'ack', text: `Acknowledged by ${cr.toBureau}. ${receivingOfficer?.name || 'The desk'} will pick this up and respond on the linked cases.` },
    });
    toast.success(`${id} acknowledged by ${cr.toBureau} — requesting bureau notified.`);
  };

  const sendReply = () => {
    if (reply.trim().length < 5) { toast.error('Write a message before sending.'); return; }
    dispatch({
      type: 'UPDATE_COORDINATION', id, status: 'In Discussion',
      actor: `${currentUser.name} · ${currentUser.bureau}`,
      message: { from: `${currentUser.bureau} · ${currentUser.name}`, kind: 'reply', text: reply.trim() },
    });
    setReply('');
    toast.success('Reply posted to the shared thread.');
  };

  const markResolved = () => {
    dispatch({
      type: 'UPDATE_COORDINATION', id, status: 'Resolved',
      actor: `${currentUser.name} · ${currentUser.bureau}`,
      message: { from: `${currentUser.bureau} · ${currentUser.name}`, kind: 'resolve', text: 'Coordination complete — outcome recorded on both linked cases. Marking this thread resolved.' },
    });
    setConfirmResolve(false);
    toast.success(`${id} resolved — linked case timelines were updated (histories preserved).`);
  };

  const sendDraft = async () => {
    await runWithProgress('Sending coordination request…', [
      'Validating recipient bureau desk',
      'Attaching linked case references',
      `Transmitting request to ${cr.toBureau}`,
    ], { minStepMs: 600, jitterMs: 120 });
    dispatch({
      type: 'UPDATE_COORDINATION', id, status: 'Pending Acknowledgement',
      actor: `${currentUser.name} · ${currentUser.bureau}`,
      message: { from: `${currentUser.bureau} · ${currentUser.name}`, kind: 'request', text: cr.draftMessage || 'Draft sent to the receiving bureau.' },
    });
    toast.success(`Draft ${id} sent to ${cr.toBureau}.`);
  };

  const timelineEvents = cr.messages.map((m, i) => ({
    ts: m.ts,
    actor: m.from,
    type: m.kind === 'request' ? 'coordination' : m.kind === 'ack' ? 'ack' : m.kind === 'resolve' ? 'resolve' : 'note',
    text: `${KIND_STYLES[m.kind]?.label || 'Message'}: ${m.text}`,
  }));

  return (
    <div className="space-y-6 animate-fade-in" data-testid="coordination-detail-page">
      <button data-testid="coordination-back" onClick={() => navigate('/app/coordination')} className="text-[12.5px] text-slate-400 hover:text-violet-300">← Back to coordination inbox</button>

      <div className="panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span data-testid="coordination-id" className="font-mono2 text-[15px] font-semibold text-violet-300">{cr.id}</span>
            <CoordStatusBadge status={cr.status} />
            <PriorityBadge priority={cr.priority} />
            <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">Initiated {cr.initiated}</span>
          </div>
          <h1 className="mt-3 font-display text-[22px] font-semibold text-slate-100 leading-snug">{cr.subject}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
            <BureauBadge code={cr.fromBureau} size="sm" /> <span>requests</span> <BureauBadge code={cr.toBureau} size="sm" />
            {cr.conflictId && <span className="ml-2 rounded-md border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 font-mono2 text-[10px] font-bold text-rose-300">CONFLICT {cr.conflictId}</span>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isDraft ? (
              <button data-testid="coordination-send-draft" onClick={sendDraft}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 text-[12.5px] font-semibold text-[#23063B] hover:bg-violet-300">
                <Send size={13.5} /> Send this draft to {cr.toBureau}
              </button>
            ) : (
              <>
                {canAck && (
                  <button data-testid="coordination-acknowledge" onClick={acknowledge}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-[12.5px] font-semibold text-[#03283B] hover:bg-sky-300">
                    <ShieldCheck size={13.5} /> Acknowledge (acting as {cr.toBureau})
                  </button>
                )}
                {canResolve && (
                  <button data-testid="coordination-resolve" onClick={() => setConfirmResolve(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-[12.5px] font-medium text-emerald-300 hover:bg-emerald-400/20">
                    <CheckCheck size={13.5} /> Mark coordination resolved
                  </button>
                )}
                {cr.conflictId && (
                  <button data-testid="coordination-view-conflict" onClick={() => navigate(`/app/conflicts/${cr.conflictId}`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-[12.5px] font-medium text-rose-300 hover:bg-rose-400/20">
                    View conflict {cr.conflictId}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          <SectionCard title="Conversation" sub="Shared thread visible to both bureaus" testid="coordination-thread">
            {cr.messages.length === 0 ? (
              <p className="text-[12.5px] text-slate-500">This is a draft — no messages sent yet.</p>
            ) : (
              <div className="space-y-3">
                {cr.messages.map((m, i) => {
                  const st = KIND_STYLES[m.kind] || KIND_STYLES.system;
                  return (
                    <div key={i} data-testid={`coordination-message-${i}`} className={`rounded-xl border px-4 py-3.5 ${st.ring}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-semibold text-slate-200">{m.from}</p>
                        <span className="font-mono2 text-[10px] text-slate-500">{fmtDateTime(m.ts)}</span>
                      </div>
                      <p className="mt-0.5 font-mono2 text-[9.5px] uppercase tracking-[0.16em] text-slate-500">{st.label}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{m.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {canReply && (
              <div className="mt-5" data-testid="coordination-reply-box">
                <label className="text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500">Reply as {currentUser.bureau} · {currentUser.name}</label>
                <textarea data-testid="coordination-reply-input" value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                  placeholder="Share case strategy, document status or next steps…" className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-400/60" />
                <div className="mt-3 flex justify-end">
                  <button data-testid="coordination-reply-send" onClick={sendReply}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 text-[12.5px] font-semibold text-[#23063B] hover:bg-violet-300">
                    <MessageSquare size={13.5} /> Post reply
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {confirmResolve && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/5 p-5" data-testid="coordination-resolve-confirm">
              <p className="text-[13px] font-semibold text-emerald-200">Mark this coordination as resolved?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">Both linked cases will get a timeline entry. Their IDs, histories and bureau ownership remain separate — resolution only closes the shared thread.</p>
              <div className="mt-4 flex justify-end gap-2.5">
                <button data-testid="coordination-resolve-cancel" onClick={() => setConfirmResolve(false)} className="rounded-lg border border-slate-600/60 px-4 py-2 text-[12.5px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
                <button data-testid="coordination-resolve-confirm" onClick={markResolved} className="rounded-lg bg-emerald-400/90 px-4 py-2 text-[12.5px] font-semibold text-[#032B1D] hover:bg-emerald-400">Yes — resolve thread</button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Linked cases" sub="Unmerged by design" testid="coordination-linked-cases">
            <div className="space-y-2.5">
              {linkedComplaints.map((c) => (
                <button key={c.caseId} data-testid={`coordination-case-${c.caseId}`} onClick={() => navigate(`/app/complaints/${c.caseId}`)}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800/40 p-3.5 text-left hover:border-violet-400/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono2 text-[12px] font-semibold text-cyan-300">{c.caseId}</span>
                    <BureauBadge code={c.bureau} size="sm" />
                  </div>
                  <p className="mt-1 text-[12px] text-slate-300 truncate">{c.subject}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
              <Link2 size={12} className="mt-0.5 shrink-0 text-violet-300" />
              The platform connects relevant information without merging: original case IDs, individual histories and bureau ownership all stay separate.
            </p>
          </SectionCard>

          <SectionCard title="Shared activity timeline" testid="coordination-activity">
            <Timeline events={[{ ts: cr.initiated, actor: `${cr.fromBureau} · ${cr.initiatorName}`, type: 'coordination', text: `Coordination request ${cr.id} created and sent to ${cr.toBureau}.` }, ...timelineEvents]} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
