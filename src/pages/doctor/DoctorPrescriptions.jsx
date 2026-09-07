import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Avatar, Modal, Badge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import '../admin/AdminPage.css';
import './ConsultationModal.css';
import './DoctorPrescriptions.css';

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const prescriptions = useCollection('PRESCRIPTIONS');
  const patients = useCollection('PATIENTS');
  const [active, setActive] = useState(null);

  const mine = prescriptions
    .filter((r) => r.doctorId === user.doctorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const patientById = (id) => patients.find((p) => p.id === id);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Prescriptions</h1>
          <p className="ap-sub">{mine.length} prescriptions issued by you</p>
        </div>
      </div>

      <div className="dp-grid">
        {mine.length === 0 && <div className="pr-empty">No prescriptions issued yet.</div>}
        {mine.map((rx) => {
          const p = patientById(rx.patientId);
          return (
            <Card className="dp-card" key={rx.id} onClick={() => setActive(rx)}>
              <div className="dp-card__top">
                <Avatar name={p?.name || '?'} size={36} />
                <div className="dp-card__body">
                  <div className="dp-card__name">{p?.name}</div>
                  <div className="dp-card__date">{formatDate(rx.date)}</div>
                </div>
              </div>
              <div className="dp-card__dx">{rx.diagnosis}</div>
              <div className="dp-card__meds">
                {rx.medicines.slice(0, 3).map((m, i) => <Badge key={i} tone="neutral">{m.name}</Badge>)}
                {rx.medicines.length > 3 && <Badge tone="neutral">+{rx.medicines.length - 3} more</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title="Prescription Detail" width={440}>
        {active && (
          <>
            <div className="cm-block">
              <div className="cm-block__label">Patient</div>
              <p>{patientById(active.patientId)?.name} &middot; {formatDate(active.date)}</p>
            </div>
            <div className="cm-block">
              <div className="cm-block__label">Diagnosis</div>
              <p>{active.diagnosis}</p>
            </div>
            <div className="cm-block">
              <div className="cm-block__label">Medicines</div>
              {active.medicines.map((m, i) => (
                <div className="cm-rx-row" key={i}>
                  <div className="cm-rx-row__top"><span className="cm-rx-row__date">{m.name}</span></div>
                  <div className="cm-rx-row__meds">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</div>
                </div>
              ))}
            </div>
            {active.notes && (
              <div className="cm-block">
                <div className="cm-block__label">Notes</div>
                <p>{active.notes}</p>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
