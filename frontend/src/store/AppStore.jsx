import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  BUREAUS, BUREAU_MAP, CATEGORIES, STATUSES, PRIORITIES, OFFICERS, CURRENT_USER,
  INSTITUTIONS, MATCH_CANDIDATES, COMPLAINTS, CONFLICTS, COORDINATIONS, NOTIFICATIONS, ACTIVITY,
} from '@/data/seed';
import { sleep, nextSeq } from '@/lib/helpers';

const STORE_KEY = 'samanvaya-demo-state-v1';
const clone = (x) => JSON.parse(JSON.stringify(x));

function freshState() {
  return {
    version: 1,
    institutions: clone(INSTITUTIONS),
    matchCandidates: clone(MATCH_CANDIDATES),
    complaints: clone(COMPLAINTS),
    conflicts: clone(CONFLICTS),
    coordinations: clone(COORDINATIONS),
    notifications: clone(NOTIFICATIONS),
    activity: clone(ACTIVITY),
    categories: CATEGORIES,
    officers: clone(OFFICERS),
    bureauMap: BUREAU_MAP,
    bureaus: BUREAUS,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        return {
          ...freshState(),
          ...parsed,
          categories: parsed.categories || CATEGORIES,
          officers: parsed.officers || clone(OFFICERS),
          bureauMap: parsed.bureauMap || BUREAU_MAP,
          bureaus: parsed.bureaus || BUREAUS,
        };
      }
    }
  } catch (e) { /* fall through */ }
  return freshState();
}

function addActivity(state, kind, text, link) {
  const entry = { id: `A-${Date.now()}-${Math.floor(Math.random() * 1000)}`, ts: new Date().toISOString(), kind, text, link: link || '/app/dashboard' };
  return [entry, ...state.activity].slice(0, 40);
}

function addNotification(state, kind, severity, title, detail, link) {
  return [{ id: `N-${Date.now()}`, kind, severity, read: false, ts: new Date().toISOString(), title, detail, link: link || '/app/dashboard' }, ...state.notifications];
}

function touchComplaint(state, caseId, event) {
  return state.complaints.map((c) => {
    if (c.caseId !== caseId) return c;
    const timeline = event ? [...(c.timeline || []), event] : c.timeline;
    return { ...c, timeline, updated: event ? event.ts : c.updated };
  });
}

function reducer(state, action) {
  const now = () => new Date().toISOString();
  switch (action.type) {
    case 'ADD_INSTITUTION':
      return { ...state, institutions: [action.institution, ...state.institutions] };

    case 'UPDATE_INSTITUTION':
      return {
        ...state,
        institutions: state.institutions.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i)),
      };

    case 'CONFIRM_MATCH': {
      const cand = state.matchCandidates.find((m) => m.id === action.candidateId);
      if (!cand) return state;
      return {
        ...state,
        matchCandidates: state.matchCandidates.map((m) => (m.id === action.candidateId ? { ...m, status: 'confirmed', decidedAt: now(), decidedBy: action.actor || 'Priya Nair' } : m)),
        institutions: state.institutions.map((i) =>
          i.id === cand.matchesInstitution && !i.aliases.includes(cand.rawName) ? { ...i, aliases: [...i.aliases, cand.rawName] } : i
        ),
        activity: addActivity(state, 'registry', `Registry match ${cand.id} confirmed — "${cand.rawName}" merged as alias of ${cand.matchesInstitution}`, '/app/registry?tab=matches'),
      };
    }

    case 'DISMISS_MATCH':
      return {
        ...state,
        matchCandidates: state.matchCandidates.map((m) =>
          m.id === action.candidateId ? { ...m, status: 'dismissed', reason: action.reason || 'Not a match', decidedAt: now(), decidedBy: action.actor || 'Priya Nair' } : m
        ),
        activity: addActivity(state, 'registry', `Registry match ${action.candidateId} dismissed (${action.reason || 'not a match'})`, '/app/registry?tab=matches'),
      };

    case 'ADD_COMPLAINT': {
      const c = action.complaint;
      const conflictId = action.conflictId || null;
      let conflicts = state.conflicts;
      if (conflictId) {
        conflicts = conflicts.map((cf) =>
          cf.id === conflictId ? { ...cf, status: 'detected', caseB: c.caseId, updated: now() } : cf
        );
      }
      return {
        ...state,
        conflicts,
        complaints: [{ ...c, conflictId }, ...state.complaints],
        activity: addActivity(state, 'complaint', `${c.caseId} registered — ${c.subject} (${c.bureau})`, `/app/complaints/${c.caseId}`),
        notifications: addNotification(state, 'complaint', 'low', `Complaint ${c.caseId} registered`, `${c.subject} · ${c.category}`, `/app/complaints/${c.caseId}`),
      };
    }

    case 'SET_COMPLAINT_STATUS':
      return {
        ...state,
        complaints: state.complaints.map((c) =>
          c.caseId === action.caseId
            ? { ...c, status: action.status, bureau: action.bureau || c.bureau, updated: now(), priority: action.priority || c.priority, timeline: [...c.timeline, { ts: now(), actor: action.actor, type: action.eventType || 'status', text: action.remark || `Status updated to ${action.status}.` }] }
            : c
        ),
        activity: addActivity(state, 'complaint', `${action.caseId} → ${action.status}${action.remark ? ` · ${action.remark}` : ''}`, `/app/complaints/${action.caseId}`),
      };

    case 'ASSIGN_OFFICER': {
      const officer = OFFICERS.find((o) => o.id === action.officerId);
      return {
        ...state,
        complaints: state.complaints.map((c) =>
          c.caseId === action.caseId
            ? { ...c, officerId: action.officerId, updated: now(), timeline: [...c.timeline, { ts: now(), actor: action.actor, type: 'assignment', text: `Case assigned to ${officer ? `${officer.name} (${officer.bureau})` : action.officerId}.` }] }
            : c
        ),
        activity: addActivity(state, 'complaint', `${action.caseId} assigned to ${officer ? officer.name : action.officerId}`, `/app/complaints/${action.caseId}`),
      };
    }

    case 'ADD_COMPLAINT_NOTE':
      return {
        ...state,
        complaints: state.complaints.map((c) =>
          c.caseId === action.caseId
            ? { ...c, notes: [...(c.notes || []), { ts: now(), author: action.author, text: action.text }], timeline: [...c.timeline, { ts: now(), actor: action.author, type: 'note', text: `Internal note added: “${action.text.slice(0, 80)}${action.text.length > 80 ? '…' : ''}”` }] }
            : c
        ),
      };

    case 'ADD_DOCUMENT': {
      const { caseId, docName, note, mode, justification, conflictRef } = action;
      return {
        ...state,
        complaints: state.complaints.map((c) => {
          if (c.caseId !== caseId) return c;
          const docs = [...(c.docs || []), { name: docName, requestedOn: now().slice(0, 10), status: 'Awaited' }];
          let timeline = c.timeline;
          if (mode === 'proceeded') {
            timeline = [...timeline, { ts: now(), actor: action.actor, type: 'docs', text: `Document request issued: ${docName}. Proceeded despite overlap warning — justification: “${justification}”.` }];
          } else {
            timeline = [...timeline, { ts: now(), actor: action.actor, type: 'docs', text: `Document request issued: ${docName}.${conflictRef ? ` Coordinated after conflict check (${conflictRef}).` : ''}` }];
          }
          if (note) timeline = [...timeline, { ts: now(), actor: action.actor, type: 'note', text: `Request note: ${note}` }];
          return { ...c, docs, timeline, updated: now() };
        }),
      };
    }

    case 'RESOLVE_CONFLICT': {
      const { conflictId, action: act, justification, coordinationId, actor } = action;
      const conflict = state.conflicts.find((cf) => cf.id === conflictId);
      if (!conflict) return state;
      const nowTs = now();
      const statusMap = { coordinated: 'coordinated', proceeded: 'proceeded', dismissed: 'dismissed', flagged: 'flagged', under_review: 'under-review' };
      const statusLabel = { coordinated: 'Coordinated', proceeded: 'Proceeded with justification', dismissed: 'Dismissed as false positive', flagged: 'Flagged for review', under_review: 'Under review' };
      const newAction = { ts: nowTs.slice(0, 10), kind: act === 'under_review' ? 'flagged' : act, actor: actor || 'Priya Nair · PGRC', detail: justification ? `${statusLabel[act]} — “${justification}”` : statusLabel[act] + (coordinationId ? ` via ${coordinationId}.` : '.') };
      const timelineText = {
        coordinated: `Cross-bureau conflict ${conflictId} resolved by coordination${coordinationId ? ` (${coordinationId})` : ''}. Cases remain independently owned by their bureaus.`,
        proceeded: `Conflict ${conflictId} reviewed — proceeded with justification: “${justification}”.`,
        dismissed: `Conflict ${conflictId} dismissed as false positive after review.`,
        flagged: `Conflict ${conflictId} flagged for further review by ${actor || 'reviewing officer'}.`,
        under_review: `Conflict ${conflictId} taken up for detailed review by ${actor || 'reviewing officer'}.`,
      };
      return {
        ...state,
        conflicts: state.conflicts.map((cf) =>
          cf.id === conflictId
            ? { ...cf, status: statusMap[act] || cf.status, updated: nowTs, resolutionNote: justification || cf.resolutionNote, coordinationId: coordinationId || cf.coordinationId, actions: [...(cf.actions || []), newAction] }
            : cf
        ),
        complaints: state.complaints.map((c) =>
          [conflict.caseA, conflict.caseB].includes(c.caseId)
            ? { ...c, updated: nowTs, timeline: [...c.timeline, { ts: nowTs, actor: actor || 'SAMANVAYA AI', type: 'conflict', text: timelineText[act] || `Conflict ${conflictId} updated.` }] }
            : c
        ),
        activity: addActivity(state, 'conflict', `Conflict ${conflictId} → ${statusLabel[act]} (${conflict.caseA} ↔ ${conflict.caseB})`, `/app/conflicts/${conflictId}`),
      };
    }

    case 'CREATE_CONFLICT': {
      const cf = action.conflict;
      return {
        ...state,
        conflicts: [cf, ...state.conflicts],
        activity: addActivity(state, 'conflict', `New conflict ${cf.id} detected — ${cf.caseA} ↔ ${cf.caseB}`, `/app/conflicts/${cf.id}`),
        notifications: addNotification(state, 'conflict', 'high', `Potential overlap detected — ${cf.id}`, `${cf.caseA} ↔ ${cf.caseB} · coordination required`, `/app/conflicts/${cf.id}`),
      };
    }

    case 'ADD_COORDINATION': {
      const cr = action.coordination;
      const conflictId = action.conflictId || cr.conflictId || null;
      let conflicts = state.conflicts;
      if (conflictId && cr.status !== 'Draft') {
        conflicts = conflicts.map((cf) =>
          cf.id === conflictId ? { ...cf, status: 'coordinated', coordinationId: cr.id, updated: now(), actions: [...(cf.actions || []), { ts: now().slice(0, 10), kind: 'coordinated', actor: `${CURRENT_USER.name} · ${CURRENT_USER.bureau}`, detail: `Coordination request ${cr.id} sent to ${cr.toBureau}. Linked cases remain independently owned.` }] } : cf
        );
      }
      let complaints = state.complaints;
      if (cr.status !== 'Draft') {
        complaints = complaints.map((c) =>
          (cr.linkedCases || []).includes(c.caseId)
            ? { ...c, coordinationIds: [...(c.coordinationIds || []), cr.id], updated: now(), timeline: [...c.timeline, { ts: now(), actor: `${CURRENT_USER.name} · ${CURRENT_USER.bureau}`, type: 'coordination', text: `Coordination request ${cr.id} sent to ${cr.toBureau} linking this case. Original case ID, history and bureau ownership unchanged.` }] }
            : c
        );
      }
      return {
        ...state,
        conflicts,
        complaints,
        coordinations: [cr, ...state.coordinations],
        activity: addActivity(state, 'coordination', cr.status === 'Draft' ? `Draft ${cr.id} saved (${cr.toBureau} · ${cr.subject})` : `${cr.id} sent from ${cr.fromBureau} to ${cr.toBureau} — ${cr.subject}`, cr.status === 'Draft' ? '/app/coordination?tab=drafts' : `/app/coordination/${cr.id}`),
        notifications: cr.status === 'Draft' ? state.notifications : addNotification(state, 'coordination', 'medium', `${cr.id} sent to ${cr.toBureau}`, cr.subject, `/app/coordination/${cr.id}`),
      };
    }

    case 'UPDATE_COORDINATION': {
      const { id, status, message } = action;
      const cr = state.coordinations.find((x) => x.id === id);
      if (!cr) return state;
      let complaints = state.complaints;
      if (status === 'Resolved' && cr.status !== 'Resolved') {
        complaints = complaints.map((c) =>
          (cr.linkedCases || []).includes(c.caseId)
            ? { ...c, updated: now(), timeline: [...c.timeline, { ts: now(), actor: action.actor || `${CURRENT_USER.name} · ${CURRENT_USER.bureau}`, type: 'coordination', text: `Coordination ${id} marked resolved by ${cr.toBureau === c.bureau ? c.bureau : cr.fromBureau}. Linked case history retained.` }] }
            : c
        );
      }
      return {
        ...state,
        complaints,
        coordinations: state.coordinations.map((x) =>
          x.id === id
            ? { ...x, status: status || x.status, updated: now(), messages: message ? [...x.messages, { ...message, ts: now() }] : x.messages }
            : x
        ),
        activity: addActivity(state, 'coordination', `${id} → ${status || 'message added'} (${cr.subject})`, `/app/coordination/${id}`),
      };
    }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: addNotification(state, action.kind || 'system', action.severity || 'low', action.title, action.detail, action.link) };

    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case 'ADD_ACTIVITY':
      return { ...state, activity: addActivity(state, action.kind || 'system', action.text, action.link) };

    case 'RESET':
      return freshState();

    default:
      return state;
  }
}

const STATIC_CTX = {
  bureaus: BUREAUS, bureauMap: BUREAU_MAP, categories: CATEGORIES, statuses: STATUSES,
  priorities: PRIORITIES, officers: OFFICERS, currentUser: CURRENT_USER,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatchRaw] = useReducer(reducer, undefined, loadState);
  const [processing, setProcessing] = useState({ active: false, title: '', steps: [], progress: 0 });
  const busyRef = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full — ignore */ }
  }, [state]);

  const dispatch = (a) => dispatchRaw(a);

  async function runWithProgress(title, steps, { minStepMs = 560, jitterMs = 160, releaseMs = 300 } = {}) {
    if (busyRef.current) return;
    busyRef.current = true;
    const labels = steps.map((s) => (typeof s === 'string' ? s : s.label));
    setProcessing({ active: true, title, steps: labels.map((label, i) => ({ label, state: i === 0 ? 'active' : 'pending' })), progress: 0.02 });
    const total = labels.length * minStepMs + labels.length * jitterMs;
    let acc = 0;
    for (let i = 0; i < labels.length; i++) {
      await sleep(minStepMs + Math.floor(Math.random() * jitterMs));
      acc += minStepMs;
      const progress = Math.min(0.98, acc / (total - jitterMs * labels.length));
      setProcessing((p) => ({
        ...p,
        steps: p.steps.map((s, j) => ({ ...s, state: j < i ? 'done' : j === i ? 'done' : j === i + 1 ? 'active' : 'pending' })),
        progress,
      }));
    }
    setProcessing((p) => ({ ...p, progress: 1, steps: p.steps.map((s) => ({ ...s, state: 'done' })) }));
    await sleep(releaseMs);
    setProcessing({ active: false, title: '', steps: [], progress: 0 });
    busyRef.current = false;
  }

  function resetDemo() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    dispatchRaw({ type: 'RESET' });
  }

  const value = useMemo(() => ({
    state, dispatch, runWithProgress, processing, resetDemo, ...STATIC_CTX,
    makeCaseId: (bureau) => nextSeq(state.complaints.map((c) => ({ id: c.caseId })), 'id', `${bureau}-2026-`),
    makeCoordinationId: () => nextSeq(state.coordinations, 'id', 'CR-2026-'),
    makeInstitutionId: () => nextSeq(state.institutions, 'id', 'INST-'),
    makeConflictId: () => nextSeq(state.conflicts, 'id', 'CF-2026-'),
  }), [state, processing]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
