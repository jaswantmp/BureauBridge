import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Inbox, PenSquare, Plus, Search } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { BureauBadge, CoordStatusBadge, EmptyState, PageHeader, PriorityBadge, SkeletonTable, useSimulatedLoad } from '@/components/shared';
import { fmtDate, timeAgo } from '@/lib/helpers';

export default function Coordination() {
  const { state, currentUser } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const loading = useSimulatedLoad(600);
  const [tab, setTab] = useState(params.get('tab') || 'received');
  const [q, setQ] = useState('');

  const coords = state.coordinations;

  const tabs = useMemo(() => ({
    received: coords.filter((c) => c.toBureau === currentUser.bureau && !['Draft', 'Resolved'].includes(c.status)),
    sent: coords.filter((c) => c.fromBureau === currentUser.bureau && !['Draft', 'Resolved'].includes(c.status)),
    drafts: coords.filter((c) => c.status === 'Draft'),
    resolved: coords.filter((c) => c.status === 'Resolved'),
  }), [coords, currentUser.bureau]);

  const list = useMemo(() => {
    let l = [...(tabs[tab] || [])].sort((a, b) => new Date(b.updated) - new Date(a.updated));
    if (q.trim()) {
      const term = q.toLowerCase();
      l = l.filter((c) => c.subject.toLowerCase().includes(term) || c.id.toLowerCase().includes(term) || (c.linkedCases || []).some((x) => x.toLowerCase().includes(term)));
    }
    return l;
  }, [tabs, tab, q]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="coordination-page">
      <PageHeader
        testid="coordination-header"
        eyebrow="Bureau Coordination"
        title={`Coordination inbox — ${currentUser.bureau} desk`}
        sub="Exchange case-related requests across bureaus. Linked cases always keep their original IDs, histories and bureau ownership."
        actions={
          <button data-testid="new-coordination" onClick={() => navigate('/app/coordination/compose')}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 text-[13px] font-semibold text-[#23063B] shadow-[0_0_24px_-6px_#A78BFA] hover:bg-violet-300 transition-colors">
            <Plus size={15} /> New Coordination Request
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'received', label: 'Received', icon: Inbox },
            { key: 'sent', label: 'Sent', icon: PenSquare },
            { key: 'drafts', label: 'Drafts', icon: PenSquare },
            { key: 'resolved', label: 'Resolved', icon: Inbox },
          ].map((t) => (
            <button key={t.key} data-testid={`coord-tab-${t.key}`} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${tab === t.key ? 'border-violet-400/60 bg-violet-400/15 text-violet-200' : 'border-slate-600/50 text-slate-400 hover:text-slate-200'}`}>
              <t.icon size={12} /> {t.label} <span className="font-mono2 text-[10px] opacity-70">({tabs[t.key].length})</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2 w-full lg:w-72 focus-within:border-violet-400/50">
          <Search size={13} className="text-slate-500" />
          <input data-testid="coordination-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject, request ID, case…"
            className="w-full bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-500 outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="panel rounded-xl p-5"><SkeletonTable rows={5} /></div>
      ) : list.length === 0 ? (
        <EmptyState icon={Inbox} title={`Nothing in ${tab}`}
          sub={tab === 'received' ? 'Requests from other bureaus will land here.' : tab === 'drafts' ? 'Saved drafts appear here until you send them.' : 'No threads in this view yet.'}
          action={<button data-testid="coordination-empty-new" onClick={() => navigate('/app/coordination/compose')} className="rounded-lg border border-violet-400/40 bg-violet-400/10 px-4 py-2 text-[12.5px] font-medium text-violet-200">Create a coordination request</button>} />
      ) : (
        <div className="panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="coordination-table">
              <thead>
                <tr className="border-b border-slate-700/40 text-[10.5px] font-mono2 uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium">Linked cases</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.map((cr) => (
                  <tr key={cr.id} data-testid={`coordination-row-${cr.id}`} onClick={() => navigate(`/app/coordination/${cr.id}`)}
                    className="border-b border-slate-800/60 last:border-0 hover:bg-violet-400/5 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5 max-w-[340px]">
                      <p className="font-mono2 text-[11.5px] text-violet-300">{cr.id}</p>
                      <p className="text-[12.5px] text-slate-200 truncate mt-0.5">{cr.subject}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <BureauBadge code={cr.fromBureau} size="sm" />
                        <span className="text-slate-500 text-[11px]">→</span>
                        <BureauBadge code={cr.toBureau} size="sm" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(cr.linkedCases || []).map((c) => (
                          <span key={c} className="font-mono2 text-[10px] rounded border border-slate-600/60 px-1.5 py-0.5 text-slate-300">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={cr.priority} /></td>
                    <td className="px-5 py-3.5"><CoordStatusBadge status={cr.status} /></td>
                    <td className="px-5 py-3.5 font-mono2 text-[11px] text-slate-500">{timeAgo(cr.updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-600">
        Coordination connects relevant information across bureaus. It never merges complaints — each linked case retains
        its own ID, bureau ownership and full history. Last sync {fmtDate(new Date())} (demo).
      </p>
    </div>
  );
}
