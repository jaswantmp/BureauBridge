import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Building2, ChevronsLeft, FileWarning, LayoutDashboard, LogOut, Menu, MessagesSquare,
  Network, RotateCcw, Search, ShieldCheck, X,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { DEMO_NOTICE } from '@/data/seed';
import { timeAgo } from '@/lib/helpers';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';

const NAV = [
  { to: '/app', end: true, icon: LayoutDashboard, label: 'Command Centre', sub: 'System overview', testid: 'nav-dashboard' },
  { to: '/app/registry', icon: Building2, label: 'Institution Registry', sub: 'Records & matching', testid: 'nav-registry' },
  { to: '/app/complaints', icon: FileWarning, label: 'Complaint Management', sub: 'Cases & workflow', testid: 'nav-complaints' },
  { to: '/app/conflicts', icon: Network, label: 'Conflict Intelligence', sub: 'Cross-bureau overlaps', testid: 'nav-conflicts' },
  { to: '/app/coordination', icon: MessagesSquare, label: 'Bureau Coordination', sub: 'Requests & responses', testid: 'nav-coordination' },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid place-items-center h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#22D3EE" strokeWidth="1.4" opacity="0.9" />
          <circle cx="12" cy="12" r="5" stroke="#6366F1" strokeWidth="1.4" opacity="0.9" />
          <circle cx="12" cy="12" r="1.6" fill="#22D3EE" />
          <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" stroke="#FF9933" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-display font-bold text-[15px] tracking-tight text-slate-100 leading-none">SAMANVAYA <span className="text-cyan-300">AI</span></p>
        <p className="mt-1 font-mono2 text-[9.5px] uppercase tracking-[0.24em] text-slate-500">AICTE · Grievance Grid</p>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const { state } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return null;
    const inst = state.institutions.filter((i) =>
      i.name.toLowerCase().includes(term) || i.aliases.some((a) => a.toLowerCase().includes(term)) || i.id.toLowerCase().includes(term) || i.city.toLowerCase().includes(term)
    ).slice(0, 4).map((i) => ({ id: i.id, label: i.name, sub: `${i.id} · ${i.city}, ${i.state}`, to: `/app/registry/${i.id}`, group: 'Institutions' }));
    const comp = state.complaints.filter((c) =>
      c.caseId.toLowerCase().includes(term) || c.subject.toLowerCase().includes(term) || (c.complainant?.name || '').toLowerCase().includes(term)
    ).slice(0, 5).map((c) => ({ id: c.caseId, label: `${c.caseId} — ${c.subject}`, sub: `${c.bureau} · ${c.complainant?.name || 'Unknown'}`, to: `/app/complaints/${c.caseId}`, group: 'Complaints' }));
    const conf = state.conflicts.filter((cf) => cf.id.toLowerCase().includes(term) || cf.type.toLowerCase().includes(term)).slice(0, 3)
      .map((cf) => ({ id: cf.id, label: `${cf.id} — ${cf.type}`, sub: `${cf.caseA} ↔ ${cf.caseB}`, to: `/app/conflicts/${cf.id}`, group: 'Conflicts' }));
    const coord = state.coordinations.filter((cr) => cr.id.toLowerCase().includes(term) || cr.subject.toLowerCase().includes(term)).slice(0, 3)
      .map((cr) => ({ id: cr.id, label: `${cr.id} — ${cr.subject}`, sub: `${cr.fromBureau} → ${cr.toBureau}`, to: `/app/coordination/${cr.id}`, group: 'Coordination' }));
    return [...inst, ...comp, ...conf, ...coord];
  }, [q, state]);

  const grouped = useMemo(() => {
    if (!results) return null;
    const g = {};
    results.forEach((r) => { (g[r.group] = g[r.group] || []).push(r); });
    return g;
  }, [results]);

  return (
    <div className="relative w-full max-w-md" data-testid="global-search">
      <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/40 px-3 py-2 focus-within:border-cyan-400/50 transition-colors">
        <Search size={14} className="text-slate-500 shrink-0" />
        <input
          ref={inputRef}
          data-testid="global-search-input"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search institutions, case IDs, conflicts…"
          className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none"
        />
        <kbd className="hidden md:inline font-mono2 text-[10px] text-slate-500 border border-slate-600/60 rounded px-1.5 py-0.5">Ctrl K</kbd>
      </div>
      {open && q.trim().length >= 2 && (
        <div data-testid="global-search-results" className="absolute z-50 mt-2 w-full max-h-96 overflow-auto rounded-xl border border-slate-600/50 bg-[#0A1020] shadow-2xl shadow-black/60 p-2 animate-scale-in">
          {results && results.length > 0 ? (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-1.5">
                <p className="px-2.5 pt-1.5 pb-1 font-mono2 text-[10px] uppercase tracking-[0.18em] text-slate-500">{group}</p>
                {items.map((r) => (
                  <button key={group + r.id} data-testid={`search-result-${r.id}`}
                    onClick={() => { setOpen(false); setQ(''); navigate(r.to); }}
                    className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-cyan-400/10 hover:border-cyan-400/20 border border-transparent transition-colors">
                    <p className="text-[13px] text-slate-200 truncate">{r.label}</p>
                    <p className="text-[11px] text-slate-500 truncate">{r.sub}</p>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <p className="px-3 py-4 text-xs text-slate-500">No records match “{q}”.</p>
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

function NotificationsBell() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unread = state.notifications.filter((n) => !n.read).length;

  const sevColor = { high: '#FB7185', critical: '#F87171', medium: '#FBBF24', low: '#38BDF8' };

  return (
    <div className="relative">
      <button data-testid="notifications-bell" onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-slate-600/50 bg-slate-800/40 p-2 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors">
        <Bell size={15} />
        {unread > 0 && (
          <span data-testid="notifications-unread-count" className="absolute -top-1.5 -right-1.5 grid place-items-center h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div data-testid="notifications-panel" className="absolute right-0 z-50 mt-2 w-[380px] rounded-xl border border-slate-600/50 bg-[#0A1020] shadow-2xl shadow-black/60 animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <p className="font-display text-sm font-semibold text-slate-200">Notifications</p>
            <button data-testid="mark-all-read" onClick={() => dispatch({ type: 'MARK_ALL_READ' })} className="text-[11px] text-cyan-300 hover:text-cyan-200 font-medium">Mark all read</button>
          </div>
          <div className="max-h-[340px] overflow-auto">
            {state.notifications.map((n) => (
              <button key={n.id} data-testid={`notification-${n.id}`}
                onClick={() => { setOpen(false); navigate(n.link); }}
                className={`w-full text-left px-4 py-3 border-b border-slate-800/70 hover:bg-slate-800/50 transition-colors ${n.read ? 'opacity-60' : ''}`}>
                <div className="flex gap-2.5">
                  <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: sevColor[n.severity] || '#94A3B8', boxShadow: n.read ? 'none' : `0 0 8px ${sevColor[n.severity]}` }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-200 leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-slate-500 leading-snug">{n.detail}</p>
                    <p className="mt-1 font-mono2 text-[10px] text-slate-600">{timeAgo(n.ts)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const { state, resetDemo } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const navigate = useNavigate();
  const activeConflicts = state.conflicts.filter((c) => ['detected', 'flagged', 'under-review'].includes(c.status)).length;
  const pendingCoord = state.coordinations.filter((c) => ['Pending Acknowledgement', 'Acknowledged', 'In Discussion'].includes(c.status)).length;

  return (
    <aside className="flex h-full flex-col border-r border-slate-700/40 bg-[#070C18]">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-2.5 pt-2 pb-2 font-mono2 text-[10px] uppercase tracking-[0.22em] text-slate-600">Portals</p>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} data-testid={item.testid}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all ${isActive ? 'bg-cyan-400/10 text-cyan-200 border border-cyan-400/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'}`}>
            {({ isActive }) => (
              <>
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2.5px] rounded-full transition-all ${isActive ? 'bg-cyan-300 shadow-[0_0_10px_#22D3EE]' : 'bg-transparent'}`} />
                <item.icon size={16.5} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium leading-tight">{item.label}</span>
                  <span className="block text-[10.5px] text-slate-600 leading-tight mt-0.5">{item.sub}</span>
                </span>
                {item.to === '/app/conflicts' && activeConflicts > 0 && (
                  <span data-testid="sidebar-conflict-count" className="rounded-full bg-rose-400/15 border border-rose-400/40 px-1.5 py-0.5 font-mono2 text-[10px] font-bold text-rose-300">{activeConflicts}</span>
                )}
                {item.to === '/app/coordination' && pendingCoord > 0 && (
                  <span data-testid="sidebar-coord-count" className="rounded-full bg-violet-400/15 border border-violet-400/40 px-1.5 py-0.5 font-mono2 text-[10px] font-bold text-violet-300">{pendingCoord}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700/40 p-3 space-y-2">
        {confirmReset ? (
          <div data-testid="reset-confirm" className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-3">
            <p className="text-[11.5px] text-rose-200 leading-snug">Reset all demo data to the seeded fictional state? Your changes will be lost.</p>
            <div className="mt-2.5 flex gap-2">
              <button data-testid="reset-confirm-yes" onClick={() => { resetDemo(); setConfirmReset(false); navigate('/app'); }}
                className="flex-1 rounded-md bg-rose-500/90 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-500">Reset</button>
              <button data-testid="reset-confirm-no" onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-md border border-slate-600/60 px-2 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700/50">Cancel</button>
            </div>
          </div>
        ) : (
          <button data-testid="reset-demo" onClick={() => setConfirmReset(true)}
            className="w-full flex items-center gap-2.5 rounded-lg border border-slate-700/60 px-2.5 py-2 text-[12px] text-slate-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-400/5 transition-colors">
            <RotateCcw size={13.5} /> Reset demo data
          </button>
        )}
        <button onClick={() => navigate('/')} data-testid="back-to-welcome"
          className="w-full flex items-center gap-2.5 rounded-lg border border-slate-700/60 px-2.5 py-2 text-[12px] text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors">
          <ChevronsLeft size={13.5} /> Welcome screen
        </button>
        <p className="px-1.5 pb-1 text-[10px] leading-relaxed text-slate-600">
          <span className="font-mono2 text-amber-500/90">DEMO</span> · Fictional data only — no live AICTE connection. Smart India Hackathon 2026.
        </p>
      </div>
    </aside>
  );
}

const TITLES = [
  { match: /^\/app\/?$/, title: 'Command Centre', eyebrow: 'Admin Dashboard' },
  { match: /^\/app\/registry\/new/, title: 'Register Institution', eyebrow: 'Institution Registry' },
  { match: /^\/app\/registry\/([^/]+)\/edit/, title: 'Edit Institution', eyebrow: 'Institution Registry' },
  { match: /^\/app\/registry\/([^/]+)/, title: 'Institution Profile', eyebrow: 'Institution Registry' },
  { match: /^\/app\/registry/, title: 'Institution Registry', eyebrow: 'Records & Duplicate Detection' },
  { match: /^\/app\/complaints\/new/, title: 'Register Complaint', eyebrow: 'Complaint Management' },
  { match: /^\/app\/complaints\/([^/]+)/, title: 'Case File', eyebrow: 'Complaint Management' },
  { match: /^\/app\/complaints/, title: 'Complaint Management', eyebrow: 'Cases & Workflow' },
  { match: /^\/app\/conflicts\/([^/]+)/, title: 'Conflict Investigation', eyebrow: 'Conflict Intelligence' },
  { match: /^\/app\/conflicts/, title: 'Cross-Bureau Conflict Intelligence', eyebrow: 'Overlap Detection' },
  { match: /^\/app\/coordination\/compose/, title: 'New Coordination Request', eyebrow: 'Bureau Coordination' },
  { match: /^\/app\/coordination\/([^/]+)/, title: 'Coordination Thread', eyebrow: 'Bureau Coordination' },
  { match: /^\/app\/coordination/, title: 'Bureau Coordination', eyebrow: 'Requests & Responses' },
];

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const meta = TITLES.find((t) => t.match.test(location.pathname)) || { title: 'SAMANVAYA AI', eyebrow: 'Demo Environment' };

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 radial-glow pointer-events-none" />

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block w-[268px]">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] animate-fade-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative lg:pl-[268px]">
        <header className="sticky top-0 z-30 glass border-b border-slate-700/40">
          <div className="flex items-center gap-3 px-4 lg:px-8 py-3">
            <button data-testid="mobile-menu-button" onClick={() => setMobileOpen(true)} className="lg:hidden rounded-lg border border-slate-600/50 p-2 text-slate-300">
              <Menu size={16} />
            </button>
            <div className="hidden md:block min-w-0">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">{meta.eyebrow}</p>
              <h2 className="font-display text-[16px] font-semibold text-slate-200 leading-tight truncate">{meta.title}</h2>
            </div>
            <div className="flex-1" />
            <GlobalSearch />
            <span data-testid="demo-badge" className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono2 text-[10px] font-semibold tracking-[0.14em] text-amber-300">
              <ShieldCheck size={11} /> DEMO · FICTIONAL DATA
            </span>
            <NotificationsBell />
            <div data-testid="current-user-chip" className="hidden sm:flex items-center gap-2.5 rounded-lg border border-slate-600/50 bg-slate-800/40 pl-1.5 pr-3 py-1.5">
              <span className="grid place-items-center h-6 w-6 rounded-md bg-cyan-400/15 border border-cyan-400/40 font-mono2 text-[10px] font-bold text-cyan-300">PN</span>
              <span className="leading-none">
                <span className="block text-[11.5px] font-medium text-slate-200">Priya Nair</span>
                <span className="block font-mono2 text-[9px] text-slate-500 mt-0.5">GRIEVANCE OFFICER · PGRC</span>
              </span>
            </div>
          </div>
          <p className="md:hidden px-4 pb-2.5 font-mono2 text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">{meta.eyebrow} — {meta.title}</p>
        </header>

        <main className="relative px-4 lg:px-8 py-7 max-w-[1440px]">
          <Outlet />
        </main>

        <footer className="relative px-4 lg:px-8 pb-8 pt-2">
          <div className="border-t border-slate-700/30 pt-4 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
            <p className="text-[11px] text-slate-600 max-w-3xl leading-relaxed">{DEMO_NOTICE}</p>
            <p className="font-mono2 text-[10px] text-slate-600 shrink-0">SAMANVAYA AI · v1.0-demo · SIH 2026</p>
          </div>
        </footer>
      </div>

      <ProcessingOverlay />
    </div>
  );
}
