import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Palmtree, AlertTriangle } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Card, Table, Avatar, StatusBadge, Input, StatTile, Button, Field, Select, Modal } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';

const ROLES = ['Nurse', 'Receptionist', 'Lab Technician', 'Pharmacy Staff', 'Field Nurse', 'HR Executive'];

export default function AdminStaff() {
  const { clinics, clinicId } = useClinic();
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const scoped = filterByClinic(staff, clinicId);
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return scoped.filter((s) => !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));
  }, [scoped, search]);

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const attendanceFor = (staffId) => attendance.find((a) => a.staffId === staffId);

  const present = scoped.filter((s) => ['Present', 'Late'].includes(attendanceFor(s.id)?.status)).length;
  const onLeave = scoped.filter((s) => attendanceFor(s.id)?.status === 'On Leave').length;
  const absent = scoped.filter((s) => attendanceFor(s.id)?.status === 'Absent').length;
  const late = scoped.filter((s) => attendanceFor(s.id)?.status === 'Late').length;

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Staff &amp; Attendance</h1>
          <p className="ap-sub">{scoped.length} employees {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setAddOpen(true)}>+ Add Staff</Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Present Today" value={present} tone="positive" delta={`of ${scoped.length} staff`} icon={CheckCircle2} iconTone="success" />
        <StatTile label="Late Arrivals" value={late} tone="neutral" delta="GPS verified" icon={Clock} iconTone="warn" />
        <StatTile label="On Leave" value={onLeave} tone="neutral" icon={Palmtree} iconTone="brand" />
        <StatTile label="Absent" value={absent} tone={absent > 0 ? 'negative' : 'positive'} icon={AlertTriangle} iconTone="danger" />
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search by name or role…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="ap-card">
        <Table
          empty="No staff match your search."
          columns={[
            { key: 'name', header: 'Employee', render: (r) => (
              <div className="ap-person-cell">
                <Avatar name={r.name} size={32} />
                <div>
                  <div className="ap-cell-primary">{r.name}</div>
                  <div className="ap-cell-sub">{r.phone}</div>
                </div>
              </div>
            ) },
            { key: 'role', header: 'Role' },
            { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'checkIn', header: 'Check-in', render: (r) => attendanceFor(r.id)?.checkIn || '—' },
            { key: 'joined', header: 'Joined', render: (r) => formatDate(r.joined) },
            { key: 'status', header: "Today's Status", render: (r) => <StatusBadge status={attendanceFor(r.id)?.status || 'Absent'} /> },
          ]}
          rows={rows}
        />
      </Card>

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} clinics={clinics} defaultClinicId={clinicId} />
    </div>
  );
}

function AddStaffModal({ open, onClose, clinics, defaultClinicId }) {
  const blank = {
    name: '', role: ROLES[0], phone: '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id || '',
  };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    const newStaff = db.insert('STAFF', {
      name: form.name.trim(),
      role: form.role,
      clinicId: form.clinicId,
      phone: form.phone.trim(),
      status: 'Active',
      joined: '2026-09-04',
    });
    db.insert('ATTENDANCE_TODAY', {
      staffId: newStaff.id, checkIn: null, checkOut: null, status: 'Absent',
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Staff" width={420}>
      <form onSubmit={handleSubmit}>
        <Field label="Full Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Menon" required />
        </Field>
        <Field label="Role">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 98450 55555" required />
        </Field>
        <Field label="Clinic">
          <Select value={form.clinicId} onChange={(e) => setForm({ ...form, clinicId: e.target.value })}>
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add Staff</Button>
        </div>
      </form>
    </Modal>
  );
}
