import { useNavigate } from 'react-router-dom';
import { CalendarDays, FlaskConical, Pill, IndianRupee, MapPin, Clock, ChevronRight, FileText, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar } from '../../components/ui.jsx';
import { formatDate, formatTime12 } from '../../lib/format.js';
import './PatientHome.css';

const QUICK_ACTIONS = [
  { icon: Stethoscope, label: 'Find Doctors', to: '/patient/find-doctors' },
  { icon: CalendarDays, label: 'Book Visit', to: '/patient/appointments?book=1' },
  { icon: FlaskConical, label: 'Lab Reports', to: '/patient/records?tab=labs' },
  { icon: Pill, label: 'Prescriptions', to: '/patient/records?tab=rx' },
  { icon: IndianRupee, label: 'Pay Bills', to: '/patient/payments' },
];

export default function PatientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const appointments = useCollection('APPOINTMENTS');
  const doctors = useCollection('DOCTORS');
  const clinics = useCollection('CLINICS');
  const notifications = useCollection('NOTIFICATIONS');
  const labTests = useCollection('LAB_TESTS');
  const payments = useCollection('PAYMENTS');

  const myAppointments = appointments.filter((a) => a.patientId === user.patientId);
  const upcoming = myAppointments
    .filter((a) => a.status === 'Scheduled' || a.status === 'Waiting')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  const myNotifications = notifications.filter((n) => n.patientId === user.patientId).slice(0, 3);
  const readyReports = labTests.filter((l) => l.patientId === user.patientId && l.status === 'Report Ready').length;
  const dueBills = payments.filter((p) => p.patientId === user.patientId && p.status === 'Due');

  const doctorById = (id) => doctors.find((d) => d.id === id);
  const clinicById = (id) => clinics.find((c) => c.id === id);

  return (
    <div className="ph">
      <div className="ph-greet">
        <div className="ph-greet__hi">Hello, {user.name.split(' ')[0]}</div>
        <div className="ph-greet__sub">How are you feeling today?</div>
      </div>

      {upcoming ? (
        <div className="ph-appt-card" onClick={() => navigate('/patient/appointments')}>
          <div className="ph-appt-card__label">Upcoming Appointment</div>
          <div className="ph-appt-card__main">
            <Avatar name={doctorById(upcoming.doctorId)?.name} size={44} color="rgba(255,255,255,0.22)" />
            <div>
              <div className="ph-appt-card__doc">{doctorById(upcoming.doctorId)?.name}</div>
              <div className="ph-appt-card__dept">{doctorById(upcoming.doctorId)?.dept}</div>
            </div>
          </div>
          <div className="ph-appt-card__meta">
            <span><MapPin size={13} strokeWidth={2} /> {clinicById(upcoming.clinicId)?.name}</span>
            <span><Clock size={13} strokeWidth={2} /> {formatDate(upcoming.date)}, {formatTime12(upcoming.time)}</span>
          </div>
        </div>
      ) : (
        <div className="ph-appt-card ph-appt-card--empty" onClick={() => navigate('/patient/appointments?book=1')}>
          <div className="ph-appt-card__label">No upcoming appointments</div>
          <div className="ph-appt-card__cta">+ Book your next visit</div>
        </div>
      )}

      <div className="ph-quick-grid">
        {QUICK_ACTIONS.map((a) => (
          <button key={a.label} className="ph-quick" onClick={() => navigate(a.to)}>
            <span className="ph-quick__icon"><a.icon size={19} strokeWidth={2} /></span>
            <span className="ph-quick__label">{a.label}</span>
          </button>
        ))}
      </div>

      {(readyReports > 0 || dueBills.length > 0) && (
        <div className="ph-alerts">
          {readyReports > 0 && (
            <div className="ph-alert ph-alert--info" onClick={() => navigate('/patient/records?tab=labs')}>
              <FlaskConical size={16} strokeWidth={2} />
              <span>{readyReports} lab report{readyReports > 1 ? 's' : ''} ready to view</span>
              <ChevronRight size={15} strokeWidth={2.2} className="ph-alert__arrow" />
            </div>
          )}
          {dueBills.length > 0 && (
            <div className="ph-alert ph-alert--warn" onClick={() => navigate('/patient/payments')}>
              <IndianRupee size={16} strokeWidth={2} />
              <span>{dueBills.length} bill{dueBills.length > 1 ? 's' : ''} pending payment</span>
              <ChevronRight size={15} strokeWidth={2.2} className="ph-alert__arrow" />
            </div>
          )}
        </div>
      )}

      <div className="ph-section-head">
        <h3>Notifications</h3>
        <button onClick={() => navigate('/patient/profile')}>See all</button>
      </div>
      <div className="ph-notif-list">
        {myNotifications.length === 0 && (
          <div className="ph-notif-empty"><FileText size={20} strokeWidth={1.8} /><span>No notifications yet.</span></div>
        )}
        {myNotifications.map((n) => (
          <div key={n.id} className={`ph-notif ${!n.read ? 'is-unread' : ''}`}>
            <div className="ph-notif__title">{n.title}</div>
            <div className="ph-notif__body">{n.body}</div>
            <div className="ph-notif__time">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
