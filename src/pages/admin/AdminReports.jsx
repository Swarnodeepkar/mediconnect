import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { Download, IndianRupee, Building2, CalendarCheck2, Stethoscope, Flag, Users, UserCheck2, UserX2 } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Button, SegmentedControl, StatTile, Table, Badge } from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { downloadCsv } from '../../lib/exportCsv.js';
import './AdminPage.css';
import './AdminReports.css';

const CATEGORY_COLORS = ['#1aa8a1', '#2f6fed', '#e9a520', '#e0483f', '#7c5cff', '#0d8f9e'];
const STATUS_COLORS = { Completed: '#1aa8a1', 'In Progress': '#2f6fed', Waiting: '#e9a520', Scheduled: '#7c5cff' };

export default function AdminReports() {
  const { clinics, clinicId } = useClinic();
  const doctors = useCollection('DOCTORS');
  const appointments = useCollection('APPOINTMENTS');
  const complaints = useCollection('COMPLAINTS');
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');
  const revenueTrend = useCollection('REVENUE_TREND');

  const [tab, setTab] = useState('operations');

  const scopedClinics = clinicId === 'all' ? clinics : clinics.filter((c) => c.id === clinicId);
  const scopedAppointments = filterByClinic(appointments, clinicId);
  const scopedComplaints = filterByClinic(complaints, clinicId);
  const scopedStaff = filterByClinic(staff, clinicId);
  const scopedStaffIds = new Set(scopedStaff.map((s) => s.id));
  const scopedAttendance = attendance.filter((a) => scopedStaffIds.has(a.staffId));
  const scopedDoctors = clinicId === 'all' ? doctors : doctors.filter((d) => d.clinicId === clinicId);

  const revenueByClinic = scopedClinics.map((c) => {
    const billedAppts = appointments.filter((a) => a.clinicId === c.id && (a.status === 'Completed' || a.status === 'In Progress'));
    return {
      id: c.id,
      name: c.code,
      fullName: c.name,
      revenue: billedAppts.reduce((s, a) => s + a.fee, 0),
      apptCount: billedAppts.length,
      color: c.color,
    };
  });

  const complaintsByCategory = Object.entries(
    scopedComplaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const complaintDetail = complaintsByCategory.map((c) => {
    const inCategory = scopedComplaints.filter((cp) => cp.category === c.name);
    const resolved = inCategory.filter((cp) => cp.status === 'Resolved' || cp.status === 'Closed').length;
    return { category: c.name, open: inCategory.length - resolved, resolved, total: inCategory.length };
  }).sort((a, b) => b.total - a.total);

  const staffByRole = Object.entries(
    scopedStaff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const attendanceByStaffId = new Map(scopedAttendance.map((a) => [a.staffId, a]));
  const roleBreakdown = staffByRole.map((r) => {
    const inRole = scopedStaff.filter((s) => s.role === r.name);
    const present = inRole.filter((s) => ['Present', 'Late'].includes(attendanceByStaffId.get(s.id)?.status)).length;
    return {
      role: r.name,
      headcount: r.value,
      present,
      rate: inRole.length ? Math.round((present / inRole.length) * 100) : 0,
    };
  }).sort((a, b) => b.headcount - a.headcount);

  const doctorLoad = scopedDoctors.map((d) => ({
    name: d.name.replace('Dr. ', ''),
    appointments: scopedAppointments.filter((a) => a.doctorId === d.id).length,
  })).sort((a, b) => b.appointments - a.appointments);

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const doctorPerformance = scopedDoctors.map((d) => {
    const docAppts = scopedAppointments.filter((a) => a.doctorId === d.id);
    const completed = docAppts.filter((a) => a.status === 'Completed').length;
    return {
      id: d.id,
      name: d.name,
      clinicCode: clinicById(d.clinicId)?.code || '—',
      appointments: docAppts.length,
      completed,
      rate: docAppts.length ? Math.round((completed / docAppts.length) * 100) : 0,
    };
  }).sort((a, b) => b.appointments - a.appointments);

  const appointmentsByStatus = ['Completed', 'In Progress', 'Waiting', 'Scheduled']
    .map((status) => ({ name: status, value: scopedAppointments.filter((a) => a.status === status).length }))
    .filter((d) => d.value > 0);

  const revenueTrendData = revenueTrend.map((d) => {
    const row = { day: d.day };
    for (const c of scopedClinics) row[c.id] = d[c.id];
    return row;
  });

  const attendanceRate = scopedAttendance.length
    ? Math.round((scopedAttendance.filter(a => ['Present', 'Late'].includes(a.status)).length / scopedAttendance.length) * 100)
    : 0;
  const presentCount = scopedAttendance.filter(a => ['Present', 'Late'].includes(a.status)).length;
  const absentCount = scopedAttendance.filter(a => a.status === 'Absent').length;

  const attendanceRows = scopedStaff.map((s) => {
    const a = attendanceByStaffId.get(s.id);
    return { staffId: s.id, name: s.name, role: s.role, status: a?.status || 'Absent', checkIn: a?.checkIn || null };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const totalRevenue = revenueByClinic.reduce((s, c) => s + c.revenue, 0);
  const topClinic = [...revenueByClinic].sort((a, b) => b.revenue - a.revenue)[0];
  const busiestDoctor = doctorLoad[0];
  const openComplaints = scopedComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;

  const scopeLabel = clinicId === 'all' ? 'all-clinics' : clinics.find((c) => c.id === clinicId)?.code.toLowerCase();

  function handleExport() {
    const stamp = formatDate('2026-09-04').replace(/\s|,/g, '-');

    if (tab === 'finance') {
      downloadCsv(
        `mediconnect-revenue-${scopeLabel}-${stamp}.csv`,
        [
          { header: 'Clinic', value: (r) => r.fullName },
          { header: 'Code', value: (r) => r.name },
          { header: 'Revenue Today (INR)', value: (r) => r.revenue },
        ],
        revenueByClinic,
      );
    } else if (tab === 'operations') {
      downloadCsv(
        `mediconnect-operations-${scopeLabel}-${stamp}.csv`,
        [
          { header: 'Doctor', value: (r) => r.name },
          { header: 'Appointments', value: (r) => r.appointments },
        ],
        doctorLoad,
      );
    } else {
      downloadCsv(
        `mediconnect-workforce-${scopeLabel}-${stamp}.csv`,
        [
          { header: 'Employee', value: (r) => scopedStaff.find((s) => s.id === r.staffId)?.name || r.staffId },
          { header: 'Role', value: (r) => scopedStaff.find((s) => s.id === r.staffId)?.role || '' },
          { header: 'Status', value: (r) => r.status },
          { header: 'Check-in', value: (r) => r.checkIn || '' },
        ],
        scopedAttendance,
      );
    }
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p className="ap-sub">
            {clinicId === 'all' ? 'Organization-wide' : clinics.find((c) => c.id === clinicId)?.name} performance across operations, finance, and workforce.
          </p>
        </div>
        <div className="ap-head__actions">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={15} strokeWidth={2.2} /> Export {tab === 'finance' ? 'Revenue' : tab === 'operations' ? 'Operations' : 'Workforce'} CSV
          </Button>
        </div>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'operations', label: 'Operations' },
          { value: 'finance', label: 'Finance' },
          { value: 'workforce', label: 'Workforce' },
        ]}
      />

      <div style={{ height: 20 }} />

      {tab === 'finance' && (
        <>
          <div className="rp-stats">
            <StatTile label="Total Revenue Today" value={formatCurrency(totalRevenue)} delta={`Across ${revenueByClinic.length} clinic${revenueByClinic.length === 1 ? '' : 's'}`} tone="positive" icon={IndianRupee} iconTone="warn" />
            <StatTile label="Top Performing Clinic" value={topClinic?.name || '—'} delta={topClinic ? formatCurrency(topClinic.revenue) : 'No data'} tone="positive" icon={Building2} iconTone="brand" />
            <StatTile label="Avg Revenue / Clinic" value={formatCurrency(revenueByClinic.length ? Math.round(totalRevenue / revenueByClinic.length) : 0)} tone="neutral" icon={CalendarCheck2} iconTone="success" />
          </div>
          <div className="rp-grid">
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Revenue by Clinic</h3>
                <span className="rp-card-sub">Today</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByClinic} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12.5, fill: 'var(--ink-500)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={48} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {revenueByClinic.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Revenue Trend</h3>
                <span className="rp-card-sub">Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12.5, fill: 'var(--ink-500)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={48} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                  {scopedClinics.length > 1 && <Legend wrapperStyle={{ fontSize: 12.5 }} formatter={(id) => clinicById(id)?.code} />}
                  {scopedClinics.map((c) => (
                    <Line key={c.id} type="monotone" dataKey={c.id} name={c.id} stroke={c.color} strokeWidth={2.5} dot={{ r: 3, fill: c.color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="rp-card" style={{ marginTop: 18 }}>
            <div className="rp-card-head">
              <h3>Revenue Detail</h3>
              <span className="rp-card-sub">Today</span>
            </div>
            <Table
              empty="No revenue data for this scope."
              columns={[
                { key: 'clinic', header: 'Clinic', render: (r) => (
                  <div className="rp-clinic-cell">
                    <span className="rp-clinic-dot" style={{ background: r.color }} />
                    {r.fullName}
                  </div>
                ) },
                { key: 'appts', header: 'Appointments', render: (r) => r.apptCount },
                { key: 'revenue', header: 'Revenue', render: (r) => <span className="ap-cell-primary">{formatCurrency(r.revenue)}</span> },
                { key: 'avg', header: 'Avg Fee', render: (r) => formatCurrency(r.apptCount ? Math.round(r.revenue / r.apptCount) : 0) },
                { key: 'share', header: '% of Total', render: (r) => `${totalRevenue ? Math.round((r.revenue / totalRevenue) * 100) : 0}%` },
              ]}
              rows={revenueByClinic}
              keyField="name"
            />
          </Card>
        </>
      )}

      {tab === 'operations' && (
        <>
          <div className="rp-stats">
            <StatTile label="Total Appointments" value={scopedAppointments.length} delta={`${scopedDoctors.length} doctor${scopedDoctors.length === 1 ? '' : 's'} in scope`} tone="neutral" icon={CalendarCheck2} iconTone="brand" />
            <StatTile label="Busiest Doctor" value={busiestDoctor?.name || '—'} delta={busiestDoctor ? `${busiestDoctor.appointments} appointments` : 'No data'} tone="positive" icon={Stethoscope} iconTone="success" />
            <StatTile label="Open Complaints" value={openComplaints} delta={openComplaints > 3 ? 'Needs attention' : 'Under control'} tone={openComplaints > 3 ? 'negative' : 'positive'} icon={Flag} iconTone="danger" />
          </div>
          <div className="rp-grid">
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Appointments per Doctor</h3>
              </div>
              {doctorLoad.length === 0 ? (
                <div className="ov-empty">No doctors in this scope.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorLoad} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-600)' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                    <Bar dataKey="appointments" fill="var(--brand-500)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Appointments by Status</h3>
              </div>
              {appointmentsByStatus.length === 0 ? (
                <div className="ov-empty">No appointments in this scope.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={appointmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {appointmentsByStatus.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12.5 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card className="rp-card" style={{ marginTop: 18 }}>
            <div className="rp-card-head">
              <h3>Doctor Performance</h3>
            </div>
            <Table
              empty="No doctors in this scope."
              columns={[
                { key: 'name', header: 'Doctor' },
                { key: 'clinic', header: 'Clinic', render: (r) => r.clinicCode },
                { key: 'appts', header: 'Appointments', render: (r) => r.appointments },
                { key: 'completed', header: 'Completed', render: (r) => r.completed },
                { key: 'rate', header: 'Completion Rate', render: (r) => (
                  <span className="rp-rate-cell">
                    <span className="rp-rate-cell__track"><span className="rp-rate-cell__fill" style={{ width: `${r.rate}%` }} /></span>
                    {r.rate}%
                  </span>
                ) },
              ]}
              rows={doctorPerformance}
            />
          </Card>

          <Card className="rp-card" style={{ marginTop: 18 }}>
            <div className="rp-card-head">
              <h3>Complaints Detail</h3>
            </div>
            <Table
              empty="No complaints in this scope."
              columns={[
                { key: 'category', header: 'Category' },
                { key: 'open', header: 'Open', render: (r) => r.open > 0 ? <Badge tone="warn" dot>{r.open} open</Badge> : <span className="ov-ok">0</span> },
                { key: 'resolved', header: 'Resolved' },
                { key: 'total', header: 'Total' },
              ]}
              rows={complaintDetail}
              keyField="category"
            />
          </Card>
        </>
      )}

      {tab === 'workforce' && (
        <>
          <div className="rp-stats">
            <StatTile label="Total Staff" value={scopedStaff.length} delta={`${staffByRole.length} role${staffByRole.length === 1 ? '' : 's'}`} tone="neutral" icon={Users} iconTone="brand" />
            <StatTile label="Attendance Rate" value={`${attendanceRate}%`} delta={`${presentCount} of ${scopedAttendance.length} checked in`} tone={attendanceRate >= 80 ? 'positive' : 'negative'} icon={UserCheck2} iconTone="success" />
            <StatTile label="Absent Today" value={absentCount} delta={absentCount > 0 ? 'Follow up needed' : 'Full attendance'} tone={absentCount > 0 ? 'negative' : 'positive'} icon={UserX2} iconTone="danger" />
          </div>
          <div className="rp-grid">
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Staff by Role</h3>
              </div>
              {staffByRole.length === 0 ? (
                <div className="ov-empty">No staff in this scope.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={staffByRole} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {staffByRole.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12.5 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card className="rp-card">
              <div className="rp-card-head">
                <h3>Role Breakdown</h3>
              </div>
              <Table
                empty="No staff in this scope."
                columns={[
                  { key: 'role', header: 'Role' },
                  { key: 'headcount', header: 'Headcount' },
                  { key: 'present', header: 'Present', render: (r) => `${r.present}/${r.headcount}` },
                  { key: 'rate', header: 'Attendance', render: (r) => (
                    <span className="rp-rate-cell">
                      <span className="rp-rate-cell__track"><span className="rp-rate-cell__fill" style={{ width: `${r.rate}%` }} /></span>
                      {r.rate}%
                    </span>
                  ) },
                ]}
                rows={roleBreakdown}
                keyField="role"
              />
            </Card>
          </div>

          <Card className="rp-card" style={{ marginTop: 18 }}>
            <div className="rp-card-head">
              <h3>Attendance Today</h3>
              <span className="rp-card-sub">{presentCount} of {scopedAttendance.length} checked in</span>
            </div>
            <Table
              empty="No staff in this scope."
              columns={[
                { key: 'name', header: 'Employee' },
                { key: 'role', header: 'Role' },
                { key: 'checkIn', header: 'Check-in', render: (r) => r.checkIn || '—' },
                { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'Absent' ? 'danger' : r.status === 'Late' ? 'warn' : r.status === 'On Leave' ? 'neutral' : 'success'} dot>{r.status}</Badge> },
              ]}
              rows={attendanceRows}
              keyField="staffId"
            />
          </Card>
        </>
      )}
    </div>
  );
}
