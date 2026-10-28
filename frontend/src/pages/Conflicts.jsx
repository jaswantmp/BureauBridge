import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, Network, Search } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import {
  BureauBadge, ConfidenceMeter, ConflictStatusBadge, EmptyState, PageHeader, SkeletonTable,
  useSimulatedLoad,
} from '@/components/shared';
import { fmtDate } from '@/lib/helpers';

const FILTERS = [
  { key: 'all', label: 'All conflicts' },
  { key: 'detected', label: 'Detected' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'coordinated', label: 'Coordinated' },
  { key: 'proceeded', label: 'Proceeded' },
  { key: 'dismissed', label: 'Dismissed' },
];

export default function Conflicts() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const loading = useSimulatedLoad(650);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [bureau, setBureau] = useState('all');

  const conflicts = state.conflicts;
  const institutions = state.institutions;
  const complaints = state.complaints;

  const stats = useMemo(() => ({
    active: conflicts.filter((c) => ['detected', 'flagged', 'under-review'].includes(c.status)).length,
    high: conflicts.filter((c) => c.confidence >= 0.8 && !['dismissed'].includes(c.status)).length,
    coordinated: conflicts.filter((c) => c.status === 'coordinated').length,
    dismissed: conflicts.filter((c) => c.status === 'dismissed').length,
  }), [conflicts]);

  const filtered = useMemo(() => {
    let list = [...conflicts].sort((a, b) => b.confidence - a.confidence);
    if (filter !== 'all') list = list.filter((c) => c.status === filter);
    if (bureau !== 'all') {
      list = list.filter((c) => {
        const a = complaints.find((x) => x.caseId === c.caseA);
        const b = complaints.find((x) => x.caseId === c.caseB);
        return a?.bureau === bureau || b?.bureau === bureau;
      });
    }
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((c) => {
        const inst = institutions.find((i) => i.id === c.institutionId);
        return c.id.toLowerCase().includes(term) || c.type.toLowerCase().includes(term) || (inst?.name || '').toLowerCase().includes(term) || c.caseA.toLowerCase().includes(term) || c.caseB.toLowerCase().includes(term);
      });
    }
    return list;
  }, [conflicts, complaints, institutions, filter, bureau, q]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="conflicts-page">
      <PageHeader
        testid="conflicts-header"
        eyebrow="Cross-Bureau Conflict Intelligence"
        title="Overlaps, flagged before they cost a second request"
        sub="Explainable matching across PGRC, RB, AB, EAB and FAB case files — every signal is reviewable by a human officer before any action."
      />

      <div className="flex items-start gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/5 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-cyan-300" />
        <p className="text-[12px] leading-relaxed text-slate-300">
          <span className="font-semibold text-cyan-200">How this works in the demo:</span> the matching engine is a
          frontend simulation. Evidence weights and confidence scores are fixed demonstration values — no live AI
          model or government system is connected.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'Active conflicts', value: stats.active, tone: '#FB7185' },
          { label: 'High confidence', value: stats.high, tone: '#F87171' },
          { label: 'Coordinated to date', value: stats.coordinated, tone: '#34D399' },
          { label: 'Dismissed (false positive)', value: stats.dismissed, tone: '#94A3B8' },
        ].map((s, i) => (
          <div key={s.label} data-testid={`conflict-stat-${i}`} className="panel rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="font-display text-3xl font-semibold" style={{ color: s.tone }}>{s.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} data-testid={`conflict-filter-${f.key}`} onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${filter === f.key ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select data-testid="conflict-bureau-filter" value={bureau} onChange={(e) => setBureau(e.target.value)}
          className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
          <option value="all">All bureaus</option>
          {['PGRC', 'RB', 'AB', 'EAB', 'FAB'].map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2 w-full lg:w-64 focus-within:border-cyan-400/50">
          <Search size={13} className="text-slate-500" />
          <input data-testid="conflict-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conflicts, case IDs…"
            className="w-full bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-500 outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="panel rounded-xl p-5"><SkeletonTable rows={4} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Network} title="No conflicts match this view" sub="Try clearing the filters — or register a complaint and let the engine scan for overlaps." />
      ) : (
        <div className="space-y-3.5">
          {filtered.map((cf, idx) => {
            const inst = institutions.find((i) => i.id === cf.institutionId);
            const a = complaints.find((x) => x.caseId === cf.caseA);
            const b = complaints.find((x) => x.caseId === cf.caseB);
            return (
              <div key={cf.id} data-testid={`conflict-card-${cf.id}`}
                className="panel panel-hover rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono2 text-[13px] font-semibold text-rose-300">{cf.id}</span>
                      <ConflictStatusBadge status={cf.status} />
                      <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{cf.type}</span>
                    </div>
                    <p className="mt-2.5 text-[14px] font-medium text-slate-200 leading-snug">{cf.summary}</p>
                    <p className="mt-1.5 text-[12px] text-slate-500">{inst?.name} · detected {fmtDate(cf.detected)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      <BureauBadge code={a?.bureau || '—'} size="sm" />
                      <span className="font-mono2 text-[11.5px] text-cyan-300">{cf.caseA}</span>
                      <Network size={12} className="text-slate-500" />
                      <BureauBadge code={b?.bureau || '—'} size="sm" />
                      <span className="font-mono2 text-[11.5px] text-cyan-300">{cf.caseB}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-3 lg:w-64 shrink-0">
                    <ConfidenceMeter value={cf.confidence} />
                    <button data-testid={`conflict-investigate-${cf.id}`} onClick={() => navigate(`/app/conflicts/${cf.id}`)}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400/15 border border-cyan-400/40 px-4 py-2 text-[12.5px] font-semibold text-cyan-200 hover:bg-cyan-400/25 transition-colors">
                      Investigate conflict →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
