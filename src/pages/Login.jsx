import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight,
  Building2, Users, BarChart3, Lock, User, KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Select } from '../components/ui.jsx';
import './Login.css';

const FEATURES = [
  { icon: Building2, title: 'Four branches, one view', desc: 'Compare and manage every clinic from a single dashboard.' },
  { icon: Users, title: 'Every role, one platform', desc: 'Admins, doctors, staff, and patients all stay connected.' },
  { icon: BarChart3, title: 'Live operational insight', desc: 'Revenue, attendance, and appointments update in real time.' },
  { icon: Lock, title: 'Role-based access', desc: 'Everyone sees exactly what they need, and nothing more.' },
];

const ROLES = [
  { role: 'admin', userId: 'u_admin', title: 'Super Admin', path: '/admin' },
  { role: 'doctor', userId: 'u_doctor', title: 'Doctor', path: '/doctor' },
  { role: 'staff', userId: 'u_staff', title: 'Staff', path: '/staff' },
  { role: 'patient', userId: 'u_patient', title: 'Patient', path: '/patient' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  function handleSubmit(e) {
    e.preventDefault();
    const cfg = ROLES.find((r) => r.role === role);
    login(cfg.userId);
    navigate(cfg.path);
  }

  return (
    <div className="lg-wrap">
      <div className="lg-panel">
        <div className="lg-brand">
          <span className="lg-brand__mark">
            <ShieldCheck size={18} strokeWidth={2.4} />
          </span>
          <div>
            <div className="lg-brand__name">CarePlus</div>
            <div className="lg-brand__tag">One platform. Four clinics.</div>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p className="lg-sub">Sign in to continue to the platform.</p>

        <form className="lg-form" onSubmit={handleSubmit}>
          <label className="lg-field">
            <span className="lg-field__label">Username</span>
            <span className="lg-field__control">
              <User size={16} strokeWidth={2} className="lg-field__icon" />
              <input
                type="text"
                placeholder="e.g. ritu.sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </span>
          </label>

          <label className="lg-field">
            <span className="lg-field__label">Password</span>
            <span className="lg-field__control">
              <KeyRound size={16} strokeWidth={2} className="lg-field__icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </span>
          </label>

          <label className="lg-field">
            <span className="lg-field__label">Login as</span>
            <Select className="lg-role-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r.role} value={r.role}>{r.title}</option>)}
            </Select>
          </label>

          <button type="submit" className="lg-enter">
            Log In
            <ArrowRight size={16} strokeWidth={2.2} className="lg-enter__arrow" />
          </button>
        </form>
      </div>

      <div className="lg-showcase">
        <div className="lg-showcase__glow" />
        <div className="lg-showcase__inner">
          <div className="lg-showcase__content">
            <span className="lg-showcase__mark">
              <ShieldCheck size={30} strokeWidth={2} />
            </span>
            <h2 className="lg-showcase__title">CarePlus</h2>
            <p className="lg-showcase__quote">"Four clinics. One system. Better care."</p>
            <p className="lg-showcase__summary">
              A unified digital ecosystem connecting clinic management, staff operations,
              doctors, and patients across every branch — giving management complete
              visibility, empowering staff with better tools, and delivering a modern
              patient experience.
            </p>
          </div>

          <div className="lg-features">
            {FEATURES.map((f) => (
              <div className="lg-feature" key={f.title}>
                <span className="lg-feature__icon"><f.icon size={17} strokeWidth={2} /></span>
                <div>
                  <div className="lg-feature__title">{f.title}</div>
                  <div className="lg-feature__desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
