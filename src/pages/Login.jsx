import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/ui.jsx';
import './Login.css';

const ROLES = [
  {
    role: 'admin',
    userId: 'u_admin',
    title: 'Super Admin',
    desc: 'Central command center for all four clinics — operations, finance, workforce, analytics.',
    icon: '🏥',
    path: '/admin',
  },
  {
    role: 'doctor',
    userId: 'u_doctor',
    title: 'Doctor',
    desc: 'Appointments, patient history, prescriptions, and clinical reports.',
    icon: '🩺',
    path: '/doctor',
  },
  {
    role: 'staff',
    userId: 'u_staff',
    title: 'Staff',
    desc: 'Attendance, leave, tasks, and home visit coordination.',
    icon: '🧑‍⚕️',
    path: '/staff',
  },
  {
    role: 'patient',
    userId: 'u_patient',
    title: 'Patient',
    desc: 'Book appointments, view reports, pay bills, and track visits.',
    icon: '📱',
    path: '/patient',
  },
];

export default function Login() {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('admin');

  function handleEnter() {
    const cfg = ROLES.find((r) => r.role === selected);
    login(cfg.userId);
    navigate(cfg.path);
  }

  return (
    <div className="lg-wrap">
      <div className="lg-panel">
        <div className="lg-brand">
          <span className="lg-brand__mark">MC</span>
          <div>
            <div className="lg-brand__name">MediConnect</div>
            <div className="lg-brand__tag">One platform. Four clinics.</div>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p className="lg-sub">Choose how you'd like to explore the platform.</p>

        <div className="lg-roles">
          {ROLES.map((r) => {
            const user = users.find((u) => u.id === r.userId);
            const active = selected === r.role;
            return (
              <button
                key={r.role}
                className={`lg-role ${active ? 'is-active' : ''}`}
                onClick={() => setSelected(r.role)}
              >
                <span className="lg-role__icon">{r.icon}</span>
                <span className="lg-role__body">
                  <span className="lg-role__title">{r.title}</span>
                  <span className="lg-role__desc">{r.desc}</span>
                </span>
                {user && (
                  <span className="lg-role__user">
                    <Avatar name={user.name} size={26} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button className="lg-enter" onClick={handleEnter}>
          Continue as {ROLES.find((r) => r.role === selected)?.title}
          <span className="lg-enter__arrow">→</span>
        </button>

        <p className="lg-note">Prototype build — sample data only, no real patient information.</p>
      </div>

      <div className="lg-showcase">
        <div className="lg-showcase__glow" />
        <div className="lg-showcase__card lg-card-1">
          <div className="lg-card__label">Live across clinics</div>
          <div className="lg-card__value">186</div>
          <div className="lg-card__sub">Patients served today</div>
        </div>
        <div className="lg-showcase__card lg-card-2">
          <div className="lg-card__label">Today's revenue</div>
          <div className="lg-card__value">₹1,84,500</div>
          <div className="lg-card__sub">▲ 12% vs yesterday</div>
        </div>
        <div className="lg-showcase__card lg-card-3">
          <div className="lg-card__label">Staff present</div>
          <div className="lg-card__value">38 / 42</div>
          <div className="lg-card__sub">Across 4 branches</div>
        </div>
        <div className="lg-showcase__quote">
          <p>"Four clinics. One system. Better care."</p>
        </div>
      </div>
    </div>
  );
}
