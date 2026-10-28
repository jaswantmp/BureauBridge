// token similarity + demo matching engine (frontend simulation only)
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function tokenize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !['of', 'and', 'the', 'in', 'for', 'institute', 'inst'].includes(w));
}

export function tokenSimilarity(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => { if (B.has(w)) inter += 1; });
  return inter / (A.size + B.size - inter);
}

export function nextCaseId(complaints, bureau) {
  const prefix = `${bureau}-2026-`;
  let max = 100;
  complaints.forEach((c) => {
    if (c.caseId && c.caseId.startsWith(prefix)) {
      const n = parseInt(c.caseId.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export function nextSeq(items, field, prefix) {
  let max = 0;
  items.forEach((it) => {
    if (it[field] && it[field].startsWith(prefix)) {
      const n = parseInt(it[field].slice(prefix.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

const CATEGORY_AFFINITY = {
  'Withheld Certificates': { 'Approval-Related Concerns': 0.7, 'Student Grievance': 0.55, 'Fee Disputes': 0.4 },
  'Approval-Related Concerns': { 'Withheld Certificates': 0.7, 'Student Grievance': 0.45 },
  'Fee Disputes': { 'Student Grievance': 0.6, 'Withheld Certificates': 0.4 },
  'Examination Issues': { 'Student Grievance': 0.6 },
  'Student Grievance': { 'Withheld Certificates': 0.55, 'Fee Disputes': 0.6, 'Examination Issues': 0.6, 'Approval-Related Concerns': 0.45 },
  'Infrastructure Problems': { 'Approval-Related Concerns': 0.5 },
};

export function categoryAffinity(a, b) {
  if (a === b) return 1;
  return (CATEGORY_AFFINITY[a] || {})[b] || 0;
}

// Would registering this complaint overlap an active case of another bureau at the same institution?
export function checkComplaintOverlap(state, { institutionId, category }) {
  const inst = state.institutions.find((i) => i.id === institutionId);
  if (!inst) return null;
  const candidates = state.complaints.filter(
    (c) => c.institutionId === institutionId && c.status !== 'Disposed' && c.bureau !== 'PGRC'
  );
  let best = null;
  candidates.forEach((c) => {
    const aff = categoryAffinity(category, c.category);
    if (aff > 0.3) {
      const confidence = Math.min(0.93, 0.62 + aff * 0.28);
      if (!best || confidence > best.confidence) {
        best = { complaint: c, affinity: aff, confidence };
      }
    }
  });
  if (!best) return null;
  return {
    target: best.complaint,
    confidence: Math.round(best.confidence * 100) / 100,
    evidence: [
      { label: 'Institution match', detail: `Both complaints reference ${inst.name} (${inst.id})`, strength: 1.0 },
      { label: 'Thematic similarity', detail: `"${category}" is closely related to "${best.complaint.category}" in the active ${best.complaint.bureau} case`, strength: best.affinity },
      { label: 'Bureau overlap', detail: `Case ${best.complaint.caseId} is already under process with the ${best.complaint.bureau}`, strength: 0.85 },
    ],
  };
}

// Would requesting this document duplicate a request already made by another bureau?
export function checkDocumentConflict(state, caseId, docName) {
  const origin = state.complaints.find((c) => c.caseId === caseId);
  if (!origin || !docName) return null;
  const inst = state.institutions.find((i) => i.id === origin.institutionId);
  const others = state.complaints.filter(
    (c) => c.institutionId === origin.institutionId && c.caseId !== caseId && c.status !== 'Disposed' && c.docs && c.docs.length > 0
  );
  let best = null;
  others.forEach((c) => {
    c.docs.forEach((d) => {
      const sim = tokenSimilarity(docName, d.name);
      if (sim >= 0.45 && (!best || sim > best.sim)) {
        best = { complaint: c, doc: d, sim };
      }
    });
  });
  if (!best) return null;
  const existingConflict = state.conflicts.find(
    (cf) => cf.caseA === caseId && cf.caseB === best.complaint.caseId && ['detected', 'flagged', 'under-review'].includes(cf.status)
  );
  return {
    origin,
    target: best.complaint,
    targetDoc: best.doc,
    similarity: best.sim,
    institution: inst,
    existingConflictId: existingConflict ? existingConflict.id : null,
    evidence: [
      { label: 'Institution match', detail: `Both cases reference ${inst ? inst.name : origin.institutionId}`, strength: 1.0 },
      { label: 'Document request overlap', detail: `"${best.doc.name}" was already requested by the ${best.complaint.bureau} on ${best.doc.requestedOn} in ${best.complaint.caseId}`, strength: best.sim },
      { label: 'Thematic similarity', detail: `"${origin.category}" is closely related to "${best.complaint.category}" handled by the ${best.complaint.bureau}`, strength: categoryAffinity(origin.category, best.complaint.category) || 0.6 },
      { label: 'Timeline proximity', detail: 'The two document requests fall within a short window on the same record set', strength: 0.82 },
    ],
  };
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d) {
  if (!d) return '—';
  const now = new Date();
  const dt = new Date(d);
  const diff = Math.max(0, now - dt);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export function daysOverdue(slaDue) {
  if (!slaDue) return 0;
  const diff = new Date() - new Date(slaDue);
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function initials(name) {
  return (name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function confidenceLevel(c) {
  if (c >= 0.8) return { label: 'High', color: '#F87171', tone: 'text-rose-300' };
  if (c >= 0.65) return { label: 'Medium', color: '#FBBF24', tone: 'text-amber-300' };
  return { label: 'Low', color: '#38BDF8', tone: 'text-sky-300' };
}
