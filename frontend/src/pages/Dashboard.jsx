import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowUpRight, Building2, CheckCircle2, Clock, FileWarning, Network,
  MessagesSquare, ClipboardList,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { TREND_HISTORY } from '@/data/seed';
import {
  BureauBadge, PriorityBadge, PageHeader, SectionCard, StatCard, StatusBadge, SkeletonTable,
} from '@/components/shared';
import { daysOverdue, fmtDate, timeAgo } from '@/lib/helpers';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-600/60 bg-[#0A1020] px-3 py-2 shadow-xl">
      <p className="font-mono2 text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-1 text-[12px] font-medium" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-mono2">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { state, runWithProgress, bureauMap, officers } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    runWithProgress('Preparing system overview…', [
      'Loading institution registry snapshot',
      'Aggregating complaint metrics across bureaus',
      'Scanning cross-bureau conflict engine',
      'Rendering visualisations',
    ], { minStepMs: 430, jitterMs: 70, releaseMs: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { institutions, complaints, conflicts, coordinations, matchCandidates, activity } = state;

  const pending = complaints.filter((c) => c.status !== 'Disposed').length;
  const overdue = complaints.filter((c) => c.status !== 'Disposed' && daysOverdue(c.slaDue) > 0);
  const resolved = complaints.filter((c) => c.status === 'Disposed').length;
  const activeConflicts = conflicts.filter((c) => ['detected', 'flagged', 'under-review'].includes(c.status));
  const openCoord = coordinations.filter((c) => ['Pending Acknowledgement', 'Acknowledged', 'In Discussion'].includes(c.status)).length;
  const pendingMatches = matchCandidates.filter((m) => m.status === 'pending').length;

  const trend = useMemo(() => {
    const now = new Date();
    const out = [];
    for (let i = 8; i >= 0; i--) {
      const dtRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = dtRef.toLocaleString('en-IN', { month: 'short' }) + ' ' + String(dtRef.getFullYear()).slice(-2);
      if (i === 0) {
        const received = complaints.filter((c) => {
          const dd = new Date(c.submitted);
          return dd.getMonth() === dtRef.getMonth() && dd.getFullYear() === dtRef.getFullYear();
        }).length;
        const disposed = complaints.filter((c) => {
          if (c.status !== 'Disposed') return false;
          const dd = new Date(c.updated);
          return dd.getMonth() === dtRef.getMonth() && dd.getFullYear() === dtRef.getFullYear();
        }).length;
        out.push({ month: label, received, disposed });
      } else {
        out.push({ month: label, ...TREND_HISTORY[8 - i] });
      }
    }
    return out;
  }, [complaints]);

  const bureauStats = useMemo(() => {
    return ['PGRC', 'RB', 'AB', 'EAB', 'FAB'].map((code) => {
      const list = complaints.filter((c) => c.bureau === code);
      return {
        code,
        open: list.filter((c) => c.status !== 'Disposed').length,
        closed: list.filter((c) => c.status === 'Disposed').length,
      };
    });
  }, [complaints]);

  const categoryStats = useMemo(() => {
    const map = {};
    complaints.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
    const colors = ['#22D3EE', '#6366F1', '#FBBF24', '#34D399', '#FB7185', '#A78BFA'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: colors[i % colors.length] }));
  }, [complaints]);

  const regionalStats = useMemo(() => {
    const regions = ['South', 'West', 'North', 'East', 'Central', 'North-East'];
    return regions.map((r) => {
      const insts = institutions.filter((i) => i.region === r);
      const instIds = insts.map((i) => i.id);
      const cases = complaints.filter((c) => instIds.includes(c.institutionId));
      return { region: r, institutions: insts.length, open: cases.filter((c) => c.status !== 'Disposed').length };
    }).filter((r) => r.institutions > 0);
  }, [institutions, complaints]);

  const alerts = useMemo(() => {
    const list = [];
    overdue.forEach((c) => {
      const inst = institutions.find((i) => i.id === c.institutionId);
      list.push({
        id: `overdue-${c.caseId}`, severity: c.priority === 'Critical' ? 'critical' : 'high',
        title: `${c.caseId} overdue by ${daysOverdue(c.slaDue)} day${daysOverdue(c.slaDue) > 1 ? 's' : ''}`,
        detail: `${inst?.name} · ${c.category}`, to: `/app/complaints/${c.caseId}`,
      });
    });
    activeConflicts.forEach((cf) => {
      if (cf.confidence >= 0.8) {
        list.push({
          id: `conflict-${cf.id}`, severity: 'high',
          title: `High-confidence conflict ${cf.id} (${Math.round(cf.confidence * 100)}%)`,
          detail: `${cf.caseA} ↔ ${cf.caseB} · coordination required`, to: `/app/conflicts/${cf.id}`,
        });
      }
    });
    matchCandidates.filter((m) => m.status === 'pending' && m.confidence >= 0.85).forEach((m) => {
      list.push({
        id: `match-${m.id}`, severity: 'medium',
        title: `Duplicate candidate “${m.rawName}” (${Math.round(m.confidence * 100)}%)`,
        detail: 'Awaiting human review in the Institution Registry', to: '/app/registry?tab=matches',
      });
    });
    const order = { critical: 0, high: 1, medium: 2 };
    return list.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6);
  }, [overdue, activeConflicts, matchCandidates, institutions]);

  const recentCases = useMemo(
    () => [...complaints].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 6),
    [complaints]
  );

  const sevStyle = {
    critical: 'border-rose-400/50 bg-rose-400/10 text-rose-300',
    high: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
    medium: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <PageHeader
        testid="dashboard-header"
        eyebrow="Admin Command Centre"
        title="Good day, Priya — here’s the whole grid at a glance"
        sub="Live snapshot of institutions, complaints, conflicts and coordination across all five AICTE bureaus (demo data)."
        actions={
          <>
            <button data-testid="dash-register-complaint" onClick={() => navigate('/app/complaints/new')}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300 transition-colors">
              <FileWarning size={14} /> Register Complaint
            </button>
            <button data-testid="dash-view-conflicts" onClick={() => navigate('/app/conflicts')}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-[13px] font-medium text-rose-300 hover:bg-rose-400/20 transition-colors">
              <Network size={14} /> {activeConflicts.length} active conflicts
            </button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard delay={0} label="Registered Institutions" value={institutions.length} sub="across 6 regions" icon={Building2} tone="#22D3EE" onClick={() => navigate('/app/registry')} />
        <StatCard delay={50} label="Complaints Received" value={complaints.length} sub="all bureaus, 2026" icon={FileWarning} tone="#6366F1" onClick={() => navigate('/app/complaints')} />
        <StatCard delay={100} label="Pending Cases" value={pending} sub="not yet disposed" icon={Clock} tone="#FBBF24" onClick={() => navigate('/app/complaints')} />
        <StatCard delay={150} label="Overdue (SLA)" value={overdue.length} sub="past due date, open" icon={AlertTriangle} tone="#FB7185" onClick={() => navigate('/app/complaints')} />
        <StatCard delay={200} label="Active Bureau Conflicts" value={activeConflicts.length} sub="detected · flagged · review" icon={Network} tone="#FB7185" onClick={() => navigate('/app/conflicts')} />
        <StatCard delay={250} label="Coordination Requests" value={openCoord} sub="open across bureaus" icon={MessagesSquare} tone="#A78BFA" onClick={() => navigate('/app/coordination')} />
        <StatCard delay={300} label="Resolved Complaints" value={resolved} sub="disposed this year" icon={CheckCircle2} tone="#34D399" onClick={() => navigate('/app/complaints')} />
        <StatCard delay={350} label="Match Reviews Pending" value={pendingMatches} sub="duplicate detection queue" icon={ClipboardList} tone="#38BDF8" onClick={() => navigate('/app/registry?tab=matches')} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard title="Complaint trend" sub="Received vs disposed · last 9 months" testid="chart-trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gDis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10.5, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10.5, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#22D3EE55' }} />
                <Area type="monotone" dataKey="received" name="Received" stroke="#22D3EE" strokeWidth={2} fill="url(#gRec)" />
                <Area type="monotone" dataKey="disposed" name="Disposed" stroke="#6366F1" strokeWidth={2} fill="url(#gDis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="By category" sub="Share of all complaints" testid="chart-categories">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryStats} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={3} strokeWidth={0}>
                  {categoryStats.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 -mt-2">
            {categoryStats.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-sm" style={{ background: c.fill }} />{c.name}</span>
                <span className="font-mono2 text-slate-300">{c.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Bureau-wise caseload" sub="Open vs disposed complaints per bureau" testid="chart-bureau">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauStats} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barGap={5}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="code" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10.5, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#22D3EE11' }} />
                <Bar dataKey="open" name="Open" fill="#22D3EE" fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={34} />
                <Bar dataKey="closed" name="Disposed" fill="#6366F1" fillOpacity={0.7} radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Regional summary" sub="Institutions and open cases by region" testid="chart-regional">
          <div className="space-y-3.5 h-60 justify-center flex flex-col">
            {regionalStats.map((r) => {
              const max = Math.max(...regionalStats.map((x) => x.institutions), 1);
              return (
                <button key={r.region} data-testid={`region-row-${r.region.toLowerCase()}`} onClick={() => navigate('/app/registry')}
                  className="group text-left">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-300 font-medium">{r.region} <span className="text-slate-500 font-normal">· {r.institutions} institutions</span></span>
                    <span className="font-mono2 text-slate-400">{r.open} open</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                      style={{ width: `${(r.institutions / max) * 100}%`, background: 'linear-gradient(90deg,#6366F1,#22D3EE)', boxShadow: '0 0 10px #22D3EE44' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Alerts + activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard title="Priority alerts" sub="Needing attention now" testid="priority-alerts" className="lg:col-span-2" bodyClass="p-3">
          {alerts.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-slate-500">No priority alerts — the grid is calm.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <button key={a.id} data-testid={`alert-${a.id.replace(/[^a-z0-9-]/gi, '')}`} onClick={() => navigate(a.to)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-all hover:translate-x-0.5 ${sevStyle[a.severity] || sevStyle.medium}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold">{a.title}</p>
                    <ArrowUpRight size={14} className="shrink-0 opacity-70" />
                  </div>
                  <p className="mt-0.5 text-[11.5px] opacity-75">{a.detail}</p>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent activity" sub="Across all portals" testid="recent-activity" bodyClass="p-3">
          <div className="space-y-1 max-h-[280px] overflow-auto pr-1">
            {activity.slice(0, 8).map((a) => (
              <button key={a.id} data-testid={`activity-${a.id}`} onClick={() => navigate(a.link)}
                className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-slate-800/60 border border-transparent hover:border-slate-600/40 transition-colors">
                <p className="text-[12px] leading-snug text-slate-300">{a.text}</p>
                <p className="mt-0.5 font-mono2 text-[10px] text-slate-600">{timeAgo(a.ts)}</p>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent cases */}
      <SectionCard title="Recently updated cases" sub="Jump straight into any case file" testid="recent-cases"
        actions={<button data-testid="recent-cases-view-all" onClick={() => navigate('/app/complaints')} className="text-[12px] font-medium text-cyan-300 hover:text-cyan-200">View all →</button>} bodyClass="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left" data-testid="recent-cases-table">
            <thead>
              <tr className="border-b border-slate-700/40 text-[10.5px] font-mono2 uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3 font-medium">Case ID</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Bureau</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c) => {
                const inst = institutions.find((i) => i.id === c.institutionId);
                return (
                  <tr key={c.caseId} data-testid={`recent-case-${c.caseId}`} onClick={() => navigate(`/app/complaints/${c.caseId}`)}
                    className="border-b border-slate-800/60 last:border-0 hover:bg-cyan-400/5 cursor-pointer transition-colors">
                    <td className="px-5 py-3 font-mono2 text-[12px] text-cyan-300">{c.caseId}</td>
                    <td className="px-5 py-3 text-[12.5px] text-slate-300 max-w-[280px]">
                      <p className="truncate">{c.subject}</p>
                      <p className="text-[10.5px] text-slate-600">{inst?.name}</p>
                    </td>
                    <td className="px-5 py-3"><BureauBadge code={c.bureau} size="sm" /></td>
                    <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 font-mono2 text-[11px] text-slate-500">{fmtDate(c.updated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
