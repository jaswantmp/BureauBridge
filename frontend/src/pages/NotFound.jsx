import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div data-testid="not-found" className="min-h-screen bg-background grid place-items-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          <Compass size={24} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-slate-100">Page not found</h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          This route doesn’t exist in the SAMANVAYA AI demo. Head back to the command centre or the welcome screen.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link to="/app" className="rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] hover:bg-cyan-300">Open Command Centre</Link>
          <Link to="/" className="rounded-lg border border-slate-600/60 px-5 py-2.5 text-[13px] text-slate-300 hover:bg-slate-800/60">Welcome screen</Link>
        </div>
      </div>
    </div>
  );
}
