import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Modal, Button, Avatar } from '../../components/ui.jsx';
import { formatDate, formatTime12, formatCurrency } from '../../lib/format.js';
import './PatientAppointments.css';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '16:00', '16:30'];
const DEFAULT_DATE = '2026-09-05';

export default function PatientBookingModal({ doctor, onClose, defaultDate, defaultTime }) {
  const { user } = useAuth();
  const clinics = useCollection('CLINICS');
  const appointments = useCollection('APPOINTMENTS');

  const [date, setDate] = useState(defaultDate || DEFAULT_DATE);
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  const open = !!doctor;
  if (open && !wasOpen) {
    setWasOpen(true);
    setDate(defaultDate || DEFAULT_DATE);
    setTime(defaultTime || '');
    setConfirmed(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  if (!doctor) return null;
  const clinic = clinics.find((c) => c.id === doctor.clinicId);

  const takenTimes = appointments
    .filter((a) => a.doctorId === doctor.id && a.date === date && a.status !== 'Cancelled')
    .map((a) => a.time);

  function confirmBooking() {
    db.insert('APPOINTMENTS', {
      patientId: user.patientId,
      doctorId: doctor.id,
      clinicId: doctor.clinicId,
      date,
      time,
      status: 'Scheduled',
      service: `${doctor.dept} Consultation`,
      fee: doctor.consultFee,
    });
    setConfirmed(true);
  }

  return (
    <Modal open={open} onClose={onClose} title={confirmed ? 'Booking Confirmed' : 'Book Appointment'} width={420}>
      {confirmed ? (
        <div className="pa-confirm">
          <div className="pa-confirm__icon"><CheckCircle2 size={40} strokeWidth={1.8} /></div>
          <h4>You&apos;re all set!</h4>
          <p>{doctor.name} &middot; {formatDate(date)}, {formatTime12(time)}</p>
          <Button onClick={onClose} className="pa-confirm__btn">Done</Button>
        </div>
      ) : (
        <>
          <div className="pa-detail" style={{ marginBottom: 18 }}>
            <Avatar name={doctor.name} size={48} color={clinic?.color} />
            <div className="pa-detail__doc">{doctor.name}</div>
            <div className="pa-detail__dept">{doctor.dept} &middot; {clinic?.name}</div>
          </div>

          <input type="date" className="mc-input" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} style={{ marginBottom: 14 }} />

          <div className="pa-slot-grid">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                className={`pa-slot ${time === t ? 'is-selected' : ''}`}
                disabled={takenTimes.includes(t)}
                onClick={() => setTime(t)}
              >
                {formatTime12(t)}
              </button>
            ))}
          </div>

          <div className="pa-modal-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={confirmBooking} disabled={!time}>Confirm &middot; {formatCurrency(doctor.consultFee)}</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
