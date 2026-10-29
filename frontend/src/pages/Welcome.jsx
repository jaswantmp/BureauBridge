import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, FileWarning, MessagesSquare, Network, LayoutDashboard, ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { DEMO_NOTICE } from '@/data/seed';

const PORTALS = [
  { n: '01', icon: LayoutDashboard, title: 'Admin Dashboard', desc: 'A live command centre — totals, trends, bureau-wise statistics, regional summaries and priority alerts.', to: '/app' },
  { n: '02', icon: Building2, title: 'Institution Registry', desc: 'Search, inspect and maintain institution records with alias matching and human-reviewed duplicate detection.', to: '/app/registry' },
  { n: '03', icon: FileWarning, title: 'Complaint Management', desc: 'Register and steer complaints through Received, Under Process, Pending, Transferred, Escalated and Disposed.', to: '/app/complaints' },
  { n: '04', icon: Network, title: 'Conflict Intelligence', desc: 'Explainable detection of overlapping cases, repeated document requests and mismatches across bureaus.', to: '/app/conflicts' },
  { n: '05', icon: MessagesSquare, title: 'Bureau Coordination', desc: 'A shared workspace for inter-bureau requests — link cases without ever merging their histories.', to: '/app/coordination' },
];

const FLOW = [
  { step: 'Register', desc: 'A complaint is filed and acknowledged in the PGRC.' },
  { step: 'Detect', desc: 'The matching engine surfaces an overlap with another bureau’s case.' },
  { step: 'Coordinate', desc: 'The officer reviews the evidence and sends a coordination request.' },
  { step: 'Track', desc: 'The receiving bureau acknowledges; both case histories stay intact.' },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div data-testid="welcome-page" className="min-h-screen bg-[#F7F2E9] text-[#0B1F4B]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'linear-gradient(rgba(11,31,75,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,75,0.05) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

      {/* Tricolor hairline */}
      <div className="fixed top-0 inset-x-0 z-20 flex h-1">
        <div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white border-y border-[#0B1F4B]/10" /><div className="flex-1 bg-[#138808]" />
      </div>

      {/* Top ribbon */}
      <div className="relative bg-[#0B1F4B] text-[#F7F2E9]">
        <div className="mx-auto max-w-6xl px-6 py-1.5 flex items-center justify-between font-mono2 text-[10px] tracking-[0.22em] uppercase">
          <span>Smart India Hackathon 2026</span>
          <span className="flex items-center gap-2 text-[#FFC98B]"><ShieldCheck size={11} /> Demo Environment · Fictional Data</span>
        </div>
      </div>

      {/* Nav */}
      <header className="relative mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-[#0B1F4B]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#F7F2E9" strokeWidth="1.4" opacity="0.9" />
              <circle cx="12" cy="12" r="5" stroke="#FF9933" strokeWidth="1.4" />
              <circle cx="12" cy="12" r="1.6" fill="#FF9933" />
              <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" stroke="#F7F2E9" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none tracking-tight">CaseMind <span className="text-[#C2570A]">AI</span></p>
            <p className="font-mono2 text-[9px] uppercase tracking-[0.26em] text-[#0B1F4B]/60 mt-1">AICTE Integrated Grievance Grid</p>
          </div>
        </div>
        <button data-testid="welcome-enter-top" onClick={() => navigate('/app')}
          className="group inline-flex items-center gap-2 rounded-full bg-[#0B1F4B] px-5 py-2.5 text-[13px] font-semibold text-[#F7F2E9] hover:bg-[#122B63] transition-colors">
          Open Command Centre
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-10 pb-16 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div className="animate-fade-up">
          <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-[#C2570A]">AICTE · Institution Complaint Monitoring & Status Dashboard</p>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-bold leading-[1.04] tracking-tight">
            One institution.<br />
            <span className="text-[#C2570A]">Connected cases. Smarter coordination.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#0B1F4B]/75">
            CaseMind AI brings AICTE’s institution records, complaint registers and bureau activity into a single
            monitoring surface — so different bureaus stop repeating work on the same case without anyone losing
            ownership of their own files.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button data-testid="welcome-enter-cta" onClick={() => navigate('/app')}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#0B1F4B] px-7 py-3.5 text-sm font-semibold text-[#F7F2E9] shadow-lg shadow-[#0B1F4B]/20 hover:bg-[#122B63] transition-all">
              Enter the Command Centre
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button data-testid="welcome-walkthrough" onClick={() => navigate('/app/conflicts/CF-2026-0031')}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0B1F4B]/25 px-6 py-3 text-sm font-semibold text-[#0B1F4B] hover:border-[#C2570A] hover:text-[#C2570A] transition-colors">
              Follow Ananya’s case →
            </button>
          </div>
          <p className="mt-6 font-mono2 text-[10.5px] uppercase tracking-[0.2em] text-[#0B1F4B]/50">
            No login required · Everything runs on fictional demo data in your browser
          </p>
        </div>

        {/* Dark preview card — a window into the command centre */}
        <div className="relative animate-fade-up delay-2">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#FF9933]/20 via-transparent to-[#0B1F4B]/10 blur-2xl" />
          <div className="relative rounded-2xl bg-[#0A1222] border border-[#0B1F4B]/60 p-6 shadow-2xl shadow-[#0B1F4B]/30 overflow-hidden">
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="font-mono2 text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">System snapshot · live demo</p>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Institutions', v: state.institutions.length, c: '#22D3EE' },
                  { label: 'Cases', v: state.complaints.length, c: '#6366F1' },
                  { label: 'Conflicts', v: state.conflicts.filter((x) => !['dismissed'].includes(x.status)).length, c: '#FB7185' },
                ].map((s, i) => (
                  <div key={i} data-testid={`welcome-snapshot-${s.label.toLowerCase()}`} className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-3.5">
                    <p className="font-display text-3xl font-bold" style={{ color: s.c }}>{s.v}</p>
                    <p className="mt-1 font-mono2 text-[9.5px] uppercase tracking-[0.18em] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4">
                <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-rose-300">Flagged now</p>
                <p className="mt-1.5 text-[13px] text-slate-200 leading-snug">CF-2026-0031 — overlapping document requests across PGRC ↔ RB on the Ananya Sharma case.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-mono2 text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> 5 bureaus · 6 categories · 1 shared timeline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between border-t-2 border-[#0B1F4B]/80 pt-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">Five connected portals</h2>
          <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#0B1F4B]/50 hidden sm:block">Every button works — it’s a full demo</p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTALS.map((p, i) => (
            <button key={p.n} data-testid={`welcome-portal-${p.n}`} onClick={() => navigate(p.to)}
              className={`group relative text-left rounded-2xl border-2 border-[#0B1F4B]/12 bg-[#FFFDF8] p-6 hover:border-[#0B1F4B] hover:shadow-xl hover:shadow-[#0B1F4B]/10 transition-all animate-fade-up ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[#0B1F4B] p-2.5 text-[#FF9933]"><p.icon size={18} /></div>
                <span className="font-display text-3xl font-bold text-[#0B1F4B]/15">{p.n}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#0B1F4B]/65">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#C2570A]">
                Open portal <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
          <div className="rounded-2xl bg-[#0B1F4B] p-6 text-[#F7F2E9] flex flex-col justify-between animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div>
              <p className="font-mono2 text-[10px] uppercase tracking-[0.24em] text-[#FFC98B]">The connected story</p>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug">One complaint. Two bureaus. Zero repeated work.</h3>
            </div>
            <button data-testid="welcome-story" onClick={() => navigate('/app/conflicts/CF-2026-0031')}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#FF9933] px-4 py-2 text-[12px] font-bold text-[#0B1F4B] hover:bg-[#FFB05C] transition-colors">
              Try the walkthrough <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="grid sm:grid-cols-4 gap-0 rounded-2xl overflow-hidden border-2 border-[#0B1F4B]/12 bg-[#FFFDF8]">
          {FLOW.map((f, i) => (
            <div key={f.step} className={`p-6 ${i < FLOW.length - 1 ? 'sm:border-r-2 border-[#0B1F4B]/12' : ''} ${i > 0 ? 'border-t-2 sm:border-t-0 border-[#0B1F4B]/12' : ''}`}>
              <p className="font-mono2 text-[10px] uppercase tracking-[0.24em] text-[#C2570A]">Step {i + 1}</p>
              <h4 className="mt-2 font-display text-lg font-bold">{f.step}</h4>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#0B1F4B]/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="relative bg-[#0B1F4B] text-[#F7F2E9]">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <p className="max-w-3xl text-[12px] leading-relaxed text-[#F7F2E9]/75">{DEMO_NOTICE}</p>
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-[#F7F2E9]/10">
              <Building2 size={16} className="text-[#FF9933]" />
            </div>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#F7F2E9]/60">CaseMind AI · v1.0-demo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
