import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Building2, Save, ScanSearch } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppStore';
import { PageHeader } from '@/components/shared';
import { tokenSimilarity } from '@/lib/helpers';

const TYPES = ['Engineering', 'Management', 'Pharmacy', 'Polytechnic', 'Design', 'University'];
const APPROVALS = ['Approved', 'Approval Under Review', 'Conditional', 'Notice Issued'];
const REGIONS = ['South', 'West', 'North', 'East', 'Central', 'North-East'];

export default function InstitutionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, runWithProgress, makeInstitutionId } = useApp();
  const editing = Boolean(id);
  const existing = state.institutions.find((i) => i.id === id);

  const [form, setForm] = useState(() => editing && existing ? { ...existing } : {
    name: '', aliases: [], city: '', state: '', region: 'South', type: 'Engineering',
    approvalStatus: 'Approved', aishe: '', established: 2020, students: 500, programs: 5,
    head: '', phone: '', email: '', lastInspection: '', notes: '',
  });
  const [aliasText, setAliasText] = useState(editing && existing ? existing.aliases.join(', ') : '');
  const [conflictCandidates, setConflictCandidates] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const foundCandidates = useMemo(() => {
    if (!conflictCandidates) return null;
    return state.institutions
      .map((i) => ({ inst: i, sim: tokenSimilarity(form.name, i.name) }))
      .filter((x) => x.sim >= 0.5)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);
  }, [conflictCandidates, state.institutions, form.name]);

  const save = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error('Institution name, city and state are required.');
      return;
    }
    const payload = { ...form, aliases: aliasText.split(',').map((a) => a.trim()).filter(Boolean), students: Number(form.students) || 0, programs: Number(form.programs) || 0, established: Number(form.established) || 2020 };

    if (editing) {
      await runWithProgress('Saving institution record…', ['Validating registry fields', 'Writing record to registry', 'Syncing aliases across linked cases'], { minStepMs: 560, jitterMs: 100 });
      dispatch({ type: 'UPDATE_INSTITUTION', id, patch: payload });
      toast.success(`${payload.name} updated in the registry.`);
      navigate(`/app/registry/${id}`);
      return;
    }

    await runWithProgress('Analyzing institution records…', [
      'Normalising name, aliases and location',
      'Comparing against registry records (fuzzy match)',
      'Scoring duplicate candidates',
      'Preparing match report',
    ], { minStepMs: 560, jitterMs: 120 });

    const candidates = state.institutions
      .map((i) => ({ inst: i, sim: tokenSimilarity(payload.name, i.name) }))
      .filter((x) => x.sim >= 0.5)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);

    if (candidates.length > 0) {
      setConflictCandidates(candidates);
      return;
    }

    commit(payload);
  };

  const commit = (payload) => {
    const newId = makeInstitutionId();
    dispatch({ type: 'ADD_INSTITUTION', institution: { ...payload, id: newId } });
    toast.success(`${payload.name} added to the registry (${newId}).`);
    navigate(`/app/registry/${newId}`);
  };

  const field = (label, key, opts = {}) => (
    <div className={opts.className || ''}>
      <label className="text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500">{label}{opts.required && ' *'}</label>
      {opts.textarea ? (
        <textarea data-testid={`institution-form-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} rows={3}
          className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
      ) : (
        <input data-testid={`institution-form-${key}`} type={opts.inputType || 'text'} value={form[key]} onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder || ''} className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
      )}
    </div>
  );

  const select = (label, key, options, testid) => (
    <div>
      <label className="text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500">{label}</label>
      <select data-testid={testid || `institution-form-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-cyan-400/60">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="institution-form-page">
      <button data-testid="institution-form-back" onClick={() => navigate(editing ? `/app/registry/${id}` : '/app/registry')} className="text-[12.5px] text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1.5"><ArrowLeft size={13} /> Back</button>

      <PageHeader
        testid="institution-form-header"
        eyebrow="Institution Registry"
        title={editing ? `Edit — ${existing?.name}` : 'Register a new institution'}
        sub={editing ? 'Update the registry record. Linked complaints and aliases are preserved.' : 'On save, SAMANVAYA runs a duplicate analysis against the existing registry before creating the record.'}
      />

      {conflictCandidates ? (
        <div data-testid="institution-match-warning" className="panel rounded-xl p-6 border-amber-400/40 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-2.5 text-amber-300 shrink-0"><AlertTriangle size={18} /></div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-amber-200">Potential duplicates found — human review required</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
                While analyzing “{form.name}”, the matching engine found {conflictCandidates.length} existing record{conflictCandidates.length > 1 ? 's' : ''} with similar names.
                Review the evidence before creating a new record — you can still save it as a distinct institution.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            {conflictCandidates.map(({ inst, sim }) => (
              <div key={inst.id} data-testid={`institution-match-candidate-${inst.id}`} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-slate-200">{inst.name}</p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">{inst.id} · {inst.city}, {inst.state} · {Math.round(sim * 100)}% name similarity</p>
                </div>
                <div className="flex gap-2">
                  <button data-testid={`institution-match-view-${inst.id}`} onClick={() => navigate(`/app/registry/${inst.id}`)}
                    className="rounded-lg border border-slate-600/60 px-3.5 py-2 text-[12px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300">Inspect record</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-end">
            <button data-testid="institution-match-cancel" onClick={() => setConflictCandidates(null)}
              className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:border-slate-500">← Back to form</button>
            <button data-testid="institution-save-anyway" onClick={() => commit({ ...form, aliases: aliasText.split(',').map((a) => a.trim()).filter(Boolean), students: Number(form.students) || 0, programs: Number(form.programs) || 0, established: Number(form.established) || 2020 })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-[#3A2503] hover:bg-amber-300">
              <Save size={14} /> Save as distinct institution
            </button>
          </div>
        </div>
      ) : (
        <div className="panel rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {field('Institution name *', 'name', { required: true, placeholder: 'e.g. Shivalik Institute of Pharma Sciences', className: 'md:col-span-2' })}
            <div className="md:col-span-2">
              <label className="text-[11px] font-mono2 uppercase tracking-[0.14em] text-slate-500">Known aliases (comma separated)</label>
              <input data-testid="institution-form-aliases" value={aliasText} onChange={(e) => setAliasText(e.target.value)}
                placeholder="e.g. SIPS Dehradun, Shivalik Pharmacy" className="mt-1.5 w-full rounded-lg border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
            </div>
            {field('City *', 'city', { required: true })}
            {field('State *', 'state', { required: true })}
            {select('Region', 'region', REGIONS)}
            {select('Institution type', 'type', TYPES)}
            {select('Approval status', 'approvalStatus', APPROVALS)}
            {field('AISHE code', 'aishe', { placeholder: 'AISHE-XX-XXXX' })}
            {field('Established', 'established', { inputType: 'number' })}
            {field('Students enrolled', 'students', { inputType: 'number' })}
            {field('Programmes', 'programs', { inputType: 'number' })}
            {field('Head of institution', 'head')}
            {field('Phone', 'phone')}
            {field('Email', 'email', { inputType: 'email' })}
            {field('Last inspection', 'lastInspection', { inputType: 'date' })}
            {field('Registry notes', 'notes', { textarea: true, className: 'md:col-span-2' })}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-[11.5px] text-slate-500">
              <ScanSearch size={13} className="text-cyan-300" />
              Saving triggers “Analyzing institution records…” — a simulated 2.5s duplicate check.
            </p>
            <div className="flex gap-2.5">
              <button data-testid="institution-form-cancel" onClick={() => navigate(editing ? `/app/registry/${id}` : '/app/registry')}
                className="rounded-lg border border-slate-600/60 px-4 py-2.5 text-[12.5px] text-slate-300 hover:border-slate-500">Cancel</button>
              <button data-testid="institution-form-save" onClick={save}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-[13px] font-semibold text-[#05222B] shadow-[0_0_24px_-6px_#22D3EE] hover:bg-cyan-300">
                <Building2 size={14} /> {editing ? 'Save changes' : 'Run duplicate check & save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
