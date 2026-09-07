import { useMemo, useState } from 'react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Card, Table, StatusBadge, Avatar, Button, Modal, Field, Select, Input, usePagination, Pagination } from '../../components/ui.jsx';
import { formatCurrency, formatTime12, formatDate } from '../../lib/format.js';
import './AdminPage.css';

const STATUS_OPTIONS = ['All', 'Scheduled', 'Waiting', 'In Progress', 'Completed'];

export default function AdminAppointments() {
  const { clinics, clinicId } = useClinic();
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const doctors = useCollection('DOCTORS');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [bookOpen, setBookOpen] = useState(false);

  const scoped = filterByClinic(appointments, clinicId);

  const rows = useMemo(() => {
    return scoped
      .filter((a) => status === 'All' || a.status === status)
      .filter((a) => {
        if (!search.trim()) return true;
        const p = patients.find((pt) => pt.id === a.patientId);
        const d = doctors.find((dt) => dt.id === a.doctorId);
        const q = search.toLowerCase();
        return p?.name.toLowerCase().includes(q) || d?.name.toLowerCase().includes(q) || a.service.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .reverse();
  }, [scoped, status, search, patients, doctors]);

  const pagination = usePagination(rows);

  const patientById = (id) => patients.find((p) => p.id === id);
  const doctorById = (id) => doctors.find((d) => d.id === id);
  const clinicById = (id) => clinics.find((c) => c.id === id);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Appointments</h1>
          <p className="ap-sub">{scoped.length} total appointments {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setBookOpen(true)}>+ Book Appointment</Button>
        </div>
      </div>

      <div className="ap-toolbar">
        <Input
          className="ap-search"
          placeholder="Search patient, doctor, or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ap-filter-group">
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? 'primary' : 'secondary'}
              onClick={() => setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="ap-card">
        <Table
          empty="No appointments match your filters."
          columns={[
            { key: 'patient', header: 'Patient', render: (r) => {
              const p = patientById(r.patientId);
              return (
                <div className="ap-person-cell">
                  <Avatar name={p?.name || '?'} size={30} />
                  <div>
                    <div className="ap-cell-primary">{p?.name}</div>
                    <div className="ap-cell-sub">{p?.age}y &middot; {p?.gender}</div>
                  </div>
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
            { key: 'service', header: 'Service' },
            { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'when', header: 'Date & Time', render: (r) => (
              <div>
                <div className="ap-cell-primary">{formatDate(r.date)}</div>
                <div className="ap-cell-sub">{formatTime12(r.time)}</div>
              </div>
            ) },
            { key: 'fee', header: 'Fee', render: (r) => formatCurrency(r.fee) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={pagination.pagedRows}
        />

        <Pagination {...pagination} />
      </Card>

      <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} clinics={clinics} doctors={doctors} patients={patients} defaultClinicId={clinicId} />
    </div>
  );
}

function BookAppointmentModal({ open, onClose, clinics, doctors, patients, defaultClinicId }) {
  const blank = {
    patientId: patients[0]?.id || '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id,
    doctorId: '',
    date: '2026-09-05',
    time: '10:00',
    service: 'General Consultation',
  };
  const [form, setForm] = useState(blank);

  const eligibleDoctors = doctors.filter((d) => d.clinicId === form.clinicId);

  function handleSubmit(e) {
    e.preventDefault();
    const doctor = doctors.find((d) => d.id === form.doctorId) || eligibleDoctors[0];
    if (!doctor) return;
    db.insert('APPOINTMENTS', {
      patientId: form.patientId,
      doctorId: doctor.id,
      clinicId: form.clinicId,
      date: form.date,
      time: form.time,
      status: 'Scheduled',
      service: form.service,
      fee: doctor.consultFee,
    });
    setForm(blank);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Book New Appointment" width={480}>
      <form onSubmit={handleSubmit}>
        <Field label="Patient">
          <Select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Clinic">
          <Select
            value={form.clinicId}
            onChange={(e) => setForm({ ...form, clinicId: e.target.value, doctorId: '' })}
          >
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Doctor">
          <Select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
            <option value="">Select a doctor…</option>
            {eligibleDoctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.dept} ({formatCurrency(d.consultFee)})</option>)}
          </Select>
        </Field>
        <Field label="Service">
          <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
        </div>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Confirm Booking</Button>
        </div>
      </form>
    </Modal>
  );
}
