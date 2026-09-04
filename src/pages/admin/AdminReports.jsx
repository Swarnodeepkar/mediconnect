import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Button, SegmentedControl } from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { downloadCsv } from '../../lib/exportCsv.js';
import './AdminPage.css';
import './AdminReports.css';

const CATEGORY_COLORS = ['#1aa8a1', '#2f6fed', '#e9a520', '#e0483f', '#7c5cff', '#0d8f9e'];

export default function AdminReports() {
  const { clinics, clinicId } = useClinic();
  const doctors = useCollection('DOCTORS');
  const appointments = useCollection('APPOINTMENTS');
  const complaints = useCollection('COMPLAINTS');
  const staff = useCollection('STAFF');
  const attendance = useCollection('ATTENDANCE_TODAY');

  const [tab, setTab] = useState('operations');

  const scopedClinics = clinicId === 'all' ? clinics : clinics.filter((c) => c.id === clinicId);
  const scopedAppointments = filterByClinic(appointments, clinicId);
  const scopedComplaints = filterByClinic(complaints, clinicId);
  const scopedStaff = filterByClinic(staff, clinicId);
  const scopedStaffIds = new Set(scopedStaff.map((s) => s.id));
  const scopedAttendance = attendance.filter((a) => scopedStaffIds.has(a.staffId));
  const scopedDoctors = clinicId === 'all' ? doctors : doctors.filter((d) => d.clinicId === clinicId);

  const revenueByClinic = scopedClinics.map((c) => ({
    name: c.code,
    fullName: c.name,
    revenue: appointments.filter((a) => a.clinicId === c.id && (a.status === 'Completed' || a.status === 'In Progress')).reduce((s, a) => s + a.fee, 0),
    color: c.color,
  }));

  const complaintsByCategory = Object.entries(
    scopedComplaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const staffByRole = Object.entries(
    scopedStaff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const doctorLoad = scopedDoctors.map((d) => ({
    name: d.name.replace('Dr. ', ''),
    appointments: scopedAppointments.filter((a) => a.doctorId === d.id).length,
  })).sort((a, b) => b.appointments - a.appointments);

  const attendanceRate = scopedAttendance.length
    ? Math.round((scopedAttendance.filter(a => ['Present', 'Late'].includes(a.status)).length / scopedAttendance.length) * 100)
    : 0;

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
        <div className="rp-grid">
          <Card className="rp-card">
            <h3>Revenue by Clinic</h3>
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
            <h3>Total Revenue Today</h3>
            <div className="rp-big-number">{formatCurrency(revenueByClinic.reduce((s, c) => s + c.revenue, 0))}</div>
            <div className="rp-breakdown">
              {revenueByClinic.map((c) => (
                <div className="rp-breakdown__row" key={c.name}>
                  <span className="rp-breakdown__dot" style={{ background: c.color }} />
                  <span className="rp-breakdown__label">{c.fullName}</span>
                  <span className="rp-breakdown__value">{formatCurrency(c.revenue)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'operations' && (
        <div className="rp-grid">
          <Card className="rp-card">
            <h3>Appointments per Doctor</h3>
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
            <h3>Complaints by Category</h3>
            {complaintsByCategory.length === 0 ? (
              <div className="ov-empty">No complaints in this scope.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={complaintsByCategory} dataKey="value" nameKey="name" cx="50%" cy="46%" startAngle={0} endAngle={360} innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {complaintsByCategory.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      {tab === 'workforce' && (
        <div className="rp-grid">
          <Card className="rp-card">
            <h3>Staff by Role</h3>
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
            <h3>Attendance Rate Today</h3>
            <div className="rp-big-number">{attendanceRate}%</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 6 }}>
              {scopedAttendance.filter(a => ['Present', 'Late'].includes(a.status)).length} of {scopedAttendance.length} employees checked in {clinicId === 'all' ? 'across all clinics' : 'at this clinic'} today.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
