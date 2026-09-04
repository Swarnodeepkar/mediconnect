import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Stethoscope, Users, Pill, FlaskConical, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar } from '../../components/ui.jsx';
import './DoctorLayout.css';

const NAV = [
  { to: '/doctor', label: "Today's Queue", icon: Stethoscope, end: true },
  { to: '/doctor/patients', label: 'My Patients', icon: Users },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/doctor/labs', label: 'Lab Requests', icon: FlaskConical },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doctors = useCollection('DOCTORS');
  const appointments = useCollection('APPOINTMENTS');

  const doctor = doctors.find((d) => d.id === user.doctorId);
  const today = '2026-09-04';
  const todaysCount = appointments.filter((a) => a.doctorId === user.doctorId && a.date === today && a.status !== 'Completed' && a.status !== 'Cancelled').length;

  return (
    <div className="dl-shell">
      <aside className="dl-sidebar">
        <div className="dl-brand">
          <span className="dl-brand__mark">
            <Stethoscope size={18} strokeWidth={2.4} />
          </span>
          <div>
            <div className="dl-brand__name">CarePlus</div>
            <div className="dl-brand__tag">Doctor Workspace</div>
          </div>
        </div>

        <nav className="dl-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dl-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <item.icon className="dl-nav__icon" size={17} strokeWidth={2} />
              <span>{item.label}</span>
              {item.label === "Today's Queue" && todaysCount > 0 && <span className="dl-nav__pill">{todaysCount}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="dl-sidebar__footer">
          <div className="dl-user">
            <Avatar name={user.name} size={34} />
            <div className="dl-user__body">
              <div className="dl-user__name">{user.name}</div>
              <div className="dl-user__role">{doctor?.dept}</div>
            </div>
          </div>
          <button className="dl-logout" onClick={() => { logout(); navigate('/login'); }} title="Switch role">
            <Power size={15} strokeWidth={2.2} />
          </button>
        </div>
      </aside>

      <div className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar__clinic">{doctor?.qualification} &middot; {doctor?.experience} yrs experience</div>
          <div className="dl-topbar__right">
            <span className="dl-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>
        <main className="dl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
