import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Users, CalendarDays, FlaskConical, IndianRupee, UserCog, Home,
  CalendarPlus, UserPlus, AlertCircle, HomeIcon, UserCog2, BarChart3,
  Banknote, DoorOpen, BedSingle, KeyRound,
} from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, StatTile, StatusBadge, Table } from '../../components/ui.jsx';
import { formatCurrency } from '../../lib/format.js';
import './AdminOverview.css';

const DONUT_COLORS = ['var(--brand-500)', 'var(--success-500)', 'var(--warn-500)', 'var(--danger-500)', '#7c5cff'];

export default function AdminOverview() {
  const { clinics, clinicId } = useClinic();
  const navigate = useNavigate();

  const patients = useCollection('PATIENTS');
  const appointments = useCollection('APPOINTMENTS');
  const labTests = useCollection('LAB_TESTS');
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');
  const complaints = useCollection('COMPLAINTS');
  const homeVisits = useCollection('HOME_VISITS');
  const revenueTrend = useCollection('REVENUE_TREND');
  const payments = useCollection('PAYMENTS');

  const scopedAppointments = filterByClinic(appointments, clinicId);
  const scopedLabTests = filterByClinic(labTests, clinicId);
  const scopedStaff = filterByClinic(staff, clinicId);
  const scopedComplaints = filterByClinic(complaints, clinicId);
  const scopedVisits = filterByClinic(homeVisits, clinicId);

  const today = '2026-09-04';
  const todaysAppts = scopedAppointments.filter((a) => a.date === today);
  const revenue = todaysAppts
    .filter((a) => a.status === 'Completed' || a.status === 'In Progress')
    .reduce((sum, a) => sum + a.fee, 0);

  const staffIds = new Set(scopedStaff.map((s) => s.id));
  const presentToday = attendance.filter((a) => staffIds.has(a.staffId) && (a.status === 'Present' || a.status === 'Late')).length;
  const absentToday = attendance.filter((a) => staffIds.has(a.staffId) && a.status === 'Absent').length;
  const onLeaveToday = attendance.filter((a) => staffIds.has(a.staffId) && a.status === 'On Leave').length;

  const outstandingAmount = filterByClinic(payments, clinicId).filter((p) => p.status === 'Due').reduce((s, p) => s + p.amount, 0);

  const revenueByClinicData = useMemo(() => {
    return revenueTrend.map((d) => {
      const row = { day: d.day };
      const ids = clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId];
      for (const id of ids) row[id] = d[id];
      return row;
    });
  }, [revenueTrend, clinicId, clinics]);

  const clinicColorFor = (id) => clinics.find((c) => c.id === id)?.color || 'var(--brand-500)';

  const patientById = (id) => patients.find((p) => p.id === id);
  const clinicById = (id) => clinics.find((c) => c.id === id);

  const recentComplaints = [...scopedComplaints]
    .sort((a, b) => new Date(b.raised) - new Date(a.raised))
    .slice(0, 4);

  const clinicRows = clinics.map((c) => {
    const cAppts = appointments.filter((a) => a.clinicId === c.id && a.date === today);
    const cRevenue = cAppts.filter((a) => a.status === 'Completed' || a.status === 'In Progress').reduce((s, a) => s + a.fee, 0);
    const cStaff = staff.filter((s) => s.clinicId === c.id);
    const cPresent = attendance.filter((a) => cStaff.some((s) => s.id === a.staffId) && (a.status === 'Present' || a.status === 'Late')).length;
    const cComplaints = complaints.filter((cp) => cp.clinicId === c.id && cp.status !== 'Resolved' && cp.status !== 'Closed').length;
    return { ...c, appts: cAppts.length, revenue: cRevenue, present: cPresent, total: cStaff.length, complaints: cComplaints };
  });

  const attendanceDonut = [
    { name: 'Present', value: presentToday, color: 'var(--success-500)' },
    { name: 'Absent', value: absentToday, color: 'var(--danger-500)' },
    { name: 'On Leave', value: onLeaveToday, color: 'var(--warn-500)' },
  ].filter((d) => d.value > 0);

  const statusDonut = ['Scheduled', 'Completed', 'Waiting', 'In Progress', 'Cancelled']
    .map((status, i) => ({ name: status, value: todaysAppts.filter((a) => a.status === status).length, color: DONUT_COLORS[i] }))
    .filter((d) => d.value > 0);

  const revenueByClinicDonut = clinicRows.map((c) => ({ name: c.name, value: c.revenue, color: c.color })).filter((d) => d.value > 0);

  return (
    <div className="ov">
      <div className="ov-head">
        <div>
          <h1>Welcome back, Admin!</h1>
          <p className="ov-sub">Here&apos;s what is happening across {clinicId === 'all' ? 'all clinics' : clinicById(clinicId)?.name} today.</p>
        </div>
        <div className="ov-head__actions">
          <button className="ov-head__action" onClick={() => navigate('/admin/appointments')}>
            <CalendarPlus size={16} strokeWidth={2} />
            <span>New Appointment</span>
          </button>
          <button className="ov-head__action" onClick={() => navigate('/admin/patients')}>
            <UserPlus size={16} strokeWidth={2} />
            <span>Add Patient</span>
          </button>
          <button className="ov-head__action" onClick={() => navigate('/admin/complaints')}>
            <AlertCircle size={16} strokeWidth={2} />
            <span>New Complaint</span>
          </button>
          <button className="ov-head__action" onClick={() => navigate('/admin/home-visits')}>
            <HomeIcon size={16} strokeWidth={2} />
            <span>Add Home Visit</span>
          </button>
          <button className="ov-head__action" onClick={() => navigate('/admin/staff')}>
            <UserCog2 size={16} strokeWidth={2} />
            <span>Add Staff</span>
          </button>
          <button className="ov-head__action" onClick={() => navigate('/admin/reports')}>
            <BarChart3 size={16} strokeWidth={2} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="ov-stats">
        <StatTile label="Patients Served" value={todaysAppts.filter(a => a.status === 'Completed').length + todaysAppts.filter(a => a.status === 'In Progress').length} delta="↑ 8% vs yesterday" tone="positive" icon={Users} iconTone="brand" />
        <StatTile label="Appointments" value={todaysAppts.length} delta={`${todaysAppts.filter(a => a.status === 'Scheduled' || a.status === 'Waiting').length} pending today`} tone="neutral" icon={CalendarDays} iconTone="success" />
        <StatTile label="Laboratory Tests" value={scopedLabTests.length} delta={`${scopedLabTests.filter(l => l.status === 'Report Ready').length} reports ready`} tone="positive" icon={FlaskConical} iconTone="purple" />
        <StatTile label="Revenue Today" value={formatCurrency(revenue)} delta="↑ 15% vs yesterday" tone="positive" icon={IndianRupee} iconTone="warn" />
        <StatTile label="Staff Present" value={`${presentToday} / ${scopedStaff.length}`} delta={`${scopedStaff.length - presentToday} away`} tone="neutral" icon={UserCog} iconTone="brand" />
        <StatTile label="Home Visits" value={scopedVisits.length} delta={`${scopedVisits.filter(v => v.status === 'In Progress' || v.status === 'Assigned').length} active`} tone="neutral" icon={Home} iconTone="success" />
        <RoomAvailabilityTile
          value="15,140"
          delta="↑ 500"
          rooms={[
            { icon: BedSingle, label: 'General room', count: 100 },
            { icon: KeyRound, label: 'Private Room', count: 75 },
          ]}
        />
        <StatTile label="Outstanding Amount" value={formatCurrency(outstandingAmount)} delta="↑ 11% vs yesterday" tone="neutral" icon={Banknote} iconTone="purple" />
      </div>

      <Card className="ov-chart-card ov-revenue-card">
        <div className="ov-card-head">
          <h3>Revenue Overview</h3>
          <span className="ov-card-sub">{clinicId === 'all' ? 'All clinics' : clinicById(clinicId)?.name} &middot; This week</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueByClinicData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {(clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId]).map((id) => (
                <linearGradient key={id} id={`ovRevFill-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={clinicColorFor(id)} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={clinicColorFor(id)} stopOpacity={0.04} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12.5, fill: 'var(--ink-500)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={48} />
            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, boxShadow: 'var(--shadow-md)' }} />
            {clinicId === 'all' && <Legend wrapperStyle={{ fontSize: 12.5 }} formatter={(v) => clinicById(v)?.name} />}
            {(clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId]).map((id) => (
              <Area
                key={id}
                type="monotone"
                dataKey={id}
                name={id}
                stroke={clinicColorFor(id)}
                strokeWidth={2.5}
                fill={`url(#ovRevFill-${id})`}
                dot={{ r: 3, fill: clinicColorFor(id), strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="ov-grid ov-grid--donuts">
        <Card className="ov-donut-card">
          <div className="ov-card-head"><h3>Staff Attendance</h3></div>
          <DonutChart data={attendanceDonut} />
          <DonutLegend data={attendanceDonut} total={scopedStaff.length} totalLabel="Total Staff" />
        </Card>
        <Card className="ov-donut-card">
          <div className="ov-card-head"><h3>Appointments by Status</h3></div>
          <DonutChart data={statusDonut} />
          <DonutLegend data={statusDonut} total={todaysAppts.length} totalLabel="Total" />
        </Card>
        <Card className="ov-donut-card">
          <div className="ov-card-head"><h3>Revenue by Clinic</h3></div>
          <DonutChart data={revenueByClinicDonut} formatValue={formatCurrency} />
          <DonutLegend data={revenueByClinicDonut} total={formatCurrency(revenueByClinicDonut.reduce((s, d) => s + d.value, 0))} totalLabel="Total" isCurrency />
        </Card>
      </div>

      <div className="ov-grid ov-grid--bottom">
        <Card className="ov-clinics-card">
          <div className="ov-card-head">
            <h3>Branch Comparison</h3>
            <span className="ov-card-sub">Today</span>
          </div>
          <Table
            columns={[
              { key: 'name', header: 'Clinic', render: (r) => (
                <div className="ov-clinic-cell">
                  <span className="ov-clinic-dot" style={{ background: r.color }} />
                  {r.name}
                </div>
              ) },
              { key: 'appts', header: 'Appts' },
              { key: 'revenue', header: 'Revenue', render: (r) => formatCurrency(r.revenue) },
              { key: 'present', header: 'Staff', render: (r) => `${r.present}/${r.total}` },
              { key: 'complaints', header: 'Open Issues', render: (r) => (
                r.complaints > 0 ? <StatusBadge status="High" /> : <span className="ov-ok">—</span>
              ) },
            ]}
            rows={clinicRows}
            onRowClick={() => navigate('/admin/clinics')}
          />
        </Card>

        <Card className="ov-complaints-card">
          <div className="ov-card-head">
            <h3>Recent Complaints</h3>
            <button className="ov-link" onClick={() => navigate('/admin/complaints')}>View all</button>
          </div>
          <div className="ov-complaint-list">
            {recentComplaints.length === 0 && <div className="ov-empty">No complaints logged.</div>}
            {recentComplaints.map((c) => {
              const p = patientById(c.patientId);
              return (
                <div className="ov-complaint-item" key={c.id}>
                  <div className="ov-complaint-top">
                    <span className="ov-complaint-cat">{c.category}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="ov-complaint-desc">{c.description}</div>
                  <div className="ov-complaint-meta">{p?.name} &middot; {clinicById(c.clinicId)?.code}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RoomAvailabilityTile({ value, delta, rooms }) {
  return (
    <Card className="mc-stat ov-rooms-card">
      <div className="mc-stat__top">
        <span className="mc-stat__icon mc-stat__icon--purple">
          <DoorOpen size={18} strokeWidth={2} />
        </span>
        <span className="mc-stat__label">Room availability</span>
      </div>
      <div className="ov-rooms-card__value-row">
        <span className="mc-stat__value">{value}</span>
        <span className="ov-rooms-card__chip">{delta}</span>
      </div>
      <div className="ov-rooms-card__list">
        {rooms.map(({ icon: Icon, label, count }) => (
          <div className="ov-rooms-card__row" key={label}>
            <span className="ov-rooms-card__row-icon">
              <Icon size={13} strokeWidth={2.2} />
            </span>
            <span className="ov-rooms-card__row-label">{label}</span>
            <span className="ov-rooms-card__row-count">{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DonutChart({ data, formatValue }) {
  if (data.length === 0) return <div className="ov-empty" style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data yet.</div>;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={0}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={(v) => (formatValue ? formatValue(v) : v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DonutLegend({ data, total, totalLabel, isCurrency }) {
  const sum = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="ov-donut-legend">
      {data.map((d) => (
        <div className="ov-donut-legend__row" key={d.name}>
          <span className="ov-donut-legend__dot" style={{ background: d.color }} />
          <span className="ov-donut-legend__label">{d.name}</span>
          <span className="ov-donut-legend__value">{isCurrency ? formatCurrency(d.value) : d.value} {!isCurrency && sum > 0 && `(${Math.round((d.value / sum) * 100)}%)`}</span>
        </div>
      ))}
      <div className="ov-donut-legend__total">
        <span>{totalLabel}</span>
        <span>{total}</span>
      </div>
    </div>
  );
}
