import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, Building2, Check, ClipboardList, Plus, Search, ShieldQuestion, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import {
  ApprovalBadge, EmptyState, PageHeader, SectionCard, SkeletonTable, useSimulatedLoad,
} from '@/components/shared';
import { fmtDate, tokenSimilarity } from '@/lib/helpers';

function MatchReviewModal({ candidate, onClose, onConfirm, onDismiss }) {
  const { state } = useApp();
  const inst = state.institutions.find((i) => i.id === candidate.matchesInstitution);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div data-testid="match-review-modal" className="relative w-[min(760px,100%)] max-h-[90vh] overflow-auto panel rounded-2xl p-6 animate-scale-in">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-amber-300">Duplicate detection · human review required</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-slate-100">{candidate.id} — {Math.round(candidate.confidence * 100)}% match confidence</h3>
          </div>
          <button data-testid="match-review-close" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"><X size={16} /></button>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-3">
          <div data-testid="match-raw-record" className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-amber-300">Incoming record (raw)</p>
            <p className="mt-2 text-[14px] font-semibold text-slate-100">{candidate.rawName}</p>
            <p className="mt-1 text-[12px] text-slate-400">{candidate.rawCity}, {candidate.rawState}</p>
            <p className="mt-2 font-mono2 text-[10.5px] text-slate-500">AISHE: {candidate.rawAishe} · Source: {candidate.source}</p>
          </div>
          <div data-testid="match-registry-record" className="rounded-xl border border-cyan-400/40 bg-cyan-400/5 p-4">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-cyan-300">Existing registry record</p>
            <p className="mt-2 text-[14px] font-semibold text-slate-100">{inst?.name}</p>
            <p className="mt-1 text-[12px] text-slate-400">{inst?.city}, {inst?.state} · {inst?.type}</p>
            <p className="mt-2 font-mono2 text-[10.5px] text-slate-500">{inst?.id} · {inst?.aishe} · est. {inst?.established}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Matching evidence</p>
          <div className="space-y-2">
            {candidate.evidence.map((ev, i) => (
              <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-slate-200">{ev.label}</p>
                  <span className="font-mono2 text-[11px] text-slate-400">{Math.round((ev.strength || 0) * 100)}%</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-slate-700/60 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${ev.strength * 100}%`, background: 'linear-gradient(90deg,#FBBF2488,#FBBF24)' }} />
                </div>
                <p className="mt-1.5 text-[11.5px] text-slate-400">{ev.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2.5">
          <button data-testid="match-dismiss" onClick={() => onDismiss('Not the same institution — reviewed by officer')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/60 px-4 py-2.5 text-[13px] text-slate-300 hover:border-slate-500 hover:text-slate-200">
            <X size={14} /> Not a match — dismiss
          </button>
          <button data-testid="match-confirm" onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-[#3A2503] hover:bg-amber-300">
            <Check size={15} /> Confirm match & merge alias
          </button>
        </div>
        <p className="mt-3 text-[10.5px] leading-relaxed text-slate-600">
          Confirming adds the incoming name as an alias of the existing record — no complaint history is lost or merged.
        </p>
      </div>
    </div>
  );
}

export default function Registry() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const loading = useSimulatedLoad(650);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [region, setRegion] = useState('all');
  const [reviewId, setReviewId] = useState(null);
  const matchTab = params.get('tab') === 'matches';

  const institutions = state.institutions;
  const pendingMatches = state.matchCandidates.filter((m) => m.status === 'pending');
  const candidate = state.matchCandidates.find((m) => m.id === reviewId);

  const filtered = useMemo(() => {
    let list = [...institutions].sort((a, b) => a.id.localeCompare(b.id));
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(term) || i.aliases.some((a) => a.toLowerCase().includes(term)) || i.id.toLowerCase().includes(term) || i.city.toLowerCase().includes(term) || i.state.toLowerCase().includes(term));
    }
    if (type !== 'all') list = list.filter((i) => i.type === type);
    if (status !== 'all') list = list.filter((i) => i.approvalStatus === status);
    if (region !== 'all') list = list.filter((i) => i.region === region);
    return list;
  }, [institutions, q, type, status, region]);

  const openByInst = useMemo(() => {
    const map = {};
    state.complaints.forEach((c) => {
      map[c.institutionId] = map[c.institutionId] || { open: 0, total: 0, bureaus: new Set() };
      map[c.institutionId].total += 1;
      if (c.status !== 'Disposed') { map[c.institutionId].open += 1; map[c.institutionId].bureaus.add(c.bureau); }
    });
    return map;
  }, [state.complaints]);

  const confirmMatch = (cand) => {
    dispatch({ type: 'CONFIRM_MATCH', candidateId: cand.id });
    toast.success(`Match confirmed — “${cand.rawName}” merged as alias of ${cand.matchesInstitution}.`);
    setReviewId(null);
  };
  const dismissMatch = (cand, reason) => {
    dispatch({ type: 'DISMISS_MATCH', candidateId: cand.id, reason });
    toast.info(`${cand.id} dismissed — record kept separate.`);
    setReviewId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="registry-page">
      <PageHeader
        testid="registry-header"
        eyebrow="Institution Registry"
        title="Institution records with human-reviewed matching"
        sub="Search the registry, inspect bureau activity, and resolve duplicate-name candidates before they fragment case histories."
        actions={
          <button data-testid="add-institution" onClick={() => navigate('/app/registry/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300 transition-colors">
            <Plus size={15} /> Add Institution
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button data-testid="tab-registry" onClick={() => setParams({})}
          className={`rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${!matchTab ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200'}`}>
          Registry ({institutions.length})
        </button>
        <button data-testid="tab-matches" onClick={() => setParams({ tab: 'matches' })}
          className={`rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors inline-flex items-center gap-2 ${matchTab ? 'border-amber-400/60 bg-amber-400/15 text-amber-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200'}`}>
          <ClipboardList size={12} /> Match review ({pendingMatches.length})
          {pendingMatches.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse-soft" />}
        </button>
      </div>

      {!matchTab ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { label: 'Total institutions', v: institutions.length, tone: '#22D3EE' },
              { label: 'Approved', v: institutions.filter((i) => i.approvalStatus === 'Approved').length, tone: '#34D399' },
              { label: 'Under review / conditional', v: institutions.filter((i) => ['Approval Under Review', 'Conditional'].includes(i.approvalStatus)).length, tone: '#FBBF24' },
              { label: 'Notice issued', v: institutions.filter((i) => i.approvalStatus === 'Notice Issued').length, tone: '#FB7185' },
            ].map((s, i) => (
              <div key={s.label} data-testid={`registry-stat-${i}`} className="panel rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="font-display text-3xl font-semibold" style={{ color: s.tone }}>{s.v}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 flex-1 focus-within:border-cyan-400/50">
              <Search size={14} className="text-slate-500" />
              <input data-testid="registry-search" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, alias, city, state or ID…" className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select data-testid="registry-filter-type" value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
                <option value="all">All types</option>
                {['Engineering', 'Management', 'Pharmacy', 'Polytechnic', 'Design', 'University'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select data-testid="registry-filter-status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
                <option value="all">All approval statuses</option>
                {['Approved', 'Approval Under Review', 'Conditional', 'Notice Issued'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select data-testid="registry-filter-region" value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
                <option value="all">All regions</option>
                {['South', 'West', 'North', 'East', 'Central', 'North-East'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="panel rounded-xl p-5"><SkeletonTable rows={7} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Building2} title="No institutions match your filters"
              sub="Try a different search term or clear the type / status / region filters."
              action={<button data-testid="registry-clear-filters" onClick={() => { setQ(''); setType('all'); setStatus('all'); setRegion('all'); }} className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[12.5px] font-medium text-cyan-200">Clear filters</button>} />
          ) : (
            <div className="panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left" data-testid="registry-table">
                  <thead>
                    <tr className="border-b border-slate-700/40 text-[10.5px] font-mono2 uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-5 py-3 font-medium">Institution</th>
                      <th className="px-5 py-3 font-medium">Location</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Approval</th>
                      <th className="px-5 py-3 font-medium">Open cases</th>
                      <th className="px-5 py-3 font-medium">Bureau activity</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inst) => {
                      const st = openByInst[inst.id] || { open: 0, total: 0, bureaus: new Set() };
                      return (
                        <tr key={inst.id} data-testid={`registry-row-${inst.id}`}
                          onClick={() => navigate(`/app/registry/${inst.id}`)}
                          className="border-b border-slate-800/60 last:border-0 hover:bg-cyan-400/5 cursor-pointer transition-colors">
                          <td className="px-5 py-3.5 max-w-[320px]">
                            <p className="text-[13px] font-medium text-slate-200 truncate">{inst.name}</p>
                            <p className="font-mono2 text-[10px] text-slate-500 mt-0.5">{inst.id} · {inst.aliases.length > 0 ? `aliases: ${inst.aliases.join(', ')}` : 'no aliases'}</p>
                          </td>
                          <td className="px-5 py-3.5 text-[12.5px] text-slate-300">{inst.city}, <span className="text-slate-500">{inst.state}</span></td>
                          <td className="px-5 py-3.5 text-[12.5px] text-slate-300">{inst.type}</td>
                          <td className="px-5 py-3.5"><ApprovalBadge status={inst.approvalStatus} /></td>
                          <td className="px-5 py-3.5">
                            <span className={`font-mono2 text-[13px] font-semibold ${st.open > 0 ? 'text-amber-300' : 'text-slate-500'}`}>{st.open}</span>
                            <span className="text-[11px] text-slate-600"> / {st.total}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1">
                              {st.bureaus.size === 0 ? <span className="text-[11px] text-slate-600">—</span> :
                                [...st.bureaus].map((b) => <span key={b} className="font-mono2 text-[10px] rounded border border-slate-600/60 px-1.5 py-0.5 text-slate-400">{b}</span>)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button data-testid={`registry-view-${inst.id}`} onClick={() => navigate(`/app/registry/${inst.id}`)}
                              className="rounded-md border border-slate-600/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors">View</button>
                            <button data-testid={`registry-edit-${inst.id}`} onClick={() => navigate(`/app/registry/${inst.id}/edit`)}
                              className="ml-1.5 rounded-md border border-slate-600/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors">Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4" data-testid="match-review-panel">
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-[12px] leading-relaxed text-slate-300">
              The ingestion feed found institution records that may already exist in the registry. A human officer must
              review the matching evidence — confirming a match merges the incoming name as an <span className="text-amber-200">alias</span>;
              nothing is deleted.
            </p>
          </div>

          {state.matchCandidates.filter((m) => m.status === 'pending').length === 0 && state.matchCandidates.filter((m) => m.status !== 'pending').length === 0 ? (
            <EmptyState icon={Check} title="No match candidates" sub="Newly ingested records will appear here when the demo feed detects possible duplicates." />
          ) : (
            <>
              {state.matchCandidates.filter((m) => m.status === 'pending').map((m, i) => (
                <div key={m.id} data-testid={`match-candidate-${m.id}`} className="panel panel-hover rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono2 text-[13px] font-semibold text-amber-300">{m.id}</span>
                        <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{Math.round(m.confidence * 100)}% confidence</span>
                        <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{fmtDate(m.submitted)}</span>
                      </div>
                      <p className="mt-2 text-[14px] font-medium text-slate-200">“{m.rawName}” → {state.institutions.find((x) => x.id === m.matchesInstitution)?.name}</p>
                      <p className="mt-1 text-[12px] text-slate-500">{m.evidence[0].detail}</p>
                    </div>
                    <div className="flex gap-2 lg:w-56 shrink-0">
                      <button data-testid={`match-review-open-${m.id}`} onClick={() => setReviewId(m.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-[12.5px] font-semibold text-amber-200 hover:bg-amber-400/20">
                        <ShieldQuestion size={13} /> Review match
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {state.matchCandidates.filter((m) => m.status !== 'pending').map((m) => (
                <div key={m.id} data-testid={`match-decided-${m.id}`} className="panel rounded-xl p-4 opacity-70">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono2 text-[12px] text-slate-400">{m.id}</span>
                    <span className={`rounded-full border px-2 py-0.5 font-mono2 text-[10px] ${m.status === 'confirmed' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-500/40 bg-slate-500/10 text-slate-400'}`}>
                      {m.status === 'confirmed' ? 'Confirmed & merged as alias' : `Dismissed — ${m.reason || 'not a match'}`}
                    </span>
                    <span className="text-[12px] text-slate-500">“{m.rawName}” → {m.matchesInstitution}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {candidate && <MatchReviewModal candidate={candidate} onClose={() => setReviewId(null)} onConfirm={() => confirmMatch(candidate)} onDismiss={(r) => dismissMatch(candidate, r)} />}
    </div>
  );
}
