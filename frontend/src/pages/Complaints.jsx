import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileWarning, Plus, Search } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import {
  BureauBadge, EmptyState, PageHeader, PriorityBadge, SkeletonTable, StatusBadge, useSimulatedLoad,
} from '@/components/shared';
import { daysOverdue, fmtDate } from '@/lib/helpers';

const STATUS_CHIPS = ['Received', 'Under Process', 'Pending', 'Transferred', 'Escalated', 'Disposed'];

export default function Complaints() {
  const { state } = useApp();
  const navigate = useNavigate();
  const loading = useSimulatedLoad(650);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bureau, setBureau] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');

  const complaints = state.complaints;
  const institutions = state.institutions;

  const stats = useMemo(() => ({
    total: complaints.length,
    open: complaints.filter((c) => c.status !== 'Disposed').length,
    overdue: complaints.filter((c) => c.status !== 'Disposed' && daysOverdue(c.slaDue) > 0).length,
    escalated: complaints.filter((c) => c.status === 'Escalated').length,
  }), [complaints]);

  const filtered = useMemo(() => {
    let list = [...complaints].sort((a, b) => new Date(b.updated) - new Date(a.updated));
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((c) =>
        c.caseId.toLowerCase().includes(term) || c.subject.toLowerCase().includes(term) ||
        (c.complainant?.name || '').toLowerCase().includes(term) ||
        (institutions.find((i) => i.id === c.institutionId)?.name || '').toLowerCase().includes(term));
    }
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (bureau !== 'all') list = list.filter((c) => c.bureau === bureau);
    if (priority !== 'all') list = list.filter((c) => c.priority === priority);
    if (category !== 'all') list = list.filter((c) => c.category === category);
    return list;
  }, [complaints, institutions, q, statusFilter, bureau, priority, category]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="complaints-page">
      <PageHeader
        testid="complaints-header"
        eyebrow="Complaint Management"
        title="Case register across all bureaus"
        sub="Every complaint keeps its own case ID, bureau ownership and activity timeline — from receipt to disposal."
        actions={
          <button data-testid="register-complaint" onClick={() => navigate('/app/complaints/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300 transition-colors">
            <Plus size={15} /> Register Complaint
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'All complaints', v: stats.total, tone: '#6366F1' },
          { label: 'Open cases', v: stats.open, tone: '#22D3EE' },
          { label: 'Overdue (SLA)', v: stats.overdue, tone: '#FB7185' },
          { label: 'Escalated', v: stats.escalated, tone: '#F87171' },
        ].map((s, i) => (
          <div key={s.label} data-testid={`complaints-stat-${i}`} className="panel rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="font-display text-3xl font-semibold" style={{ color: s.tone }}>{s.v}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button data-testid="status-chip-all" onClick={() => setStatusFilter('all')}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${statusFilter === 'all' ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200'}`}>
            All
          </button>
          {STATUS_CHIPS.map((s) => (
            <button key={s} data-testid={`status-chip-${s.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${statusFilter === s ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200'}`}>
              {s} <span className="font-mono2 text-[10px] opacity-70">({complaints.filter((c) => c.status === s).length})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 flex-1 focus-within:border-cyan-400/50">
            <Search size={14} className="text-slate-500" />
            <input data-testid="complaints-search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search case ID, subject, complainant or institution…" className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select data-testid="complaints-filter-bureau" value={bureau} onChange={(e) => setBureau(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
              <option value="all">All bureaus</option>
              {['PGRC', 'RB', 'AB', 'EAB', 'FAB'].map((b) => <option key={b}>{b}</option>)}
            </select>
            <select data-testid="complaints-filter-priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
              <option value="all">All priorities</option>
              {['Critical', 'High', 'Medium', 'Low'].map((b) => <option key={b}>{b}</option>)}
            </select>
            <select data-testid="complaints-filter-category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-[12.5px] text-slate-200 outline-none focus:border-cyan-400/50">
              <option value="all">All categories</option>
              {state.categories.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="panel rounded-xl p-5"><SkeletonTable rows={8} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileWarning} title="No complaints match this view"
          sub="Adjust the filters, or register a new complaint to see it flow through the system."
          action={<button data-testid="complaints-empty-register" onClick={() => navigate('/app/complaints/new')} className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[12.5px] font-medium text-cyan-200">Register a complaint</button>} />
      ) : (
        <div className="panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="complaints-table">
              <thead>
                <tr className="border-b border-slate-700/40 text-[10.5px] font-mono2 uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-5 py-3 font-medium">Case ID</th>
                  <th className="px-5 py-3 font-medium">Subject / Institution</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Bureau</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Officer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const inst = institutions.find((i) => i.id === c.institutionId);
                  const over = c.status !== 'Disposed' && daysOverdue(c.slaDue) > 0;
                  const officer = state.officers.find((o) => o.id === c.officerId);
                  return (
                    <tr key={c.caseId} data-testid={`complaint-row-${c.caseId}`} onClick={() => navigate(`/app/complaints/${c.caseId}`)}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-cyan-400/5 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono2 text-[12px] text-cyan-300 font-semibold">{c.caseId}</span>
                        {c.conflictId && ['detected', 'flagged', 'under-review'].includes(state.conflicts.find((x) => x.id === c.conflictId)?.status || '') && (
                          <span data-testid={`conflict-flag-${c.caseId}`} className="ml-2 inline-flex items-center gap-1 rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 font-mono2 text-[9px] font-bold text-rose-300"><AlertTriangle size={9} /> CONFLICT</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 max-w-[300px]">
                        <p className="text-[12.5px] text-slate-200 truncate">{c.subject}</p>
                        <p className="text-[10.5px] text-slate-500 truncate">{inst?.name} · {c.complainant?.name}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-300">{c.category}</td>
                      <td className="px-5 py-3.5"><BureauBadge code={c.bureau} size="sm" /></td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-300">{officer?.name || '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className={`px-5 py-3.5 font-mono2 text-[11px] ${over ? 'text-rose-300 font-semibold' : 'text-slate-500'}`}>
                        {over ? `Overdue ${daysOverdue(c.slaDue)}d` : fmtDate(c.slaDue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
