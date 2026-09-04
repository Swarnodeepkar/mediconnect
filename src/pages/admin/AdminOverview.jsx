import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, StatTile, StatusBadge, Avatar, Table } from '../../components/ui.jsx';
import { formatCurrency, formatTime12 } from '../../lib/format.js';
import './AdminOverview.css';

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
  const doctors = useCollection('DOCTORS');
  const revenueTrend = useCollection('REVENUE_TREND');

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

  const openComplaints = scopedComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;

  const chartData = useMemo(() => {
    if (clinicId === 'all') return revenueTrend;
    return revenueTrend.map((d) => ({ day: d.day, [clinicId]: d[clinicId] }));
  }, [revenueTrend, clinicId]);

  const clinicColorFor = (id) => clinics.find((c) => c.id === id)?.color || '#1aa8a1';

  const patientById = (id) => patients.find((p) => p.id === id);
  const doctorById = (id) => doctors.find((d) => d.id === id);
  const clinicById = (id) => clinics.find((c) => c.id === id);

  const upcomingQueue = todaysAppts
    .filter((a) => a.status === 'Waiting' || a.status === 'Scheduled' || a.status === 'In Progress')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 6);

  const recentComplaints = [...scopedComplaints]
    .sort((a, b) => new Date(b.raised) - new Date(a.raised))
    .slice(0, 5);

  const clinicRows = clinics.map((c) => {
    const cAppts = appointments.filter((a) => a.clinicId === c.id && a.date === today);
    const cRevenue = cAppts.filter((a) => a.status === 'Completed' || a.status === 'In Progress').reduce((s, a) => s + a.fee, 0);
    const cStaff = staff.filter((s) => s.clinicId === c.id);
    const cPresent = attendance.filter((a) => cStaff.some((s) => s.id === a.staffId) && (a.status === 'Present' || a.status === 'Late')).length;
    const cComplaints = complaints.filter((cp) => cp.clinicId === c.id && cp.status !== 'Resolved' && cp.status !== 'Closed').length;
    return { ...c, appts: cAppts.length, revenue: cRevenue, present: cPresent, total: cStaff.length, complaints: cComplaints };
  });

  return (
    <div className="ov">
      <div className="ov-head">
        <div>
          <h1>Executive Overview</h1>
          <p className="ov-sub">
            {clinicId === 'all' ? 'All four clinics' : clinicById(clinicId)?.name} &middot; Live snapshot for today
          </p>
        </div>
      </div>

      <div className="ov-stats">
        <StatTile label="Patients Served" value={todaysAppts.filter(a => a.status === 'Completed').length + todaysAppts.filter(a => a.status === 'In Progress').length} delta="▲ 8% vs yesterday" tone="positive" icon="🧑‍🤝‍🧑" />
        <StatTile label="Appointments" value={todaysAppts.length} delta={`${todaysAppts.filter(a => a.status === 'Scheduled' || a.status === 'Waiting').length} pending today`} tone="neutral" icon="📅" />
        <StatTile label="Laboratory Tests" value={scopedLabTests.length} delta={`${scopedLabTests.filter(l => l.status === 'Report Ready').length} reports ready`} tone="positive" icon="🧪" />
        <StatTile label="Revenue Today" value={formatCurrency(revenue)} delta="▲ 12% vs yesterday" tone="positive" icon="₹" />
        <StatTile label="Staff Present" value={`${presentToday} / ${scopedStaff.length}`} delta={`${scopedStaff.length - presentToday} away`} tone="neutral" icon="🪪" />
        <StatTile label="Home Visits" value={scopedVisits.length} delta={`${scopedVisits.filter(v => v.status === 'In Progress' || v.status === 'Assigned').length} active`} tone="neutral" icon="🚑" />
        <StatTile label="Open Complaints" value={openComplaints} delta={openComplaints > 3 ? 'Needs attention' : 'Under control'} tone={openComplaints > 3 ? 'negative' : 'positive'} icon="⚑" />
      </div>

      <div className="ov-grid">
        <Card className="ov-chart-card">
          <div className="ov-card-head">
            <h3>Revenue Trend — This Week</h3>
            <span className="ov-card-sub">{clinicId === 'all' ? 'All clinics combined' : clinicById(clinicId)?.name}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {clinics.map((c) => (
                  <linearGradient id={`grad-${c.id}`} key={c.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12.5, fill: 'var(--ink-500)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={48} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, boxShadow: 'var(--shadow-md)' }}
              />
              {clinicId === 'all' && <Legend wrapperStyle={{ fontSize: 12.5 }} formatter={(v) => clinicById(v)?.code} />}
              {(clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId]).map((id) => (
                <Area
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={id}
                  stroke={clinicColorFor(id)}
                  fill={`url(#grad-${id})`}
                  strokeWidth={2.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="ov-queue-card">
          <div className="ov-card-head">
            <h3>Live Queue</h3>
            <span className="ov-card-sub">{upcomingQueue.length} in progress or waiting</span>
          </div>
          <div className="ov-queue-list">
            {upcomingQueue.length === 0 && <div className="ov-empty">No one waiting right now.</div>}
            {upcomingQueue.map((a) => {
              const p = patientById(a.patientId);
              const d = doctorById(a.doctorId);
              return (
                <div className="ov-queue-item" key={a.id}>
                  <Avatar name={p?.name || '?'} size={32} />
                  <div className="ov-queue-body">
                    <div className="ov-queue-name">{p?.name}</div>
                    <div className="ov-queue-meta">{d?.name} &middot; {formatTime12(a.time)}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              );
            })}
          </div>
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
            <button className="ov-link" onClick={() => navigate('/admin/complaints')}>View all →</button>
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
