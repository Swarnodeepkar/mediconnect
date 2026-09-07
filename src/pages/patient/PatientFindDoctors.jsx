import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, MapPin, Stethoscope, HeartPulse, Baby, Sparkles, Bone, Users, Ear, Smile,
} from 'lucide-react';
import { useCollection } from '../../data/store.js';
import { formatCurrency } from '../../lib/format.js';
import PatientBookingModal from './PatientBookingModal.jsx';
import DoctorAvatar from './DoctorAvatar.jsx';
import './PatientFindDoctors.css';

const DEPT_ICONS = {
  'General Medicine': Stethoscope,
  Cardiology: HeartPulse,
  Pediatrics: Baby,
  Dermatology: Sparkles,
  Orthopedics: Bone,
  Gynecology: Users,
  ENT: Ear,
  Dental: Smile,
};

export default function PatientFindDoctors() {
  const navigate = useNavigate();
  const doctors = useCollection('DOCTORS');
  const clinics = useCollection('CLINICS');

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [clinicId, setClinicId] = useState('All');
  const [bookDoctor, setBookDoctor] = useState(null);

  const depts = useMemo(() => ['All', ...new Set(doctors.map((d) => d.dept))], [doctors]);
  const clinicById = (id) => clinics.find((c) => c.id === id);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      if (dept !== 'All' && d.dept !== dept) return false;
      if (clinicId !== 'All' && d.clinicId !== clinicId) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.dept.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [doctors, search, dept, clinicId]);

  return (
    <div className="fd">
      <h2 className="fd-title">Find Doctors</h2>
      <p className="fd-sub">Search, compare and book the best care across our clinics.</p>

      <div className="fd-search">
        <Search size={16} strokeWidth={2.2} />
        <input placeholder="Search doctors by name or specialty" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="fd-chips">
        {depts.map((d) => {
          const Icon = DEPT_ICONS[d];
          return (
            <button key={d} className={`fd-chip ${dept === d ? 'is-active' : ''}`} onClick={() => setDept(d)}>
              {Icon && <Icon size={14} strokeWidth={2.2} />}
              {d}
            </button>
          );
        })}
      </div>

      <div className="fd-clinic-row">
        <button className={`fd-clinic-chip ${clinicId === 'All' ? 'is-active' : ''}`} onClick={() => setClinicId('All')}>All Clinics</button>
        {clinics.map((c) => (
          <button key={c.id} className={`fd-clinic-chip ${clinicId === c.id ? 'is-active' : ''}`} onClick={() => setClinicId(c.id)}>
            {c.code}
          </button>
        ))}
      </div>

      <div className="fd-list">
        {results.length === 0 && <div className="fd-empty">No doctors match your filters.</div>}
        {results.map((d) => {
          const clinic = clinicById(d.clinicId);
          return (
            <div className="fd-card" key={d.id}>
              <div className="fd-card__top" onClick={() => navigate(`/patient/find-doctors/${d.id}`)}>
                <div className="fd-card__photo"><DoctorAvatar id={d.id} accent={clinic?.color} size={56} /></div>
                <div className="fd-card__info">
                  <div className="fd-card__name">{d.name}</div>
                  <div className="fd-card__dept">{d.dept}</div>
                  <div className="fd-card__meta">
                    <span><MapPin size={11} strokeWidth={2.2} /> {clinic?.name}</span>
                  </div>
                  <div className="fd-card__stats">
                    <span><Star size={12} strokeWidth={2.2} fill="currentColor" /> {d.rating}</span>
                    <span>&middot;</span>
                    <span>{d.experience} yrs exp</span>
                    <span>&middot;</span>
                    <span className="fd-card__fee">{formatCurrency(d.consultFee)}</span>
                  </div>
                </div>
              </div>
              <div className="fd-card__actions">
                <button className="fd-btn fd-btn--outline" onClick={() => navigate(`/patient/find-doctors/${d.id}`)}>View Profile</button>
                <button className="fd-btn fd-btn--solid" onClick={() => setBookDoctor(d)}>Book Now</button>
              </div>
            </div>
          );
        })}
      </div>

      <PatientBookingModal doctor={bookDoctor} onClose={() => setBookDoctor(null)} />
    </div>
  );
}
