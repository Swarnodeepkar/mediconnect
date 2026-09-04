import { useMemo, useState } from 'react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Card, Table, Avatar, Input, Modal, StatusBadge, Badge, Button, Field, Select } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function AdminPatients() {
  const { clinics, clinicId } = useClinic();
  const patients = useCollection('PATIENTS');
  const appointments = useCollection('APPOINTMENTS');
  const complaints = useCollection('COMPLAINTS');

  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const scoped = filterByClinic(patients, clinicId);

  const rows = useMemo(() => {
    if (!search.trim()) return scoped;
    const q = search.toLowerCase();
    return scoped.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
  }, [scoped, search]);

  const clinicById = (id) => clinics.find((c) => c.id === id);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Patients</h1>
          <p className="ap-sub">{scoped.length} registered patients {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setAddOpen(true)}>+ Add Patient</Button>
        </div>
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="ap-card">
        <Table
          empty="No patients match your search."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'name', header: 'Patient', render: (r) => (
              <div className="ap-person-cell">
                <Avatar name={r.name} size={32} />
                <div>
                  <div className="ap-cell-primary">{r.name}</div>
                  <div className="ap-cell-sub">{r.age}y &middot; {r.gender} &middot; {r.bloodGroup}</div>
                </div>
              </div>
            ) },
            { key: 'phone', header: 'Phone' },
            { key: 'clinic', header: 'Home Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'lastVisit', header: 'Last Visit', render: (r) => formatDate(r.lastVisit) },
          ]}
          rows={rows}
        />
      </Card>

      <PatientDetailModal
        patient={active}
        onClose={() => setActive(null)}
        appointments={appointments}
        complaints={complaints}
        clinicById={clinicById}
      />

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} clinics={clinics} defaultClinicId={clinicId} />
    </div>
  );
}

function AddPatientModal({ open, onClose, clinics, defaultClinicId }) {
  const blank = {
    name: '', age: '', gender: 'Male', phone: '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id || '',
    bloodGroup: 'O+',
  };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.age) return;
    db.insert('PATIENTS', {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      clinicId: form.clinicId,
      bloodGroup: form.bloodGroup,
      lastVisit: '2026-09-04',
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Patient" width={440}>
      <form onSubmit={handleSubmit}>
        <Field label="Full Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kavya Reddy" required />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Age">
            <Input type="number" min="0" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 32" required />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </Field>
        </div>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 90000 12345" required />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Home Clinic">
            <Select value={form.clinicId} onChange={(e) => setForm({ ...form, clinicId: e.target.value })}>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Blood Group">
            <Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </Field>
        </div>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add Patient</Button>
        </div>
      </form>
    </Modal>
  );
}

function PatientDetailModal({ patient, onClose, appointments, complaints, clinicById }) {
  if (!patient) return null;
  const history = appointments.filter((a) => a.patientId === patient.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const patientComplaints = complaints.filter((c) => c.patientId === patient.id);

  return (
    <Modal open={!!patient} onClose={onClose} title={patient.name} width={560}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Age / Gender</div><div className="v">{patient.age} &middot; {patient.gender}</div></div>
        <div className="ap-detail-item"><div className="k">Blood Group</div><div className="v">{patient.bloodGroup}</div></div>
        <div className="ap-detail-item"><div className="k">Phone</div><div className="v">{patient.phone}</div></div>
        <div className="ap-detail-item"><div className="k">Home Clinic</div><div className="v">{clinicById(patient.clinicId)?.name}</div></div>
      </div>

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>Appointment History</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {history.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>No appointments recorded.</p>}
        {history.map((a) => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--surface-sunk)', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.service}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(a.date)} &middot; {clinicById(a.clinicId)?.code}</div>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </div>

      {patientComplaints.length > 0 && (
        <>
          <h4 style={{ fontSize: 14, marginBottom: 10 }}>Complaints Filed</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {patientComplaints.map((c) => (
              <Badge key={c.id} tone={c.status === 'Resolved' ? 'success' : 'warn'}>{c.category}</Badge>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
