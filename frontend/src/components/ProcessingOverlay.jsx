import React from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/store/AppStore';

export function ProcessingOverlay() {
  const { processing } = useApp();
  if (!processing.active) return null;

  return (
    <div data-testid="processing-overlay" className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#04070E]/85 backdrop-blur-md" />
      <div className="relative w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0A1222]/95 p-6 shadow-[0_0_80px_-10px_rgba(34,211,238,0.35)] animate-scale-in">
        <div className="scan-line" />
        <div className="flex items-center gap-3">
          <div className="relative grid place-items-center h-10 w-10">
            <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="17" stroke="#22D3EE33" strokeWidth="2" />
              <circle cx="20" cy="20" r="17" stroke="#22D3EE" strokeWidth="2" strokeDasharray="30 80" strokeLinecap="round" />
            </svg>
            <Loader2 size={15} className="animate-spin text-cyan-300" />
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold text-slate-100">{processing.title}</p>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-cyan-400/70 mt-0.5">CaseMind AI · simulated processing</p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {processing.steps.map((s, i) => (
            <div key={i} data-testid={`processing-step-${i}`} className="flex items-center gap-3">
              {s.state === 'done' ? (
                <span className="grid place-items-center h-5 w-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300">
                  <Check size={11} strokeWidth={3} />
                </span>
              ) : s.state === 'active' ? (
                <span className="grid place-items-center h-5 w-5 rounded-full bg-cyan-400/15 border border-cyan-400/50 text-cyan-300">
                  <Loader2 size={11} className="animate-spin" strokeWidth={3} />
                </span>
              ) : (
                <span className="grid place-items-center h-5 w-5 rounded-full border border-slate-600/60 text-slate-600">
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                </span>
              )}
              <span className={`text-[12.5px] ${s.state === 'done' ? 'text-slate-400' : s.state === 'active' ? 'text-cyan-200 font-medium' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
          <div data-testid="processing-progress" className="h-full rounded-full transition-all duration-300"
            style={{ width: `${processing.progress * 100}%`, background: 'linear-gradient(90deg,#22D3EE88,#22D3EE)', boxShadow: '0 0 16px #22D3EE88' }} />
        </div>
      </div>
    </div>
  );
}

export default ProcessingOverlay;
