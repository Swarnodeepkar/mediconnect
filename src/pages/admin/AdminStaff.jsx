import { useMemo, useState } from 'react';
import {
  CheckCircle2, Clock, Palmtree, AlertTriangle, ShieldCheck, ShieldAlert, LogIn, LogOut, Hourglass,
} from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { LEAVE_BALANCE } from '../../data/seed.js';
import {
  Card, Table, Avatar, StatusBadge, Badge, Input, StatTile, Button, Field, Select, Modal,
  SegmentedControl, usePagination, Pagination,
} from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';
import './AdminStaff.css';

const ROLES = ['Nurse', 'Receptionist', 'Lab Technician', 'Pharmacy Staff', 'Field Nurse', 'HR Executive'];
const ROLE_TONES = {
  Nurse: 'brand', 'Field Nurse': 'info', Receptionist: 'purple',
  'Lab Technician': 'success', 'Pharmacy Staff': 'warn', 'HR Executive': 'danger',
};
const LEAVE_STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];
const SHIFT_END_MIN = 18 * 60;

function toMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function formatDuration(checkIn, checkOut) {
  const start = toMinutes(checkIn);
  const end = toMinutes(checkOut);
  if (start == null || end == null) return null;
  const mins = Math.max(0, end - start);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function AdminStaff() {
  const { clinics, clinicId } = useClinic();
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');
  const leaveRequests = useCollection('LEAVE_REQUESTS');

  const [tab, setTab] = useState('attendance');
  const [search, setSearch] = useState('');
  const [leaveFilter, setLeaveFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState(null);

  const scoped = filterByClinic(staff, clinicId);
  const scopedStaffIds = new Set(scoped.map((s) => s.id));

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const staffById = (id) => staff.find((s) => s.id === id);
  const attendanceFor = (staffId) => attendance.find((a) => a.staffId === staffId);

  const present = scoped.filter((s) => ['Present', 'Late'].includes(attendanceFor(s.id)?.status)).length;
  const onLeave = scoped.filter((s) => attendanceFor(s.id)?.status === 'On Leave').length;
  const absent = scoped.filter((s) => attendanceFor(s.id)?.status === 'Absent').length;
  const late = scoped.filter((s) => attendanceFor(s.id)?.status === 'Late').length;

  const attendanceRows = useMemo(() => {
    const q = search.toLowerCase();
    return scoped.filter((s) => !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));
  }, [scoped, search]);

  const leaveRows = useMemo(() => {
    const q = search.toLowerCase();
    return leaveRequests
      .filter((l) => scopedStaffIds.has(l.staffId))
      .filter((l) => leaveFilter === 'All' || l.status === leaveFilter)
      .filter((l) => !q || staffById(l.staffId)?.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  }, [leaveRequests, scopedStaffIds, search, leaveFilter, staff]);

  const attendancePagination = usePagination(attendanceRows);
  const leavePagination = usePagination(leaveRows);

  function setLeaveStatus(id, status) {
    db.update('LEAVE_REQUESTS', id, { status });
  }

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
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[{ value: 'attendance', label: 'Attendance' }, { value: 'leave', label: 'Leave Requests' }]}
        />
        <Input
          className="ap-search"
          placeholder={tab === 'attendance' ? 'Search by name or role…' : 'Search by staff, type, or reason…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {tab === 'leave' && (
          <div className="ap-filter-group">
            {LEAVE_STATUS_OPTIONS.map((s) => (
              <Button key={s} size="sm" variant={leaveFilter === s ? 'primary' : 'secondary'} onClick={() => setLeaveFilter(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}
      </div>

      {tab === 'attendance' && (
        <Card className="ap-card">
          <Table
            empty="No staff match your search."
            onRowClick={(r) => setActiveStaff(r)}
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
              { key: 'role', header: 'Role', render: (r) => <Badge tone={ROLE_TONES[r.role] || 'neutral'}>{r.role}</Badge> },
              { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
              { key: 'checkIn', header: 'Check-in', render: (r) => {
                const a = attendanceFor(r.id);
                if (!a?.checkIn) return <span className="ap-dash">—</span>;
                return (
                  <span className="st-time">
                    {a.verified
                      ? <ShieldCheck size={13} strokeWidth={2.3} className="st-verify st-verify--ok" />
                      : <ShieldAlert size={13} strokeWidth={2.3} className="st-verify st-verify--warn" />}
                    <LogIn size={12} strokeWidth={2.2} />{a.checkIn}
                  </span>
                );
              } },
              { key: 'checkOut', header: 'Check-out', render: (r) => {
                const a = attendanceFor(r.id);
                if (!a?.checkIn) return <span className="ap-dash">—</span>;
                if (!a.checkOut) return <span className="st-onduty">On duty</span>;
                const late2 = toMinutes(a.checkOut) < SHIFT_END_MIN;
                const over = toMinutes(a.checkOut) > SHIFT_END_MIN;
                return (
                  <span className="st-time">
                    <LogOut size={12} strokeWidth={2.2} />{a.checkOut}
                    {late2 && <span className="st-tag st-tag--warn">Early</span>}
                    {over && <span className="st-tag st-tag--brand">Overtime</span>}
                  </span>
                );
              } },
              { key: 'hours', header: 'Hours', render: (r) => {
                const a = attendanceFor(r.id);
                const dur = formatDuration(a?.checkIn, a?.checkOut);
                return dur ? <span className="st-hours"><Hourglass size={12} strokeWidth={2.2} />{dur}</span> : <span className="ap-dash">—</span>;
              } },
              { key: 'status', header: "Today's Status", render: (r) => <StatusBadge status={attendanceFor(r.id)?.status || 'Absent'} /> },
            ]}
            rows={attendancePagination.pagedRows}
          />
          <Pagination {...attendancePagination} />
        </Card>
      )}

      {tab === 'leave' && (
        <Card className="ap-card">
          <Table
            empty="No leave requests match your filters."
            columns={[
              { key: 'staff', header: 'Staff', render: (r) => {
                const s = staffById(r.staffId);
                return (
                  <div className="ap-person-cell">
                    <Avatar name={s?.name || '?'} size={30} />
                    <div>
                      <div className="ap-cell-primary">{s?.name}</div>
                      <div className="ap-cell-sub">{s?.role}</div>
                    </div>
                  </div>
                );
              } },
              { key: 'type', header: 'Type' },
              { key: 'duration', header: 'Duration', render: (r) => (
                <div>
                  <div className="ap-cell-primary">{formatDate(r.from)}{r.from !== r.to ? ` – ${formatDate(r.to)}` : ''}</div>
                  <div className="ap-cell-sub">{r.days} day{r.days > 1 ? 's' : ''}</div>
                </div>
              ) },
              { key: 'reason', header: 'Reason', render: (r) => <span className="ap-truncate">{r.reason}</span> },
              { key: 'appliedOn', header: 'Applied On', render: (r) => formatDate(r.appliedOn) },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'actions', header: '', render: (r) => (
                r.status === 'Pending' ? (
                  <div className="st-leave-actions">
                    <button className="st-leave-btn st-leave-btn--approve" onClick={() => setLeaveStatus(r.id, 'Approved')}>Approve</button>
                    <button className="st-leave-btn st-leave-btn--reject" onClick={() => setLeaveStatus(r.id, 'Rejected')}>Reject</button>
                  </div>
                ) : null
              ) },
            ]}
            rows={leavePagination.pagedRows}
          />
          <Pagination {...leavePagination} />
        </Card>
      )}

      <StaffDetailModal
        staff={activeStaff}
        onClose={() => setActiveStaff(null)}
        clinicById={clinicById}
        attendanceFor={attendanceFor}
        leaveRequests={leaveRequests}
      />

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} clinics={clinics} defaultClinicId={clinicId} />
    </div>
  );
}

function StaffDetailModal({ staff, onClose, clinicById, attendanceFor, leaveRequests }) {
  if (!staff) return null;
  const a = attendanceFor(staff.id);
  const balance = LEAVE_BALANCE[staff.id] || { casual: 0, sick: 0, earned: 0 };
  const history = leaveRequests.filter((l) => l.staffId === staff.id).sort((x, y) => new Date(y.appliedOn) - new Date(x.appliedOn));
  const dur = formatDuration(a?.checkIn, a?.checkOut);

  return (
    <Modal open={!!staff} onClose={onClose} title={staff.name} width={480}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Role</div><div className="v"><Badge tone={ROLE_TONES[staff.role] || 'neutral'}>{staff.role}</Badge></div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(staff.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Phone</div><div className="v">{staff.phone}</div></div>
        <div className="ap-detail-item"><div className="k">Joined</div><div className="v">{formatDate(staff.joined)}</div></div>
      </div>

      <div className="ap-section-label">Leave Balance</div>
      <div className="st-balance-row">
        <div className="st-balance-chip"><span className="st-balance-chip__v">{balance.casual}</span><span className="st-balance-chip__l">Casual</span></div>
        <div className="st-balance-chip"><span className="st-balance-chip__v">{balance.sick}</span><span className="st-balance-chip__l">Sick</span></div>
        <div className="st-balance-chip"><span className="st-balance-chip__v">{balance.earned}</span><span className="st-balance-chip__l">Earned</span></div>
      </div>

      <div className="ap-section-label" style={{ marginTop: 16 }}>Today&apos;s Attendance</div>
      <div className="ap-note-block st-today-block">
        {a?.checkIn ? (
          <>
            <span className="st-time"><LogIn size={13} strokeWidth={2.2} />{a.checkIn}</span>
            <span className="st-time">{a.checkOut ? <><LogOut size={13} strokeWidth={2.2} />{a.checkOut}</> : 'On duty'}</span>
            {dur && <span className="st-hours"><Hourglass size={13} strokeWidth={2.2} />{dur}</span>}
            {a.verified === false && <span className="st-tag st-tag--warn"><ShieldAlert size={12} strokeWidth={2.3} />GPS mismatch</span>}
          </>
        ) : (
          <span className="ap-dash">{a?.status || 'No record'}</span>
        )}
      </div>

      {history.length > 0 && (
        <>
          <div className="ap-section-label">Leave History</div>
          <div className="ap-list">
            {history.map((l) => (
              <div className="ap-list-item" key={l.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="ap-list-item__title">{l.type}</div>
                  <StatusBadge status={l.status} />
                </div>
                <div className="ap-list-item__meta">{formatDate(l.from)}{l.from !== l.to ? ` – ${formatDate(l.to)}` : ''} &middot; {l.reason}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
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
      staffId: newStaff.id, checkIn: null, checkOut: null, status: 'Absent', verified: null,
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
