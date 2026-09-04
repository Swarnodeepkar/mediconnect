import { useSyncExternalStore } from 'react';
import * as seed from './seed.js';

const STORAGE_KEY = 'mediconnect_db_v1';

const COLLECTIONS = [
  'CLINICS', 'DEPARTMENTS', 'DOCTORS', 'STAFF', 'PATIENTS', 'APPOINTMENTS',
  'LAB_TESTS', 'HOME_VISITS', 'COMPLAINTS', 'ATTENDANCE_TODAY', 'REVENUE_TREND',
  'NOTIFICATIONS', 'USERS', 'PRESCRIPTIONS', 'PAYMENTS',
  'LEAVE_REQUESTS', 'TASKS', 'PAYSLIPS',
];

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Backfill any collections added after this session's data was first seeded.
      for (const key of COLLECTIONS) {
        if (!(key in parsed)) parsed[key] = seed[key];
      }
      return parsed;
    }
  } catch {
    // fall through to seed
  }
  const initial = {};
  for (const key of COLLECTIONS) initial[key] = seed[key];
  return initial;
}

let state = loadInitial();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors in prototype
  }
}

function emit() {
  persist();
  for (const l of listeners) l();
}

export const db = {
  get(collection) {
    return state[collection] || [];
  },
  getById(collection, id) {
    return (state[collection] || []).find((r) => r.id === id) || null;
  },
  insert(collection, record) {
    const id = record.id || `${collection.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const withId = { ...record, id };
    state = { ...state, [collection]: [...(state[collection] || []), withId] };
    emit();
    return withId;
  },
  update(collection, id, patch) {
    state = {
      ...state,
      [collection]: (state[collection] || []).map((r) =>
        r.id === id ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch) } : r
      ),
    };
    emit();
  },
  remove(collection, id) {
    state = { ...state, [collection]: (state[collection] || []).filter((r) => r.id !== id) };
    emit();
  },
  setCollection(collection, records) {
    state = { ...state, [collection]: records };
    emit();
  },
  reset() {
    const initial = {};
    for (const key of COLLECTIONS) initial[key] = seed[key];
    state = initial;
    emit();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  snapshot() {
    return state;
  },
};

export function useCollection(collection) {
  return useSyncExternalStore(db.subscribe, () => db.get(collection));
}

export function useRecord(collection, id) {
  const all = useCollection(collection);
  return all.find((r) => r.id === id) || null;
}
