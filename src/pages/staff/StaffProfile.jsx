import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Avatar, Modal, Badge } from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import '../patient/PatientProfile.css';
import './StaffProfile.css';

const MENU = [
  { icon: '💰', label: 'Payslips & Salary' },
  { icon: '📆', label: 'Attendance History' },
  { icon: '🏥', label: 'Branch Assignment' },
  { icon: '❓', label: 'Help & Support' },
];

export default function StaffProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const staff = useCollection('STAFF');
  const clinics = useCollection('CLINICS');
  const payslips = useCollection('PAYSLIPS');

  const [openSheet, setOpenSheet] = useState(null);

  const record = staff.find((s) => s.id === user.staffId);
  const clinic = clinics.find((c) => c.id === user.clinicId);
  const myPayslips = payslips.filter((p) => p.staffId === user.staffId).sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));

  return (
    <div className="pf">
      <div className="pf-card">
        <Avatar name={user.name} size={64} />
        <div className="pf-card__name">{user.name}</div>
        <div className="pf-card__meta">{record?.role} &middot; {record?.phone}</div>
        <div className="pf-card__meta">Joined {formatDate(record?.joined)}</div>
        <Badge tone="neutral">{clinic?.name}</Badge>
      </div>

      <div className="pf-menu">
        {MENU.map((m) => (
          <button key={m.label} className="pf-menu__item" onClick={() => setOpenSheet(m.label)}>
            <span className="pf-menu__icon">{m.icon}</span>
            <span className="pf-menu__label">{m.label}</span>
            <span className="pf-menu__arrow">›</span>
          </button>
        ))}
      </div>

      <button className="pf-logout" onClick={() => { logout(); navigate('/login'); }}>Switch Role / Logout</button>

      <Modal open={openSheet === 'Payslips & Salary'} onClose={() => setOpenSheet(null)} title="Payslips" width={420}>
        <div className="sp-payslip-list">
          {myPayslips.map((p) => (
            <div className="sp-payslip" key={p.id}>
              <div className="sp-payslip__top">
                <span className="sp-payslip__month">{p.month}</span>
                <Badge tone="success">{p.status}</Badge>
              </div>
              <div className="sp-payslip__net">{formatCurrency(p.netPay)}</div>
              <div className="sp-payslip__breakdown">
                <span>Basic {formatCurrency(p.basic)}</span>
                <span>OT {formatCurrency(p.overtime)}</span>
                <span>Incentives {formatCurrency(p.incentives)}</span>
                <span>Deductions -{formatCurrency(p.deductions)}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={openSheet === 'Attendance History'} onClose={() => setOpenSheet(null)} title="Attendance History" width={400}>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          A full calendar view of check-ins, check-outs, late arrivals, and leave days would appear here, pulled from GPS-verified attendance logs.
        </p>
      </Modal>

      <Modal open={openSheet === 'Branch Assignment'} onClose={() => setOpenSheet(null)} title="Branch Assignment" width={400}>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Currently assigned to <strong>{clinic?.name}</strong>. Branch transfer requests require HR and admin approval.
        </p>
      </Modal>

      <Modal open={openSheet === 'Help & Support'} onClose={() => setOpenSheet(null)} title="Help & Support" width={400}>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Reach HR or your branch admin directly, or browse the staff handbook and FAQs here.
        </p>
      </Modal>
    </div>
  );
}
