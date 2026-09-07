import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Building2, Users, CalendarDays, Stethoscope, Wallet,
  UserCog, Home, Flag, Banknote, BarChart3, ShieldCheck, ScrollText,
  Bell, Settings, Menu, RefreshCw, ChevronDown, Power, Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ClinicProvider, useClinic } from '../../context/ClinicContext.jsx';
import { Avatar } from '../../components/ui.jsx';
import { useCollection } from '../../data/store.js';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/clinics', label: 'Clinics', icon: Building2 },
  { to: '/admin/patients', label: 'Patients', icon: Users },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/clinical', label: 'Clinical', icon: Stethoscope },
  { to: '/admin/billing', label: 'Billing & Finance', icon: Wallet },
  { to: '/admin/staff', label: 'Workforce', icon: UserCog },
  { to: '/admin/home-visits', label: 'Home Visits', icon: Home },
  { to: '/admin/complaints', label: 'Complaints', icon: Flag },
  { to: '/admin/payroll', label: 'Payroll', icon: Banknote },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/admin/users', label: 'Users & Roles', icon: ShieldCheck },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
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
  const notifications = useCollection('ADMIN_NOTIFICATIONS');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clinicMenuOpen, setClinicMenuOpen] = useState(false);

  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeClinic = clinicId === 'all' ? 'All Clinics' : clinics.find((c) => c.id === clinicId)?.name;

  const today = new Date('2026-09-04');
  const dateLabel = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');

  return (
    <div className="al-shell">
      {mobileOpen && <div className="al-scrim" onClick={() => setMobileOpen(false)} />}
      <aside className={`al-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="al-brand">
          <span className="al-brand__mark">
            <ShieldCheck size={18} strokeWidth={2.4} />
          </span>
          <div>
            <div className="al-brand__name">CarePlus</div>
            <div className="al-brand__tag">One Platform. Four Clinics.</div>
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
              <item.icon className="al-nav__icon" size={17} strokeWidth={2} />
              <span>{item.label}</span>
              {item.label === 'Complaints' && openComplaints > 0 && (
                <span className="al-nav__pill">{openComplaints}</span>
              )}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="al-nav__pill">{unreadCount}</span>
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
            <Power size={15} strokeWidth={2.2} />
          </button>
        </div>
      </aside>

      <div className="al-main">
        <header className="al-topbar">
          <button className="al-hamburger" onClick={() => setMobileOpen((v) => !v)}>
            <Menu size={19} strokeWidth={2.2} />
          </button>

          <div className="al-clinic-select">
            <span className="al-clinic-select__label">Clinic View</span>
            <button className="al-clinic-select__btn" onClick={() => setClinicMenuOpen((v) => !v)}>
              {activeClinic}
              <ChevronDown size={15} strokeWidth={2.2} />
            </button>
            {clinicMenuOpen && (
              <div className="al-clinic-menu" onMouseLeave={() => setClinicMenuOpen(false)}>
                <button
                  className={clinicId === 'all' ? 'is-active' : ''}
                  onClick={() => { setClinicId('all'); setClinicMenuOpen(false); }}
                >
                  All Clinics
                </button>
                {clinics.map((c) => (
                  <button
                    key={c.id}
                    className={clinicId === c.id ? 'is-active' : ''}
                    onClick={() => { setClinicId(c.id); setClinicMenuOpen(false); }}
                  >
                    <span className="al-clinic-menu__dot" style={{ background: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="al-topbar__right">
            <div className="al-date-range">
              <Calendar size={15} strokeWidth={2.1} />
              {dateLabel} – {dateLabel}
            </div>
            <button className="al-icon-btn" title="Refresh">
              <RefreshCw size={16} strokeWidth={2.1} />
            </button>
            <button className="al-icon-btn al-icon-btn--bell" title="Notifications" onClick={() => navigate('/admin/notifications')}>
              <Bell size={17} strokeWidth={2.1} />
              {unreadCount > 0 && <span className="al-icon-btn__badge">{unreadCount}</span>}
            </button>
            <button className="al-profile" onClick={() => navigate('/admin/settings')}>
              <Avatar name={user.name} size={34} />
              <div className="al-profile__body">
                <div className="al-profile__name">{user.name}</div>
                <div className="al-profile__role">{user.title}</div>
              </div>
            </button>
          </div>
        </header>

        <main className="al-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
