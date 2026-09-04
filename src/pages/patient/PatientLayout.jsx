import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, FileText, IndianRupee, User, ChevronLeft, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar } from '../../components/ui.jsx';
import './PatientLayout.css';

const TABS = [
  { to: '/patient', label: 'Home', icon: Home, end: true },
  { to: '/patient/appointments', label: 'Visits', icon: CalendarDays },
  { to: '/patient/records', label: 'Records', icon: FileText },
  { to: '/patient/payments', label: 'Payments', icon: IndianRupee },
  { to: '/patient/profile', label: 'Profile', icon: User },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useCollection('NOTIFICATIONS');
  const unread = notifications.filter((n) => n.patientId === user.patientId && !n.read).length;

  const isHome = location.pathname === '/patient';

  return (
    <div className="pl-page">
      <div className="pl-phone">
        <div className="pl-notch" />
        <div className="pl-screen">
          <header className="pl-topbar">
            {isHome ? (
              <>
                <div className="pl-greet">
                  <div className="pl-greet__hi">Hello, {user.name.split(' ')[0]}</div>
                  <div className="pl-greet__sub">How are you feeling today?</div>
                </div>
                <button className="pl-avatar-btn" onClick={() => navigate('/patient/profile')}>
                  <Avatar name={user.name} size={38} />
                </button>
              </>
            ) : (
              <>
                <button className="pl-back" onClick={() => navigate(-1)}><ChevronLeft size={17} strokeWidth={2.3} /></button>
                <div className="pl-title">{TABS.find((t) => location.pathname.startsWith(t.to) && t.to !== '/patient')?.label || 'CarePlus'}</div>
                <span className="pl-notif-dot">{unread > 0 && <span className="pl-dot" />}</span>
              </>
            )}
          </header>

          <main className="pl-content">
            <Outlet />
          </main>

          <nav className="pl-tabbar">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) => `pl-tab ${isActive ? 'is-active' : ''}`}
              >
                <span className="pl-tab__icon"><t.icon size={19} strokeWidth={2} /></span>
                <span className="pl-tab__label">{t.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <button className="pl-exit" onClick={() => { logout(); navigate('/login'); }}>
        <Power size={13} strokeWidth={2.2} /> Switch role
      </button>
    </div>
  );
}
