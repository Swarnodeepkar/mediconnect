import { useMemo, useState } from 'react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Table, Avatar, StatusBadge, Input, StatTile } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';

export default function AdminStaff() {
  const { clinics, clinicId } = useClinic();
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');

  const [search, setSearch] = useState('');

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
      </div>

      <div className="ap-stats-row">
        <StatTile label="Present Today" value={present} tone="positive" delta={`of ${scoped.length} staff`} icon="✅" />
        <StatTile label="Late Arrivals" value={late} tone="neutral" delta="GPS verified" icon="⏱" />
        <StatTile label="On Leave" value={onLeave} tone="neutral" icon="🌴" />
        <StatTile label="Absent" value={absent} tone={absent > 0 ? 'negative' : 'positive'} icon="⚠" />
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
    </div>
  );
}
