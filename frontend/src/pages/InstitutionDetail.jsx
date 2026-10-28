import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Building2, CalendarCheck, ExternalLink, FileWarning, MapPin, Network,
  Pencil, Plus, Users,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import {
  ApprovalBadge, BureauBadge, ConflictStatusBadge, EmptyState, PageHeader, SectionCard,
  SkeletonTable, StatusBadge, useSimulatedLoad,
} from '@/components/shared';
import { fmtDate, daysOverdue } from '@/lib/helpers';

export default function InstitutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const loading = useSimulatedLoad(500);
  const [tab, setTab] = useState('overview');

  const inst = state.institutions.find((i) => i.id === id);
  const complaints = state.complaints.filter((c) => c.institutionId === id);
  const conflicts = state.conflicts.filter((c) => c.institutionId === id);

  const stats = useMemo(() => ({
    open: complaints.filter((c) => c.status !== 'Disposed').length,
    disposed: complaints.filter((c) => c.status === 'Disposed').length,
    bureaus: new Set(complaints.map((c) => c.bureau)).size,
    conflicts: conflicts.filter((c) => !['dismissed'].includes(c.status)).length,
  }), [complaints, conflicts]);

  const bureauActivity = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      map[c.bureau] = map[c.bureau] || { open: 0, closed: 0, last: c.updated };
      if (c.status === 'Disposed') map[c.bureau].closed += 1; else map[c.bureau].open += 1;
      if (new Date(c.updated) > new Date(map[c.bureau].last)) map[c.bureau].last = c.updated;
    });
    return Object.entries(map).map(([code, v]) => ({ code, ...v })).sort((a, b) => b.open - a.open);
  }, [complaints]);

  if (!inst && !loading) {
    return <EmptyState title="Institution not found" sub={`No record matches ${id}.`} action={<Link to="/app/registry" className="text-cyan-300 text-sm font-medium">← Back to Registry</Link>} />;
  }

  if (loading || !inst) {
    return <div className="space-y-4"><div className="shimmer h-28 rounded-xl" /><div className="shimmer h-64 rounded-xl" /></div>;
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'complaints', label: `Complaints (${complaints.length})` },
    { key: 'activity', label: 'Bureau Activity' },
    { key: 'related', label: `Related Conflicts (${conflicts.length})` },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="institution-detail-page">
      <button data-testid="institution-back" onClick={() => navigate('/app/registry')} className="text-[12.5px] text-slate-400 hover:text-cyan-300">← Back to Institution Registry</button>

      <div className="panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3.5 text-cyan-300 shrink-0">
            <Building2 size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono2 text-[12px] text-cyan-300">{inst.id}</span>
              <ApprovalBadge status={inst.approvalStatus} />
              <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{inst.type}</span>
              <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{inst.region} region</span>
            </div>
            <h1 className="mt-2.5 font-display text-2xl font-semibold text-slate-100">{inst.name}</h1>
            {inst.aliases.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="font-mono2 text-[10px] uppercase tracking-[0.16em] text-slate-500 mr-1">Also known as</span>
                {inst.aliases.map((a) => (
                  <span key={a} data-testid={`institution-alias-${a.replace(/[^a-z0-9]+/gi, '-')}`} className="rounded-full border border-slate-600/50 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-300">{a}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button data-testid="institution-edit" onClick={() => navigate(`/app/registry/${inst.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/60 px-3.5 py-2 text-[12.5px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors">
              <Pencil size={13} /> Edit record
            </button>
            <button data-testid="institution-register-complaint" onClick={() => navigate(`/app/complaints/new?institution=${inst.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3.5 py-2 text-[12.5px] font-semibold text-[#05222B] hover:bg-cyan-300 transition-colors">
              <Plus size={13} /> Register complaint
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'Open cases', v: stats.open, tone: '#FBBF24' },
          { label: 'Disposed', v: stats.disposed, tone: '#34D399' },
          { label: 'Bureaus involved', v: stats.bureaus, tone: '#A78BFA' },
          { label: 'Active conflicts', v: stats.conflicts, tone: '#FB7185' },
        ].map((s, i) => (
          <div key={s.label} data-testid={`institution-stat-${i}`} className="panel rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="font-display text-3xl font-semibold" style={{ color: s.tone }}>{s.v}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-700/40 pb-px">
        {TABS.map((t) => (
          <button key={t.key} data-testid={`institution-tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`rounded-t-lg px-4 py-2.5 text-[12.5px] font-medium border-b-2 transition-colors ${tab === t.key ? 'border-cyan-300 text-cyan-200 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <SectionCard title="Registry record" testid="institution-overview">
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              {[
                ['Institution ID', inst.id], ['AISHE code', inst.aishe],
                ['Established', inst.established], ['Students enrolled', inst.students?.toLocaleString('en-IN')],
                ['Programmes', inst.programs], ['Head of institution', inst.head],
                ['Phone', inst.phone], ['Email', inst.email],
                ['Last inspection', fmtDate(inst.lastInspection)], ['Region', `${inst.region} · ${inst.state}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
                  <p className="text-slate-500 text-[11px]">{k}</p>
                  <p className="mt-0.5 text-slate-200 font-medium break-words">{v}</p>
                </div>
              ))}
            </div>
            {inst.notes && (
              <p className="mt-3 rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-3.5 py-3 text-[12px] leading-relaxed text-cyan-100/80">
                <span className="font-semibold text-cyan-300">Registry note · </span>{inst.notes}
              </p>
            )}
          </SectionCard>
          <SectionCard title="Location & footprint" testid="institution-location">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 h-56 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-70" />
              <div className="relative h-full flex flex-col items-center justify-center text-center">
                <div className="rounded-full border border-cyan-400/40 bg-cyan-400/10 p-3 text-cyan-300 animate-pulse-soft"><MapPin size={20} /></div>
                <p className="mt-3 text-[14px] font-medium text-slate-200">{inst.city}, {inst.state}</p>
                <p className="font-mono2 text-[10.5px] text-slate-500 mt-1">{inst.region} REGION · {inst.type.toUpperCase()} INSTITUTION</p>
                <p className="mt-3 text-[11px] text-slate-500">Map view is a stylised demo placeholder — no live geodata connected.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'complaints' && (
        <SectionCard title="Complaints linked to this institution" testid="institution-complaints" bodyClass="p-0"
          actions={<button data-testid="institution-complaints-new" onClick={() => navigate(`/app/complaints/new?institution=${inst.id}`)} className="text-[12px] font-medium text-cyan-300">Register new →</button>}>
          {complaints.length === 0 ? (
            <div className="p-5"><EmptyState icon={FileWarning} title="No complaints on file" sub="This institution has a clean grievance record in the demo data." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left" data-testid="institution-complaints-table">
                <thead>
                  <tr className="border-b border-slate-700/40 text-[10.5px] font-mono2 uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-5 py-3 font-medium">Case ID</th><th className="px-5 py-3 font-medium">Subject</th>
                    <th className="px-5 py-3 font-medium">Bureau</th><th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => {
                    const over = c.status !== 'Disposed' && daysOverdue(c.slaDue) > 0;
                    return (
                      <tr key={c.caseId} data-testid={`institution-complaint-${c.caseId}`} onClick={() => navigate(`/app/complaints/${c.caseId}`)}
                        className="border-b border-slate-800/60 last:border-0 hover:bg-cyan-400/5 cursor-pointer transition-colors">
                        <td className="px-5 py-3 font-mono2 text-[12px] text-cyan-300">{c.caseId}</td>
                        <td className="px-5 py-3 text-[12.5px] text-slate-300 max-w-[260px] truncate">{c.subject}</td>
                        <td className="px-5 py-3"><BureauBadge code={c.bureau} size="sm" /></td>
                        <td className="px-5 py-3 text-[12px] text-slate-300">{c.priority}</td>
                        <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                        <td className={`px-5 py-3 font-mono2 text-[11px] ${over ? 'text-rose-300' : 'text-slate-500'}`}>{over ? `Overdue ${daysOverdue(c.slaDue)}d` : fmtDate(c.slaDue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {tab === 'activity' && (
        <div className="space-y-3.5">
          {bureauActivity.map((b, i) => (
            <div key={b.code} data-testid={`bureau-activity-${b.code}`} className="panel rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BureauBadge code={b.code} />
                  <p className="text-[12.5px] text-slate-400">Last activity {fmtDate(b.last)}</p>
                </div>
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="text-amber-300 font-mono2">{b.open} open</span>
                  <span className="text-emerald-300 font-mono2">{b.closed} disposed</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${(b.open / Math.max(b.open + b.closed, 1)) * 100}%`,
                  background: 'linear-gradient(90deg,#FBBF2488,#FBBF24)',
                }} />
              </div>
            </div>
          ))}
          {bureauActivity.length === 0 && <EmptyState icon={CalendarCheck} title="No bureau activity yet" sub="Complaint and coordination actions will appear here." />}
        </div>
      )}

      {tab === 'related' && (
        <div className="space-y-3.5">
          {conflicts.length === 0 ? (
            <EmptyState icon={Network} title="No conflicts involve this institution" sub="Cross-bureau overlaps will be listed here when detected." />
          ) : conflicts.map((cf) => (
            <button key={cf.id} data-testid={`institution-conflict-${cf.id}`} onClick={() => navigate(`/app/conflicts/${cf.id}`)}
              className="panel panel-hover rounded-xl p-5 w-full text-left block">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono2 text-[13px] font-semibold text-rose-300">{cf.id}</span>
                <ConflictStatusBadge status={cf.status} />
                <span className="rounded-md border border-slate-600/50 px-2 py-0.5 font-mono2 text-[10.5px] text-slate-400">{cf.type}</span>
                <span className="ml-auto font-mono2 text-[11px] text-slate-500">{Math.round(cf.confidence * 100)}% confidence</span>
              </div>
              <p className="mt-2.5 text-[13px] text-slate-300">{cf.summary}</p>
              <div className="mt-2.5 flex items-center gap-2 font-mono2 text-[11px] text-cyan-300">
                {cf.caseA} <Network size={11} className="text-slate-500" /> {cf.caseB}
                <ArrowRight size={12} className="text-slate-500 ml-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
