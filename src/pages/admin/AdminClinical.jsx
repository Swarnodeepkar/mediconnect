import { useMemo, useState } from 'react';
import {
  Stethoscope, FlaskConical, FileText, CalendarClock, HeartPulse, Activity, Thermometer, Weight, Wind,
  CalendarCheck2, AlertTriangle,
} from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Table, StatusBadge, StatTile, Input, SegmentedControl, Avatar, Modal, Button, Field, Select,
  usePagination, Pagination,
} from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';
import './AdminClinical.css';

const LAB_WORKFLOW = ['Sample Collected', 'Processing', 'Report Ready'];
const TODAY = '2026-09-04';

const VITAL_FIELDS = [
  { key: 'bp', label: 'Blood Pressure', icon: HeartPulse, unit: '' },
  { key: 'pulse', label: 'Pulse', icon: Activity, unit: ' bpm' },
  { key: 'tempF', label: 'Temperature', icon: Thermometer, unit: '°F' },
  { key: 'weightKg', label: 'Weight', icon: Weight, unit: ' kg' },
  { key: 'spo2', label: 'SpO2', icon: Wind, unit: '%' },
];

function VitalsRow({ vitals, compact }) {
  if (!vitals) return <span className="ap-dash">—</span>;
  const fields = compact ? VITAL_FIELDS.slice(0, 2) : VITAL_FIELDS;
  return (
    <div className={`cl-vitals ${compact ? 'cl-vitals--compact' : ''}`}>
      {fields.map((f) => (
        <span className="cl-vital" key={f.key} title={f.label}>
          <f.icon size={compact ? 11 : 13} strokeWidth={2.3} />
          {vitals[f.key]}{f.unit}
        </span>
      ))}
    </div>
  );
}

export default function AdminClinical() {
  const { clinics, clinicId } = useClinic();
  const consultations = useCollection('CONSULTATIONS');
  const prescriptions = useCollection('PRESCRIPTIONS');
  const labTests = useCollection('LAB_TESTS');
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const doctors = useCollection('DOCTORS');

  const [tab, setTab] = useState('consultations');
  const [search, setSearch] = useState('');
  const [activeConsult, setActiveConsult] = useState(null);
  const [activeRx, setActiveRx] = useState(null);
  const [activeLab, setActiveLab] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const doctorById = (id) => doctors.find((d) => d.id === id);

  const scopedConsults = filterByClinic(consultations, clinicId);
  const scopedRx = filterByClinic(prescriptions, clinicId);
  const scopedLabs = filterByClinic(labTests, clinicId);
  const scopedAppts = filterByClinic(appointments, clinicId);
  const scopedPatients = filterByClinic(patients, clinicId);

  const pendingReports = scopedLabs.filter((l) => l.status !== 'Report Ready').length;
  const followUpPool = scopedConsults.filter((c) => c.followUpDate);
  const overdueFollowUps = followUpPool.filter((c) => c.followUpDate < TODAY).length;

  const matchesQuery = (q, ...fields) => !q || fields.some((f) => f && f.toLowerCase().includes(q));

  const consultRows = useMemo(() => {
    const q = search.toLowerCase();
    return scopedConsults
      .filter((c) => matchesQuery(q, patientById(c.patientId)?.name, doctorById(c.doctorId)?.name, c.diagnosis, c.chiefComplaint))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedConsults, search, patients, doctors]);

  const rxRows = useMemo(() => {
    const q = search.toLowerCase();
    return scopedRx
      .filter((r) => matchesQuery(q, patientById(r.patientId)?.name, doctorById(r.doctorId)?.name))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedRx, search, patients, doctors]);

  const labRows = useMemo(() => {
    const q = search.toLowerCase();
    return scopedLabs
      .filter((l) => matchesQuery(q, patientById(l.patientId)?.name, l.test))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedLabs, search, patients]);

  const followupRows = useMemo(() => {
    const q = search.toLowerCase();
    return followUpPool
      .filter((c) => matchesQuery(q, patientById(c.patientId)?.name, doctorById(c.doctorId)?.name))
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  }, [followUpPool, search, patients, doctors]);

  const consultPagination = usePagination(consultRows);
  const rxPagination = usePagination(rxRows);
  const labPagination = usePagination(labRows);
  const followupPagination = usePagination(followupRows);

  const linkedForConsult = (consult) => ({
    rx: prescriptions.find((r) => r.appointmentId === consult.appointmentId),
    labs: labTests.filter((l) => l.patientId === consult.patientId && l.date === consult.date),
  });

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Clinical</h1>
          <p className="ap-sub">EMR, consultations, prescriptions, and investigation records {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}.</p>
        </div>
        <div className="ap-head__actions">
          {tab === 'consultations' && <Button onClick={() => setConsultOpen(true)}>+ New Consultation</Button>}
          {tab === 'labs' && <Button onClick={() => setRequestOpen(true)}>+ Request Lab Test</Button>}
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Consultations Today" value={scopedConsults.filter((c) => c.date === TODAY).length} tone="neutral" icon={Stethoscope} iconTone="brand" />
        <StatTile label="Prescriptions Issued" value={scopedRx.length} tone="neutral" icon={FileText} iconTone="success" />
        <StatTile label="Pending Lab Reports" value={pendingReports} tone={pendingReports > 0 ? 'negative' : 'positive'} icon={FlaskConical} iconTone="purple" />
        <StatTile label="Follow-ups Overdue" value={overdueFollowUps} tone={overdueFollowUps > 0 ? 'negative' : 'positive'} icon={CalendarClock} iconTone="warn" />
      </div>

      <div className="ap-toolbar">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'consultations', label: 'Consultations' },
            { value: 'prescriptions', label: 'Prescriptions' },
            { value: 'labs', label: 'Lab Investigations' },
            { value: 'followups', label: 'Follow-ups' },
          ]}
        />
        <Input className="ap-search" placeholder="Search patient, doctor, test, or diagnosis…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {tab === 'consultations' && (
        <Card className="ap-card">
          <Table
            empty="No consultations match your search."
            onRowClick={(r) => setActiveConsult(r)}
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
              { key: 'complaint', header: 'Chief Complaint', render: (r) => <span className="ap-truncate">{r.chiefComplaint}</span> },
              { key: 'vitals', header: 'Vitals', render: (r) => <VitalsRow vitals={r.vitals} compact /> },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={consultPagination.pagedRows}
          />
          <Pagination {...consultPagination} />
        </Card>
      )}

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
              { key: 'diagnosis', header: 'Diagnosis', render: (r) => <span className="ap-truncate">{r.diagnosis}</span> },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
              { key: 'meds', header: 'Medicines', render: (r) => r.medicines.length },
            ]}
            rows={rxPagination.pagedRows}
          />
          <Pagination {...rxPagination} />
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
            rows={labPagination.pagedRows}
          />
          <Pagination {...labPagination} />
        </Card>
      )}

      {tab === 'followups' && (
        <Card className="ap-card">
          <Table
            empty="No follow-ups scheduled."
            onRowClick={(r) => setActiveConsult(r)}
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
              { key: 'doctor', header: 'Doctor', render: (r) => doctorById(r.doctorId)?.name },
              { key: 'diagnosis', header: 'Original Diagnosis', render: (r) => <span className="ap-truncate">{r.diagnosis}</span> },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'due', header: 'Follow-up Due', render: (r) => formatDate(r.followUpDate) },
              { key: 'status', header: 'Status', render: (r) => (
                r.followUpDate < TODAY
                  ? <span className="cl-followup-badge cl-followup-badge--overdue"><AlertTriangle size={12} strokeWidth={2.3} />Overdue</span>
                  : <span className="cl-followup-badge cl-followup-badge--upcoming"><CalendarCheck2 size={12} strokeWidth={2.3} />Upcoming</span>
              ) },
            ]}
            rows={followupPagination.pagedRows}
          />
          <Pagination {...followupPagination} />
        </Card>
      )}

      <ConsultationDetailModal
        consult={activeConsult}
        onClose={() => setActiveConsult(null)}
        patientById={patientById}
        doctorById={doctorById}
        clinicById={clinicById}
        linked={activeConsult ? linkedForConsult(activeConsult) : null}
      />

      <Modal open={!!activeRx} onClose={() => setActiveRx(null)} title="Prescription Detail" width={440}>
        {activeRx && (
          <>
            <div className="ap-detail-grid">
              <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patientById(activeRx.patientId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Doctor</div><div className="v">{doctorById(activeRx.doctorId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(activeRx.clinicId)?.name}</div></div>
              <div className="ap-detail-item"><div className="k">Date</div><div className="v">{formatDate(activeRx.date)}</div></div>
            </div>
            <div className="ap-note-block">{activeRx.diagnosis}</div>
            <div className="ap-section-label">Medicines</div>
            <div className="ap-list">
              {activeRx.medicines.map((m, i) => (
                <div key={i} className="ap-list-item">
                  <div className="ap-list-item__title">{m.name}</div>
                  <div className="ap-list-item__meta">{m.dosage} &middot; {m.frequency} &middot; {m.duration}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <LabDetailModal lab={activeLab} onClose={() => setActiveLab(null)} patientById={patientById} clinicById={clinicById} />
      <RequestLabModal open={requestOpen} onClose={() => setRequestOpen(false)} patients={scopedPatients.length ? scopedPatients : patients} clinics={clinics} defaultClinicId={clinicId} />
      <NewConsultationModal
        open={consultOpen}
        onClose={() => setConsultOpen(false)}
        patients={scopedPatients.length ? scopedPatients : patients}
        doctors={doctors}
        clinics={clinics}
        defaultClinicId={clinicId}
      />
    </div>
  );
}

function ConsultationDetailModal({ consult, onClose, patientById, doctorById, clinicById, linked }) {
  if (!consult) return null;
  const patient = patientById(consult.patientId);
  const doctor = doctorById(consult.doctorId);

  return (
    <Modal open={!!consult} onClose={onClose} title={patient?.name || 'Consultation'} width={520}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Doctor</div><div className="v">{doctor?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(consult.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Date</div><div className="v">{formatDate(consult.date)}</div></div>
        <div className="ap-detail-item"><div className="k">Status</div><div className="v"><StatusBadge status={consult.status} /></div></div>
      </div>

      <div className="ap-section-label">Chief Complaint</div>
      <div className="ap-note-block">{consult.chiefComplaint}</div>

      <div className="ap-section-label">Vitals</div>
      <VitalsRow vitals={consult.vitals} />

      {consult.diagnosis && (
        <>
          <div className="ap-section-label" style={{ marginTop: 16 }}>Diagnosis &amp; Notes</div>
          <div className="ap-note-block">
            <div className="cl-diagnosis">{consult.diagnosis}</div>
            {consult.notes && <div className="cl-notes">{consult.notes}</div>}
          </div>
        </>
      )}

      {consult.followUpDate && (
        <div className={`cl-followup-strip ${consult.followUpDate < TODAY ? 'is-overdue' : ''}`}>
          <CalendarCheck2 size={15} strokeWidth={2.2} />
          Follow-up {consult.followUpDate < TODAY ? 'was due' : 'due'} on <b>{formatDate(consult.followUpDate)}</b>
        </div>
      )}

      {linked && (linked.rx || linked.labs.length > 0) && (
        <>
          <div className="ap-section-label" style={{ marginTop: 16 }}>Linked Records</div>
          <div className="ap-list">
            {linked.rx && (
              <div className="ap-list-item cl-list-item--linked">
                <span className="cl-list-item__icon"><FileText size={14} strokeWidth={2.2} /></span>
                <div>
                  <div className="ap-list-item__title">Prescription issued</div>
                  <div className="ap-list-item__meta">{linked.rx.medicines.length} medicine(s) &middot; {formatDate(linked.rx.date)}</div>
                </div>
              </div>
            )}
            {linked.labs.map((l) => (
              <div className="ap-list-item cl-list-item--linked" key={l.id}>
                <span className="cl-list-item__icon"><FlaskConical size={14} strokeWidth={2.2} /></span>
                <div>
                  <div className="ap-list-item__title">{l.test}</div>
                  <div className="ap-list-item__meta"><StatusBadge status={l.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
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

      <div className="ap-section-label">Update Status</div>
      <div className="cl-workflow">
        {LAB_WORKFLOW.map((step, i) => (
          <button
            key={step}
            className={`cl-workflow__step ${i <= stepIdx ? 'is-done' : ''}`}
            onClick={() => setStatus(step)}
          >
            {step}
          </button>
        ))}
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
      patientId: form.patientId, clinicId: form.clinicId, test: form.test.trim(), status: 'Sample Collected', date: TODAY,
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

function NewConsultationModal({ open, onClose, patients, doctors, clinics, defaultClinicId }) {
  const blank = {
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id,
    chiefComplaint: '',
    diagnosis: '',
    notes: '',
    bp: '', pulse: '', tempF: '', weightKg: '', spo2: '',
    followUpDate: '',
  };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.chiefComplaint.trim()) return;
    db.insert('CONSULTATIONS', {
      patientId: form.patientId,
      doctorId: form.doctorId,
      clinicId: form.clinicId,
      date: TODAY,
      status: 'Completed',
      chiefComplaint: form.chiefComplaint.trim(),
      diagnosis: form.diagnosis.trim(),
      notes: form.notes.trim(),
      vitals: {
        bp: form.bp.trim() || '—',
        pulse: form.pulse ? Number(form.pulse) : null,
        tempF: form.tempF ? Number(form.tempF) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        spo2: form.spo2 ? Number(form.spo2) : null,
      },
      followUpDate: form.followUpDate || null,
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Consultation" width={480}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Patient">
            <Select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Doctor">
            <Select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Chief Complaint">
          <Input value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} placeholder="e.g. Fever and cough for 3 days" required />
        </Field>
        <Field label="Diagnosis">
          <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Viral upper respiratory infection" />
        </Field>
        <Field label="Notes">
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Advice, review instructions…" />
        </Field>

        <div className="ap-section-label" style={{ marginTop: 4 }}>Vitals</div>
        <div className="cl-vitals-form">
          <Field label="BP"><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" /></Field>
          <Field label="Pulse"><Input type="number" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="78" /></Field>
          <Field label="Temp (°F)"><Input type="number" value={form.tempF} onChange={(e) => setForm({ ...form, tempF: e.target.value })} placeholder="98.6" /></Field>
          <Field label="Weight (kg)"><Input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} placeholder="68" /></Field>
          <Field label="SpO2 (%)"><Input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" /></Field>
        </div>

        <Field label="Follow-up Date (optional)">
          <Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
        </Field>

        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save Consultation</Button>
        </div>
      </form>
    </Modal>
  );
}
