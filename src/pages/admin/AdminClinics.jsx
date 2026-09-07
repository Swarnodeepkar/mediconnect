import { MapPin, CalendarDays, IndianRupee, UserCog, Users2, Building2, Flag } from 'lucide-react';
import { useCollection } from '../../data/store.js';
import { Card, StatusBadge, Avatar } from '../../components/ui.jsx';
import { formatCurrency } from '../../lib/format.js';
import './AdminPage.css';
import './AdminClinics.css';

export default function AdminClinics() {
  const clinics = useCollection('CLINICS');
  const doctors = useCollection('DOCTORS');
  const staff = useCollection('STAFF');
  const appointments = useCollection('APPOINTMENTS');
  const complaints = useCollection('COMPLAINTS');
  const attendance = useCollection('ATTENDANCE_TODAY');
  const patients = useCollection('PATIENTS');

  const today = '2026-09-04';

  const todaysAppts = appointments.filter((a) => a.date === today);
  const totalRevenue = todaysAppts.filter((a) => a.status === 'Completed' || a.status === 'In Progress').reduce((s, a) => s + a.fee, 0);
  const totalPresent = attendance.filter((a) => staff.some((s) => s.id === a.staffId) && (a.status === 'Present' || a.status === 'Late')).length;
  const totalOpenComplaints = complaints.filter((cp) => cp.status !== 'Resolved' && cp.status !== 'Closed').length;

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Clinics</h1>
          <p className="ap-sub">Compare performance and staffing across all four branches.</p>
        </div>
      </div>

      <div className="ac-grid">
        {clinics.map((c) => {
          const cDoctors = doctors.filter((d) => d.clinicId === c.id);
          const cStaff = staff.filter((s) => s.clinicId === c.id);
          const cAppts = appointments.filter((a) => a.clinicId === c.id && a.date === today);
          const cRevenue = cAppts.filter((a) => a.status === 'Completed' || a.status === 'In Progress').reduce((s, a) => s + a.fee, 0);
          const cComplaints = complaints.filter((cp) => cp.clinicId === c.id && cp.status !== 'Resolved' && cp.status !== 'Closed');
          const cPresent = attendance.filter((a) => cStaff.some((s) => s.id === a.staffId) && (a.status === 'Present' || a.status === 'Late')).length;
          const cPatients = patients.filter((p) => p.clinicId === c.id);

          return (
            <Card className="ac-card" key={c.id} style={{ '--ac-accent': c.color }}>
              <div className="ac-card__head">
                <div className="ac-card__id" style={{ background: `${c.color}14`, color: c.color }}>
                  {c.code}
                </div>
                <div className="ac-card__title">
                  <h3>{c.name}</h3>
                  <p><MapPin size={12} strokeWidth={2.2} />{c.address}, {c.city}</p>
                </div>
              </div>

              <div className="ac-metrics">
                <div className="ac-metric">
                  <span className="ac-metric__icon"><CalendarDays size={14} strokeWidth={2.2} /></span>
                  <span className="ac-metric__v">{cAppts.length}</span>
                  <span className="ac-metric__l">Appointments</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__icon"><IndianRupee size={14} strokeWidth={2.2} /></span>
                  <span className="ac-metric__v">{formatCurrency(cRevenue)}</span>
                  <span className="ac-metric__l">Revenue Today</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__icon"><UserCog size={14} strokeWidth={2.2} /></span>
                  <span className="ac-metric__v">{cPresent}/{cStaff.length}</span>
                  <span className="ac-metric__l">Staff Present</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__icon"><Users2 size={14} strokeWidth={2.2} /></span>
                  <span className="ac-metric__v">{cPatients.length}</span>
                  <span className="ac-metric__l">Registered Patients</span>
                </div>
              </div>

              <div className="ac-row">
                <span className="ac-row__label">Doctors ({cDoctors.length})</span>
                <div className="ac-doctors">
                  {cDoctors.map((d) => (
                    <span className="ac-doctor" key={d.id}>
                      <Avatar name={d.name} size={22} />
                      {d.name.replace('Dr. ', '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ac-row ac-row--issues">
                <span className="ac-row__label">Open Issues</span>
                {cComplaints.length === 0 ? (
                  <span className="ac-issue-count ac-issue-count--clear">All clear</span>
                ) : (
                  <div className="ac-issue">
                    <StatusBadge status={cComplaints.some((c) => c.priority === 'High') ? 'High' : cComplaints.some((c) => c.priority === 'Medium') ? 'Medium' : 'Low'} />
                    <span className="ac-issue-count">{cComplaints.length} open</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        <Card className="ac-card ac-card--summary" style={{ '--ac-accent': 'var(--brand-500)' }}>
          <div className="ac-card__head">
            <div className="ac-card__id ac-card__id--summary">
              <Building2 size={18} strokeWidth={2.2} />
            </div>
            <div className="ac-card__title">
              <h3>Combined Total</h3>
              <p>Across all {clinics.length} branches</p>
            </div>
          </div>

          <div className="ac-metrics">
            <div className="ac-metric">
              <span className="ac-metric__icon"><CalendarDays size={14} strokeWidth={2.2} /></span>
              <span className="ac-metric__v">{todaysAppts.length}</span>
              <span className="ac-metric__l">Appointments</span>
            </div>
            <div className="ac-metric">
              <span className="ac-metric__icon"><IndianRupee size={14} strokeWidth={2.2} /></span>
              <span className="ac-metric__v">{formatCurrency(totalRevenue)}</span>
              <span className="ac-metric__l">Revenue Today</span>
            </div>
            <div className="ac-metric">
              <span className="ac-metric__icon"><UserCog size={14} strokeWidth={2.2} /></span>
              <span className="ac-metric__v">{totalPresent}/{staff.length}</span>
              <span className="ac-metric__l">Staff Present</span>
            </div>
            <div className="ac-metric">
              <span className="ac-metric__icon"><Users2 size={14} strokeWidth={2.2} /></span>
              <span className="ac-metric__v">{patients.length}</span>
              <span className="ac-metric__l">Registered Patients</span>
            </div>
          </div>

          <div className="ac-row ac-row--issues">
            <span className="ac-row__label">Open Issues</span>
            {totalOpenComplaints === 0 ? (
              <span className="ac-issue-count ac-issue-count--clear">All clear</span>
            ) : (
              <div className="ac-issue">
                <span className="ac-issue-icon"><Flag size={13} strokeWidth={2.2} /></span>
                <span className="ac-issue-count">{totalOpenComplaints} open across all clinics</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
