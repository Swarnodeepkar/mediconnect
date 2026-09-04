import { useState } from 'react';
import { useCollection, db } from '../../data/store.js';
import { Modal, Button, Field, Input, Textarea, StatusBadge, Badge, SegmentedControl } from '../../components/ui.jsx';
import { formatDate, formatCurrency } from '../../lib/format.js';
import './ConsultationModal.css';

const BLANK_MED = { name: '', dosage: '', frequency: '', duration: '' };

export default function ConsultationModal({ appt, onClose }) {
  const patients = useCollection('PATIENTS');
  const appointments = useCollection('APPOINTMENTS');
  const prescriptions = useCollection('PRESCRIPTIONS');
  const labTests = useCollection('LAB_TESTS');

  const [tab, setTab] = useState('history');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ ...BLANK_MED }]);
  const [labTest, setLabTest] = useState('');
  const [saved, setSaved] = useState(false);

  if (!appt) return null;
  const patient = patients.find((p) => p.id === appt.patientId);
  const history = appointments.filter((a) => a.patientId === appt.patientId && a.id !== appt.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const priorRx = prescriptions.filter((r) => r.patientId === appt.patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const patientLabs = labTests.filter((l) => l.patientId === appt.patientId);
  const existingRx = prescriptions.find((r) => r.appointmentId === appt.id);

  function updateMed(i, field, value) {
    setMedicines((meds) => meds.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }
  function addMed() { setMedicines((meds) => [...meds, { ...BLANK_MED }]); }
  function removeMed(i) { setMedicines((meds) => meds.filter((_, idx) => idx !== i)); }

  function requestLabTest() {
    if (!labTest.trim()) return;
    db.insert('LAB_TESTS', {
      patientId: appt.patientId, clinicId: appt.clinicId, test: labTest, status: 'Sample Collected', date: appt.date, requestedBy: appt.doctorId,
    });
    setLabTest('');
  }

  function completeConsultation() {
    if (diagnosis.trim()) {
      db.insert('PRESCRIPTIONS', {
        appointmentId: appt.id, patientId: appt.patientId, doctorId: appt.doctorId, clinicId: appt.clinicId, date: appt.date,
        diagnosis, notes, medicines: medicines.filter((m) => m.name.trim()),
      });
    }
    db.update('APPOINTMENTS', appt.id, { status: 'Completed' });
    setSaved(true);
  }

  function handleClose() {
    setDiagnosis(''); setNotes(''); setMedicines([{ ...BLANK_MED }]); setLabTest(''); setSaved(false); setTab('history');
    onClose();
  }

  const isDone = appt.status === 'Completed';

  return (
    <Modal open={!!appt} onClose={handleClose} title={patient?.name || 'Consultation'} width={720}>
      {saved ? (
        <div className="pa-confirm">
          <div className="pa-confirm__icon">✅</div>
          <h4>Consultation Completed</h4>
          <p>Prescription and visit summary have been saved to {patient?.name}'s record.</p>
          <Button onClick={handleClose} className="pa-confirm__btn">Done</Button>
        </div>
      ) : (
        <>
          <div className="cm-patient-strip">
            <span>{patient?.age}y &middot; {patient?.gender} &middot; {patient?.bloodGroup}</span>
            <span>📞 {patient?.phone}</span>
            <StatusBadge status={appt.status} />
          </div>

          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { value: 'history', label: 'History' },
              { value: 'consult', label: isDone ? 'Visit Summary' : 'New Consultation' },
              { value: 'labs', label: 'Lab Requests' },
            ]}
          />

          <div className="cm-tab-body">
            {tab === 'history' && (
              <div className="cm-history">
                <div className="cm-block">
                  <div className="cm-block__label">Past Appointments</div>
                  {history.length === 0 && <p className="cm-muted">No prior appointments on record.</p>}
                  {history.map((h) => (
                    <div className="cm-hist-row" key={h.id}>
                      <span>{formatDate(h.date)}</span>
                      <span>{h.service}</span>
                      <StatusBadge status={h.status} />
                    </div>
                  ))}
                </div>
                <div className="cm-block">
                  <div className="cm-block__label">Prescription History</div>
                  {priorRx.length === 0 && <p className="cm-muted">No prior prescriptions on record.</p>}
                  {priorRx.map((rx) => (
                    <div className="cm-rx-row" key={rx.id}>
                      <div className="cm-rx-row__top">
                        <span className="cm-rx-row__date">{formatDate(rx.date)}</span>
                      </div>
                      <div className="cm-rx-row__dx">{rx.diagnosis}</div>
                      <div className="cm-rx-row__meds">{rx.medicines.map((m) => m.name).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'consult' && (
              isDone ? (
                existingRx ? (
                  <div className="cm-summary">
                    <div className="cm-block">
                      <div className="cm-block__label">Diagnosis</div>
                      <p>{existingRx.diagnosis}</p>
                    </div>
                    <div className="cm-block">
                      <div className="cm-block__label">Medicines Prescribed</div>
                      {existingRx.medicines.map((m, i) => (
                        <div className="cm-rx-row" key={i}>
                          <div className="cm-rx-row__top"><span className="cm-rx-row__date">{m.name}</span></div>
                          <div className="cm-rx-row__meds">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</div>
                        </div>
                      ))}
                    </div>
                    {existingRx.notes && (
                      <div className="cm-block">
                        <div className="cm-block__label">Notes</div>
                        <p>{existingRx.notes}</p>
                      </div>
                    )}
                  </div>
                ) : <p className="cm-muted">This visit was marked complete without a prescription on file.</p>
              ) : (
                <div className="cm-form">
                  <Field label="Diagnosis">
                    <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Clinical diagnosis or impression…" />
                  </Field>

                  <div className="cm-block__label" style={{ marginBottom: 8 }}>Medicines</div>
                  {medicines.map((m, i) => (
                    <div className="cm-med-row" key={i}>
                      <Input placeholder="Medicine name" value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} />
                      <Input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} />
                      <Input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} />
                      <Input placeholder="Duration" value={m.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} />
                      <button className="cm-med-remove" onClick={() => removeMed(i)} type="button" aria-label="Remove">✕</button>
                    </div>
                  ))}
                  <button className="cm-add-med" onClick={addMed} type="button">+ Add another medicine</button>

                  <Field label="Doctor's Notes">
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Advice, precautions, follow-up instructions…" />
                  </Field>
                </div>
              )
            )}

            {tab === 'labs' && (
              <div className="cm-labs">
                <div className="cm-block__label">Existing Lab Records</div>
                {patientLabs.length === 0 && <p className="cm-muted">No lab tests on record.</p>}
                {patientLabs.map((l) => (
                  <div className="cm-hist-row" key={l.id}>
                    <span>{formatDate(l.date)}</span>
                    <span>{l.test}</span>
                    <StatusBadge status={l.status} />
                  </div>
                ))}

                {!isDone && (
                  <div className="cm-lab-request">
                    <div className="cm-block__label" style={{ marginTop: 18 }}>Request New Investigation</div>
                    <div className="cm-lab-request__row">
                      <Input placeholder="e.g. Complete Blood Count, X-Ray Chest…" value={labTest} onChange={(e) => setLabTest(e.target.value)} />
                      <Button size="sm" onClick={requestLabTest} type="button">Request</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isDone && (
            <div className="ap-modal-actions">
              <Button variant="secondary" onClick={handleClose}>Save &amp; Close Later</Button>
              <Button onClick={completeConsultation}>Complete Consultation</Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
