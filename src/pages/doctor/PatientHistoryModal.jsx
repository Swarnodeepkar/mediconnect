import { useCollection } from '../../data/store.js';
import { Modal, StatusBadge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './ConsultationModal.css';

export default function PatientHistoryModal({ patient, onClose, doctorId }) {
  const appointments = useCollection('APPOINTMENTS');
  const prescriptions = useCollection('PRESCRIPTIONS');

  if (!patient) return null;

  const history = appointments
    .filter((a) => a.patientId === patient.id && a.doctorId === doctorId)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const rxHistory = prescriptions
    .filter((r) => r.patientId === patient.id && r.doctorId === doctorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Modal open={!!patient} onClose={onClose} title={patient.name} width={520}>
      <div className="cm-patient-strip">
        <span>{patient.age}y &middot; {patient.gender} &middot; {patient.bloodGroup}</span>
        <span>📞 {patient.phone}</span>
      </div>

      <div className="cm-block">
        <div className="cm-block__label">Visit History</div>
        {history.length === 0 && <p className="cm-muted">No visits on record.</p>}
        {history.map((h) => (
          <div className="cm-hist-row" key={h.id}>
            <span>{formatDate(h.date)}</span>
            <span>{h.service}</span>
            <StatusBadge status={h.status} />
          </div>
        ))}
      </div>

      <div className="cm-block">
        <div className="cm-block__label">Prescriptions Issued</div>
        {rxHistory.length === 0 && <p className="cm-muted">No prescriptions on record.</p>}
        {rxHistory.map((rx) => (
          <div className="cm-rx-row" key={rx.id}>
            <div className="cm-rx-row__top"><span className="cm-rx-row__date">{formatDate(rx.date)}</span></div>
            <div className="cm-rx-row__dx">{rx.diagnosis}</div>
            <div className="cm-rx-row__meds">{rx.medicines.map((m) => m.name).join(', ')}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
