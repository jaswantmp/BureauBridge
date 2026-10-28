import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Loader2, Search, X,
} from 'lucide-react';
import { confidenceLevel } from '@/lib/helpers';

export const STATUS_STYLES = {
  Received: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  'Under Process': 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  Pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  Transferred: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  Escalated: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
  Disposed: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
};

export const PRIORITY_STYLES = {
  Critical: 'bg-rose-500/15 text-rose-300 border-rose-400/40',
  High: 'bg-orange-400/10 text-orange-300 border-orange-400/30',
  Medium: 'bg-amber-400/10 text-amber-200 border-amber-400/25',
  Low: 'bg-slate-400/10 text-slate-300 border-slate-400/25',
};

export const APPROVAL_STYLES = {
  Approved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  'Approval Under Review': 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  Conditional: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  'Notice Issued': 'bg-rose-400/10 text-rose-300 border-rose-400/30',
};

export const CONFLICT_STATUS_STYLES = {
  detected: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
  'under-review': 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  flagged: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  coordinated: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  proceeded: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  dismissed: 'bg-slate-400/10 text-slate-400 border-slate-400/25',
};

export const COORD_STATUS_STYLES = {
  'Pending Acknowledgement': 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  Acknowledged: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  'In Discussion': 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  Resolved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  Draft: 'bg-slate-400/10 text-slate-300 border-slate-400/25',
};

export function StatusBadge({ status, className = '' }) {
  return (
    <span data-testid={`status-badge-${(status || '').toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium font-mono2 tracking-wide ${STATUS_STYLES[status] || 'bg-slate-400/10 text-slate-300 border-slate-400/25'} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span data-testid={`priority-badge-${(priority || '').toLowerCase()}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold font-mono2 tracking-wide ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low}`}>
      {priority}
    </span>
  );
}

export function BureauBadge({ code, size = 'md' }) {
  const map = { PGRC: '#22D3EE', RB: '#A78BFA', AB: '#FBBF24', EAB: '#34D399', FAB: '#FB7185' };
  const c = map[code] || '#94A3B8';
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span data-testid={`bureau-badge-${code}`}
      className={`inline-flex items-center gap-1.5 rounded-md font-mono2 font-semibold tracking-widest border ${pad}`}
      style={{ color: c, borderColor: `${c}55`, background: `${c}14` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {code}
    </span>
  );
}

export function ApprovalBadge({ status }) {
  return (
    <span data-testid={`approval-badge-${(status || '').toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${APPROVAL_STYLES[status] || APPROVAL_STYLES.Approved}`}>
      {status}
    </span>
  );
}

export function ConflictStatusBadge({ status }) {
  const labels = { detected: 'Detected', 'under-review': 'Under Review', flagged: 'Flagged for Review', coordinated: 'Coordinated', proceeded: 'Proceeded', dismissed: 'Dismissed' };
  return (
    <span data-testid={`conflict-status-${status}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium font-mono2 tracking-wide ${CONFLICT_STATUS_STYLES[status] || CONFLICT_STATUS_STYLES.dismissed}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}

export function CoordStatusBadge({ status }) {
  return (
    <span data-testid={`coord-status-${(status || '').toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium font-mono2 tracking-wide ${COORD_STATUS_STYLES[status] || COORD_STATUS_STYLES.Draft}`}>
      {status}
    </span>
  );
}

export function ConfidenceMeter({ value, showLabel = true, size = 'md' }) {
  const lv = confidenceLevel(value);
  const h = size === 'lg' ? 'h-2.5' : 'h-1.5';
  return (
    <div data-testid="confidence-meter" className="flex items-center gap-2.5">
      <div className={`w-24 ${h} rounded-full bg-slate-700/50 overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.round(value * 100)}%`, background: `linear-gradient(90deg, ${lv.color}88, ${lv.color})`, boxShadow: `0 0 12px ${lv.color}66` }} />
      </div>
      {showLabel && (
        <span className={`font-mono2 text-xs font-semibold ${lv.tone}`}>{Math.round(value * 100)}% · {lv.label}</span>
      )}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, tone = '#22D3EE', onClick, delay = 0 }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      data-testid={`stat-card-${(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      onClick={onClick}
      className={`panel panel-hover animate-fade-up rounded-xl p-4 text-left w-full group ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-medium">{label}</p>
        {Icon && (
          <div className="rounded-lg p-1.5 border" style={{ color: tone, borderColor: `${tone}40`, background: `${tone}12` }}>
            <Icon size={14} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-100" style={{ textShadow: `0 0 24px ${tone}30` }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      {onClick && <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tone }}>View details →</span>}
    </Wrapper>
  );
}

export function PageHeader({ eyebrow, title, sub, actions, testid }) {
  return (
    <div data-testid={testid || 'page-header'} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-cyan-400/90 mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-2xl md:text-[28px] font-semibold text-slate-100 tracking-tight">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, sub, actions, children, className = '', testid, bodyClass = '' }) {
  return (
    <section data-testid={testid} className={`panel rounded-xl overflow-hidden ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-700/40">
          <div>
            {title && <h3 className="font-display text-[15px] font-semibold text-slate-200">{title}</h3>}
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`p-5 ${bodyClass}`}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon = Search, title, sub, action }) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dashed border-slate-600/50 rounded-xl bg-slate-800/20">
      <div className="rounded-full border border-slate-600/60 bg-slate-800/50 p-3.5 text-slate-400">
        <Icon size={22} />
      </div>
      <p className="mt-4 font-display text-[15px] font-medium text-slate-300">{title}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 max-w-sm">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div data-testid="skeleton-table" className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer h-11 rounded-lg" style={{ opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}

export function useSimulatedLoad(ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

const TIMELINE_ICONS = {
  received: { icon: Clock, color: '#38BDF8' },
  ack: { icon: CheckCircle2, color: '#38BDF8' },
  status: { icon: Loader2, color: '#22D3EE' },
  docs: { icon: AlertTriangle, color: '#FBBF24' },
  note: { icon: Clock, color: '#94A3B8' },
  conflict: { icon: AlertTriangle, color: '#FB7185' },
  coordination: { icon: Loader2, color: '#A78BFA' },
  escalate: { icon: AlertTriangle, color: '#F87171' },
  transfer: { icon: Loader2, color: '#A78BFA' },
  assignment: { icon: CheckCircle2, color: '#34D399' },
  resolve: { icon: CheckCircle2, color: '#34D399' },
};

export function Timeline({ events, testid = 'timeline' }) {
  return (
    <div data-testid={testid} className="relative space-y-0">
      {events.map((e, i) => {
        const meta = TIMELINE_ICONS[e.type] || TIMELINE_ICONS.status;
        const Icon = meta.icon;
        const ts = new Date(e.ts);
        return (
          <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
            {i < events.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-600/40" />}
            <div className="relative z-10 mt-0.5 rounded-full border p-1.5 shrink-0"
              style={{ borderColor: `${meta.color}50`, background: `${meta.color}14`, color: meta.color }}>
              <Icon size={12} className={e.type === 'status' || e.type === 'coordination' || e.type === 'transfer' ? 'animate-pulse-soft' : ''} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-slate-300 leading-snug">{e.text}</p>
              <p className="mt-1 font-mono2 text-[10.5px] text-slate-500">{e.actor} · {ts.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EvidenceList({ evidence, testid = 'evidence-list' }) {
  return (
    <div data-testid={testid} className="space-y-3">
      {evidence.map((ev, i) => (
        <div key={i} data-testid={`evidence-item-${i}`} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-slate-200">{ev.label}</p>
            <span className="font-mono2 text-[11px] text-slate-400">{Math.round((ev.strength || 0) * 100)}%</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-slate-700/60 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(ev.strength || 0) * 100}%`, background: 'linear-gradient(90deg,#22D3EE99,#22D3EE)' }} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{ev.detail}</p>
        </div>
      ))}
    </div>
  );
}
