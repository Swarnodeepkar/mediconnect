import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Avatar, StatusBadge } from '../../components/ui.jsx';
import './AdminPage.css';
import './AdminHomeVisits.css';

const STEPS = ['Assigned', 'In Progress', 'Completed'];

export default function AdminHomeVisits() {
  const { clinics, clinicId } = useClinic();
  const visits = useCollection('HOME_VISITS');
  const patients = useCollection('PATIENTS');
  const staff = useCollection('STAFF');

  const scoped = filterByClinic(visits, clinicId);
  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const staffById = (id) => staff.find((s) => s.id === id);

  const stepIndex = (status) => {
    if (status === 'Scheduled') return -1;
    return STEPS.indexOf(status);
  };

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Home Visits</h1>
          <p className="ap-sub">{scoped.length} visits {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
      </div>

      <div className="hv-grid">
        {scoped.map((v) => {
          const p = patientById(v.patientId);
          const s = staffById(v.staffId);
          const idx = stepIndex(v.status);
          return (
            <Card className="hv-card" key={v.id}>
              <div className="hv-top">
                <div className="ap-person-cell">
                  <Avatar name={p?.name || '?'} size={34} />
                  <div>
                    <div className="ap-cell-primary">{p?.name}</div>
                    <div className="ap-cell-sub">{v.service}</div>
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              <div className="hv-info">
                <div><span className="hv-label">Assigned to</span> {s?.name} ({s?.role})</div>
                <div><span className="hv-label">Address</span> {v.address}</div>
                <div><span className="hv-label">Scheduled</span> {v.scheduled}</div>
                <div><span className="hv-label">Clinic</span> {clinicById(v.clinicId)?.name}</div>
              </div>

              <div className="hv-stepper">
                {STEPS.map((step, i) => (
                  <div key={step} className={`hv-step ${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`}>
                    <span className="hv-step__dot" />
                    <span className="hv-step__label">{step}</span>
                    {i < STEPS.length - 1 && <span className="hv-step__line" />}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
