import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, CheckSquare, Truck, Palmtree, User, ShieldCheck, Bell, Power, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar } from '../../components/ui.jsx';
import '../patient/PatientLayout.css';

const NAV = [
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingTasks = tasks.filter((t) => t.staffId === user.staffId && t.status !== 'Completed').length;

  const activeLabel = [...NAV].reverse().find((t) => location.pathname === t.to || (!t.end && location.pathname.startsWith(t.to)))?.label || 'CarePlus';

  return (
    <div className="pw-shell">
      {mobileOpen && <div className="pw-scrim" onClick={() => setMobileOpen(false)} />}
      <aside className={`pw-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="pw-brand">
          <span className="pw-brand__mark"><ShieldCheck size={18} strokeWidth={2.4} /></span>
          <div>
            <div className="pw-brand__name">CarePlus</div>
            <div className="pw-brand__tag">Staff Workspace</div>
          </div>
        </div>

        <nav className="pw-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `pw-nav__item ${isActive ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="pw-nav__icon" size={17} strokeWidth={2} />
              <span>{item.label}</span>
              {item.to === '/staff/tasks' && pendingTasks > 0 && (
                <span className="pw-icon-btn__badge" style={{ position: 'static', marginLeft: 'auto', border: 'none' }}>{pendingTasks}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="pw-sidebar__footer">
          <div className="pw-user">
            <Avatar name={user.name} size={34} />
            <div className="pw-user__body">
              <div className="pw-user__name">{user.name}</div>
              <div className="pw-user__role">{user.title} &middot; On duty</div>
            </div>
          </div>
          <button className="pw-logout" onClick={() => { logout(); navigate('/login'); }} title="Switch role">
            <Power size={15} strokeWidth={2.2} />
          </button>
        </div>
      </aside>

      <div className="pw-main">
        <header className="pw-topbar">
          <button className="pw-hamburger" onClick={() => setMobileOpen((v) => !v)}>
            <Menu size={19} strokeWidth={2.2} />
          </button>
          <div className="pw-title">{activeLabel}</div>
          <div className="pw-topbar__right">
            <button className="pw-icon-btn" title="Tasks" onClick={() => navigate('/staff/tasks')}>
              <Bell size={17} strokeWidth={2.1} />
              {pendingTasks > 0 && <span className="pw-icon-btn__badge">{pendingTasks}</span>}
            </button>
            <button className="pw-profile" onClick={() => navigate('/staff/profile')}>
              <Avatar name={user.name} size={32} />
            </button>
          </div>
        </header>

        <main className="pw-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
