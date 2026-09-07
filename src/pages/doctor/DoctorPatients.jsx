import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Card, Table, Avatar, Input, Badge, Button, Field, Select, Modal } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import PatientHistoryModal from './PatientHistoryModal.jsx';
import '../admin/AdminPage.css';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function DoctorPatients() {
  const { user } = useAuth();
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const doctors = useCollection('DOCTORS');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const doctor = doctors.find((d) => d.id === user.doctorId);
  const myPatientIds = [...new Set(appointments.filter((a) => a.doctorId === user.doctorId).map((a) => a.patientId))];
  const myPatients = patients.filter((p) => myPatientIds.includes(p.id));

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return myPatients.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [myPatients, search]);

  const visitCount = (patientId) => appointments.filter((a) => a.doctorId === user.doctorId && a.patientId === patientId).length;
  const lastVisit = (patientId) => {
    const visits = appointments.filter((a) => a.doctorId === user.doctorId && a.patientId === patientId).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    return visits[0]?.date;
  };

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>My Patients</h1>
          <p className="ap-sub">{myPatients.length} patients under your care</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setAddOpen(true)}>+ Add Patient</Button>
        </div>
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search patients…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            { key: 'visits', header: 'Visits with you', render: (r) => <Badge tone="neutral">{visitCount(r.id)}</Badge> },
            { key: 'last', header: 'Last Visit', render: (r) => formatDate(lastVisit(r.id)) },
          ]}
          rows={rows}
        />
      </Card>

      <PatientHistoryModal patient={active} onClose={() => setActive(null)} doctorId={user.doctorId} />

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} doctor={doctor} />
    </div>
  );
}

function AddPatientModal({ open, onClose, doctor }) {
  const blank = { name: '', age: '', gender: 'Male', phone: '', bloodGroup: 'O+' };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.age || !doctor) return;
    const newPatient = db.insert('PATIENTS', {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      clinicId: doctor.clinicId,
      bloodGroup: form.bloodGroup,
      lastVisit: '2026-09-04',
    });
    db.insert('APPOINTMENTS', {
      patientId: newPatient.id,
      doctorId: doctor.id,
      clinicId: doctor.clinicId,
      date: '2026-09-04',
      time: '17:00',
      status: 'Scheduled',
      service: `${doctor.dept} Consultation`,
      fee: doctor.consultFee,
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
        <Field label="Blood Group">
          <Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
            {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </Field>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -4, marginBottom: 14 }}>
          A first consultation with you will be scheduled for today.
        </p>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add Patient</Button>
        </div>
      </form>
    </Modal>
  );
}
