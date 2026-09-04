import { createContext, useContext, useState } from 'react';
import { useCollection } from '../data/store.js';

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const clinics = useCollection('CLINICS');
  const [clinicId, setClinicId] = useState('all');

  return (
    <ClinicContext.Provider value={{ clinics, clinicId, setClinicId }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
}

export function filterByClinic(records, clinicId) {
  if (clinicId === 'all') return records;
  return records.filter((r) => r.clinicId === clinicId);
}
