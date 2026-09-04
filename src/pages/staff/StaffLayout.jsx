import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Truck, Palmtree, User, ChevronLeft, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar } from '../../components/ui.jsx';
import '../patient/PatientLayout.css';

const TABS = [
  { to: '/staff', label: 'Home', icon: Home, end: true },
  { to: '/staff/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/staff/visits', label: 'Visits', icon: Truck },
  { to: '/staff/leave', label: 'Leave', icon: Palmtree },
  { to: '/staff/profile', label: 'Profile', icon: User },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tasks = useCollection('TASKS');
  const pendingTasks = tasks.filter((t) => t.staffId === user.staffId && t.status !== 'Completed').length;

  const isHome = location.pathname === '/staff';

  return (
    <div className="pl-page">
      <div className="pl-phone">
        <div className="pl-notch" />
        <div className="pl-screen">
          <header className="pl-topbar">
            {isHome ? (
              <>
                <div className="pl-greet">
                  <div className="pl-greet__hi">Hi, {user.name.split(' ')[0]}</div>
                  <div className="pl-greet__sub">{user.title} &middot; On duty</div>
                </div>
                <button className="pl-avatar-btn" onClick={() => navigate('/staff/profile')}>
                  <Avatar name={user.name} size={38} />
                </button>
              </>
            ) : (
              <>
                <button className="pl-back" onClick={() => navigate(-1)}><ChevronLeft size={17} strokeWidth={2.3} /></button>
                <div className="pl-title">{TABS.find((t) => location.pathname.startsWith(t.to) && t.to !== '/staff')?.label || 'CarePlus'}</div>
                <span className="pl-notif-dot">{pendingTasks > 0 && <span className="pl-dot" />}</span>
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
