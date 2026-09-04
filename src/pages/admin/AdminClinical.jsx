import { useMemo, useState } from 'react';
import { Stethoscope, FlaskConical, FileText, CalendarClock } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Table, StatusBadge, StatTile, Input, SegmentedControl, Avatar, Modal, Button, Field, Select,
} from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';

const LAB_WORKFLOW = ['Sample Collected', 'Processing', 'Report Ready'];

export default function AdminClinical() {
  const { clinics, clinicId } = useClinic();
  const prescriptions = useCollection('PRESCRIPTIONS');
  const labTests = useCollection('LAB_TESTS');
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const doctors = useCollection('DOCTORS');

  const [tab, setTab] = useState('prescriptions');
  const [search, setSearch] = useState('');
  const [activeRx, setActiveRx] = useState(null);
  const [activeLab, setActiveLab] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const doctorById = (id) => doctors.find((d) => d.id === id);

  const scopedRx = filterByClinic(prescriptions, clinicId);
  const scopedLabs = filterByClinic(labTests, clinicId);
  const scopedAppts = filterByClinic(appointments, clinicId);
  const scopedPatients = filterByClinic(patients, clinicId);

  const today = '2026-09-04';
  const pendingReports = scopedLabs.filter((l) => l.status !== 'Report Ready').length;
  const followUps = scopedAppts.filter((a) => a.date > today && (a.service.toLowerCase().includes('follow') )).length;

  const rxRows = useMemo(() => {
    const q = search.toLowerCase();
    return scopedRx
      .filter((r) => !q || patientById(r.patientId)?.name.toLowerCase().includes(q) || doctorById(r.doctorId)?.name.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedRx, search, patients, doctors]);

  const labRows = useMemo(() => {
    const q = search.toLowerCase();
    return scopedLabs
      .filter((l) => !q || patientById(l.patientId)?.name.toLowerCase().includes(q) || l.test.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedLabs, search, patients]);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Clinical</h1>
          <p className="ap-sub">EMR, prescriptions, and investigation records {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}.</p>
        </div>
        {tab === 'labs' && (
          <div className="ap-head__actions">
            <Button onClick={() => setRequestOpen(true)}>+ Request Lab Test</Button>
          </div>
        )}
      </div>

      <div className="ap-stats-row">
        <StatTile label="Consultations Today" value={scopedAppts.filter(a => a.date === today).length} tone="neutral" icon={Stethoscope} iconTone="brand" />
        <StatTile label="Prescriptions Issued" value={scopedRx.length} tone="neutral" icon={FileText} iconTone="success" />
        <StatTile label="Pending Lab Reports" value={pendingReports} tone={pendingReports > 0 ? 'negative' : 'positive'} icon={FlaskConical} iconTone="purple" />
        <StatTile label="Upcoming Follow-ups" value={followUps} tone="neutral" icon={CalendarClock} iconTone="warn" />
      </div>

      <div className="ap-toolbar">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[{ value: 'prescriptions', label: 'Prescriptions' }, { value: 'labs', label: 'Lab Investigations' }]}
        />
        <Input className="ap-search" placeholder="Search patient, doctor, or test…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {tab === 'prescriptions' && (
        <Card className="ap-card">
          <Table
            empty="No prescriptions match your search."
            onRowClick={(r) => setActiveRx(r)}
            columns={[
              { key: 'patient', header: 'Patient', render: (r) => {
                const p = patientById(r.patientId);
                return (
                  <div className="ap-person-cell">
                    <Avatar name={p?.name || '?'} size={30} />
                    <span className="ap-cell-primary">{p?.name}</span>
                  </div>
                );
              } },
              { key: 'doctor', header: 'Doctor', render: (r) => {
                const d = doctorById(r.doctorId);
                return (
                  <div>
                    <div className="ap-cell-primary">{d?.name}</div>
                    <div className="ap-cell-sub">{d?.dept}</div>
                  </div>
                );
              } },
              { key: 'diagnosis', header: 'Diagnosis', render: (r) => <span style={{ maxWidth: 280, display: 'inline-block' }}>{r.diagnosis}</span> },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
              { key: 'meds', header: 'Medicines', render: (r) => r.medicines.length },
            ]}
            rows={rxRows}
          />
        </Card>
      )}

      {tab === 'labs' && (
        <Card className="ap-card">
          <Table
            empty="No lab investigations match your search."
            onRowClick={(r) => setActiveLab(r)}
            columns={[
              { key: 'patient', header: 'Patient', render: (r) => {
                const p = patientById(r.patientId);
                return (
                  <div className="ap-person-cell">
                    <Avatar name={p?.name || '?'} size={30} />
                    <span className="ap-cell-primary">{p?.name}</span>
                  </div>
                );
              } },
              { key: 'test', header: 'Test' },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={labRows}
          />
        </Card>
      )}

      <Modal open={!!activeRx} onClose={() => setActiveRx(null)} title="Prescription Detail" width={440}>
        {activeRx && (
          <>
            <div className="ap-detail-grid">
              <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patientById(activeRx.patientId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Doctor</div><div className="v">{doctorById(activeRx.doctorId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(activeRx.clinicId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Date</div><div className="v">{formatDate(activeRx.date)}</div></div>
            </div>
            <div style={{ background: 'var(--surface-sunk)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13.5, lineHeight: 1.5 }}>
              {activeRx.diagnosis}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 8 }}>Medicines</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeRx.medicines.map((m, i) => (
                <div key={i} style={{ background: 'var(--surface-sunk)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.dosage} &middot; {m.frequency} &middot; {m.duration}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <LabDetailModal lab={activeLab} onClose={() => setActiveLab(null)} patientById={patientById} clinicById={clinicById} />
      <RequestLabModal open={requestOpen} onClose={() => setRequestOpen(false)} patients={scopedPatients.length ? scopedPatients : patients} clinics={clinics} defaultClinicId={clinicId} />
    </div>
  );
}

function LabDetailModal({ lab, onClose, patientById, clinicById }) {
  if (!lab) return null;
  const patient = patientById(lab.patientId);
  const stepIdx = LAB_WORKFLOW.indexOf(lab.status);

  function setStatus(status) {
    db.update('LAB_TESTS', lab.id, { status });
  }

  return (
    <Modal open={!!lab} onClose={onClose} title={lab.test} width={420}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patient?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(lab.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Requested On</div><div className="v">{formatDate(lab.date)}</div></div>
        <div className="ap-detail-item"><div className="k">Current Status</div><div className="v"><StatusBadge status={lab.status} /></div></div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>UPDATE STATUS</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {LAB_WORKFLOW.map((step, i) => (
            <button
              key={step}
              onClick={() => setStatus(step)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: '1.5px solid ' + (i <= stepIdx ? 'var(--brand-500)' : 'var(--border)'),
                background: i <= stepIdx ? 'var(--brand-50)' : 'var(--surface)',
                color: i <= stepIdx ? 'var(--brand-700)' : 'var(--text-muted)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function RequestLabModal({ open, onClose, patients, clinics, defaultClinicId }) {
  const blank = {
    patientId: patients[0]?.id || '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id,
    test: '',
  };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.test.trim() || !form.patientId) return;
    db.insert('LAB_TESTS', {
      patientId: form.patientId, clinicId: form.clinicId, test: form.test.trim(), status: 'Sample Collected', date: '2026-09-04',
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Request Lab Test" width={420}>
      <form onSubmit={handleSubmit}>
        <Field label="Patient">
          <Select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Clinic">
          <Select value={form.clinicId} onChange={(e) => setForm({ ...form, clinicId: e.target.value })}>
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Test / Investigation">
          <Input value={form.test} onChange={(e) => setForm({ ...form, test: e.target.value })} placeholder="e.g. Complete Blood Count, X-Ray Chest…" required />
        </Field>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Request Test</Button>
        </div>
      </form>
    </Modal>
  );
}
