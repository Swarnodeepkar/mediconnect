import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pill, FlaskConical, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { SegmentedControl, StatusBadge, Modal, Badge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './PatientRecords.css';

export default function PatientRecords() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const prescriptions = useCollection('PRESCRIPTIONS');
  const labTests = useCollection('LAB_TESTS');
  const doctors = useCollection('DOCTORS');

  const [tab, setTab] = useState(params.get('tab') === 'labs' ? 'labs' : 'rx');
  const [activeRx, setActiveRx] = useState(null);
  const [activeLab, setActiveLab] = useState(null);

  useEffect(() => {
    if (params.get('tab') === 'labs') setTab('labs');
  }, [params]);

  const myRx = prescriptions.filter((r) => r.patientId === user.patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const myLabs = labTests.filter((l) => l.patientId === user.patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const doctorById = (id) => doctors.find((d) => d.id === id);

  return (
    <div className="pr">
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'rx', label: 'Prescriptions' }, { value: 'labs', label: 'Lab Reports' }]}
      />

      {tab === 'rx' && (
        <div className="pr-list">
          {myRx.length === 0 && <div className="pr-empty">No prescriptions on file yet.</div>}
          {myRx.map((rx) => {
            const d = doctorById(rx.doctorId);
            return (
              <div className="pr-card" key={rx.id} onClick={() => setActiveRx(rx)}>
                <div className="pr-card__icon"><Pill size={17} strokeWidth={2} /></div>
                <div className="pr-card__body">
                  <div className="pr-card__title">{d?.name}</div>
                  <div className="pr-card__sub">{rx.diagnosis}</div>
                  <div className="pr-card__meta">{formatDate(rx.date)} &middot; {rx.medicines.length} medicines</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'labs' && (
        <div className="pr-list">
          {myLabs.length === 0 && <div className="pr-empty">No lab tests on file yet.</div>}
          {myLabs.map((l) => (
            <div className="pr-card" key={l.id} onClick={() => l.status === 'Report Ready' && setActiveLab(l)}>
              <div className="pr-card__icon"><FlaskConical size={17} strokeWidth={2} /></div>
              <div className="pr-card__body">
                <div className="pr-card__title">{l.test}</div>
                <div className="pr-card__meta">{formatDate(l.date)}</div>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>
      )}

      <RxModal rx={activeRx} onClose={() => setActiveRx(null)} doctorById={doctorById} />
      <LabModal lab={activeLab} onClose={() => setActiveLab(null)} />
    </div>
  );
}

function RxModal({ rx, onClose, doctorById }) {
  if (!rx) return null;
  const d = doctorById(rx.doctorId);
  return (
    <Modal open={!!rx} onClose={onClose} title="Prescription" width={440}>
      <div className="pr-modal-head">
        <div className="pr-modal-head__doc">{d?.name}</div>
        <div className="pr-modal-head__sub">{d?.dept} &middot; {formatDate(rx.date)}</div>
      </div>

      <div className="pr-block">
        <div className="pr-block__label">Diagnosis</div>
        <p>{rx.diagnosis}</p>
      </div>

      <div className="pr-block">
        <div className="pr-block__label">Medicines</div>
        <div className="pr-med-list">
          {rx.medicines.map((m, i) => (
            <div className="pr-med" key={i}>
              <div className="pr-med__name">{m.name}</div>
              <div className="pr-med__detail">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {rx.notes && (
        <div className="pr-block">
          <div className="pr-block__label">Doctor's Notes</div>
          <p>{rx.notes}</p>
        </div>
      )}
    </Modal>
  );
}

function LabModal({ lab, onClose }) {
  if (!lab) return null;
  return (
    <Modal open={!!lab} onClose={onClose} title={lab.test} width={400}>
      <div className="pr-lab-report">
        <div className="pr-lab-report__icon"><FileText size={34} strokeWidth={1.6} /></div>
        <p>Report generated on {formatDate(lab.date)}.</p>
        <Badge tone="success">Report Ready</Badge>
        <p className="pr-lab-report__note">In a production build, this would display the full report PDF or structured results, downloadable and shareable from here.</p>
      </div>
    </Modal>
  );
}
