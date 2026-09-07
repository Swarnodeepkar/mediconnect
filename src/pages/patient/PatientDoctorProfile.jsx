import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, BadgeCheck, Briefcase, Users, IndianRupee, MapPin, CalendarCheck,
} from 'lucide-react';
import { useCollection } from '../../data/store.js';
import { formatCurrency, formatTime12 } from '../../lib/format.js';
import PatientBookingModal from './PatientBookingModal.jsx';
import DoctorAvatar from './DoctorAvatar.jsx';
import './PatientDoctorProfile.css';

const TODAY = '2026-09-04';
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '16:00', '16:30'];

export default function PatientDoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctors = useCollection('DOCTORS');
  const clinics = useCollection('CLINICS');
  const appointments = useCollection('APPOINTMENTS');
  const consultations = useCollection('CONSULTATIONS');
  const [bookOpen, setBookOpen] = useState(false);
  const [prefillTime, setPrefillTime] = useState(null);

  const doctor = doctors.find((d) => d.id === doctorId);
  const clinic = clinics.find((c) => c.id === doctor?.clinicId);

  const patientsTreated = useMemo(() => {
    if (!doctor) return 0;
    const ids = new Set([
      ...appointments.filter((a) => a.doctorId === doctor.id).map((a) => a.patientId),
      ...consultations.filter((c) => c.doctorId === doctor.id).map((c) => c.patientId),
    ]);
    return ids.size;
  }, [doctor, appointments, consultations]);

  const takenToday = appointments
    .filter((a) => a.doctorId === doctor?.id && a.date === TODAY && a.status !== 'Cancelled')
    .map((a) => a.time);
  const availableToday = TIME_SLOTS.filter((t) => !takenToday.includes(t));

  if (!doctor) {
    return (
      <div className="dpw-empty">
        <p>Doctor not found.</p>
        <button className="dpw-btn dpw-btn--outline" onClick={() => navigate('/patient/find-doctors')}>Back to Find Doctors</button>
      </div>
    );
  }

  return (
    <div className="dpw">
      <button className="dpw-back" onClick={() => navigate('/patient/find-doctors')}>
        <ArrowLeft size={16} strokeWidth={2.2} /> Find Doctors
      </button>

      <div className="dpw-body">
        <aside className="dpw-side">
          <div className="dpw-photo">
            <DoctorAvatar id={doctor.id} accent={clinic?.color} size={160} />
            <span className="dpw-photo__badge"><BadgeCheck size={20} strokeWidth={2.3} /></span>
          </div>

          <h1 className="dpw-name">{doctor.name}</h1>
          <div className="dpw-dept">{doctor.dept}</div>
          <div className="dpw-qual">{doctor.qualification} &middot; {doctor.experience}+ years experience</div>
          <div className="dpw-rating"><Star size={14} strokeWidth={2.2} fill="currentColor" /> {doctor.rating} rating</div>

          <div className="dpw-stats">
            <div className="dpw-stat"><Briefcase size={16} strokeWidth={2} /><div className="dpw-stat__v">{doctor.experience}+</div><div className="dpw-stat__l">Years</div></div>
            <div className="dpw-stat"><Users size={16} strokeWidth={2} /><div className="dpw-stat__v">{patientsTreated}</div><div className="dpw-stat__l">Patients</div></div>
            <div className="dpw-stat"><Star size={16} strokeWidth={2} /><div className="dpw-stat__v">{doctor.rating}</div><div className="dpw-stat__l">Rating</div></div>
            <div className="dpw-stat"><IndianRupee size={16} strokeWidth={2} /><div className="dpw-stat__v">{doctor.consultFee}</div><div className="dpw-stat__l">Fee</div></div>
          </div>

          <button className="dpw-cta" onClick={() => { setPrefillTime(null); setBookOpen(true); }}>
            Book Appointment &middot; {formatCurrency(doctor.consultFee)}
          </button>
        </aside>

        <main className="dpw-main">
          <section className="dpw-section">
            <h3>About</h3>
            <p className="dpw-bio">{doctor.bio}</p>
          </section>

          <section className="dpw-section">
            <h3>Specialty</h3>
            <div className="dpw-tags">
              <span className="dpw-tag">{doctor.dept}</span>
            </div>
          </section>

          <section className="dpw-section">
            <h3>Available Today</h3>
            {availableToday.length === 0 ? (
              <p className="dpw-muted">No open slots today. Choose another date when booking.</p>
            ) : (
              <div className="dpw-slot-row">
                {availableToday.map((t) => (
                  <button key={t} className="dpw-slot" onClick={() => { setPrefillTime(t); setBookOpen(true); }}>
                    <CalendarCheck size={13} strokeWidth={2.2} />
                    {formatTime12(t)}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="dpw-section">
            <h3>Clinic</h3>
            <div className="dpw-clinic-card">
              <div className="dpw-clinic-card__name">{clinic?.name} <span className="dpw-clinic-code">{clinic?.code}</span></div>
              <div className="dpw-clinic-card__addr"><MapPin size={14} strokeWidth={2.2} /> {clinic?.address}, {clinic?.city}</div>
            </div>
          </section>
        </main>
      </div>

      <PatientBookingModal
        doctor={bookOpen ? doctor : null}
        onClose={() => setBookOpen(false)}
        defaultDate={prefillTime ? TODAY : undefined}
        defaultTime={prefillTime || undefined}
      />
    </div>
  );
}
