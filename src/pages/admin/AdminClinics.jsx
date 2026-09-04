import { useCollection } from '../../data/store.js';
import { Card, StatusBadge } from '../../components/ui.jsx';
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
            <Card className="ac-card" key={c.id}>
              <div className="ac-card__head" style={{ borderTopColor: c.color }}>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.address}, {c.city}</p>
                </div>
                <span className="ac-code" style={{ background: `${c.color}18`, color: c.color }}>{c.code}</span>
              </div>

              <div className="ac-metrics">
                <div className="ac-metric">
                  <span className="ac-metric__v">{cAppts.length}</span>
                  <span className="ac-metric__l">Appointments</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__v">{formatCurrency(cRevenue)}</span>
                  <span className="ac-metric__l">Revenue Today</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__v">{cPresent}/{cStaff.length}</span>
                  <span className="ac-metric__l">Staff Present</span>
                </div>
                <div className="ac-metric">
                  <span className="ac-metric__v">{cPatients.length}</span>
                  <span className="ac-metric__l">Registered Patients</span>
                </div>
              </div>

              <div className="ac-row">
                <span className="ac-row__label">Doctors ({cDoctors.length})</span>
                <div className="ac-tags">
                  {cDoctors.map((d) => (
                    <span className="ac-tag" key={d.id}>{d.name.replace('Dr. ', '')}</span>
                  ))}
                </div>
              </div>

              <div className="ac-row">
                <span className="ac-row__label">Open Issues</span>
                {cComplaints.length === 0 ? (
                  <span className="ac-issue-count">None open</span>
                ) : (
                  <>
                    <StatusBadge status={cComplaints.some((c) => c.priority === 'High') ? 'High' : cComplaints.some((c) => c.priority === 'Medium') ? 'Medium' : 'Low'} />
                    <span className="ac-issue-count">{cComplaints.length} open</span>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
