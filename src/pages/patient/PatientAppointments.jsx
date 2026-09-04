import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Avatar, StatusBadge, SegmentedControl, Modal, Button } from '../../components/ui.jsx';
import { formatDate, formatTime12, formatCurrency } from '../../lib/format.js';
import './PatientAppointments.css';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '16:00', '16:30'];

export default function PatientAppointments() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const appointments = useCollection('APPOINTMENTS');
  const doctors = useCollection('DOCTORS');
  const clinics = useCollection('CLINICS');

  const [tab, setTab] = useState('upcoming');
  const [bookOpen, setBookOpen] = useState(params.get('book') === '1');
  const [actionAppt, setActionAppt] = useState(null);

  useEffect(() => {
    if (params.get('book') === '1') {
      setBookOpen(true);
      params.delete('book');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mine = appointments.filter((a) => a.patientId === user.patientId);
  const upcoming = mine.filter((a) => ['Scheduled', 'Waiting', 'In Progress'].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = mine.filter((a) => ['Completed', 'Cancelled'].includes(a.status)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const doctorById = (id) => doctors.find((d) => d.id === id);
  const clinicById = (id) => clinics.find((c) => c.id === id);
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="pa">
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'upcoming', label: `Upcoming (${upcoming.length})` }, { value: 'past', label: 'Past' }]}
      />

      <button className="pa-book-cta" onClick={() => setBookOpen(true)}>+ Book New Appointment</button>

      <div className="pa-list">
        {list.length === 0 && (
          <div className="pa-empty">
            {tab === 'upcoming' ? 'No upcoming appointments. Book one above.' : 'No past appointments yet.'}
          </div>
        )}
        {list.map((a) => {
          const d = doctorById(a.doctorId);
          const c = clinicById(a.clinicId);
          return (
            <div className="pa-card" key={a.id} onClick={() => setActionAppt(a)}>
              <Avatar name={d?.name} size={40} />
              <div className="pa-card__body">
                <div className="pa-card__top">
                  <span className="pa-card__doc">{d?.name}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="pa-card__dept">{d?.dept} &middot; {a.service}</div>
                <div className="pa-card__meta"><MapPin size={12} strokeWidth={2} /> {c?.name} &middot; {formatDate(a.date)}, {formatTime12(a.time)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <BookModal open={bookOpen} onClose={() => setBookOpen(false)} clinics={clinics} doctors={doctors} patientId={user.patientId} homeClinicId={user.clinicId} />
      <ApptActionModal appt={actionAppt} onClose={() => setActionAppt(null)} doctorById={doctorById} clinicById={clinicById} />
    </div>
  );
}

function BookModal({ open, onClose, clinics, doctors, patientId, homeClinicId }) {
  const [step, setStep] = useState(1);
  const [clinicId, setClinicId] = useState(homeClinicId || clinics[0]?.id);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('2026-09-08');
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const eligibleDoctors = doctors.filter((d) => d.clinicId === clinicId);
  const doctor = doctors.find((d) => d.id === doctorId);

  function reset() {
    setStep(1); setClinicId(homeClinicId || clinics[0]?.id); setDoctorId(''); setDate('2026-09-08'); setTime(''); setConfirmed(false);
  }
  function handleClose() { reset(); onClose(); }

  function confirmBooking() {
    db.insert('APPOINTMENTS', {
      patientId, doctorId, clinicId, date, time,
      status: 'Scheduled', service: `${doctor.dept} Consultation`, fee: doctor.consultFee,
    });
    setConfirmed(true);
  }

  return (
    <Modal open={open} onClose={handleClose} title={confirmed ? 'Booking Confirmed' : 'Book Appointment'} width={420}>
      {confirmed ? (
        <div className="pa-confirm">
          <div className="pa-confirm__icon"><CheckCircle2 size={40} strokeWidth={1.8} /></div>
          <h4>You're all set!</h4>
          <p>{doctor?.name} &middot; {formatDate(date)}, {formatTime12(time)}</p>
          <Button onClick={handleClose} className="pa-confirm__btn">Done</Button>
        </div>
      ) : (
        <>
          <div className="pa-steps">
            {['Clinic', 'Doctor', 'Slot'].map((s, i) => (
              <div key={s} className={`pa-step ${step === i + 1 ? 'is-active' : step > i + 1 ? 'is-done' : ''}`}>{s}</div>
            ))}
          </div>

          {step === 1 && (
            <div className="pa-option-list">
              {clinics.map((c) => (
                <button key={c.id} className={`pa-option ${clinicId === c.id ? 'is-selected' : ''}`} onClick={() => setClinicId(c.id)}>
                  <div className="pa-option__title">{c.name}</div>
                  <div className="pa-option__sub">{c.address}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="pa-option-list">
              {eligibleDoctors.map((d) => (
                <button key={d.id} className={`pa-option ${doctorId === d.id ? 'is-selected' : ''}`} onClick={() => setDoctorId(d.id)}>
                  <div className="pa-option__title">{d.name}</div>
                  <div className="pa-option__sub">{d.dept} &middot; {d.experience} yrs exp &middot; <Star size={11} strokeWidth={2} fill="currentColor" style={{ verticalAlign: -1 }} /> {d.rating}</div>
                  <div className="pa-option__fee">{formatCurrency(d.consultFee)}</div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <input type="date" className="mc-input" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginBottom: 14 }} />
              <div className="pa-slot-grid">
                {TIME_SLOTS.map((t) => (
                  <button key={t} className={`pa-slot ${time === t ? 'is-selected' : ''}`} onClick={() => setTime(t)}>
                    {formatTime12(t)}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="pa-modal-actions">
            {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 3 && (
              <Button onClick={() => setStep(step + 1)} disabled={step === 2 && !doctorId}>Next</Button>
            )}
            {step === 3 && (
              <Button onClick={confirmBooking} disabled={!time}>Confirm Booking</Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

function ApptActionModal({ appt, onClose, doctorById, clinicById }) {
  if (!appt) return null;
  const d = doctorById(appt.doctorId);
  const c = clinicById(appt.clinicId);
  const canModify = appt.status === 'Scheduled' || appt.status === 'Waiting';

  return (
    <Modal open={!!appt} onClose={onClose} title="Appointment Details" width={400}>
      <div className="pa-detail">
        <Avatar name={d?.name} size={48} />
        <div className="pa-detail__doc">{d?.name}</div>
        <div className="pa-detail__dept">{d?.dept}</div>
      </div>
      <div className="ap-detail-grid" style={{ marginTop: 16 }}>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{c?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Service</div><div className="v">{appt.service}</div></div>
        <div className="ap-detail-item"><div className="k">Date & Time</div><div className="v">{formatDate(appt.date)}, {formatTime12(appt.time)}</div></div>
        <div className="ap-detail-item"><div className="k">Fee</div><div className="v">{formatCurrency(appt.fee)}</div></div>
      </div>
      {canModify && (
        <div className="ap-modal-actions">
          <Button variant="danger" onClick={() => { db.update('APPOINTMENTS', appt.id, { status: 'Cancelled' }); onClose(); }}>Cancel Visit</Button>
          <Button variant="secondary" onClick={onClose}>Keep As Is</Button>
        </div>
      )}
    </Modal>
  );
}
