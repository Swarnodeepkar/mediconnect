import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ClinicProvider, useClinic } from '../../context/ClinicContext.jsx';
import { Avatar } from '../../components/ui.jsx';
import { useCollection } from '../../data/store.js';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: 'Overview', icon: '⌂', end: true },
  { to: '/admin/clinics', label: 'Clinics', icon: '🏥' },
  { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { to: '/admin/patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
  { to: '/admin/staff', label: 'Staff & Attendance', icon: '🪪' },
  { to: '/admin/home-visits', label: 'Home Visits', icon: '🚑' },
  { to: '/admin/complaints', label: 'Complaints', icon: '⚑' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
];

export default function AdminLayout() {
  return (
    <ClinicProvider>
      <AdminShell />
    </ClinicProvider>
  );
}

function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { clinics, clinicId, setClinicId } = useClinic();
  const complaints = useCollection('COMPLAINTS');
  const [mobileOpen, setMobileOpen] = useState(false);

  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="al-shell">
      <aside className={`al-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="al-brand">
          <span className="al-brand__mark">MC</span>
          <div>
            <div className="al-brand__name">MediConnect</div>
            <div className="al-brand__tag">Admin Console</div>
          </div>
        </div>

        <nav className="al-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `al-nav__item ${isActive ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="al-nav__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Complaints' && openComplaints > 0 && (
                <span className="al-nav__pill">{openComplaints}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="al-sidebar__footer">
          <div className="al-user">
            <Avatar name={user.name} size={34} />
            <div className="al-user__body">
              <div className="al-user__name">{user.name}</div>
              <div className="al-user__role">{user.title}</div>
            </div>
          </div>
          <button
            className="al-logout"
            onClick={() => { logout(); navigate('/login'); }}
            title="Switch role"
          >
            ⏻
          </button>
        </div>
      </aside>

      <div className="al-main">
        <header className="al-topbar">
          <button className="al-hamburger" onClick={() => setMobileOpen((v) => !v)}>☰</button>
          <div className="al-clinic-switch">
            <button
              className={`al-clinic-chip ${clinicId === 'all' ? 'is-active' : ''}`}
              onClick={() => setClinicId('all')}
            >
              All Clinics
            </button>
            {clinics.map((c) => (
              <button
                key={c.id}
                className={`al-clinic-chip ${clinicId === c.id ? 'is-active' : ''}`}
                onClick={() => setClinicId(c.id)}
                style={clinicId === c.id ? { borderColor: c.color, color: c.color, background: `${c.color}14` } : undefined}
              >
                {c.code}
              </button>
            ))}
          </div>
          <div className="al-topbar__right">
            <span className="al-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <main className="al-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
